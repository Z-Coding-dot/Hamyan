import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getApiErrorMessage } from '@/lib/auth'
import type { BusinessItemRow } from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { localizeCurrency } from '@/lib/currency'
import { useListsCacheStore } from '@/store/useListsCacheStore'

type Props = {
  open: boolean
  onClose: () => void
  token: string | null
  userKey: string
  companyId: string
}

function itemStock(item: BusinessItemRow): number {
  const n = Number(item.total_inventory ?? item.stock ?? item.company_stock ?? 0)
  return Number.isFinite(n) ? n : 0
}

function matchesQuery(item: BusinessItemRow, query: string): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return false
  return [item.name, item.code, item.brand, item.model, item.color].some((value) =>
    String(value || '')
      .toLowerCase()
      .includes(q),
  )
}

export function ItemPriceSearchModal({ open, onClose, token, userKey, companyId }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const ensureItems = useListsCacheStore((state) => state.ensureItems)
  const cached = useListsCacheStore((state) => state.getItems(userKey, companyId, 'product'))

  const [query, setQuery] = useState('')
  const [items, setItems] = useState<BusinessItemRow[]>(cached?.items ?? [])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  useEffect(() => {
    if (!open) {
      setQuery('')
      setError(null)
      return
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(id)
  }, [open])

  useEffect(() => {
    if (!open || !token || !companyId) return
    let active = true
    const hasCached = Boolean(useListsCacheStore.getState().getItems(userKey, companyId, 'product'))
    if (!hasCached) setLoading(true)
    setError(null)
    void ensureItems(token, userKey, companyId, 'product')
      .then((payload) => {
        if (!active) return
        setItems(payload?.items ?? [])
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [open, token, userKey, companyId, ensureItems])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return [] as BusinessItemRow[]
    const matched = items.filter((item) => matchesQuery(item, q))
    const exactCode = matched.filter((item) => String(item.code || '').toLowerCase() === q)
    const rest = matched.filter((item) => String(item.code || '').toLowerCase() !== q)
    return [...exactCode, ...rest].slice(0, 20)
  }, [items, query])

  if (!open) return null

  const trimmed = query.trim()
  const showList = Boolean(trimmed)

  return (
    <div className="item-price-search" role="presentation" onClick={onClose}>
      <div
        className={`item-price-search__panel${showList || error ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t('desktop.dash_price_search')}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="item-price-search__box">
          <i className="fa-solid fa-magnifying-glass" aria-hidden />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('desktop.dash_price_search_placeholder')}
            autoComplete="off"
            spellCheck={false}
            aria-label={t('desktop.dash_price_search')}
          />
          {query.trim() ? (
            <button
              type="button"
              className="item-price-search__clear"
              onClick={() => setQuery('')}
              aria-label={t('desktop.help_clear_search')}
            >
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>
          ) : null}
        </div>

        {error ? <div className="alert-error item-price-search__error">{error}</div> : null}

        {showList ? (
          <div className="item-price-search__results">
            {loading && items.length === 0 ? (
              <p className="item-price-search__empty">
                <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.loading')}
              </p>
            ) : results.length === 0 ? (
              <p className="item-price-search__empty">{t('desktop.no_matching_items')}</p>
            ) : (
              <ul>
                {results.map((item) => {
                  const price =
                    item.sale_price == null
                      ? t('desktop.dash_price_not_set')
                      : `${formatMoney(item.sale_price)} ${localizeCurrency(item.sale_currency, t)}`
                  const stock = itemStock(item)
                  const beside = [item.color, item.brand].filter(Boolean).join(' • ')
                  const meta = item.model ? String(item.model) : ''
                  return (
                    <li key={item.id}>
                      <div className="item-price-search__row">
                        <div className="item-price-search__main">
                          <strong className="item-price-search__title">
                            <span>{item.name || '—'}</span>
                            {beside ? (
                              <span className="item-price-search__beside">{beside}</span>
                            ) : null}
                          </strong>
                          {meta ? <span className="item-price-search__meta">{meta}</span> : null}
                          <span className="item-price-search__code">
                            <i className="fa-solid fa-barcode" />
                            {item.code || '—'}
                          </span>
                        </div>
                        <div className="item-price-search__side">
                          <em>{price}</em>
                          <small>
                            {t('desktop.inventory')}: {formatMoney(stock)}
                          </small>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
