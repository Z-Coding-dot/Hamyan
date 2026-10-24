import { FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { SearchField } from '@/components/inputs/SearchField'
import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchBusinessActivityLogs,
  type BusinessActivityLogRow,
} from '@/lib/business'
import { formatAfghanDateValue } from '@/lib/datetime'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

function badgeClassForAction(actionLabel?: string | null) {
  if (actionLabel === 'حذف کرد') return 'activity-badge activity-badge--danger'
  if (actionLabel === 'ویرایش کرد') return 'activity-badge activity-badge--warning'
  return 'activity-badge activity-badge--success'
}

function formatOccurredAt(value: string | null | undefined, locale: 'fa' | 'ps' | 'en') {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  return `${formatAfghanDateValue(value, locale)} ${hh}:${mm}`
}

export function CompanyActivityLogsPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const canView = Boolean(business.permissions?.canViewActivityLogs)

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [applied, setApplied] = useState({ search: '', date_from: '', date_to: '' })
  const [page, setPage] = useState(1)
  const [rows, setRows] = useState<BusinessActivityLogRow[]>([])
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !companyId || !canView) return
    let active = true
    setLoading(true)
    setError(null)
    void fetchBusinessActivityLogs(token, companyId, {
      search: applied.search || undefined,
      date_from: applied.date_from || undefined,
      date_to: applied.date_to || undefined,
      page,
    })
      .then((payload) => {
        if (!active) return
        setRows(payload.logs.data)
        setLastPage(payload.logs.last_page)
      })
      .catch((err) => {
        if (!active) return
        setError(getApiErrorMessage(err))
        setRows([])
        setLastPage(1)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token, companyId, canView, applied, page])

  if (!canView) {
    return <Navigate to={businessPath(companyId)} replace />
  }

  const submitFilters = (event: FormEvent) => {
    event.preventDefault()
    setPage(1)
    setApplied({
      search: search.trim(),
      date_from: dateFrom,
      date_to: dateTo,
    })
  }

  const resetFilters = () => {
    setSearch('')
    setDateFrom('')
    setDateTo('')
    setPage(1)
    setApplied({ search: '', date_from: '', date_to: '' })
  }

  return (
    <div className="dash-div party-page activity-logs-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId)} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
      </div>

      <p className="muted activity-logs-subtitle mb-2">{t('desktop.activity_logs_subtitle')}</p>

      <form className="activity-filters" onSubmit={submitFilters}>
        <SearchField
          label={t('desktop.search')}
          value={search}
          onChange={setSearch}
          placeholder={t('desktop.activity_logs_search_placeholder')}
        />
        <label>
          {t('desktop.date_from')}
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </label>
        <label>
          {t('desktop.date_to')}
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
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

      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : rows.length === 0 ? (
        <div className="party-empty">{t('desktop.no_activity_logs')}</div>
      ) : (
        <div className="activity-log-list">
          {rows.map((log) => {
            const detailLines = Array.isArray(log.detail_lines) ? log.detail_lines : []
            const subjectModel = log.subject_model_label || log.subject_model || null
            const relatedModel = log.related_subject_model_label || log.related_subject_model || null
            const meta = [log.role_label, formatOccurredAt(log.occurred_at || log.created_at, locale)]
              .filter(Boolean)
              .join(' - ')

            return (
              <article key={log.id} className="activity-log-card">
                <div className="activity-log-card-top">
                  <div>
                    <div className="activity-log-summary">
                      {log.summary || t('desktop.activity_log_fallback')}
                    </div>
                    <div className="activity-log-meta muted">{meta}</div>
                  </div>
                  <div className="activity-log-badges">
                    <span className={badgeClassForAction(log.action_label)}>
                      {log.entity_label || t('desktop.activity_entity_fallback')}
                    </span>
                    {subjectModel ? (
                      <span className="activity-badge activity-badge--info">
                        {t('desktop.model')}: {subjectModel}
                      </span>
                    ) : null}
                    {relatedModel ? (
                      <span className="activity-badge activity-badge--secondary">
                        {t('desktop.related')}: {relatedModel}
                      </span>
                    ) : null}
                  </div>
                </div>
                {detailLines.length > 0 ? (
                  <div className="activity-log-details muted">
                    {detailLines.map((line, index) => (
                      <div key={`${log.id}-detail-${index}`}>{line}</div>
                    ))}
                  </div>
                ) : null}
              </article>
            )
          })}
        </div>
      )}

      {lastPage > 1 ? (
        <div className="activity-pagination">
          <button
            type="button"
            className="btn-secondary btn-sm"
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {t('desktop.previous')}
          </button>
          <span className="muted">
            {page} / {lastPage}
          </span>
          <button
            type="button"
            className="btn-secondary btn-sm"
            disabled={page >= lastPage || loading}
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
          >
            {t('desktop.next')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
