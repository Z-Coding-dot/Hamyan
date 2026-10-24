import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { AppPageBar } from '@/components/layout/AppPageBar'
import { AppSidebar } from '@/components/layout/AppSidebar'
import { UserBottomBar } from '@/components/layout/UserBottomBar'
import { PageRefresh } from '@/components/PageRefresh'
import { useIsMobileSidebar } from '@/hooks/useMediaQuery'
import { useAuthStore } from '@/store/useAuthStore'
import { useSidebarStore } from '@/store/useSidebarStore'

export function AppLayout() {
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

  useEffect(() => {
    if (isMobile) close()
  }, [isMobile, close])

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
      className={`app-frame app-frame--with-bottom-bar${isOpen ? '' : ' app-frame--sidebar-collapsed'}${isMobile ? ' app-frame--mobile' : ''}`}
    >
      {isMobile && isOpen ? (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={close}
        />
      ) : null}
      <AppPageBar />
      <PageRefresh />
      <AppSidebar />
      <main className="app-content">
        <Outlet />
      </main>
      <UserBottomBar />
    </div>
  )
}
