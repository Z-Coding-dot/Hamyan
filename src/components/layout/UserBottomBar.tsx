import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useCompanyContextStore } from '@/store/useCompanyContextStore'

export function UserBottomBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const setUserContext = useCompanyContextStore((s) => s.setUserContext)

  const goDashboard = async () => {
    await setUserContext()
    navigate('/dashboard')
  }

  return (
    <div className="bottom-bar no-print" dir="rtl">
      <div className="bottom-bar-nav">
        <button
          type="button"
          className={`bottom-link${location.pathname === '/dashboard' ? ' active-link' : ''}`}
          onClick={() => void goDashboard()}
        >
          <div className="tab-icon">
            <i className="fa-solid fa-gauge-high" />
          </div>
          <div className="tab-text">{t('desktop.nav_dashboard')}</div>
        </button>

        <NavLink
          to="/counterparties"
          className={({ isActive }) => `bottom-link${isActive ? ' active-link' : ''}`}
        >
          <div className="tab-icon">
            <i className="fa-solid fa-users" />
          </div>
          <div className="tab-text">{t('desktop.nav_counterparties')}</div>
        </NavLink>

        <NavLink
          to="/accounts"
          className={({ isActive }) => `bottom-link${isActive ? ' active-link' : ''}`}
        >
          <div className="tab-icon">
            <i className="fa-solid fa-money-bill-transfer" />
          </div>
          <div className="tab-text">{t('desktop.hy_accounts_title')}</div>
        </NavLink>

        <NavLink
          to="/expenses"
          className={({ isActive }) => `bottom-link${isActive ? ' active-link' : ''}`}
        >
          <div className="tab-icon">
            <i className="fa-solid fa-receipt" />
          </div>
          <div className="tab-text">{t('desktop.expenses_page')}</div>
        </NavLink>
      </div>
    </div>
  )
}
