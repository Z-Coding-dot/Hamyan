import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { AddExpenseModal } from '@/pages/accounts/AddExpenseModal'
import { useRegisterPageRefresh } from '@/hooks/useRegisterPageRefresh'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import { readPageCache, writePageCache } from '@/lib/devicePageCache'
import { formatJalaliSlash } from '@/lib/datetime'
import {
  fetchExpenseAccounts,
  fetchUserExpensesData,
  type ExpenseAccountRow,
  type ExpenseListData,
  type UserAccountRow,
  type UserExpenseRow,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

function ymd(value?: string | null): string {
  return String(value || '').slice(0, 10)
}

export function ExpensesPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const cached = readPageCache<ExpenseListData>(userKey, 'expenses')

  const [accounts, setAccounts] = useState<ExpenseListData['accounts']>(cached?.accounts ?? [])
  const [expenses, setExpenses] = useState<UserExpenseRow[]>(cached?.expenses ?? [])
  const [expenseAccounts, setExpenseAccounts] = useState<ExpenseAccountRow[]>([])
  const [accountId, setAccountId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [loading, setLoading] = useState(!cached)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async (force = false) => {
    if (!token) return
    if (!force) {
      const hit = readPageCache<ExpenseListData>(userKey, 'expenses')
      if (hit) {
        setAccounts(hit.accounts)
        setExpenses(hit.expenses)
        setLoading(false)
        return
      }
    }
    setRefreshing(force)
    if (!force) setLoading(true)
    setError(null)
    try {
      const [data, sections] = await Promise.all([
        fetchUserExpensesData(token),
        fetchExpenseAccounts(token),
      ])
      setAccounts(data.accounts)
      setExpenses(data.expenses)
      setExpenseAccounts(sections)
      writePageCache(userKey, 'expenses', data)
      writePageCache(userKey, 'expense-sections', sections)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [token, userKey])

  useEffect(() => {
    const sections = readPageCache<ExpenseAccountRow[]>(userKey, 'expense-sections')
    if (sections) setExpenseAccounts(sections)
    void load(false)
  }, [load, userKey])

  const refreshPage = useCallback(() => {
    void load(true)
  }, [load])
  useRegisterPageRefresh(refreshPage, refreshing)

  const visible = useMemo(() => {
    return expenses.filter((item) => {
      if (accountId && String(item.user_account_id || '') !== accountId) return false
      const day = ymd(item.expense_date)
      if (startDate && day < startDate) return false
      if (endDate && day > endDate) return false
      return true
    })
  }, [expenses, accountId, startDate, endDate])

  const userAccounts = accounts as UserAccountRow[]
  const totals = useMemo(() => {
    const grouped = new Map<string, number>()
    visible.forEach((row) => { const code = row.currency || 'AFN'; grouped.set(code, (grouped.get(code) || 0) + Number(row.amount || 0)) })
    return Array.from(grouped)
  }, [visible])

  return (
    <div className="user-accounts-page hy-exp hy-ledger hy-money-page hy-expenses-page">
      <div className="hy-ledger__head">
        <div>
          <span className="hy-ledger__eyebrow">{t('desktop.hy_finances')}</span>
          <h2>{t('desktop.expenses_page')}</h2>
          <p>{t('desktop.expenses_page_desc')}</p>
        </div>
        <button type="button" className="btn-primary hy-ledger__add" onClick={() => setExpenseOpen(true)}>
          <i className="fa-solid fa-plus" aria-hidden="true" />
          {t('desktop.hy_record_expense')}
        </button>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}
      {totals.length > 0 && <div className="hy-money-totals">{totals.map(([currency, amount]) => <article key={currency}><div><span className="hy-money-totals__icon" aria-hidden="true"><i className="fa-solid fa-receipt" /></span><span>{t('desktop.expenses_page')}</span><small>{localizeCurrency(currency, t)}</small></div><strong><bdi>{amount.toLocaleString('en-US')}</bdi></strong><p>{t('desktop.hy_filtered_totals')}</p></article>)}</div>}

      <div className="hy-ledger__workspace">
      <div className="hy-exp__filters">
        <label>
          {t('desktop.account')}
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            <option value="">{t('desktop.all')}</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {(acc.name || '-') + ` (${localizeCurrency(acc.currency || 'AFN', t)})`}
              </option>
            ))}
          </select>
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
          <h5>{t('desktop.expenses_page')}</h5>
          <span className="hy-money-count"><bdi>{visible.length}</bdi></span>
        </div>
        {loading ? (
          <div className="hy-ledger__empty" role="status"><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /><p>{t('desktop.loading')}</p></div>
        ) : visible.length === 0 ? (
          <div className="hy-ledger__empty"><i className="fa-solid fa-receipt" aria-hidden="true" /><p>{t('desktop.no_record_found')}</p></div>
        ) : (
          visible.map((item) => (
            <article key={item.id} className="hy-tx__row">
              <span className="hy-tx__icon is-out">
                <i className="fa-solid fa-receipt" />
              </span>
              <span className="hy-tx__body">
                <strong>{item.expense_title || t('desktop.expense_section')}</strong>
                <small>
                  {item.account_name || t('desktop.account')} ({localizeCurrency(item.currency || 'AFN', t)})
                  {' · '}
                  <bdi>{formatJalaliSlash(item.expense_date, locale)}</bdi>
                  {item.description ? ` · ${item.description}` : ''}
                </small>
              </span>
              <span className="hy-tx__amount is-out">
                <bdi>{Number(item.amount || 0).toLocaleString('en-US')}</bdi>{' '}
                {localizeCurrency(item.currency || 'AFN', t)}
              </span>
            </article>
          ))
        )}
      </section>
      </div>

      <AddExpenseModal
        open={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        onSaved={() => void load(true)}
        expenseAccounts={expenseAccounts}
        userAccounts={userAccounts}
      />
    </div>
  )
}
