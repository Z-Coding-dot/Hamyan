import { useTranslation } from 'react-i18next'

import { CounterpartyBalanceTotals } from '@/components/CounterpartyBalanceTotals'
import { DashboardPersonalAccounts } from '@/components/DashboardPersonalAccounts'
import { ProductMarquee } from '@/components/ProductMarquee'
import { ULANISH_WHATSAPP_CHANNEL } from '@/lib/whatsapp'

export function DashboardPage() {
  const { t } = useTranslation()

  return (
    <div className="user-dashboard hy-dashboard">
      <header className="hy-dashboard__intro">
        <div>
          <span className="hy-dashboard__eyebrow"><span aria-hidden="true" />{t('desktop.hy_overview')}</span>
          <h2>{t('desktop.hy_financial_overview')}</h2>
          <p>{t('desktop.hy_overview_description')}</p>
        </div>
        <span className="hy-dashboard__intro-icon" aria-hidden="true"><i className="fa-solid fa-chart-simple" /></span>
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
