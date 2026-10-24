import { FormEvent, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import {
  createItemCategory,
  deleteItemCategory,
  fetchItemCategories,
  updateItemCategory,
  type BusinessItemCategoryRow,
} from '@/lib/business'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

function isCategoryHasItemsError(err: unknown): boolean {
  if (!(err instanceof AxiosError) || err.response?.status !== 422) return false
  const data = err.response.data as { errors?: { code?: string[] }; message?: string } | undefined
  if (data?.errors?.code?.includes('category_has_items')) return true
  return /جنس مرتبط|has items|detach/i.test(String(data?.message || ''))
}

export function CompanyItemCategoriesPage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))

  const canManage = Boolean(business.permissions?.canManageInventory) && business.is_active
  const canDelete = Boolean(business.permissions?.canDeleteRecords) && business.is_active

  const [rows, setRows] = useState<BusinessItemCategoryRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [modal, setModal] = useState<BusinessItemCategoryRow | 'new' | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BusinessItemCategoryRow | null>(null)
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const load = async () => {
    if (!token) return
    try {
      setRows(await fetchItemCategories(token, companyId))
    } catch (e) {
      setError(getApiErrorMessage(e))
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId])

  const openDelete = (row: BusinessItemCategoryRow) => {
    setDeleteError(null)
    setDeleteStep(1)
    setDeleteTarget(row)
  }

  const closeDelete = () => {
    if (deleting) return
    setDeleteTarget(null)
    setDeleteStep(1)
    setDeleteError(null)
  }

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return

    const itemsCount = Number(deleteTarget.items_count ?? 0) || 0
    if (itemsCount > 0 && deleteStep === 1) {
      setDeleteStep(2)
      return
    }

    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteItemCategory(token, companyId, deleteTarget.id, {
        detach_items: itemsCount > 0,
      })
      setDeleteTarget(null)
      setDeleteStep(1)
      await load()
    } catch (e) {
      if (isCategoryHasItemsError(e)) {
        setDeleteStep(2)
      } else {
        setDeleteError(getApiErrorMessage(e))
      }
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
        {canManage ? (
          <button type="button" className="btn-primary" onClick={() => setModal('new')}>
            {t('desktop.add_category')}
          </button>
        ) : null}
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="table-wrap party-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('desktop.name')}</th>
              <th>{t('desktop.remark')}</th>
              <th>{t('desktop.items')}</th>
              <th>{t('desktop.action')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>{r.name}</td>
                <td>{r.remark || '—'}</td>
                <td>{r.items_count ?? 0}</td>
                <td>
                  {canManage || canDelete ? (
                    <div className="party-row-actions">
                      {canManage ? (
                        <button type="button" className="btn-secondary btn-sm" onClick={() => setModal(r)}>
                          {t('desktop.edit')}
                        </button>
                      ) : null}
                      {canDelete ? (
                        <button type="button" className="btn-danger btn-sm" onClick={() => openDelete(r)}>
                          {t('desktop.delete')}
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CategoryModal
        row={modal}
        onClose={() => setModal(null)}
        onSave={async (payload) => {
          if (!token || !modal) return
          if (modal === 'new') await createItemCategory(token, companyId, payload)
          else await updateItemCategory(token, companyId, modal.id, payload)
          setModal(null)
          await load()
        }}
      />

      <Modal
        open={Boolean(canDelete && deleteTarget)}
        onClose={closeDelete}
        title={t('desktop.delete_category_confirm_title')}
      >
        <div className="form-grid" dir="rtl">
          {deleteStep === 1 ? (
            <p style={{ margin: 0 }}>
              {t('desktop.delete_category_confirm_message')}{' '}
              <strong>{deleteTarget?.name}</strong>
            </p>
          ) : (
            <div className="alert-error" style={{ margin: 0 }}>
              {t('desktop.delete_category_detach_warning', {
                count: Number(deleteTarget?.items_count ?? 0) || 0,
                name: deleteTarget?.name || '',
              })}
            </div>
          )}
          {deleteError ? <div className="alert-error">{deleteError}</div> : null}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={closeDelete} disabled={deleting}>
              {t('desktop.cancel')}
            </button>
            <button type="button" className="btn-danger" onClick={() => void confirmDelete()} disabled={deleting}>
              {deleting
                ? t('desktop.processing')
                : deleteStep === 2
                  ? t('desktop.confirm_detach_and_delete_category')
                  : t('desktop.confirm_delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

function CategoryModal({
  row,
  onClose,
  onSave,
}: {
  row: BusinessItemCategoryRow | 'new' | null
  onClose: () => void
  onSave: (p: { name: string; remark?: string }) => Promise<void>
}) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [remark, setRemark] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setName(typeof row === 'object' && row ? row.name || '' : '')
    setRemark(typeof row === 'object' && row ? row.remark || '' : '')
    setError(null)
  }, [row])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave({ name, remark: remark || undefined })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={Boolean(row)}
      onClose={onClose}
      title={row === 'new' ? t('desktop.add_category') : t('desktop.edit_category')}
    >
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        {error ? <div className="alert-error">{error}</div> : null}
        <label>
          {t('desktop.name')}
          <input required value={name} onChange={(e) => setName(e.target.value)} disabled={saving} />
        </label>
        <label>
          {t('desktop.remark')}
          <input value={remark} onChange={(e) => setRemark(e.target.value)} disabled={saving} />
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
            {t('desktop.close')}
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
