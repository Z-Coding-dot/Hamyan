import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { AppPageBar } from '@/components/layout/AppPageBar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { UserBottomBar } from '@/components/layout/UserBottomBar'
import { useIsMobileSidebar } from '@/hooks/useMediaQuery'
import { useAuthStore } from '@/store/useAuthStore'
import { useSidebarStore } from '@/store/useSidebarStore'

export function AppLayout() {
  const { t } = useTranslation()
  const { token, isHydrated } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      isHydrated: state.isHydrated,
    })),
  )
  const { isOpen, hydrate, close } = useSidebarStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      hydrate: state.hydrate,
      close: state.close,
    })),
  )
  const location = useLocation()
  const isMobile = useIsMobileSidebar()

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    if (isMobile) close()
  }, [location.pathname, isMobile, close])

  if (!isHydrated) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return (
    <div
      className={`app-frame hy-app-shell${isMobile ? ' app-frame--with-bottom-bar app-frame--mobile' : ''}${isOpen ? '' : ' app-frame--sidebar-collapsed'}`}
    >
      {isMobile && isOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label={t('desktop.sidebar_close')}
          tabIndex={-1}
          onClick={close}
        />
      ) : null}
      <AppSidebar />
      <div className="hy-app-header" inert={isMobile && isOpen}><AppPageBar /></div>
      <main id="app-main" className="app-content" inert={isMobile && isOpen}>
        <Outlet />
      </main>
      {isMobile && <UserBottomBar />}
    </div>
  )
}
