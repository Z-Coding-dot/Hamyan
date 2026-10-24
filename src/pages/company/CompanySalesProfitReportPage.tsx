import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { localizeCurrency } from '@/lib/currency'

import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchSalesProfitReport,
  type SalesProfitReportPayload,
  type SalesProfitReportRow,
} from '@/lib/business'
import { formatJalaliSlash } from '@/lib/datetime'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }
type ViewMode = 'dated' | 'merged' | 'invoice'

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function fmt(value: number | string | null | undefined): string {
  const n = Number(value || 0)
  return Number.isFinite(n) ? n.toLocaleString('en-US') : '0'
}

export function CompanySalesProfitReportPage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const canViewReports = Boolean(business.permissions?.canViewReports)

  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [view, setView] = useState<ViewMode>('dated')
  const [rows, setRows] = useState<SalesProfitReportRow[]>([])
  const [summary, setSummary] = useState<SalesProfitReportPayload['summary']>({})
  const [context, setContext] = useState<SalesProfitReportPayload['reportContext']>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (params: { from: string; to: string; view: ViewMode }) => {
      if (!token || !companyId || !canViewReports) return
      setLoading(true)
      setError(null)
      try {
        const data = await fetchSalesProfitReport(token, companyId, {
          from: params.from || undefined,
          to: params.to || undefined,
          view: params.view,
        })
        setRows(data.profitRows)
        setSummary(data.summary ?? {})
        setContext(data.reportContext ?? {})
      } catch (err) {
        setError(getApiErrorMessage(err))
        setRows([])
        setSummary({})
        setContext({})
      } finally {
        setLoading(false)
      }
    },
    [token, companyId, canViewReports],
  )

  useEffect(() => {
    if (!canViewReports) return
    void load({ from, to, view })
    // initial load only; subsequent loads happen on filter actions
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId, canViewReports])

  const applyFilters = (next: Partial<{ from: string; to: string; view: ViewMode }>) => {
    const params = {
      from: next.from !== undefined ? next.from : from,
      to: next.to !== undefined ? next.to : to,
      view: next.view !== undefined ? next.view : view,
    }
    if (next.from !== undefined) setFrom(next.from)
    if (next.to !== undefined) setTo(next.to)
    if (next.view !== undefined) setView(next.view)
    void load(params)
  }

  if (!canViewReports) {
    return <Navigate to={businessPath(companyId)} replace />
  }

  const sellCurrency = context?.sell_currency
  const capitalCurrency = context?.capital_currency
  const accountsDiffer = Boolean(context?.accounts_differ)
  const tableColSpan =
    (view === 'dated' ? 1 : 0) + (view === 'invoice' ? 1 : 0) + 5 + (accountsDiffer ? 1 : 0)
  const companyName = business.company?.name || ''

  return (
    <div className="dash-div party-page profit-report-page" dir="rtl">
      <div className="dash-header mb-2 profit-report-header">
        <h5>
          {t('desktop.profit_report')} <span>{companyName}</span>
        </h5>
      </div>

      <div className="alert alert-info profit-report-note" role="alert">
        {t('desktop.gross_profit_note')}
      </div>

      <div className="profit-report-filters no-print">
        <div className="profit-report-filters__dates">
          <label>
            {t('desktop.from_date')}
            <input
              type="date"
              className="eng-input"
              value={from}
              onChange={(e) => applyFilters({ from: e.target.value })}
            />
          </label>
          <label>
            {t('desktop.to_date')}
            <input
              type="date"
              className="eng-input"
              value={to}
              onChange={(e) => applyFilters({ to: e.target.value })}
            />
          </label>
        </div>

        <div className="profit-report-filters__actions">
          <button
            type="button"
            className={`btn ${view === 'dated' ? 'btn-primary' : 'btn-outline-primary'}`}
            onClick={() => applyFilters({ view: 'dated' })}
          >
            {t('desktop.view_separate')}
          </button>
          <button
            type="button"
            className={`btn ${view === 'merged' ? 'btn-success' : 'btn-outline-success'}`}
            onClick={() => applyFilters({ view: 'merged' })}
          >
            {t('desktop.show_merged')}
          </button>
          <button
            type="button"
            className={`btn ${view === 'invoice' ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => applyFilters({ view: 'invoice' })}
          >
            {t('desktop.view_by_invoice')}
          </button>
          <button
            type="button"
            className="btn btn-outline-info"
            onClick={() => {
              const today = todayIso()
              applyFilters({ from: today, to: today })
            }}
          >
            {t('desktop.dash_today')}
          </button>
          <button type="button" className="btn btn-outline-dark" onClick={() => window.print()}>
            {t('desktop.print_pdf')}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => applyFilters({ from: '', to: '' })}
          >
            {t('desktop.clear_filters')}
          </button>
          <Link to={businessPath(companyId, 'sales')} className="btn btn-outline-primary">
            {t('desktop.sales')}
          </Link>
        </div>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="profit-report-summary">
        <div className="profit-report-summary__grid">
          <div className="profit-summary-card profit-summary-card--qty">
            <div className="profit-summary-card__label">{t('desktop.quantity')}</div>
            <div className="profit-summary-card__value">{fmt(summary?.total_sold_qty)}</div>
          </div>

          <div className="profit-summary-accounts">
            <div className="profit-summary-card">
              <div className="profit-summary-card__label">{t('desktop.sale_account')}</div>
              <div className="profit-summary-row">
                <span>{t('desktop.sale_cost')}</span>
                <strong className="text-info">
                  {fmt(summary?.total_sale_in_sell_currency)} {localizeCurrency(sellCurrency, t)}
                </strong>
              </div>
              <div className="profit-summary-row">
                <span>{t('desktop.purchase_cost')}</span>
                <strong className="text-warning">
                  {fmt(summary?.total_purchase_in_sell_currency)} {localizeCurrency(sellCurrency, t)}
                </strong>
              </div>
              <div className="profit-summary-row">
                <span>{t('desktop.profit_in_sale_account')}</span>
                <strong className="text-success">
                  {fmt(summary?.total_profit_in_sell_currency)} {localizeCurrency(sellCurrency, t)}
                </strong>
              </div>
            </div>

            {accountsDiffer ? (
              <div className="profit-summary-card">
                <div className="profit-summary-card__label">{t('desktop.capital_account')}</div>
                <div className="profit-summary-row">
                  <span>{t('desktop.sale_cost_capital')}</span>
                  <strong className="text-info">
                    {fmt(summary?.total_sale_in_capital_currency)} {localizeCurrency(capitalCurrency, t)}
                  </strong>
                </div>
                <div className="profit-summary-row">
                  <span>{t('desktop.purchase_cost_capital')}</span>
                  <strong className="text-warning">
                    {fmt(summary?.total_purchase_in_capital_currency)} {localizeCurrency(capitalCurrency, t)}
                  </strong>
                </div>
                <div className="profit-summary-row">
                  <span>{t('desktop.profit_in_capital_account')}</span>
                  <strong className="text-primary">
                    {fmt(summary?.total_profit_in_capital_currency)} {localizeCurrency(capitalCurrency, t)}
                  </strong>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="profit-report-summary__footer">
          <strong>{t('desktop.sale_account')}:</strong> {localizeCurrency(sellCurrency, t)}
          <span className="mx-2">|</span>
          <strong>{t('desktop.capital_account')}:</strong> {localizeCurrency(capitalCurrency, t)}
        </div>
      </div>

      {loading ? <p className="muted">{t('desktop.loading')}</p> : null}

      <div className="table-wrap party-table-wrap profit-report-table-wrap">
        <table className="data-table profit-report-table">
          <thead>
            <tr>
              {view === 'dated' ? <th>{t('desktop.date')}</th> : null}
              {view === 'invoice' ? <th>{t('desktop.sale_invoice')}</th> : null}
              <th>{t('desktop.item')}</th>
              <th>{t('desktop.sold_quantity')}</th>
              <th>{t('desktop.sale_cost')}</th>
              <th>{t('desktop.purchase_cost')}</th>
              <th>{t('desktop.profit_in_sale_account')}</th>
              {accountsDiffer ? <th>{t('desktop.profit_in_capital_account')}</th> : null}
            </tr>
          </thead>
          <tbody>
            {!loading && rows.length === 0 ? (
              <tr>
                <td colSpan={tableColSpan} className="text-center muted">
                  {t('desktop.no_data')}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${row.item_id}-${row.sale_date}-${row.invoice_id}-${index}`}>
                  {view === 'dated' ? (
                    <td>{row.sale_date ? formatJalaliSlash(row.sale_date) : '—'}</td>
                  ) : null}
                  {view === 'invoice' ? (
                    <td>{row.invoice_number ?? row.invoice_id ?? '—'}</td>
                  ) : null}
                  <td>{row.item_name || '—'}</td>
                  <td>{fmt(row.sold_qty)}</td>
                  <td className="text-info">
                    {fmt(row.sale_in_sell_currency)} {localizeCurrency(sellCurrency, t)}
                  </td>
                  <td className="text-warning">
                    {fmt(row.purchase_in_sell_currency)} {localizeCurrency(sellCurrency, t)}
                  </td>
                  <td
                    className={
                      Number(row.profit_in_sell_currency || 0) < 0 ? 'text-danger' : 'text-success'
                    }
                  >
                    {fmt(row.profit_in_sell_currency)} {localizeCurrency(sellCurrency, t)}
                  </td>
                  {accountsDiffer ? (
                    <td
                      className={
                        Number(row.profit_in_capital_currency || 0) < 0
                          ? 'text-danger'
                          : 'text-primary'
                      }
                    >
                      {fmt(row.profit_in_capital_currency)} {localizeCurrency(capitalCurrency, t)}
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
