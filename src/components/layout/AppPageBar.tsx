import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { BrandLogo } from '@/components/BrandLogo'
import { HeaderSearch } from '@/components/layout/HeaderSearch'
import { fetchNotifications } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useSidebarStore } from '@/store/useSidebarStore'

export function AppPageBar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const token = useAuthStore(useShallow((s) => s.token))
  const toggle = useSidebarStore((s) => s.toggle)
  const [hasUnread, setHasUnread] = useState(false)
  const notesActive = location.pathname === '/notifications'

  const loadUnread = useCallback(async () => {
    if (!token) return
    try {
      const data = await fetchNotifications(token)
      setHasUnread(Boolean(data.notReadNote))
    } catch {
      /* ignore */
    }
  }, [token])

  useEffect(() => {
    void loadUnread()
  }, [loadUnread, location.pathname])

  return (
    <div className="hy-top-wrap">
      <div className="hy-top">
        <div className="hy-top__brand">
          <BrandLogo size={32} className="hy-top__logo" />
          <strong>{t('desktop.app_name')}</strong>
        </div>
        <div className="hy-top__tools">
          <HeaderSearch />
          <button
            type="button"
            className={`hy-top__btn${location.pathname === '/guide' ? ' is-on' : ''}`}
            onClick={() => navigate('/guide')}
            aria-label={t('desktop.hy_guide_page')}
            title={t('desktop.hy_guide_page')}
          >
            <i className="fa-regular fa-circle-question" />
          </button>
          <button type="button" className="hy-top__btn" onClick={() => toggle()} aria-label={t('desktop.menu')}>
            <i className="fa-solid fa-bars" />
          </button>
          <button
            type="button"
            className={`hy-top__btn${notesActive ? ' is-on' : ''}`}
            onClick={() => navigate('/notifications')}
            aria-label={t('desktop.nav_notifications')}
          >
            <i className="fa-regular fa-bell" />
            {hasUnread ? <span className="hy-top__dot" /> : null}
          </button>
        </div>
      </div>
    </div>
  )
}
