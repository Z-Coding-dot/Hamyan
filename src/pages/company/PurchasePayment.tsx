import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { NumericStepper } from '@/components/ui/NumericStepper'
import type { PurchaseShow } from '@/lib/business'
import { localizeCurrency } from '@/lib/currency'

type Props = {
  invoice: PurchaseShow
  busy?: boolean
  error?: string | null
  onFinalSubmit: (payload: {
    paidAmount: number
    mode: 'full' | 'partial' | 'remaining'
  }) => Promise<void> | void
  onBackToItems: () => void
}

function toNum(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function formatAmount(value: unknown) {
  return toNum(value).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
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

export function PurchasePayment({
  invoice,
  busy = false,
  error = null,
  onFinalSubmit,
  onBackToItems,
}: Props) {
  const { t } = useTranslation()
  const [paidAmount, setPaidAmount] = useState('')
  const [localError, setLocalError] = useState('')

  const currency = localizeCurrency(invoice.currency || 'afn', t)
  const isWithoutVendor = !invoice.vendor_id
  const total = useMemo(() => toNum(invoice.total_price), [invoice.total_price])
  const alreadyPaid = useMemo(() => toNum(invoice.payment?.amount), [invoice.payment?.amount])
  const remainingAmount = Math.max(0, total - alreadyPaid)
  const paid = toNum(paidAmount)
  const displayError = localError || error

  const handlePartial = () => {
    if (!(paid > 0)) {
      setLocalError(t('desktop.paid_amount_positive'))
      return
    }
    if (paid > remainingAmount) {
      setLocalError(t('desktop.paid_amount_not_exceed'))
      return
    }
    setLocalError('')
    void onFinalSubmit({ paidAmount: paid, mode: 'partial' })
  }

  const handleFull = () => {
    if (!(remainingAmount > 0)) {
      setLocalError(t('desktop.nothing_to_pay'))
      return
    }
    setLocalError('')
    void onFinalSubmit({ paidAmount: remainingAmount, mode: 'full' })
  }

  const handleRemaining = () => {
    if (!(remainingAmount > 0)) {
      setLocalError(t('desktop.nothing_to_pay'))
      return
    }
    setLocalError('')
    void onFinalSubmit({ paidAmount: 0, mode: 'remaining' })
  }

  return (
    <div className="sale-payment party-summary no-print" dir="rtl">
      <h5 className="sale-payment__title">{t('desktop.payment')}</h5>

      {displayError ? <div className="alert-error">{displayError}</div> : null}

      <div className="sale-payment__total" style={{ textAlign: 'right' }}>
        <p>
          <strong>{t('desktop.total')}:</strong> {formatAmount(total)} {currency}
        </p>
        <p>
          <strong>{t('desktop.paid_amount')}:</strong> {formatAmount(alreadyPaid)} {currency}
        </p>
        <p>
          <strong>{t('desktop.remaining_balance')}:</strong> {formatAmount(remainingAmount)}{' '}
          {currency}
        </p>
      </div>

      {isWithoutVendor ? (
        <div className="sale-payment__hint">{t('desktop.full_auto_payment_no_vendor')}</div>
      ) : (
        <label className="sale-payment__paid">
          {t('desktop.enter_paid_amount')} ({currency})
          <NumericStepper
            value={paidAmount}
            disabled={busy || remainingAmount <= 0}
            onChange={(value) => {
              setPaidAmount(normalizeDigits(value || '').replace(/[^0-9.]/g, ''))
              setLocalError('')
            }}
            onDecrement={() => {
              setPaidAmount(String(Math.max(0, Math.round((paid - 1) * 100) / 100)))
              setLocalError('')
            }}
            onIncrement={() => {
              setPaidAmount(String(Math.min(remainingAmount, Math.round((paid + 1) * 100) / 100)))
              setLocalError('')
            }}
            inputProps={{ min: 0, step: 'any', placeholder: '0' }}
          />
        </label>
      )}

      <div className="sale-payment__actions">
        {isWithoutVendor ? (
          <button
            type="button"
            className="btn-primary sale-payment__btn"
            onClick={handleFull}
            disabled={busy || !(remainingAmount > 0)}
          >
            {busy ? t('desktop.processing') : t('desktop.perform_payment')}
          </button>
        ) : (
          <>
            <button
              type="button"
              className="btn-primary sale-payment__btn"
              onClick={handleFull}
              disabled={busy || !(remainingAmount > 0)}
            >
              {busy ? t('desktop.processing') : t('desktop.finalize_full_payment')}
            </button>
            <button
              type="button"
              className="btn-primary sale-payment__btn"
              onClick={handlePartial}
              disabled={
                busy || !(remainingAmount > 0) || !(paid > 0) || paid > remainingAmount
              }
            >
              {busy ? t('desktop.processing') : t('desktop.finalize_partial_payment')}
            </button>
            <button
              type="button"
              className="btn-secondary sale-payment__btn"
              onClick={handleRemaining}
              disabled={busy || !(remainingAmount > 0)}
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
