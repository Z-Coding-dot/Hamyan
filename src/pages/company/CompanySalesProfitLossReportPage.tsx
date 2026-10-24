import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchSalesProfitLossReport,
  type SalesProfitLossSummary,
} from '@/lib/business'
import { assetUrl } from '@/lib/config'
import { localizeCurrency } from '@/lib/currency'
import {
  dateToJalaliParts,
  jalaliMonthLength,
  jalaliToGregorianYmd,
  todayLocalYmd,
} from '@/lib/datetime'
import { downloadHtmlAsA4Pdf } from '@/lib/invoicePrint'
import { buildProfitLossReportPdfHtml } from '@/lib/profitLossReportPdfHtml'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import { useLocaleStore } from '@/store/useLocaleStore'

type CompanyOutletContext = { business: BusinessShowData }

function fmt(value: number | string | null | undefined): string {
  const n = Number(value || 0)
  return Number.isFinite(n) ? n.toLocaleString('en-US') : '0'
}

function currentJalaliMonthRange(): { from: string; to: string } {
  const parts = dateToJalaliParts(new Date())
  const from = jalaliToGregorianYmd(parts.year, parts.month, 1)
  const to = jalaliToGregorianYmd(parts.year, parts.month, jalaliMonthLength(parts.year, parts.month))
  return { from, to }
}

export function CompanySalesProfitLossReportPage() {
  const { t, i18n } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const canViewReports = Boolean(business.permissions?.canViewReports)

  const initialRange = useMemo(() => currentJalaliMonthRange(), [])
  const [from, setFrom] = useState(initialRange.from)
  const [to, setTo] = useState(initialRange.to)
  const [summary, setSummary] = useState<SalesProfitLossSummary>({})
  const [context, setContext] = useState<
    NonNullable<Awaited<ReturnType<typeof fetchSalesProfitLossReport>>['reportContext']>
  >({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pdfBusy, setPdfBusy] = useState(false)

  const load = useCallback(
    async (params: { from: string; to: string }) => {
      if (!token || !companyId || !canViewReports) return
      setLoading(true)
      setError(null)
      try {
        const data = await fetchSalesProfitLossReport(token, companyId, {
          from: params.from || undefined,
          to: params.to || undefined,
        })
        setSummary(data.summary ?? {})
        setContext(data.reportContext ?? {})
      } catch (err) {
        setError(getApiErrorMessage(err))
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
    void load({ from, to })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId, canViewReports])

  const applyRange = (nextFrom: string, nextTo: string) => {
    setFrom(nextFrom)
    setTo(nextTo)
    void load({ from: nextFrom, to: nextTo })
  }

  const downloadPdf = async () => {
    if (pdfBusy) return
    setPdfBusy(true)
    setError(null)
    try {
      const profile = (business.profile || {}) as {
        phone?: string | null
        address?: string | null
      }
      const html = buildProfitLossReportPdfHtml({
        summary,
        companyName: business.company?.name || '',
        logoUrl: assetUrl(business.company?.logo),
        companyPhone: profile.phone,
        companyAddress: profile.address,
        from,
        to,
        sellCurrency: context.sell_currency,
        capitalCurrency: context.capital_currency,
        accountsDiffer: Boolean(context.accounts_differ),
        t,
        locale: (locale || i18n.language || 'fa') as 'fa' | 'ps' | 'en',
      })
      await downloadHtmlAsA4Pdf(html, `profit-loss-${companyId}-a4.pdf`)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setPdfBusy(false)
    }
  }

  if (!canViewReports) {
    return <Navigate to={businessPath(companyId)} replace />
  }

  const sellCurrency = context.sell_currency
  const capitalCurrency = context.capital_currency
  const accountsDiffer = Boolean(context.accounts_differ)
  const companyName = business.company?.name || ''
  const net = Number(summary.net_profit_sell || 0)
  const netClass = net < 0 ? 'is-loss' : 'is-profit'

  const amountPair = (sell?: number, capital?: number) => (
    <>
      <strong>
        {fmt(sell)} {localizeCurrency(sellCurrency, t)}
      </strong>
      {accountsDiffer ? (
        <span className="muted">
          / {fmt(capital)} {localizeCurrency(capitalCurrency, t)}
        </span>
      ) : null}
    </>
  )

  return (
    <div className="dash-div party-page profit-report-page profit-loss-report-page" dir="rtl">
      <div className="party-toolbar no-print">
        <Link to={businessPath(companyId)} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        <button
          type="button"
          className="btn-secondary btn-sm"
          disabled={loading || pdfBusy}
          onClick={() => void downloadPdf()}
        >
          <i className={`fa-solid ${pdfBusy ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`} />{' '}
          {pdfBusy ? t('desktop.processing') : t('desktop.download_pdf_a4')}
        </button>
      </div>

      <div className="dash-header mb-2 profit-report-header">
        <h5>
          {t('desktop.profit_loss_report')} <span>{companyName}</span>
        </h5>
      </div>

      <div className="alert-info profit-report-note" role="alert">
        {t('desktop.pl_report_note')}
      </div>

      <div className="profit-report-filters no-print">
        <div className="profit-report-filters__dates">
          <label>
            {t('desktop.date_from')}
            <JalaliDatePicker value={from} onChange={(ymd) => applyRange(ymd, to)} />
          </label>
          <label>
            {t('desktop.date_to')}
            <JalaliDatePicker value={to} onChange={(ymd) => applyRange(from, ymd)} />
          </label>
        </div>
        <div className="profit-report-filters__actions">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={() => {
              const range = currentJalaliMonthRange()
              applyRange(range.from, range.to)
            }}
          >
            {t('desktop.pl_this_jalali_month')}
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={() => {
              const today = todayLocalYmd()
              applyRange(today, today)
            }}
          >
            {t('desktop.date_picker_today')}
          </button>
        </div>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}
      {loading ? (
        <div className="loading-state">{t('desktop.loading')}</div>
      ) : (
        <div className="plr-grid">
          <div className="plr-card">
            <div className="plr-card__label">{t('desktop.pl_gross_sales')}</div>
            <div className="plr-card__value">{amountPair(summary.gross_sales_sell, summary.gross_sales_capital)}</div>
          </div>
          <div className="plr-card">
            <div className="plr-card__label">{t('desktop.pl_cogs')}</div>
            <div className="plr-card__value">{amountPair(summary.cogs_sell, summary.cogs_capital)}</div>
          </div>
          <div className="plr-card">
            <div className="plr-card__label">{t('desktop.pl_gross_profit')}</div>
            <div className="plr-card__value">{amountPair(summary.gross_profit_sell, summary.gross_profit_capital)}</div>
          </div>
          <div className="plr-card">
            <div className="plr-card__label">{t('desktop.pl_discounts')}</div>
            <div className="plr-card__value">{amountPair(summary.discounts_sell, summary.discounts_capital)}</div>
          </div>
          <div className="plr-card">
            <div className="plr-card__label">{t('desktop.pl_expenses')}</div>
            <div className="plr-card__value">{amountPair(summary.expenses_sell, summary.expenses_capital)}</div>
          </div>
          {Number(summary.transfer_costs_sell) > 0 || Number(summary.transfer_costs_capital) > 0 ? (
            <div className="plr-card">
              <div className="plr-card__label">{t('desktop.pl_transfer_costs')}</div>
              <div className="plr-card__value">{amountPair(summary.transfer_costs_sell, summary.transfer_costs_capital)}</div>
              <div className="plr-card__hint">{t('desktop.pl_transfer_costs_hint')}</div>
            </div>
          ) : null}
          <div className={`plr-card plr-card--net ${netClass}`}>
            <div className="plr-card__label">{t('desktop.pl_net_profit')}</div>
            <div className="plr-card__value">{amountPair(summary.net_profit_sell, summary.net_profit_capital)}</div>
          </div>
        </div>
      )}
    </div>
  )
}
