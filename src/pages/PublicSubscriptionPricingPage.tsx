import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { SeoHead } from '@/components/SeoHead'
import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchSubscriptionPricing,
  type SubscriptionPlanOption,
  type SubscriptionPricing,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'

function formatAfn(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })
}

function planLabel(item: SubscriptionPlanOption, t: (key: string, opts?: Record<string, unknown>) => string): string {
  if (item.duration_type === 'month') return t('desktop.subscription_pricing_month')
  return t('desktop.reseller_sell_year_option', { count: item.duration_count || 1 })
}

/** Public page: company subscription fee / discount for 1–5 years. */
export function PublicSubscriptionPricingPage() {
  const { t } = useTranslation()
  const token = useAuthStore((s) => s.token)
  const [pricing, setPricing] = useState<SubscriptionPricing | null>(null)
  const [selected, setSelected] = useState('year_1')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    void fetchSubscriptionPricing()
      .then((data) => {
        if (!active) return
        setPricing(data)
        const defaultCode =
          data.defaults?.duration_type === 'month'
            ? 'month_1'
            : `year_${data.defaults?.duration_count || 1}`
        const yearOptions = (data.options || []).filter((o) => o.duration_type === 'year')
        const next =
          yearOptions.find((o) => o.code === defaultCode)?.code ||
          yearOptions[0]?.code ||
          defaultCode
        setSelected(next)
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
  }, [])

  const yearPlans = useMemo(
    () => (pricing?.options || []).filter((item) => item.duration_type === 'year'),
    [pricing],
  )

  const plan = yearPlans.find((item) => item.code === selected) || yearPlans[0]
  const annualBaseFee = Number(pricing?.annual_base_fee ?? 0)
  const annualDiscount = Number(pricing?.annual_discount ?? 0)
  const original = Number(plan?.original_amount || 0)
  const discountAmount = Number(plan?.discount_amount || 0)
  const payable = Number(plan?.payable_amount || 0)
  const annualBaseShown = Number(plan?.applied_annual_base_fee ?? annualBaseFee)
  const discountPercentRaw = (() => {
    const explicitRate = Number(plan?.discount_rate ?? 0)
    if (explicitRate > 0) return explicitRate
    if (original <= 0 || discountAmount <= 0) return 0
    return (discountAmount / original) * 100
  })()
  const discountPercent = Number.isInteger(discountPercentRaw)
    ? discountPercentRaw
    : Number(discountPercentRaw.toFixed(1))

  return (
    <div className="pub-affiliate" dir="rtl">
      <SeoHead description={t('desktop.subscription_pricing_seo')} />
      <div className="guest-page-back">
        <Link to={token ? '/dashboard' : '/'} className="guest-back-home">
          <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          <span>{token ? t('desktop.back_to_dashboard') : t('desktop.back_to_home')}</span>
        </Link>
      </div>

      <header className="pub-affiliate__hero">
        <span className="pub-affiliate__badge">
          <i className="fa-solid fa-tags" aria-hidden />
          {t('desktop.subscription_pricing_badge')}
        </span>
        <h1>{t('desktop.subscription_pricing_title')}</h1>
        <p className="pub-affiliate__lead">{t('desktop.subscription_pricing_lead')}</p>
        <div className="pub-affiliate__actions">
          <Link to="/resellers" className="btn-primary">
            {t('desktop.reseller_nav')}
            <i className="fa-solid fa-arrow-left" aria-hidden />
          </Link>
          <Link to="/become-reseller" className="btn-secondary">
            {t('desktop.reseller_become_nav')}
          </Link>
        </div>
      </header>

      {error ? (
        <div className="alert-error" role="alert" style={{ marginTop: 16 }}>
          {error}
        </div>
      ) : null}

      <section className="pub-affiliate__steps company-renew pub-subscription-pricing">
        {loading && !pricing ? <p className="muted">{t('desktop.loading')}</p> : null}

        {pricing ? (
          <>
            <ul className="reseller-quote-list">
              <li>
                <span>{t('desktop.annual_base_fee')}</span>
                <strong>
                  {formatAfn(annualBaseFee)} {t('desktop.afn')}
                </strong>
              </li>
              <li>
                <span>{t('desktop.discount')}</span>
                <strong>
                  {formatAfn(annualDiscount)} {t('desktop.afn')}
                </strong>
              </li>
            </ul>

            <p className="company-renew-duration-label" style={{ marginTop: 16 }}>
              {t('desktop.renew_duration')}:
            </p>
            <div className="company-renew-plans">
              {yearPlans.map((item) => (
                <button
                  key={item.code}
                  type="button"
                  className={`company-renew-plan${selected === item.code ? ' is-selected' : ''}`}
                  onClick={() => setSelected(item.code)}
                >
                  <strong>{planLabel(item, t)}</strong>
                </button>
              ))}
            </div>

            {plan ? (
              <div className="company-renew-summary" style={{ marginTop: 16 }}>
                <div>
                  <span>{t('desktop.annual_base_fee')}</span>
                  <strong>
                    {formatAfn(annualBaseShown)} {t('desktop.afn')}
                  </strong>
                </div>
                <div>
                  <span>{t('desktop.original_price')}</span>
                  <strong>
                    {formatAfn(original)} {t('desktop.afn')}
                  </strong>
                </div>
                <div className="company-renew-summary__discount">
                  <span>
                    {t('desktop.discount')} ({discountPercent}%)
                  </span>
                  <strong>
                    {formatAfn(discountAmount)} {t('desktop.afn')}
                  </strong>
                </div>
                <div className="company-renew-summary__payable">
                  <span>{t('desktop.payable_amount')}</span>
                  <strong>
                    {formatAfn(payable)} {t('desktop.afn')}
                  </strong>
                </div>
              </div>
            ) : null}

            <p className="muted" style={{ marginTop: 14 }}>
              {t('desktop.subscription_pricing_note')}
            </p>
          </>
        ) : null}
      </section>
    </div>
  )
}
