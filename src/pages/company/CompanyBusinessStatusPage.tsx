import { useEffect, useState } from 'react'
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import {
  activateCapability,
  deactivateCapability,
  fetchBusinessStatus,
  sendCapabilityCode,
  type BusinessStatusPayload,
  type CompanyCapabilityMode,
} from '@/lib/business'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

type CapProps = {
  companyId: string
  mode: CompanyCapabilityMode
  active: boolean
  title: string
  description: string
  activeHint: string
  ownerEmail?: string | null
  onUpdated: (company: BusinessStatusPayload['company']) => void
}

function CapabilityToggle({
  companyId,
  mode,
  active,
  title,
  description,
  activeHint,
  ownerEmail,
  onUpdated,
}: CapProps) {
  const { t } = useTranslation()
  const token = useAuthStore(useShallow((s) => s.token))
  const [isActive, setIsActive] = useState(active)
  const [code, setCode] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [sending, setSending] = useState(false)
  const [activating, setActivating] = useState(false)
  const [deactivating, setDeactivating] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    setIsActive(active)
  }, [active])

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  const sendCode = async () => {
    if (!token || cooldown > 0) return
    setError('')
    setSuccess('')
    setSending(true)
    try {
      const res = await sendCapabilityCode(token, companyId, mode)
      setShowForm(true)
      setCooldown(Number(res.retry_after_seconds || 100))
      setSuccess(res.message || t('desktop.verification_code_sent'))
    } catch (err) {
      const retry = Number((err as { response?: { data?: { retry_after_seconds?: number } } })?.response?.data?.retry_after_seconds || 0)
      if (retry > 0) setCooldown(retry)
      setError(getApiErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  const activate = async () => {
    if (!token) return
    if (!code || code.length !== 6) {
      setError(t('desktop.verification_code_required'))
      return
    }
    setError('')
    setSuccess('')
    setActivating(true)
    try {
      const res = await activateCapability(token, companyId, mode, code)
      setIsActive(true)
      setCode('')
      setShowForm(false)
      setSuccess(res.message || t('desktop.capability_activated'))
      if (res.company) onUpdated(res.company)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setActivating(false)
    }
  }

  const deactivate = async () => {
    if (!token) return
    setError('')
    setSuccess('')
    setDeactivating(true)
    try {
      const res = await deactivateCapability(token, companyId, mode)
      setIsActive(false)
      setShowForm(false)
      setCode('')
      setSuccess(res.message || t('desktop.capability_deactivated'))
      if (res.company) onUpdated(res.company)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <div className="cs-card">
      <div className="cs-cap-head">
        <div className="cs-card__title" style={{ marginBottom: 0 }}>
          <i className="fa-solid fa-sliders" />
          {title}
        </div>
        <span className={`cs-badge ${isActive ? 'cs-badge--on' : 'cs-badge--off'}`}>
          {isActive ? t('desktop.active') : t('desktop.inactive')}
        </span>
      </div>
      <p className="cs-card__hint">{description}</p>
      {isActive && activeHint ? <p className="cs-card__hint cs-card__hint--ok">{activeHint}</p> : null}

      {isActive ? (
        <div className="cs-actions">
          <button type="button" className="btn-secondary" disabled={deactivating} onClick={() => void deactivate()}>
            {deactivating ? t('desktop.processing') : t('desktop.deactivate')}
          </button>
        </div>
      ) : (
        <>
          <p className="cs-muted">
            {t('desktop.code_will_send_to')}: <strong>{ownerEmail || '—'}</strong>
          </p>
          {!showForm ? (
            <div className="cs-actions">
              <button type="button" className="btn-primary" disabled={sending || cooldown > 0} onClick={() => void sendCode()}>
                {sending
                  ? t('desktop.processing')
                  : cooldown > 0
                    ? `${t('desktop.resend_in')} ${cooldown}s`
                    : t('desktop.send_verification_code')}
              </button>
            </div>
          ) : (
            <>
              <div className="cs-field">
                <label>{t('desktop.verification_code')}</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="------"
                  className="eng-input"
                />
              </div>
              <div className="cs-actions">
                <button type="button" className="btn-primary" disabled={activating} onClick={() => void activate()}>
                  {activating ? t('desktop.processing') : t('desktop.activate')}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={sending || cooldown > 0}
                  onClick={() => void sendCode()}
                >
                  {cooldown > 0 ? `${t('desktop.resend_in')} ${cooldown}s` : t('desktop.resend_code')}
                </button>
              </div>
            </>
          )}
        </>
      )}

      {error ? <div className="cs-alert cs-alert--error">{error}</div> : null}
      {success ? <div className="cs-alert cs-alert--ok">{success}</div> : null}
    </div>
  )
}

export function CompanyBusinessStatusPage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const isOwner = Boolean(business.permissions?.isOwner)

  const [company, setCompany] = useState<BusinessStatusPayload['company'] | null>(null)
  const [ownerEmail, setOwnerEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !companyId || !isOwner) return
    let active = true
    setLoading(true)
    void fetchBusinessStatus(token, companyId)
      .then((data) => {
        if (!active) return
        setCompany(data.company)
        setOwnerEmail(data.ownerEmail || null)
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
  }, [token, companyId, isOwner])

  if (!isOwner) {
    return <Navigate to={businessPath(companyId, 'settings')} replace />
  }

  return (
    <div className="dash-div company-settings-page no-print" dir="rtl">
      <div className="content-small">
        <div className="cs-back">
          <Link to={businessPath(companyId, 'settings')}>
            <i className="fa-solid fa-reply" />
            {t('desktop.return')}
          </Link>
        </div>
        <h5 className="cs-title">{t('desktop.business_status')}</h5>
        <p className="text-center cs-muted" style={{ marginBottom: 16 }}>
          {t('desktop.business_status_description')}
        </p>

        {loading ? <div className="spinner" /> : null}
        {error ? <div className="alert-error">{error}</div> : null}

        {company ? (
          <>
            <CapabilityToggle
              companyId={companyId}
              mode="store"
              active={company.is_store !== false}
              title={t('desktop.store_mode_full')}
              description={t('desktop.store_mode_description')}
              activeHint={t('desktop.store_mode_active_hint')}
              ownerEmail={ownerEmail}
              onUpdated={(c) => setCompany((prev) => ({ ...prev, ...c }))}
            />
            <CapabilityToggle
              companyId={companyId}
              mode="production"
              active={company.is_production === true}
              title={t('desktop.production_mode_full')}
              description={t('desktop.production_mode_description')}
              activeHint={t('desktop.production_mode_active_hint')}
              ownerEmail={ownerEmail}
              onUpdated={(c) => setCompany((prev) => ({ ...prev, ...c }))}
            />
            <CapabilityToggle
              companyId={companyId}
              mode="service"
              active={company.is_service === true}
              title={t('desktop.service_mode_full')}
              description={t('desktop.service_mode_description')}
              activeHint={t('desktop.service_mode_active_hint')}
              ownerEmail={ownerEmail}
              onUpdated={(c) => setCompany((prev) => ({ ...prev, ...c }))}
            />
          </>
        ) : null}
      </div>
    </div>
  )
}
