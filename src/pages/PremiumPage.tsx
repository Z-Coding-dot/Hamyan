import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { usePremiumStatus } from '@/hooks/usePremiumStatus'
import { formatAfghanDateValue } from '@/lib/datetime'
import { useLocaleStore } from '@/store/useLocaleStore'
import { openExternalUrl } from '@/lib/whatsapp'

export function PremiumPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const { premiumActive, premiumUntil } = usePremiumStatus()
  return (
    <div className="hy-ledger hy-membership">
      <header className="hy-ledger__head"><div><span className="hy-ledger__eyebrow">{t('desktop.hy_account_space')}</span><h2>{t('desktop.nav_premium')}</h2><p>{t('desktop.hy_membership_desc')}</p></div></header>
      <section className="hy-membership__hero">
        <div className="hy-membership__top"><span className="hy-membership__crown" aria-hidden="true"><i className="fa-solid fa-crown" /></span><span className={`hy-membership__status${premiumActive ? ' is-active' : ''}`}><i className={`fa-solid ${premiumActive ? 'fa-circle-check' : 'fa-circle'}`} aria-hidden="true" />{t(premiumActive ? 'desktop.premium_active' : 'desktop.premium_inactive')}</span></div>
        <h3>{t('desktop.nav_premium')}</h3><p>{t('desktop.premium_ulanish_note')}</p>
        {premiumActive && premiumUntil && <div className="hy-membership__validity"><span>{t('desktop.valid_date')}</span><strong>{formatAfghanDateValue(premiumUntil, locale)}</strong></div>}
        <button type="button" className="btn-primary hy-membership__action" onClick={() => openExternalUrl('https://ulanish.dev')}>{t('desktop.auth_ulanish_learn_more')}<i className="fa-solid fa-arrow-up-right-from-square" aria-hidden="true" /></button>
      </section>
      <div className="hy-options-panel hy-membership__account"><span className="hy-options-icon" aria-hidden="true"><i className="fa-regular fa-user" /></span><div><h3>{t('desktop.profile_ulanish_account')}</h3><p>{t('desktop.hy_membership_account_note')}</p></div><Link to="/profile" className="hy-options-link">{t('desktop.nav_profile')}<i className={`fa-solid ${locale === 'en' ? 'fa-arrow-right' : 'fa-arrow-left'}`} aria-hidden="true" /></Link></div>
    </div>
  )
}
