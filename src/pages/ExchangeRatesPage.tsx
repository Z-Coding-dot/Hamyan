import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { ExchangeRateCalculator } from '@/components/ExchangeRateCalculator'
import { getApiErrorMessage } from '@/lib/auth'
import { formatJalaliSlash } from '@/lib/datetime'
import { fetchLatestPublicExchangeRates, type PublicExchangeRateRow } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'
import { localizeCurrency } from '@/lib/currency'

function formatRate(value: number | string | null | undefined): string {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  })
}

export function ExchangeRatesPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const token = useAuthStore((s) => s.token)
  const [rates, setRates] = useState<PublicExchangeRateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchLatestPublicExchangeRates(token)
      setRates(data)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setRates([])
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <div className="xrates-page" dir="rtl">
      <div className="xrates-hero">
        <div className="xrates-hero__text">
          <span className="xrates-hero__badge">
            <i className="fa-solid fa-coins" />
            {t('desktop.latest_exchange_rates')}: {rates.length.toLocaleString('en-US')}
          </span>
          <h2>{t('desktop.exchange_rates_title')}</h2>
          <p>{t('desktop.exchange_rates_subtitle')}</p>
          <button type="button" className="btn-primary" onClick={() => void load()}>
            <i className="fa-solid fa-rotate-left" /> {t('desktop.refresh')}
          </button>
        </div>
        <ExchangeRateCalculator rates={rates} />
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : rates.length === 0 ? (
        <div className="ua-alert ua-alert--amber">{t('desktop.exchange_no_data')}</div>
      ) : (
        <div className="xrates-grid">
          {rates.map((rate) => {
            const fromCode = String(rate.currency_code || rate.currency || '').toUpperCase()
            const toCode = String(rate.to_currency_code || rate.to_currency || '').toUpperCase()
            const fromName = rate.currency_name || localizeCurrency(fromCode, t)
            const toName = rate.to_currency_name || localizeCurrency(toCode, t)
            const samples = [1, 100, 1000].map((amount) => ({
              amount,
              converted: Number(rate.rate || 0) * amount,
            }))
            return (
              <Link
                key={`${fromCode}-${toCode}-${rate.id}`}
                to={`/exchange-rates/${fromCode}/${toCode}`}
                className="xrate-card"
              >
                <div className="xrate-card__top">
                  <div>
                    <div className="muted">{t('desktop.exchange_rate_label')}</div>
                    <div className="xrate-card__value">{formatRate(rate.rate)}</div>
                    <div className="muted">
                      1 {fromName} = {formatRate(rate.rate)} {toName}
                    </div>
                  </div>
                  <span className="xrate-card__badge">
                    {localizeCurrency(fromCode, t)}-{localizeCurrency(toCode, t)}
                  </span>
                </div>
                <div className="xrate-card__samples">
                  <div className="muted">{t('desktop.exchange_examples')}</div>
                  {samples.map((sample) => (
                    <div key={sample.amount} className="xrate-card__sample">
                      <span>
                        {t('desktop.exchange_for_amount')} {sample.amount.toLocaleString('en-US')}{' '}
                        {fromName}
                      </span>
                      <strong>
                        {formatRate(sample.converted)} {toName}
                      </strong>
                    </div>
                  ))}
                </div>
                <div className="xrate-card__foot">
                  <div>
                    <div className="muted">{t('desktop.last_update')}</div>
                    <strong>{formatJalaliSlash(rate.updated_at || rate.created_at, locale)}</strong>
                  </div>
                  <div>
                    <div className="muted">{t('desktop.note')}</div>
                    <strong>{t('desktop.sarai_rate_note')}</strong>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
