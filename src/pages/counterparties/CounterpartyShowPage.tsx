import { Select } from '@/components/inputs/SearchableSelect'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { CounterpartyFlowModal } from '@/pages/accounts/CounterpartyFlowModal'
import { useRegisterPageRefresh } from '@/hooks/useRegisterPageRefresh'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import { readPageCache, writePageCache } from '@/lib/devicePageCache'
import { formatJalaliSlash } from '@/lib/datetime'
import { localizeCurrency } from '@/lib/currency'
import {
  fetchAccountsData,
  fetchCounterpartyDetails,
  type CounterpartyBalanceLine,
  type CounterpartyDetailsData,
  type CounterpartyRow,
  type CounterpartyTransactionRow,
  type UserAccountRow,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

export function CounterpartyShowPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const { customerId = '' } = useParams()
  const { token } = useAuthStore(useShallow((state) => ({ token: state.token })))
  const userKey = useUserCacheKey()
  const cached = readPageCache<CounterpartyDetailsData>(userKey, `cp-${customerId}`)

  const [counterparty, setCounterparty] = useState<CounterpartyRow | null>(cached?.counterparty ?? null)
  const [transactions, setTransactions] = useState<CounterpartyTransactionRow[]>(cached?.transactions ?? [])
  const [summary, setSummary] = useState<CounterpartyBalanceLine[]>(cached?.summary ?? [])
  const [loading, setLoading] = useState(!cached)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [accounts, setAccounts] = useState<UserAccountRow[]>([])
  const [cpFlow, setCpFlow] = useState<'credit' | 'debit' | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  const applyDetails = (data: CounterpartyDetailsData) => {
    setCounterparty(data.counterparty)
    setTransactions(Array.isArray(data.transactions) ? data.transactions : [])
    setSummary(Array.isArray(data.summary) ? data.summary : [])
  }

  const load = useCallback(
    async (force = false) => {
      if (!token || !customerId) return
      const cacheKey = `cp-${customerId}`
      if (!force) {
        const hit = readPageCache<CounterpartyDetailsData>(userKey, cacheKey)
        if (hit) {
          applyDetails(hit)
          setLoading(false)
          return
        }
      }
      if (force) setRefreshing(true)
      else setLoading(true)
      setError(null)
      try {
        const data = await fetchCounterpartyDetails(token, customerId)
        applyDetails(data)
        writePageCache(userKey, cacheKey, data)
      } catch (err) {
        setCounterparty(null)
        setTransactions([])
        setSummary([])
        setError(getApiErrorMessage(err))
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [token, customerId, userKey],
  )

  useEffect(() => {
    void load(reloadKey > 0)
  }, [load, reloadKey])

  const refreshPage = useCallback(() => {
    void load(true)
  }, [load])
  useRegisterPageRefresh(refreshPage, refreshing)

  const visibleTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter && tx.type !== typeFilter) return false
      const day = String(tx.transaction_date || '').slice(0, 10)
      if (startDate && day < startDate) return false
      if (endDate && day > endDate) return false
      return true
    })
  }, [transactions, typeFilter, startDate, endDate])

  useEffect(() => {
    if (!token) return
    void fetchAccountsData(token)
      .then((data) => setAccounts(Array.isArray(data.accounts) ? data.accounts : []))
      .catch(() => setAccounts([]))
  }, [token])

  return (
    <div className="cp-page" dir="rtl">
      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <p className="muted">
          <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.loading')}
        </p>
      ) : !counterparty ? (
        <div className="alert-error">{t('desktop.counterparty_not_found')}</div>
      ) : (
        <>
          <div className="cp-ledger">
            {summary.length === 0 ? (
              <div className="cp-settled">{t('desktop.settled')}</div>
            ) : (
              summary.map((line, idx) => {
                const currency = localizeCurrency(line.currency || 'AFN', t)
                const debit = Number(line.debit_sum || 0)
                const credit = Number(line.credit_sum || 0)
                const net = debit - credit
                const kind = net > 0 ? 'talab' : net < 0 ? 'baqi' : 'settled'
                const tone = kind === 'baqi' ? 'is-baqi' : kind === 'talab' ? 'is-talab' : 'is-settled'
                const balanceLabel =
                  kind === 'baqi' ? t('desktop.baqi') : kind === 'talab' ? t('desktop.talab') : t('desktop.settled')
                return (
                  <article key={`${line.currency}-${idx}`} className="cp-ledger__card">
                    <p className="cp-ledger__account">
                      {t('desktop.account')}: <strong>{line.account_name || '—'}</strong>
                    </p>
                    <div className="cp-ledger__stats">
                      <div className="cp-ledger__stat is-out">
                        <span>{t('desktop.total_outgoing')}</span>
                        <strong>
                          <bdi>{debit.toLocaleString('en-US')}</bdi> {currency}
                        </strong>
                      </div>
                      <div className="cp-ledger__stat is-in">
                        <span>{t('desktop.total_incoming')}</span>
                        <strong>
                          <bdi>{credit.toLocaleString('en-US')}</bdi> {currency}
                        </strong>
                      </div>
                      <div className={`cp-ledger__stat is-balance ${tone}`}>
                        <span>{balanceLabel}</span>
                        <strong>
                          <bdi>{Math.abs(net).toLocaleString('en-US')}</bdi> {currency}
                        </strong>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>

          <div className="cp-flow">
            <button
              type="button"
              className="cp-flow__btn is-in"
              onClick={() => setCpFlow('credit')}
              disabled={accounts.length === 0}
            >
              <i className="fa-solid fa-arrow-down" />
              {t('desktop.cp_incoming')} ({counterparty.name || '—'})
            </button>
            <button
              type="button"
              className="cp-flow__btn is-out"
              onClick={() => setCpFlow('debit')}
              disabled={accounts.length === 0}
            >
              <i className="fa-solid fa-arrow-up" />
              {t('desktop.cp_outgoing')} ({counterparty.name || '—'})
            </button>
          </div>

          <div className="cp-filters">
            <div className="form-field">
              <label>{t('desktop.type')}</label>
              <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">{t('desktop.all')}</option>
                <option value="credit">{t('desktop.cp_incoming')}</option>
                <option value="debit">{t('desktop.cp_outgoing')}</option>
              </Select>
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

          <div className="cp-table-wrap">
            {visibleTransactions.length === 0 ? (
              <p className="muted" style={{ padding: 16 }}>
                {t('desktop.no_record_found')}
              </p>
            ) : (
              <table className="cp-table">
                <thead>
                  <tr>
                    <th>{t('desktop.date')}</th>
                    <th>{t('desktop.type')}</th>
                    <th>{t('desktop.amount')}</th>
                    <th>{t('desktop.account')}</th>
                    <th>{t('desktop.description')}</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleTransactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>{formatJalaliSlash(tx.transaction_date, locale)}</td>
                      <td>
                        {tx.type === 'credit' ? (
                          <span className="cp-talab">{t('desktop.cp_incoming')}</span>
                        ) : (
                          <span className="cp-baqi">{t('desktop.cp_outgoing')}</span>
                        )}
                      </td>
                      <td>
                        {Number(tx.amount || 0).toLocaleString('en-US')}{' '}
                        {localizeCurrency(tx.currency || 'AFN', t)}
                      </td>
                      <td>{tx.account_name || '—'}</td>
                      <td>{tx.note || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {token ? (
            <CounterpartyFlowModal
              open={cpFlow !== null}
              direction={cpFlow || 'credit'}
              token={token}
              accounts={accounts}
              locale={locale}
              lockedCounterparty={{
                id: counterparty.id,
                name: counterparty.name || '—',
                customer_id: counterparty.customer_id,
              }}
              onClose={() => setCpFlow(null)}
              onDone={() => setReloadKey((value) => value + 1)}
            />
          ) : null}
        </>
      )}
    </div>
  )
}
