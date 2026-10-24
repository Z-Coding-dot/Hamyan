import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AxiosError } from 'axios'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  getSalaryPaymentRemainingAllowed,
  storeStaffSalaryPayment,
  type StaffContract,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { todayIsoDate } from '@/pages/company/staff/staffHelpers'

type Props = {
  open: boolean
  token: string
  companyId: string
  staffId: string | number
  contract: StaffContract | null
  remainingHint?: number | null
  onClose: () => void
  onSaved: () => Promise<void> | void
}

export function SalaryPaymentModal({
  open,
  token,
  companyId,
  staffId,
  contract,
  remainingHint,
  onClose,
  onSaved,
}: Props) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [remainingAllowed, setRemainingAllowed] = useState<number | null>(null)
  const [amount, setAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(todayIsoDate())
  const [salaryMonth, setSalaryMonth] = useState('')
  const [description, setDescription] = useState('')
  const [attachment, setAttachment] = useState<File | null>(null)
  const [fileKey, setFileKey] = useState(0)

  useEffect(() => {
    if (!open) return
    setError(null)
    setRemainingAllowed(remainingHint ?? null)
    setAmount('')
    setPaymentDate(todayIsoDate())
    setSalaryMonth('')
    setDescription('')
    setAttachment(null)
    setFileKey((k) => k + 1)
  }, [open, contract, remainingHint])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!contract) return
    setProcessing(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('contract_id', String(contract.id))
      formData.append('amount', amount)
      formData.append('payment_date', paymentDate)
      formData.append('salary_month', salaryMonth ? `${salaryMonth}-01` : '')
      formData.append('description', description)
      if (attachment) {
        formData.append('attachment', attachment)
      }
      await storeStaffSalaryPayment(token, companyId, staffId, formData)
      await onSaved()
      onClose()
    } catch (err) {
      const capped = getSalaryPaymentRemainingAllowed(err)
      if (capped !== null) {
        setRemainingAllowed(capped)
        let msg = getApiErrorMessage(err)
        if (err instanceof AxiosError) {
          const data = err.response?.data as
            | { message?: string; errors?: Record<string, string[] | undefined> }
            | undefined
          msg = data?.errors?.amount?.[0] || data?.message || msg
        }
        setError(`${msg} (${t('desktop.remaining_allowed')}: ${formatMoney(capped)})`)
      } else {
        setError(getApiErrorMessage(err))
      }
    } finally {
      setProcessing(false)
    }
  }

  const accountLabel = contract?.account?.name
    ? `${contract.account.name} - ${localizeCurrency(contract.account.currency, t)}`
    : '—'

  return (
    <Modal open={open} onClose={onClose} title={t('desktop.pay_salary')} wide>
      <form onSubmit={(e) => void submit(e)} className="form-grid">
        {error ? <div className="alert-error">{error}</div> : null}
        {remainingAllowed !== null ? (
          <div className="alert-info">
            {t('desktop.remaining_allowed')}: <strong>{formatMoney(remainingAllowed)}</strong>
          </div>
        ) : null}
        <label>
          {t('desktop.account')}
          <input value={accountLabel} disabled />
        </label>
        <label>
          {t('desktop.amount')}
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        <label>
          {t('desktop.payment_date')}
          <input
            type="date"
            value={paymentDate}
            onChange={(e) => setPaymentDate(e.target.value)}
            required
          />
        </label>
        <label>
          {t('desktop.salary_month')}
          <input
            type="month"
            value={salaryMonth}
            onChange={(e) => setSalaryMonth(e.target.value)}
          />
        </label>
        <label>
          {t('desktop.remark')}
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          {t('desktop.attachment')}
          <input
            key={fileKey}
            type="file"
            onChange={(e) => setAttachment(e.target.files?.[0] || null)}
          />
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('desktop.cancel')}
          </button>
          <button type="submit" className="btn-primary" disabled={processing || !contract}>
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
