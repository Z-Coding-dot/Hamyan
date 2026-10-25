import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { SearchableSelect } from '@/components/inputs/SearchableSelect'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  accountDisplayName,
  exchangeUserAccounts,
  type UserAccountRow,
} from '@/lib/user'

type Props = {
  open: boolean
  token: string
  accounts: UserAccountRow[]
  locale: string
  onClose: () => void
  onDone: () => void
}

function roundMoney(value: number): number {
  return Math.round(value * 10000) / 10000
}

export function CurrencyExchangeModal({ open, token, accounts, locale, onClose, onDone }: Props) {
  const { t } = useTranslation()
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [rate, setRate] = useState('')
  const [rateDirection, setRateDirection] = useState<'from_to' | 'to_from'>('from_to')
  const [date, setDate] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fromAccount = accounts.find((item) => String(item.id) === fromId)
  const toAccount = accounts.find((item) => String(item.id) === toId)

  const fromOptions = accounts.map((item) => ({
    value: String(item.id),
    label: `${accountDisplayName(item, locale)} (${localizeCurrency(item.currency || 'AFN', t)})`,
  }))

  const toOptions = accounts
    .filter((item) => String(item.id) !== fromId)
    .map((item) => ({
      value: String(item.id),
      label: `${accountDisplayName(item, locale)} (${localizeCurrency(item.currency || 'AFN', t)})`,
    }))

  useEffect(() => {
    if (!open) return
    setError(null)
    setAmount('')
    setRate('')
    setNote('')
    setDate('')
    setRateDirection('from_to')
    const first = accounts[0]
    const second = accounts.find((item) => item.id !== first?.id)
    setFromId(first ? String(first.id) : '')
    setToId(second ? String(second.id) : '')
  }, [open, accounts])

  useEffect(() => {
    if (!open) return
    if (toId && toId === fromId) {
      const next = accounts.find((item) => String(item.id) !== fromId)
      setToId(next ? String(next.id) : '')
    }
  }, [fromId, toId, accounts, open])

  const fromAmount = Number(amount)
  const rateNum = Number(rate)
  const toAmount = useMemo(() => {
    if (!(fromAmount > 0) || !(rateNum > 0)) return 0
    return rateDirection === 'from_to' ? roundMoney(fromAmount * rateNum) : roundMoney(fromAmount / rateNum)
  }, [fromAmount, rateNum, rateDirection])

  const fromCode = localizeCurrency(fromAccount?.currency || 'AFN', t)
  const toCode = localizeCurrency(toAccount?.currency || 'AFN', t)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!fromId || !toId || !(fromAmount > 0) || !(rateNum > 0) || !(toAmount > 0)) return
    setBusy(true)
    setError(null)
    try {
      await exchangeUserAccounts(token, {
        from_account_id: Number(fromId),
        to_account_id: Number(toId),
        amount: fromAmount,
        rate: rateNum,
        rate_direction: rateDirection,
        date: date || undefined,
        description: note.trim() || undefined,
      })
      onDone()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('desktop.hy_fx_title')} wide className="hy-party-dialog hy-finance-dialog hy-fx-dialog">
      <form className="hy-fx hy-party-form" onSubmit={(e) => void submit(e)}>
        <div className="hy-party-form__intro"><span aria-hidden="true"><i className="fa-solid fa-right-left" /></span><p>{t('desktop.hy_fx_form_note')}</p></div>
        {error ? <div className="alert-error">{error}</div> : null}

        <div className="hy-fx__pair">
          <SearchableSelect
            label={t('desktop.hy_fx_from')}
            value={fromId}
            onChange={setFromId}
            required
            options={fromOptions}
            placeholder={t('desktop.select')}
          />
          <div className="hy-fx__swap" aria-hidden>
            <i className={`fa-solid ${locale === 'en' ? 'fa-arrow-right-long' : 'fa-arrow-left-long'}`} />
          </div>
          <SearchableSelect
            label={t('desktop.hy_fx_to')}
            value={toId}
            onChange={setToId}
            required
            options={toOptions}
            placeholder={t('desktop.select')}
          />
        </div>

        <div className="hy-fx__amount">
          <label>
            {t('desktop.hy_fx_amount_from')}
            <input
              id="exchange-amount"
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              min="0.0001"
              step="any"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <small>
              {fromCode}
              {fromAccount ? ` · ${t('desktop.balance')}: ${Number(fromAccount.current_balance ?? 0).toLocaleString('en-US')}` : ''}
            </small>
          </label>
          <div className="hy-fx__result">
            <span>{t('desktop.hy_fx_amount_to')}</span>
            <strong>
              <bdi>{toAmount > 0 ? toAmount.toLocaleString('en-US') : '—'}</bdi> {toCode}
            </strong>
          </div>
        </div>

        <div className="hy-fx__rate">
          <div className="hy-fx__rate-modes" role="group" aria-label={t('desktop.hy_fx_rate')}>
            <button
              type="button"
              className={rateDirection === 'from_to' ? 'is-on' : undefined}
              aria-pressed={rateDirection === 'from_to'}
              onClick={() => setRateDirection('from_to')}
            >
              {t('desktop.hy_fx_rate_from_to', { from: fromCode, to: toCode })}
            </button>
            <button
              type="button"
              className={rateDirection === 'to_from' ? 'is-on' : undefined}
              aria-pressed={rateDirection === 'to_from'}
              onClick={() => setRateDirection('to_from')}
            >
              {t('desktop.hy_fx_rate_to_from', { from: fromCode, to: toCode })}
            </button>
          </div>
          <label>
            {t('desktop.hy_fx_rate')}
            <input
              id="exchange-rate"
              type="number"
              inputMode="decimal"
              min="0.0000001"
              step="any"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
              required
            />
            <small>
              {rateDirection === 'from_to'
                ? t('desktop.hy_fx_rate_hint_from_to', { from: fromCode, to: toCode })
                : t('desktop.hy_fx_rate_hint_to_from', { from: fromCode, to: toCode })}
            </small>
          </label>
        </div>

        <div className="hy-party-form__grid">
        <div className="form-field">
          <label htmlFor="exchange-date">{t('desktop.date')}</label>
          <JalaliDatePicker id="exchange-date" value={date} onChange={setDate} allowEmpty />
        </div>
        <div className="form-field">
          <label htmlFor="exchange-note">{t('desktop.description')}</label>
          <input id="exchange-note" value={note} onChange={(e) => setNote(e.target.value)} />
        </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
            {t('desktop.cancel')}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={busy || accounts.length < 2 || !(fromAmount > 0) || !(rateNum > 0) || !(toAmount > 0)}
          >
            {busy ? t('desktop.processing') : t('desktop.hy_fx_submit')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
