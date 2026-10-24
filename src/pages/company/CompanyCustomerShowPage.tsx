import { FormEvent, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { localizeCurrency } from '@/lib/currency'

import { Modal } from '@/components/ui/Modal'
import { showErrorToast, showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import {
  deleteCustomerPayment,
  fetchBusinessAccountsList,
  fetchCustomerShow,
  setCustomerPreviousPayables,
  storeCustomerGeneralPayment,
  type CustomerInternetPackageRow,
  type CustomerShowPayload,
  type PartyDebtRecordRow,
  type PartyDebtRow,
  type PartyInvoiceRow,
  type PartyPaymentRow,
  pickCustomerInvoices,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { formatAfghanDateValue, formatJalaliSlashFromYmd } from '@/lib/datetime'
import {
  downloadInvoiceImage,
  downloadInvoicePdf,
  type InvoicePaperSize,
} from '@/lib/invoicePrint'
import type { BusinessAccountRow, BusinessShowData } from '@/lib/user'
import { isBusinessAccountActive } from '@/lib/user'
import { CustomerPaymentReceipt } from '@/pages/company/CustomerPaymentReceipt'
import { PartyShowPdfDownloadButton } from '@/pages/company/PartyShowPdfDownloadButton'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }


function isActiveStatus(status: number | boolean | null | undefined): boolean {
  return status === 1 || status === true
}

export function CompanyCustomerShowPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '', customerId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [payload, setPayload] = useState<CustomerShowPayload | null>(null)
  const [accounts, setAccounts] = useState<BusinessAccountRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debtOpen, setDebtOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)

  const load = async () => {
    if (!token || !companyId || !customerId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchCustomerShow(token, companyId, customerId)
      setPayload(data)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    if (token && companyId) {
      void fetchBusinessAccountsList(token, companyId).then(setAccounts).catch(() => setAccounts([]))
    }
  }, [token, companyId, customerId])

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!payload?.customer) {
    return <div className="alert-error">{error || t('desktop.no_customers')}</div>
  }

  const customer = payload.customer
  const debts = payload.customerDebts || []
  const canManage =
    Boolean(payload.permissions?.canManageCustomers ?? business.permissions?.canManageCustomers) &&
    business.is_active
  const canDelete =
    Boolean(payload.permissions?.canDeleteRecords ?? business.permissions?.canDeleteRecords) &&
    business.is_active
  const canViewSales = Boolean(business.permissions?.canViewSales)
  const invoices = pickCustomerInvoices(payload)

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId, 'customers')} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        <div className="party-toolbar-end">
          {canManage ? (
            <>
              <button
                type="button"
                className="btn-outline-primary btn-sm"
                onClick={() => setDebtOpen(true)}
              >
                <i className="fa-solid fa-coins" /> {t('desktop.set_previous_receivables')}
              </button>
              <button
                type="button"
                className="btn-outline-success btn-sm"
                onClick={() => setPayOpen(true)}
              >
                <i className="fa-solid fa-hand-holding-dollar" /> {t('desktop.general_payment')}
              </button>
            </>
          ) : null}
          <PartyShowPdfDownloadButton
            kind="customer"
            party={customer}
            debts={debts}
            debtRecords={payload.customerDebtRecords || []}
            payments={payload.customerPayments || []}
            invoices={invoices}
            filenameSlug={String(customerId)}
          />
          {canManage ? (
            <Link
              to={businessPath(companyId, `customers/${customerId}/setup`)}
              className="btn-success btn-sm"
            >
              <i className="fa-regular fa-pen-to-square" /> {t('desktop.edit')}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="dash-header dash-header--section mb-3">
        <h5 className="mb-0">
          {t('desktop.customer_details')} - {customer.name}
        </h5>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="party-details">
        <table className="party-info-table">
          <tbody>
            <tr>
              <th>{t('desktop.name')}</th>
              <td>{customer.name || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.company_name')}</th>
              <td>{customer.company_name || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.phone')}</th>
              <td>{customer.phone || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.email')}</th>
              <td>{customer.email || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.address')}</th>
              <td>{customer.address || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.personality')}</th>
              <td>
                {customer.personality === 'company'
                  ? t('desktop.personality_company')
                  : t('desktop.personality_human')}
              </td>
            </tr>
            <tr>
              <th>{t('desktop.receivables')}</th>
              <td>
                {debts.length === 0 ? (
                  <span className="muted">—</span>
                ) : (
                  <div className="party-debt-list">
                    {debts.map((d) => {
                      const amount = Number(d.amount || 0)
                      return (
                        <div key={d.id} className="party-debt-row">
                          <span className="muted">{localizeCurrency(d.currency, t)}</span>
                          {amount < 0 ? (
                            <div className="party-prepay">
                              <strong className="text-success">{formatMoney(Math.abs(amount))}</strong>
                              <span className="badge-success">{t('desktop.business_owes_customer')}</span>
                            </div>
                          ) : (
                            <strong className={amount > 0 ? 'text-danger' : 'muted'}>
                              {formatMoney(d.amount)}
                            </strong>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </td>
            </tr>
            <tr>
              <th>{t('desktop.status')}</th>
              <td>
                {isActiveStatus(customer.status) ? t('desktop.active') : t('desktop.inactive')}
              </td>
            </tr>
            <tr>
              <th>{t('desktop.created_at')}</th>
              <td>{formatAfghanDateValue(customer.created_at, locale)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <CustomerPurchasesTable
        rows={invoices}
        locale={locale}
        t={t}
        companyId={companyId}
        canViewSales={canViewSales}
      />

      {business.company.is_service === true || (payload.customerPackages || []).length > 0 ? (
        <CustomerPackagesTable rows={payload.customerPackages || []} t={t} />
      ) : null}

      <div className="party-history-grid">
        <CustomerPayablesTable
          rows={payload.customerDebtRecords || []}
          locale={locale}
          t={t}
        />
        <CustomerPaymentsTable
          rows={payload.customerPayments || []}
          locale={locale}
          t={t}
          customerName={customer.name || customer.company_name || ''}
          canDeleteRecords={canDelete}
          onDelete={
            token
              ? async (paymentId) => {
                  await deleteCustomerPayment(token, companyId, customerId, paymentId)
                  await load()
                }
              : undefined
          }
        />
      </div>

      <CashActionModal
        open={debtOpen}
        title={t('desktop.set_previous_receivables')}
        accounts={accounts}
        debts={debts}
        allowZero
        allowNegative={false}
        useAllAccounts
        balanceModes
        hint={null}
        onClose={() => setDebtOpen(false)}
        onSubmit={async (form) => {
          if (!token) return
          await setCustomerPreviousPayables(token, companyId, customerId, form)
          setDebtOpen(false)
          await load()
        }}
      />

      <CashActionModal
        open={payOpen}
        title={t('desktop.general_payment')}
        accounts={accounts}
        debts={debts}
        allowZero={false}
        allowNegative
        useAllAccounts={false}
        balanceModes={false}
        hint={t('desktop.customer_payment_signed_hint')}
        onClose={() => setPayOpen(false)}
        onSubmit={async (form) => {
          if (!token) return
          await storeCustomerGeneralPayment(token, companyId, customerId, form)
          setPayOpen(false)
          await load()
        }}
      />
    </div>
  )
}

function CustomerPurchasesTable({
  rows,
  locale,
  t,
  companyId,
  canViewSales,
}: {
  rows: PartyInvoiceRow[]
  locale: 'fa' | 'ps' | 'en'
  t: (key: string) => string
  companyId: string
  canViewSales: boolean
}) {
  return (
    <section className="party-section party-purchases" id="customer-purchases">
      <h6>{t('desktop.customer_purchases')}</h6>
      <div className="table-wrap">
        <table className="data-table data-table--compact text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('desktop.invoice_number')}</th>
              <th>{t('desktop.item_rows')}</th>
              <th>{t('desktop.invoice_total')}</th>
              <th>{t('desktop.paid_amount')}</th>
              <th>{t('desktop.remaining_amount')}</th>
              <th>{t('desktop.currency')}</th>
              <th>{t('desktop.date')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}>{t('desktop.no_sales')}</td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const remaining = Number(row.remaining_amount ?? 0)
                const invoiceLabel = row.invoice_number ?? row.id
                return (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>
                      {canViewSales ? (
                        <Link
                          to={businessPath(companyId, `sales/${row.id}`)}
                          className="party-invoice-link"
                        >
                          {invoiceLabel}
                        </Link>
                      ) : (
                        invoiceLabel
                      )}
                    </td>
                    <td>{Number(row.items_count ?? 0)}</td>
                    <td>{formatMoney(row.total_price)}</td>
                    <td>{formatMoney(row.paid_amount)}</td>
                    <td className={remaining > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                      {formatMoney(row.remaining_amount)}
                    </td>
                    <td>{localizeCurrency(row.currency, t)}</td>
                    <td>{formatAfghanDateValue(row.created_at, locale)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function CustomerPackagesTable({
  rows,
  t,
}: {
  rows: CustomerInternetPackageRow[]
  t: (key: string) => string
}) {
  const unitLabel = (unit: string) =>
    unit === 'mb' ? t('desktop.package_unit_mb') : t('desktop.package_unit_gb')

  return (
    <section className="party-section party-purchases" id="customer-packages">
      <h6>{t('desktop.customer_package_purchases')}</h6>
      <div className="table-wrap">
        <table className="data-table data-table--compact text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('desktop.package_name')}</th>
              <th>{t('desktop.package_amount')}</th>
              <th>{t('desktop.package_price')}</th>
              <th>{t('desktop.paid_amount')}</th>
              <th>{t('desktop.remaining_amount')}</th>
              <th>{t('desktop.currency')}</th>
              <th>{t('desktop.package_start')}</th>
              <th>{t('desktop.package_end')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9}>{t('desktop.no_records')}</td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const remaining = Number(row.remaining_amount ?? 0)
                return (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.package_name}</td>
                    <td>
                      {formatMoney(row.data_amount)} {unitLabel(row.data_unit)}
                    </td>
                    <td>{formatMoney(row.price)}</td>
                    <td>{formatMoney(row.paid_amount)}</td>
                    <td className={remaining > 0 ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                      {formatMoney(row.remaining_amount)}
                    </td>
                    <td>{localizeCurrency(row.currency, t)}</td>
                    <td>{formatJalaliSlashFromYmd(row.start_date)}</td>
                    <td>{formatJalaliSlashFromYmd(row.end_date)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function CustomerPayablesTable({
  rows,
  empty,
  locale,
  t,
}: {
  rows: PartyDebtRecordRow[]
  empty?: string
  locale: 'fa' | 'ps' | 'en'
  t: (key: string) => string
}) {
  const emptyText = empty || t('desktop.no_records')
  return (
    <section className="party-section">
      <h6>{t('desktop.customer_payables_records')}</h6>
      <div className="table-wrap">
        <table className="data-table data-table--compact text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('desktop.account')}</th>
              <th>{t('desktop.currency')}</th>
              <th>{t('desktop.previous_amount')}</th>
              <th>{t('desktop.change_amount')}</th>
              <th>{t('desktop.new_amount')}</th>
              <th>{t('desktop.remark')}</th>
              <th>{t('desktop.date')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={8}>{emptyText}</td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const change = Number(row.change_amount ?? 0)
                return (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.account_name || '—'}</td>
                    <td>{localizeCurrency(row.currency, t)}</td>
                    <td>{formatMoney(row.previous_amount)}</td>
                    <td
                      className={
                        change > 0 ? 'text-danger fw-bold' : change < 0 ? 'text-success fw-bold' : ''
                      }
                    >
                      {formatMoney(row.change_amount)}
                    </td>
                    <td className="fw-bold">{formatMoney(row.new_amount)}</td>
                    <td>{row.description || row.reason || '—'}</td>
                    <td>{formatAfghanDateValue(row.created_at, locale)}</td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function CustomerPaymentsTable({
  rows,
  locale,
  t,
  customerName,
  canDeleteRecords,
  onDelete,
}: {
  rows: PartyPaymentRow[]
  locale: 'fa' | 'ps' | 'en'
  t: (key: string) => string
  customerName: string
  canDeleteRecords: boolean
  onDelete?: (paymentId: number) => Promise<void>
}) {
  const { business } = useOutletContext<CompanyOutletContext>()
  const receiptRef = useRef<HTMLDivElement>(null)
  const [menuId, setMenuId] = useState<number | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<PartyPaymentRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [exportPayment, setExportPayment] = useState<PartyPaymentRow | null>(null)
  const [exportPaper, setExportPaper] = useState<InvoicePaperSize>('a5')
  const [exportKind, setExportKind] = useState<'pdf' | 'image' | null>(null)
  const [exportTick, setExportTick] = useState(0)
  const [exportBusy, setExportBusy] = useState(false)

  const openDelete = (row: PartyPaymentRow) => {
    setMenuId(null)
    setSelected(row)
    setError(null)
    setConfirmOpen(true)
  }

  const startExport = (row: PartyPaymentRow, kind: 'pdf' | 'image', size: InvoicePaperSize) => {
    setMenuId(null)
    setExportPayment(row)
    setExportPaper(size)
    setExportKind(kind)
    setExportTick((n) => n + 1)
  }

  useEffect(() => {
    if (!exportKind || !exportPayment || exportTick === 0) return
    let cancelled = false
    const timer = window.setTimeout(() => {
      const el = receiptRef.current
      if (!el || cancelled) return
      const run = async () => {
        setExportBusy(true)
        try {
          const slug = `payment-${exportPayment.id}`
          if (exportKind === 'pdf') {
            await downloadInvoicePdf(el, slug, exportPaper)
          } else {
            await downloadInvoiceImage(el, slug, exportPaper)
          }
          if (!cancelled) showSuccessToast(t('desktop.saved_success'))
        } catch {
          if (!cancelled) showErrorToast(t('desktop.invoice_export_failed'))
        } finally {
          if (!cancelled) {
            setExportBusy(false)
            setExportKind(null)
          }
        }
      }
      void run()
    }, 50)
    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [exportKind, exportPayment, exportPaper, exportTick, t])

  const handleDelete = async () => {
    if (!selected || !onDelete) return
    setDeleting(true)
    setError(null)
    try {
      await onDelete(selected.id)
      setConfirmOpen(false)
      setSelected(null)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <section className="party-section">
      <h6>{t('desktop.customer_payments_list')}</h6>
      <div className="table-wrap">
        <table className="data-table data-table--compact text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('desktop.account')}</th>
              <th>{t('desktop.currency')}</th>
              <th>{t('desktop.amount')}</th>
              <th>{t('desktop.date')}</th>
              <th>{t('desktop.action')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6}>{t('desktop.no_payments')}</td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const canDelete = Boolean(canDeleteRecords && row.can_delete && onDelete)
                return (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{row.account_name || '—'}</td>
                    <td>{localizeCurrency(row.currency, t)}</td>
                    <td>
                      <span className={Number(row.amount) < 0 ? 'text-danger' : undefined}>
                        {formatMoney(row.amount)}
                      </span>
                      {Number(row.amount) < 0 ? (
                        <small className="muted d-block">{t('desktop.payment_to_customer')}</small>
                      ) : null}
                    </td>
                    <td>{formatAfghanDateValue(row.created_at, locale)}</td>
                    <td>
                      <PaymentRowMenu
                        open={menuId === row.id}
                        busy={exportBusy}
                        canDelete={canDelete}
                        deleteBlockedReason={
                          canDeleteRecords && !canDelete
                            ? t('desktop.payment_linked_to_invoice')
                            : null
                        }
                        showDelete={canDeleteRecords}
                        onToggle={() =>
                          setMenuId((current) => (current === row.id ? null : row.id))
                        }
                        onClose={() => setMenuId(null)}
                        onPdf={(size) => startExport(row, 'pdf', size)}
                        onImage={(size) => startExport(row, 'image', size)}
                        onDelete={() => openDelete(row)}
                      />
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {exportPayment && business.company ? (
        <div className="payment-receipt-export" aria-hidden="true">
          <CustomerPaymentReceipt
            ref={receiptRef}
            payment={exportPayment}
            customerName={customerName}
            company={business.company}
            profile={business.profile}
            printPaperSize={exportPaper}
          />
        </div>
      ) : null}

      <Modal
        open={confirmOpen}
        onClose={() => {
          if (!deleting) {
            setConfirmOpen(false)
            setSelected(null)
          }
        }}
        title={t('desktop.confirm_delete_payment_title')}
      >
        <p>{t('desktop.confirm_delete_payment_body')}</p>
        {error ? <div className="alert-error">{error}</div> : null}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={deleting}
            onClick={() => {
              setConfirmOpen(false)
              setSelected(null)
            }}
          >
            {t('desktop.cancel')}
          </button>
          <button type="button" className="btn-danger" disabled={deleting} onClick={() => void handleDelete()}>
            {deleting ? t('desktop.processing') : t('desktop.delete')}
          </button>
        </div>
      </Modal>
    </section>
  )
}

function PaymentRowMenu({
  open,
  busy,
  canDelete,
  showDelete,
  deleteBlockedReason,
  onToggle,
  onClose,
  onPdf,
  onImage,
  onDelete,
}: {
  open: boolean
  busy: boolean
  canDelete: boolean
  showDelete: boolean
  deleteBlockedReason?: string | null
  onToggle: () => void
  onClose: () => void
  onPdf: (size: InvoicePaperSize) => void
  onImage: (size: InvoicePaperSize) => void
  onDelete: () => void
}) {
  const { t } = useTranslation()
  const rootRef = useRef<HTMLDivElement>(null)
  const dropRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ top: 0, left: 0 })

  useEffect(() => {
    if (!open) return
    const place = () => {
      const trigger = rootRef.current?.getBoundingClientRect()
      if (!trigger) return
      const width = 228
      const margin = 8
      const gap = 4
      const left = Math.max(margin, Math.min(trigger.left, window.innerWidth - width - margin))
      const dropHeight = dropRef.current?.offsetHeight || 220
      const spaceBelow = window.innerHeight - trigger.bottom - margin
      const spaceAbove = trigger.top - margin
      const openUpward = dropHeight > spaceBelow && spaceAbove >= Math.min(dropHeight, spaceBelow)
      let top = openUpward ? trigger.top - dropHeight - gap : trigger.bottom + gap
      top = Math.max(margin, Math.min(top, window.innerHeight - dropHeight - margin))
      setPos({ top, left })
    }
    place()
    const raf = window.requestAnimationFrame(place)
    const onDoc = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        if (dropRef.current?.contains(event.target as Node)) return
        onClose()
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('keydown', onKey)
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.cancelAnimationFrame(raf)
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open, onClose, showDelete])

  return (
    <div className="party-row-menu" ref={rootRef}>
      <button
        type="button"
        className="acc-card-menu__btn"
        aria-label={t('desktop.payment_row_menu')}
        aria-expanded={open}
        disabled={busy}
        onClick={(event) => {
          event.preventDefault()
          event.stopPropagation()
          onToggle()
        }}
      >
        {busy ? <span className="spinner spinner--sm" /> : <i className="fa-solid fa-ellipsis-vertical" />}
      </button>
      {open
        ? createPortal(
            <div
              ref={dropRef}
              id="payment-row-menu-drop"
              className="acc-card-menu__drop party-row-menu__drop"
              role="menu"
              style={{ top: pos.top, left: pos.left }}
            >
              <button type="button" role="menuitem" disabled={busy} onClick={() => onPdf('a5')}>
                <i className="fa-solid fa-file-pdf" /> {t('desktop.download_pdf_a5')}
              </button>
              <button type="button" role="menuitem" disabled={busy} onClick={() => onPdf('80mm')}>
                <i className="fa-solid fa-file-pdf" /> {t('desktop.download_pdf_80mm')}
              </button>
              <button type="button" role="menuitem" disabled={busy} onClick={() => onImage('a5')}>
                <i className="fa-solid fa-image" /> {t('desktop.download_image_a5')}
              </button>
              <button type="button" role="menuitem" disabled={busy} onClick={() => onImage('80mm')}>
                <i className="fa-solid fa-image" /> {t('desktop.download_image_80mm')}
              </button>
              {showDelete ? (
                <button
                  type="button"
                  role="menuitem"
                  className="is-danger"
                  disabled={busy || !canDelete}
                  title={canDelete ? undefined : deleteBlockedReason || undefined}
                  onClick={() => canDelete && onDelete()}
                >
                  <i className="fa-solid fa-trash" /> {t('desktop.delete')}
                </button>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  )
}

function CashActionModal({
  open,
  title,
  accounts,
  debts,
  allowZero,
  allowNegative = false,
  useAllAccounts,
  balanceModes = false,
  hint = null,
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  accounts: BusinessAccountRow[]
  debts: PartyDebtRow[]
  allowZero: boolean
  allowNegative?: boolean
  useAllAccounts: boolean
  balanceModes?: boolean
  hint?: string | null
  onClose: () => void
  onSubmit: (payload: {
    company_account_id: string
    amount: string
    description?: string
    mode?: 'add' | 'set'
  }) => Promise<void>
}) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [balanceMode, setBalanceMode] = useState<'add' | 'set'>('set')

  useEffect(() => {
    if (!open) {
      setError(null)
      setAccountId('')
      setAmount('')
      setDescription('')
      setBalanceMode('set')
      return
    }
    if (!useAllAccounts && debts.length === 1 && debts[0].company_account_id) {
      setAccountId(String(debts[0].company_account_id))
      if (!allowNegative && Number(debts[0].amount || 0) > 0) {
        setAmount(String(debts[0].amount ?? ''))
      }
    }
  }, [open, debts, useAllAccounts, allowNegative])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    setError(null)
    try {
      await onSubmit({
        company_account_id: accountId,
        amount,
        description: description || undefined,
        ...(balanceModes ? { mode: balanceMode } : {}),
      })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  const options = useAllAccounts
    ? accounts.filter(isBusinessAccountActive).map((a) => ({
        id: String(a.id),
        label: `${localizeCurrency(a.currency, t)} — ${a.name || t('desktop.account')}`,
        remaining: Number(
          debts.find((d) => String(d.company_account_id) === String(a.id))?.amount ?? 0,
        ),
      }))
    : debts.length > 0
      ? debts.map((d) => ({
          id: String(d.company_account_id),
          label: `${d.account_name || t('desktop.account')} — ${localizeCurrency(d.currency, t)}`,
          remaining: Number(d.amount || 0),
        }))
      : accounts.filter(isBusinessAccountActive).map((a) => ({
          id: String(a.id),
          label: `${a.name || t('desktop.account')} (${localizeCurrency(a.currency, t)})`,
          remaining: null as number | null,
        }))

  const selected = options.find((o) => o.id === accountId)
  const currentRemaining = selected?.remaining != null ? Number(selected.remaining || 0) : 0
  const enteredAmount = Number(amount)
  const previewRemaining =
    balanceModes && Number.isFinite(enteredAmount)
      ? balanceMode === 'add'
        ? currentRemaining + enteredAmount
        : enteredAmount
      : !balanceModes && selected?.remaining != null && Number.isFinite(enteredAmount)
        ? currentRemaining - enteredAmount
        : null

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={(e) => void submit(e)} className="form-grid">
        {error ? <div className="alert-error">{error}</div> : null}
        {hint ? <p className="muted small">{hint}</p> : null}
        {balanceModes ? (
          <fieldset className="balance-mode-fieldset">
            <legend>{t('desktop.previous_balance_mode')}</legend>
            <label className="check-row">
              <input
                type="radio"
                name="balance-mode"
                checked={balanceMode === 'add'}
                onChange={() => setBalanceMode('add')}
              />
              {t('desktop.add_previous_balance')}
            </label>
            <p className="muted small mb-2">{t('desktop.add_previous_balance_hint')}</p>
            <label className="check-row">
              <input
                type="radio"
                name="balance-mode"
                checked={balanceMode === 'set'}
                onChange={() => setBalanceMode('set')}
              />
              {t('desktop.set_previous_balance')}
            </label>
            <p className="muted small mb-0">{t('desktop.set_previous_balance_hint')}</p>
          </fieldset>
        ) : null}
        <label>
          {t('desktop.account')}
          <select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
            <option value="">{t('desktop.select')}</option>
            {options.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
                {opt.remaining != null ? ` (${formatMoney(opt.remaining)})` : ''}
              </option>
            ))}
          </select>
        </label>
        {selected && selected.remaining != null ? (
          <p className="muted">
            {t('desktop.current_account_remaining')}: <strong>{formatMoney(currentRemaining)}</strong>
          </p>
        ) : null}
        <label>
          {t('desktop.amount')}
          <input
            type="number"
            step="0.01"
            min={allowNegative ? undefined : allowZero ? 0 : 0.01}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>
        {selected && previewRemaining != null && Number.isFinite(previewRemaining) ? (
          <p
            className={
              balanceModes && balanceMode === 'set'
                ? 'acc-create-confirm__warn mb-0'
                : previewRemaining < 0
                  ? 'text-success mb-0'
                  : 'muted mb-0'
            }
          >
            {t('desktop.remaining_after_save')}: <strong>{formatMoney(previewRemaining)}</strong>
            {previewRemaining < 0 ? (
              <span className="muted"> ({t('desktop.business_owes_customer')})</span>
            ) : null}
          </p>
        ) : null}
        {!useAllAccounts || balanceModes || allowNegative ? (
          <label>
            {t('desktop.remark')}
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </label>
        ) : null}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('desktop.close')}
          </button>
          <button type="submit" className="btn-primary" disabled={processing || !accountId}>
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
