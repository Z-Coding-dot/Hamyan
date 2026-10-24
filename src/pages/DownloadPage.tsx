import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { SeoHead } from '@/components/SeoHead'
import { fetchPublicStats } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useToastStore } from '@/store/useToastStore'

/** Installers hosted on the marketing site (`ishanch-web/download`). */
const WINDOWS_URL =
  (import.meta.env.VITE_DOWNLOAD_WINDOWS_URL as string | undefined)?.trim() ||
  '/download/Hamyan-Setup.exe'
const ANDROID_URL =
  (import.meta.env.VITE_DOWNLOAD_ANDROID_URL as string | undefined)?.trim() ||
  '/download/HamyanApp.apk'

type PlatformCard = {
  id: 'windows' | 'android' | 'ios'
  icon: string
  accent: string
  comingSoon?: boolean
  href?: string
  filename?: string
}

const PLATFORMS: PlatformCard[] = [
  {
    id: 'windows',
    icon: 'fa-brands fa-windows',
    accent: 'windows',
    href: WINDOWS_URL,
    filename: 'Hamyan-Setup.exe',
  },
  {
    id: 'android',
    icon: 'fa-brands fa-android',
    accent: 'android',
    href: ANDROID_URL,
    filename: 'HamyanApp.apk',
  },
  { id: 'ios', icon: 'fa-brands fa-apple', accent: 'ios', comingSoon: true },
]

export function DownloadPage() {
  const { t } = useTranslation()
  const token = useAuthStore((s) => s.token)
  const showSuccess = useToastStore((s) => s.showSuccess)
  const [affiliateOpen, setAffiliateOpen] = useState(true)

  useEffect(() => {
    let active = true
    void fetchPublicStats()
      .then((stats) => {
        if (active) setAffiliateOpen(stats.affiliate_open !== false)
      })
      .catch(() => {
        /* keep default open */
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="download-page" dir="rtl">
      <SeoHead />
      <header className="download-hero">
        <span className="download-hero__badge">
          <i className="fa-solid fa-cloud-arrow-down" />
          {t('desktop.download_badge')}
        </span>
        <h1>{t('desktop.download_title')}</h1>
        <p>{t('desktop.download_subtitle')}</p>
        {!token ? (
          <Link to="/login" className="btn-secondary download-hero__login">
            <i className="fa-solid fa-arrow-right-to-bracket" />
            {t('desktop.download_have_account')}
          </Link>
        ) : null}
      </header>

      <div className="download-grid">
        {PLATFORMS.map((item) => (
          <article key={item.id} className={`download-card download-card--${item.accent}`}>
            <div className="download-card__icon" aria-hidden="true">
              <i className={item.icon} />
            </div>
            <h2>{t(`desktop.download_${item.id}_title`)}</h2>
            <p>{t(`desktop.download_${item.id}_desc`)}</p>
            {item.comingSoon ? (
              <button
                type="button"
                className="btn-primary download-card__cta"
                onClick={() => showSuccess(t('desktop.download_coming_soon'))}
              >
                <i className="fa-solid fa-download" />
                {t(`desktop.download_${item.id}_cta`)}
              </button>
            ) : (
              <a
                className="btn-primary download-card__cta"
                href={item.href}
                download={item.filename}
              >
                <i className="fa-solid fa-download" />
                {t(`desktop.download_${item.id}_cta`)}
              </a>
            )}
          </article>
        ))}
      </div>

      <section className="download-also">
        <h3>{t('desktop.download_also_title')}</h3>
        <div className="download-also__links">
          <Link to="/help">
            <i className="fa-solid fa-circle-info" /> {t('desktop.help_center')}
          </Link>
          {affiliateOpen ? (
            <Link to="/affiliates">
              <i className="fa-solid fa-handshake-angle" /> {t('desktop.public_affiliate_nav')}
            </Link>
          ) : null}
          <Link to="/exchange-rates">
            <i className="fa-solid fa-coins" /> {t('desktop.exchange_rates_title')}
          </Link>
        </div>
      </section>
    </div>
  )
}
