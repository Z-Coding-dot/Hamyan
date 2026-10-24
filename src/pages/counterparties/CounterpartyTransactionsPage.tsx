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

  return (
    <div className="cp-page" dir="rtl">
      <div className="cp-header" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/counterparties" className="cp-action-link">
          {t('desktop.nav_counterparties')}
        </Link>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="cp-filters">
        <SearchField
          label={t('desktop.search')}
          value={search}
          onChange={setSearch}
        />
        <div className="form-field">
          <label>{t('desktop.type')}</label>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">{t('desktop.all')}</option>
            <option value="credit">{t('desktop.cp_incoming')}</option>
            <option value="debit">{t('desktop.cp_outgoing')}</option>
          </select>
        </div>
        <div className="form-field">
          <label>{t('desktop.start_date')}</label>
          <JalaliDatePicker value={startDate} onChange={setStartDate} allowEmpty />
        </div>
        <div className="form-field">
          <label>{t('desktop.end_date')}</label>
          <JalaliDatePicker value={endDate} onChange={setEndDate} allowEmpty />
        </div>
      </div>

      <div className="cp-summary">
        {summaryByAccount.length === 0 ? (
          <div className="cp-settled">{t('desktop.settled')}</div>
        ) : (
          summaryByAccount.map((line, idx) => (
            <div key={`${line.user_account_id}-${line.currency}-${idx}`} className="cp-summary__row">
              <div>
                {t('desktop.account')}: <strong>{line.account_name || '—'}</strong>
              </div>
              <div>
                {t('desktop.total_outgoing')}:{' '}
                <strong>
                  {Number(line.debit_sum || 0).toLocaleString('en-US')} {localizeCurrency(line.currency || 'AFN', t)}
                </strong>
              </div>
              <div>
                {t('desktop.total_incoming')}:{' '}
                <strong>
                  {Number(line.credit_sum || 0).toLocaleString('en-US')} {localizeCurrency(line.currency || 'AFN', t)}
                </strong>
              </div>
              <div>
                {line.balance_type === 'talab' ? (
                  <span className="cp-talab">
                    {t('desktop.talab')}: {Number(line.net_balance || 0).toLocaleString('en-US')}{' '}
                    {localizeCurrency(line.currency || 'AFN', t)}
                  </span>
                ) : null}
                {line.balance_type === 'baqi' ? (
                  <span className="cp-baqi">
                    {t('desktop.baqi')}: {Number(line.net_balance || 0).toLocaleString('en-US')}{' '}
                    {localizeCurrency(line.currency || 'AFN', t)}
                  </span>
                ) : null}
                {line.balance_type === 'settled' ? (
                  <span className="cp-settled">
                    {t('desktop.settled')} ({localizeCurrency(line.currency || 'AFN', t)})
                  </span>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="cp-table-wrap">
        {loading ? (
          <p className="muted" style={{ padding: 16 }}>
            <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.loading')}
          </p>
        ) : transactions.length === 0 ? (
          <p className="muted" style={{ padding: 16 }}>
            {t('desktop.no_record_found')}
          </p>
        ) : (
          <table className="cp-table">
            <thead>
              <tr>
                <th>{t('desktop.date')}</th>
                <th>{t('desktop.counterparty')}</th>
                <th>{t('desktop.type')}</th>
                <th>{t('desktop.amount')}</th>
                <th>{t('desktop.account')}</th>
                <th>{t('desktop.description')}</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>{formatJalaliSlash(tx.transaction_date, locale)}</td>
                  <td>
                    {tx.counterparty_customer_id ? (
                      <Link className="cp-name-link" to={`/counterparties/${tx.counterparty_customer_id}`}>
                        {tx.counterparty_name || '—'}
                      </Link>
                    ) : (
                      tx.counterparty_name || '—'
                    )}
                  </td>
                  <td>
                    {tx.type === 'credit' ? (
                      <span className="cp-talab">{t('desktop.cp_incoming')}</span>
                    ) : (
                      <span className="cp-baqi">{t('desktop.cp_outgoing')}</span>
                    )}
                  </td>
                  <td>
                    {Number(tx.amount || 0).toLocaleString('en-US')} {localizeCurrency(tx.currency || 'AFN', t)}
                  </td>
                  <td>{tx.account_name || '—'}</td>
                  <td>{tx.note || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
