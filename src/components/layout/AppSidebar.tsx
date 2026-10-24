import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { useCachedAsset } from '@/hooks/useCachedAsset'
import { prefetchCachedAssets } from '@/lib/mediaCache'
import { useAuthStore } from '@/store/useAuthStore'

type SidebarTabProps = {
  to: string
  icon: string
  label: string
  end?: boolean
  premiumIcon?: boolean
  accent?: 'help'
  fullWidth?: boolean
}

function SidebarTab({ to, icon, label, end, premiumIcon, accent, fullWidth }: SidebarTabProps) {
  return (
    <div className={`tab${fullWidth ? ' tab--full' : ''}`}>
      <NavLink
        to={to}
        end={end}
        className={`sidebar-tab-link${accent ? ` sidebar-tab--${accent}` : ''}`}
      >
        {({ isActive }) => (
          <div className={`tab-a${isActive ? ' active' : ''}`}>
            <div className="tab-icon">
              <i className={`fa-solid ${icon}${premiumIcon ? ' premium-nav-crown-icon' : ''}`} />
            </div>
            <div className="tab-text">{label}</div>
          </div>
        )}
      </NavLink>
    </div>
  )
}

export function AppSidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout, isLoading } = useAuthStore(
    useShallow((state) => ({
      user: state.user,
      logout: state.logout,
      isLoading: state.isLoading,
    })),
  )

  const displayName = [user?.name, user?.lastname].filter(Boolean).join(' ') || user?.email || ''
  const profilePhotoUrl = useCachedAsset(user?.profile_photo_path)
  const isProfileActive = location.pathname === '/profile'

  useEffect(() => {
    prefetchCachedAssets([user?.profile_photo_path])
  }, [user?.profile_photo_path])

  return (
    <aside className="sidebar sidebar--desktop">
      <div className="side-profile-dropdown">
        <button
          type="button"
          className={`side-profile-main${isProfileActive ? ' is-active' : ''}`}
          onClick={() => navigate('/profile')}
        >
          <div className="side-profile-logo">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt={displayName} />
            ) : (
              <i className="fa-regular fa-circle-user" />
            )}
          </div>
          <div className="side-profile-name">
            <h5>{displayName}</h5>
            <small className="text-muted">{t('desktop.sidebar_personal_account')}</small>
          </div>
        </button>
      </div>

      <SidebarTab to="/dashboard" icon="fa-gauge-high" label={t('desktop.nav_dashboard')} end />

      <SidebarTab to="/accounts" icon="fa-money-bill-transfer" label={t('desktop.hy_accounts_title')} />
      <SidebarTab to="/incomes" icon="fa-arrow-down" label={t('desktop.hy_incomes_page')} />
      <SidebarTab to="/expenses" icon="fa-receipt" label={t('desktop.expenses_page')} />
      <SidebarTab to="/expense-analysis" icon="fa-chart-pie" label={t('desktop.expense_analysis')} />
      <SidebarTab to="/counterparties" icon="fa-users" label={t('desktop.nav_counterparties')} />
      <SidebarTab
        to="/counterparties/transactions"
        icon="fa-right-left"
        label={t('desktop.counterparty_transactions')}
      />
      <SidebarTab to="/premium" icon="fa-crown" label={t('desktop.nav_premium')} />

      <div className="side-section-title">{t('desktop.other_options')}</div>

      <SidebarTab to="/settings" icon="fa-gear" label={t('desktop.nav_settings')} />

      <div className="sidebar-legal-links">
        <a href="https://ulanish.dev/terms" className="sidebar-legal-links__item" target="_blank" rel="noopener noreferrer">
          {t('desktop.terms')}
        </a>
        <span className="sidebar-legal-links__sep" aria-hidden>
          ·
        </span>
        <a href="https://ulanish.dev/privacy" className="sidebar-legal-links__item" target="_blank" rel="noopener noreferrer">
          {t('desktop.policies')}
        </a>
      </div>

      <SidebarTab
        to="/help"
        icon="fa-circle-info"
        label={t('desktop.help_center')}
        accent="help"
        fullWidth
      />

      <button
        type="button"
        className="sidebar-logout-btn"
        onClick={() => void logout()}
        disabled={isLoading}
      >
        <div className="logout-btn">
          <div className="tab-icon">
            <i className="fa-solid fa-arrow-right-from-bracket" />
          </div>
          <div className="tab-text">
            <h6>{t('desktop.logout')}</h6>
          </div>
        </div>
      </button>
    </aside>
  )
}
