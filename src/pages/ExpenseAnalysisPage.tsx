import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { useRegisterPageRefresh } from '@/hooks/useRegisterPageRefresh'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import { readPageCache, writePageCache } from '@/lib/devicePageCache'
import { localizeCurrency } from '@/lib/currency'
import {
  addBusinessDays,
  businessDaySpan,
  gregorianYmdToJalali,
  jalaliMonthBounds,
  jalaliMonthName,
  shiftJalaliMonth,
  todayLocalYmd,
} from '@/lib/datetime'
import { fetchExpenseAnalysisData, type ExpenseAnalysisRow, type ExpenseDailyPoint } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

type Window = {
  fetchStart: string
  fetchEnd: string
  selectedStart: string
  selectedEnd: string
  previousStart: string
  previousEnd: string
  months: Array<{ year: number; month: number; start: string; end: string }>
}

function sumCurrency(rows: ExpenseDailyPoint[], currency: string, start: string, end: string): number {
  return rows.reduce((total, row) => {
    if (row.currency !== currency || row.date < start || row.date >= end) return total
    return total + Number(row.amount || 0)
  }, 0)
}

function money(amount: number): string {
  return Number(amount || 0).toLocaleString('en-US')
}

export function ExpenseAnalysisPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const today = gregorianYmdToJalali(todayLocalYmd())
  const [year, setYear] = useState(today?.year ?? 1400)
  const [month, setMonth] = useState(today?.month ?? 1)
  const [custom, setCustom] = useState(false)
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [rows, setRows] = useState<ExpenseAnalysisRow[]>([])
  const [daily, setDaily] = useState<ExpenseDailyPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const forceRef = useRef(false)

  const rangeError = custom && from && to && from > to

  const period = useMemo<Window | null>(() => {
    if (!custom) {
      const selected = jalaliMonthBounds(year, month)
      const previousParts = shiftJalaliMonth(year, month, -1)
      const previous = jalaliMonthBounds(previousParts.year, previousParts.month)
      const chartStart = shiftJalaliMonth(year, month, -5)
      const months = Array.from({ length: 6 }, (_, index) => {
        const parts = shiftJalaliMonth(chartStart.year, chartStart.month, index)
        const bounds = jalaliMonthBounds(parts.year, parts.month)
        return { year: parts.year, month: parts.month, start: bounds.start, end: bounds.endExclusive }
      })
      return {
        fetchStart: months[0]?.start ?? selected.start,
        fetchEnd: selected.endExclusive,
        selectedStart: selected.start,
        selectedEnd: selected.endExclusive,
        previousStart: previous.start,
        previousEnd: previous.endExclusive,
        months,
      }
    }
    if (!from || !to || from > to) return null
    const selectedEnd = addBusinessDays(to, 1)
    const span = businessDaySpan(from, selectedEnd)
    const previousStart = addBusinessDays(from, -span)
    const touched: Window['months'] = []
    let cursor = gregorianYmdToJalali(from)
    const endParts = gregorianYmdToJalali(to)
    if (cursor && endParts) {
      let guard = 0
      while (guard < 36) {
        const bounds = jalaliMonthBounds(cursor.year, cursor.month)
        touched.push({ year: cursor.year, month: cursor.month, start: bounds.start, end: bounds.endExclusive })
        if (cursor.year === endParts.year && cursor.month === endParts.month) break
        const next = shiftJalaliMonth(cursor.year, cursor.month, 1)
        cursor = { year: next.year, month: next.month, day: 1 }
        guard += 1
      }
    }
    return {
      fetchStart: previousStart,
      fetchEnd: selectedEnd,
      selectedStart: from,
      selectedEnd,
      previousStart,
      previousEnd: from,
      months: touched,
    }
  }, [custom, year, month, from, to])

  useEffect(() => {
    if (!token || !period) return
    const cacheKey = `analysis-${period.fetchStart}-${period.fetchEnd}`
    const force = forceRef.current
    forceRef.current = false
    if (!force) {
      const hit = readPageCache<{ accounts: ExpenseAnalysisRow[]; daily: ExpenseDailyPoint[] }>(userKey, cacheKey)
      if (hit) {
        setRows(hit.accounts)
        setDaily(hit.daily)
        setLoading(false)
        return
      }
    }
    let active = true
    if (force) setRefreshing(true)
    else setLoading(true)
    setError(null)
    void fetchExpenseAnalysisData(token, {
      start_date: period.fetchStart,
      end_date: period.fetchEnd,
    })
      .then((data) => {
        if (!active) return
        const next = { accounts: data.accounts, daily: data.daily ?? [] }
        setRows(next.accounts)
        setDaily(next.daily)
        writePageCache(userKey, cacheKey, next)
      })
      .catch((err) => {
        if (!active) return
        setError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (!active) return
        setLoading(false)
        setRefreshing(false)
      })
    return () => {
      active = false
    }
  }, [token, period, userKey, reloadKey])

  const refreshPage = useCallback(() => {
    forceRef.current = true
    setReloadKey((value) => value + 1)
  }, [])
  useRegisterPageRefresh(refreshPage, refreshing)

  const focusCurrency = useMemo(() => {
    if (!period) return 'AFN'
    const totals = new Map<string, number>()
    daily.forEach((row) => {
      if (row.date < period.selectedStart || row.date >= period.selectedEnd) return
      totals.set(row.currency, (totals.get(row.currency) || 0) + Number(row.amount || 0))
    })
    let best = 'AFN'
    let bestAmount = -1
    totals.forEach((amount, currency) => {
      if (amount > bestAmount) {
        best = currency
        bestAmount = amount
      }
    })
    return bestAmount > 0 ? best : 'AFN'
  }, [daily, period])

  const currentTotal = period ? sumCurrency(daily, focusCurrency, period.selectedStart, period.selectedEnd) : 0
  const previousTotal = period ? sumCurrency(daily, focusCurrency, period.previousStart, period.previousEnd) : 0
  const difference = currentTotal - previousTotal
  const percent = previousTotal > 0 ? (difference / previousTotal) * 100 : null

  const categories = useMemo(() => {
    if (!period) return []
    const current = new Map<number, number>()
    const previous = new Map<number, number>()
    daily.forEach((row) => {
      if (row.currency !== focusCurrency) return
      const id = row.user_expense_account_id
      if (row.date >= period.selectedStart && row.date < period.selectedEnd) {
        current.set(id, (current.get(id) || 0) + Number(row.amount || 0))
      } else if (row.date >= period.previousStart && row.date < period.previousEnd) {
        previous.set(id, (previous.get(id) || 0) + Number(row.amount || 0))
      }
    })
    return rows
      .map((row) => ({
        id: row.id,
        title: row.title || row.code || '—',
        amount: current.get(row.id) || 0,
        previous: previous.get(row.id) || 0,
      }))
      .sort((a, b) => b.amount - a.amount || a.title.localeCompare(b.title))
  }, [daily, rows, period, focusCurrency])

  const topCategory = categories.find((item) => item.amount > 0)
  const monthBars = (period?.months ?? []).map((item) => ({
    label: jalaliMonthName(item.month, locale),
    value: sumCurrency(daily, focusCurrency, item.start, item.end),
    active: item.year === year && item.month === month && !custom,
  }))
  const dayBars = useMemo(() => {
    if (!period) return []
    const items: Array<{ label: string; value: number }> = []
    let cursor = period.selectedStart
    let guard = 0
    while (cursor < period.selectedEnd && guard < 400) {
      const parts = gregorianYmdToJalali(cursor)
      const next = addBusinessDays(cursor, 1)
      items.push({
        label: parts ? String(parts.day) : cursor.slice(8),
        value: sumCurrency(daily, focusCurrency, cursor, next),
      })
      cursor = next
      guard += 1
    }
    return items
  }, [period, daily, focusCurrency])

  const periodLabel = custom
    ? `${from && gregorianYmdToJalali(from) ? formatParts(gregorianYmdToJalali(from)!, locale) : '—'} – ${
        to && gregorianYmdToJalali(to) ? formatParts(gregorianYmdToJalali(to)!, locale) : '—'
      }`
    : `${jalaliMonthName(month, locale)} ${year}`

  const goMonth = (delta: number) => {
    const next = shiftJalaliMonth(year, month, delta)
    setYear(next.year)
    setMonth(next.month)
    setCustom(false)
  }

  const slices = categories.filter((item) => item.amount > 0)

  return (
    <div className="user-accounts-page ea-page hy-ledger hy-analysis">
      <div className="hy-ledger__head">
        <div>
          <span className="hy-ledger__eyebrow">{t('desktop.hy_finances')}</span>
          <h2>{t('desktop.expense_analysis')}</h2>
          <p>{t('desktop.ea_period', { period: periodLabel })}</p>
        </div>
        <div className="ea-nav">
          <button type="button" onClick={() => goMonth(-1)} aria-label={t('desktop.ea_prev_month')}>
            <i className={`fa-solid ${locale === 'en' ? 'fa-angle-left' : 'fa-angle-right'}`} aria-hidden="true" />
          </button>
          <strong>{periodLabel}</strong>
          <button type="button" onClick={() => goMonth(1)} aria-label={t('desktop.ea_next_month')}>
            <i className={`fa-solid ${locale === 'en' ? 'fa-angle-right' : 'fa-angle-left'}`} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="hy-analysis__controls">
      <div className="ea-filters" role="group" aria-label={t('desktop.hy_analysis_period')}>
        <button type="button" aria-pressed={!custom && isCurrent(year, month, today)} className={!custom && isCurrent(year, month, today) ? 'is-on' : ''} onClick={() => {
          if (!today) return
          setYear(today.year)
          setMonth(today.month)
          setCustom(false)
        }}>
          {t('desktop.ea_this_month')}
        </button>
        <button type="button" aria-pressed={!custom && isPrevious(year, month, today)} className={!custom && isPrevious(year, month, today) ? 'is-on' : ''} onClick={() => {
          if (!today) return
          const prev = shiftJalaliMonth(today.year, today.month, -1)
          setYear(prev.year)
          setMonth(prev.month)
          setCustom(false)
        }}>
          {t('desktop.ea_prev_month')}
        </button>
        <button
          type="button"
          className={custom ? 'is-on' : ''}
          aria-pressed={custom}
          onClick={() => {
            if (!custom && period) {
              setFrom(period.selectedStart)
              setTo(addBusinessDays(period.selectedEnd, -1))
            }
            setCustom(true)
          }}
        >
          {t('desktop.ea_custom')}
        </button>
      </div>

      {custom ? (
        <div className="ea-range">
          <label htmlFor="analysis-from">
            {t('desktop.ea_from')}
            <JalaliDatePicker id="analysis-from" value={from} onChange={setFrom} />
          </label>
          <label htmlFor="analysis-to">
            {t('desktop.ea_to')}
            <JalaliDatePicker id="analysis-to" value={to} onChange={setTo} />
          </label>
        </div>
      ) : null}
      <span className="hy-analysis__currency"><i className="fa-solid fa-coins" aria-hidden="true" />{localizeCurrency(focusCurrency, t)}</span>
      </div>
      {rangeError ? <div className="alert-error" role="alert">{t('desktop.ea_range_invalid')}</div> : null}
      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <div className="hy-ledger__empty" role="status"><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /><p>{t('desktop.loading')}</p></div>
      ) : !period ? <div className="hy-ledger__empty"><i className="fa-regular fa-calendar" aria-hidden="true" /><p>{t('desktop.hy_analysis_choose_dates')}</p></div> : (
        <>
          <div className="ea-cards">
            <article>
              <span>{t('desktop.ea_total')}</span>
              <strong><bdi>{money(currentTotal)}</bdi> <small>{localizeCurrency(focusCurrency, t)}</small></strong>
            </article>
            <article>
              <span>{t('desktop.ea_previous')}</span>
              <strong><bdi>{money(previousTotal)}</bdi> <small>{localizeCurrency(focusCurrency, t)}</small></strong>
            </article>
            <article>
              <span>{t('desktop.ea_diff')}</span>
              <strong className={difference > 0 ? 'is-up' : difference < 0 ? 'is-down' : ''}>
                <bdi>{money(Math.abs(difference))}</bdi> <small>{localizeCurrency(focusCurrency, t)}</small>
              </strong>
              <small>
                {difference > 0 ? t('desktop.ea_increase') : difference < 0 ? t('desktop.ea_decrease') : t('desktop.ea_same')}
              </small>
            </article>
            <article>
              <span>{t('desktop.ea_change')}</span>
              <strong><bdi>{percent == null ? '—' : `${percent > 0 ? '+' : ''}${percent.toFixed(1)}%`}</bdi></strong>
              <small>{percent == null ? t('desktop.ea_no_baseline') : t('desktop.ea_vs_previous')}</small>
            </article>
            <article>
              <span>{t('desktop.ea_top_category')}</span>
              <strong>{topCategory ? topCategory.title : '—'}</strong>
              <small>{topCategory ? `${money(topCategory.amount)} ${localizeCurrency(focusCurrency, t)}` : t('desktop.ea_empty')}</small>
            </article>
          </div>

          <div className="ea-panels">
          <section className="ea-panel">
            <h3>{t('desktop.ea_months')}</h3>
            <BarChart items={monthBars} empty={t('desktop.ea_empty')} />
          </section>

          <section className="ea-panel">
            <h3>{t('desktop.ea_daily')}</h3>
            <BarChart items={dayBars} empty={t('desktop.ea_empty')} scroll />
          </section>

          <section className="ea-panel">
            <h3>{t('desktop.ea_categories')}</h3>
            {slices.length === 0 ? (
              <p className="muted">{t('desktop.ea_empty')}</p>
            ) : (
              <Donut items={slices} total={currentTotal} />
            )}
            <div className="ea-cats">
              {categories.map((item) => {
                const share = currentTotal > 0 ? (item.amount / currentTotal) * 100 : 0
                const delta = item.amount - item.previous
                return (
                  <div key={item.id} className="ea-cat">
                    <div className="ea-cat__top">
                      <strong>{item.title}</strong>
                      <span>{money(item.amount)} {localizeCurrency(focusCurrency, t)}</span>
                    </div>
                    <div className="ea-cat__bar" aria-hidden>
                      <i style={{ width: `${Math.min(100, share)}%` }} />
                    </div>
                    <small>
                      {share.toFixed(1)}%
                      {' · '}
                      {delta > 0 ? t('desktop.ea_increase') : delta < 0 ? t('desktop.ea_decrease') : t('desktop.ea_same')}
                    </small>
                  </div>
                )
              })}
            </div>
          </section>
          </div>
        </>
      )}
    </div>
  )
}

function formatParts(parts: { year: number; month: number; day: number }, locale: 'fa' | 'ps' | 'en'): string {
  return `${parts.day} ${jalaliMonthName(parts.month, locale)} ${parts.year}`
}

function isCurrent(year: number, month: number, today: { year: number; month: number } | null): boolean {
  return Boolean(today && today.year === year && today.month === month)
}

function isPrevious(year: number, month: number, today: { year: number; month: number } | null): boolean {
  if (!today) return false
  const prev = shiftJalaliMonth(today.year, today.month, -1)
  return prev.year === year && prev.month === month
}

function BarChart({
  items,
  empty,
  scroll,
}: {
  items: Array<{ label: string; value: number; active?: boolean }>
  empty: string
  scroll?: boolean
}) {
  const max = Math.max(...items.map((item) => item.value), 0)
  if (items.length === 0 || max === 0) return <p className="muted">{empty}</p>
  return (
    <div className={`ea-bars${scroll ? ' is-scroll' : ''}`}>
      {items.map((item, index) => (
        <div key={`${item.label}-${index}`} tabIndex={0} role="img" aria-label={`${item.label}: ${money(item.value)}`} data-value={money(item.value)} className={item.active ? 'is-on' : ''} title={`${item.label}: ${money(item.value)}`}>
          <span style={{ height: `${item.value > 0 ? Math.max(2, (item.value / max) * 100) : 0}%` }} />
          <small>{item.label}</small>
        </div>
      ))}
    </div>
  )
}

function Donut({
  items,
  total,
}: {
  items: Array<{ id: number; title: string; amount: number }>
  total: number
}) {
  const colors = ['#5683cd', '#86a5d8', '#afc4e5', '#c77b90', '#d5ad70', '#8199a9', '#bbc9d8']
  let cursor = 0
  const stops = items.map((item, index) => {
    const share = total > 0 ? (item.amount / total) * 100 : 0
    const start = cursor
    cursor += share
    return `${colors[index % colors.length]} ${start}% ${cursor}%`
  })
  return (
    <div className="ea-donut">
      <div style={{ background: `conic-gradient(${stops.join(',')})` }} />
      <ul>
        {items.map((item, index) => (
          <li key={item.id}>
            <i style={{ background: colors[index % colors.length] }} />
            {item.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
