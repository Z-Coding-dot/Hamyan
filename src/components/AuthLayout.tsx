import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import logoUrl from '@/assets/logo.png'
import { HamyanWhatsappFab } from '@/components/IshanchWhatsappFab'
import { UlanishFromCredit } from '@/components/UlanishFromCredit'

type AuthLayoutProps = {
  children: ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="guest-shell">
      <div className="guest-shell__bg" aria-hidden="true">
        <div className="guest-shell__orb guest-shell__orb--top" />
        <div className="guest-shell__orb guest-shell__orb--bottom" />
      </div>

      <div className="guest-shell__content">
        <div className="guest-logo-center">
          <Link to="/" className="guest-logo-center__link" aria-label={t('desktop.app_name')}>
            <img src={logoUrl} alt={t('desktop.app_name')} />
          </Link>
          <Link to="/" className="guest-back-home">
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
            <span>{t('desktop.back_to_home')}</span>
          </Link>
        </div>

        <div className="guest-columns">
          <section className="guest-form-card">
            <div className="guest-form-card__inner">{children}</div>
          </section>

          <section className="guest-promo" aria-label={t('desktop.guest_panel_eyebrow')}>
            <div className="guest-promo__head">
              <div>
                <p className="guest-promo__eyebrow">{t('desktop.guest_panel_eyebrow')}</p>
                <h1 className="guest-promo__title">{t('desktop.guest_panel_title')}</h1>
              </div>
              <span className="guest-promo__badge">{t('desktop.guest_panel_badge')}</span>
            </div>

            <p className="guest-promo__description">{t('desktop.guest_panel_description')}</p>

            <div className="guest-promo__features">
              <article className="guest-feature">
                <span className="guest-feature__icon">
                  <i className="fa-solid fa-chart-line" />
                </span>
                <div>
                  <h3>{t('desktop.guest_feature_growth_title')}</h3>
                  <p>{t('desktop.guest_feature_growth_desc')}</p>
                </div>
              </article>
              <article className="guest-feature">
                <span className="guest-feature__icon">
                  <i className="fa-solid fa-briefcase" />
                </span>
                <div>
                  <h3>{t('desktop.guest_feature_management_title')}</h3>
                  <p>{t('desktop.guest_feature_management_desc')}</p>
                </div>
              </article>
              <article className="guest-feature">
                <span className="guest-feature__icon">
                  <i className="fa-solid fa-shield-halved" />
                </span>
                <div>
                  <h3>{t('desktop.guest_feature_security_title')}</h3>
                  <p>{t('desktop.guest_feature_security_desc')}</p>
                </div>
              </article>
            </div>

            <div className="guest-promo__chips">
              <span>
                <i className="fa-solid fa-arrow-right-to-bracket" />
                {t('desktop.guest_chip_login')}
              </span>
              <span>
                <i className="fa-solid fa-user-plus" />
                {t('desktop.guest_chip_register')}
              </span>
              <span>
                <i className="fa-solid fa-id-card" />
                {t('desktop.guest_chip_access')}
              </span>
            </div>
          </section>
        </div>
      </div>

      <UlanishFromCredit className="ulanish-from-credit--auth" />
      <HamyanWhatsappFab />
    </div>
  )
}
