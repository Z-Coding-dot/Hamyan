import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'

import logoFallbackUrl from '@/assets/logo.png'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { localizeCurrency } from '@/lib/currency'
import { formatJalaliSlashFromYmd } from '@/lib/datetime'
import type { InvoicePaperSize, InvoicePrintTheme } from '@/lib/invoicePrint'
import type { BusinessCompany, BusinessCompanyProfile } from '@/lib/user'

export type PackageSaleBillData = {
  id?: number | null
  customerName: string
  customerPhone?: string | null
  packageName: string
  dataAmount: number
  dataUnit: string
  validityAmount?: number
  validityUnit?: string
  startDate: string
  endDate: string
  price: number
  paid: number
  remaining: number
  currency?: string | null
  note?: string | null
}

type Props = {
  sale: PackageSaleBillData
  company?: BusinessCompany | null
  profile?: BusinessCompanyProfile | Record<string, unknown> | null
  printPaperSize?: InvoicePaperSize
  printTheme?: InvoicePrintTheme
}

function fmt(value: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

export const PackageSaleBill = forwardRef<HTMLDivElement, Props>(function PackageSaleBill(
  { sale, company, profile, printPaperSize = 'a5', printTheme = 'classic' },
  ref,
) {
  const { t } = useTranslation()
  const logoCached = useCachedAsset(company?.logo)
  const logoSrc = logoCached || logoFallbackUrl
  const profileRecord = (profile || {}) as BusinessCompanyProfile
  const address = String(profileRecord.address_dari || '—')
  const phone = String(profileRecord.phone || '—')
  const slogan = String(profileRecord.slogan || '').trim() || t('desktop.brand_slogan')
  const currency = localizeCurrency(sale.currency || 'afn', t)
  const unit = sale.dataUnit === 'mb' ? t('desktop.package_unit_mb') : t('desktop.package_unit_gb')
  const validity =
    sale.validityUnit === 'month' ? t('desktop.package_unit_month') : t('desktop.package_unit_day')
  const details = [
    `${t('desktop.package_amount')}: ${fmt(sale.dataAmount)} ${unit}`,
    ...(Number(sale.validityAmount) > 0
      ? [`${t('desktop.package_validity')}: ${sale.validityAmount} ${validity}`]
      : []),
    `${t('desktop.package_start')}: ${formatJalaliSlashFromYmd(sale.startDate)}`,
    `${t('desktop.package_end')}: ${formatJalaliSlashFromYmd(sale.endDate)}`,
  ].join(' | ')

  return (
    <div className="sale-invoice-wrap">
      <div
        className={`invoice-container printable print-paper-${printPaperSize} invoice-theme-${printTheme}`}
        ref={ref}
      >
        <div className="invoice-theme-accent invoice-theme-accent--top" aria-hidden />
        <div className="invoice-header text-center">
          <img src={logoSrc} alt={company?.name || 'Hamyan'} className="invoice-logo centered-logo" />
          <h2 className="company-name mt-2">{company?.name || '—'}</h2>
          <p className="small-text">{slogan}</p>
          <h5 className="invoice-title-badge">{t('desktop.package_invoice_title')}</h5>
        </div>

        <div className="invoice-info">
          <p>
            <strong>{t('desktop.customer_name')}:</strong> {sale.customerName}
            {sale.customerPhone ? <span dir="ltr"> · {sale.customerPhone}</span> : null}
          </p>
          <p>
            <strong>{t('desktop.invoice_number')}:</strong> {sale.id ?? '—'}
          </p>
          <p>
            <strong>{t('desktop.date')}:</strong> {formatJalaliSlashFromYmd(sale.startDate)}
            <span className="ms-2">
              <strong>{t('desktop.currency')}:</strong> {currency}
            </span>
          </p>
        </div>

        <div className="invoice-table">
          <table className="invoice-bill-table table table-bordered table-sm text-center">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>{t('desktop.package_name')}</th>
                <th>{t('desktop.quantity')}</th>
                <th>
                  {t('desktop.unit_price')} <small>({currency})</small>
                </th>
                <th>
                  {t('desktop.total')} <small>({currency})</small>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>
                  <div>{sale.packageName}</div>
                  <div className="small text-muted mt-1 text-end">{details}</div>
                </td>
                <td>1</td>
                <td>{fmt(sale.price)}</td>
                <td>{fmt(sale.price)}</td>
              </tr>
            </tbody>
          </table>

          <div className="invoice-list-80">
            <div className="invoice-list-80-row">
              <div className="invoice-list-80-head">
                <span>1.</span>
                <span>{sale.packageName}</span>
              </div>
              <div className="invoice-list-80-meta small text-muted">{details}</div>
              <div className="invoice-list-80-meta">
                <div>
                  {t('desktop.quantity')}: 1
                </div>
                <span>
                  {t('desktop.unit_price_short')}: {fmt(sale.price)} {currency}
                </span>
              </div>
              <div className="invoice-list-80-total">
                {t('desktop.total')}: {fmt(sale.price)} {currency}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 invoice-summary">
          <h6 className="mb-2">{t('desktop.invoice_summary')}</h6>
          <div className="invoice-total border-top px-2">
            <p className="mb-0 border-bottom">
              <strong>{t('desktop.total')}:</strong> {fmt(sale.price)} {currency}
            </p>
            <p className="mb-0 border-bottom">
              <strong>{t('desktop.paid_amount')}:</strong> {fmt(sale.paid)} {currency}
            </p>
            <p className="mb-0 border-bottom">
              <strong>{t('desktop.remaining_balance')}:</strong> {fmt(sale.remaining)} {currency}
            </p>
          </div>
        </div>

        {sale.note ? (
          <div className="invoice-note">
            <strong>{t('desktop.note')}:</strong>
            <p>{sale.note}</p>
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
        <div className="invoice-theme-accent invoice-theme-accent--bottom" aria-hidden />
      </div>
    </div>
  )
})
