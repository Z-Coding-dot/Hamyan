import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { SearchableSelect } from '@/components/inputs/SearchableSelect'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { todayLocalYmd } from '@/lib/datetime'
import { localizeCurrency } from '@/lib/currency'
import {
  expenseAccountLabel,
  accountDisplayName,
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
    <Modal open={open} onClose={() => !processing && onClose()} title={t('desktop.hy_record_expense')} wide className="hy-party-dialog hy-finance-dialog hy-expense-dialog">
      <form className="companies-create-form hy-party-form" onSubmit={(e) => void submit(e)}>
        <div className="hy-party-form__intro"><span aria-hidden="true"><i className="fa-solid fa-receipt" /></span><p>{t('desktop.hy_expense_form_note')}</p></div>
        {error ? <div className="alert-error">{error}</div> : null}
        <div className="hy-party-form__grid">
        <div className="form-field hy-party-form__full">
          <label htmlFor="expense-amount">{t('desktop.amount')} <span className="hy-required" aria-hidden="true">*</span></label>
          <div className="hy-flow-amount">
          <input
            id="expense-amount"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min="1"
            step="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <span>{localizeCurrency(allowedAccounts.find((item) => String(item.id) === accountId)?.currency || 'AFN', t)}</span>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="expense-date">{t('desktop.date')}</label>
          <JalaliDatePicker id="expense-date" value={date} onChange={setDate} />
        </div>

        <div className="form-field">
          <SearchableSelect label={t('desktop.expense_section')} value={expenseAccountId} onChange={setExpenseAccountId} required options={expenseAccounts.map((item) => ({ value: String(item.id), label: expenseAccountLabel(item, locale) }))} />
        </div>

        <div className="form-field hy-party-form__full">
          <SearchableSelect label={t('desktop.account')} value={accountId} onChange={setAccountId} required options={allowedAccounts.map((item) => ({ value: String(item.id), label: `${(item as UserAccountRow & { name?: string }).name || accountDisplayName(item, locale)} (${localizeCurrency(item.currency || 'AFN', t)})` }))} />
        </div>

        <div className="form-field hy-party-form__full">
          <label htmlFor="expense-description">{t('desktop.description')}</label>
          <textarea
            id="expense-description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
          />
        </div>
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
