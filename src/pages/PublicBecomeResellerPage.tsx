import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { SeoHead } from '@/components/SeoHead'
import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchSubscriptionResellerQuote,
  type SubscriptionResellerQuote,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'

function formatAfn(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })
}

/** Public page: how to become a reseller + pricing + CTA. */
export function PublicBecomeResellerPage() {
  const { t } = useTranslation()
  const token = useAuthStore((s) => s.token)
  const [quote, setQuote] = useState<SubscriptionResellerQuote | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void fetchSubscriptionResellerQuote()
      .then((quoteRow) => {
        if (active) setQuote(quoteRow)
      })
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err))
      })
    return () => {
      active = false
    }
  }, [])

  const applyHref = token ? '/reseller/apply' : '/register'
  const applyLabel = token
    ? t('desktop.reseller_cta_auth')
    : t('desktop.reseller_cta_guest')

  return (
    <div className="pub-affiliate" dir="rtl">
      <SeoHead description={t('desktop.reseller_seo')} />
      <div className="guest-page-back">
        <Link to={token ? '/dashboard' : '/'} className="guest-back-home">
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          <span>{token ? t('desktop.back_to_dashboard') : t('desktop.back_to_home')}</span>
        </Link>
      </div>

      <header className="pub-affiliate__hero">
        <span className="pub-affiliate__badge">
          <i className="fa-solid fa-store" aria-hidden />
          {t('desktop.reseller_badge')}
        </span>
        <h1>{t('desktop.reseller_title')}</h1>
        <p className="pub-affiliate__slogan">{t('desktop.reseller_slogan')}</p>
        <p className="pub-affiliate__lead">{t('desktop.reseller_lead')}</p>
        <div className="pub-affiliate__actions">
          <Link to={applyHref} className="btn-primary">
            {applyLabel}
            <i className="fa-solid fa-arrow-left" aria-hidden />
          </Link>
          {!token ? (
            <Link to="/login" className="btn-secondary">
              {t('desktop.reseller_cta_login')}
            </Link>
          ) : null}
          <Link to="/resellers" className="btn-secondary">
            {t('desktop.reseller_view_directory')}
          </Link>
        </div>
      </header>

      {error ? (
        <div className="alert-error" role="alert" style={{ marginTop: 16 }}>
          {error}
        </div>
      ) : null}

      <section className="pub-affiliate__grid">
        <article>
          <i className="fa-solid fa-percent" aria-hidden />
          <h2>{t('desktop.reseller_why_1_title')}</h2>
          <p>{t('desktop.reseller_why_1_desc', { percent: quote?.margin_percent ?? 30 })}</p>
        </article>
        <article>
          <i className="fa-solid fa-boxes-stacked" aria-hidden />
          <h2>{t('desktop.reseller_why_2_title')}</h2>
          <p>{t('desktop.reseller_why_2_desc', { count: quote?.min_quantity ?? 10 })}</p>
        </article>
        <article>
          <i className="fa-solid fa-calculator" aria-hidden />
          <h2>{t('desktop.reseller_why_3_title')}</h2>
          <p>{t('desktop.reseller_why_3_desc', { percent: quote?.margin_percent ?? 30 })}</p>
        </article>
      </section>

      <section className="pub-affiliate__steps">
        <h2>{t('desktop.reseller_how_title')}</h2>
        <ol>
          <li>{t('desktop.reseller_step_1')}</li>
          <li>{t('desktop.reseller_step_2')}</li>
          <li>{t('desktop.reseller_step_3')}</li>
        </ol>
      </section>

      <section className="pub-affiliate__steps">
        <h2>{t('desktop.reseller_price_title')}</h2>
        {quote ? (
          <ul className="reseller-quote-list">
            <li>
              <span>{t('desktop.reseller_fee')}</span>
              <strong>{formatAfn(quote.annual_base_fee)}</strong>
            </li>
            <li>
              <span>{t('desktop.reseller_discount')}</span>
              <strong>{formatAfn(quote.annual_discount)}</strong>
            </li>
            <li>
              <span>{t('desktop.reseller_list_price')}</span>
              <strong>{formatAfn(quote.list_amount)}</strong>
            </li>
            <li>
              <span>{t('desktop.reseller_unit_cost')}</span>
              <strong>{formatAfn(quote.unit_reseller_cost)}</strong>
            </li>
            <li>
              <span>{t('desktop.reseller_unit_profit')}</span>
              <strong>{formatAfn(quote.unit_profit)}</strong>
            </li>
            <li>
              <span>
                {t('desktop.reseller_starter_pack', { count: quote.min_quantity })}
              </span>
              <strong>{formatAfn(quote.starter_pack_total)}</strong>
            </li>
          </ul>
        ) : (
          <p className="muted">{t('desktop.loading')}</p>
        )}
      </section>

      <p style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Link to="/reseller-terms">{t('desktop.reseller_terms_link')}</Link>
        <Link to="/resellers">{t('desktop.reseller_view_directory')}</Link>
      </p>
    </div>
  )
}
