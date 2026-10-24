import { useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { localizeCurrency } from '@/lib/currency'

import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchItemPurchaseCostHistory,
  type BusinessItemShow,
  type ItemPurchaseCostHistoryRow,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'


export function CompanyItemPurchaseCostHistoryPage() {
  const { t } = useTranslation()
  const location = useLocation()
  const { companyId = '', itemId = '' } = useParams()
  const token = useAuthStore(useShallow((s) => s.token))
  const segment = location.pathname.includes('raw-materials') ? 'raw-materials' : 'items'

  const [item, setItem] = useState<BusinessItemShow | null>(null)
  const [rows, setRows] = useState<ItemPurchaseCostHistoryRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !companyId || !itemId) return
    setLoading(true)
    void fetchItemPurchaseCostHistory(token, companyId, itemId)
      .then((data) => {
        setItem(data.item)
        setRows(data.costHistory)
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [token, companyId, itemId])

  const latest = rows[0] ?? null

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link className="btn-secondary btn-sm" to={businessPath(companyId, segment)}>
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        {item ? (
          <Link className="btn-info btn-sm" to={businessPath(companyId, `${segment}/${item.id}`)}>
            <i className="fa-regular fa-eye" /> {t('desktop.view')}
          </Link>
        ) : null}
      </div>

      <div className="dash-header dash-header--section mb-2">
        <h5 className="mb-0">{t('desktop.average_cost_history')}</h5>
        {item ? (
          <p className="muted mb-0">
            {item.name}
            {item.code ? (
              <>
                {' — '}
                <span dir="ltr">{item.code}</span>
              </>
            ) : null}
          </p>
        ) : null}
      </div>

      {error ? <div className="alert-error">{error}</div> : null}
      {loading ? <p className="muted">{t('desktop.loading')}</p> : null}

      {!loading && latest ? (
        <div className="items-summary-card mb-2">
          <strong>{t('desktop.latest')}:</strong>{' '}
          {formatMoney(latest.unit_cost)} {localizeCurrency(latest.currency, t)}
          {latest.date_jalali ? ` · ${latest.date_jalali}` : null}
          {latest.source_label ? ` · ${latest.source_label}` : null}
        </div>
      ) : null}

      {!loading && rows.length === 0 ? (
        <div className="party-empty">{t('desktop.no_records')}</div>
      ) : (
        <div className="table-wrap party-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('desktop.date')}</th>
                <th>{t('desktop.avg_purchase_cost')}</th>
                <th>{t('desktop.quantity')}</th>
                <th>{t('desktop.source')}</th>
                <th>{t('desktop.remark')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>{row.date_jalali || '—'}</td>
                  <td>
                    {formatMoney(row.unit_cost)} {localizeCurrency(row.currency, t)}
                  </td>
                  <td>{row.quantity ?? '—'}</td>
                  <td>{row.source_label || row.source || '—'}</td>
                  <td>{row.remark || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
