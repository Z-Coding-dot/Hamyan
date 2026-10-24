import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { SearchableSelect } from '@/components/inputs/SearchableSelect'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  accountDisplayName,
  fetchCounterparties,
  storeCounterpartyTransaction,
  type CounterpartyRow,
  type UserAccountRow,
} from '@/lib/user'

type LockedCounterparty = {
  id: number
  name: string
  customer_id?: number | string | null
}

type Props = {
  open: boolean
  direction: 'credit' | 'debit'
  token: string
  accounts: UserAccountRow[]
  locale: string
  lockedCounterparty?: LockedCounterparty | null
  onClose: () => void
  onDone: () => void
}

export function CounterpartyFlowModal({
  open,
  direction,
  token,
  accounts,
  locale,
  lockedCounterparty = null,
  onClose,
  onDone,
}: Props) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [counterparties, setCounterparties] = useState<CounterpartyRow[]>([])
  const [counterpartyId, setCounterpartyId] = useState('')
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [transactionDate, setTransactionDate] = useState('')

  const allowedAccounts = accounts

  const loadCounterparties = async () => {
    try {
      const data = await fetchCounterparties(token, '')
      const rows = data.counterparties ?? []
      setCounterparties(rows)
      setCounterpartyId((prev) => prev || (rows[0] ? String(rows[0].id) : ''))
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  useEffect(() => {
    if (!open) return
    setError(null)
    setAmount('')
    setNote('')
    setTransactionDate('')
    setAccountId(allowedAccounts[0] ? String(allowedAccounts[0].id) : '')
    if (lockedCounterparty) {
      setCounterparties([
        {
          id: lockedCounterparty.id,
          customer_id: lockedCounterparty.customer_id ?? '',
          name: lockedCounterparty.name,
        },
      ])
      setCounterpartyId(String(lockedCounterparty.id))
      return
    }
    void loadCounterparties()
  }, [open, lockedCounterparty?.id])

  useEffect(() => {
    if (!open) return
    if (!allowedAccounts.some((item) => String(item.id) === accountId)) {
      setAccountId(allowedAccounts[0] ? String(allowedAccounts[0].id) : '')
    }
  }, [allowedAccounts, accountId, open])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!counterpartyId || !accountId || !amount) return
    setProcessing(true)
    setError(null)
    try {
      await storeCounterpartyTransaction(token, {
        counterparty_id: Number(counterpartyId),
        user_account_id: Number(accountId),
        type: direction,
        amount: Number(amount),
        transaction_date: transactionDate || undefined,
        note: note.trim() || undefined,
      })
      onDone()
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
        lockedCounterparty
          ? `${direction === 'credit' ? t('desktop.cp_incoming') : t('desktop.cp_outgoing')} (${lockedCounterparty.name})`
          : direction === 'credit'
            ? t('desktop.cp_incoming')
            : t('desktop.cp_outgoing')
      }
      wide
    >
      <form className="companies-create-form" onSubmit={(e) => void submit(e)}>
        {error ? <div className="alert-error">{error}</div> : null}

        {lockedCounterparty ? (
          <div className="form-field">
            <label>{t('desktop.counterparty')}</label>
            <input value={lockedCounterparty.name} readOnly />
          </div>
        ) : (
          <div className="form-field">
            <SearchableSelect
              label={t('desktop.counterparty')}
              value={counterpartyId}
              onChange={setCounterpartyId}
              required
              placeholder={t('desktop.select')}
              options={counterparties.map((item) => ({
                value: String(item.id),
                label: item.name || '—',
              }))}
            />
          </div>
        )}

        <div className="form-field">
          <SearchableSelect
            label={t('desktop.account')}
            value={accountId}
            onChange={setAccountId}
            required
            placeholder={t('desktop.select')}
            options={allowedAccounts.map((item) => ({
              value: String(item.id),
              label: `${accountDisplayName(item, locale)} (${localizeCurrency(item.currency || 'AFN', t)})`,
            }))}
          />
        </div>

        <div className="form-field">
          <label>{t('desktop.amount')}</label>
          <input
            type="number"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-field">
          <label>{t('desktop.date')}</label>
          <JalaliDatePicker value={transactionDate} onChange={setTransactionDate} />
        </div>

        <div className="form-field">
          <label>{t('desktop.description')}</label>
          <input value={note} onChange={(e) => setNote(e.target.value)} />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={processing}>
            {t('desktop.cancel')}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={processing || !counterpartyId || !accountId}
          >
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
