import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { SearchField } from '@/components/inputs/SearchField'
import { getApiErrorMessage } from '@/lib/auth'
import {
  createBusinessStaff,
  fetchBusinessStaff,
  updateBusinessStaff,
  type BusinessStaffRow,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { formatAfghanDateValue } from '@/lib/datetime'
import type { BusinessShowData } from '@/lib/user'
import { StaffAbsenceModal } from '@/pages/company/staff/StaffAbsenceModal'
import { StaffFormModal } from '@/pages/company/staff/StaffFormModal'
import { staffFullName } from '@/pages/company/staff/staffHelpers'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyStaffPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const canManage = Boolean(business.permissions?.canManageStaff) && business.is_active

  const [rows, setRows] = useState<BusinessStaffRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [absenceOpen, setAbsenceOpen] = useState(false)
  const [selected, setSelected] = useState<BusinessStaffRow | null>(null)

  const load = async () => {
    if (!token || !companyId) return
    setLoading(true)
    setError(null)
    try {
      setRows(await fetchBusinessStaff(token, companyId))
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
    return rows.filter((row) => {
      const hay = `${row.first_name || ''} ${row.last_name || ''} ${row.position || ''} ${row.phone || ''} ${row.email || ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [rows, search])

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId)} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
      </div>

      {canManage ? (
        <div className="mb-2" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setSelected(null)
              setFormOpen(true)
            }}
          >
            <i className="fa-solid fa-circle-plus" /> {t('desktop.add_staff')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setAbsenceOpen(true)}>
            <i className="fa-solid fa-user-xmark" /> {t('desktop.add_staff_absence')}
          </button>
        </div>
      ) : null}

      <SearchField
        value={search}
        onChange={setSearch}
        placeholder={t('desktop.search_by_name')}
      />

      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : filtered.length === 0 ? (
        <div className="party-empty">{t('desktop.no_staff')}</div>
      ) : (
        <div className="table-wrap party-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('desktop.name')}</th>
                <th>{t('desktop.position')}</th>
                <th>{t('desktop.hire_date')}</th>
                <th>{t('desktop.monthly_salary')}</th>
                <th>{t('desktop.phone')}</th>
                <th>{t('desktop.email')}</th>
                <th>{t('desktop.action')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link to={businessPath(companyId, `staff/${row.id}`)}>
                      {staffFullName(row)}
                    </Link>
                  </td>
                  <td>{row.position || '—'}</td>
                  <td>
                    {formatAfghanDateValue(row.active_contract_start_date, locale)}
                  </td>
                  <td>
                    {row.active_contract_monthly_salary != null
                      ? formatMoney(row.active_contract_monthly_salary)
                      : '—'}
                  </td>
                  <td>{row.phone || '—'}</td>
                  <td>{row.email || '—'}</td>
                  <td>
                    <div className="party-actions" style={{ margin: 0, gap: 6 }}>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => navigate(businessPath(companyId, `staff/${row.id}`))}
                      >
                        {t('desktop.view')}
                      </button>
                      {canManage ? (
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => {
                            setSelected(row)
                            setFormOpen(true)
                          }}
                        >
                          {t('desktop.edit')}
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {canManage ? (
        <StaffFormModal
          open={formOpen}
          staff={selected}
          onClose={() => {
            setFormOpen(false)
            setSelected(null)
          }}
          onSubmit={async (payload) => {
            if (!token) return
            if (selected) {
              await updateBusinessStaff(token, companyId, selected.id, payload)
            } else {
              await createBusinessStaff(token, companyId, payload)
            }
            setFormOpen(false)
            setSelected(null)
            await load()
          }}
        />
      ) : null}

      {canManage && token ? (
        <StaffAbsenceModal
          open={absenceOpen}
          token={token}
          companyId={companyId}
          staff={rows}
          onClose={() => setAbsenceOpen(false)}
          onSaved={load}
        />
      ) : null}
    </div>
  )
}
