import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { storeStaffContract, type StaffContract } from '@/lib/business'

type Props = {
  open: boolean
  token: string
  companyId: string
  staffId: string | number
  contract: StaffContract | null
  onClose: () => void
  onSaved: () => Promise<void> | void
}

export function TerminateContractModal({
  open,
  token,
  companyId,
  staffId,
  contract,
  onClose,
  onSaved,
}: Props) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [terminationDate, setTerminationDate] = useState('')
  const [terminationReason, setTerminationReason] = useState('')

  useEffect(() => {
    if (!open) return
    setError(null)
    setTerminationDate('')
    setTerminationReason('')
  }, [open])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!contract) return
    setProcessing(true)
    setError(null)
    try {
      await storeStaffContract(token, companyId, staffId, {
        contract_id: contract.id,
        start_date: String(contract.start_date || '').slice(0, 10),
        end_date: contract.end_date ? String(contract.end_date).slice(0, 10) : null,
        monthly_salary: contract.monthly_salary ?? 0,
        company_account_id: contract.company_account_id ?? '',
        status: 'terminated',
        termination_date: terminationDate,
        termination_reason: terminationReason,
      })
      await onSaved()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('desktop.terminate_contract')}>
      <form onSubmit={(e) => void submit(e)} className="form-grid">
        {error ? <div className="alert-error">{error}</div> : null}
        <label>
          {t('desktop.termination_date')}
          <input
            type="date"
            value={terminationDate}
            onChange={(e) => setTerminationDate(e.target.value)}
            required
          />
        </label>
        <label>
          {t('desktop.termination_reason')}
          <textarea
            rows={3}
            value={terminationReason}
            onChange={(e) => setTerminationReason(e.target.value)}
            required
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
