import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { HesabPayAccountCard } from '@/components/HesabPayAccountCard'
import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchSubscriptionReseller,
  type SubscriptionResellerPayload,
  type SubscriptionResellerQuote,
} from '@/lib/user'
import { whatsappChatUrl } from '@/lib/whatsapp'
import { useAuthStore } from '@/store/useAuthStore'

const SUPPORT_WHATSAPP = '0703098630'
const DEPOSIT_MIN = 1000

function formatAfn(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })
}

function QuoteBox({ quote }: { quote: SubscriptionResellerQuote }) {
  const { t } = useTranslation()
  return (
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
        <span>{t('desktop.reseller_starter_pack', { count: quote.quantity })}</span>
        <strong>{formatAfn(quote.starter_pack_total)}</strong>
      </li>
    </ul>
  )
}

export function ResellerApplyPage() {
  const { t } = useTranslation()
  const { token } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
    })),
  )

  const [data, setData] = useState<SubscriptionResellerPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    setLoading(true)
    try {
      const payload = await fetchSubscriptionReseller(token)
      setData(payload)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  const minQty = data?.quote.min_quantity ?? 10
  const unitCost = data?.quote.unit_reseller_cost ?? 0
  const starterPackTotal = unitCost * minQty
  const walletBalance = data?.wallet_balance ?? 0
  const depositSuggested = Math.max(DEPOSIT_MIN, Math.round(starterPackTotal))
  const waHref = useMemo(
    () =>
      whatsappChatUrl(
        SUPPORT_WHATSAPP,
        t('desktop.reseller_receipt_pack_amount', {
          count: minQty,
          amount: formatAfn(depositSuggested),
        }),
      ),
    [t, minQty, depositSuggested],
  )

  if (!token) return null

  if (!loading && data?.has_account) {
    return <Navigate to="/reseller" replace />
  }

  const previewQuote = data
    ? {
        ...data.quote,
        quantity: minQty,
        starter_pack_total: starterPackTotal,
      }
    : null

  return (
    <div className="affiliate-page">
      <div className="affiliate-page__head">
        <div>
          <Link to="/dashboard" className="affiliate-back">
            <i className="fa-solid fa-arrow-right" aria-hidden />
            <span>{t('desktop.nav_dashboard')}</span>
          </Link>
          <h2>{t('desktop.reseller_apply_title')}</h2>
          <p className="muted">{t('desktop.reseller_apply_desc', { count: minQty })}</p>
        </div>
      </div>

      {error ? (
        <div className="alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !data ? <p className="muted">{t('desktop.loading')}</p> : null}

      <section className="page-card">
        <h3 className="affiliate-apply-form__title">{t('desktop.reseller_charge_title')}</h3>
        <p>{t('desktop.reseller_charge_desc')}</p>
        <p>{t('desktop.reseller_charge_pay_hint')}</p>
        <HesabPayAccountCard />
        <p>
          {t('desktop.reseller_receipt_pack_amount', {
            count: minQty,
            amount: formatAfn(depositSuggested),
          })}
        </p>
        <p className="muted">
          {t('desktop.reseller_unit_cost')}: {formatAfn(unitCost)} × {minQty} ={' '}
          {formatAfn(starterPackTotal)}
        </p>
        <p>{t('desktop.reseller_charge_receipt')}</p>
        <p>{t('desktop.reseller_charge_after')}</p>
        {waHref ? (
          <a
            className="btn-secondary reseller-wa-receipt-btn"
            href={waHref}
            target="_blank"
            rel="noreferrer"
          >
            <i className="fa-brands fa-whatsapp" aria-hidden /> {t('desktop.reseller_send_whatsapp')}
          </a>
        ) : null}
        <p className="muted" style={{ marginTop: 12 }}>
          {t('desktop.reseller_wallet_balance', { amount: formatAfn(walletBalance) })}
        </p>
      </section>

      {previewQuote ? (
        <section className="page-card">
          <h3 className="affiliate-apply-form__title">{t('desktop.reseller_price_title')}</h3>
          <p className="muted">{t('desktop.reseller_formula_hint', { percent: previewQuote.margin_percent })}</p>
          <QuoteBox quote={previewQuote} />
        </section>
      ) : null}
    </div>
  )
}
