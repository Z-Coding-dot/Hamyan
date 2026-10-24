import { useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { showErrorToast, showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchJournal,
  type JournalPayload,
  type JournalRow,
} from '@/lib/business'
import { assetUrl } from '@/lib/config'
import {
  formatMoney,
  translateTransactionDescription,
  translateTransactionLabel,
} from '@/lib/companyDashboard'
import { localizeCurrency } from '@/lib/currency'
import {
  formatAfghanDateValue,
  toLocalYmd,
  todayLocalYmd,
} from '@/lib/datetime'
import { downloadHtmlAsA4Pdf } from '@/lib/invoicePrint'
import { buildJournalPdfHtml } from '@/lib/journalPdfHtml'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

function shiftYmd(ymd: string, days: number): string {
  const [year, month, day] = ymd.split('-').map(Number)
  if (!year || !month || !day) return todayLocalYmd()
  return toLocalYmd(new Date(year, month - 1, day + days, 12, 0, 0))
}

function formatClock(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function moneyChips(
  map: Record<string, number> | undefined,
): Array<{ currency: string; amount: number }> {
  return Object.entries(map || {})
    .map(([currency, amount]) => ({ currency, amount: Number(amount) || 0 }))
    .filter((row) => row.amount !== 0)
}

function rowParts(row: JournalRow, t: (key: string) => string) {
  const title = translateTransactionLabel(row, {
    credit: t('desktop.credit_in'),
    debit: t('desktop.debit_out'),
    sales: t('desktop.sales'),
    expenses: t('desktop.expenses'),
  })
  const extra = translateTransactionDescription(row.description)
  return {
    title,
    account: row.account_name || t('desktop.account'),
    extra: extra && extra !== title ? extra : '',
  }
}

export function CompanyJournalPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [date, setDate] = useState(todayLocalYmd())
  const [rows, setRows] = useState<JournalRow[]>([])
  const [summary, setSummary] = useState<JournalPayload['summary']>({})
  const [loading, setLoading] = useState(true)
  const [pdfBusy, setPdfBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (selectedDate: string) => {
      if (!token || !companyId) return
      setLoading(true)
      setError(null)
      try {
        const data = await fetchJournal(token, companyId, selectedDate)
        setRows(data.rows)
        setSummary(data.summary ?? {})
        if (data.date) setDate(data.date)
      } catch (err) {
        setError(getApiErrorMessage(err))
        setRows([])
        setSummary({})
      } finally {
        setLoading(false)
      }
    },
    [token, companyId],
  )

  useEffect(() => {
    void load(date)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId])

  const onDateChange = (value: string) => {
    const next = value || todayLocalYmd()
    setDate(next)
    void load(next)
  }

  const inChips = moneyChips(summary.in_by_currency)
  const outChips = moneyChips(summary.out_by_currency)

  const downloadPdf = async () => {
    if (pdfBusy || loading) return
    setPdfBusy(true)
    try {
      const profile = (business.profile || {}) as {
        phone?: string | null
        address_dari?: string | null
        address_english?: string | null
      }
      const html = buildJournalPdfHtml({
        rows,
        date,
        count: summary.count,
        inByCurrency: summary.in_by_currency,
        outByCurrency: summary.out_by_currency,
        companyName: business.company?.name || 'Hamyan',
        logoUrl: assetUrl(business.company?.logo),
        companyPhone: profile.phone || null,
        companyAddress:
          locale === 'en'
            ? profile.address_english || profile.address_dari || null
            : profile.address_dari || profile.address_english || null,
        t,
        locale,
      })
      await downloadHtmlAsA4Pdf(html, `journal-${companyId}-${date}-a4.pdf`)
      showSuccessToast(t('desktop.saved_success'))
    } catch {
      showErrorToast(t('desktop.invoice_export_failed'))
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="dash-div party-page journal-page" dir="rtl">
      <section className="journal-shell">
        <div className="journal-toolbar no-print">
          <div className="journal-nav">
            <button
              type="button"
              className="journal-nav__btn"
              onClick={() => onDateChange(shiftYmd(date, -1))}
              aria-label={t('desktop.from_date')}
            >
              <i className="fa-solid fa-angle-right" />
            </button>
            <JalaliDatePicker value={date} onChange={onDateChange} />
            <button
              type="button"
              className="journal-nav__btn"
              onClick={() => onDateChange(shiftYmd(date, 1))}
              aria-label={t('desktop.to_date')}
            >
              <i className="fa-solid fa-angle-left" />
            </button>
          </div>
          <div className="journal-toolbar__actions">
            <button type="button" className="btn-secondary btn-sm" onClick={() => onDateChange(todayLocalYmd())}>
              {t('desktop.dash_today')}
            </button>
            <button
              type="button"
              className="btn-outline-primary btn-sm"
              disabled={pdfBusy || loading}
              onClick={() => void downloadPdf()}
            >
              <i className={`fa-solid ${pdfBusy ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`} />{' '}
              {pdfBusy ? t('desktop.processing') : t('desktop.download_pdf_a4')}
            </button>
          </div>
        </div>

        <div className="journal-kpis">
          <div className="journal-kpi">
            <div className="journal-kpi__label">{t('desktop.date')}</div>
            <div className="journal-kpi__value journal-kpi__value--date">
              {formatAfghanDateValue(date, locale)}
            </div>
            <div className="journal-kpi__meta">
              {formatMoney(summary.count || 0)} {t('desktop.transactions')}
            </div>
          </div>
          <div className="journal-kpi journal-kpi--in">
            <div className="journal-kpi__label">{t('desktop.credit_in')}</div>
            <div className="journal-kpi__chips">
              {inChips.length === 0 ? (
                <span className="muted">{t('desktop.no_data')}</span>
              ) : (
                inChips.map((chip) => (
                  <strong key={`in-${chip.currency}`}>
                    {formatMoney(chip.amount)} {localizeCurrency(chip.currency, t)}
                  </strong>
                ))
              )}
            </div>
          </div>
          <div className="journal-kpi journal-kpi--out">
            <div className="journal-kpi__label">{t('desktop.debit_out')}</div>
            <div className="journal-kpi__chips">
              {outChips.length === 0 ? (
                <span className="muted">{t('desktop.no_data')}</span>
              ) : (
                outChips.map((chip) => (
                  <strong key={`out-${chip.currency}`}>
                    {formatMoney(chip.amount)} {localizeCurrency(chip.currency, t)}
                  </strong>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : rows.length === 0 ? (
        <div className="party-empty">{t('desktop.no_journal_on_date')}</div>
      ) : (
        <div className="table-wrap party-table-wrap journal-table-wrap">
          <table className="data-table journal-table">
            <thead>
              <tr>
                <th>{t('desktop.journal_detail')}</th>
                <th>{t('desktop.currency')}</th>
                <th>{t('desktop.credit_in')}</th>
                <th>{t('desktop.debit_out')}</th>
                <th>{t('desktop.journal_balance')}</th>
                <th>{t('desktop.journal_time')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const inAmount = Number(row.in_amount || 0)
                const outAmount = Number(row.out_amount || 0)
                const parts = rowParts(row, t)
                return (
                  <tr key={row.id} className={inAmount > 0 ? 'is-in' : 'is-out'}>
                    <td>
                      <Link
                        className="journal-detail"
                        to={businessPath(companyId, `transactions/${row.id}`)}
                      >
                        <strong>{parts.title}</strong>
                        <small>
                          {parts.account}
                          {parts.extra ? ` · ${parts.extra}` : ''}
                        </small>
                      </Link>
                    </td>
                    <td>{localizeCurrency(row.currency, t)}</td>
                    <td className="num in">{inAmount > 0 ? formatMoney(inAmount) : '—'}</td>
                    <td className="num out">{outAmount > 0 ? formatMoney(outAmount) : '—'}</td>
                    <td className="num">{formatMoney(row.balance_after)}</td>
                    <td className="num time" dir="ltr">
                      {formatClock(row.created_at)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
