import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { confirmDataPurge, fetchDataPurgeCheckpoint, sendDataPurgeCode } from '@/lib/business'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyDataPurgeCheckpointPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const isOwner = Boolean(business.permissions?.isOwner)

  const [ownerEmail, setOwnerEmail] = useState<string | null>(null)
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    if (!token || !companyId || !isOwner) return
    let active = true
    setLoading(true)
    void fetchDataPurgeCheckpoint(token, companyId)
      .then((data) => {
        if (!active) return
        setOwnerEmail(data.ownerEmail || null)
        setCompanyName(data.company?.name || '')
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

  useEffect(() => {
    if (cooldown <= 0) return undefined
    const timer = window.setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [cooldown])

  if (!isOwner) {
    return <Navigate to={businessPath(companyId, 'settings')} replace />
  }

  const sendCode = async () => {
    if (!token || cooldown > 0) return
    setError(null)
    setSuccess('')
    setSending(true)
    try {
      const res = await sendDataPurgeCode(token, companyId)
      setCodeSent(true)
      setCooldown(Number(res.retry_after_seconds || 100))
      setSuccess(res.message || t('desktop.verification_code_sent'))
    } catch (err) {
      const retry = Number(
        (err as { response?: { data?: { retry_after_seconds?: number } } })?.response?.data
          ?.retry_after_seconds || 0,
      )
      if (retry > 0) setCooldown(retry)
      setError(getApiErrorMessage(err))
    } finally {
      setSending(false)
    }
  }

  const confirm = async () => {
    if (!token) return
    if (!code || code.length !== 6) {
      setError(t('desktop.verification_code_required'))
      return
    }
    setError(null)
    setConfirming(true)
    try {
      const res = await confirmDataPurge(token, companyId, code)
      showSuccessToast(res.message || t('desktop.data_purge_done'))
      navigate(businessPath(companyId), { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setConfirming(false)
    }
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
        <h5 className="cs-title">{t('desktop.data_purge_title')}</h5>

        {loading ? <div className="spinner" /> : null}

        <div className="cs-card cs-card--danger">
          <div className="cs-card__title">
            <i className="fa-solid fa-triangle-exclamation" />
            {companyName}
          </div>
          <p className="cs-card__hint">{t('desktop.data_purge_warning')}</p>
          <p className="cs-muted">
            {t('desktop.code_will_send_to')}: <strong>{ownerEmail || '—'}</strong>
          </p>

          <div className="cs-actions">
            <button
              type="button"
              className="btn-secondary"
              disabled={sending || cooldown > 0}
              onClick={() => void sendCode()}
            >
              {sending
                ? t('desktop.processing')
                : cooldown > 0
                  ? `${t('desktop.resend_in')} ${cooldown}s`
                  : t('desktop.send_verification_code')}
            </button>
          </div>

          {codeSent ? (
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
                <button
                  type="button"
                  className="btn-danger"
                  disabled={confirming || code.length !== 6}
                  onClick={() => void confirm()}
                >
                  {confirming ? t('desktop.processing') : t('desktop.confirm_data_purge')}
                </button>
              </div>
            </>
          ) : null}

          {error ? <div className="cs-alert cs-alert--error">{error}</div> : null}
          {success ? <div className="cs-alert cs-alert--ok">{success}</div> : null}
        </div>
      </div>
    </div>
  )
}
