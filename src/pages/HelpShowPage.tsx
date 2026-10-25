import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import { extractYoutubeVideoId, buildYoutubeEmbedUrl, fetchHelpGuide, type HelpGuideRow } from '@/lib/help'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'
import { hydrateListsCache, useListsCacheStore } from '@/store/useListsCacheStore'

export function HelpShowPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const { guideId = '' } = useParams()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const ensureHelpGuides = useListsCacheStore((s) => s.ensureHelpGuides)
  const cachedGuides = useListsCacheStore((s) => s.getHelpGuides(userKey))

  const cachedGuide = useMemo(() => {
    if (!guideId || !cachedGuides) return null
    return cachedGuides.find((row) => String(row.id) === String(guideId)) ?? null
  }, [cachedGuides, guideId])

  const [guide, setGuide] = useState<HelpGuideRow | null>(() => cachedGuide)
  const [loading, setLoading] = useState(!cachedGuide)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [videoLoading, setVideoLoading] = useState(true)

  useEffect(() => {
    if (cachedGuide) {
      setGuide(cachedGuide)
      setLoading(false)
    }
  }, [cachedGuide])

  useEffect(() => {
    setVideoLoading(true)
  }, [guide?.link, guideId])

  useEffect(() => {
    if (!guideId) return
    let active = true

    void hydrateListsCache(userKey).then(async () => {
      if (!active) return
      const fromCache = useListsCacheStore
        .getState()
        .getHelpGuides(userKey)
        ?.find((row) => String(row.id) === String(guideId))
      if (fromCache) {
        setGuide(fromCache)
        setLoading(false)
      } else {
        setLoading(true)
      }
      setError(null)

      try {
        const guides = await ensureHelpGuides(token, userKey)
        if (!active) return
        const found = guides?.find((row) => String(row.id) === String(guideId))
        if (found) {
          setGuide(found)
          return
        }
        // Fallback: single guide endpoint if list is empty/outdated relative to this id.
        const row = await fetchHelpGuide(guideId, token)
        if (active) setGuide(row)
      } catch (err) {
        if (!active) return
        if (!fromCache) {
          setError(getApiErrorMessage(err))
          setGuide(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    })

    return () => {
      active = false
    }
  }, [guideId, token, userKey, ensureHelpGuides])

  const embedUrl = useMemo(() => {
    const id = extractYoutubeVideoId(guide?.link)
    return id ? buildYoutubeEmbedUrl(id) : null
  }, [guide?.link])

  const copySharePayload = async () => {
    const id = String(guideId || guide?.id || '').trim()
    const publicHelpUrl = id ? `https://ishanch.com/help/${id}` : 'https://ishanch.com/help'
    const payload = [guide?.title || '', guide?.description || '', publicHelpUrl]
      .filter(Boolean)
      .join('\n\n')
    if (!payload) return
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  if (loading && !guide) {
    return (
      <div className="help-page hy-help">
        <div className="help-page__loading">
          <div className="spinner" aria-hidden />
          <p className="muted">{t('desktop.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="help-page hy-help hy-help-article">
      <section className="help-card help-show-card hy-options-panel">
        <div className="help-show-toolbar">
          <Link to="/help" className="btn-secondary">
            <i className={`fa-solid ${locale === 'en' ? 'fa-arrow-left' : 'fa-arrow-right'}`} aria-hidden="true" /> {t('desktop.help_back_to_list')}
          </Link>
          <Link to={token ? '/dashboard' : '/'} className="btn-secondary">
            <i className={`fa-solid ${token ? 'fa-gauge-high' : 'fa-house'}`} />{' '}
            {token ? t('desktop.back_to_dashboard') : t('desktop.back_to_home')}
          </Link>
        </div>

        {error ? <div className="alert-error">{error}</div> : null}

        {guide ? (
          <>
            <h2 className="help-show-title">{guide.title}</h2>
            {guide.description ? <p className="help-show-desc">{guide.description}</p> : null}

            {embedUrl ? (
              <>
                <div className={`help-show-video${videoLoading ? ' is-loading' : ''}`}>
                  {videoLoading ? (
                    <div className="help-show-video__spinner" aria-live="polite">
                      <div className="spinner" aria-hidden />
                      <span>{t('desktop.loading')}</span>
                    </div>
                  ) : null}
                  <iframe
                    key={embedUrl}
                    src={embedUrl}
                    title={guide.title || t('desktop.help_show_video')}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    loading="lazy"
                    onLoad={() => setVideoLoading(false)}
                  />
                </div>
                <button type="button" className="btn-secondary mt-3" onClick={() => void copySharePayload()}>
                  <i className="fa-regular fa-clipboard" />{' '}
                  {copied ? t('desktop.help_copied') : t('desktop.help_copy_share')}
                </button>
              </>
            ) : (
              <div className="ua-alert ua-alert--amber">{t('desktop.help_no_video')}</div>
            )}
          </>
        ) : null}
      </section>
    </div>
  )
}
