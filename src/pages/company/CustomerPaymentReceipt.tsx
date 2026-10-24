import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

import logoFallbackUrl from '@/assets/logo.png'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import type { PartyPaymentRow } from '@/lib/business'
import { localizeCurrency } from '@/lib/currency'
import { formatJalaliSlash } from '@/lib/datetime'
import type { InvoicePaperSize } from '@/lib/invoicePrint'
import type { BusinessCompany, BusinessCompanyProfile } from '@/lib/user'

type Props = {
  payment: PartyPaymentRow
  customerName: string
  company: BusinessCompany
  profile?: BusinessCompanyProfile | Record<string, unknown> | null
  printPaperSize?: InvoicePaperSize
}

function num(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function fmt(v: unknown) {
  return num(v).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export const CustomerPaymentReceipt = forwardRef<HTMLDivElement, Props>(
  function CustomerPaymentReceipt(
    { payment, customerName, company, profile, printPaperSize = 'a5' },
    ref,
  ) {
    const { t } = useTranslation()
    const logoCached = useCachedAsset(company.logo)
    const logoSrc = logoCached || logoFallbackUrl
    const currLabel = localizeCurrency(payment.currency, t)
    const amount = num(payment.amount)
    const description = String(payment.description || '').trim()
    const kindLabel = payment.invoice_id
      ? `${t('desktop.tx_sale_invoice_payment')} #${payment.invoice_id}`
      : amount < 0
        ? t('desktop.payment_to_customer')
        : t('desktop.general_payment')
    const address = String(
      (profile as { address_dari?: string | null; address?: string | null } | null)?.address_dari ||
        (profile as { address?: string | null } | null)?.address ||
        '—',
    )
    const phone = String((profile as { phone?: string | null } | null)?.phone || '—')
    const slogan =
      String((profile as { slogan?: string | null } | null)?.slogan || '').trim() ||
      t('desktop.brand_slogan')

    return (
      <div
        className={`invoice-container printable print-paper-${printPaperSize} payment-receipt`}
        ref={ref}
      >
        <div className="invoice-header text-center">
          <img src={logoSrc} alt={company.name || 'Hamyan'} className="invoice-logo centered-logo" />
          <h2 className="company-name mt-2">{company.name}</h2>
          <p className="small-text">{slogan}</p>
          <h5>{t('desktop.payment_receipt')}</h5>
        </div>

        <div className="invoice-info">
          <p>
            <strong>{t('desktop.customer_name')}:</strong> {customerName || '—'}
          </p>
          <p>
            <strong>{t('desktop.payment_receipt_number')}:</strong> {payment.id}
          </p>
          <p>
            <strong>{t('desktop.date')}:</strong> {formatJalaliSlash(payment.created_at)}
            <span className="ms-2">
              <strong>{t('desktop.currency')}:</strong> {currLabel}
            </span>
          </p>
        </div>

        <div className="invoice-table">
          <table className="invoice-bill-table table table-bordered table-sm text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>{t('desktop.description')}</th>
                <th>{t('desktop.account')}</th>
                <th>
                  {t('desktop.amount')} <small>({currLabel})</small>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>{kindLabel}</td>
                <td>{payment.account_name || '—'}</td>
                <td>{fmt(amount)}</td>
              </tr>
            </tbody>
          </table>

          <div className="invoice-list-80">
            <div className="invoice-list-80-row">
              <div className="invoice-list-80-head">
                <span>1.</span>
                <span>{kindLabel}</span>
              </div>
              <div className="invoice-list-80-meta">
                <span>
                  {t('desktop.account')}: {payment.account_name || '—'}
                </span>
              </div>
              <div className="invoice-list-80-total">
                {t('desktop.amount')}: {fmt(amount)} {currLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 invoice-summary">
          <div className="invoice-total border-top px-2">
            <p className="mb-0 border-bottom">
              <strong>{t('desktop.paid_amount')}:</strong> {fmt(amount)} {currLabel}
            </p>
          </div>
        </div>

        {description ? (
          <div className="invoice-note">
            <strong>{t('desktop.remark')}:</strong>
            <p>{description}</p>
          </div>
        ) : null}

        <div className="invoice-footer">
          <p className="mb-0">
            {t('desktop.address')}: {address}
          </p>
          <p className="mb-0">
            {t('desktop.phone')}: {phone}
          </p>
        </div>
      </div>
    )
  },
)
