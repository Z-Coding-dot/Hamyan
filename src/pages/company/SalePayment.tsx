import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NumericStepper } from '@/components/ui/NumericStepper'
import type { SaleInvoiceShow } from '@/lib/business'
import { localizeCurrency } from '@/lib/currency'

type Props = {
  invoice: SaleInvoiceShow
  busy?: boolean
  error?: string | null
  onFinalSubmit: (payload: {
    paidAmount: number
    mode: 'full' | 'partial' | 'remaining' | 'without_customer'
    discountPercent: number
    discountAmount: number
  }) => Promise<void> | void
  onBackToItems: () => void
}

function toNum(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function round2(n: number) {
  return Math.round(n * 100) / 100
}

function normalizeDigits(value: string) {
  const map: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
    '٫': '.',
    '٬': '.',
  }
  return String(value).replace(/[\u06F0-\u06F9\u0660-\u0669\u066B\u066C]/g, (char) => map[char] || char)
}

export function SalePayment({ invoice, busy = false, error = null, onFinalSubmit, onBackToItems }: Props) {
  const { t } = useTranslation()
  const [paidAmount, setPaidAmount] = useState('')
  const [discountPercent, setDiscountPercent] = useState('')
  const [discountAmount, setDiscountAmount] = useState('')
  const [localError, setLocalError] = useState('')

  const currency = String(invoice.currency || 'afn').toLowerCase()
  const hasCustomer = Boolean(invoice.customer_id)
  const currLabel = localizeCurrency(currency, t)
  const total = toNum(invoice.total_price)
  const discountAmt = Math.min(total, Math.max(0, toNum(discountAmount)))
  const payable = round2(Math.max(0, total - discountAmt))
  const previousRemaining = invoice.customer_id ? Math.max(0, toNum(invoice.previous_remaining)) : 0
  const maxPayable = round2(payable + previousRemaining)
  const paid = toNum(paidAmount)
  const displayError = localError || error

  const applyDiscountPercent = (raw: string) => {
    const cleaned = normalizeDigits(raw || '').replace(/[^0-9.]/g, '')
    setDiscountPercent(cleaned)
    const pct = Math.min(100, Math.max(0, toNum(cleaned)))
    const amount = round2((total * pct) / 100)
    setDiscountAmount(amount > 0 ? String(amount) : '')
    setLocalError('')
  }

  const applyDiscountAmount = (raw: string) => {
    const cleaned = normalizeDigits(raw || '').replace(/[^0-9.]/g, '')
    setDiscountAmount(cleaned)
    const amount = Math.min(total, Math.max(0, toNum(cleaned)))
    const pct = total > 0 ? round2((amount / total) * 100) : 0
    setDiscountPercent(amount > 0 ? String(pct) : '')
    setLocalError('')
  }

  const discountPayload = () => ({
    discountPercent: Math.min(100, Math.max(0, toNum(discountPercent))),
    discountAmount: discountAmt,
  })

  const handlePartial = () => {
    if (!(paid > 0)) {
      setLocalError(t('desktop.paid_amount_positive'))
      return
    }
    if (paid > maxPayable) {
      setLocalError(t('desktop.paid_amount_not_exceed'))
      return
    }
    setLocalError('')
    void onFinalSubmit({ paidAmount: paid, mode: 'partial', ...discountPayload() })
  }

  const handleFull = () => {
    setLocalError('')
    void onFinalSubmit({
      paidAmount: payable,
      mode: hasCustomer ? 'full' : 'without_customer',
      ...discountPayload(),
    })
  }

  const handleRemaining = () => {
    setLocalError('')
    void onFinalSubmit({ paidAmount: 0, mode: 'remaining', ...discountPayload() })
  }

  const discountHint = useMemo(() => {
    if (!(discountAmt > 0)) return null
    return `${t('desktop.discount')}: ${discountAmt.toLocaleString('en-US')} ${currLabel}`
  }, [discountAmt, currLabel, t])

  return (
    <div className="sale-payment party-summary" dir="rtl">
      <h5 className="sale-payment__title">{t('desktop.payment')}</h5>

      {displayError ? <div className="alert-error">{displayError}</div> : null}

      <div className="sale-payment__total">
        <strong>{t('desktop.total')}:</strong>{' '}
        {Math.round(total).toLocaleString('en-US')} {currLabel}
      </div>

      <div className="sale-payment__discount">
        <label>
          {t('desktop.discount_percent')}
          <input
            type="number"
            min={0}
            max={100}
            step="0.01"
            disabled={busy || total <= 0}
            value={discountPercent}
            onChange={(e) => applyDiscountPercent(e.target.value)}
            placeholder="0"
          />
        </label>
        <label>
          {t('desktop.discount_amount')}
          <input
            type="number"
            min={0}
            max={total}
            step="0.01"
            disabled={busy || total <= 0}
            value={discountAmount}
            onChange={(e) => applyDiscountAmount(e.target.value)}
            placeholder="0"
          />
        </label>
      </div>

      {discountHint ? <div className="sale-payment__hint">{discountHint}</div> : null}

      <div className="sale-payment__total">
        <strong>{t('desktop.total_payable')}:</strong>{' '}
        {Math.round(payable).toLocaleString('en-US')} {currLabel}
      </div>

      {hasCustomer && previousRemaining > 0 ? (
        <div className="sale-payment__total">
          <strong>{t('desktop.previous_remaining')}:</strong>{' '}
          {previousRemaining.toLocaleString('en-US')} {currLabel}
        </div>
      ) : null}

      {hasCustomer && previousRemaining > 0 ? (
        <div className="sale-payment__hint">{t('desktop.paid_amount_covers_previous_hint')}</div>
      ) : null}

      {!hasCustomer ? (
        <div className="sale-payment__hint">
          {t('desktop.without_customer_payment_hint')}
        </div>
      ) : null}

      {hasCustomer ? (
        <label className="sale-payment__paid">
          {t('desktop.paid_amount')} ({currLabel})
          <NumericStepper
            value={paidAmount}
            disabled={busy}
            onChange={(value) => {
              setPaidAmount(normalizeDigits(value || '').replace(/[^0-9.]/g, ''))
              setLocalError('')
            }}
            onDecrement={() => {
              const next = Math.max(0, paid - 0.01)
              setPaidAmount(next.toFixed(2))
              setLocalError('')
            }}
            onIncrement={() => {
              const next = paid + 0.01
              setPaidAmount(next.toFixed(2))
              setLocalError('')
            }}
            inputProps={{
              min: 0,
              step: 'any',
              placeholder: t('desktop.enter_paid_amount'),
            }}
          />
        </label>
      ) : null}

      <div className="sale-payment__actions">
        {!hasCustomer ? (
          <button
            type="button"
            className="btn-primary sale-payment__btn"
            onClick={handleFull}
            disabled={busy || total <= 0}
          >
            {busy ? t('desktop.processing') : t('desktop.complete_without_customer')}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn-primary sale-payment__btn"
              onClick={handleFull}
              disabled={busy || total <= 0}
            >
              {busy ? t('desktop.processing') : t('desktop.finalize_full_payment')}
            </button>

            <button
              type="button"
              className="btn-primary sale-payment__btn"
              onClick={handlePartial}
              disabled={busy || !(paid > 0) || paid > maxPayable}
            >
              {busy ? t('desktop.processing') : t('desktop.finalize_partial_payment')}
            </button>

            <button
              type="button"
              className="btn-primary sale-payment__btn sale-payment__btn--amber"
              onClick={handleRemaining}
              disabled={busy || total <= 0}
            >
              {busy ? t('desktop.processing') : t('desktop.finalize_remaining_only')}
            </button>
          </>
        )}

        <button
          type="button"
          className="btn-secondary sale-payment__btn"
          onClick={onBackToItems}
          disabled={busy}
        >
          {t('desktop.add_more_item')}
        </button>
      </div>
    </div>
  )
}
