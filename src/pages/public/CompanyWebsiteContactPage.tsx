import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { CompanyPublicLayout } from '@/components/public-website/CompanyPublicLayout'
import { ShareButtons } from '@/components/public-website/ShareButtons'
import { SeoHead } from '@/components/SeoHead'
import {
  fetchPublicBusinessContact,
  type PublicBusiness,
  type PublicBusinessProfile,
} from '@/lib/publicCompanyWebsite'
import { whatsappChatUrl } from '@/lib/whatsapp'

export function CompanyWebsiteContactPage() {
  const { slug = '' } = useParams()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [business, setBusiness] = useState<PublicBusiness | null>(null)
  const [profile, setProfile] = useState<PublicBusinessProfile | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    void fetchPublicBusinessContact(slug)
      .then((data) => {
        if (cancelled) return
        setBusiness(data.business)
        setProfile(data.profile)
      })
      .catch(() => {
        if (!cancelled) setError(t('desktop.cw_not_found'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, t])

  const copy = useCallback((val?: string | null) => {
    if (!val) return
    void navigator.clipboard.writeText(String(val))
  }, [])

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (error || !business) {
    return (
      <div className="center-screen cw-empty">
        <p>{error || t('desktop.cw_not_found')}</p>
        <Link to="/">{t('desktop.back_to_home')}</Link>
      </div>
    )
  }

  const base = `/c/${business.slug}`
  const waHref = whatsappChatUrl(profile?.whatsapp)
  const hasSocial =
    profile?.facebook ||
    profile?.instagram ||
    profile?.telegram ||
    profile?.youtube ||
    profile?.linkedin ||
    profile?.twitter

  return (
    <CompanyPublicLayout business={business} profile={profile}>
      <SeoHead title={`${business.name} | ${t('desktop.cw_contact')}`} />

      <section className="cw-hero-contact">
        <div className="container">
          <h2 className="cw-hero-title">{t('desktop.cw_contact')}</h2>
          <p className="cw-hero-sub">{business.tagline || t('desktop.cw_we_are_here')}</p>
        </div>
      </section>

      <div className="container cw-page cw-contact">
        <div className="cw-contact-grid">
          <div className="cw-card">
            <div className="cw-card-hd">
              <i className="fa-solid fa-location-dot" />
              <h6>{t('desktop.cw_address')}</h6>
            </div>
            <div className="cw-card-bd">
              <p>{profile?.address_dari || t('desktop.cw_not_available')}</p>
            </div>
          </div>

          <div className="cw-card">
            <div className="cw-card-hd">
              <i className="fa-solid fa-phone" />
              <h6>{t('desktop.phone')}</h6>
            </div>
            <div className="cw-card-bd">
              <div className="cw-row">
                <div className="cw-row-l">
                  <i className="fa-solid fa-phone" />
                  {profile?.phone ? (
                    <a href={`tel:${profile.phone}`}>{profile.phone}</a>
                  ) : (
                    <span className="cw-muted">{t('desktop.cw_not_available')}</span>
                  )}
                </div>
                {profile?.phone ? (
                  <button type="button" className="cw-copy" onClick={() => copy(profile.phone)}>
                    <i className="fa-solid fa-clipboard-check" />
                  </button>
                ) : null}
              </div>

              <div className="cw-row">
                <div className="cw-row-l">
                  <i className="fa-brands fa-whatsapp" />
                  {waHref ? (
                    <a href={waHref} target="_blank" rel="noopener noreferrer">
                      {t('desktop.whatsapp')}: {profile?.whatsapp}
                    </a>
                  ) : (
                    <span className="cw-muted">
                      {t('desktop.whatsapp')}: {t('desktop.cw_not_available')}
                    </span>
                  )}
                </div>
                {profile?.whatsapp ? (
                  <button type="button" className="cw-copy" onClick={() => copy(profile.whatsapp)}>
                    <i className="fa-solid fa-clipboard-check" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="cw-card">
            <div className="cw-card-hd">
              <i className="fa-solid fa-envelope" />
              <h6>{t('desktop.cw_email')}</h6>
            </div>
            <div className="cw-card-bd">
              <div className="cw-row">
                <div className="cw-row-l">
                  <i className="fa-regular fa-envelope-open" />
                  {profile?.email ? (
                    <a href={`mailto:${profile.email}`}>{profile.email}</a>
                  ) : (
                    <span className="cw-muted">{t('desktop.cw_not_available')}</span>
                  )}
                </div>
                {profile?.email ? (
                  <button type="button" className="cw-copy" onClick={() => copy(profile.email)}>
                    <i className="fa-solid fa-clipboard-check" />
                  </button>
                ) : null}
              </div>
              <div className="cw-row">
                <div className="cw-row-l">
                  <i className="fa-solid fa-earth-asia" />
                  <Link to={base}>{business.name}</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasSocial ? (
          <div className="cw-socials-wrap">
            <div className="cw-socials cw-socials--lg">
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
        ) : null}

        <div className="cw-map placeholder">
          <div className="cw-map-inner">
            <div className="cw-map-empty">
              <i className="fa-regular fa-map" />
              <span>{t('desktop.cw_map_coming_soon')}</span>
            </div>
          </div>
        </div>

        <ShareButtons title={business.name} text={`${t('desktop.cw_contact')} — ${business.name}`} />
      </div>
    </CompanyPublicLayout>
  )
}
