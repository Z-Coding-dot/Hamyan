import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { formatMoney } from '@/lib/companyDashboard'
import { localizeCurrency } from '@/lib/currency'
import type { BusinessAccountRow } from '@/lib/user'

type Props = {
  open: boolean
  onClose: () => void
  accounts: BusinessAccountRow[]
  onSubmit: (payload: {
    from_account_id: number
    to_account_id: number
    amount: string
    remark?: string
  }) => Promise<void>
}

export function TransferBetweenAccountsModal({ open, onClose, accounts, onSubmit }: Props) {
  const { t } = useTranslation()
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const active = useMemo(() => accounts.filter((acc) => acc.status !== false), [accounts])
  const fromAccount = active.find((acc) => String(acc.id) === fromId)
  const fromCurrency = String(fromAccount?.currency || '').toLowerCase()
  const toOptions = active.filter((acc) => {
    if (String(acc.id) === fromId) return false
    if (!fromCurrency) return false
    return String(acc.currency || '').toLowerCase() === fromCurrency
  })

  useEffect(() => {
    if (!open) {
      setFromId('')
      setToId('')
      setAmount('')
      setRemark('')
      setError(null)
      setProcessing(false)
    }
  }, [open])

  useEffect(() => {
    if (!toId || !fromCurrency) return
    const valid = active.some(
      (acc) =>
        String(acc.id) === toId &&
        String(acc.id) !== fromId &&
        String(acc.currency || '').toLowerCase() === fromCurrency,
    )
    if (!valid) setToId('')
  }, [active, fromId, fromCurrency, toId])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!fromAccount || !toId) return
    const value = Number(amount)
    if (!(value > 0)) return
    if (Number(fromAccount.balance || 0) < value) {
      setError(t('desktop.transfer_insufficient_balance'))
      return
    }
    setProcessing(true)
    setError(null)
    try {
      await onSubmit({
        from_account_id: fromAccount.id,
        to_account_id: Number(toId),
        amount,
        remark: remark.trim() || undefined,
      })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('desktop.transfer_between_accounts')}>
      <form onSubmit={(e) => void submit(e)} className="form-grid">
        {error ? <div className="alert-error">{error}</div> : null}
        <p className="muted">{t('desktop.transfer_same_currency_only')}</p>
        <label>
          {t('desktop.transfer_from_account')}
          <select value={fromId} onChange={(e) => setFromId(e.target.value)} required>
            <option value="">{t('desktop.select')}</option>
            {active.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name || t('desktop.account')} — {formatMoney(acc.balance)}{' '}
                {localizeCurrency(acc.currency, t)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('desktop.transfer_to_account')}
          <select value={toId} onChange={(e) => setToId(e.target.value)} required disabled={!fromId}>
            <option value="">{t('desktop.select')}</option>
            {toOptions.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name || t('desktop.account')} — {formatMoney(acc.balance)}{' '}
                {localizeCurrency(acc.currency, t)}
              </option>
            ))}
          </select>
        </label>
        {fromAccount ? (
          <p className="muted">
            {t('desktop.balance')}: {formatMoney(fromAccount.balance)}{' '}
            {localizeCurrency(fromAccount.currency, t)}
          </p>
        ) : null}
        <label>
          {t('desktop.amount')}
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        <label>
          {t('desktop.remark')}
          <input value={remark} onChange={(e) => setRemark(e.target.value)} />
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={processing}>
            {t('desktop.cancel')}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={processing || !fromId || !toId || toOptions.length === 0}
          >
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
