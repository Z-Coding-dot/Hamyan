import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { formatJalaliSlash } from '@/lib/datetime'
import {
  fetchAffiliateRequestStatus,
  submitAffiliateRequest,
  type AffiliateRequestPayload,
  type AffiliateRequestRow,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore, type SupportedLanguage } from '@/store/useLocaleStore'

type SocialForm = {
  facebook_url: string
  instagram_url: string
  telegram_url: string
  tiktok_url: string
  youtube_url: string
  whatsapp_url: string
  other_social_url: string
}

const EMPTY_SOCIALS: SocialForm = {
  facebook_url: '',
  instagram_url: '',
  telegram_url: '',
  tiktok_url: '',
  youtube_url: '',
  whatsapp_url: '',
  other_social_url: '',
}

function statusLabelKey(status: string): string {
  if (status === 'pending') return 'desktop.affiliate_request_status_pending'
  if (status === 'approved') return 'desktop.affiliate_request_status_approved'
  if (status === 'rejected') return 'desktop.affiliate_request_status_rejected'
  return 'desktop.status'
}

function RequestSummary({
  request,
  locale,
}: {
  request: AffiliateRequestRow
  locale: SupportedLanguage
}) {
  const { t } = useTranslation()
  const socials = [
    { label: t('desktop.affiliate_social_facebook'), value: request.facebook_url },
    { label: t('desktop.affiliate_social_instagram'), value: request.instagram_url },
    { label: t('desktop.affiliate_social_telegram'), value: request.telegram_url },
    { label: t('desktop.affiliate_social_tiktok'), value: request.tiktok_url },
    { label: t('desktop.affiliate_social_youtube'), value: request.youtube_url },
    { label: t('desktop.affiliate_social_whatsapp'), value: request.whatsapp_url },
    { label: t('desktop.affiliate_social_other'), value: request.other_social_url },
  ].filter((row) => Boolean(row.value?.trim()))

  return (
    <section className="page-card affiliate-request-status">
      <div className="affiliate-request-status__head">
        <h3>{t('desktop.affiliate_request_status_title')}</h3>
        <span className={`affiliate-request-status__badge status-${request.status}`}>
          {t(statusLabelKey(request.status))}
        </span>
      </div>
      <p className="muted">
        {t('desktop.affiliate_request_submitted_at', {
          date: formatJalaliSlash(request.created_at, locale),
        })}
      </p>
      {request.status === 'pending' ? (
        <p>{t('desktop.affiliate_request_pending_desc')}</p>
      ) : null}
      {request.status === 'rejected' ? (
        <p>{t('desktop.affiliate_request_rejected_desc')}</p>
      ) : null}
      {request.admin_note ? (
        <p className="affiliate-request-status__note">
          <strong>{t('desktop.affiliate_request_admin_note')}: </strong>
          {request.admin_note}
        </p>
      ) : null}
      {socials.length > 0 ? (
        <ul className="affiliate-request-status__socials">
          {socials.map((row) => {
            const value = String(row.value || '').trim()
            const isLink = /^https?:\/\//i.test(value)
            return (
              <li key={row.label}>
                <span>{row.label}</span>
                {isLink ? (
                  <a href={value} target="_blank" rel="noreferrer">
                    {value}
                  </a>
                ) : (
                  <code dir="ltr">{value}</code>
                )}
              </li>
            )
          })}
        </ul>
      ) : null}
      {request.reason ? (
        <div className="affiliate-request-status__reason">
          <strong>{t('desktop.affiliate_request_reason')}</strong>
          <p>{request.reason}</p>
        </div>
      ) : null}
    </section>
  )
}

export function AffiliateApplyPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.language)
  const { token } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
    })),
  )

  const [data, setData] = useState<AffiliateRequestPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [socials, setSocials] = useState<SocialForm>(EMPTY_SOCIALS)
  const [reason, setReason] = useState('')
  const [prefilledId, setPrefilledId] = useState<number | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    setLoading(true)
    try {
      const payload = await fetchAffiliateRequestStatus(token)
      setData(payload)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (!data?.can_request || data.request?.status !== 'rejected' || !data.request) return
    if (prefilledId === data.request.id) return
    const row = data.request
    setSocials({
      facebook_url: row.facebook_url ?? '',
      instagram_url: row.instagram_url ?? '',
      telegram_url: row.telegram_url ?? '',
      tiktok_url: row.tiktok_url ?? '',
      youtube_url: row.youtube_url ?? '',
      whatsapp_url: row.whatsapp_url ?? '',
      other_social_url: row.other_social_url ?? '',
    })
    setReason(row.reason ?? '')
    setPrefilledId(row.id)
  }, [data, prefilledId])

  if (!token) return null

  if (!loading && data?.has_account) {
    return <Navigate to="/affiliate" replace />
  }

  const canShowForm = Boolean(data?.can_request)
  const pendingRequest = data?.request?.status === 'pending' ? data.request : null
  const showRejectedForm =
    canShowForm && data?.request?.status === 'rejected' ? data.request : null

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || saving) return
    setSaving(true)
    setError(null)
    const hasSocial = Object.values(socials).some((value) => value.trim() !== '')
    if (!hasSocial) {
      setError(t('desktop.affiliate_apply_social_hint'))
      setSaving(false)
      return
    }
    if (reason.trim().length < 20) {
      setError(t('desktop.affiliate_request_reason_hint'))
      setSaving(false)
      return
    }
    try {
      const result = await submitAffiliateRequest(token, {
        ...socials,
        reason,
      })
      setData({
        has_account: result.has_account,
        can_request: result.can_request,
        request: result.request,
      })
      setSocials(EMPTY_SOCIALS)
      setReason('')
      showSuccessToast(result.message || t('desktop.affiliate_request_success'))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="affiliate-page">
      <div className="affiliate-page__head">
        <div>
          <Link to="/dashboard" className="affiliate-back">
            <i className="fa-solid fa-arrow-right" aria-hidden />
            <span>{t('desktop.nav_dashboard')}</span>
          </Link>
          <h2>{t('desktop.affiliate_apply_title')}</h2>
          <p className="muted">{t('desktop.affiliate_apply_desc')}</p>
        </div>
      </div>

      {error ? (
        <div className="alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !data ? <p className="muted">{t('desktop.loading')}</p> : null}

      {pendingRequest ? <RequestSummary request={pendingRequest} locale={locale} /> : null}

      {showRejectedForm ? <RequestSummary request={showRejectedForm} locale={locale} /> : null}

      {!loading && !canShowForm && !pendingRequest && !error ? (
        <p className="alert-error" role="status">
          {data?.affiliate_open === false
            ? t('desktop.affiliate_capacity_full', {
                count: data.affiliate_limit ?? 100,
              })
            : t('desktop.affiliate_apply_unavailable')}
        </p>
      ) : null}

      {canShowForm ? (
        <section className="page-card">
          <h3 className="affiliate-apply-form__title">{t('desktop.affiliate_apply_form_title')}</h3>
          <p className="muted affiliate-apply-form__hint">{t('desktop.affiliate_apply_social_hint')}</p>

          <form className="form-grid affiliate-apply-form" onSubmit={(e) => void onSubmit(e)}>
            {(
              [
                ['facebook_url', 'affiliate_social_facebook', true],
                ['instagram_url', 'affiliate_social_instagram', true],
                ['telegram_url', 'affiliate_social_telegram', true],
                ['tiktok_url', 'affiliate_social_tiktok', true],
                ['youtube_url', 'affiliate_social_youtube', true],
                ['whatsapp_url', 'affiliate_social_whatsapp', false],
                ['other_social_url', 'affiliate_social_other', true],
              ] as const
            ).map(([key, labelKey, isUrl]) => (
              <div className="form-field" key={key}>
                <label htmlFor={`aff-${key}`}>{t(`desktop.${labelKey}`)}</label>
                <input
                  id={`aff-${key}`}
                  type={isUrl ? 'url' : 'text'}
                  inputMode={isUrl ? 'url' : 'text'}
                  dir="ltr"
                  className="eng-input"
                  placeholder={isUrl ? 'https://' : undefined}
                  value={socials[key]}
                  disabled={saving}
                  onChange={(e) =>
                    setSocials((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}

            <div className="form-field affiliate-apply-form__reason">
              <label htmlFor="aff-reason">{t('desktop.affiliate_request_reason')}</label>
              <p className="muted" style={{ margin: '0 0 6px', fontSize: '0.85rem' }}>
                {t('desktop.affiliate_request_reason_hint')}
              </p>
              <textarea
                id="aff-reason"
                rows={5}
                required
                minLength={20}
                maxLength={2000}
                value={reason}
                disabled={saving}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t('desktop.affiliate_request_reason_placeholder')}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? t('desktop.processing') : t('desktop.affiliate_request_submit')}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  )
}
