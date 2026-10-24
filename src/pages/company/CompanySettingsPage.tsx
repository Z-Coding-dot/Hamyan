import { useEffect, useState } from 'react'
import { Link, Navigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import { fetchBusinessSettingsHub, type BusinessSettingsHubPayload } from '@/lib/business'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanySettingsPage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))

  const canView = Boolean(business.permissions?.canViewBusinessSettings)
  const [payload, setPayload] = useState<BusinessSettingsHubPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token || !companyId || !canView) return
    let active = true
    setLoading(true)
    setError(null)
    void fetchBusinessSettingsHub(token, companyId)
      .then((data) => {
        if (active) setPayload(data)
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
  }, [token, companyId, canView])

  if (!canView) {
    return <Navigate to={businessPath(companyId)} replace />
  }

  const isOwner = Boolean(payload?.isOwner ?? business.permissions?.isOwner)

  return (
    <div className="dash-div company-settings-page no-print" dir="rtl">
      <div className="content-small">
        <h5 className="cs-title">{t('desktop.nav_settings')}</h5>

        {loading ? <div className="spinner" /> : null}
        {error ? <div className="alert-error">{error}</div> : null}

        {!loading && !error ? (
          <>
            {isOwner ? (
              <div className="cs-card">
                <div className="cs-card__title">
                  <i className="fa-solid fa-sliders" />
                  {t('desktop.business_status')}
                </div>
                <p className="cs-card__hint">{t('desktop.business_status_hint')}</p>
                <Link
                  className="btn-primary btn-block"
                  to={businessPath(companyId, 'settings/business-status')}
                >
                  {t('desktop.manage_business_status')}
                </Link>
              </div>
            ) : null}

            <div className="cs-card">
              <div className="cs-card__title">
                <i className="fa-solid fa-user-shield" />
                {t('desktop.company_user_access')}
              </div>
              <p className="cs-card__hint">{t('desktop.company_user_access_hint')}</p>
              <Link className="btn-primary btn-block" to={businessPath(companyId, 'settings/access')}>
                {t('desktop.manage_user_access')}
              </Link>
            </div>

            <div className="cs-card">
              <div className="cs-card__title">
                <i className="fa-solid fa-building-circle-check" />
                {t('desktop.parent_company_link')}
              </div>
              <p className="cs-card__hint">{t('desktop.parent_company_link_hint')}</p>
              <Link
                className="btn-primary btn-block"
                to={businessPath(companyId, 'settings/parent-company')}
              >
                {t('desktop.manage_parent_company')}
              </Link>
            </div>

            {payload?.canPurgeCompanyData || isOwner ? (
              <div className="cs-card cs-card--danger">
                <div className="cs-card__title">
                  <i className="fa-solid fa-triangle-exclamation" />
                  {t('desktop.data_purge_title')}
                </div>
                <p className="cs-card__hint">{t('desktop.data_purge_hint')}</p>
                <Link
                  className="btn-danger btn-block"
                  to={businessPath(companyId, 'data-purge-checkpoint')}
                >
                  {t('desktop.go_data_purge')}
                </Link>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  )
}
