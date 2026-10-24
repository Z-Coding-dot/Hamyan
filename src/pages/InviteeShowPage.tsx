import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useCachedAsset } from '@/hooks/useCachedAsset'
import { getApiErrorMessage, isPremiumUser } from '@/lib/auth'
import { formatJalaliSlash } from '@/lib/datetime'
import { fetchInviteeShow, type InviteeShowData } from '@/lib/user'
import { whatsappChatUrl } from '@/lib/whatsapp'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

const AVATAR_PLACEHOLDER = (
  <svg height="120px" viewBox="0 -960 960 960" width="120px" fill="#5f636830" aria-hidden="true">
    <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
  </svg>
)

function statusLabel(status: string | null | undefined, t: (key: string) => string): string {
  const key = String(status || '').toLowerCase()
  if (key === 'approved') return t('desktop.status_approved')
  if (key === 'rejected') return t('desktop.status_rejected')
  if (key === 'requested') return t('desktop.status_requested')
  if (key === 'pending') return t('desktop.status_pending')
  return t('desktop.profile_pending')
}

function statusTone(status: string | null | undefined): string {
  const key = String(status || '').toLowerCase()
  if (key === 'approved') return 'is-approved'
  if (key === 'rejected') return 'is-rejected'
  if (key === 'requested') return 'is-requested'
  return 'is-pending'
}

export function InviteeShowPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.language)
  const navigate = useNavigate()
  const { slug } = useParams()
  const { token } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
    })),
  )

  const [data, setData] = useState<InviteeShowData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const photoUrl = useCachedAsset(data?.user.profile_photo_path)

  useEffect(() => {
    if (!token || !slug) return
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetchInviteeShow(token, slug)
      .then((payload) => {
        if (!cancelled) setData(payload)
      })
      .catch((err) => {
        if (!cancelled) {
          setData(null)
          setError(getApiErrorMessage(err))
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [token, slug])

  if (!token) return null

  const user = data?.user
  const profile = data?.profile
  const verified = profile?.status === 'approved'
  const displayName = [user?.name, user?.lastname].filter(Boolean).join(' ')
  const whatsappRaw = profile?.whatsapp_number?.trim() || ''
  const whatsappHref = whatsappChatUrl(whatsappRaw)
  const premiumActive = isPremiumUser(
    user
      ? {
          id: user.id,
          name: user.name ?? '',
          email: '',
          is_premium: user.is_premium,
          premium_until: user.premium_until,
        }
      : null,
  )

  return (
    <div className="invitee-show-page">
      <button
        type="button"
        className="affiliate-back"
        onClick={() => (window.history.length > 1 ? navigate(-1) : navigate('/profile'))}
      >
        <i className="fa-solid fa-arrow-right" aria-hidden />
        <span>{t('desktop.back')}</span>
      </button>

      {error ? (
        <div className="alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {loading ? <p className="muted">{t('desktop.loading')}</p> : null}

      {!loading && user ? (
        <section className="invitee-hero">
          <div className="invitee-hero__glow" aria-hidden />

          <div className="invitee-hero__top">
            <div className={`invitee-avatar${verified ? ' is-verified' : ''}`}>
              {photoUrl ? <img src={photoUrl} alt={displayName} /> : AVATAR_PLACEHOLDER}
              {premiumActive ? (
                <span className="invitee-avatar__premium" title={t('desktop.premium')}>
                  <i className="fa-solid fa-crown" />
                </span>
              ) : null}
            </div>

            <div className="invitee-hero__identity">
              <span className="invitee-hero__eyebrow">{t('desktop.invitee_page_title')}</span>
              <h2>{displayName || '—'}</h2>
              <div className="invitee-hero__chips">
                <span className={`invitee-status ${statusTone(profile?.status)}`}>
                  {statusLabel(profile?.status, t)}
                </span>
                {user.username ? (
                  <span className="invitee-chip" dir="ltr">
                    @{user.username}
                  </span>
                ) : null}
                {user.user_id ? (
                  <span className="invitee-chip" dir="ltr">
                    ID {user.user_id}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="invitee-metrics">
            <article className="invitee-metric">
              <span>{t('desktop.name')}</span>
              <strong>{user.name || '—'}</strong>
            </article>
            <article className="invitee-metric">
              <span>{t('desktop.lastname')}</span>
              <strong>{user.lastname || '—'}</strong>
            </article>
            <article className="invitee-metric">
              <span>{t('desktop.date')}</span>
              <strong>{formatJalaliSlash(user.created_at, locale)}</strong>
            </article>
            <article className="invitee-metric">
              <span>{t('desktop.whatsapp_number')}</span>
              <strong dir="ltr">{whatsappRaw || '—'}</strong>
            </article>
          </div>

          {whatsappHref ? (
            <a
              className="invitee-wa-btn"
              href={whatsappHref}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-brands fa-whatsapp" aria-hidden />
              <span>{t('desktop.invitee_open_whatsapp')}</span>
            </a>
          ) : (
            <p className="invitee-wa-empty muted">{t('desktop.invitee_no_whatsapp')}</p>
          )}
        </section>
      ) : null}
    </div>
  )
}
