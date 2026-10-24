import { forwardRef, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { localizeCurrency } from '@/lib/currency'

import logoFallbackUrl from '@/assets/logo.png'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import type { PurchaseShow, QuickSaleExchangeRateContext } from '@/lib/business'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { formatJalaliSlash } from '@/lib/datetime'
import type { InvoicePaperSize } from '@/lib/invoicePrint'
import type { BusinessCompany } from '@/lib/user'

type PurchaseItemRow = NonNullable<PurchaseShow['items']>[number]

type Props = {
  purchase: PurchaseShow
  company: BusinessCompany
  profile?: Record<string, unknown> | null
  exchangeRateContext?: QuickSaleExchangeRateContext | null
  canEditItems?: boolean
  canManageNotes?: boolean
  onSaveNotes?: (notes: string) => Promise<void> | void
  onDeleteItem?: ((purchaseItemId: number) => Promise<void> | void) | null
  showEquivalentInPrint?: boolean
  printPaperSize?: InvoicePaperSize
}

function num(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function fmt(v: unknown) {
  return num(v).toLocaleString(undefined, { maximumFractionDigits: 2 })
}


function itemDetailEntries(row: PurchaseItemRow, t: (k: string) => string) {
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
  if (String(item.type || '').toLowerCase() === 'digital' && row.serial_number) {
    fields.push([t('desktop.serial_number'), row.serial_number])
  }
  return fields
    .filter(([, value]) => value !== null && value !== undefined && String(value).trim() !== '')
    .map(([label, value]) => [label, String(value)] as [string, string])
}

export const PurchaseInvoiceBill = forwardRef<HTMLDivElement, Props>(function PurchaseInvoiceBill(
  {
    purchase,
    company,
    profile,
    exchangeRateContext = null,
    canEditItems = false,
    canManageNotes = false,
    onSaveNotes,
    onDeleteItem = null,
    showEquivalentInPrint = false,
    printPaperSize = 'a5',
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

  const noteText = String(purchase.notes || '').trim()

  const currency = String(purchase.currency || 'afn').toLowerCase()
  const isUSD = currency === 'usd'
  const rate = num(purchase.exchange_rate?.rate)
  const currLabel = localizeCurrency(currency, t)
  const altLabel = isUSD ? localizeCurrency('afn', t) : localizeCurrency('usd', t)

  const fromCurrency = String(
    exchangeRateContext?.from_currency || purchase.exchange_rate?.from_currency || '',
  ).toLowerCase()
  const toCurrency = String(
    exchangeRateContext?.to_currency || purchase.exchange_rate?.to_currency || '',
  ).toLowerCase()
  const hasDirectionalRate = Boolean(fromCurrency && toCurrency)
  const showExchangeRateDetails = hasDirectionalRate && rate > 0
  const printHideClass = showEquivalentInPrint ? '' : 'print-hide'
  const rateDirectionText = hasDirectionalRate
    ? t('desktop.exchange_rate_direction', {
        from: localizeCurrency(fromCurrency, t),
        to: localizeCurrency(toCurrency, t),
      })
    : t('desktop.exchange_rate_direction', {
        from: localizeCurrency('usd', t),
        to: localizeCurrency('afn', t),
      })

  const vendorDisplayName =
    purchase.vendor?.name || purchase.vendor?.company_name || t('desktop.without_vendor')

  const totalInCurr = num(purchase.total_price)
  const paidInCurr = num(purchase.payment?.amount)
  const remainInCurr = Math.max(0, totalInCurr - paidInCurr)

  const altTotals = useMemo(() => {
    if (!showExchangeRateDetails) return null
    return isUSD
      ? { totalAlt: totalInCurr * rate, paidAlt: paidInCurr * rate, remainAlt: remainInCurr * rate }
      : { totalAlt: totalInCurr / rate, paidAlt: paidInCurr / rate, remainAlt: remainInCurr / rate }
  }, [showExchangeRateDetails, isUSD, rate, totalInCurr, paidInCurr, remainInCurr])

  const toAlt = (val: unknown) => {
    if (!showExchangeRateDetails) return null
    return isUSD ? num(val) * rate : num(val) / rate
  }

  const itemRows = purchase.items || []
  const logoCached = useCachedAsset(company.logo)
  const logoSrc = logoCached || logoFallbackUrl
  const address = String(profile?.address_dari || profile?.address || '—')
  const phone = String(profile?.phone || '—')
  const slogan =
    String((profile as { slogan?: string | null } | null)?.slogan || '').trim() ||
    t('desktop.brand_slogan')

  const confirmDelete = async () => {
    if (!deleteTarget?.id || typeof onDeleteItem !== 'function') return
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

  return (
    <div className="sale-invoice-wrap">
      <div className={`invoice-container printable print-paper-${printPaperSize}`} ref={ref}>
        <div className="invoice-header text-center">
          <img src={logoSrc} alt={company.name || 'Hamyan'} className="invoice-logo centered-logo" />
          <h2 className="company-name mt-2">{company.name}</h2>
          <p className="small-text">{slogan}</p>
          <h5>{t('desktop.invoice_details')}</h5>
        </div>

        <div className="invoice-info">
          <p>
            <strong>{t('desktop.vendor_name')}:</strong> {vendorDisplayName}
          </p>
          <p>
            <strong>{t('desktop.invoice_number')}:</strong> {purchase.purchase_number}
          </p>
          <p>
            <strong>{t('desktop.date')}:</strong> {formatJalaliSlash(purchase.purchase_date || purchase.created_at)}
            <span className="ms-2">
              <strong>{t('desktop.currency')}:</strong> {currLabel}
            </span>
          </p>
          <p>
            <strong>{t('desktop.warehouse')}:</strong>{' '}
            {purchase.warehouse?.name || t('desktop.not_assigned')}
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
              {itemRows.map((row, idx) => {
                const unit = num(row.purchase_price)
                const total = num(row.total_price ?? unit * num(row.quantity))
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
                    <td>{row.quantity ?? 0}</td>
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
            {itemRows.map((row, idx) => {
              const unit = num(row.purchase_price)
              const total = num(row.total_price ?? unit * num(row.quantity))
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
                      {t('desktop.quantity')}: {row.quantity ?? 0}
                    </div>
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

        <div className={`mt-3 invoice-summary${!purchase.vendor_id ? ' no-vendor-summary' : ''}`}>
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
            <p className="mb-0 border-bottom">
              <strong>{t('desktop.paid_amount')}:</strong> {fmt(paidInCurr)} {currLabel}
              {altTotals ? (
                <small className={`ms-2 text-muted ${printHideClass}`}>
                  ≈ {fmt(altTotals.paidAlt)} {altLabel}
                </small>
              ) : null}
            </p>
            {purchase.payment?.company_account?.name || purchase.payment?.company_account_id ? (
              <p className="mb-0 border-bottom">
                <strong>{t('desktop.payment_account')}:</strong>{' '}
                {purchase.payment.company_account?.name ||
                  `#${purchase.payment.company_account_id}`}
                {purchase.payment.company_account?.currency ? (
                  <small className="ms-2 text-muted">
                    ({localizeCurrency(purchase.payment.company_account.currency, t)})
                  </small>
                ) : null}
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
          <button
            type="button"
            className="btn-secondary"
            disabled={deleting}
            onClick={() => setDeleteTarget(null)}
          >
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
