import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import type { PublicBusiness, PublicBusinessProfile } from '@/lib/publicCompanyWebsite'
import { whatsappChatUrl } from '@/lib/whatsapp'
import { LanguageModal } from '@/components/LanguageModal'
import { useCachedAsset } from '@/hooks/useCachedAsset'

type Props = {
  business: PublicBusiness
  profile: PublicBusinessProfile | null
  children: ReactNode
}

export function CompanyPublicLayout({ business, profile, children }: Props) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const base = `/c/${business.slug}`
  const waFabHref = whatsappChatUrl(profile?.whatsapp)
  const logoSrc = useCachedAsset(business.logo)

  useEffect(() => {
    const close = () => setMenuOpen(false)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close)
    return () => {
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close)
    }
  }, [])

  return (
    <div className="cw-shell">
      <header className="cw-header">
        <div className="cw-header-inner container">
          <Link to={base} className="cw-brand">
            {logoSrc ? (
              <img src={logoSrc} alt={business.name} className="cw-brand-logo" />
            ) : (
              <span className="cw-footer-mark" aria-hidden="true" />
            )}
            <div className="cw-brand-text">
              <h1 className="cw-brand-name">{business.name}</h1>
              {business.tagline ? <div className="cw-brand-tag">{business.tagline}</div> : null}
            </div>
          </Link>

          <nav className="cw-nav-desktop">
            <NavLink to={base} end className="cw-nav-link">
              <i className="fa-solid fa-chevron-right" />
              <span>{t('desktop.cw_home')}</span>
            </NavLink>
            <NavLink to={`${base}/products`} className="cw-nav-link">
              <i className="fa-solid fa-chevron-right" />
              <span>{t('desktop.cw_products')}</span>
            </NavLink>
            <NavLink to={`${base}/contact-us`} className="cw-nav-link">
              <i className="fa-solid fa-chevron-right" />
              <span>{t('desktop.cw_contact')}</span>
            </NavLink>
          </nav>

          <button
            type="button"
            className="cw-lang-btn"
            onClick={() => setLangOpen(true)}
            aria-label={t('desktop.language_title')}
          >
            <i className="fa-solid fa-language" />
          </button>

          {(business.phone || profile?.phone) && (
            <a className="cw-cta" href={`tel:${business.phone || profile?.phone}`}>
              <i className="fa-solid fa-phone" />
              <span>{business.phone || profile?.phone}</span>
            </a>
          )}

          <button
            type="button"
            aria-label="menu"
            className="cw-burger"
            onClick={() => setMenuOpen((s) => !s)}
          >
            <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-list'}`} />
          </button>
        </div>

        <div className={`cw-mobile-wrap${menuOpen ? ' open' : ''}`}>
          <div className="cw-mobile-overlay" onClick={() => setMenuOpen(false)} />
          <nav className="cw-mobile-menu">
            <NavLink to={base} end className="cw-nav-link" onClick={() => setMenuOpen(false)}>
              <span>{t('desktop.cw_home')}</span>
            </NavLink>
            <NavLink
              to={`${base}/products`}
              className="cw-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              <span>{t('desktop.cw_products')}</span>
            </NavLink>
            <NavLink
              to={`${base}/contact-us`}
              className="cw-nav-link"
              onClick={() => setMenuOpen(false)}
            >
              <span>{t('desktop.cw_contact')}</span>
            </NavLink>
            {(business.phone || profile?.phone) && (
              <a
                className="cw-mobile-cta"
                href={`tel:${business.phone || profile?.phone}`}
                onClick={() => setMenuOpen(false)}
              >
                <i className="fa-solid fa-phone" />
                <span>{business.phone || profile?.phone}</span>
              </a>
            )}
          </nav>
        </div>
      </header>

      <main>{children}</main>

      <footer className="cw-footer">
        <div className="container">
          <div className="cw-footer-grid">
            <div className="cw-footer-card">
              <div className="cw-footer-brand">
                {logoSrc ? (
                  <img src={logoSrc} alt={business.name} className="cw-footer-logo" />
                ) : (
                  <span className="cw-footer-mark" aria-hidden="true" />
                )}
                <div>
                  <h5 className="cw-footer-name">{business.name}</h5>
                </div>
              </div>
              <div className="cw-socials">
                {profile?.facebook ? (
                  <a href={profile.facebook} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-facebook" />
                  </a>
                ) : null}
                {profile?.instagram ? (
                  <a href={profile.instagram} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-instagram" />
                  </a>
                ) : null}
                {profile?.telegram ? (
                  <a href={profile.telegram} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-telegram" />
                  </a>
                ) : null}
                {profile?.youtube ? (
                  <a href={profile.youtube} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-youtube" />
                  </a>
                ) : null}
                {profile?.linkedin ? (
                  <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-linkedin" />
                  </a>
                ) : null}
                {profile?.twitter ? (
                  <a href={profile.twitter} target="_blank" rel="noopener noreferrer">
                    <i className="fa-brands fa-x-twitter" />
                  </a>
                ) : null}
              </div>
            </div>

            <div className="cw-footer-card">
              <h6 className="cw-col-title">
                {t('desktop.cw_contact_info')} - {business.name}
              </h6>
              <ul className="cw-contact-list">
                {profile?.address_dari ? (
                  <li>
                    <i className="fa-solid fa-location-dot" />
                    <span>{profile.address_dari}</span>
                  </li>
                ) : null}
                {profile?.phone ? (
                  <li>
                    <i className="fa-solid fa-phone" />
                    <a href={`tel:${profile.phone}`}>
                      {t('desktop.phone')}: {profile.phone}
                    </a>
                  </li>
                ) : null}
                {profile?.whatsapp ? (
                  <li>
                    <i className="fa-brands fa-whatsapp" />
                    <a
                      href={whatsappChatUrl(profile.whatsapp) || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t('desktop.whatsapp')}: {profile.whatsapp}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>

          <div className="cw-footer-bottom">
            <Link to="/">{t('desktop.app_name')}</Link>
            <span>
              <a href="https://ulanish.dev/terms" target="_blank" rel="noopener noreferrer">{t('desktop.terms')}</a>
              {' - '}
              <a href="https://ulanish.dev/privacy" target="_blank" rel="noopener noreferrer">{t('desktop.policies')}</a>
            </span>
          </div>
        </div>
      </footer>

      {waFabHref ? (
        <a
          className="cw-wa-fab"
          href={waFabHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t('desktop.whatsapp')}
        >
          <i className="fa-brands fa-whatsapp" />
        </a>
      ) : null}

      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} />
    </div>
  )
}
