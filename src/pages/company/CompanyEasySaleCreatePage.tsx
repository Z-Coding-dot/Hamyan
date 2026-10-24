import { FormEvent, useEffect, useRef, useState } from 'react'
import { useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  createEasySaleDraft,
  exchangePairFromAccounts,
  fetchBusinessAccountsList,
  parseExchangeRateContextFromError,
  type BusinessAccountRow,
  type QuickSaleExchangeRateContext,
} from '@/lib/business'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

function isExchangeRateRequired(err: unknown): boolean {
  if (!(err instanceof AxiosError) || err.response?.status !== 422) return false
  const data = err.response.data as
    | { message?: string; errors?: Record<string, string[] | undefined> }
    | undefined
  if (data?.errors?.exchange_rate?.length) return true
  const msg = String(data?.message || '')
  return /exchange|تبادل|نرخ/i.test(msg)
}

export function CompanyEasySaleCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [rateModalOpen, setRateModalOpen] = useState(false)
  const [exchangeRate, setExchangeRate] = useState('1')
  const [rateError, setRateError] = useState<string | null>(null)
  const [ratePair, setRatePair] = useState<QuickSaleExchangeRateContext | null>(null)
  const startedRef = useRef(false)

  const canCreate = Boolean(business.permissions?.canCreateSales) && business.is_active

  const rateLabel =
    ratePair?.from_currency && ratePair?.to_currency
      ? t('desktop.exchange_rate_pair', {
          from: localizeCurrency(ratePair.from_currency, t),
          to: localizeCurrency(ratePair.to_currency, t),
        })
      : t('desktop.exchange_rate')

  const resolveRatePair = async (err?: unknown) => {
    const fromError = err ? parseExchangeRateContextFromError(err) : null
    if (fromError) {
      setRatePair(fromError)
      if (fromError.suggested_rate || fromError.rate) {
        setExchangeRate(String(fromError.suggested_rate || fromError.rate))
      }
      return
    }
    if (!token || !companyId) return
    try {
      const accounts = (await fetchBusinessAccountsList(token, companyId)) as BusinessAccountRow[]
      setRatePair(exchangePairFromAccounts(accounts))
    } catch {
      /* keep existing */
    }
  }

  const create = async (rate?: string) => {
    if (!token || !canCreate) return
    setCreating(true)
    setError(null)
    setRateError(null)
    try {
      const created = await createEasySaleDraft(
        token,
        companyId,
        rate ? { exchange_rate: rate } : undefined,
      )
      setRateModalOpen(false)
      navigate(businessPath(companyId, `easy-sale/${created.invoice_id ?? created.invoice.id}`))
    } catch (err) {
      if (!rate && isExchangeRateRequired(err)) {
        await resolveRatePair(err)
        setRateModalOpen(true)
        setRateError(t('desktop.needs_exchange_rate'))
      } else if (rateModalOpen) {
        setRateError(getApiErrorMessage(err))
      } else {
        setError(getApiErrorMessage(err))
      }
    } finally {
      setCreating(false)
    }
  }

  const submitRate = async (event: FormEvent) => {
    event.preventDefault()
    await create(exchangeRate)
  }

  useEffect(() => {
    if (!canCreate || startedRef.current) return
    startedRef.current = true
    void create()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCreate, token, companyId])

  if (!canCreate) {
    return <div className="alert-error">{t('desktop.permission_denied')}</div>
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-summary">
        <h5 style={{ marginTop: 0 }}>{t('desktop.easy_sale')}</h5>
        <p className="muted">{creating ? t('desktop.processing') : t('desktop.easy_sale_intro')}</p>
        {error ? <div className="alert-error">{error}</div> : null}
        <div className="form-actions">
          <button type="button" className="btn-primary" onClick={() => void create()} disabled={creating}>
            {creating ? t('desktop.processing') : t('desktop.start_easy_sale')}
          </button>
        </div>
      </div>

      <Modal
        open={rateModalOpen}
        onClose={() => setRateModalOpen(false)}
        title={t('desktop.easy_sale')}
      >
        <form onSubmit={(e) => void submitRate(e)} className="form-grid">
          <p className="muted" style={{ margin: 0 }}>
            {t('desktop.needs_exchange_rate')}
          </p>
          {ratePair?.from_currency && ratePair?.to_currency ? (
            <p className="muted" style={{ margin: 0 }}>
              {t('desktop.exchange_rate_direction', {
                from: localizeCurrency(ratePair.from_currency, t),
                to: localizeCurrency(ratePair.to_currency, t),
              })}
              {ratePair.suggested_rate || ratePair.rate
                ? ` — ${t('desktop.latest_exchange_rate')}: ${ratePair.suggested_rate || ratePair.rate}`
                : null}
            </p>
          ) : null}
          {rateError ? <div className="alert-error">{rateError}</div> : null}
          <label>
            {rateLabel}
            <input
              type="number"
              min="0.0001"
              step="0.0001"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              required
              autoFocus
              disabled={creating}
            />
          </label>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setRateModalOpen(false)}>
              {t('desktop.close')}
            </button>
            <button type="submit" className="btn-primary" disabled={creating}>
              {creating ? t('desktop.processing') : t('desktop.create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
