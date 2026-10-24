import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { getApiErrorMessage } from '@/lib/auth'
import { formatJalaliSlash } from '@/lib/datetime'
import { localizeCurrency } from '@/lib/currency'
import {
  fetchPublicExchangeRateDetail,
  type PublicExchangeRateRow,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore } from '@/store/useLocaleStore'

function formatRate(value: number | string | null | undefined): string {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  })
}

export function ExchangeRateDetailPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const token = useAuthStore((s) => s.token)
  const { from = '', to = '' } = useParams()
  const [rate, setRate] = useState<PublicExchangeRateRow | null>(null)
  const [history, setHistory] = useState<PublicExchangeRateRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError(null)
    void fetchPublicExchangeRateDetail(from, to, token)
      .then((data) => {
        if (!active) return
        setRate(data.rate)
        setHistory(data.history)
      })
      .catch((err) => {
        if (!active) return
        setError(getApiErrorMessage(err))
        setRate(null)
        setHistory([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [from, to, token])

  const fromCode = String(rate?.currency_code || from || '').toUpperCase()
  const toCode = String(rate?.to_currency_code || to || '').toUpperCase()
  const fromName = rate?.currency_name || localizeCurrency(fromCode, t)
  const toName = rate?.to_currency_name || localizeCurrency(toCode, t)
  const samples = [1, 100, 1000, 10000].map((amount) => ({
    amount,
    converted: Number(rate?.rate || 0) * amount,
  }))

  return (
    <div className="xrates-page" dir="rtl">
      <div className="ua-header" style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <h2>
            {localizeCurrency(fromCode, t)}-{localizeCurrency(toCode, t)}
          </h2>
          <p className="muted">{t('desktop.exchange_rate_detail_desc')}</p>
        </div>
        <Link to="/exchange-rates" className="btn-secondary">
          {t('desktop.exchange_rates_title')}
        </Link>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}
      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : !rate ? (
        <div className="ua-alert ua-alert--amber">{t('desktop.exchange_no_data')}</div>
      ) : (
        <>
          <article className="xrate-card xrate-card--detail">
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
                    {t('desktop.exchange_for_amount')} {sample.amount.toLocaleString('en-US')} {fromName}
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
          </article>

          <section className="page-card" style={{ marginTop: 16 }}>
            <h3>{t('desktop.exchange_history')}</h3>
            {history.length === 0 ? (
              <p className="muted">{t('desktop.no_record_found')}</p>
            ) : (
              <div className="ua-tx-list" style={{ marginTop: 10 }}>
                {history.map((item) => (
                  <div key={item.id} className="ua-tx-row" style={{ cursor: 'default' }}>
                    <span className="ua-tx-icon">
                      <i className="fa-solid fa-chart-line" />
                    </span>
                    <span className="ua-tx-body">
                      <strong>
                        1 {fromName} = {formatRate(item.rate)} {toName}
                      </strong>
                      <small>{formatJalaliSlash(item.updated_at || item.created_at, locale)}</small>
                    </span>
                    <span className="ua-tx-amount">{formatRate(item.rate)}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}
