import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useCachedAsset } from '@/hooks/useCachedAsset'
import type { PublicProductCard as Product } from '@/lib/publicCompanyWebsite'

type Props = {
  product: Product
  href: string
  compact?: boolean
}

export function PublicProductCard({ product, href, compact = false }: Props) {
  const { t } = useTranslation()
  const name = product.name || '—'
  const img = useCachedAsset(product.image) || '/icons/pwa-192.png'
  const afn = Number(product.afn ?? 0)

  return (
    <Link to={href} className={`pc-link${compact ? ' pc-compact' : ''}`}>
      <article className="pc-card">
        <div className="pc-media">
          <img
            src={img}
            alt={name}
            className="pc-img"
            onError={(e) => {
              e.currentTarget.src = '/icons/pwa-192.png'
            }}
          />
        </div>
        <div className="pc-info">
          <h6 className="pc-title" title={name}>
            {name}
          </h6>
          <div className="pc-prices">
            <div className="pc-price">
              <strong className="pc-price-val">{formatPrice(afn)}</strong>
              <span className="pc-price-label">{t('desktop.cw_afn')}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

function formatPrice(n: number) {
  return Number.isFinite(n) ? n.toLocaleString('en-US') : '0'
}
