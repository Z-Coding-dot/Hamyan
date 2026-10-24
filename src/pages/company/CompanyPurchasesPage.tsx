import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { localizeCurrency } from '@/lib/currency'

import { SearchField } from '@/components/inputs/SearchField'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import {
  destroyPurchase,
  fetchBusinessAccountsList,
  fetchBusinessPurchases,
  type BusinessPurchaseRow,
} from '@/lib/business'
import { currenciesText, formatMoney } from '@/lib/companyDashboard'
import { formatJalaliSlash } from '@/lib/datetime'
import type { BusinessAccountRow, BusinessShowData } from '@/lib/user'
import { CreatePurchaseModal } from '@/pages/company/CreatePurchaseModal'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { businessPath } from '@/store/useCompanyContextStore'
import { scheduleBusinessDashboardRefresh } from '@/store/useListsCacheStore'

type CompanyOutletContext = { business: BusinessShowData }

const PURCHASES_PAGE_SIZE = 50

export function CompanyPurchasesPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()

  const canManage =
    Boolean(business.permissions?.canManageInventory) && business.is_active
  const canDelete =
    Boolean(business.permissions?.canDeleteRecords) && business.is_active

  const [rows, setRows] = useState<BusinessPurchaseRow[]>([])
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
  const [createOpen, setCreateOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BusinessPurchaseRow | null>(null)
  const [deleting, setDeleting] = useState(false)

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

  const totalsText = useMemo(
    () => currenciesText(totalsByCurrency, (code) => localizeCurrency(code, t)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalsByCurrency, i18n.language],
  )

  const applyPurchasesPage = (
    page: Awaited<ReturnType<typeof fetchBusinessPurchases>>,
    mode: 'replace' | 'append',
  ) => {
    setRows((prev) => {
      if (mode === 'replace') return page.purchases
      const seen = new Set(prev.map((row) => row.id))
      return [...prev, ...page.purchases.filter((row) => !seen.has(row.id))]
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
      const page = await fetchBusinessPurchases(token, companyId, {
        limit: PURCHASES_PAGE_SIZE,
        offset: 0,
        ...listFilters,
      })
      applyPurchasesPage(page, 'replace')
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
      const page = await fetchBusinessPurchases(token, companyId, {
        limit: PURCHASES_PAGE_SIZE,
        offset: nextOffset,
        ...listFilters,
      })
      applyPurchasesPage(page, 'append')
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

  const handleDelete = async () => {
    if (!token || !deleteTarget) return
    setDeleting(true)
    try {
      await destroyPurchase(token, companyId, deleteTarget.id)
      setDeleteTarget(null)
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId)} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
      </div>

      <form className="activity-filters list-filters" onSubmit={submitFilters}>
        <SearchField
          label={t('desktop.search')}
          value={search}
          onChange={setSearch}
          placeholder={t('desktop.search_purchases_hint')}
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
          <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
            <option value="">{t('desktop.filter_all')}</option>
            {accountCurrencies.map((code) => (
              <option key={code} value={code}>
                {localizeCurrency(code, t)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('desktop.status')}
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t('desktop.filter_all')}</option>
            <option value="draft">{t('desktop.draft')}</option>
            <option value="completed">{t('desktop.finalized')}</option>
          </select>
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
          <strong>{t('desktop.total_purchases')}</strong>
          <span>{totalsText || '—'}</span>
        </div>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : rows.length === 0 ? (
        <div className="party-empty">{t('desktop.no_purchases')}</div>
      ) : (
        <>
          <div className="table-wrap party-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('desktop.purchase_number')}</th>
                  <th>{t('desktop.vendors')}</th>
                  <th>{t('desktop.date')}</th>
                  <th>{t('desktop.total')}</th>
                  <th>{t('desktop.currency')}</th>
                  <th>{t('desktop.warehouse')}</th>
                  <th>{t('desktop.status')}</th>
                  <th>{t('desktop.action')}</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const isDraft = Number(p.status) === 0
                  return (
                    <tr key={p.id}>
                      <td>{p.purchase_number}</td>
                      <td>{p.vendor?.name || p.vendor_name || '—'}</td>
                      <td>{formatJalaliSlash(p.purchase_date || p.created_at)}</td>
                      <td>{formatMoney(p.total_price)}</td>
                      <td>{localizeCurrency(p.currency, t)}</td>
                      <td>{p.warehouse?.name || p.warehouse_name || '—'}</td>
                      <td
                        style={
                          !isDraft
                            ? { background: '#198754', color: '#fff', fontWeight: 600 }
                            : undefined
                        }
                      >
                        {isDraft ? t('desktop.incomplete') : t('desktop.complete')}
                      </td>
                      <td>
                        <div className="party-row-actions">
                          <Link
                            to={businessPath(companyId, `purchases/${p.purchase_number}`)}
                            className="btn-primary btn-sm"
                            title={t('desktop.view')}
                          >
                            <i className="fa-regular fa-eye" />
                          </Link>
                          {canDelete ? (
                            <button
                              type="button"
                              className={`btn-sm ${isDraft ? 'btn-danger' : 'btn-secondary'}`}
                              disabled={!isDraft || loading}
                              title={
                                isDraft
                                  ? t('desktop.delete_draft_purchase')
                                  : t('desktop.only_draft_deletable')
                              }
                              onClick={() => isDraft && setDeleteTarget(p)}
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
            <div className="text-center mt-3" style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                type="button"
                className="btn-secondary"
                disabled={loadingMore}
                onClick={() => void loadMore()}
              >
                {loadingMore ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.loading')}
                  </>
                ) : (
                  t('desktop.load_more')
                )}
              </button>
            </div>
          ) : null}
        </>
      )}

      {canManage ? (
        <div className="dashSaleButtonsWrap action-create">
          <div className="dashSaleButtonAction">
            <button type="button" className="dashSaleLink" onClick={() => setCreateOpen(true)}>
              <i className="fa-solid fa-cart-plus" />
              <h6>
                {t('desktop.insert')} {t('desktop.purchase')}
              </h6>
            </button>
          </div>
        </div>
      ) : null}

      <CreatePurchaseModal
        open={createOpen}
        companyId={companyId}
        token={token}
        onClose={() => setCreateOpen(false)}
        onCreated={(purchaseNumber) => {
          setCreateOpen(false)
          navigate(businessPath(companyId, `purchases/${purchaseNumber}`))
        }}
      />

      <Modal
        open={canDelete && Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) setDeleteTarget(null)
        }}
        title={t('desktop.delete_purchase_confirm_title')}
      >
        <div dir="rtl">
          <p>
            {t('desktop.delete_purchase_confirm_message')}{' '}
            <strong>#{deleteTarget?.purchase_number}</strong>
          </p>
          <div className="party-summary mb-3">
            <div className="fw-semibold mb-2">{t('desktop.delete_purchase_effects_title')}</div>
            <ul className="mb-0">
              <li>{t('desktop.delete_purchase_effects_1')}</li>
              <li>{t('desktop.delete_purchase_effects_2')}</li>
              <li>{t('desktop.delete_purchase_effects_3')}</li>
              <li>{t('desktop.delete_purchase_effects_4')}</li>
            </ul>
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              disabled={deleting}
              onClick={() => setDeleteTarget(null)}
            >
              {t('desktop.cancel')}
            </button>
            <button type="button" className="btn-danger" disabled={deleting} onClick={() => void handleDelete()}>
              {deleting ? t('desktop.processing') : t('desktop.confirm_delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
