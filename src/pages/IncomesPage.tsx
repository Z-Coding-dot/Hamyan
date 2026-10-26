import { Select } from '@/components/inputs/SearchableSelect'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { m } from 'framer-motion'
import { IncomeEntryModal } from '@/components/DashboardPersonalAccounts'
import { useIsMobileSidebar } from '@/hooks/useMediaQuery'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { useRegisterPageRefresh } from '@/hooks/useRegisterPageRefresh'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import { formatJalaliSlash } from '@/lib/datetime'
import { INCOME_CATEGORIES, incomeCategoryKey } from '@/lib/incomeCategories'
import { type UserAccountDeposit } from '@/lib/user'
import { useAppCacheStore } from '@/store/useAppCacheStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

function ymd(value?: string | null): string {
  return String(value || '').slice(0, 10)
}

function isPersonalIncome(row: UserAccountDeposit): boolean {
  if (row.type !== 'credit') return false
  if (row.counterparty_id || row.counterparty_name) return false
  return true
}

export function IncomesPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const isMobile = useIsMobileSidebar()
  const [search, setSearch] = useState('')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [incomeOpen, setIncomeOpen] = useState(false)
  const ensurePersonalAccounts = useAppCacheStore((s) => s.ensurePersonalAccounts)
  const cachedDeposits = useAppCacheStore((s) => s.getPersonalAccounts(userKey)?.deposits)
  const accounts = useAppCacheStore((s) => s.getPersonalAccounts(userKey)?.accounts)

  const [rows, setRows] = useState<UserAccountDeposit[]>(
    (cachedDeposits ?? []).filter(isPersonalIncome),
  )
  const [category, setCategory] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(cachedDeposits == null)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    (force = false) => {
      if (!token) return
      if (force) setRefreshing(true)
      else if (!cachedDeposits) setLoading(true)
      setError(null)
      void ensurePersonalAccounts(token, userKey, { force })
        .then((data) => {
          setRows((data?.deposits ?? []).filter(isPersonalIncome))
        })
        .catch((err) => {
          setError(getApiErrorMessage(err))
        })
        .finally(() => {
          setLoading(false)
          setRefreshing(false)
        })
    },
    [token, userKey, cachedDeposits, ensurePersonalAccounts],
  )

  useEffect(() => {
    load(false)
  }, [load])

  const refreshPage = useCallback(() => {
    load(true)
  }, [load])
  useRegisterPageRefresh(refreshPage, refreshing)

  const visible = useMemo(() => {
    return rows.filter((row) => {
      const day = ymd(row.date)
      if (startDate && day < startDate) return false
      if (endDate && day > endDate) return false
      if (category && row.income_category !== category) return false
      if (search.trim() && ![row.description, row.account_name, t(`desktop.income_cat_${row.income_category}`)].join(' ').toLowerCase().includes(search.trim().toLowerCase())) return false
      return true
    })
  }, [rows, startDate, endDate, category, search, t])
  const totals = useMemo(() => {
    const grouped = new Map<string, number>()
    visible.forEach((row) => { const code = row.currency || 'AFN'; grouped.set(code, (grouped.get(code) || 0) + Number(row.amount || 0)) })
    return Array.from(grouped)
  }, [visible])

  return (
    <div className="user-accounts-page hy-exp hy-ledger hy-money-page hy-income-page">
      <div className="hy-ledger__head">
        <div>
          <span className="hy-ledger__eyebrow">{t('desktop.hy_finances')}</span>
          <h2>{t('desktop.hy_incomes_page')}</h2>
          <p>{t('desktop.hy_incomes_desc')}</p>
        </div>
        {isMobile && <m.button type="button" className="btn-primary hy-ledger__add hy-mobile-fab" whileTap={{ scale: .92 }} onClick={() => setIncomeOpen(true)} aria-label={t('desktop.hy_mobile_record_income')}><i className="fa-solid fa-plus" aria-hidden="true" /><span>{t('desktop.hy_mobile_record_income')}</span></m.button>}
      </div>

      {error ? <div className="alert-error">{error}</div> : null}
      {totals.length > 0 && <div className="hy-money-totals">{totals.map(([currency, amount]) => <article key={currency}><div><span className="hy-money-totals__icon" aria-hidden="true"><i className="fa-solid fa-arrow-down" /></span><span>{t('desktop.total_incoming')}</span><small>{localizeCurrency(currency, t)}</small></div><strong><bdi>{amount.toLocaleString('en-US')}</bdi></strong><p>{t('desktop.hy_filtered_totals')}</p></article>)}</div>}

      {isMobile && <div className="hy-mobile-list-tools"><div className="hy-mobile-list-tools__search"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /><input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t('desktop.search')} aria-label={t('desktop.search')} /></div><button type="button" onClick={() => setFiltersOpen((value) => !value)} aria-label={t('desktop.filters')} aria-expanded={filtersOpen} aria-controls="income-filters"><i className="fa-solid fa-sliders" aria-hidden="true" /></button></div>}
      {isMobile && <div className="hy-mobile-chips" role="group" aria-label={t('desktop.income_category')}>{['', ...INCOME_CATEGORIES].map((code) => <button key={code} type="button" className={category === code ? 'is-active' : ''} aria-pressed={category === code} onClick={() => setCategory(code)}>{code ? t(`desktop.income_cat_${code}`) : t('desktop.all')}</button>)}</div>}
      <div className="hy-ledger__workspace">
      <div id="income-filters" className={`hy-exp__filters${filtersOpen ? ' is-mobile-open' : ''}`}>
        <label>
          {t('desktop.income_category')}
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">{t('desktop.all')}</option>
            {INCOME_CATEGORIES.map((code) => (
              <option key={code} value={code}>
                {t(`desktop.income_cat_${code}`)}
              </option>
            ))}
          </Select>
        </label>
        <label>
          {t('desktop.start_date')}
          <JalaliDatePicker value={startDate} onChange={setStartDate} allowEmpty />
        </label>
        <label>
          {t('desktop.end_date')}
          <JalaliDatePicker value={endDate} onChange={setEndDate} allowEmpty />
        </label>
      </div>
      {startDate && endDate && startDate > endDate && <div className="alert-error" role="alert">{t('desktop.ea_range_invalid')}</div>}

      <section className="hy-tx">
        <div className="hy-tx__head">
          <h5>{t('desktop.hy_incomes_page')}</h5>
          <span className="hy-money-count"><bdi>{visible.length}</bdi></span>
        </div>
        {loading ? (
          <div className="hy-ledger__empty" role="status"><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /><p>{t('desktop.loading')}</p></div>
        ) : visible.length === 0 ? (
          <div className="hy-ledger__empty"><i className={`fa-solid ${isMobile ? 'fa-wallet' : 'fa-arrow-down'}`} aria-hidden="true" />{isMobile && rows.length === 0 ? <><h3>{t('desktop.hy_mobile_no_income')}</h3><p>{t('desktop.hy_mobile_add_income_hint')}</p></> : <p>{t('desktop.no_record_found')}</p>}</div>
        ) : (
          visible.map((item) => {
            const categoryKey = incomeCategoryKey(item.income_category)
            return (
              <article key={String(item.transaction_id ?? item.id)} className="hy-tx__row">
                <span className="hy-tx__icon is-in">
                  <i className="fa-solid fa-arrow-down" />
                </span>
                <span className="hy-tx__body">
                  <strong>{categoryKey ? t(categoryKey) : t('desktop.dash_inject')}</strong>
                  <small>
                    {item.account_name || t('desktop.account')} ({localizeCurrency(item.currency || 'AFN', t)})
                    {' · '}
                    <bdi>{formatJalaliSlash(item.date, locale)}</bdi>
                    {item.description ? ` · ${item.description}` : ''}
                  </small>
                </span>
                <span className="hy-tx__amount is-in">
                  <bdi>{Number(item.amount || 0).toLocaleString('en-US')}</bdi>{' '}
                  {localizeCurrency(item.currency || 'AFN', t)}
                </span>
              </article>
            )
          })
        )}
      </section>
      </div>
      <IncomeEntryModal open={incomeOpen} onClose={() => setIncomeOpen(false)} accounts={accounts ?? []} onSaved={() => load(true)} />
    </div>
  )
}
