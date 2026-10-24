import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import type { AffiliatePayload } from '@/lib/user'

type Props = {
  data: AffiliatePayload
}

export function AffiliateApplyCard({ data }: Props) {
  const { t } = useTranslation()
  if (data.has_account) return null

  const pending = data.request?.status === 'pending'
  const rejected = data.request?.status === 'rejected'
  if (!pending && data.can_request === false) return null

  return (
    <Link to="/affiliate/apply" className="ud-affiliate-card ud-affiliate-card--apply">
      <div className="ud-affiliate-card__glow" aria-hidden />
      <div className="ud-affiliate-card__top">
        <div className="ud-affiliate-card__badge">
          <i className="fa-solid fa-handshake-angle" aria-hidden />
          <span>{t('desktop.affiliate_account')}</span>
        </div>
        {pending ? (
          <span className="ud-affiliate-card__status">{t('desktop.affiliate_request_status_pending')}</span>
        ) : rejected ? (
          <span className="ud-affiliate-card__status">
            {t('desktop.affiliate_request_status_rejected')}
          </span>
        ) : null}
      </div>

      <h3 className="ud-affiliate-card__title">
        {pending
          ? t('desktop.affiliate_apply_card_pending_title')
          : t('desktop.affiliate_apply_card_title')}
      </h3>
      <p className="ud-affiliate-card__desc">
        {pending
          ? t('desktop.affiliate_apply_card_pending_desc')
          : t('desktop.affiliate_apply_card_desc')}
      </p>

      <div className="ud-affiliate-card__cta">
        <span>
          {pending
            ? t('desktop.affiliate_apply_card_pending_cta')
            : t('desktop.affiliate_apply_card_cta')}
        </span>
        <i className="fa-solid fa-arrow-left" aria-hidden />
      </div>
    </Link>
  )
}
