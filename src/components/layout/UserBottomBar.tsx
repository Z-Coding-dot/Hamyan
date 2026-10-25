import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { useCompanyContextStore } from '@/store/useCompanyContextStore'
import { useSidebarStore } from '@/store/useSidebarStore'

export function UserBottomBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const setUserContext = useCompanyContextStore((s) => s.setUserContext)
  const isOpen = useSidebarStore((s) => s.isOpen)
  const toggle = useSidebarStore((s) => s.toggle)
  const secondaryPage = !(
    location.pathname === '/dashboard' || location.pathname.startsWith('/accounts') ||
    location.pathname.startsWith('/expenses') ||
    (location.pathname.startsWith('/counterparties') && location.pathname !== '/counterparties/transactions')
  )

  const goDashboard = async () => {
    await setUserContext()
    navigate('/dashboard')
  }

  return (
    <nav className="bottom-bar hy-mobile-nav no-print" aria-label={t('desktop.hy_primary_navigation')} inert={isOpen}>
      <div className="bottom-bar-nav">
        <button
          type="button"
          className={`bottom-link${location.pathname === '/dashboard' ? ' active-link' : ''}`}
          onClick={() => void goDashboard()}
          aria-current={location.pathname === '/dashboard' ? 'page' : undefined}
        >
          <div className="tab-icon">
            <i className="fa-solid fa-gauge-high" aria-hidden="true" />
          </div>
          <div className="tab-text">{t('desktop.nav_dashboard')}</div>
        </button>

        <NavLink
          to="/counterparties"
          end={location.pathname === '/counterparties/transactions'}
          className={({ isActive }) => `bottom-link${isActive ? ' active-link' : ''}`}
        >
          <div className="tab-icon">
            <i className="fa-solid fa-users" aria-hidden="true" />
          </div>
          <div className="tab-text">{t('desktop.nav_counterparties')}</div>
        </NavLink>

        <NavLink
          to="/accounts"
          className={({ isActive }) => `bottom-link${isActive ? ' active-link' : ''}`}
        >
          <div className="tab-icon">
            <i className="fa-solid fa-money-bill-transfer" aria-hidden="true" />
          </div>
          <div className="tab-text">{t('desktop.hy_accounts_title')}</div>
        </NavLink>

        <NavLink
          to="/expenses"
          className={({ isActive }) => `bottom-link${isActive ? ' active-link' : ''}`}
        >
          <div className="tab-icon">
            <i className="fa-solid fa-receipt" aria-hidden="true" />
          </div>
          <div className="tab-text">{t('desktop.expenses_page')}</div>
        </NavLink>
        <button type="button" className={`bottom-link${isOpen || secondaryPage ? ' active-link' : ''}`} onClick={toggle} aria-label={t('desktop.sidebar_open')} aria-expanded={isOpen} aria-controls="app-sidebar">
          <div className="tab-icon"><i className="fa-solid fa-bars" aria-hidden="true" /></div>
          <div className="tab-text">{t('desktop.menu')}</div>
        </button>
      </div>
    </nav>
  )
}
