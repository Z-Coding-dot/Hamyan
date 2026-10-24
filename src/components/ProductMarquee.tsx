import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { appOrigin } from '@/lib/config'
import { fetchUlanishProducts, type UlanishProductCard } from '@/lib/user'

const CARD_STEP = 292

type Props = {
  variant?: 'app' | 'home'
}

function productLogo(path?: string | null): string | null {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  return `${appOrigin}/${path.replace(/^\/+/, '')}`
}

function productHref(url?: string | null): string {
  const value = url?.trim()
  if (value && /^https?:\/\//i.test(value)) return value
  return 'https://ulanish.dev'
}

export function ProductMarquee({ variant = 'app' }: Props) {
  const { t, i18n } = useTranslation()
  const viewportRef = useRef<HTMLDivElement>(null)
  const [products, setProducts] = useState<UlanishProductCard[]>([])
  const [repeat, setRepeat] = useState(2)
  const [duration, setDuration] = useState(36)

  useEffect(() => {
    let active = true
    void fetchUlanishProducts()
      .then((items) => {
        if (active) setProducts(items)
      })
      .catch(() => {
        if (active) setProducts([])
      })
    return () => {
      active = false
    }
  }, [])

  useLayoutEffect(() => {
    const viewport = viewportRef.current
    if (!viewport || products.length === 0) return

    const measure = () => {
      const unit = products.length * CARD_STEP
      const copies = Math.max(1, Math.ceil((viewport.clientWidth + CARD_STEP) / unit))
      const half = copies * unit
      const nextDuration = Math.max(16, half / 46)
      setRepeat((current) => (current === copies ? current : copies))
      setDuration((current) => (Math.abs(current - nextDuration) < 0.4 ? current : nextDuration))
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [products])

  if (products.length === 0) return null

  const half = Array.from({ length: repeat }, () => products).flat()
  const track = [...half, ...half]
  const lang = (i18n.resolvedLanguage || i18n.language || 'fa').slice(0, 2)
  const toLeft = lang === 'en'

  return (
    <section className={`hy-products${variant === 'home' ? ' hy-marquee-band' : ''}`}>
      <div className="hy-products__head">
        <h3>{t('desktop.hy_products')}</h3>
        <p>{t('desktop.hy_products_note')}</p>
      </div>
      <div className="hy-marquee" ref={viewportRef}>
        <div
          className={`hy-marquee__track${toLeft ? ' is-to-left' : ' is-to-right'}`}
          style={{ animationDuration: `${duration}s` }}
        >
          {track.map((item, index) => {
            const logo = productLogo(item.logo)
            return (
              <a
                key={`${item.id}-${index}`}
                className="hy-product"
                dir={toLeft ? 'ltr' : 'rtl'}
                href={productHref(item.website_url)}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="hy-product__logo">
                  {logo ? <img src={logo} alt="" /> : <i className="fa-solid fa-cube" aria-hidden />}
                </span>
                <span>
                  <strong>{item.name}</strong>
                  {item.subtitle ? <small>{item.subtitle}</small> : null}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}
