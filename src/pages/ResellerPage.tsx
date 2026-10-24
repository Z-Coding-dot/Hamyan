import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { ResellerAddressModal } from '@/components/ResellerAddressModal'
import { ResellerPurchaseConfirmModal } from '@/components/ResellerPurchaseConfirmModal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { formatJalaliSlash } from '@/lib/datetime'
import {
  fetchProvinces,
  fetchSubscriptionReseller,
  purchaseSubscriptionResellerPack,
  type ProvinceRow,
  type SubscriptionResellerPayload,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore, type SupportedLanguage } from '@/store/useLocaleStore'

function formatAfn(value: number): string {
  if (!Number.isFinite(value)) return '—'
  return value.toLocaleString('en-US', {
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  })
}

function provinceName(
  account: SubscriptionResellerPayload['account'],
  language: SupportedLanguage,
): string {
  const province = account?.province
  if (!province) return '—'
  if (language === 'ps') return province.name_ps || province.name_fa
  if (language === 'en') return province.name_en || province.name_fa
  return province.name_fa
}

export function ResellerPage() {
  const { t } = useTranslation()
  const language = useLocaleStore((state) => state.language)
  const { token } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
    })),
  )

  const [data, setData] = useState<SubscriptionResellerPayload | null>(null)
  const [provinces, setProvinces] = useState<ProvinceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [addressModalOpen, setAddressModalOpen] = useState(false)
  const [buyModalOpen, setBuyModalOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(10)

  const load = useCallback(async () => {
    if (!token) return
    setError(null)
    setLoading(true)
    try {
      const [payload, provinceRows] = await Promise.all([
        fetchSubscriptionReseller(token),
        fetchProvinces().catch(() => [] as ProvinceRow[]),
      ])
      setData(payload)
      setProvinces(provinceRows)
      setQuantity(payload.quote.min_quantity)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  if (!token) return null
  if (!loading && data && !data.has_account) {
    return <Navigate to="/reseller/apply" replace />
  }

  const minQty = data?.quote.min_quantity ?? 10
  const selectedQty = Math.max(minQty, quantity)
  const packTotal = (data?.quote.unit_reseller_cost ?? 0) * selectedQty
  const walletBalance = data?.wallet_balance ?? 0
  const canBuy = walletBalance >= packTotal
  const customerAmount = data?.unit_pricing?.customer_amount ?? data?.quote.list_amount ?? 0
  const payAmount = data?.unit_pricing?.reseller_pay_amount ?? data?.quote.unit_reseller_cost ?? 0
  const profitAmount = data?.unit_pricing?.profit_amount ?? data?.quote.unit_profit ?? 0
  const purchases = data?.purchases ?? []
  const sales = data?.sales ?? []
  const addressComplete = Boolean(data?.address_complete ?? data?.account?.address_complete)
  const account = data?.account

  const openBuyModal = (event: FormEvent) => {
    event.preventDefault()
    if (!canBuy || buying) return
    setBuyModalOpen(true)
  }

  const confirmBuy = async () => {
    if (!token || buying) return
    setBuying(true)
    setError(null)
    try {
      const result = await purchaseSubscriptionResellerPack(token, selectedQty)
      setData(result)
      setBuyModalOpen(false)
      showSuccessToast(result.message || t('desktop.reseller_buy_success'))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBuying(false)
    }
  }

  return (
    <div className="affiliate-page">
      <div className="affiliate-page__head">
        <div>
          <Link to="/dashboard" className="affiliate-back">
            <i className="fa-solid fa-arrow-right" aria-hidden />
            <span>{t('desktop.nav_dashboard')}</span>
          </Link>
          <h2>{t('desktop.reseller_page_title')}</h2>
          <p className="muted">{t('desktop.reseller_page_desc')}</p>
        </div>
      </div>

      {error ? (
        <div className="alert-error" role="alert">
          {error}
        </div>
      ) : null}

      {loading && !data ? <p className="muted">{t('desktop.loading')}</p> : null}

      <section className="page-card">
        <div className="reseller-address-head">
          <h3 className="affiliate-apply-form__title">{t('desktop.reseller_address_title')}</h3>
          <button type="button" className="btn-secondary" onClick={() => setAddressModalOpen(true)}>
            {addressComplete ? t('desktop.reseller_address_edit') : t('desktop.reseller_address_add')}
          </button>
        </div>
        {!addressComplete ? (
          <p className="alert-error" role="status">
            {t('desktop.reseller_address_required')}
          </p>
        ) : (
          <ul className="reseller-quote-list">
            <li>
              <span>{t('desktop.reseller_province')}</span>
              <strong>{provinceName(account, language)}</strong>
            </li>
            <li>
              <span>{t('desktop.reseller_city_district')}</span>
              <strong>{account?.city_district || '—'}</strong>
            </li>
            <li>
              <span>{t('desktop.reseller_full_address')}</span>
              <strong>{account?.address || '—'}</strong>
            </li>
            <li>
              <span>{t('desktop.reseller_whatsapp')}</span>
              <strong dir="ltr">{account?.whatsapp || '—'}</strong>
            </li>
          </ul>
        )}
      </section>

      <section className="page-card">
        <h3 className="affiliate-apply-form__title">{t('desktop.reseller_box_balance')}</h3>
        <p className="reseller-balance">{formatAfn(account?.balance ?? 0)}</p>
        <p className="muted">
          {t('desktop.reseller_inventory')}: {account?.inventory ?? 0}
        </p>
        <p className="muted">
          {t('desktop.reseller_wallet_balance', { amount: formatAfn(walletBalance) })}
        </p>
        <Link to="/reseller/sell" className="btn-primary" style={{ display: 'inline-flex', marginTop: 12 }}>
          {t('desktop.reseller_sell_cta')}
        </Link>
      </section>

      <section className="page-card">
        <h3 className="affiliate-apply-form__title">{t('desktop.reseller_unit_record_title')}</h3>
        <ul className="reseller-quote-list">
          <li>
            <span>{t('desktop.reseller_customer_charge')}</span>
            <strong>{formatAfn(customerAmount)}</strong>
          </li>
          <li>
            <span>{t('desktop.reseller_pays_from_box')}</span>
            <strong>{formatAfn(payAmount)}</strong>
          </li>
          <li>
            <span>{t('desktop.reseller_unit_profit')}</span>
            <strong>{formatAfn(profitAmount)}</strong>
          </li>
        </ul>
      </section>

      <section className="page-card">
        <h3 className="affiliate-apply-form__title">{t('desktop.reseller_buy_more')}</h3>
        <p>
          <strong>{t('desktop.reseller_wallet_balance', { amount: formatAfn(walletBalance) })}</strong>
        </p>
        <p className="muted">{t('desktop.reseller_pack_cost', { amount: formatAfn(packTotal) })}</p>
        {!canBuy ? (
          <p className="alert-error" role="status">
            {t('desktop.reseller_buy_disabled_reason', {
              balance: formatAfn(walletBalance),
              need: formatAfn(packTotal),
            })}
          </p>
        ) : null}
        <form className="form-grid affiliate-apply-form" onSubmit={openBuyModal}>
          <div className="form-field">
            <label htmlFor="reseller-more-qty">{t('desktop.reseller_quantity')}</label>
            <p className="muted" style={{ margin: '0 0 6px', fontSize: '0.85rem' }}>
              {t('desktop.reseller_min_qty_error', { count: minQty })}
            </p>
            <input
              id="reseller-more-qty"
              type="number"
              min={minQty}
              max={500}
              step={1}
              value={quantity}
              disabled={buying}
              onChange={(e) => {
                const next = Number(e.target.value)
                setQuantity(Number.isFinite(next) ? Math.max(minQty, Math.floor(next)) : minQty)
              }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={buying || !canBuy}>
            {t('desktop.reseller_buy_submit')}
          </button>
        </form>
      </section>

      <section className="page-card">
        <h3 className="affiliate-apply-form__title">{t('desktop.reseller_sales_title')}</h3>
        {sales.length === 0 ? (
          <p className="muted">—</p>
        ) : (
          <div className="reseller-purchases">
            {sales.map((row) => (
              <div key={row.id} className="reseller-purchase-row">
                <strong>
                  {t('desktop.reseller_sale_row', {
                    name: row.company_name || row.company_id,
                    years: row.years,
                    amount: formatAfn(row.reseller_total_cost),
                  })}
                </strong>
                <span className="muted">{formatJalaliSlash(row.created_at, language)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="page-card">
        <h3 className="affiliate-apply-form__title">{t('desktop.reseller_purchases_title')}</h3>
        {purchases.length === 0 ? (
          <p className="muted">—</p>
        ) : (
          <div className="reseller-purchases">
            {purchases.map((row) => (
              <div key={row.id} className="reseller-purchase-row">
                <strong>
                  {t('desktop.reseller_request_pack', {
                    count: row.quantity,
                    amount: formatAfn(row.pack_total),
                  })}
                </strong>
                <span className="muted">{formatJalaliSlash(row.created_at, language)}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      <ResellerAddressModal
        open={addressModalOpen}
        token={token}
        provinces={provinces}
        language={language}
        initial={{
          province_id: account?.province_id,
          city_district: account?.city_district,
          address: account?.address,
          whatsapp: account?.whatsapp,
        }}
        onClose={() => setAddressModalOpen(false)}
        onSaved={setData}
      />

      <ResellerPurchaseConfirmModal
        open={buyModalOpen}
        quantity={selectedQty}
        packTotalLabel={formatAfn(packTotal)}
        walletBalanceLabel={formatAfn(walletBalance)}
        confirming={buying}
        onClose={() => setBuyModalOpen(false)}
        onConfirm={() => void confirmBuy()}
      />
    </div>
  )
}
