import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { SearchField } from '@/components/inputs/SearchField'
import { useRegisterPageRefresh } from '@/hooks/useRegisterPageRefresh'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import { readPageCache, writePageCache } from '@/lib/devicePageCache'
import { formatJalaliSlash } from '@/lib/datetime'
import { localizeCurrency } from '@/lib/currency'
import {
  fetchCounterpartyTransactions,
  type CounterpartyBalanceLine,
  type CounterpartyTransactionRow,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

export function CounterpartyTransactionsPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const { token } = useAuthStore(useShallow((state) => ({ token: state.token })))
  const userKey = useUserCacheKey()
  const cachedRows = readPageCache<CounterpartyTransactionRow[]>(userKey, 'cp-tx')

  const [loading, setLoading] = useState(!cachedRows)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<CounterpartyTransactionRow[]>(cachedRows ?? [])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const load = useCallback(
    async (force = false) => {
      if (!token) return
      if (!force) {
        const hit = readPageCache<CounterpartyTransactionRow[]>(userKey, 'cp-tx')
        if (hit) {
          setTransactions(hit)
          setLoading(false)
          return
        }
      }
      if (force) setRefreshing(true)
      else setLoading(true)
      setError(null)
      try {
        const rows = await fetchCounterpartyTransactions(token)
        setTransactions(rows)
        writePageCache(userKey, 'cp-tx', rows)
      } catch (err) {
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [token, userKey],
  )

  useEffect(() => {
    void load()
  }, [load])

  const refreshPage = useCallback(() => {
    void load(true)
  }, [load])
  useRegisterPageRefresh(refreshPage, refreshing)

  const summaryByAccount = useMemo(() => {
    const groups = new Map<string, CounterpartyBalanceLine & { debit_sum: number; credit_sum: number }>()

    for (const tx of transactions) {
      const accountId = Number(tx.user_account_id || 0)
      const accountName = String(tx.account_name || '—')
      const currency = String(tx.currency || 'AFN').toUpperCase()
      const key = `${accountId}|${currency}`

      if (!groups.has(key)) {
        groups.set(key, {
          user_account_id: accountId,
          account_name: accountName,
          currency,
          debit_sum: 0,
          credit_sum: 0,
          net_balance: 0,
          balance_type: 'settled',
        })
      }

      const item = groups.get(key)!
      const amount = Number(tx.amount || 0)
      if (tx.type === 'debit') item.debit_sum = Number(item.debit_sum || 0) + amount
      else item.credit_sum = Number(item.credit_sum || 0) + amount
    }

    return Array.from(groups.values())
      .map((row) => {
        const net = Number(row.debit_sum || 0) - Number(row.credit_sum || 0)
        return {
          ...row,
          net_balance: Math.abs(net),
          balance_type: net > 0 ? 'talab' : net < 0 ? 'baqi' : 'settled',
        }
      })
      .sort((a, b) => String(a.account_name).localeCompare(String(b.account_name)))
  }, [transactions])

  const invalidRange = Boolean(startDate && endDate && startDate > endDate)
  const visibleTransactions = useMemo(() => {
    if (invalidRange) return []
    const needle = search.trim().toLowerCase()
    return transactions.filter((tx) => {
      if (typeFilter && tx.type !== typeFilter) return false
      const day = String(tx.transaction_date || '').slice(0, 10)
      if (startDate && (!day || day < startDate)) return false
      if (endDate && (!day || day > endDate)) return false
      return !needle || [tx.counterparty_name, tx.account_name, tx.note, tx.amount, Number(tx.amount || 0).toLocaleString('en-US')]
        .some((part) => String(part ?? '').toLowerCase().includes(needle))
    })
  }, [transactions, search, typeFilter, startDate, endDate, invalidRange])
  const hasFilters = Boolean(search || typeFilter || startDate || endDate)

  return (
    <div className="cp-page hy-ledger hy-transfers">
      <header className="hy-ledger__head">
        <div>
          <span className="hy-ledger__eyebrow">{t('desktop.hy_transfer_eyebrow')}</span>
          <h2>{t('desktop.counterparty_transactions')}</h2>
          <p>{t('desktop.hy_transfers_desc')}</p>
        </div>
        <Link to="/counterparties" className="hy-ledger__back"><i className="fa-solid fa-user-group" aria-hidden="true" />{t('desktop.nav_counterparties')}</Link>
      </header>
      {error ? <div className="alert-error" role="alert">{error}</div> : null}

      {summaryByAccount.length > 0 && <section className="hy-transfer-summary" aria-label={t('desktop.hy_transfer_totals')}>
        <div className="hy-transfer-summary__heading"><h3>{t('desktop.hy_transfer_totals')}</h3><span>{t('desktop.hy_all_transfers')}</span></div>
        <div className="hy-transfer-summary__grid">
          {summaryByAccount.map((line, idx) => (
            <article key={`${line.user_account_id}-${line.currency}-${idx}`} className="hy-transfer-summary__card">
              <div className="hy-transfer-summary__account"><span className="hy-transfer-summary__icon" aria-hidden="true"><i className="fa-solid fa-wallet" /></span><strong>{line.account_name || '—'}</strong><span className="hy-transfer-summary__currency">{localizeCurrency(line.currency || 'AFN', t)}</span></div>
              <div className="hy-transfer-summary__amounts">
                <div><span><i className="fa-solid fa-arrow-down" aria-hidden="true" />{t('desktop.total_incoming')}</span><strong className="is-in"><bdi>{Number(line.credit_sum || 0).toLocaleString('en-US')}</bdi></strong></div>
                <div><span><i className="fa-solid fa-arrow-up" aria-hidden="true" />{t('desktop.total_outgoing')}</span><strong className="is-out"><bdi>{Number(line.debit_sum || 0).toLocaleString('en-US')}</bdi></strong></div>
              </div>
              <div className="hy-transfer-summary__balance">
                <span>{line.balance_type === 'talab' ? t('desktop.talab') : line.balance_type === 'baqi' ? t('desktop.baqi') : t('desktop.settled')}</span>
                <strong><bdi>{Number(line.net_balance || 0).toLocaleString('en-US')}</bdi> <small>{localizeCurrency(line.currency || 'AFN', t)}</small></strong>
              </div>
            </article>
          ))}
        </div>
      </section>}

      <section className="hy-ledger__workspace">
        <div className="hy-ledger__list-head"><h3>{t('desktop.counterparty_transactions')}</h3><span className="cp-count"><bdi>{visibleTransactions.length} / {transactions.length}</bdi></span></div>
        <div className="cp-filters">
          <SearchField label={t('desktop.search')} value={search} onChange={setSearch} placeholder={t('desktop.hy_transfer_search_hint')} />
          <div className="form-field"><label htmlFor="transfer-type">{t('desktop.type')}</label>
            <select id="transfer-type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="">{t('desktop.all')}</option><option value="credit">{t('desktop.cp_incoming')}</option><option value="debit">{t('desktop.cp_outgoing')}</option>
            </select>
          </div>
          <div className="form-field"><label htmlFor="transfer-from">{t('desktop.start_date')}</label><JalaliDatePicker id="transfer-from" value={startDate} onChange={setStartDate} allowEmpty /></div>
          <div className="form-field"><label htmlFor="transfer-to">{t('desktop.end_date')}</label><JalaliDatePicker id="transfer-to" value={endDate} onChange={setEndDate} allowEmpty /></div>
          {hasFilters && <button type="button" className="hy-ledger__reset" onClick={() => { setSearch(''); setTypeFilter(''); setStartDate(''); setEndDate('') }}><i className="fa-solid fa-arrow-rotate-left" aria-hidden="true" />{t('desktop.hy_search_reset')}</button>}
        </div>
        {invalidRange && <div className="alert-error" role="alert">{t('desktop.ea_range_invalid')}</div>}
        <div className="cp-table-wrap">
          {loading ? <div className="hy-ledger__empty" role="status"><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /><p>{t('desktop.loading')}</p></div>
            : visibleTransactions.length === 0 ? <div className="hy-ledger__empty"><i className="fa-solid fa-right-left" aria-hidden="true" /><p>{t('desktop.no_record_found')}</p></div> : <>
            <table className="cp-table">
              <thead><tr><th>{t('desktop.counterparty')}</th><th>{t('desktop.type')}</th><th>{t('desktop.amount')}</th><th>{t('desktop.account')}</th><th>{t('desktop.date')}</th><th>{t('desktop.description')}</th></tr></thead>
              <tbody>{visibleTransactions.map((tx) => <tr key={tx.id}>
                <td>{tx.counterparty_customer_id ? <Link className="cp-name-link" to={`/counterparties/${tx.counterparty_customer_id}`}><span className="hy-party-avatar" aria-hidden="true">{Array.from(tx.counterparty_name || '—')[0]}</span><span>{tx.counterparty_name || '—'}</span></Link> : tx.counterparty_name || '—'}</td>
                <td><span className={`hy-transfer-badge ${tx.type === 'credit' ? 'is-in' : 'is-out'}`}><i className={`fa-solid ${tx.type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up'}`} aria-hidden="true" />{t(tx.type === 'credit' ? 'desktop.cp_incoming' : 'desktop.cp_outgoing')}</span></td>
                <td><strong className="hy-transfer-value"><bdi>{Number(tx.amount || 0).toLocaleString('en-US')}</bdi> <small>{localizeCurrency(tx.currency || 'AFN', t)}</small></strong></td>
                <td>{tx.account_name || '—'}</td><td>{formatJalaliSlash(tx.transaction_date, locale)}</td><td className="hy-transfer-note">{tx.note || '—'}</td>
              </tr>)}</tbody>
            </table>
            <div className="hy-transfer-cards">{visibleTransactions.map((tx) => <article key={tx.id} className="hy-transfer-card">
              <div className="hy-transfer-card__top"><span className={`hy-transfer-card__icon ${tx.type === 'credit' ? 'is-in' : 'is-out'}`} aria-hidden="true"><i className={`fa-solid ${tx.type === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up'}`} /></span>
                <div>{tx.counterparty_customer_id ? <Link className="cp-name-link" to={`/counterparties/${tx.counterparty_customer_id}`}>{tx.counterparty_name || '—'}</Link> : <strong>{tx.counterparty_name || '—'}</strong>}<small>{t(tx.type === 'credit' ? 'desktop.cp_incoming' : 'desktop.cp_outgoing')}</small></div>
                <strong className={`hy-transfer-value ${tx.type === 'credit' ? 'is-in' : 'is-out'}`}><bdi>{Number(tx.amount || 0).toLocaleString('en-US')}</bdi><small>{localizeCurrency(tx.currency || 'AFN', t)}</small></strong>
              </div>
              <div className="hy-transfer-card__meta"><span><i className="fa-solid fa-wallet" aria-hidden="true" />{tx.account_name || '—'}</span><span><i className="fa-regular fa-calendar" aria-hidden="true" />{formatJalaliSlash(tx.transaction_date, locale)}</span></div>
              {tx.note && <p>{tx.note}</p>}
            </article>)}</div>
          </>}
        </div>
      </section>
    </div>
  )
}
