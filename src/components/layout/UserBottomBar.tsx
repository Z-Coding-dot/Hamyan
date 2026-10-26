import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { m } from 'framer-motion'

import { useCompanyContextStore } from '@/store/useCompanyContextStore'
import { useSidebarStore } from '@/store/useSidebarStore'

export function UserBottomBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const setUserContext = useCompanyContextStore((s) => s.setUserContext)
  const isOpen = useSidebarStore((s) => s.isOpen)
  const goHome = async () => { await setUserContext(); navigate('/dashboard') }
  const tabs = [
    { to: '/dashboard', label: 'hy_mobile_home', icon: 'fa-house' },
    { to: '/incomes', label: 'hy_incomes_page', icon: 'fa-arrow-trend-up' },
    { to: '/expenses', label: 'expenses_page', icon: 'fa-receipt' },
    { to: '/counterparties', label: 'nav_counterparties', icon: 'fa-user-group' },
  ]
  return (
    <nav className="bottom-bar hy-mobile-nav no-print" aria-label={t('desktop.hy_primary_navigation')} inert={isOpen}>
      <div className="bottom-bar-nav">{tabs.map((tab) => {
        const active = tab.to === '/counterparties' ? location.pathname.startsWith('/counterparties') && location.pathname !== '/counterparties/transactions' : location.pathname === tab.to
        const content = <><span className="tab-icon">{active && <m.span layoutId="mobile-tab-active" className="hy-mobile-nav__pill" transition={{ type: 'spring', stiffness: 430, damping: 35 }} />}<i className={`fa-solid ${tab.icon}`} aria-hidden="true" /></span><span className="tab-text">{t(`desktop.${tab.label}`)}</span></>
        return tab.to === '/dashboard' ? <button key={tab.to} type="button" className={`bottom-link${active ? ' active-link' : ''}`} onClick={() => void goHome()} aria-current={active ? 'page' : undefined}>{content}</button>
          : <NavLink key={tab.to} to={tab.to} end={tab.to === '/counterparties' && location.pathname === '/counterparties/transactions'} className={`bottom-link${active ? ' active-link' : ''}`}>{content}</NavLink>
      })}</div>
    </nav>
  )
}
