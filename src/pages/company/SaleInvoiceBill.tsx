import { forwardRef, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { localizeCurrency } from '@/lib/currency'

import logoFallbackUrl from '@/assets/logo.png'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import type { QuickSaleExchangeRateContext, SaleInvoiceItemRow, SaleInvoiceShow } from '@/lib/business'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { formatJalaliSlash } from '@/lib/datetime'
import { formatQty } from '@/lib/companyDashboard'
import type { InvoicePaperSize, InvoicePrintTheme } from '@/lib/invoicePrint'
import type { BusinessCompany } from '@/lib/user'

type Props = {
  invoice: SaleInvoiceShow
  company?: BusinessCompany | null
  profile?: Record<string, unknown> | null
  exchangeRateContext?: QuickSaleExchangeRateContext | null
  canEditItems?: boolean
  canManageNotes?: boolean
  onSaveNotes?: (notes: string) => Promise<void> | void
  onDeleteItem?: (itemSaleId: number) => Promise<void> | void
  onChangeQuantity?: (itemSaleId: number, delta: number) => Promise<void> | void
  showEquivalentInPrint?: boolean
  showPreviousRemainingInPrint?: boolean
  printPaperSize?: InvoicePaperSize
  printTheme?: InvoicePrintTheme
}

function num(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function fmt(v: unknown) {
  return num(v).toLocaleString(undefined, { maximumFractionDigits: 2 })
}


function itemDetailEntries(row: SaleInvoiceItemRow, t: (k: string) => string) {
  const item = row.item
  if (!item) return [] as Array<[string, string]>
  const fields: Array<[string, unknown]> = [
    [t('desktop.brand'), item.brand],
    [t('desktop.model'), item.model],
    [t('desktop.color'), item.color],
    [t('desktop.generation'), item.generation],
    [t('desktop.ram_capacity'), item.ram_capacity],
    [t('desktop.storage_capacity'), item.storage_capacity],
  ]
  return fields
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([label, value]) => [label, String(value)] as [string, string])
}

export const SaleInvoiceBill = forwardRef<HTMLDivElement, Props>(function SaleInvoiceBill(
  {
    invoice,
    company,
    profile,
    exchangeRateContext,
    canEditItems = false,
    canManageNotes = false,
    onSaveNotes,
    onDeleteItem,
    onChangeQuantity,
    showEquivalentInPrint = false,
    showPreviousRemainingInPrint = false,
    printPaperSize = 'a5',
    printTheme = 'classic',
  },
  ref,
) {
  const { t } = useTranslation()

  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name?: string | null } | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteDraft, setNoteDraft] = useState('')
  const [noteSaving, setNoteSaving] = useState(false)
  const [noteError, setNoteError] = useState<string | null>(null)

  const noteText = String(invoice.notes || '').trim()

  const currency = String(invoice.currency || 'afn').toLowerCase()
  const isUSD = currency === 'usd'
  const rate = num(
    invoice.exchange_rate?.rate ??
      (invoice as { exchangeRate?: { rate?: number } }).exchangeRate?.rate,
  )
  const currLabel = localizeCurrency(currency, t)
  const altLabel = isUSD ? localizeCurrency('afn', t) : localizeCurrency('usd', t)

  const fromCurrency = String(
    exchangeRateContext?.from_currency || invoice.exchange_rate?.from_currency || '',
  ).toLowerCase()
  const toCurrency = String(
    exchangeRateContext?.to_currency || invoice.exchange_rate?.to_currency || '',
  ).toLowerCase()
  const hasDirectionalRate = Boolean(fromCurrency && toCurrency)
  const showExchangeRateDetails = hasDirectionalRate && rate > 0
  const printHideClass = showEquivalentInPrint ? '' : 'print-hide'
  const previousRemainingHideClass = showPreviousRemainingInPrint ? '' : 'print-hide'
  const rateDirectionText = hasDirectionalRate
    ? t('desktop.exchange_rate_direction', {
        from: localizeCurrency(fromCurrency, t),
        to: localizeCurrency(toCurrency, t),
      })
    : t('desktop.exchange_rate_direction', {
        from: localizeCurrency('usd', t),
        to: localizeCurrency('afn', t),
      })

  const customerDisplayName = invoice.customer?.name || invoice.customer?.company_name || ''

  const totalInCurr = num(invoice.total_price)
  const discountAmount = Math.max(0, num(invoice.discount?.amount))
  const payableInCurr =
    invoice.payable_amount != null
      ? Math.max(0, num(invoice.payable_amount))
      : Math.max(0, totalInCurr - discountAmount)
  const paymentAmount = num(invoice.payment?.amount)
  const paymentCurrency = String(invoice.payment?.currency || '').toLowerCase()
  const legacyPaid = isUSD ? num(invoice.payment?.amount_usd) : num(invoice.payment?.amount_afn)

  let paidInCurr = legacyPaid
  if (paymentAmount > 0) {
    if (!paymentCurrency || paymentCurrency === currency) paidInCurr = paymentAmount
    else if (rate > 0 && paymentCurrency === 'afn' && currency === 'usd') paidInCurr = paymentAmount / rate
    else if (rate > 0 && paymentCurrency === 'usd' && currency === 'afn') paidInCurr = paymentAmount * rate
    else paidInCurr = 0
  }
  if (!invoice.customer_id && Number(invoice.status) === 1 && paidInCurr <= 0) {
    paidInCurr = payableInCurr
  }
  const remainInCurr = Math.max(0, payableInCurr - paidInCurr)
  const previousRemaining = invoice.customer_id ? Math.max(0, num(invoice.previous_remaining)) : 0
  const overpay = invoice.customer_id ? Math.max(0, paidInCurr - payableInCurr) : 0
  const pastShown = Math.max(0, previousRemaining - overpay)
  const totalRemaining = pastShown + remainInCurr

  const altTotals = useMemo(() => {
    if (!showExchangeRateDetails) return null
    return isUSD
      ? {
          totalAlt: totalInCurr * rate,
          paidAlt: paidInCurr * rate,
          remainAlt: remainInCurr * rate,
          discountAlt: discountAmount * rate,
          payableAlt: payableInCurr * rate,
        }
      : {
          totalAlt: totalInCurr / rate,
          paidAlt: paidInCurr / rate,
          remainAlt: remainInCurr / rate,
          discountAlt: discountAmount / rate,
          payableAlt: payableInCurr / rate,
        }
  }, [
    showExchangeRateDetails,
    isUSD,
    rate,
    totalInCurr,
    paidInCurr,
    remainInCurr,
    discountAmount,
    payableInCurr,
  ])

  const toAlt = (val: unknown) => {
    if (!showExchangeRateDetails) return null
    return isUSD ? num(val) * rate : num(val) / rate
  }

  const confirmDelete = async () => {
    if (!deleteTarget?.id || !onDeleteItem) return
    setDeleting(true)
    try {
      await onDeleteItem(deleteTarget.id)
      setDeleteTarget(null)
    } finally {
      setDeleting(false)
    }
  }

  const openNoteModal = () => {
    setNoteDraft(noteText)
    setNoteError(null)
    setNoteOpen(true)
  }

  const saveNote = async () => {
    if (!onSaveNotes) return
    setNoteSaving(true)
    setNoteError(null)
    try {
      await onSaveNotes(noteDraft.trim())
      setNoteOpen(false)
    } catch (err) {
      setNoteError(getApiErrorMessage(err))
    } finally {
      setNoteSaving(false)
    }
  }

  const address = String(profile?.address_dari || profile?.address || '—')
  const phone = String(profile?.phone || '—')
  const slogan =
    String((profile as { slogan?: string | null } | null)?.slogan || '').trim() ||
    t('desktop.brand_slogan')
  const logoCached = useCachedAsset(company?.logo)
  const logoSrc = logoCached || logoFallbackUrl

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
          <h5 className="invoice-title-badge">{t('desktop.invoice_details')}</h5>
        </div>

        <div className="invoice-info">
          <p>
            <strong>{t('desktop.customer_name')}:</strong> {customerDisplayName}
          </p>
          <p>
            <strong>{t('desktop.invoice_number')}:</strong> {invoice.invoice_number}
          </p>
          <p>
            <strong>{t('desktop.date')}:</strong>{' '}
            {formatJalaliSlash(invoice.sale_date || invoice.created_at)}
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
                <th>{t('desktop.invoice_item_details')}</th>
                <th>{t('desktop.quantity')}</th>
                <th>
                  {t('desktop.unit_price')} <small>({currLabel})</small>
                </th>
                <th>
                  {t('desktop.total')} <small>({currLabel})</small>
                </th>
                {canEditItems ? <th className="no-print">{t('desktop.action')}</th> : null}
              </tr>
            </thead>
            <tbody>
              {(invoice.items || []).map((row, idx) => {
                const unit = num(row.price)
                const total = num(row.total_price)
                const unitAlt = toAlt(unit)
                const totalAlt = toAlt(total)
                const details = itemDetailEntries(row, t)
                const name = row.item?.name || row.item_name || '—'
                return (
                  <tr key={row.id ?? idx}>
                    <td>{idx + 1}</td>
                    <td>
                      <div>{name}</div>
                      {details.length > 0 ? (
                        <div className="small text-muted mt-1 text-end">
                          {details.map(([label, value]) => `${label}: ${value}`).join(' | ')}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      {canEditItems ? (
                        <div className="qty-stepper">
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => void onChangeQuantity?.(row.id, -1)}
                          >
                            <i className="fa-solid fa-minus" />
                          </button>
                          <span>{formatQty(row.quantity)}</span>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => void onChangeQuantity?.(row.id, 1)}
                          >
                            <i className="fa-solid fa-plus" />
                          </button>
                        </div>
                      ) : (
                        formatQty(row.quantity)
                      )}
                    </td>
                    <td>
                      {fmt(unit)}
                      {unitAlt != null ? (
                        <div className={`text-muted small ${printHideClass}`}>
                          ≈ {fmt(unitAlt)} {altLabel}
                        </div>
                      ) : null}
                    </td>
                    <td>
                      {fmt(total)}
                      {totalAlt != null ? (
                        <div className={`text-muted small ${printHideClass}`}>
                          ≈ {fmt(totalAlt)} {altLabel}
                        </div>
                      ) : null}
                    </td>
                    {canEditItems ? (
                      <td className="no-print">
                        <button
                          type="button"
                          className="btn-icon btn-icon--danger"
                          onClick={() => setDeleteTarget({ id: row.id, name })}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      </td>
                    ) : null}
                  </tr>
                )
              })}
            </tbody>
          </table>

          <div className="invoice-list-80">
            {(invoice.items || []).map((row, idx) => {
              const unit = num(row.price)
              const total = num(row.total_price)
              const details = itemDetailEntries(row, t)
              const name = row.item?.name || row.item_name || '—'
              return (
                <div key={`r80-${row.id ?? idx}`} className="invoice-list-80-row">
                  <div className="invoice-list-80-head">
                    <span>{idx + 1}.</span>
                    <span>{name}</span>
                  </div>
                  {details.length > 0 ? (
                    <div className="invoice-list-80-meta small text-muted">
                      {details.map(([label, value]) => `${label}: ${value}`).join(' | ')}
                    </div>
                  ) : null}
                  <div className="invoice-list-80-meta">
                    <div>
                      {t('desktop.quantity')}: {formatQty(row.quantity)}
                    </div>
                    {canEditItems ? (
                      <div className="qty-stepper no-print">
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => void onChangeQuantity?.(row.id, -1)}
                        >
                          <i className="fa-solid fa-minus" />
                        </button>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => void onChangeQuantity?.(row.id, 1)}
                        >
                          <i className="fa-solid fa-plus" />
                        </button>
                      </div>
                    ) : null}
                    <span>
                      {t('desktop.unit_price_short')}: {fmt(unit)} {currLabel}
                    </span>
                  </div>
                  <div className="invoice-list-80-total">
                    {t('desktop.total')}: {fmt(total)} {currLabel}
                  </div>
                </div>
              )
            })}
          </div>

          {showExchangeRateDetails ? (
            <small className={`ms-2 text-muted ${printHideClass}`}>
              ({t('desktop.exchange_rate')} {rateDirectionText}: {fmt(rate)})
            </small>
          ) : null}
        </div>

        <div
          className={`mt-3 invoice-summary${!invoice.customer_id ? ' no-customer-summary' : ''}`}
        >
          <h6 className="mb-2">{t('desktop.invoice_summary')}</h6>
          <div className="invoice-total border-top px-2">
            <p className="mb-0 border-bottom">
              <strong>{t('desktop.total')}:</strong> {fmt(totalInCurr)} {currLabel}
              {altTotals ? (
                <small className={`ms-2 text-muted ${printHideClass}`}>
                  ≈ {fmt(altTotals.totalAlt)} {altLabel}
                </small>
              ) : null}
            </p>
            {discountAmount > 0 ? (
              <p className="mb-0 border-bottom">
                <strong>
                  {t('desktop.discount')}
                  {num(invoice.discount?.percent) > 0
                    ? ` (${num(invoice.discount?.percent)}%)`
                    : ''}
                  :
                </strong>{' '}
                {fmt(discountAmount)} {currLabel}
                {altTotals ? (
                  <small className={`ms-2 text-muted ${printHideClass}`}>
                    ≈ {fmt(altTotals.discountAlt)} {altLabel}
                  </small>
                ) : null}
              </p>
            ) : null}
            {discountAmount > 0 ? (
              <p className="mb-0 border-bottom">
                <strong>{t('desktop.total_payable')}:</strong> {fmt(payableInCurr)} {currLabel}
                {altTotals ? (
                  <small className={`ms-2 text-muted ${printHideClass}`}>
                    ≈ {fmt(altTotals.payableAlt)} {altLabel}
                  </small>
                ) : null}
              </p>
            ) : null}
            <p className="mb-0 border-bottom">
              <strong>{t('desktop.paid_amount')}:</strong> {fmt(paidInCurr)} {currLabel}
              {altTotals ? (
                <small className={`ms-2 text-muted ${printHideClass}`}>
                  ≈ {fmt(altTotals.paidAlt)} {altLabel}
                </small>
              ) : null}
            </p>
            {invoice.customer_id ? (
              <p className={`mb-0 border-bottom ${previousRemainingHideClass}`}>
                <strong>{t('desktop.previous_remaining')}:</strong> {fmt(pastShown)} {currLabel}
              </p>
            ) : null}
            {remainInCurr > 0 ? (
              <p className="mb-0 border-bottom">
                <strong>{t('desktop.remaining_balance')}:</strong> {fmt(remainInCurr)} {currLabel}
                {altTotals ? (
                  <small className={`ms-2 text-muted ${printHideClass}`}>
                    ≈ {fmt(altTotals.remainAlt)} {altLabel}
                  </small>
                ) : null}
              </p>
            ) : null}
            {invoice.customer_id ? (
              <p className={`mb-0 border-bottom ${previousRemainingHideClass}`}>
                <strong>{t('desktop.total_remaining')}:</strong> {fmt(totalRemaining)} {currLabel}
              </p>
            ) : null}
          </div>
        </div>

        {noteText ? (
          <div className="invoice-note">
            <strong>{t('desktop.note')}:</strong>
            <p>{noteText}</p>
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

      {canManageNotes && onSaveNotes ? (
        <div className="invoice-note-actions no-print">
          <button type="button" className="btn-secondary" onClick={openNoteModal}>
            <i className={`fa-solid ${noteText ? 'fa-pen' : 'fa-note-sticky'}`} />{' '}
            {noteText ? t('desktop.edit_invoice_note') : t('desktop.add_invoice_note')}
          </button>
        </div>
      ) : null}

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        title={t('desktop.confirm_delete_title')}
      >
        <p>{t('desktop.confirm_delete_item_from_invoice')}</p>
        {deleteTarget?.name ? <p className="muted">{deleteTarget.name}</p> : null}
        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={deleting} onClick={() => setDeleteTarget(null)}>
            {t('desktop.cancel')}
          </button>
          <button type="button" className="btn-danger" disabled={deleting} onClick={() => void confirmDelete()}>
            {deleting ? t('desktop.processing') : t('desktop.confirm_delete')}
          </button>
        </div>
      </Modal>

      <Modal
        open={noteOpen}
        onClose={() => {
          if (!noteSaving) setNoteOpen(false)
        }}
        title={noteText ? t('desktop.edit_invoice_note') : t('desktop.add_invoice_note')}
      >
        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault()
            void saveNote()
          }}
        >
          {noteError ? <div className="alert-error">{noteError}</div> : null}
          <label>
            {t('desktop.note')}
            <textarea
              value={noteDraft}
              onChange={(e) => setNoteDraft(e.target.value)}
              placeholder={t('desktop.invoice_note_placeholder')}
              rows={5}
              maxLength={2000}
              disabled={noteSaving}
              autoFocus
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              disabled={noteSaving}
              onClick={() => setNoteOpen(false)}
            >
              {t('desktop.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={noteSaving}>
              {noteSaving ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
})
