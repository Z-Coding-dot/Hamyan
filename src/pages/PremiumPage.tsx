import { useTranslation } from 'react-i18next'

import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { openExternalUrl } from '@/lib/whatsapp'

const ULANISH_URL = 'https://ulanish.dev'

export function PremiumPage() {
  const { t } = useTranslation()
  const { premiumActive } = usePremiumStatus()

  return (
    <div className="user-accounts-page hy-premium" dir="rtl">
      <div className="ua-header">
        <h2>{t('desktop.nav_premium')}</h2>
      </div>
      <section className="hy-premium__card">
        <span className={`hy-premium__status${premiumActive ? ' is-on' : ''}`}>
          {premiumActive ? t('desktop.premium_active') : t('desktop.premium_inactive')}
        </span>
        <p>{t('desktop.premium_ulanish_note')}</p>
        <button type="button" className="btn-primary" onClick={() => openExternalUrl(ULANISH_URL)}>
          {t('desktop.auth_ulanish_learn_more')}
        </button>
      </section>
    </div>
  )
}
