import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { CompanyPublicLayout } from '@/components/public-website/CompanyPublicLayout'
import { PublicProductCard } from '@/components/public-website/PublicProductCard'
import { PublicWebsiteCarousel } from '@/components/public-website/PublicWebsiteCarousel'
import { ShareButtons } from '@/components/public-website/ShareButtons'
import { SeoHead } from '@/components/SeoHead'
import {
  fetchPublicBusinessWebsite,
  type PublicBusiness,
  type PublicBusinessProfile,
  type PublicProductCard as Product,
  type PublicSlider,
} from '@/lib/publicCompanyWebsite'

export function CompanyWebsiteHomePage() {
  const { slug = '' } = useParams()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [business, setBusiness] = useState<PublicBusiness | null>(null)
  const [profile, setProfile] = useState<PublicBusinessProfile | null>(null)
  const [items, setItems] = useState<Product[]>([])
  const [sliders, setSliders] = useState<PublicSlider[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetchPublicBusinessWebsite(slug)
      .then((data) => {
        if (cancelled) return
        setBusiness(data.business)
        setProfile(data.profile)
        setItems(data.items)
        setSliders(data.sliders)
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

  const productsUrl = `/c/${business.slug}/products`

  return (
    <CompanyPublicLayout business={business} profile={profile}>
      <SeoHead title={business.name} description={profile?.address_dari || business.name} />
      <div className="container cw-page">
        <PublicWebsiteCarousel slides={sliders} />

        <section className="cw-section-head">
          <h2>{t('desktop.cw_latest_products')}</h2>
          <Link to={productsUrl} className="cw-outline-btn">
            {t('desktop.view_all')}
          </Link>
        </section>

        {items.length === 0 ? (
          <div className="cw-empty">
            <i className="fa-solid fa-box" />
            <p>{t('desktop.cw_no_products')}</p>
          </div>
        ) : (
          <div className="cw-products-grid">
            {items.map((p) => (
              <PublicProductCard
                key={p.id}
                product={p}
                href={`${productsUrl}/${p.slug}`}
              />
            ))}
          </div>
        )}

        <div className="cw-center-cta">
          <Link to={productsUrl} className="cw-primary-btn">
            {t('desktop.cw_all_products')}
          </Link>
        </div>

        <ShareButtons title={business.name} text={business.name} />
      </div>
    </CompanyPublicLayout>
  )
}
