import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { CompanyPublicLayout } from '@/components/public-website/CompanyPublicLayout'
import { PublicProductCard } from '@/components/public-website/PublicProductCard'
import { ShareButtons } from '@/components/public-website/ShareButtons'
import { SeoHead } from '@/components/SeoHead'
import {
  fetchPublicBusinessProduct,
  type PublicBusiness,
  type PublicBusinessProfile,
  type PublicProductCard as Product,
  type PublicProductDetail,
} from '@/lib/publicCompanyWebsite'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { whatsappChatUrl } from '@/lib/whatsapp'

export function CompanyWebsiteProductPage() {
  const { slug = '', productId = '' } = useParams()
  const { t } = useTranslation()
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)
  const [business, setBusiness] = useState<PublicBusiness | null>(null)
  const [profile, setProfile] = useState<PublicBusinessProfile | null>(null)
  const [item, setItem] = useState<PublicProductDetail | null>(null)
  const [related, setRelated] = useState<Product[]>([])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setMissing(false)
    void fetchPublicBusinessProduct(slug, productId)
      .then((data) => {
        if (cancelled) return
        setBusiness(data.business)
        setProfile(data.profile)
        setItem(data.item)
        setRelated(data.related)
      })
      .catch(() => {
        if (!cancelled) setMissing(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [slug, productId])

  const pageUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : ''
  const imageSrc = useCachedAsset(item?.image)

  const waOrderHref = useMemo(() => {
    if (!item || !profile?.whatsapp) return null
    const text = t('desktop.cw_whatsapp_order_text', {
      product: item.name || '',
      url: pageUrl,
    })
    return whatsappChatUrl(profile.whatsapp, text)
  }, [item, profile?.whatsapp, pageUrl, t])

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (missing || !business || !item) {
    return <Navigate to={`/c/${slug}/products`} replace />
  }

  const phone = profile?.phone || business.phone
  const productsUrl = `/c/${business.slug}/products`
  const isDigital = String(item.type || '').toLowerCase() === 'digital'

  return (
    <CompanyPublicLayout business={business} profile={profile}>
      <SeoHead title={`${item.name} | ${business.name}`} />

      <section className="cw-breadcrumb">
        <div className="container">
          <div className="cw-breadcrumb__row">
            <nav className="cw-breadcrumb__nav">
              <Link to={`/c/${business.slug}`}>
                <i className="fa-solid fa-house" /> {business.name}
              </Link>
              <span>/</span>
              <Link to={productsUrl}>{t('desktop.cw_products')}</Link>
              <span>/</span>
              <strong>{item.name}</strong>
            </nav>
            <Link to={productsUrl} className="cw-outline-btn cw-outline-btn--sm">
              <i className="fa-solid fa-arrow-right" /> {t('desktop.cw_back')}
            </Link>
          </div>
        </div>
      </section>

      <div className="container cw-page">
        <div className="cw-product-show">
          <div className="cw-product-show__media">
            <img
              src={imageSrc || '/icons/pwa-192.png'}
              alt={item.name}
              onError={(e) => {
                e.currentTarget.src = '/icons/pwa-192.png'
              }}
            />
          </div>

          <div className="cw-product-show__info">
            <h1>{item.name}</h1>

            <div className="cw-product-badges">
              <span className="cw-badge cw-badge--price">
                <strong>{Number(item.afn || 0).toLocaleString('en-US')}</strong> {t('desktop.cw_afn')}
              </span>
              <span className={`cw-badge ${item.in_stock ? 'cw-badge--ok' : 'cw-badge--muted'}`}>
                {item.in_stock ? t('desktop.cw_in_stock') : t('desktop.cw_out_of_stock')}
              </span>
            </div>

            <div className="cw-specs-card">
              <h2>{t('desktop.cw_details')}</h2>
              <div className="cw-specs-grid">
                {item.code ? <Spec label={t('desktop.code')} value={item.code} /> : null}
                {item.brand ? <Spec label={t('desktop.brand')} value={item.brand} /> : null}
                {item.model ? <Spec label={t('desktop.model')} value={item.model} /> : null}
                {item.color ? <Spec label={t('desktop.color')} value={item.color} /> : null}
                {item.category ? <Spec label={t('desktop.cw_category')} value={item.category} /> : null}
                {isDigital && item.ram ? <Spec label="RAM" value={String(item.ram)} /> : null}
                {isDigital && item.storage ? <Spec label="Storage" value={String(item.storage)} /> : null}
              </div>
            </div>

            <div className="cw-product-actions">
              {phone ? (
                <a className="cw-btn cw-btn--dark" href={`tel:${phone}`}>
                  <i className="fa-solid fa-phone" /> {t('desktop.cw_call_now')}
                </a>
              ) : null}
              {waOrderHref ? (
                <a className="cw-btn cw-btn--wa" href={waOrderHref} target="_blank" rel="noopener noreferrer">
                  <i className="fa-brands fa-whatsapp" /> {t('desktop.cw_order')} {t('desktop.whatsapp')}
                </a>
              ) : null}
            </div>
          </div>
        </div>

        {item.description ? (
          <div className="cw-desc-card">
            <h2>{t('desktop.cw_description')}</h2>
            <p>{item.description}</p>
          </div>
        ) : null}

        {related.length > 0 ? (
          <section className="cw-related">
            <div className="cw-section-head">
              <h2>{t('desktop.cw_related_products')}</h2>
              <Link to={productsUrl} className="cw-outline-btn cw-outline-btn--sm">
                {t('desktop.view_all')}
              </Link>
            </div>
            <div className="cw-products-grid">
              {related.map((p) => (
                <PublicProductCard key={p.id} product={p} href={`${productsUrl}/${p.slug}`} compact />
              ))}
            </div>
          </section>
        ) : null}

        <ShareButtons title={item.name} text={`${item.name} — ${business.name}`} />
      </div>
    </CompanyPublicLayout>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="cw-spec">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}
