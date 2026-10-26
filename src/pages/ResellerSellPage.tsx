import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { ResellerSellConfirmModal } from '@/components/ResellerSellConfirmModal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { formatAfghanDateValue } from '@/lib/datetime'
import {
  fetchSubscriptionReseller,
  lookupResellerCompany,
  sellResellerSubscription,
  type SubscriptionResellerCompanyLookup,
  type SubscriptionResellerPayload,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

function formatAfn(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })
}

function computeEndDate(validUpTo: string | null | undefined, years: number): Date {
  const base = validUpTo ? new Date(validUpTo) : new Date()
  const start = Number.isNaN(base.getTime()) || base.getTime() < Date.now() ? new Date() : base
  const end = new Date(start)
  end.setFullYear(end.getFullYear() + years)
  return end
}

export function ResellerSellPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const language = useLocaleStore((state) => state.language)
  const { token } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
    })),
  )

  const [accountData, setAccountData] = useState<SubscriptionResellerPayload | null>(null)
  const [loadingAccount, setLoadingAccount] = useState(true)
  const [companyIdInput, setCompanyIdInput] = useState('')
  const [lookup, setLookup] = useState<SubscriptionResellerCompanyLookup | null>(null)
  const [searching, setSearching] = useState(false)
  const [years, setYears] = useState(1)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selling, setSelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAccount = useCallback(async () => {
    if (!token) return
    setLoadingAccount(true)
    setError(null)
    try {
      const payload = await fetchSubscriptionReseller(token)
      setAccountData(payload)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoadingAccount(false)
    }
  }, [token])

  useEffect(() => {
    void loadAccount()
  }, [loadAccount])

  const unitCustomer = lookup?.unit_pricing.customer_amount ?? 0
  const unitResellerPay = lookup?.unit_pricing.reseller_pay_amount ?? 0
  const customerTotal = unitCustomer * years
  const resellerPay = unitResellerPay * years
  const boxBalance = accountData?.account?.balance ?? 0
  const inventory = accountData?.account?.inventory ?? 0
  const canSell =
    Boolean(lookup?.company) &&
    years >= 1 &&
    years <= 5 &&
    inventory >= years &&
    boxBalance >= resellerPay

  const renewedUntil = useMemo(() => {
    if (!lookup?.company) return null
    return computeEndDate(lookup.company.valid_up_to, years)
  }, [lookup, years])

  if (!token) return null
  if (!loadingAccount && accountData && !accountData.has_account) {
    return <Navigate to="/reseller/apply" replace />
  }

  const onSearch = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || searching) return
    const companyId = companyIdInput.trim()
    if (!companyId) return
    setSearching(true)
    setError(null)
    setLookup(null)
    try {
      const result = await lookupResellerCompany(token, companyId)
      setLookup(result)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSearching(false)
    }
  }

  const confirmSell = async () => {
    if (!token || !lookup?.company || selling || !canSell) return
    setSelling(true)
    setError(null)
    try {
      const result = await sellResellerSubscription(token, {
        company_id: lookup.company.company_id,
        years,
      })
      setAccountData(result)
      setConfirmOpen(false)
      showSuccessToast(result.message || t('desktop.reseller_sell_success'))
      navigate('/reseller')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSelling(false)
    }
  }

  return (
    <div className="affiliate-page">
      <div className="affiliate-page__head">
        <div>
          <Link to="/reseller" className="affiliate-back">
            <i className="fa-solid fa-arrow-right" aria-hidden />
            <span>{t('desktop.reseller_page_title')}</span>
          </Link>
          <h2>{t('desktop.reseller_sell_page_title')}</h2>
          <p className="muted">{t('desktop.reseller_sell_page_desc')}</p>
        </div>
      </div>

      {error ? (
        <div className="alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {loadingAccount && !accountData ? <p className="muted">{t('desktop.loading')}</p> : null}

      <section className="page-card">
        <ul className="reseller-quote-list">
          <li>
            <span>{t('desktop.reseller_box_balance')}</span>
            <strong>{formatAfn(boxBalance)}</strong>
          </li>
          <li>
            <span>{t('desktop.reseller_inventory')}</span>
            <strong>{inventory}</strong>
          </li>
        </ul>
      </section>

      <section className="page-card">
        <form className="form-grid affiliate-apply-form" onSubmit={(e) => void onSearch(e)}>
          <div className="form-field">
            <label htmlFor="reseller-sell-company-id">{t('desktop.reseller_sell_company_id')}</label>
            <input
              id="reseller-sell-company-id"
              type="text"
              inputMode="numeric"
              dir="ltr"
              value={companyIdInput}
              disabled={searching}
              onChange={(e) => setCompanyIdInput(e.target.value)}
              placeholder="12345678"
            />
          </div>
          <button type="submit" className="btn-primary" disabled={searching || !companyIdInput.trim()}>
            {searching ? t('desktop.loading') : t('desktop.reseller_sell_search')}
          </button>
        </form>
      </section>

      {lookup?.company ? (
        <section className="page-card">
          <h3 className="affiliate-apply-form__title">{lookup.company.name || '—'}</h3>
          <ul className="reseller-quote-list">
            <li>
              <span>{t('desktop.company_id')}</span>
              <strong dir="ltr">{lookup.company.company_id}</strong>
            </li>
            <li>
              <span>{t('desktop.reseller_sell_valid_until')}</span>
              <strong dir="ltr">
                {lookup.company.valid_up_to
                  ? formatAfghanDateValue(lookup.company.valid_up_to, language || i18n.language)
                  : '—'}
              </strong>
            </li>
            <li>
              <span>{t('desktop.reseller_customer_charge')}</span>
              <strong>{formatAfn(unitCustomer)}</strong>
            </li>
            <li>
              <span>{t('desktop.reseller_pays_from_box')}</span>
              <strong>{formatAfn(unitResellerPay)}</strong>
            </li>
          </ul>

          <div className="form-field" style={{ marginTop: 12 }}>
            <label htmlFor="reseller-sell-years">{t('desktop.reseller_sell_years')}</label>
            <Select
              id="reseller-sell-years"
              value={years}
              onChange={(e) => setYears(Number(e.target.value) || 1)}
            >
              {[1, 2, 3, 4, 5].map((y) => (
                <option key={y} value={y}>
                  {t('desktop.reseller_sell_year_option', { count: y })}
                </option>
              ))}
            </Select>
          </div>

          <ul className="reseller-quote-list" style={{ marginTop: 12 }}>
            <li>
              <span>{t('desktop.reseller_sell_customer_total')}</span>
              <strong>{formatAfn(customerTotal)}</strong>
            </li>
            <li>
              <span>{t('desktop.reseller_sell_reseller_pay')}</span>
              <strong>{formatAfn(resellerPay)}</strong>
            </li>
            {renewedUntil ? (
              <li>
                <span>{t('desktop.valid_until_with_renew')}</span>
                <strong dir="ltr">{formatAfghanDateValue(renewedUntil.toISOString(), language || i18n.language)}</strong>
              </li>
            ) : null}
          </ul>

          {!canSell ? (
            <p className="alert-error" role="status" style={{ marginTop: 12 }}>
              {t('desktop.reseller_sell_disabled_reason', {
                balance: formatAfn(boxBalance),
                inventory,
                need: formatAfn(resellerPay),
                years,
              })}
            </p>
          ) : null}

          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: 12 }}
            disabled={!canSell || selling}
            onClick={() => setConfirmOpen(true)}
          >
            {t('desktop.reseller_sell_submit')}
          </button>
        </section>
      ) : null}

      <ResellerSellConfirmModal
        open={confirmOpen}
        companyName={lookup?.company.name || '—'}
        years={years}
        customerTotalLabel={formatAfn(customerTotal)}
        resellerPayLabel={formatAfn(resellerPay)}
        boxBalanceLabel={formatAfn(boxBalance)}
        confirming={selling}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => void confirmSell()}
      />
    </div>
  )
}
