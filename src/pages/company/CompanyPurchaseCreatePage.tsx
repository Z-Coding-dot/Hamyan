import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { CreatePurchaseModal } from '@/pages/company/CreatePurchaseModal'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyPurchaseCreatePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))

  const canCreate =
    Boolean(business.permissions?.canManageInventory) && business.is_active

  if (!canCreate) {
    return (
      <div className="dash-div party-page" dir="rtl">
        <div className="alert-error">{t('desktop.permission_denied')}</div>
        <Link to={businessPath(companyId, 'purchases')} className="btn-secondary btn-sm">
          {t('desktop.purchases')}
        </Link>
      </div>
    )
  }

  return (
    <CreatePurchaseModal
      variant="page"
      open
      companyId={companyId}
      token={token}
      onClose={() => navigate(businessPath(companyId, 'purchases'))}
      onCreated={(purchaseNumber) => {
        navigate(businessPath(companyId, `purchases/${purchaseNumber}`), { replace: true })
      }}
      pageHeader={
        <div className="dash-header dash-header--section mb-3">
          <div
            className="d-flex justify-content-between align-items-start gap-2"
            style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}
          >
            <div>
              <h5 className="mb-1">
                {t('desktop.insert')} {t('desktop.purchase')}
              </h5>
            </div>
            <Link to={businessPath(companyId, 'purchases')} className="btn-secondary btn-sm">
              <i className="fa-solid fa-reply" /> {t('desktop.back')}
            </Link>
          </div>
        </div>
      }
    />
  )
}
