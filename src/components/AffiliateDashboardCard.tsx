import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { formatJalaliSlash } from '@/lib/datetime'
import type { AffiliatePayload } from '@/lib/user'
import { useLocaleStore } from '@/store/useLocaleStore'

type Props = {
  data: AffiliatePayload
}

export function AffiliateDashboardCard({ data }: Props) {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.language)
  const account = data.account
  if (!data.has_account || !account) return null

  const active = Boolean(account.status)
  const percentage = Number(account.percentage)
  const percentageLabel = Number.isFinite(percentage)
    ? `${percentage % 1 === 0 ? percentage.toFixed(0) : percentage.toFixed(2)}%`
    : '—'

  return (
    <Link to="/affiliate" className="ud-affiliate-card">
      <div className="ud-affiliate-card__glow" aria-hidden />
      <div className="ud-affiliate-card__top">
        <div className="ud-affiliate-card__badge">
          <i className="fa-solid fa-handshake-angle" aria-hidden />
          <span>{t('desktop.affiliate_account')}</span>
        </div>
        <span className={`ud-affiliate-card__status${active ? ' is-active' : ''}`}>
          {active ? t('desktop.affiliate_active') : t('desktop.affiliate_inactive')}
        </span>
      </div>

      <h3 className="ud-affiliate-card__title">{t('desktop.affiliate_dashboard_card_title')}</h3>
      <p className="ud-affiliate-card__desc">{t('desktop.affiliate_dashboard_card_desc')}</p>

      <div className="ud-affiliate-card__metrics">
        <div className="ud-affiliate-metric">
          <span>{t('desktop.affiliate_percentage')}</span>
          <strong>{percentageLabel}</strong>
        </div>
        <div className="ud-affiliate-metric">
          <span>{t('desktop.affiliate_invitations')}</span>
          <strong>{data.invitations_count}</strong>
        </div>
        <div className="ud-affiliate-metric">
          <span>{t('desktop.affiliate_since')}</span>
          <strong>{formatJalaliSlash(account.created_at, locale)}</strong>
        </div>
      </div>

      {data.invitations.length > 0 ? (
        <ul className="ud-affiliate-card__invites">
          {data.invitations.slice(0, 4).map((invite) => (
            <li key={invite.id}>
              {[invite.name, invite.lastname].filter(Boolean).join(' ') || '—'}
            </li>
          ))}
        </ul>
      ) : (
        <p className="ud-affiliate-card__empty">{t('desktop.affiliate_no_invitations')}</p>
      )}

      <div className="ud-affiliate-card__cta">
        <span>{t('desktop.affiliate_open_page')}</span>
        <i className="fa-solid fa-arrow-left" aria-hidden />
      </div>
    </Link>
  )
}
