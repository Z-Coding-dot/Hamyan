import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { SearchField } from '@/components/inputs/SearchField'
import { CompanyPublicLayout } from '@/components/public-website/CompanyPublicLayout'
import { PublicProductCard } from '@/components/public-website/PublicProductCard'
import { ShareButtons } from '@/components/public-website/ShareButtons'
import { SeoHead } from '@/components/SeoHead'
import {
  fetchPublicBusinessProducts,
  type PublicBusiness,
  type PublicBusinessProfile,
  type PublicProductCard as Product,
} from '@/lib/publicCompanyWebsite'

export function CompanyWebsiteProductsPage() {
  const { slug = '' } = useParams()
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'new')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [business, setBusiness] = useState<PublicBusiness | null>(null)
  const [profile, setProfile] = useState<PublicBusinessProfile | null>(null)
  const [items, setItems] = useState<Product[]>([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    void fetchPublicBusinessProducts(slug, {
      q: searchParams.get('q') || undefined,
      sort: searchParams.get('sort') || 'new',
      page: Number(searchParams.get('page') || 1),
    })
      .then((data) => {
        if (cancelled) return
        setBusiness(data.business)
        setProfile(data.profile)
        setItems(data.items.data)
        setPage(data.items.current_page)
        setLastPage(data.items.last_page)
        setQ(data.filters.q || '')
        setSort(data.filters.sort || 'new')
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
  }, [slug, searchParams, t])

  const applyFilters = (event?: FormEvent) => {
    event?.preventDefault()
    const next = new URLSearchParams()
    if (q.trim()) next.set('q', q.trim())
    if (sort && sort !== 'new') next.set('sort', sort)
    setSearchParams(next)
  }

  if (loading && !business) {
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
      <SeoHead title={`${business.name} | ${t('desktop.cw_products')}`} />
      <div className="container cw-page">
        <section className="cw-products-toolbar">
          <div>
            <h2>{t('desktop.cw_products')}</h2>
            <p>{business.name}</p>
          </div>
          <form className="cw-filters" onSubmit={applyFilters}>
            <SearchField
              value={q}
              onChange={setQ}
              placeholder={t('desktop.cw_search_products')}
            />
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="new">{t('desktop.cw_sort_newest')}</option>
              <option value="old">{t('desktop.cw_sort_oldest')}</option>
              <option value="price_asc">{t('desktop.cw_sort_price_asc')}</option>
              <option value="price_desc">{t('desktop.cw_sort_price_desc')}</option>
            </Select>
            <button type="submit" className="cw-primary-btn">
              {t('desktop.cw_apply')}
            </button>
          </form>
        </section>

        {items.length === 0 ? (
          <div className="cw-empty">
            <i className="fa-solid fa-box" />
            <p>{t('desktop.cw_no_products')}</p>
          </div>
        ) : (
          <div className="cw-products-grid">
            {items.map((p) => (
              <PublicProductCard key={p.id} product={p} href={`${productsUrl}/${p.slug}`} />
            ))}
          </div>
        )}

        {lastPage > 1 ? (
          <div className="cw-pagination">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => {
                const next = new URLSearchParams(searchParams)
                next.set('page', String(page - 1))
                setSearchParams(next)
              }}
            >
              ‹
            </button>
            <span>
              {page} / {lastPage}
            </span>
            <button
              type="button"
              disabled={page >= lastPage}
              onClick={() => {
                const next = new URLSearchParams(searchParams)
                next.set('page', String(page + 1))
                setSearchParams(next)
              }}
            >
              ›
            </button>
          </div>
        ) : null}

        <ShareButtons title={`${business.name} | ${t('desktop.cw_products')}`} />
      </div>
    </CompanyPublicLayout>
  )
}
