import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { todayLocalYmd } from '@/lib/datetime'
import { localizeCurrency } from '@/lib/currency'
import {
  expenseAccountLabel,
  storeUserExpense,
  type ExpenseAccountRow,
  type UserAccountRow,
} from '@/lib/user'
import { useLocaleStore } from '@/store/useLocaleStore'
import { useAuthStore } from '@/store/useAuthStore'

type Props = {
  open: boolean
  onClose: () => void
  onSaved: () => void
  expenseAccounts: ExpenseAccountRow[]
  userAccounts: UserAccountRow[]
}

export function AddExpenseModal({
  open,
  onClose,
  onSaved,
  expenseAccounts,
  userAccounts,
}: Props) {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const token = useAuthStore((s) => s.token)

  const allowedAccounts = userAccounts

  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => todayLocalYmd())
  const [expenseAccountId, setExpenseAccountId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [description, setDescription] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setAmount('')
    setDate(todayLocalYmd())
    setDescription('')
    setError(null)
    setExpenseAccountId(expenseAccounts[0] ? String(expenseAccounts[0].id) : '')
    setAccountId(allowedAccounts[0] ? String(allowedAccounts[0].id) : '')
  }, [open, expenseAccounts, allowedAccounts])

  useEffect(() => {
    if (allowedAccounts.length === 0) {
      if (accountId !== '') setAccountId('')
      return
    }
    if (!allowedAccounts.some((item) => String(item.id) === accountId)) {
      setAccountId(String(allowedAccounts[0].id))
    }
  }, [allowedAccounts, accountId])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !expenseAccountId) return
    setProcessing(true)
    setError(null)
    try {
      await storeUserExpense(token, {
        amount: Number(amount),
        date,
        user_expense_account_id: Number(expenseAccountId),
        user_account_id: accountId ? Number(accountId) : undefined,
        description: description.trim() || undefined,
      })
      showSuccessToast(t('desktop.expense_saved_success'))
      onClose()
      onSaved()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal open={open} onClose={() => !processing && onClose()} title={t('desktop.add_expense')}>
      <form className="companies-create-form" onSubmit={(e) => void submit(e)}>
        {error ? <div className="alert-error">{error}</div> : null}

        <div className="form-field">
          <label>{t('desktop.amount')}</label>
          <input
            type="number"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>{t('desktop.date')}</label>
          <JalaliDatePicker value={date} onChange={setDate} />
        </div>

        <div className="form-field">
          <label>{t('desktop.expense_section')}</label>
          <select
            value={expenseAccountId}
            onChange={(e) => setExpenseAccountId(e.target.value)}
            required
          >
            {expenseAccounts.map((item) => (
              <option key={item.id} value={item.id}>
                {expenseAccountLabel(item, locale)}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>{t('desktop.account')}</label>
          <select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
          >
            {allowedAccounts.map((item) => (
              <option key={item.id} value={item.id}>
                {(item.name_fa || item.name_en || item.currency) +
                  ` (${localizeCurrency(item.currency || 'AFN', t)})`}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>{t('desktop.description')}</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={processing} onClick={onClose}>
            {t('desktop.cancel')}
          </button>
          <button type="submit" className="btn-primary" disabled={processing || allowedAccounts.length === 0}>
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
