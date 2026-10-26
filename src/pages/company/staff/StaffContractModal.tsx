import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  fetchBusinessAccountsList,
  storeStaffContract,
  type StaffContract,
  type StaffContractPayload,
} from '@/lib/business'
import type { BusinessAccountRow } from '@/lib/user'
import { isBusinessAccountActive } from '@/lib/user'

type Props = {
  open: boolean
  token: string
  companyId: string
  staffId: string | number
  initialContract: StaffContract | null
  latestContract: StaffContract | null
  onClose: () => void
  onSaved: () => Promise<void> | void
}

export function StaffContractModal({
  open,
  token,
  companyId,
  staffId,
  initialContract,
  latestContract,
  onClose,
  onSaved,
}: Props) {
  const { t } = useTranslation()
  const [accounts, setAccounts] = useState<BusinessAccountRow[]>([])
  const [accountsLoading, setAccountsLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [monthlySalary, setMonthlySalary] = useState('')
  const [accountId, setAccountId] = useState('')

  useEffect(() => {
    if (!open) return
    setError(null)
    setStartDate(initialContract?.start_date?.slice(0, 10) || '')
    setEndDate(initialContract?.end_date?.slice(0, 10) || '')
    setMonthlySalary(
      initialContract?.monthly_salary !== null && initialContract?.monthly_salary !== undefined
        ? String(initialContract.monthly_salary)
        : '',
    )
    setAccountId(
      initialContract?.company_account_id !== null &&
        initialContract?.company_account_id !== undefined
        ? String(initialContract.company_account_id)
        : '',
    )
    setAccountsLoading(true)
    void fetchBusinessAccountsList(token, companyId)
      .then((rows) => setAccounts(rows.filter(isBusinessAccountActive)))
      .catch(() => setAccounts([]))
      .finally(() => setAccountsLoading(false))
  }, [open, initialContract, token, companyId])

  const selectedAccount = useMemo(
    () => accounts.find((row) => String(row.id) === String(accountId)),
    [accounts, accountId],
  )

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    setError(null)
    try {
      const payload: StaffContractPayload = {
        start_date: startDate,
        end_date: endDate || null,
        status: 'active',
        monthly_salary: monthlySalary,
        company_account_id: accountId,
      }
      if (initialContract?.id) {
        payload.contract_id = initialContract.id
      }
      await storeStaffContract(token, companyId, staffId, payload)
      await onSaved()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        initialContract ? t('desktop.edit_staff_contract') : t('desktop.add_staff_contract')
      }
      wide
    >
      <form onSubmit={(e) => void submit(e)} className="form-grid">
        {error ? <div className="alert-error">{error}</div> : null}
        {!initialContract && latestContract ? (
          <div className="alert-info">{t('desktop.previous_contract_info')}</div>
        ) : null}
        <label>
          {t('desktop.start_date')}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
        </label>
        <label>
          {t('desktop.end_date')}
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
        <label>
          {t('desktop.monthly_salary')}
          <input
            type="number"
            min="0"
            step="0.01"
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(e.target.value)}
            required
          />
        </label>
        <label>
          {t('desktop.select_account')}
          <Select
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            required
            disabled={accountsLoading}
          >
            <option value="">
              {accountsLoading ? t('desktop.loading') : t('desktop.select')}
            </option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name || '—'} - {localizeCurrency(account.currency, t)}
              </option>
            ))}
          </Select>
        </label>
        {selectedAccount ? (
          <p className="muted">
            {t('desktop.currency')}: <strong>{localizeCurrency(selectedAccount.currency, t)}</strong>
          </p>
        ) : null}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('desktop.cancel')}
          </button>
          <button type="submit" className="btn-primary" disabled={processing || !accountId}>
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
