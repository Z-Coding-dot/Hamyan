import { FormEvent, useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import {
  createWarehouse,
  deleteWarehouse,
  fetchWarehouses,
  updateWarehouse,
  type WarehouseDetail,
} from '@/lib/business'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import { hydrateListsCache, useListsCacheStore } from '@/store/useListsCacheStore'

type CompanyOutletContext = { business: BusinessShowData }

function canDeleteWarehouse(row: WarehouseDetail): boolean {
  if (typeof row.can_delete === 'boolean') return row.can_delete
  return Number(row.stocked_items_count ?? row.items_count ?? 0) === 0
}

export function CompanyWarehousesPage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const navigate = useNavigate()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const ensureWarehouses = useListsCacheStore((s) => s.ensureWarehouses)
  const refreshWarehouses = useListsCacheStore((s) => s.refreshWarehouses)
  const cachedWarehouses = useListsCacheStore((s) =>
    companyId ? s.getWarehouses(userKey, companyId) : null,
  )
  const canManage = Boolean(business.permissions?.canManageInventory) && business.is_active
  const canDelete = Boolean(business.permissions?.canDeleteRecords) && business.is_active

  const [rows, setRows] = useState<WarehouseDetail[]>(() => cachedWarehouses ?? [])
  const [loading, setLoading] = useState(!cachedWarehouses)
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<WarehouseDetail | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<WarehouseDetail | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const load = async (force = false) => {
    if (!token) return
    const hasCache = Boolean(useListsCacheStore.getState().getWarehouses(userKey, companyId))
    if (!hasCache) setLoading(true)
    try {
      setError(null)
      const data = await ensureWarehouses(token, userKey, companyId, { force })
      if (data) setRows(data)
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  const reload = async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchWarehouses(token, companyId)
      setRows(data)
      await useListsCacheStore.getState().setWarehouses(userKey, companyId, data)
    } catch (e) {
      setError(getApiErrorMessage(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    void hydrateListsCache(userKey).then(() => {
      if (!active) return
      const cached = useListsCacheStore.getState().getWarehouses(userKey, companyId)
      if (cached) setRows(cached)
    })
    return () => {
      active = false
    }
  }, [userKey, companyId])

  useEffect(() => {
    void load()
  }, [token, companyId, userKey])

  useEffect(() => {
    if (cachedWarehouses) setRows(cachedWarehouses)
  }, [cachedWarehouses])

  const openDelete = (row: WarehouseDetail) => {
    if (!canDeleteWarehouse(row)) return
    setDeleteError(null)
    setDeleteTarget(row)
  }

  const closeDelete = () => {
    if (deleting) return
    setDeleteTarget(null)
    setDeleteError(null)
  }

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return
    if (!canDeleteWarehouse(deleteTarget)) {
      setDeleteError(t('desktop.warehouse_has_items_not_deletable'))
      return
    }
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteWarehouse(token, companyId, deleteTarget.id)
      setDeleteTarget(null)
      void refreshWarehouses(token, userKey, companyId).then((data) => {
        if (data) setRows(data)
      })
    } catch (e) {
      setDeleteError(getApiErrorMessage(e))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link className="btn-secondary btn-sm" to={businessPath(companyId)}>
          {t('desktop.back')}
        </Link>
        <button
          type="button"
          className="btn-secondary btn-sm"
          disabled={loading}
          onClick={() => void reload()}
        >
          <i className={`fa-solid fa-rotate-left${loading ? ' fa-spin' : ''}`} /> {t('desktop.refresh')}
        </button>
        {canManage ? (
          <button type="button" className="btn-primary" onClick={() => setModal('new')}>
            {t('desktop.add_warehouse')}
          </button>
        ) : null}
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="table-wrap party-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('desktop.name')}</th>
              <th>{t('desktop.address')}</th>
              <th>{t('desktop.items')}</th>
              <th>{t('desktop.quantity')}</th>
              <th>{t('desktop.action')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const deletable = canDeleteWarehouse(r)
              return (
                <tr key={r.id}>
                  <td>
                    <Link to={businessPath(companyId, `warehouses/${r.id}`)}>{r.name}</Link>
                  </td>
                  <td>{r.address || '—'}</td>
                  <td>{r.items_count ?? 0}</td>
                  <td>{r.total_quantity ?? 0}</td>
                  <td>
                    <div className="party-row-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => navigate(businessPath(companyId, `warehouses/${r.id}`))}
                      >
                        {t('desktop.view')}
                      </button>
                      {canManage || canDelete ? (
                        <>
                          {canManage ? (
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => setModal(r)}
                            >
                              {t('desktop.edit')}
                            </button>
                          ) : null}
                          {canDelete ? (
                            <button
                              type="button"
                              className={`btn-sm ${deletable ? 'btn-danger' : 'btn-secondary'}`}
                              disabled={!deletable || (deleting && deleteTarget?.id === r.id)}
                              title={
                                deletable
                                  ? t('desktop.delete')
                                  : t('desktop.warehouse_has_items_not_deletable')
                              }
                              onClick={() => openDelete(r)}
                            >
                              {t('desktop.delete')}
                            </button>
                          ) : null}
                        </>
                      ) : null}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <WarehouseModal
        row={modal}
        onClose={() => setModal(null)}
        onSave={async (p) => {
          if (!token || !modal) return
          if (modal === 'new') await createWarehouse(token, companyId, p)
          else await updateWarehouse(token, companyId, modal.id, p)
          setModal(null)
          void refreshWarehouses(token, userKey, companyId).then((data) => {
            if (data) setRows(data)
          })
        }}
      />

      <Modal
        open={Boolean(deleteTarget)}
        onClose={closeDelete}
        title={t('desktop.delete_warehouse')}
      >
        <div dir="rtl">
          <p>
            {t('desktop.confirm_delete_warehouse')}
            {deleteTarget?.name ? (
              <>
                {' '}
                (<strong>{deleteTarget.name}</strong>)
              </>
            ) : null}
          </p>
          {deleteError ? <div className="alert-error">{deleteError}</div> : null}
          <div className="form-actions">
            <button type="button" className="btn-secondary" disabled={deleting} onClick={closeDelete}>
              {t('desktop.cancel')}
            </button>
            <button
              type="button"
              className="btn-danger"
              disabled={deleting || !deleteTarget || !canDeleteWarehouse(deleteTarget)}
              onClick={() => void confirmDelete()}
            >
              {deleting ? t('desktop.processing') : t('desktop.confirm_delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function WarehouseModal({
  row,
  onClose,
  onSave,
}: {
  row: WarehouseDetail | 'new' | null
  onClose: () => void
  onSave: (p: { name: string; address?: string; remark?: string }) => Promise<void>
}) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [remark, setRemark] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    setName(typeof row === 'object' && row ? row.name || '' : '')
    setAddress(typeof row === 'object' && row ? row.address || '' : '')
    setRemark(typeof row === 'object' && row ? row.remark || '' : '')
    setError(null)
    setProcessing(false)
  }, [row])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setProcessing(true)
    setError(null)
    try {
      await onSave({
        name,
        address: address || undefined,
        remark: remark || undefined,
      })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal
      open={Boolean(row)}
      onClose={onClose}
      title={row === 'new' ? t('desktop.add_warehouse') : t('desktop.edit_warehouse')}
    >
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        {error ? <div className="alert-error">{error}</div> : null}
        <label>
          {t('desktop.name')}
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          {t('desktop.address')}
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <label>
          {t('desktop.remark')}
          <input value={remark} onChange={(e) => setRemark(e.target.value)} />
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={processing}>
            {t('desktop.close')}
          </button>
          <button type="submit" className="btn-primary" disabled={processing || !name.trim()}>
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
