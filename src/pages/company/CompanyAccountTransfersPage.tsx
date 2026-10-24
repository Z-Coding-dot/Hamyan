import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { SearchField } from '@/components/inputs/SearchField'
import { Modal } from '@/components/ui/Modal'
import { showErrorToast, showSuccessToast } from '@/components/ui/SuccessToast'
import { TransferBetweenAccountsModal } from '@/pages/company/TransferBetweenAccountsModal'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import { buildAccountTransfersPdfHtml } from '@/lib/accountTransfersPdfHtml'
import {
  deleteAccountTransfer,
  fetchAccountTransfers,
  fetchBusinessAccountsList,
  transferBetweenAccounts,
  type AccountTransferRow,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { assetUrl } from '@/lib/config'
import { localizeCurrency } from '@/lib/currency'
import { formatJalaliDateTime } from '@/lib/datetime'
import { downloadHtmlAsA4Pdf } from '@/lib/invoicePrint'
import type { BusinessAccountRow, BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import { scheduleBusinessDashboardRefresh } from '@/store/useListsCacheStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyAccountTransfersPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const canManage = Boolean(business.permissions?.canManageAccounts) && business.is_active
  const canDelete = Boolean(business.permissions?.canDeleteRecords) && business.is_active
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [rows, setRows] = useState<AccountTransferRow[]>([])
  const [accounts, setAccounts] = useState<BusinessAccountRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [transferOpen, setTransferOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<AccountTransferRow | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [pdfBusy, setPdfBusy] = useState(false)

  const loadTransfers = async () => {
    if (!token || !companyId) return
    setLoading(true)
    setError(null)
    try {
      setRows(await fetchAccountTransfers(token, companyId))
    } catch (err) {
      setError(getApiErrorMessage(err))
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  const loadAccounts = async () => {
    if (!token || !companyId || !canManage) return
    try {
      setAccounts(await fetchBusinessAccountsList(token, companyId))
    } catch {
      setAccounts([])
    }
  }

  useEffect(() => {
    void loadTransfers()
    void loadAccounts()
  }, [token, companyId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) =>
      [row.from_account_name, row.to_account_name, row.remark, row.currency].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(q),
      ),
    )
  }, [rows, search])

  const closeDeleteModal = () => {
    if (deletingId) return
    setDeleteTarget(null)
    setDeleteError(null)
  }

  const downloadPdf = async () => {
    if (pdfBusy || loading) return
    setPdfBusy(true)
    try {
      const profile = (business.profile || {}) as {
        phone?: string | null
        address_dari?: string | null
        address_english?: string | null
      }
      const html = buildAccountTransfersPdfHtml({
        rows: filtered,
        search: search.trim() || undefined,
        companyName: business.company?.name || 'Hamyan',
        logoUrl: assetUrl(business.company?.logo),
        companyPhone: profile.phone || null,
        companyAddress:
          locale === 'en'
            ? profile.address_english || profile.address_dari || null
            : profile.address_dari || profile.address_english || null,
        t,
        locale,
      })
      await downloadHtmlAsA4Pdf(html, `account-transfers-${companyId}-a4.pdf`)
      showSuccessToast(t('desktop.saved_success'))
    } catch {
      showErrorToast(t('desktop.invoice_export_failed'))
    } finally {
      setPdfBusy(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !canDelete || !deleteTarget?.id) return
    setDeletingId(deleteTarget.id)
    setDeleteError(null)
    try {
      await deleteAccountTransfer(token, companyId, deleteTarget.id)
      showSuccessToast(t('desktop.account_transfer_deleted'))
      setDeleteTarget(null)
      await loadTransfers()
      await loadAccounts()
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId, 'accounts')} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.company_accounts')}
        </Link>
        <div className="party-toolbar-end">
          <button type="button" className="btn-secondary btn-sm" onClick={() => void loadTransfers()} disabled={loading}>
            <i className={`fa-solid fa-rotate${loading ? ' fa-spin' : ''}`} /> {t('desktop.refresh')}
          </button>
          <button
            type="button"
            className="btn-outline-primary btn-sm"
            disabled={pdfBusy || loading}
            onClick={() => void downloadPdf()}
          >
            <i className={`fa-solid ${pdfBusy ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`} />{' '}
            {pdfBusy ? t('desktop.processing') : t('desktop.download_pdf_a4')}
          </button>
          {canManage ? (
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => {
                void loadAccounts()
                setTransferOpen(true)
              }}
            >
              <i className="fa-solid fa-right-left" /> {t('desktop.transfer_between_accounts')}
            </button>
          ) : null}
        </div>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <SearchField
        value={search}
        onChange={setSearch}
        placeholder={t('desktop.search')}
      />

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : filtered.length === 0 ? (
        <div className="party-empty">{t('desktop.no_account_transfers')}</div>
      ) : (
        <div className="table-wrap party-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('desktop.date')}</th>
                <th>{t('desktop.transfer_from_account')}</th>
                <th>{t('desktop.transfer_to_account')}</th>
                <th>{t('desktop.amount')}</th>
                <th>{t('desktop.currency')}</th>
                <th>{t('desktop.remark')}</th>
                {canDelete ? <th>{t('desktop.action')}</th> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>{row.id}</td>
                  <td dir="ltr">{formatJalaliDateTime(row.created_at, locale)}</td>
                  <td>
                    {row.out_transaction_id ? (
                      <Link to={businessPath(companyId, `transactions/${row.out_transaction_id}`)}>
                        {row.from_account_name || t('desktop.account')}
                      </Link>
                    ) : (
                      row.from_account_name || t('desktop.account')
                    )}
                  </td>
                  <td>
                    {row.in_transaction_id ? (
                      <Link to={businessPath(companyId, `transactions/${row.in_transaction_id}`)}>
                        {row.to_account_name || t('desktop.account')}
                      </Link>
                    ) : (
                      row.to_account_name || t('desktop.account')
                    )}
                  </td>
                  <td>{formatMoney(row.amount)}</td>
                  <td>{localizeCurrency(row.currency, t)}</td>
                  <td>{row.remark || '—'}</td>
                  {canDelete ? (
                    <td>
                      <button
                        type="button"
                        className="btn-icon btn-icon--danger"
                        disabled={deletingId === row.id}
                        title={t('desktop.delete_account_transfer')}
                        onClick={() => {
                          setDeleteError(null)
                          setDeleteTarget(row)
                        }}
                      >
                        {deletingId === row.id ? (
                          <span className="spinner spinner--sm" />
                        ) : (
                          <i className="fa-solid fa-trash" />
                        )}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <TransferBetweenAccountsModal
        open={transferOpen}
        onClose={() => setTransferOpen(false)}
        accounts={accounts}
        onSubmit={async (payload) => {
          if (!token) return
          await transferBetweenAccounts(token, companyId, payload)
          showSuccessToast(t('desktop.transfer_success'))
          setTransferOpen(false)
          await loadTransfers()
          await loadAccounts()
          scheduleBusinessDashboardRefresh(token, userKey, companyId)
        }}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        title={t('desktop.delete_account_transfer')}
      >
        {deleteError ? <div className="alert-error">{deleteError}</div> : null}
        <p className="muted mb-2">{t('desktop.confirm_delete_account_transfer')}</p>
        <p className="acc-create-confirm__warn mb-3">{t('desktop.confirm_delete_account_transfer_warn')}</p>
        {deleteTarget ? (
          <div className="warehouse-transfer-delete-card mb-3">
            <div className="fw-semibold">
              {deleteTarget.from_account_name || t('desktop.account')} →{' '}
              {deleteTarget.to_account_name || t('desktop.account')}
            </div>
            <div className="small mt-1">
              {t('desktop.amount')}:{' '}
              <strong>
                {formatMoney(deleteTarget.amount)} {localizeCurrency(deleteTarget.currency, t)}
              </strong>
            </div>
          </div>
        ) : null}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={Boolean(deletingId)}
            onClick={closeDeleteModal}
          >
            {t('desktop.cancel')}
          </button>
          <button
            type="button"
            className="btn-danger"
            disabled={Boolean(deletingId)}
            onClick={() => void handleDelete()}
          >
            {deletingId ? t('desktop.processing') : t('desktop.delete')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
