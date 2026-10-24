import { useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { HesabPayAccountCard } from '@/components/HesabPayAccountCard'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { formatAfghanDateValue } from '@/lib/datetime'
import {
  fetchBusinessProfile,
  renewBusinessSubscription,
  type BusinessPaymentRow,
  type BusinessShowData,
  type SubscriptionPlanOption,
  type SubscriptionPricing,
} from '@/lib/user'
import { whatsappChatUrl } from '@/lib/whatsapp'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

const SUPPORT_WHATSAPP = '0703098630'

type CompanyOutletContext = {
  business: BusinessShowData
  setBusiness: (data: BusinessShowData) => void
  reloadBusiness: () => Promise<void>
}

function fallbackPlans(annualBaseFee = 3650, annualDiscount = 0): SubscriptionPlanOption[] {
  const defaultAnnual = 3650
  const cappedDiscount = Math.min(Math.max(0, annualDiscount), annualBaseFee)
  const years: SubscriptionPlanOption[] = []

  for (let y = 1; y <= 5; y += 1) {
    if (y === 1) {
      const original = annualBaseFee
      const discountAmount = Math.round(cappedDiscount * 100) / 100
      const discountRate =
        original > 0 ? Math.round((discountAmount / original) * 10000) / 100 : 0
      years.push({
        code: `year_${y}`,
        label: `${y} سال`,
        duration_type: 'year',
        duration_count: y,
        applied_annual_base_fee: annualBaseFee,
        original_amount: original,
        discount_rate: discountRate,
        discount_amount: discountAmount,
        payable_amount: Math.max(0, Math.round((original - discountAmount) * 100) / 100),
      })
      continue
    }

    const appliedAnnualBaseFee = defaultAnnual
    const firstYearOriginal = annualBaseFee
    const firstYearDiscount = Math.round(cappedDiscount * 100) / 100
    const remainingOriginal = appliedAnnualBaseFee * (y - 1)
    const remainingDiscount = Math.round(remainingOriginal * 0.1 * 100) / 100
    const original = firstYearOriginal + remainingOriginal
    const discountAmount = Math.round((firstYearDiscount + remainingDiscount) * 100) / 100
    const discountRate =
      original > 0 ? Math.round((discountAmount / original) * 10000) / 100 : 0

    years.push({
      code: `year_${y}`,
      label: `${y} سال`,
      duration_type: 'year',
      duration_count: y,
      applied_annual_base_fee: appliedAnnualBaseFee,
      original_amount: original,
      discount_rate: discountRate,
      discount_amount: discountAmount,
      payable_amount: Math.max(0, Math.round((original - discountAmount) * 100) / 100),
    })
  }

  return [
    {
      code: 'month_1',
      label: '1 ماه',
      duration_type: 'month',
      duration_count: 1,
      original_amount: 150,
      discount_rate: 0,
      discount_amount: 0,
      payable_amount: 150,
    },
    ...years,
  ]
}

function startOfLocalDay(value: Date): Date {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function computeRenewedDate(
  validUpTo: string | null,
  durationType: 'month' | 'year',
  durationCount: number,
): Date {
  const now = new Date()
  const current = validUpTo ? new Date(validUpTo) : null
  const isActive = Boolean(
    current && !Number.isNaN(current.getTime()) && current.getTime() >= startOfLocalDay(now).getTime(),
  )
  const start = isActive && current ? new Date(current) : now
  const end = new Date(start)
  if (durationType === 'month') {
    end.setMonth(end.getMonth() + 1)
  } else {
    end.setFullYear(end.getFullYear() + Math.max(1, durationCount))
  }
  return end
}

export function CompanySubscriptionPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '' } = useParams()
  const { business, setBusiness, reloadBusiness } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))

  const [payments, setPayments] = useState<BusinessPaymentRow[]>([])
  const [pricing, setPricing] = useState<SubscriptionPricing | null>(null)
  const [walletBalance, setWalletBalance] = useState(0)
  const [validUpTo, setValidUpTo] = useState(business.valid_up_to || business.company.valid_up_to || null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [renewOpen, setRenewOpen] = useState(false)
  const [addMoneyOpen, setAddMoneyOpen] = useState(false)

  const addMoneyWhatsappHref = useMemo(
    () => whatsappChatUrl(SUPPORT_WHATSAPP, t('desktop.wallet_add_money_title')),
    [t],
  )

  useEffect(() => {
    if (!token || !companyId) return
    setLoading(true)
    void fetchBusinessProfile(token, companyId)
      .then((data) => {
        setPayments(data.payments || [])
        setPricing(data.subscriptionPricing || null)
        setWalletBalance(Number(data.walletBalance || 0))
        setValidUpTo(data.valid_up_to ?? data.company.valid_up_to ?? null)
        setBusiness({
          ...business,
          ...data,
          company: { ...business.company, ...data.company },
          is_active: data.is_active,
          valid_up_to: data.valid_up_to,
        })
      })
      .catch((err) => setLoadError(getApiErrorMessage(err)))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId])

  return (
    <div className="dash-div company-subscription-page" dir="rtl">
      <div className="dash-header dash-header--section mb-2">
        <div>
          <Link to={businessPath(companyId, 'profile')} className="affiliate-back">
            <i className="fa-solid fa-arrow-right" aria-hidden />
            <span>{t('desktop.nav_profile')}</span>
          </Link>
          <h5 className="mb-0">{t('desktop.company_subscription_page_title')}</h5>
          <p className="muted mb-0">{business.company.name}</p>
        </div>
      </div>

      {loadError ? <div className="alert-error">{loadError}</div> : null}
      {loading ? <p className="muted">{t('desktop.loading')}</p> : null}

      <section className="content-small company-profile-card">
        <h5>{t('desktop.company_subscription_validity')}</h5>
        <p className="company-subscription-valid">
          {t('desktop.valid_until')}:{' '}
          <strong dir="ltr">{validUpTo ? formatAfghanDateValue(validUpTo, i18n.language) : '—'}</strong>
        </p>
        <p className="muted">
          {t('desktop.wallet_balance')}:{' '}
          <strong>
            {walletBalance.toLocaleString('en-US')} {t('desktop.afn')}
          </strong>
        </p>
        <div className="company-subscription-actions">
          <button type="button" className="btn-primary" onClick={() => setRenewOpen(true)}>
            <i className="fa-solid fa-credit-card" aria-hidden /> {t('desktop.renew')}
          </button>
          <button type="button" className="btn-secondary" onClick={() => setAddMoneyOpen(true)}>
            <i className="fa-solid fa-plus" aria-hidden /> {t('desktop.wallet_add_money')}
          </button>
        </div>
      </section>

      <section className="content-small company-profile-card">
        <h5>{t('desktop.company_subscription_history')}</h5>
        <div className="company-payments-head">
          <span>{t('desktop.amount')}</span>
          <span>{t('desktop.start_date')}</span>
          <span>{t('desktop.end_date')}</span>
        </div>
        {payments.length === 0 ? (
          <p className="muted text-center">{t('desktop.no_payments')}</p>
        ) : (
          payments.map((payment) => (
            <div className="company-payment-row" key={payment.id}>
              <span>
                {Number(payment.amount || 0).toLocaleString('en-US')} {t('desktop.afn')}
              </span>
              <span>{formatAfghanDateValue(payment.start_date, i18n.language)}</span>
              <span>{formatAfghanDateValue(payment.end_date, i18n.language)}</span>
            </div>
          ))
        )}
      </section>

      <RenewModal
        open={renewOpen}
        token={token || ''}
        companyId={companyId}
        pricing={pricing}
        walletBalance={walletBalance}
        validUpTo={validUpTo}
        onClose={() => setRenewOpen(false)}
        onAddMoney={() => {
          setRenewOpen(false)
          setAddMoneyOpen(true)
        }}
        onUpdated={async (result) => {
          if (result.payments) setPayments(result.payments)
          if (typeof result.walletBalance === 'number') setWalletBalance(result.walletBalance)
          if (result.valid_up_to) setValidUpTo(result.valid_up_to)
          await reloadBusiness()
        }}
      />

      <Modal
        open={addMoneyOpen}
        onClose={() => setAddMoneyOpen(false)}
        title={t('desktop.wallet_add_money_title')}
        wide
      >
        <div className="wallet-add-money-modal">
          <p>{t('desktop.wallet_add_money_lead')}</p>
          <HesabPayAccountCard />
          {addMoneyWhatsappHref ? (
            <a
              className="btn-secondary reseller-wa-receipt-btn"
              href={addMoneyWhatsappHref}
              target="_blank"
              rel="noreferrer"
            >
              <i className="fa-brands fa-whatsapp" aria-hidden /> {t('desktop.reseller_send_whatsapp')}
            </a>
          ) : null}
        </div>
      </Modal>
    </div>
  )
}

function RenewModal({
  open,
  token,
  companyId,
  pricing,
  walletBalance,
  validUpTo,
  onClose,
  onUpdated,
  onAddMoney,
}: {
  open: boolean
  token: string
  companyId: string
  pricing: SubscriptionPricing | null
  walletBalance: number
  validUpTo: string | null
  onClose: () => void
  onAddMoney: () => void
  onUpdated: (result: {
    payments?: BusinessPaymentRow[]
    walletBalance?: number
    valid_up_to?: string | null
  }) => Promise<void>
}) {
  const { t, i18n } = useTranslation()
  const annualBaseFee = Number(pricing?.annual_base_fee ?? 3650)
  const annualDiscount = Number(pricing?.annual_discount ?? 0)
  const plans = useMemo(
    () =>
      pricing?.options?.length ? pricing.options : fallbackPlans(annualBaseFee, annualDiscount),
    [pricing, annualBaseFee, annualDiscount],
  )
  const defaultCode =
    pricing?.defaults?.duration_type === 'month'
      ? 'month_1'
      : `year_${pricing?.defaults?.duration_count || 1}`
  const [selected, setSelected] = useState(defaultCode)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [balance, setBalance] = useState(walletBalance)

  useEffect(() => {
    if (open) {
      setBalance(walletBalance)
      setSelected(
        plans.some((p) => p.code === defaultCode)
          ? defaultCode
          : plans[1]?.code || plans[0]?.code || 'year_1',
      )
      setError(null)
    }
  }, [open, walletBalance, plans, defaultCode])

  const plan = plans.find((p) => p.code === selected) || plans[0]
  const payable = Number(plan?.payable_amount || 0)
  const original = Number(plan?.original_amount || 0)
  const discountAmount = Number(plan?.discount_amount || 0)
  const annualBaseShown = Number(plan?.applied_annual_base_fee ?? annualBaseFee)
  const insufficient = balance < payable
  const isMonthlyPlan = plan?.duration_type === 'month'
  const discountPercentRaw = (() => {
    const explicitRate = Number(plan?.discount_rate ?? 0)
    if (explicitRate > 0) return explicitRate
    if (original <= 0 || discountAmount <= 0) return 0
    return (discountAmount / original) * 100
  })()
  const discountPercent = Number.isInteger(discountPercentRaw)
    ? discountPercentRaw
    : Number(discountPercentRaw.toFixed(1))
  const renewedDate = computeRenewedDate(
    validUpTo,
    plan?.duration_type || 'year',
    Number(plan?.duration_count || 1),
  )

  const submit = async () => {
    if (!plan || insufficient) return
    setBusy(true)
    setError(null)
    try {
      const result = await renewBusinessSubscription(token, companyId, {
        duration_type: plan.duration_type,
        duration_count: plan.duration_count,
      })
      if (typeof result.walletBalance === 'number') setBalance(result.walletBalance)
      await onUpdated(result)
      showSuccessToast(result.message || t('desktop.payment_success'))
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title={t('desktop.renew')} wide>
      <div className="company-renew" dir="rtl">
        {error ? <div className="alert-error">{error}</div> : null}

        <h6 className="company-renew-title">{t('desktop.company_payment_title')}</h6>
        <p className="company-renew-note">{t('desktop.company_payment_details')}</p>
        <p className="company-renew-note">{t('desktop.company_payment_note1')}</p>
        <p className="company-renew-note">
          {isMonthlyPlan
            ? t('desktop.company_payment_plan_info_month')
            : t('desktop.company_payment_plan_info_year')}
        </p>
        <p className="company-renew-price-hint">
          {t('desktop.company_payment_price_prefix')} {payable.toLocaleString('en-US')}{' '}
          {t('desktop.afn')} {t('desktop.company_payment_price_suffix')}
        </p>
        <p className="company-renew-note">{t('desktop.company_payment_note2')}</p>

        <p className="company-renew-duration-label">{t('desktop.renew_duration')}:</p>
        <div className="company-renew-plans">
          {plans.map((item) => (
            <button
              key={item.code}
              type="button"
              className={`company-renew-plan${selected === item.code ? ' is-selected' : ''}`}
              onClick={() => setSelected(item.code)}
            >
              <strong>{item.label}</strong>
            </button>
          ))}
        </div>

        <div className="company-renew-summary">
          <div>
            <span>{t('desktop.wallet_balance')}</span>
            <strong>
              {balance.toLocaleString('en-US')} {t('desktop.afn')}
            </strong>
          </div>
          <div>
            <span>{t('desktop.annual_base_fee')}</span>
            <strong>
              {annualBaseShown.toLocaleString('en-US')} {t('desktop.afn')}
            </strong>
          </div>
          <div>
            <span>{t('desktop.original_price')}</span>
            <strong>
              {original.toLocaleString('en-US')} {t('desktop.afn')}
            </strong>
          </div>
          <div className="company-renew-summary__discount">
            <span>
              {t('desktop.discount')} ({discountPercent}%)
            </span>
            <strong>
              {discountAmount.toLocaleString('en-US')} {t('desktop.afn')}
            </strong>
          </div>
          <div className="company-renew-summary__payable">
            <span>{t('desktop.payable_amount')}</span>
            <strong>
              {payable.toLocaleString('en-US')} {t('desktop.afn')}
            </strong>
          </div>
        </div>

        {insufficient ? (
          <div className="alert-error company-renew-insufficient">
            <p>{t('desktop.insufficient_wallet')}</p>
            <button type="button" className="btn-secondary" onClick={onAddMoney}>
              <i className="fa-solid fa-plus" aria-hidden /> {t('desktop.wallet_add_money')}
            </button>
          </div>
        ) : null}

        <div className="company-renew-dates">
          <div>
            {t('desktop.valid_until')}:{' '}
            <strong dir="ltr">
              {validUpTo ? formatAfghanDateValue(validUpTo, i18n.language) : '—'}
            </strong>
          </div>
          <div className="company-renew-dates__new">
            {t('desktop.valid_until_with_renew')}:{' '}
            <strong dir="ltr">{formatAfghanDateValue(renewedDate.toISOString(), i18n.language)}</strong>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>
            {t('desktop.cancel')}
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={busy || insufficient}
            onClick={() => void submit()}
          >
            {busy ? t('desktop.processing') : t('desktop.purchase')}
          </button>
        </div>
      </div>
    </Modal>
  )
}
