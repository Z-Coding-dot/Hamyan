import { useEffect, useState, type ReactNode } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import { fetchTransactionShow } from '@/lib/business'
import { localizeCurrency } from '@/lib/currency'
import {
  formatMoney,
  isCreditTransaction,
  translateTransactionDescription,
  translateTransactionLabel,
} from '@/lib/companyDashboard'
import { formatAfghanDateValue } from '@/lib/datetime'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

function KV({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="tx-kv">
      <div className="tx-kv__label">{label}</div>
      <div className="tx-kv__value">{value ?? '—'}</div>
    </div>
  )
}

function SourceDocumentPanel({
  source,
  companyId,
  t,
}: {
  source: Record<string, unknown> | null | undefined
  companyId: string
  t: (key: string) => string
}) {
  if (!source) {
    return <p className="muted" style={{ marginTop: 8 }}>{t('desktop.no_related_document')}</p>
  }

  const kind = String(source.kind || '')
  const url = typeof source.url === 'string' ? source.url.replace(/^\/business\/[^/]+/, '') : null
  const linkTo = url ? businessPath(companyId, url.replace(/^\//, '')) : null

  return (
    <div style={{ marginTop: 8, display: 'grid', gap: 8 }}>
      <KV label={t('desktop.related_source')} value={kind || '—'} />
      {source.invoice_number != null ? (
        <KV label={t('desktop.sale')} value={String(source.invoice_number)} />
      ) : null}
      {source.bill_number != null ? (
        <KV label={t('desktop.expenses')} value={String(source.bill_number)} />
      ) : null}
      {source.amount != null || source.total_price != null ? (
        <KV
          label={t('desktop.amount')}
          value={`${formatMoney((source.amount ?? source.total_price) as number)} ${localizeCurrency(String(source.currency ?? ''), t)}`}
        />
      ) : null}
      {source.remark != null || source.description != null ? (
        <KV
          label={t('desktop.remark')}
          value={String(source.remark ?? source.description ?? '—')}
        />
      ) : null}
      {typeof source.customer === 'object' && source.customer && 'name' in source.customer ? (
        <KV label={t('desktop.customers')} value={String((source.customer as { name?: string }).name)} />
      ) : null}
      {linkTo ? (
        <Link to={linkTo} className="btn-secondary btn-sm">
          {t('desktop.view_all')}
        </Link>
      ) : null}
    </div>
  )
}

export function CompanyTransactionShowPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '', transactionId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payload, setPayload] = useState<Awaited<ReturnType<typeof fetchTransactionShow>> | null>(
    null,
  )

  useEffect(() => {
    if (!token || !companyId || !transactionId) return
    let active = true
    setLoading(true)
    void fetchTransactionShow(token, companyId, transactionId)
      .then((data) => {
        if (active) setPayload(data)
      })
      .catch((err) => {
        if (active) {
          setError(getApiErrorMessage(err))
          setPayload(null)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token, companyId, transactionId])

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!payload?.transaction) {
    return <div className="alert-error">{error || t('desktop.no_transactions')}</div>
  }

  const tx = payload.transaction
  const credit = isCreditTransaction(tx)
  const title = translateTransactionLabel(tx, {
    credit: t('desktop.credit'),
    debit: t('desktop.debit'),
  })
  const batch = payload.batchTransactions ?? []

  return (
    <div className="dash-div" dir="rtl">
      <div className="dash-header dash-header--section mb-3">
        <h5 className="mb-0">{t('desktop.transaction_details')}</h5>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {tx.account?.id ? (
            <Link
              to={businessPath(companyId, `accounts/${tx.account.id}`)}
              className="btn-secondary btn-sm"
            >
              {t('desktop.account_details')}
            </Link>
          ) : null}
          <Link to={businessPath(companyId)} className="btn-secondary btn-sm">
            {t('desktop.nav_dashboard')}
          </Link>
        </div>
      </div>

      <div className="tx-show-layout">
        <section className="tx-show-card">
          <div className="tx-show-card__head">
            <h6>{title}</h6>
            <span className={`tx-dir-badge${credit ? ' is-credit' : ' is-debit'}`}>
              {credit ? t('desktop.credit') : t('desktop.debit')}
            </span>
          </div>
          <div className="tx-show-grid">
            <KV
              label={t('desktop.amount')}
              value={`${formatMoney(tx.amount)} ${localizeCurrency(tx.currency, t)}`}
            />
            <KV label={t('desktop.balance_before')} value={formatMoney(tx.balance_before)} />
            <KV label={t('desktop.balance_after')} value={formatMoney(tx.balance_after)} />
            <KV label={t('desktop.name')} value={tx.title || '—'} />
            <KV
              label={t('desktop.remark')}
              value={translateTransactionDescription(tx.description) || '—'}
            />
            <KV label={t('desktop.date')} value={formatAfghanDateValue(tx.created_at, locale)} />
            <KV
              label={t('desktop.account')}
              value={
                tx.account
                  ? `${tx.account.name} (${localizeCurrency(tx.account.currency, t)})`
                  : '—'
              }
            />
            <KV label={t('desktop.registered_by')} value={payload.actor?.name || '—'} />
            <KV label={t('desktop.transaction_number')} value={tx.id} />
          </div>

          {batch.length > 0 ? (
            <div style={{ marginTop: 14 }}>
              <h6 style={{ marginBottom: 8 }}>{t('desktop.transactions')}</h6>
              <div className="acc-trans-list">
                {batch.map((row) => {
                  const rowCredit = isCreditTransaction(row)
                  return (
                    <Link
                      key={row.id}
                      to={businessPath(companyId, `transactions/${row.id}`)}
                      className={`tx-card-link${rowCredit ? ' is-credit' : ' is-debit'}`}
                    >
                      <div className={`tx-card-badge${rowCredit ? ' is-credit' : ' is-debit'}`}>
                        <i className={`fa-solid ${rowCredit ? 'fa-arrow-up' : 'fa-arrow-down'}`} />
                      </div>
                      <div className="tx-card-body">
                        <h6>{row.title || (rowCredit ? t('desktop.credit') : t('desktop.debit'))}</h6>
                        <p>
                          {row.account?.name || t('desktop.account')} •{' '}
                          {formatAfghanDateValue(row.created_at, locale)}
                        </p>
                      </div>
                      <div className={`tx-card-amount${rowCredit ? ' is-credit' : ' is-debit'}`}>
                        <strong>
                          {formatMoney(row.amount)}{' '}
                          <span>{localizeCurrency(row.currency, t)}</span>
                        </strong>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </div>
          ) : null}
        </section>

        <aside className="tx-show-card">
          <h6>{t('desktop.related_source')}</h6>
          <SourceDocumentPanel source={payload.sourceDocument} companyId={companyId} t={t} />
          <p className="muted" style={{ fontSize: '0.82rem', marginTop: 12 }}>
            {business.company.name}
          </p>
        </aside>
      </div>
    </div>
  )
}
