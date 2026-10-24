import { FormEvent, useEffect, useState } from 'react'
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import {
  fetchParentCompanySettings,
  updateParentCompany,
  type ParentCompanyOption,
  type ParentCompanySettingsPayload,
} from '@/lib/business'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

function CompanyThumb({ company }: { company: ParentCompanyOption }) {
  const url = useCachedAsset(company.logo)
  if (url) {
    return <img className="cs-parent-logo" src={url} alt={company.name || ''} />
  }
  return (
    <div className="cs-parent-logo cs-parent-logo--empty">
      <i className="fa-solid fa-building" />
    </div>
  )
}

export function CompanyParentCompanySettingsPage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const isOwner = Boolean(business.permissions?.isOwner)

  const [payload, setPayload] = useState<ParentCompanySettingsPayload | null>(null)
  const [parentId, setParentId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  const reload = async () => {
    if (!token || !companyId) return
    const data = await fetchParentCompanySettings(token, companyId)
    setPayload(data)
    setParentId('')
  }

  useEffect(() => {
    if (!token || !companyId || !isOwner) return
    let active = true
    setLoading(true)
    void reload()
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId, isOwner])

  if (!isOwner) {
    return <Navigate to={businessPath(companyId, 'settings')} replace />
  }

  const canChoose =
    !payload?.currentParentCompany && !payload?.hasChildCompanies && (payload?.parentCompanyOptions.length || 0) > 0

  const submitConnect = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !parentId) return
    setBusy(true)
    try {
      const msg = await updateParentCompany(token, companyId, parentId)
      showSuccessToast(msg)
      setConfirmOpen(false)
      await reload()
    } catch (err) {
      setError(getApiErrorMessage(err))
      setConfirmOpen(false)
    } finally {
      setBusy(false)
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
        <h5 className="cs-title">{t('desktop.parent_company_link')}</h5>
        <p className="text-center cs-muted" style={{ marginBottom: 16 }}>
          {t('desktop.parent_company_link_hint')}
        </p>

        {loading ? <div className="spinner" /> : null}
        {error ? <div className="alert-error">{error}</div> : null}

        {payload?.currentParentCompany ? (
          <div className="cs-card">
            <div className="cs-card__title">{t('desktop.current_parent_company')}</div>
            <div className="cs-parent-row">
              <CompanyThumb company={payload.currentParentCompany} />
              <div>
                <div className="cs-access-card__name">{payload.currentParentCompany.name}</div>
                <div className="cs-muted">{payload.currentParentCompany.type}</div>
              </div>
            </div>
            <p className="cs-muted">{t('desktop.parent_already_linked')}</p>
          </div>
        ) : null}

        {payload?.hasChildCompanies ? (
          <div className="cs-card">
            <div className="cs-card__title">{t('desktop.child_companies')}</div>
            <p className="cs-card__hint">{t('desktop.has_children_no_parent')}</p>
            {(payload.childCompanies || []).map((child) => (
              <div className="cs-parent-row" key={String(child.company_id)}>
                <CompanyThumb company={child} />
                <div>
                  <div className="cs-access-card__name">{child.name}</div>
                  <div className="cs-muted">{child.type}</div>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {canChoose ? (
          <div className="cs-card">
            <div className="cs-card__title">{t('desktop.select_parent_company')}</div>
            <div className="cs-field">
              <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">{t('desktop.select')}</option>
                {(payload?.parentCompanyOptions || []).map((opt) => (
                  <option key={String(opt.company_id)} value={String(opt.company_id)}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="cs-actions">
              <button
                type="button"
                className="btn-primary"
                disabled={!parentId}
                onClick={() => setConfirmOpen(true)}
              >
                {t('desktop.connect_parent_company')}
              </button>
            </div>
          </div>
        ) : null}

        {!loading && !payload?.currentParentCompany && !canChoose && !payload?.hasChildCompanies ? (
          <p className="cs-muted text-center">{t('desktop.no_parent_options')}</p>
        ) : null}
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title={t('desktop.confirm')}>
        <form onSubmit={(e) => void submitConnect(e)} dir="rtl">
          <p>{t('desktop.confirm_parent_connect')}</p>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setConfirmOpen(false)}>
              {t('desktop.cancel')}
            </button>
            <button className="btn-primary" disabled={busy}>
              {busy ? t('desktop.processing') : t('desktop.confirm')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
