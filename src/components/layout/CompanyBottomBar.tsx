import { useCallback, useEffect, useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import {
  fetchBusinessNotifications,
  markBusinessNotificationsRead,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import { useSidebarStore } from '@/store/useSidebarStore'

type Props = {
  companyId: string
}

export function CompanyBottomBar({ companyId }: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const token = useAuthStore(useShallow((s) => s.token))
  const { isOpen, toggle } = useSidebarStore(
    useShallow((s) => ({
      isOpen: s.isOpen,
      toggle: s.toggle,
    })),
  )

  const [hasUnread, setHasUnread] = useState(false)
  const dashboardPath = businessPath(companyId)
  const profilePath = businessPath(companyId, 'profile')
  const notificationsPath = businessPath(companyId, 'notifications')

  const loadUnread = useCallback(async () => {
    if (!token || !companyId) return
    try {
      const data = await fetchBusinessNotifications(token, companyId)
      setHasUnread(Boolean(data.notReadNote))
    } catch {
      /* ignore */
    }
  }, [token, companyId])

  useEffect(() => {
    void loadUnread()
  }, [loadUnread, location.pathname])

  const openNotifications = async () => {
    if (token && companyId) {
      try {
        await markBusinessNotificationsRead(token, companyId)
        setHasUnread(false)
      } catch {
        /* still navigate */
      }
    }
    navigate(notificationsPath)
  }

  return (
    <div className="bottom-bar no-print" dir="rtl">
      <div className="bottom-bar-nav">
        <NavLink
          to={dashboardPath}
          end
          className={({ isActive }) => `bottom-link${isActive ? ' active-link' : ''}`}
        >
          <div className="tab-icon">
            <i className="fa-solid fa-gauge-high" />
          </div>
          <div className="tab-text">{t('desktop.nav_dashboard')}</div>
        </NavLink>

        <NavLink
          to={profilePath}
          className={({ isActive }) => `bottom-link${isActive ? ' active-link' : ''}`}
        >
          <div className="tab-icon">
            <i className="fa-regular fa-circle-user" />
          </div>
          <div className="tab-text">{t('desktop.nav_profile')}</div>
        </NavLink>

        <button
          type="button"
          className={`bottom-link${location.pathname.includes('/notifications') ? ' active-link' : ''}`}
          onClick={() => void openNotifications()}
        >
          {hasUnread ? <div className="tab-dot" /> : null}
          <div className="tab-icon">
            <i className="fa-solid fa-bell" />
          </div>
          <div className="tab-text">{t('desktop.nav_notifications')}</div>
        </button>

        <button
          type="button"
          className={`bottom-link${isOpen ? ' active-link' : ''}`}
          onClick={() => toggle()}
        >
          <div className="tab-icon">
            <i className="fa-solid fa-bars" />
          </div>
          <div className="tab-text">{t('desktop.menu')}</div>
        </button>
      </div>
    </div>
  )
}
