import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { SearchField } from '@/components/inputs/SearchField'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import type { HelpGuideRow } from '@/lib/help'
import { useAuthStore } from '@/store/useAuthStore'
import { hydrateListsCache, useListsCacheStore } from '@/store/useListsCacheStore'

export function HelpPage() {
  const { t } = useTranslation()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const ensureHelpGuides = useListsCacheStore((s) => s.ensureHelpGuides)
  const refreshHelpGuides = useListsCacheStore((s) => s.refreshHelpGuides)
  const cachedGuides = useListsCacheStore((s) => s.getHelpGuides(userKey))

  const [guides, setGuides] = useState<HelpGuideRow[]>(() => cachedGuides ?? [])
  const [loading, setLoading] = useState(!cachedGuides)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const load = useCallback(
    async (force = false) => {
      if (!userKey) return
      const hasCache = Boolean(useListsCacheStore.getState().getHelpGuides(userKey))
      if (force) setRefreshing(true)
      else if (!hasCache) setLoading(true)
      setError(null)
      try {
        const rows = force
          ? await refreshHelpGuides(token, userKey)
          : await ensureHelpGuides(token, userKey)
        if (rows) setGuides(rows)
      } catch (err) {
        setError(getApiErrorMessage(err))
        if (!hasCache) setGuides([])
      } finally {
        setLoading(false)
        setRefreshing(false)
      }
    },
    [token, userKey, ensureHelpGuides, refreshHelpGuides],
  )

  useEffect(() => {
    let active = true
    void hydrateListsCache(userKey).then(() => {
      if (!active) return
      const cached = useListsCacheStore.getState().getHelpGuides(userKey)
      if (cached) {
        setGuides(cached)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [userKey])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (cachedGuides) setGuides(cachedGuides)
  }, [cachedGuides])

  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase()
    const sorted = [...guides].sort(
      (a, b) =>
        String(a.category || '').localeCompare(String(b.category || '')) ||
        String(a.title || '').localeCompare(String(b.title || '')),
    )
    if (!q) return sorted
    return sorted.filter((g) => {
      const title = String(g.title || '').toLowerCase()
      const category = String(g.category || '').toLowerCase()
      return title.includes(q) || category.includes(q)
    })
  }, [guides, search])

  return (
    <div className="help-page" dir="rtl">
      <div className="guest-page-back">
        <Link to={token ? '/dashboard' : '/'} className="guest-back-home">
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          <span>{token ? t('desktop.back_to_dashboard') : t('desktop.back_to_home')}</span>
        </Link>
      </div>
      <section className="help-card">
        <div className="help-card__brand">
          <img src="/logo.png" width={56} height={56} alt="" />
          <h2>{t('desktop.help_page_welcome')}</h2>
        </div>

        <div className="help-card__actions">
          <button
            type="button"
            className="btn-secondary btn-sm"
            onClick={() => void load(true)}
            disabled={refreshing || loading}
          >
            <i className={`fa-solid fa-rotate${refreshing ? ' fa-spin' : ''}`} />{' '}
            {t('desktop.refresh')}
          </button>
        </div>

        <p className="help-card__intro muted">{t('desktop.help_videos_intro')}</p>

        <div className="help-filter">
          <SearchField
            value={search}
            onChange={setSearch}
            placeholder={t('desktop.help_search_placeholder')}
          />
        </div>

        {error ? <div className="alert-error">{error}</div> : null}

        {loading && guides.length === 0 ? (
          <p className="muted">{t('desktop.loading')}</p>
        ) : displayed.length === 0 ? (
          <p className="muted">{t('desktop.help_no_results')}</p>
        ) : (
          <div className="help-list">
            {displayed.map((guide, index) => {
              const showCategory =
                index === 0 || displayed[index - 1].category !== guide.category
              return (
                <div key={guide.id}>
                  {showCategory ? (
                    <h3 className="help-section-title">{guide.category || '—'}</h3>
                  ) : null}
                  <Link
                    to={`/help/${guide.id}`}
                    className="help-tab"
                    aria-label={`${t('desktop.help_show_video')}: ${guide.title || ''}`}
                  >
                    <span className="help-tab__label">
                      <span className="help-index">{index + 1}</span>
                      <i className="fa-regular fa-hand-pointer" />
                      <span>{guide.title}</span>
                    </span>
                    <i
                      className="fa-solid fa-circle-play help-tab__play"
                      title={t('desktop.help_show_video')}
                    />
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
