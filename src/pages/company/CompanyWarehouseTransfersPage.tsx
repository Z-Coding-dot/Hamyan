import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { SearchField } from '@/components/inputs/SearchField'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchWarehouseTransfers,
  reverseWarehouseTransfer,
  type WarehouseTransferRow,
} from '@/lib/business'
import { formatJalaliDateTime } from '@/lib/datetime'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

function formatQty(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n.toLocaleString('en-US') : '0'
}

function transferTypeLabel(type: string | null | undefined, t: (key: string) => string): string {
  if (type === 'warehouse_to_warehouse') return t('desktop.warehouse_to_warehouse')
  if (type === 'warehouse_to_company') return t('desktop.warehouse_to_company')
  if (type === 'company_to_warehouse') return t('desktop.company_to_warehouse')
  return type || '—'
}

function transferRouteLabel(row: WarehouseTransferRow, t: (key: string) => string): string {
  const salesCenter = t('desktop.company_sales_center')
  if (row.type === 'warehouse_to_company') {
    return `${row.from_warehouse_name || '—'} → ${salesCenter}`
  }
  if (row.type === 'company_to_warehouse') {
    return `${salesCenter} → ${row.to_warehouse_name || '—'}`
  }
  return `${row.from_warehouse_name || '—'} → ${row.to_warehouse_name || '—'}`
}

export function CompanyWarehouseTransfersPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const canManage = Boolean(business.permissions?.canManageInventory) && business.is_active
  const canDelete = Boolean(business.permissions?.canDeleteRecords) && business.is_active
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [rows, setRows] = useState<WarehouseTransferRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<WarehouseTransferRow | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const load = async () => {
    if (!token || !companyId) return
    setLoading(true)
    setError(null)
    try {
      setRows(await fetchWarehouseTransfers(token, companyId))
    } catch (err) {
      setError(getApiErrorMessage(err))
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((row) =>
      [row.item_name, row.item_code, row.from_warehouse_name, row.to_warehouse_name, row.remark].some(
        (value) => String(value || '').toLowerCase().includes(q),
      ),
    )
  }, [rows, search])

  const closeDeleteModal = () => {
    if (deletingId) return
    setDeleteTarget(null)
    setDeleteError(null)
  }

  const handleDelete = async () => {
    if (!token || !canDelete || !deleteTarget?.id || deleteTarget.is_reversed) return
    setDeletingId(deleteTarget.id)
    setDeleteError(null)
    try {
      await reverseWarehouseTransfer(token, companyId, deleteTarget.id)
      setRows((current) =>
        current.map((row) =>
          row.id === deleteTarget.id
            ? { ...row, is_reversed: true, reversed_at: new Date().toISOString() }
            : row,
        ),
      )
      setDeleteTarget(null)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="dash-div party-page warehouse-transfers-page" dir="rtl">
      <div className="dash-header dash-header--section mb-2">
        <h5 className="mb-0">{t('desktop.warehouse_transfer_records')}</h5>
      </div>

      <div className="party-toolbar warehouse-transfers-toolbar">
        <Link
          className="btn-secondary btn-sm"
          to={businessPath(companyId, 'warehouses/inventory')}
        >
          <i className="fa-solid fa-reply" /> {t('desktop.warehouse_inventory')}
        </Link>
        {canManage ? (
          <Link className="btn-primary btn-sm" to={businessPath(companyId, 'warehouses/inventory')}>
            <i className="fa-solid fa-right-left" /> {t('desktop.new_transfer')}
          </Link>
        ) : null}
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
        <div className="party-empty">{t('desktop.no_transfer_records')}</div>
      ) : (
        <div className="table-wrap party-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('desktop.date')}</th>
                <th>{t('desktop.item')}</th>
                <th>{t('desktop.transfer_type')}</th>
                <th>{t('desktop.transfer_route')}</th>
                <th>{t('desktop.quantity')}</th>
                <th>{t('desktop.description')}</th>
                <th>{t('desktop.status')}</th>
                {canDelete ? <th>{t('desktop.action')}</th> : null}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className={row.is_reversed ? 'is-reversed-row' : undefined}>
                  <td>{row.id}</td>
                  <td dir="ltr">{formatJalaliDateTime(row.created_at, locale)}</td>
                  <td>
                    <div className="fw-semibold">{row.item_name || '—'}</div>
                    {row.item_code ? <small className="muted">{row.item_code}</small> : null}
                  </td>
                  <td>{transferTypeLabel(row.type, t)}</td>
                  <td>{transferRouteLabel(row, t)}</td>
                  <td className="fw-semibold">{formatQty(row.quantity)}</td>
                  <td>{row.remark || '—'}</td>
                  <td>
                    {row.is_reversed ? (
                      <span className="badge-muted">{t('desktop.transfer_reversed')}</span>
                    ) : (
                      <span className="badge-success">{t('desktop.active')}</span>
                    )}
                  </td>
                  {canDelete ? (
                    <td>
                      {!row.is_reversed ? (
                        <button
                          type="button"
                          className="btn-icon btn-icon--danger"
                          disabled={deletingId === row.id}
                          title={t('desktop.delete')}
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
                      ) : null}
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(deleteTarget)}
        onClose={closeDeleteModal}
        title={t('desktop.delete_transfer')}
      >
        {deleteError ? <div className="alert-error">{deleteError}</div> : null}
        <p className="muted mb-3">{t('desktop.confirm_delete_transfer')}</p>
        {deleteTarget ? (
          <div className="warehouse-transfer-delete-card mb-3">
            <div className="fw-semibold">{deleteTarget.item_name}</div>
            <div className="muted small mt-1">{transferRouteLabel(deleteTarget, t)}</div>
            <div className="small mt-1">
              {t('desktop.quantity')}: <strong>{formatQty(deleteTarget.quantity)}</strong>
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
