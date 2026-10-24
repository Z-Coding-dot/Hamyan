import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import type { SubscriptionResellerPayload } from '@/lib/user'

type Props = {
  data: SubscriptionResellerPayload
}

export function ResellerApplyCard({ data }: Props) {
  const { t } = useTranslation()
  if (data.has_account) return null

  return (
    <Link to="/reseller/apply" className="ud-affiliate-card ud-affiliate-card--apply">
      <div className="ud-affiliate-card__glow" aria-hidden />
      <div className="ud-affiliate-card__top">
        <div className="ud-affiliate-card__badge">
          <i className="fa-solid fa-store" aria-hidden />
          <span>{t('desktop.reseller_nav')}</span>
        </div>
      </div>
      <h3 className="ud-affiliate-card__title">{t('desktop.reseller_card_title')}</h3>
      <p className="ud-affiliate-card__desc">{t('desktop.reseller_card_desc')}</p>
      <div className="ud-affiliate-card__cta">
        <span>{t('desktop.reseller_card_cta')}</span>
        <i className="fa-solid fa-arrow-left" aria-hidden />
      </div>
    </Link>
  )
}
