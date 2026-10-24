import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useMeasurementUnits } from '@/hooks/useMeasurementUnits'
import { fetchWarehouseShow, type WarehouseDetail } from '@/lib/business'
import { getApiErrorMessage } from '@/lib/auth'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyWarehouseShowPage() {
  const { t } = useTranslation()
  const { companyId = '', warehouseId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const { resolveName } = useMeasurementUnits(companyId)
  const [warehouse, setWarehouse] = useState<WarehouseDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    void fetchWarehouseShow(token, companyId, warehouseId)
      .then(setWarehouse)
      .catch((e) => setError(getApiErrorMessage(e)))
  }, [token, companyId, warehouseId])

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link className="btn-secondary btn-sm" to={businessPath(companyId, 'warehouses')}>
          {t('desktop.back')}
        </Link>
      </div>
      <div className="dash-header dash-header--section mb-2">
        <h5 className="mb-0">
          {warehouse?.name || t('desktop.warehouse')} <span>{business.company.name}</span>
        </h5>
      </div>
      {error ? <div className="alert-error">{error}</div> : null}
      {!warehouse ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : (
        <>
          <p className="muted">
            {warehouse.address || '—'}
            {warehouse.remark ? ` — ${warehouse.remark}` : ''}
          </p>
          <div className="table-wrap party-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('desktop.name')}</th>
                  <th>{t('desktop.barcode')}</th>
                  <th>{t('desktop.quantity')}</th>
                  <th>{t('desktop.unit_label')}</th>
                </tr>
              </thead>
              <tbody>
                {(warehouse.items || []).map((x, i) => (
                  <tr key={x.id || `${x.item_id}-${i}`}>
                    <td>{x.name || x.item_name || '—'}</td>
                    <td>{x.code || x.item_code || '—'}</td>
                    <td>{x.quantity ?? 0}</td>
                    <td>{resolveName(x.unit_id, x.unit_name)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
