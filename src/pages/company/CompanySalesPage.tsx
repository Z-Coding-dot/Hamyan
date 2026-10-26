import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { SearchField } from '@/components/inputs/SearchField'
import { Modal } from '@/components/ui/Modal'
import { showErrorToast, showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  createQuickSale,
  createSaleDraft,
  destroySaleDraft,
  exchangePairFromAccounts,
  fetchBusinessAccountsList,
  fetchBusinessSales,
  parseExchangeRateContextFromError,
  type BusinessSaleRow,
  type QuickSaleExchangeRateContext,
} from '@/lib/business'
import { currenciesText, formatMoney } from '@/lib/companyDashboard'
import { assetUrl } from '@/lib/config'
import { formatAfghanDateValue, formatJalaliSlash } from '@/lib/datetime'
import { downloadHtmlAsA4Pdf } from '@/lib/invoicePrint'
import { buildSalesListPdfHtml } from '@/lib/salesListPdfHtml'
import type { BusinessAccountRow, BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { businessPath } from '@/store/useCompanyContextStore'
import { scheduleBusinessDashboardRefresh } from '@/store/useListsCacheStore'

type CompanyOutletContext = { business: BusinessShowData }

const SALES_PAGE_SIZE = 50

function statusLabel(status: number | string | null | undefined, t: (k: string) => string) {
  return Number(status) === 1 ? t('desktop.finalized') : t('desktop.draft')
}

function isExchangeRateRequired(err: unknown): boolean {
  if (!(err instanceof AxiosError) || err.response?.status !== 422) return false
  const data = err.response.data as
    | { message?: string; errors?: Record<string, string[] | undefined> }
    | undefined
  if (data?.errors?.exchange_rate?.length) return true
  const msg = String(data?.message || '')
  return /exchange|تبادل|نرخ/i.test(msg)
}

export function CompanySalesPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const canCreate =
    Boolean(business.permissions?.canCreateSales) && business.is_active
  const canManage =
    Boolean(business.permissions?.canManageSales || business.permissions?.canCreateSales) &&
    business.is_active
  const canDelete =
    Boolean(business.permissions?.canDeleteRecords) && business.is_active

  const [rows, setRows] = useState<BusinessSaleRow[]>([])
  const [totalsByCurrency, setTotalsByCurrency] = useState<Record<string, number>>({})
  const [accountCurrencies, setAccountCurrencies] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [currency, setCurrency] = useState('')
  const [status, setStatus] = useState('')
  const [applied, setApplied] = useState({ search: '', date_from: '', date_to: '', currency: '', status: '' })
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(false)
  const [nextOffset, setNextOffset] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [quickCreating, setQuickCreating] = useState(false)
  const [rateModalOpen, setRateModalOpen] = useState(false)
  const [exchangeRate, setExchangeRate] = useState('1')
  const [rateError, setRateError] = useState<string | null>(null)
  const [ratePair, setRatePair] = useState<QuickSaleExchangeRateContext | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BusinessSaleRow | null>(null)
  const [deleteStep, setDeleteStep] = useState<1 | 2>(1)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [pdfBusy, setPdfBusy] = useState(false)

    const rateLabel =
    ratePair?.from_currency && ratePair?.to_currency
      ? t('desktop.exchange_rate_pair', {
          from: localizeCurrency(ratePair.from_currency, t),
          to: localizeCurrency(ratePair.to_currency, t),
        })
      : t('desktop.exchange_rate')

  const totalsText = useMemo(
    () => currenciesText(totalsByCurrency, (code) => localizeCurrency(code, t)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalsByCurrency, i18n.language],
  )

  const listFilters = useMemo(
    () => ({
      search: applied.search || undefined,
      date_from: applied.date_from || undefined,
      date_to: applied.date_to || undefined,
      currency: applied.currency || undefined,
      status: applied.status || undefined,
    }),
    [applied],
  )

  const applySalesPage = (
    page: Awaited<ReturnType<typeof fetchBusinessSales>>,
    mode: 'replace' | 'append',
  ) => {
    setRows((prev) => {
      if (mode === 'replace') return page.sales
      const seen = new Set(prev.map((row) => row.id))
      return [...prev, ...page.sales.filter((row) => !seen.has(row.id))]
    })
    setTotalsByCurrency(page.totals_by_currency || {})
    setHasMore(page.meta.has_more)
    setNextOffset(page.meta.next_offset)
  }

  const load = async () => {
    if (!token || !companyId) return
    setLoading(true)
    setError(null)
    try {
      const page = await fetchBusinessSales(token, companyId, {
        limit: SALES_PAGE_SIZE,
        offset: 0,
        ...listFilters,
      })
      applySalesPage(page, 'replace')
    } catch (err) {
      setError(getApiErrorMessage(err))
      setRows([])
      setTotalsByCurrency({})
      setHasMore(false)
      setNextOffset(0)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!token || !companyId || loadingMore || !hasMore) return
    setLoadingMore(true)
    setError(null)
    try {
      const page = await fetchBusinessSales(token, companyId, {
        limit: SALES_PAGE_SIZE,
        offset: nextOffset,
        ...listFilters,
      })
      applySalesPage(page, 'append')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    if (!token || !companyId) return
    void fetchBusinessAccountsList(token, companyId)
      .then((accounts: BusinessAccountRow[]) => {
        const codes = Array.from(
          new Set(
            accounts
              .map((acc) => String(acc.currency || '').toLowerCase().trim())
              .filter(Boolean),
          ),
        ).sort()
        setAccountCurrencies(codes)
      })
      .catch(() => setAccountCurrencies([]))
  }, [token, companyId])

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId, listFilters])

  const submitFilters = (event: FormEvent) => {
    event.preventDefault()
    setApplied({
      search: search.trim(),
      date_from: dateFrom,
      date_to: dateTo,
      currency,
      status,
    })
  }

  const resetFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setCurrency('')
    setStatus('')
    setApplied({ search: '', date_from: '', date_to: '', currency: '', status: '' })
  }

  const resolveRatePair = async (err?: unknown) => {
    const fromError = err ? parseExchangeRateContextFromError(err) : null
    if (fromError) {
      setRatePair(fromError)
      if (fromError.suggested_rate || fromError.rate) {
        setExchangeRate(String(fromError.suggested_rate || fromError.rate))
      }
      return
    }
    if (!token || !companyId) return
    try {
      const accounts = await fetchBusinessAccountsList(token, companyId)
      setRatePair(exchangePairFromAccounts(accounts))
    } catch {
      /* keep previous pair */
    }
  }

  const startSale = async () => {
    if (!token) return
    setCreating(true)
    setError(null)
    try {
      const invoice = await createSaleDraft(token, companyId)
      navigate(businessPath(companyId, `sales/${invoice.id}`))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  const startQuickSale = async (rate?: string) => {
    if (!token) return
    setQuickCreating(true)
    setError(null)
    setRateError(null)
    try {
      const created = await createQuickSale(
        token,
        companyId,
        rate ? { exchange_rate: rate } : undefined,
      )
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      setRateModalOpen(false)
      navigate(businessPath(companyId, `sales/quick/${created.invoice_id ?? created.invoice.id}`))
    } catch (err) {
      if (!rate && isExchangeRateRequired(err)) {
        await resolveRatePair(err)
        setRateModalOpen(true)
        setRateError(t('desktop.needs_exchange_rate'))
      } else if (rateModalOpen) {
        setRateError(getApiErrorMessage(err))
      } else {
        setError(getApiErrorMessage(err))
      }
    } finally {
      setQuickCreating(false)
    }
  }

  const submitRate = async (event: FormEvent) => {
    event.preventDefault()
    await startQuickSale(exchangeRate)
  }

  const openDelete = (row: BusinessSaleRow) => {
    if (Number(row.status) !== 0) return
    setDeleteTarget(row)
    setDeleteStep(1)
    setDeleteError(null)
  }

  const closeDelete = () => {
    if (deleting) return
    setDeleteTarget(null)
    setDeleteStep(1)
    setDeleteError(null)
  }

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return
    if (deleteStep === 1) {
      setDeleteStep(2)
      return
    }
    setDeleting(true)
    setDeleteError(null)
    try {
      await destroySaleDraft(token, companyId, deleteTarget.id)
      setDeleteTarget(null)
      setDeleteStep(1)
      setDeleteError(null)
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      await load()
    } catch (err) {
      setDeleteError(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const downloadPdf = async () => {
    if (!token || !companyId || pdfBusy) return
    setPdfBusy(true)
    setError(null)
    try {
      let exportRows = rows
      if (hasMore) {
        const collected: BusinessSaleRow[] = []
        let offset = 0
        for (let i = 0; i < 50; i += 1) {
          const page = await fetchBusinessSales(token, companyId, {
            limit: 100,
            offset,
            ...listFilters,
          })
          collected.push(...page.sales)
          if (!page.meta.has_more) break
          offset = page.meta.next_offset
        }
        exportRows = collected
      }
      const profile = (business.profile || {}) as {
        phone?: string | null
        address_dari?: string | null
        address_english?: string | null
      }
      const html = buildSalesListPdfHtml({
        rows: exportRows,
        totalsText,
        companyName: business.company?.name || 'Hamyan',
        logoUrl: assetUrl(business.company?.logo),
        companyPhone: profile.phone || null,
        companyAddress:
          locale === 'en'
            ? profile.address_english || profile.address_dari || null
            : profile.address_dari || profile.address_english || null,
        filters: {
          search: applied.search || undefined,
          date_from: applied.date_from || undefined,
          date_to: applied.date_to || undefined,
          currency: applied.currency || undefined,
          status: applied.status || undefined,
        },
        t,
        locale,
      })
      await downloadHtmlAsA4Pdf(html, `sales-${companyId}-a4.pdf`)
      showSuccessToast(t('desktop.saved_success'))
    } catch (err) {
      setError(getApiErrorMessage(err))
      showErrorToast(t('desktop.invoice_export_failed'))
    } finally {
      setPdfBusy(false)
    }
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId)} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        <button
          type="button"
          className="btn-outline-primary btn-sm"
          disabled={pdfBusy || loading || rows.length === 0}
          onClick={() => void downloadPdf()}
        >
          <i className={`fa-solid ${pdfBusy ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`} />{' '}
          {pdfBusy ? t('desktop.processing') : t('desktop.download_pdf_a4')}
        </button>
      </div>

      <form className="activity-filters list-filters" onSubmit={submitFilters}>
        <SearchField
          label={t('desktop.search')}
          value={search}
          onChange={setSearch}
          placeholder={t('desktop.search_sales_hint')}
        />
        <label>
          {t('desktop.date_from')}
          <input
            type="date"
            className="eng-input"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
          {dateFrom ? <small className="muted">{formatJalaliSlash(dateFrom)}</small> : null}
        </label>
        <label>
          {t('desktop.date_to')}
          <input
            type="date"
            className="eng-input"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
          {dateTo ? <small className="muted">{formatJalaliSlash(dateTo)}</small> : null}
        </label>
        <label>
          {t('desktop.currency')}
          <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="">{t('desktop.filter_all')}</option>
            {accountCurrencies.map((code) => (
              <option key={code} value={code}>
                {localizeCurrency(code, t)}
              </option>
            ))}
          </Select>
        </label>
        <label>
          {t('desktop.status')}
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('desktop.filter_all')}</option>
            <option value="draft">{t('desktop.draft')}</option>
            <option value="completed">{t('desktop.finalized')}</option>
          </Select>
        </label>
        <div className="activity-filters-actions">
          <button type="button" className="btn-secondary" onClick={resetFilters}>
            {t('desktop.clear_filters')}
          </button>
          <button type="submit" className="btn-primary">
            {t('desktop.apply_filters')}
          </button>
        </div>
      </form>

      <div className="party-summary list-totals mb-3">
        <div className="party-summary__head">
          <strong>{t('desktop.total_sales')}</strong>
          <span>{totalsText || '—'}</span>
        </div>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : rows.length === 0 ? (
        <div className="party-empty">{t('desktop.no_sales')}</div>
      ) : (
        <>
          <div className="table-wrap party-table-wrap party-table-wrap--sticky-head">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>{t('desktop.customers')}</th>
                  <th>{t('desktop.amount')}</th>
                  <th>{t('desktop.paid_amount')}</th>
                  <th>{t('desktop.remaining_amount')}</th>
                  <th>{t('desktop.status')}</th>
                  <th>{t('desktop.date')}</th>
                  <th>{t('desktop.action')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isDraft = Number(row.status) !== 1
                  const viewPath = businessPath(companyId, `sales/${row.id}`)
                  return (
                    <tr key={row.id}>
                      <td>
                        <Link to={viewPath}>{row.invoice_number ?? row.id}</Link>
                      </td>
                      <td>{row.customer_name || '—'}</td>
                      <td>
                        {formatMoney(row.total_price)} {localizeCurrency(row.currency, t)}
                      </td>
                      <td>
                        {formatMoney(row.paid_amount)} {localizeCurrency(row.currency, t)}
                      </td>
                      <td>
                        {formatMoney(row.remaining_amount)} {localizeCurrency(row.currency, t)}
                      </td>
                      <td
                        style={
                          !isDraft
                            ? { background: '#198754', color: '#fff', fontWeight: 600 }
                            : undefined
                        }
                      >
                        {statusLabel(row.status, t)}
                      </td>
                      <td>{formatAfghanDateValue(row.sale_date || row.created_at, locale)}</td>
                      <td>
                        <div className="party-row-actions">
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => navigate(viewPath)}
                            title={t('desktop.view')}
                          >
                            <i className="fa-regular fa-eye" />
                          </button>
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() =>
                              navigate(
                                businessPath(
                                  companyId,
                                  isDraft ? `easy-sale/${row.id}` : `easy-sale/${row.id}/bill`,
                                ),
                              )
                            }
                            title={t('desktop.easy_sale_view')}
                          >
                            <i className="fa-solid fa-bolt" />
                          </button>
                          {canDelete ? (
                            <button
                              type="button"
                              className={`btn-danger btn-sm${isDraft ? '' : ' is-disabled'}`}
                              disabled={!isDraft || deleting}
                              onClick={() => openDelete(row)}
                              title={
                                isDraft
                                  ? t('desktop.delete_draft_sale')
                                  : t('desktop.only_draft_deletable')
                              }
                            >
                              <i className="fa-solid fa-trash" />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {hasMore ? (
            <div className="party-load-more">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => void loadMore()}
                disabled={loadingMore}
              >
                {loadingMore ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.loading_more')}
                  </>
                ) : (
                  t('desktop.load_more')
                )}
              </button>
            </div>
          ) : null}
        </>
      )}

      {canCreate ? (
        <div className="dashSaleButtonsWrap action-create">
          <div className="dashSaleButtonAction">
            <button
              type="button"
              className="dashSaleLink"
              onClick={() => void startSale()}
              disabled={creating || quickCreating}
            >
              {creating ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  <h6>{t('desktop.processing')}</h6>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-cart-plus" />
                  <h6>
                    {t('desktop.insert')} {t('desktop.sale')}
                  </h6>
                </>
              )}
            </button>
          </div>

          <div className="dashSaleButtonAction quick action-create">
            <Link to={businessPath(companyId, 'easy-sale')} className="dashSaleLink">
              <i className="fa-solid fa-bolt-lightning" />
              <h6>{t('desktop.easy_sale')}</h6>
            </Link>
          </div>

          <div className="dashSaleButtonAction quick action-create">
            <button
              type="button"
              className="dashSaleLink"
              onClick={() => void startQuickSale()}
              disabled={quickCreating || creating}
            >
              {quickCreating ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  <h6>{t('desktop.processing')}</h6>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-bolt" />
                  <h6>{t('desktop.quick_sale')}</h6>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}

      <Modal
        open={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        title={t('desktop.quick_sale')}
      >
        <form onSubmit={(e) => void submitRate(e)} className="form-grid">
          <p className="muted" style={{ margin: 0 }}>
            {t('desktop.needs_exchange_rate')}
          </p>
          {ratePair?.from_currency && ratePair?.to_currency ? (
            <p className="muted" style={{ margin: 0 }}>
              {t('desktop.exchange_rate_direction', {
                from: localizeCurrency(ratePair.from_currency, t),
                to: localizeCurrency(ratePair.to_currency, t),
              })}
              {ratePair.suggested_rate || ratePair.rate
                ? ` — ${t('desktop.latest_exchange_rate')}: ${ratePair.suggested_rate || ratePair.rate}`
                : null}
            </p>
          ) : null}
          {rateError ? <div className="alert-error">{rateError}</div> : null}
          <label>
            {rateLabel}
            <input
              type="number"
              min="0.0001"
              step="0.0001"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              required
              autoFocus
              disabled={quickCreating}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setRateModalOpen(false)}>
              {t('desktop.close')}
            </button>
            <button type="submit" className="btn-primary" disabled={quickCreating}>
              {quickCreating ? t('desktop.processing') : t('desktop.create')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={Boolean(canDelete && deleteTarget)}
        onClose={closeDelete}
        title={t('desktop.delete_sale_confirm_title')}
      >
        <div className="form-grid" dir="rtl">
          <p style={{ margin: 0 }}>
            {t('desktop.delete_sale_confirm_message')}{' '}
            <strong>#{deleteTarget?.invoice_number ?? deleteTarget?.id}</strong>
          </p>

          <div className="party-summary">
            <strong>{t('desktop.delete_sale_effects_title')}</strong>
            <ul style={{ margin: '8px 0 0', paddingInlineStart: 18 }}>
              <li>{t('desktop.delete_sale_effects_1')}</li>
              <li>{t('desktop.delete_sale_effects_2')}</li>
              <li>{t('desktop.delete_sale_effects_3')}</li>
              <li>{t('desktop.delete_sale_effects_4')}</li>
            </ul>
          </div>

          {deleteStep === 2 ? (
            <div className="alert-error" style={{ margin: 0 }}>
              {t('desktop.delete_sale_second_confirm')}
            </div>
          ) : null}

          {deleteError ? <div className="alert-error">{deleteError}</div> : null}

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={closeDelete} disabled={deleting}>
              {t('desktop.cancel')}
            </button>
            <button type="button" className="btn-danger" onClick={() => void confirmDelete()} disabled={deleting}>
              {deleting
                ? t('desktop.processing')
                : deleteStep === 1
                  ? t('desktop.confirm_delete_step_one')
                  : t('desktop.confirm_delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
