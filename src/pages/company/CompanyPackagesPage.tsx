import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import {
  deleteInternetPackage,
  fetchInternetPackages,
  saveInternetPackage,
  type InternetPackageRow,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

type Draft = {
  name: string
  data_amount: string
  data_unit: 'mb' | 'gb'
  price: string
  validity_amount: string
  validity_unit: 'day' | 'month'
}

const emptyDraft = (): Draft => ({
  name: '',
  data_amount: '',
  data_unit: 'gb',
  price: '',
  validity_amount: '30',
  validity_unit: 'day',
})

export function CompanyPackagesPage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const canManage = Boolean(business.permissions?.canCreateSales) && business.is_active

  const [rows, setRows] = useState<InternetPackageRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<InternetPackageRow | 'new' | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InternetPackageRow | null>(null)
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const load = async () => {
    if (!token) return
    try {
      setRows(await fetchInternetPackages(token, companyId))
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId])

  const openNew = () => {
    setFormError(null)
    setDraft(emptyDraft())
    setEditing('new')
  }

  const openEdit = (row: InternetPackageRow) => {
    setFormError(null)
    setDraft({
      name: row.name,
      data_amount: String(row.data_amount),
      data_unit: row.data_unit === 'mb' ? 'mb' : 'gb',
      price: String(row.price),
      validity_amount: String(row.validity_amount),
      validity_unit: row.validity_unit === 'month' ? 'month' : 'day',
    })
    setEditing(row)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !editing) return
    setBusy(true)
    setFormError(null)
    try {
      await saveInternetPackage(
        token,
        companyId,
        {
          name: draft.name.trim(),
          data_amount: Number(draft.data_amount),
          data_unit: draft.data_unit,
          price: Number(draft.price),
          validity_amount: Number(draft.validity_amount),
          validity_unit: draft.validity_unit,
        },
        editing === 'new' ? undefined : editing.id,
      )
      setEditing(null)
      await load()
    } catch (err) {
      setFormError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const openDelete = (row: InternetPackageRow) => {
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
    if ((deleteTarget.customer_packages_count ?? 0) > 0) return
    if (deleteStep === 1) {
      setDeleteStep(2)
      return
    }
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteInternetPackage(token, companyId, deleteTarget.id)
      setDeleteTarget(null)
      setDeleteStep(1)
      await load()
    } catch (err) {
      setDeleteError(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const deleteBlocked = (deleteTarget?.customer_packages_count ?? 0) > 0

  const unitLabel = (unit: string) => (unit === 'mb' ? t('desktop.package_unit_mb') : t('desktop.package_unit_gb'))
  const validityLabel = (amount: number, unit: string) =>
    `${amount} ${unit === 'month' ? t('desktop.package_unit_month') : t('desktop.package_unit_day')}`

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link className="btn-secondary btn-sm" to={businessPath(companyId)}>
          {t('desktop.back')}
        </Link>
        {canManage ? (
          <button type="button" className="btn-primary" onClick={openNew}>
            {t('desktop.add_package')}
          </button>
        ) : null}
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="table-wrap party-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('desktop.package_name')}</th>
              <th>{t('desktop.package_amount')}</th>
              <th>{t('desktop.package_price')}</th>
              <th>{t('desktop.package_validity')}</th>
              {canManage ? <th /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={canManage ? 5 : 4}>{t('desktop.no_records')}</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.name}</td>
                  <td>
                    {formatMoney(row.data_amount)} {unitLabel(row.data_unit)}
                  </td>
                  <td>{formatMoney(row.price)}</td>
                  <td>{validityLabel(row.validity_amount, row.validity_unit)}</td>
                  {canManage ? (
                    <td>
                      <button type="button" className="btn-secondary btn-sm" onClick={() => openEdit(row)}>
                        {t('desktop.edit')}
                      </button>{' '}
                      <button type="button" className="btn-danger btn-sm" onClick={() => openDelete(row)}>
                        {t('desktop.delete')}
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal open={Boolean(deleteTarget)} onClose={closeDelete} title={t('desktop.package_delete_title')}>
        <div className="form-grid" dir="rtl">
          {deleteBlocked ? (
            <div className="alert-error" style={{ margin: 0 }}>
              {t('desktop.package_delete_blocked')}
            </div>
          ) : (
            <>
              <p style={{ margin: 0 }}>
                {t('desktop.package_delete_step1')} <strong>{deleteTarget?.name}</strong>
              </p>
              {deleteStep === 2 ? (
                <div className="alert-error" style={{ margin: 0 }}>
                  {t('desktop.package_delete_step2')}
                </div>
              ) : null}
            </>
          )}
          {deleteError ? <div className="alert-error">{deleteError}</div> : null}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={closeDelete} disabled={deleting}>
              {deleteBlocked ? t('desktop.close') : t('desktop.cancel')}
            </button>
            {deleteBlocked ? null : (
              <button type="button" className="btn-danger" onClick={() => void confirmDelete()} disabled={deleting}>
                {deleting
                  ? t('desktop.processing')
                  : deleteStep === 1
                    ? t('desktop.confirm_delete_step_one')
                    : t('desktop.confirm_delete')}
              </button>
            )}
          </div>
        </div>
      </Modal>

      <Modal open={editing !== null} onClose={() => !busy && setEditing(null)} title={t('desktop.add_package')} wide>
        <form className="form-grid" onSubmit={(event) => void submit(event)}>
          {formError ? <div className="alert-error">{formError}</div> : null}
          <label>
            {t('desktop.package_name')}
            <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} required />
          </label>
          <label>
            {t('desktop.package_amount')}
            <input
              className="eng-input"
              dir="ltr"
              inputMode="decimal"
              value={draft.data_amount}
              onChange={(event) => setDraft({ ...draft, data_amount: event.target.value })}
              required
            />
          </label>
          <label>
            {t('desktop.package_unit')}
            <Select
              value={draft.data_unit}
              onChange={(event) => setDraft({ ...draft, data_unit: event.target.value === 'mb' ? 'mb' : 'gb' })}
            >
              <option value="gb">{t('desktop.package_unit_gb')}</option>
              <option value="mb">{t('desktop.package_unit_mb')}</option>
            </Select>
          </label>
          <label>
            {t('desktop.package_price')}
            <input
              className="eng-input"
              dir="ltr"
              inputMode="decimal"
              value={draft.price}
              onChange={(event) => setDraft({ ...draft, price: event.target.value })}
              required
            />
          </label>
          <label>
            {t('desktop.package_validity')}
            <input
              className="eng-input"
              dir="ltr"
              inputMode="numeric"
              value={draft.validity_amount}
              onChange={(event) => setDraft({ ...draft, validity_amount: event.target.value })}
              required
            />
          </label>
          <label>
            {t('desktop.package_validity_unit')}
            <Select
              value={draft.validity_unit}
              onChange={(event) =>
                setDraft({ ...draft, validity_unit: event.target.value === 'month' ? 'month' : 'day' })
              }
            >
              <option value="day">{t('desktop.package_unit_day')}</option>
              <option value="month">{t('desktop.package_unit_month')}</option>
            </Select>
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" disabled={busy} onClick={() => setEditing(null)}>
              {t('desktop.cancel')}
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
