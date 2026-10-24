import { FormEvent, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { localizeCurrency } from '@/lib/currency'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import {
  deleteVendorPayment,
  fetchBusinessAccountsList,
  fetchVendorShow,
  pickVendorPurchases,
  setVendorPreviousPayables,
  storeVendorGeneralPayment,
  type PartyDebtRecordRow,
  type PartyDebtRow,
  type PartyPaymentRow,
  type PartyPurchaseRow,
  type VendorShowPayload,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { formatAfghanDateValue } from '@/lib/datetime'
import type { BusinessAccountRow, BusinessShowData } from '@/lib/user'
import { isBusinessAccountActive } from '@/lib/user'
import { PartyShowPdfDownloadButton } from '@/pages/company/PartyShowPdfDownloadButton'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }


function reasonLabel(reason: string | null | undefined, description: string | null | undefined, t: (key: string) => string) {
  if (!reason) return description || '—'
  const key = `desktop.debt_reason_${reason}`
  const label = t(key)
  return label === key ? description || reason : label
}

export function CompanyVendorShowPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '', vendorId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [payload, setPayload] = useState<VendorShowPayload | null>(null)
  const [accounts, setAccounts] = useState<BusinessAccountRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [debtOpen, setDebtOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)

  const load = async () => {
    if (!token || !companyId || !vendorId) return
    setLoading(true)
    setError(null)
    try {
      setPayload(await fetchVendorShow(token, companyId, vendorId))
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
  }, [token, companyId, vendorId])

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!payload?.vendor) {
    return <div className="alert-error">{error || t('desktop.no_vendors')}</div>
  }

  const vendor = payload.vendor
  const debts = payload.vendorDebts || []
  const canManage =
    Boolean(payload.permissions?.canManageVendors ?? business.permissions?.canManageVendors) &&
    business.is_active
  const canDelete =
    Boolean(payload.permissions?.canDeleteRecords ?? business.permissions?.canDeleteRecords) &&
    business.is_active
  const canViewPurchases = Boolean(
    business.permissions?.canViewInventory || business.permissions?.canManageInventory,
  )
  const purchases = pickVendorPurchases(payload)

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId, 'vendors')} className="btn-secondary btn-sm">
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
                <i className="fa-solid fa-coins" /> {t('desktop.set_previous_payables')}
              </button>
              <button
                type="button"
                className="btn-outline-success btn-sm"
                onClick={() => setPayOpen(true)}
              >
                <i className="fa-solid fa-hand-holding-dollar" /> {t('desktop.vendor_general_pay')}
              </button>
            </>
          ) : null}
          <PartyShowPdfDownloadButton
            kind="vendor"
            party={vendor}
            debts={debts}
            debtRecords={payload.vendorDebtRecords || []}
            payments={payload.vendorPayments || []}
            purchases={purchases}
            filenameSlug={String(vendorId)}
          />
          {canManage ? (
            <Link
              to={businessPath(companyId, `vendors/${vendorId}/setup`)}
              className="btn-success btn-sm"
            >
              <i className="fa-regular fa-pen-to-square" /> {t('desktop.edit')}
            </Link>
          ) : null}
        </div>
      </div>

      <div className="dash-header dash-header--section mb-3">
        <h5 className="mb-0">
          {t('desktop.vendor_details')} — {vendor.name}
        </h5>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="party-details">
        <table className="party-info-table">
          <tbody>
            <tr>
              <th>{t('desktop.name')}</th>
              <td>{vendor.name || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.payables')}</th>
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
                              <span className="badge-success">{t('desktop.prepayment')}</span>
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
              <th>{t('desktop.phone')}</th>
              <td>{vendor.phone || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.email')}</th>
              <td>{vendor.email || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.address')}</th>
              <td>{vendor.address || '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <VendorPurchasesTable
        rows={purchases}
        locale={locale}
        t={t}
        companyId={companyId}
        canViewPurchases={canViewPurchases}
      />

      <div className="party-history-grid">
        <VendorPayablesTable rows={payload.vendorDebtRecords || []} locale={locale} t={t} />
        <VendorPaymentsTable
          rows={payload.vendorPayments || []}
          locale={locale}
          t={t}
          canManage={canManage}
          canDeleteRecords={canDelete}
          onDelete={
            token
              ? async (paymentId) => {
                  await deleteVendorPayment(token, companyId, vendorId, paymentId)
                  await load()
                }
              : undefined
          }
        />
      </div>

      <CashActionModal
        open={debtOpen}
        title={t('desktop.set_previous_payables')}
        accounts={accounts}
        debts={[]}
        allowZero
        allowNegative={false}
        useAllAccounts
        hint={null}
        onClose={() => setDebtOpen(false)}
        onSubmit={async (form) => {
          if (!token) return
          await setVendorPreviousPayables(token, companyId, vendorId, form)
          setDebtOpen(false)
          await load()
        }}
      />

      <CashActionModal
        open={payOpen}
        title={t('desktop.vendor_general_pay')}
        accounts={accounts}
        debts={debts}
        allowZero={false}
        allowNegative
        useAllAccounts={false}
        hint={t('desktop.vendor_payment_signed_hint')}
        onClose={() => setPayOpen(false)}
        onSubmit={async (form) => {
          if (!token) return
          await storeVendorGeneralPayment(token, companyId, vendorId, form)
          setPayOpen(false)
          await load()
        }}
      />
    </div>
  )
}

function VendorPurchasesTable({
  rows,
  locale,
  t,
  companyId,
  canViewPurchases,
}: {
  rows: PartyPurchaseRow[]
  locale: 'fa' | 'ps' | 'en'
  t: (key: string) => string
  companyId: string
  canViewPurchases: boolean
}) {
  return (
    <section className="party-section party-purchases" id="vendor-purchases">
      <h6>{t('desktop.vendor_purchases')}</h6>
      <div className="table-wrap">
        <table className="data-table data-table--compact text-center">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('desktop.purchase_number')}</th>
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
                <td colSpan={8}>{t('desktop.no_purchases')}</td>
              </tr>
            ) : (
              rows.map((row, index) => {
                const remaining = Number(row.remaining_amount ?? 0)
                const purchaseLabel = row.purchase_number ?? row.id
                return (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>
                      {canViewPurchases ? (
                        <Link
                          to={businessPath(companyId, `purchases/${row.purchase_number ?? row.id}`)}
                          className="party-invoice-link"
                        >
                          {purchaseLabel}
                        </Link>
                      ) : (
                        purchaseLabel
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

function VendorPayablesTable({
  rows,
  locale,
  t,
}: {
  rows: PartyDebtRecordRow[]
  locale: 'fa' | 'ps' | 'en'
  t: (key: string) => string
}) {
  return (
    <section className="party-section">
      <h6>{t('desktop.vendor_payables_records')}</h6>
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
                <td colSpan={8}>{t('desktop.no_payables_records')}</td>
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
                    <td>{reasonLabel(row.reason, row.description, t)}</td>
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

function VendorPaymentsTable({
  rows,
  locale,
  t,
  canManage,
  canDeleteRecords,
  onDelete,
}: {
  rows: PartyPaymentRow[]
  locale: 'fa' | 'ps' | 'en'
  t: (key: string) => string
  canManage: boolean
  canDeleteRecords: boolean
  onDelete?: (paymentId: number) => Promise<void>
}) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<PartyPaymentRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const openDelete = (row: PartyPaymentRow) => {
    setSelected(row)
    setError(null)
    setConfirmOpen(true)
  }

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
      <h6>{t('desktop.vendor_payments_list')}</h6>
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
                    <td>{formatMoney(row.amount)}</td>
                    <td>{formatAfghanDateValue(row.created_at, locale)}</td>
                    <td>
                      <button
                        type="button"
                        className={`btn-icon ${canDelete ? 'btn-icon--danger' : ''}`}
                        disabled={!canDelete}
                        title={
                          canDelete
                            ? t('desktop.delete')
                            : t('desktop.payment_linked_to_purchase')
                        }
                        onClick={() => canDelete && openDelete(row)}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

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

function CashActionModal({
  open,
  title,
  accounts,
  debts,
  allowZero,
  allowNegative,
  useAllAccounts,
  hint,
  onClose,
  onSubmit,
}: {
  open: boolean
  title: string
  accounts: BusinessAccountRow[]
  debts: PartyDebtRow[]
  allowZero: boolean
  allowNegative: boolean
  useAllAccounts: boolean
  hint: string | null
  onClose: () => void
  onSubmit: (payload: {
    company_account_id: string
    amount: string
    description?: string
  }) => Promise<void>
}) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!open) {
      setError(null)
      setAccountId('')
      setAmount('')
      setDescription('')
      return
    }
    if (!useAllAccounts && debts.length === 1 && debts[0].company_account_id) {
      setAccountId(String(debts[0].company_account_id))
    }
  }, [open, debts, useAllAccounts])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    setError(null)
    try {
      await onSubmit({
        company_account_id: accountId,
        amount,
        description: description || undefined,
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
        remaining: null as number | null,
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

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <form onSubmit={(e) => void submit(e)} className="form-grid">
        {error ? <div className="alert-error">{error}</div> : null}
        {hint ? <p className="muted small">{hint}</p> : null}
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
        {!useAllAccounts && selected?.remaining != null ? (
          <p className="muted">
            {t('desktop.payables')}: <strong>{formatMoney(selected.remaining)}</strong>
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
        <label>
          {t('desktop.remark')}
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>
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
