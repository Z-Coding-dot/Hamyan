import { FormEvent, useEffect, useRef, useState } from 'react'
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
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const scopes: Array<{ id: Scope; label: string }> = [
    { id: 'all', label: t('desktop.hy_search_all') },
    { id: 'expense', label: t('desktop.hy_search_expenses') },
    { id: 'deal', label: t('desktop.hy_search_deals') },
    { id: 'person', label: t('desktop.hy_search_people') },
  ]

  const run = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!token) return
    const text = query.trim().toLowerCase()
    if (!text && !from && !to) {
      setRan(true)
      setHits([])
      setError(null)
      return
    }
    if (from && to && from > to) {
      setError(t('desktop.ea_range_invalid'))
      setHits([])
      setRan(true)
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

      setHits(next)
      setRan(true)
    } catch (err) {
      setHits([])
      setError(getApiErrorMessage(err))
      setRan(true)
    } finally {
      setLoading(false)
    }
  }

  const go = (to: string) => {
    setOpen(false)
    navigate(to)
  }

  return (
    <div className="hy-search-slot" ref={wrapRef}>
      <button
        type="button"
        className={`hy-top__btn${open ? ' is-on' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label={t('desktop.hy_search_title')}
        aria-expanded={open}
      >
        <i className="fa-solid fa-magnifying-glass" />
      </button>
      {open ? (
        <form className="hy-search" onSubmit={(event) => void run(event)}>
          <div className="hy-search__box">
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t('desktop.hy_search_hint')}
              aria-label={t('desktop.hy_search_title')}
            />
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? t('desktop.loading') : t('desktop.search')}
            </button>
          </div>
          <div className="hy-search__filters">
            {scopes.map((item) => (
              <button
                key={item.id}
                type="button"
                className={scope === item.id ? 'is-on' : ''}
                onClick={() => setScope(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="hy-search__dates">
            <label>
              {t('desktop.start_date')}
              <JalaliDatePicker value={from} onChange={setFrom} allowEmpty />
            </label>
            <label>
              {t('desktop.end_date')}
              <JalaliDatePicker value={to} onChange={setTo} allowEmpty />
            </label>
          </div>
          {error ? <div className="alert-error">{error}</div> : null}
          <div className="hy-search__results">
            {!ran ? (
              <p>{t('desktop.hy_search_prompt')}</p>
            ) : hits.length === 0 && !error ? (
              <p>{textEmpty(query, from, to) ? t('desktop.hy_search_prompt') : t('desktop.hy_search_empty')}</p>
            ) : (
              hits.map((hit) => (
                <button key={hit.key} type="button" className="hy-search__hit" onClick={() => go(hit.to)}>
                  <span>
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
