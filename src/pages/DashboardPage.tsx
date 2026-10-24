import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { CounterpartyBalanceTotals } from '@/components/CounterpartyBalanceTotals'
import { DashboardPersonalAccounts } from '@/components/DashboardPersonalAccounts'
import { ProductMarquee } from '@/components/ProductMarquee'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { useLocalClock } from '@/hooks/useLocalClock'
import { ULANISH_WHATSAPP_CHANNEL } from '@/lib/whatsapp'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore, type SupportedLanguage } from '@/store/useLocaleStore'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const user = useAuthStore(useShallow((state) => state.user))
  const name = [user?.name, user?.lastname].filter(Boolean).join(' ') || user?.email || ''
  const photo = useCachedAsset(user?.profile_photo_path)
  const locale = (
    i18n.language?.startsWith('ps') ? 'ps' : i18n.language?.startsWith('en') ? 'en' : 'fa'
  ) as SupportedLanguage
  const clock = useLocalClock(locale, 60_000)

  return (
    <div className="user-dashboard" dir="rtl">
      <header className="hy-greet">
        <div className="hy-greet__who">
          <span className="hy-greet__avatar">
            {photo ? <img src={photo} alt="" /> : <i className="fa-regular fa-circle-user" aria-hidden />}
          </span>
          <div>
            <strong>{name || t('desktop.dashboard_title')}</strong>
            <p>{clock.jalaliDate}</p>
            <p>{t('desktop.brand_slogan')}</p>
          </div>
        </div>
      </header>

      <CounterpartyBalanceTotals />

      <DashboardPersonalAccounts />

      <a className="hy-wa" href={ULANISH_WHATSAPP_CHANNEL} target="_blank" rel="noopener noreferrer">
        <span className="hy-wa__icon">
          <i className="fa-brands fa-whatsapp" aria-hidden />
        </span>
        <span className="hy-wa__copy">
          <strong>{t('desktop.hy_wa_title')}</strong>
          <small>{t('desktop.hy_wa_desc')}</small>
        </span>
        <span className="hy-wa__go">{t('desktop.hy_wa_join')}</span>
      </a>

      <ProductMarquee />
    </div>
  )
}
