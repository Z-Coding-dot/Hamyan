import { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import {
  deleteCustomerInternetPackage,
  fetchCustomerInternetPackages,
  type CustomerInternetPackageRow,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { formatJalaliSlashFromYmd } from '@/lib/datetime'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyCustomerPackagesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const canSell = Boolean(business.permissions?.canCreateSales) && business.is_active
  const canDelete = Boolean(business.permissions?.canDeleteRecords) && business.is_active
  const [rows, setRows] = useState<CustomerInternetPackageRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<CustomerInternetPackageRow | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = () => {
    if (!token) return
    void fetchCustomerInternetPackages(token, companyId)
      .then(setRows)
      .catch((err) => setError(getApiErrorMessage(err)))
  }

  useEffect(() => {
    load()
  }, [token, companyId])

  const remove = async () => {
    if (!token || !selected) return
    setDeleting(true)
    setError(null)
    try {
      await deleteCustomerInternetPackage(token, companyId, selected.id)
      showSuccessToast(t('desktop.package_sale_deleted'))
      setSelected(null)
      load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const unitLabel = (unit: string) => (unit === 'mb' ? t('desktop.package_unit_mb') : t('desktop.package_unit_gb'))

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link className="btn-secondary btn-sm" to={businessPath(companyId)}>
          {t('desktop.back')}
        </Link>
        {canSell ? (
          <Link className="btn-primary" to={businessPath(companyId, 'package-sale')}>
            {t('desktop.sell_package')}
          </Link>
        ) : null}
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="table-wrap party-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>{t('desktop.customers')}</th>
              <th>{t('desktop.package_name')}</th>
              <th>{t('desktop.package_amount')}</th>
              <th>{t('desktop.package_price')}</th>
              <th>{t('desktop.package_paid')}</th>
              <th>{t('desktop.package_remaining')}</th>
              <th>{t('desktop.package_start')}</th>
              <th>{t('desktop.package_end')}</th>
              <th>{t('desktop.action')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={9}>{t('desktop.no_records')}</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.customer_name || row.customer_id}</td>
                  <td>{row.package_name}</td>
                  <td>
                    {formatMoney(row.data_amount)} {unitLabel(row.data_unit)}
                  </td>
                  <td>{formatMoney(row.price)}</td>
                  <td>{formatMoney(row.paid_amount)}</td>
                  <td>{formatMoney(row.remaining_amount)}</td>
                  <td>{formatJalaliSlashFromYmd(row.start_date)}</td>
                  <td>{formatJalaliSlashFromYmd(row.end_date)}</td>
                  <td>
                    <div className="party-row-actions">
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        title={t('desktop.view')}
                        onClick={() => navigate(businessPath(companyId, `customer-packages/${row.id}`))}
                      >
                        <i className="fa-regular fa-eye" />
                      </button>
                      {canDelete ? (
                        <button
                          type="button"
                          className="btn-danger btn-sm"
                          title={t('desktop.delete')}
                          disabled={deleting}
                          onClick={() => {
                            setError(null)
                            setSelected(row)
                          }}
                        >
                          <i className="fa-solid fa-trash" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={selected != null}
        onClose={() => {
          if (!deleting) setSelected(null)
        }}
        title={t('desktop.package_sale_delete_title')}
      >
        <p>{t('desktop.package_sale_delete_body')}</p>
        {error ? <div className="alert-error">{error}</div> : null}
        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={deleting} onClick={() => setSelected(null)}>
            {t('desktop.cancel')}
          </button>
          <button type="button" className="btn-danger" disabled={deleting} onClick={() => void remove()}>
            {deleting ? t('desktop.processing') : t('desktop.delete')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
