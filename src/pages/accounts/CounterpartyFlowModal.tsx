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
  const selectedAccount = allowedAccounts.find((account) => String(account.id) === accountId)

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
      className={`hy-party-dialog hy-flow-dialog ${direction === 'credit' ? 'is-in' : 'is-out'}`}
    >
      <form className="companies-create-form hy-party-form" onSubmit={(e) => void submit(e)}>
        <div className="hy-party-form__intro"><span aria-hidden="true"><i className={`fa-solid ${direction === 'credit' ? 'fa-arrow-down' : 'fa-arrow-up'}`} /></span><p>{t(direction === 'credit' ? 'desktop.hy_cp_incoming_desc' : 'desktop.hy_cp_outgoing_desc')}</p></div>
        {error ? <div className="alert-error" role="alert">{error}</div> : null}
        <div className="hy-party-form__grid">

        {lockedCounterparty ? (
          <div className="form-field">
            <label htmlFor="cp-flow-person">{t('desktop.counterparty')}</label>
            <input id="cp-flow-person" value={lockedCounterparty.name} readOnly />
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

        <div className="form-field hy-party-form__full">
          <label htmlFor="cp-flow-amount">{t('desktop.amount')} <span className="hy-required" aria-hidden="true">*</span></label>
          <div className="hy-flow-amount">
          <input
            id="cp-flow-amount"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            min="1"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
          <span>{localizeCurrency(selectedAccount?.currency || 'AFN', t)}</span>
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="cp-flow-date">{t('desktop.date')}</label>
          <JalaliDatePicker id="cp-flow-date" value={transactionDate} onChange={setTransactionDate} />
        </div>

        <div className="form-field">
          <label htmlFor="cp-flow-note">{t('desktop.description')}</label>
          <input id="cp-flow-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
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
            <i className="fa-solid fa-check" aria-hidden="true" />
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
