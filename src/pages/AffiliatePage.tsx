import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useCachedAsset } from '@/hooks/useCachedAsset'
import { getApiErrorMessage } from '@/lib/auth'
import { formatJalaliSlash } from '@/lib/datetime'
import {
  fetchAffiliateData,
  inviteePath,
  type AffiliateInvitation,
  type AffiliatePayload,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

const INVITE_REWARD_AFN = 20
const PERCENT_EXAMPLE_BASE_AFN = 1000

function formatAfnAmount(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })
}

function formatPercentValue(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)
}

const PLACEHOLDER_SVG = (
  <svg height="100%" viewBox="0 -960 960 960" width="100%" fill="#d1d1d1" aria-hidden="true">
    <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
  </svg>
)

function InvitationRow({ invite }: { invite: AffiliateInvitation }) {
  const photo = useCachedAsset(invite.profile_photo_path)
  const locale = useLocaleStore((state) => state.language)
  const href = inviteePath(invite)
  const inner = (
    <>
      <div className="sm-profile-logo">
        {photo ? <img src={photo} alt={invite.name ?? ''} /> : PLACEHOLDER_SVG}
      </div>
      <div className="affiliate-invite-row__meta">
        <strong>
          {[invite.name, invite.lastname].filter(Boolean).join(' ') || '—'}
        </strong>
        <span>{formatJalaliSlash(invite.created_at, locale)}</span>
      </div>
    </>
  )

  if (!href) {
    return <div className="affiliate-invite-row">{inner}</div>
  }

  return (
    <Link to={href} className="affiliate-invite-row affiliate-invite-row--link">
      {inner}
    </Link>
  )
}

export function AffiliatePage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.language)
  const { token } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
    })),
  )

  const [data, setData] = useState<AffiliatePayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    setLoading(true)
    try {
      const payload = await fetchAffiliateData(token)
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

  if (!token) return null

  if (!loading && data && !data.has_account) {
    return <Navigate to="/affiliate/apply" replace />
  }

  const account = data?.account
  const active = Boolean(account?.status)
  const percentage = Number(account?.percentage)
  const percentageLabel = Number.isFinite(percentage)
    ? `${percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(2)}%`
    : '—'
  const inviteUserId = data?.invite_user_id ? String(data.invite_user_id) : ''
  const invitationLink = inviteUserId
    ? `https://ishanch.com/register?ref=${inviteUserId}`
    : ''

  const exampleShare = Number.isFinite(percentage)
    ? (PERCENT_EXAMPLE_BASE_AFN * percentage) / 100
    : NaN

  const copyInvite = async () => {
    if (!invitationLink) return
    try {
      await navigator.clipboard.writeText(invitationLink)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
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
          <h2>{t('desktop.affiliate_page_title')}</h2>
          <p className="muted">{t('desktop.affiliate_invitations_hint')}</p>
        </div>
      </div>

      {error ? (
        <div className="alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : account ? (
        <>
          <section className="affiliate-hero">
            <div className="affiliate-hero__badge">
              <i className="fa-solid fa-handshake-angle" aria-hidden />
              <span>{t('desktop.affiliate_account')}</span>
            </div>
            <div className="affiliate-hero__grid">
              <article className="affiliate-detail">
                <span>{t('desktop.affiliate_percentage')}</span>
                <strong>{percentageLabel}</strong>
              </article>
              <article className="affiliate-detail">
                <span>{t('desktop.status')}</span>
                <strong className={active ? 'is-active' : ''}>
                  {active ? t('desktop.affiliate_active') : t('desktop.affiliate_inactive')}
                </strong>
              </article>
              <article className="affiliate-detail">
                <span>{t('desktop.affiliate_since')}</span>
                <strong>{formatJalaliSlash(account.created_at, locale)}</strong>
              </article>
              <article className="affiliate-detail">
                <span>{t('desktop.affiliate_invitations')}</span>
                <strong>{data?.invitations_count ?? 0}</strong>
              </article>
            </div>

            {invitationLink ? (
              <div className="affiliate-invite-box">
                <div>
                  <h4>{t('desktop.affiliate_invite_link')}</h4>
                  <code>{invitationLink}</code>
                </div>
                <button type="button" className="btn-primary" onClick={() => void copyInvite()}>
                  <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} aria-hidden />
                  {copied ? t('desktop.copied') : t('desktop.copy_invite_link')}
                </button>
              </div>
            ) : null}
          </section>

          <section className="affiliate-how">
            <h3>{t('desktop.affiliate_how_title')}</h3>
            <ol className="affiliate-how__list">
              <li>
                {t('desktop.affiliate_how_invite', {
                  amount: formatAfnAmount(INVITE_REWARD_AFN),
                })}
              </li>
              <li>
                {t('desktop.affiliate_how_percent')}
                <div className="affiliate-how__example">
                  {t('desktop.affiliate_how_example', {
                    base: formatAfnAmount(PERCENT_EXAMPLE_BASE_AFN),
                    percent: formatPercentValue(percentage),
                    amount: formatAfnAmount(exampleShare),
                  })}
                </div>
              </li>
              <li>{t('desktop.affiliate_how_wallet')}</li>
            </ol>
            <Link to="/wallet" className="affiliate-how__wallet">
              <i className="fa-solid fa-wallet" aria-hidden />
              <span>{t('desktop.affiliate_open_wallet')}</span>
            </Link>
          </section>

          <section className="page-card affiliate-invites">
            <div className="affiliate-invites__head">
              <h3>{t('desktop.affiliate_invitations')}</h3>
              <span>{data?.invitations_count ?? 0}</span>
            </div>
            {(data?.invitations?.length ?? 0) > 0 ? (
              <div className="affiliate-invites__list">
                {data?.invitations.map((invite) => (
                  <InvitationRow key={invite.id} invite={invite} />
                ))}
              </div>
            ) : (
              <p className="muted">{t('desktop.affiliate_no_invitations')}</p>
            )}
          </section>
        </>
      ) : null}
    </div>
  )
}
