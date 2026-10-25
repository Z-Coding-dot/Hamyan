import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import { formatJalaliSlash } from '@/lib/datetime'
import {
  fetchAccountsData,
  fetchCounterparties,
  fetchUserExpensesData,
  type UserAccountDeposit,
  type UserExpenseRow,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

type Scope = 'all' | 'expense' | 'deal' | 'person'

type Hit = {
  key: string
  title: string
  meta: string
  amount?: string
  out?: boolean
  to: string
}

function dayOf(value?: string | null): string {
  return String(value || '').slice(0, 10)
}

function inRange(value: string | null | undefined, from: string, to: string): boolean {
  const day = dayOf(value)
  if (!day) return !from && !to
  if (from && day < from) return false
  if (to && day > to) return false
  return true
}

function matches(query: string, parts: Array<string | number | null | undefined>): boolean {
  if (!query) return true
  const hay = parts
    .map((part) => String(part ?? ''))
    .join(' ')
    .toLowerCase()
  return hay.includes(query)
}

export function HeaderSearch() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const locale = useLocaleStore((s) => s.language)
  const token = useAuthStore(useShallow((s) => s.token))
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const requestRef = useRef(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [scope, setScope] = useState<Scope>('all')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ran, setRan] = useState(false)
  const [hits, setHits] = useState<Hit[]>([])

  useEffect(() => {
    if (!open) return
    inputRef.current?.focus()
    const onDoc = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Node)) return
      if (wrapRef.current?.contains(target)) return
      if (target instanceof Element && target.closest('.jalali-date-picker__pop')) return
      setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const scopes: Array<{ id: Scope; label: string; icon: string }> = [
    { id: 'all', label: t('desktop.hy_search_all'), icon: 'fa-layer-group' },
    { id: 'expense', label: t('desktop.hy_search_expenses'), icon: 'fa-receipt' },
    { id: 'deal', label: t('desktop.hy_search_deals'), icon: 'fa-right-left' },
    { id: 'person', label: t('desktop.hy_search_people'), icon: 'fa-user-group' },
  ]

  const run = useCallback(async (event?: FormEvent) => {
    event?.preventDefault()
    if (timerRef.current) clearTimeout(timerRef.current)
    const request = ++requestRef.current
    if (!token) return
    const text = query.trim().toLowerCase()
    if (!text && !from && !to) {
      setRan(false)
      setHits([])
      setError(null)
      setLoading(false)
      return
    }
    if (from && to && from > to) {
      setError(t('desktop.ea_range_invalid'))
      setHits([])
      setRan(true)
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const wantExpense = scope === 'all' || scope === 'expense'
      const wantDeal = scope === 'all' || scope === 'deal'
      const wantPerson = (scope === 'all' || scope === 'person') && Boolean(text)
      const [expenses, accounts, people] = await Promise.all([
        wantExpense
          ? fetchUserExpensesData(token, {
              start_date: from || undefined,
              end_date: to || undefined,
            })
          : Promise.resolve(null),
        wantDeal ? fetchAccountsData(token) : Promise.resolve(null),
        wantPerson ? fetchCounterparties(token, text) : Promise.resolve(null),
      ])

      const cap = scope === 'all' ? 8 : 24
      const next: Hit[] = []
      let expenseCount = 0
      for (const item of (expenses?.expenses ?? []) as UserExpenseRow[]) {
        if (!inRange(item.expense_date, from, to)) continue
        if (
          !matches(text, [
            item.expense_title,
            item.description,
            item.account_name,
            item.amount,
            Number(item.amount || 0).toLocaleString('en-US'),
          ])
        ) {
          continue
        }
        next.push({
          key: `expense-${item.id}`,
          title: item.expense_title || t('desktop.expense_section'),
          meta: [
            item.account_name || t('desktop.account'),
            formatJalaliSlash(item.expense_date, locale),
            item.description || '',
          ]
            .filter(Boolean)
            .join(' · '),
          amount: `${Number(item.amount || 0).toLocaleString('en-US')} ${localizeCurrency(item.currency || 'AFN', t)}`,
          out: true,
          to: '/expenses',
        })
        expenseCount += 1
        if (expenseCount >= cap) break
      }

      let dealCount = 0
      for (const item of (accounts?.deposits ?? []) as UserAccountDeposit[]) {
          if (!inRange(item.date || item.created_at, from, to)) continue
          if (
            !matches(text, [
              item.description,
              item.account_name,
              item.counterparty_name,
              item.amount,
              Number(item.amount || 0).toLocaleString('en-US'),
            ])
          ) {
            continue
          }
          const personId = item.counterparty_customer_id
          next.push({
            key: `deal-${item.transaction_id || item.id}`,
            title: item.description || item.counterparty_name || item.account_name || t('desktop.hy_search_deals'),
            meta: [item.account_name || t('desktop.account'), formatJalaliSlash(item.date || item.created_at, locale)]
              .filter(Boolean)
              .join(' · '),
            amount: `${Number(item.amount || 0).toLocaleString('en-US')} ${localizeCurrency(item.currency || item.account_currency || 'AFN', t)}`,
            out: item.type !== 'credit',
            to: personId ? `/counterparties/${personId}` : '/accounts',
          })
          dealCount += 1
          if (dealCount >= cap) break
      }

      let personCount = 0
      for (const person of people?.counterparties ?? []) {
          if (
            !matches(text, [person.name, person.company_name, person.phone, person.address])
          ) {
            continue
          }
          next.push({
            key: `person-${person.id}`,
            title: person.name || person.company_name || t('desktop.hy_search_people'),
            meta: [person.phone, person.address].filter(Boolean).join(' · '),
            to: `/counterparties/${person.customer_id}`,
          })
          personCount += 1
          if (personCount >= cap) break
      }

      if (request !== requestRef.current) return
      setHits(next)
      setRan(true)
    } catch (err) {
      if (request !== requestRef.current) return
      setHits([])
      setError(getApiErrorMessage(err))
      setRan(true)
    } finally {
      if (request === requestRef.current) setLoading(false)
    }
  }, [token, query, scope, from, to, locale, t])

  useEffect(() => {
    if (!open) return
    timerRef.current = setTimeout(() => void run(), 350)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      requestRef.current += 1
    }
  }, [open, run])

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <div className="hy-search-slot" ref={wrapRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`hy-top__btn hy-top__search-trigger${open ? ' is-on' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('desktop.hy_search_title')}
        aria-expanded={open}
        aria-controls="header-search-panel"
      >
        <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
        <span>{t('desktop.hy_search_title')}</span>
      </button>
      {open ? (
        <form id="header-search-panel" className="hy-search" role="search" aria-label={t('desktop.hy_search_title')} onSubmit={(event) => void run(event)}>
          <div className="hy-search__head">
            <span className="hy-search__head-icon" aria-hidden="true"><i className="fa-solid fa-magnifying-glass" /></span>
            <div><h2>{t('desktop.hy_search_title')}</h2><p>{t('desktop.hy_search_description')}</p></div>
            <button type="button" className="hy-search__close" aria-label={t('desktop.close')} onClick={() => { setOpen(false); triggerRef.current?.focus() }}><i className="fa-solid fa-xmark" aria-hidden="true" /></button>
          </div>
          <div className="hy-search__box">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('desktop.hy_search_hint')}
              aria-label={t('desktop.hy_search_title')}
              autoComplete="off"
            />
            {query && <button type="button" className="hy-search__clear-query" aria-label={t('desktop.hy_search_clear')} onClick={() => { setQuery(''); inputRef.current?.focus() }}><i className="fa-solid fa-circle-xmark" aria-hidden="true" /></button>}
          </div>
          <p className="hy-search__auto-hint">{t('desktop.hy_search_live_hint')}</p>
          <fieldset className="hy-search__scope">
            <legend>{t('desktop.hy_search_scope')}</legend>
            <div className="hy-search__filters">
            {scopes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={scope === item.id ? 'is-on' : ''}
                onClick={() => setScope(item.id)}
                aria-pressed={scope === item.id}
              >
                <i className={`fa-solid ${item.icon}`} aria-hidden="true" /><span>{item.label}</span>
              </button>
            ))}
            </div>
          </fieldset>
          <div className="hy-search__date-heading"><i className="fa-regular fa-calendar" aria-hidden="true" /><span>{t('desktop.hy_search_date_range')}</span></div>
          <div className="hy-search__dates">
            <div><label htmlFor="header-search-from">{t('desktop.start_date')}</label><JalaliDatePicker id="header-search-from" value={from} onChange={setFrom} allowEmpty /></div>
            <div><label htmlFor="header-search-to">{t('desktop.end_date')}</label><JalaliDatePicker id="header-search-to" value={to} onChange={setTo} allowEmpty /></div>
          </div>
          {error ? <div className="alert-error" role="alert">{error}</div> : null}
          <div className="hy-search__results" aria-live="polite" aria-busy={loading}>
            {loading ? <div className="hy-search__empty" role="status"><span className="hy-search__empty-icon"><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /></span><strong>{t('desktop.loading')}</strong></div> : !ran || (hits.length === 0 && !error) ? (
              <div className="hy-search__empty">
                <span className="hy-search__empty-icon"><i className={`fa-solid ${!ran || textEmpty(query, from, to) ? 'fa-magnifying-glass-chart' : 'fa-magnifying-glass'}`} aria-hidden="true" /></span>
                <strong>{!ran || textEmpty(query, from, to) ? t('desktop.hy_search_ready') : t('desktop.hy_search_empty')}</strong>
                <p>{!ran || textEmpty(query, from, to) ? t('desktop.hy_search_prompt') : t('desktop.hy_search_try_again')}</p>
              </div>
            ) : (
              hits.map((hit) => (
                <button key={hit.key} type="button" className="hy-search__hit" onClick={() => go(hit.to)}>
                  <span className={`hy-search__hit-icon${hit.out ? ' is-out' : ''}`} aria-hidden="true"><i className={`fa-solid ${hit.key.startsWith('expense') ? 'fa-receipt' : hit.key.startsWith('person') ? 'fa-user' : 'fa-right-left'}`} /></span>
                  <span className="hy-search__hit-copy">
                    <strong>{hit.title}</strong>
                    {hit.meta ? <small>{hit.meta}</small> : null}
                  </span>
                  {hit.amount ? (
                    <bdi className={hit.out ? 'is-out' : 'is-in'}>{hit.amount}</bdi>
                  ) : null}
                </button>
              ))
            )}
          </div>
        </form>
      ) : null}
    </div>
  )
}

function textEmpty(query: string, from: string, to: string): boolean {
  return !query.trim() && !from && !to
}
