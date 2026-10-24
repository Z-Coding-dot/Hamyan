import { useEffect, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import { createSaleDraft } from '@/lib/business'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

/** Matches project GET /business/{id}/sale — create draft then open setup. */
export function CompanySaleCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const [error, setError] = useState<string | null>(null)

  const canCreate =
    Boolean(business.permissions?.canCreateSales) && business.is_active

  useEffect(() => {
    if (!token || !companyId) return
    if (!canCreate) {
      setError(t('desktop.no_sales'))
      return
    }

    let cancelled = false
    void (async () => {
      try {
        const invoice = await createSaleDraft(token, companyId)
        if (cancelled) return
        navigate(businessPath(companyId, `sales/${invoice.id}`), { replace: true })
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err))
      }
    })()

    return () => {
      cancelled = true
    }
  }, [token, companyId, canCreate, navigate, t])

  if (error) {
    return (
      <div className="dash-div party-page" dir="rtl">
        <div className="alert-error">{error}</div>
        <Link to={businessPath(companyId, 'sales')} className="btn-secondary btn-sm">
          {t('desktop.sales')}
        </Link>
      </div>
    )
  }

  return (
    <div className="center-screen">
      <div className="spinner" />
      <p className="muted" style={{ marginTop: 12 }}>
        {t('desktop.processing')}
      </p>
    </div>
  )
}
