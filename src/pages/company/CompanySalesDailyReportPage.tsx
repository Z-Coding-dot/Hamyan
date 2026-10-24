import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { localizeCurrency } from '@/lib/currency'

import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchSalesDailyReport,
  type SalesDailyReportPayload,
  type SalesDailyReportRow,
} from '@/lib/business'
import { formatJalaliSlash } from '@/lib/datetime'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function fmt(value: number | string | null | undefined): string {
  const n = Number(value || 0)
  return Number.isFinite(n) ? n.toLocaleString('en-US') : '0'
}

export function CompanySalesDailyReportPage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const canViewReports = Boolean(business.permissions?.canViewReports)

  const [date, setDate] = useState(todayIso())
  const [rows, setRows] = useState<SalesDailyReportRow[]>([])
  const [summary, setSummary] = useState<SalesDailyReportPayload['summary']>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (selectedDate: string) => {
      if (!token || !companyId || !canViewReports) return
      setLoading(true)
      setError(null)
      try {
        const data = await fetchSalesDailyReport(token, companyId, selectedDate)
        setRows(data.salesReportRows)
        setSummary(data.summary ?? {})
        if (data.reportContext?.date) {
          setDate(data.reportContext.date)
        }
      } catch (err) {
        setError(getApiErrorMessage(err))
        setRows([])
        setSummary({})
      } finally {
        setLoading(false)
      }
    },
    [token, companyId, canViewReports],
  )

  useEffect(() => {
    if (!canViewReports) return
    void load(date)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId, canViewReports])

  const onDateChange = (value: string) => {
    setDate(value)
    void load(value)
  }

  const goToday = () => {
    const today = todayIso()
    setDate(today)
    void load(today)
  }

  if (!canViewReports) {
    return <Navigate to={businessPath(companyId)} replace />
  }

  const selectedDate = summary.date || date
  const totalsByCurrency = summary.totals_by_currency || {}
  const profitByCurrency = summary.profit_totals_by_currency || {}
  const companyName = business.company?.name || ''

  return (
    <div className="dash-div party-page profit-report-page daily-report-page" dir="rtl">
      <div className="dash-header mb-2 profit-report-header">
        <h5>
          {t('desktop.daily_sales_report')} <span>{companyName}</span>
        </h5>
      </div>

      <div className="profit-report-filters no-print">
        <div className="profit-report-filters__dates daily-report-filters__date">
          <label>
            {t('desktop.date')}
            <input
              type="date"
              className="eng-input"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
            />
          </label>
        </div>

        <div className="profit-report-filters__actions">
          <button type="button" className="btn btn-outline-info" onClick={goToday}>
            {t('desktop.dash_today')}
          </button>
          <Link to={businessPath(companyId, 'sales')} className="btn btn-outline-primary">
            {t('desktop.sales')}
          </Link>
          <Link to={businessPath(companyId, 'sales-profit-report')} className="btn btn-outline-success">
            {t('desktop.profit_report')}
          </Link>
          <button type="button" className="btn btn-outline-dark" onClick={() => window.print()}>
            {t('desktop.print_pdf')}
          </button>
        </div>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="profit-report-summary daily-report-summary">
        <div className="daily-report-summary__grid">
          <div className="profit-summary-card profit-summary-card--qty">
            <div className="profit-summary-card__label">{t('desktop.date')}</div>
            <div className="profit-summary-card__value profit-summary-card__value--sm">
              {selectedDate ? formatJalaliSlash(selectedDate) : '—'}
            </div>
          </div>
          <div className="profit-summary-card">
            <div className="profit-summary-card__label">{t('desktop.items_sold')}</div>
            <div className="profit-summary-card__value">{fmt(summary.total_items)}</div>
          </div>
          <div className="profit-summary-card">
            <div className="profit-summary-card__label">{t('desktop.qty_sold')}</div>
            <div className="profit-summary-card__value">{fmt(summary.total_sold_qty)}</div>
          </div>
          <div className="profit-summary-card">
            <div className="profit-summary-card__label">{t('desktop.invoices_count')}</div>
            <div className="profit-summary-card__value">{fmt(summary.total_invoices)}</div>
          </div>
        </div>

        <div className="daily-report-summary__section">
          <div className="profit-summary-card__label">{t('desktop.day_sales_total')}</div>
          {Object.keys(totalsByCurrency).length === 0 ? (
            <div className="muted small">{t('desktop.no_data')}</div>
          ) : (
            <div className="daily-report-chips">
              {Object.entries(totalsByCurrency).map(([currency, total]) => (
                <div key={currency} className="daily-report-chip">
                  {fmt(total)} {localizeCurrency(currency, t)}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="daily-report-summary__section">
          <div className="profit-summary-card__label">{t('desktop.day_profit_total')}</div>
          {Object.keys(profitByCurrency).length === 0 ? (
            <div className="muted small">{t('desktop.no_data')}</div>
          ) : (
            <div className="daily-report-chips">
              {Object.entries(profitByCurrency).map(([currency, total]) => (
                <div
                  key={currency}
                  className={`daily-report-chip ${Number(total || 0) < 0 ? 'text-danger' : 'text-success'}`}
                >
                  {fmt(total)} {localizeCurrency(currency, t)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : (
        <div className="table-wrap party-table-wrap profit-report-table-wrap">
          <table className="data-table profit-report-table">
            <thead>
              <tr>
                <th>{t('desktop.item')}</th>
                <th>{t('desktop.qty_sold')}</th>
                <th>{t('desktop.total_sales')}</th>
                <th>{t('desktop.avg_unit_price')}</th>
                <th>{t('desktop.profit_report')}</th>
                <th>{t('desktop.profit_per_unit')}</th>
                <th>{t('desktop.invoices_count')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center muted">
                    {t('desktop.no_sales_on_date')}
                  </td>
                </tr>
              ) : (
                rows.map((row, index) => (
                  <tr key={`${row.item_id}-${row.currency}-${index}`}>
                    <td>{row.item_name || '—'}</td>
                    <td>{fmt(row.sold_qty)}</td>
                    <td className="text-success">
                      {fmt(row.total_sales)} {localizeCurrency(row.currency, t)}
                    </td>
                    <td className="text-primary">
                      {fmt(row.average_unit_price)} {localizeCurrency(row.currency, t)}
                    </td>
                    <td className={Number(row.total_profit || 0) < 0 ? 'text-danger' : 'text-success'}>
                      {fmt(row.total_profit)} {localizeCurrency(row.currency, t)}
                    </td>
                    <td
                      className={
                        Number(row.average_unit_profit || 0) < 0 ? 'text-danger' : 'text-success'
                      }
                    >
                      {fmt(row.average_unit_profit)} {localizeCurrency(row.currency, t)}
                    </td>
                    <td>{fmt(row.invoice_count)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
