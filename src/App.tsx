import { useEffect, useState } from 'react'
import {
  Navigate,
  Route,
  RouterProvider,
  Routes,
  createBrowserRouter,
  useLocation,
} from 'react-router-dom'

import { AppLayout } from '@/components/layout/AppLayout'
import { GuestLayout } from '@/components/layout/GuestLayout'
import { AppLoadingSplash, LOGO_ANIMATION_TOTAL_MS } from '@/components/logo'
import { SeoHead } from '@/components/SeoHead'
import { PwaManager } from '@/components/PwaManager'
import { OfflineBanner } from '@/components/OfflineBanner'
import { SuccessToastHost } from '@/components/ui/SuccessToast'
import { AccountsPage } from '@/pages/AccountsPage'
import { CounterpartiesPage } from '@/pages/CounterpartiesPage'
import { CounterpartyShowPage } from '@/pages/counterparties/CounterpartyShowPage'
import { CounterpartyTransactionsPage } from '@/pages/counterparties/CounterpartyTransactionsPage'
import { ExpenseAnalysisPage } from '@/pages/ExpenseAnalysisPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { GuidePage } from '@/pages/GuidePage'
import { IncomesPage } from '@/pages/IncomesPage'
import { HelpPage } from '@/pages/HelpPage'
import { HelpShowPage } from '@/pages/HelpShowPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { HomePage } from '@/pages/HomePage'
import { ResetPasswordPage } from '@/pages/ResetPasswordPage'
import { LoginPage } from '@/pages/LoginPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { PremiumPage } from '@/pages/PremiumPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RegisterPage } from '@/pages/RegisterPage'
import { SettingsPage } from '@/pages/SettingsPage'
import { useAuthStore } from '@/store/useAuthStore'
import { useCompanyContextStore } from '@/store/useCompanyContextStore'
import { useLocaleStore } from '@/store/useLocaleStore'
import { useRouteRefreshStore } from '@/store/useRouteRefreshStore'
import { useSidebarStore } from '@/store/useSidebarStore'
import { WorkspaceSwitchOverlay } from '@/components/layout/WorkspaceSwitchOverlay'
import { useWorkspaceSwitchStore } from '@/store/useWorkspaceSwitchStore'

const AUTH_PATHS = ['/login', '/register', '/forgot-password', '/reset-password']

function ExternalGo({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href)
  }, [href])
  return null
}

function isChromeHiddenPath(pathname: string) {
  if (pathname === '/') return true
  if (pathname.startsWith('/c/')) return true
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

function AppRoutes() {
  const refreshKey = useRouteRefreshStore((state) => state.refreshKey)
  const isRefreshing = useRouteRefreshStore((state) => state.isRefreshing)
  const finishRefresh = useRouteRefreshStore((state) => state.finishRefresh)

  useEffect(() => {
    if (!isRefreshing) return
    const timer = window.setTimeout(() => {
      finishRefresh()
    }, 450)
    return () => window.clearTimeout(timer)
  }, [refreshKey, isRefreshing, finishRefresh])

  return (
    <Routes key={refreshKey}>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

      <Route path="/download" element={<Navigate to="/" replace />} />
      <Route path="/subscription-pricing" element={<Navigate to="/" replace />} />
      <Route path="/terms" element={<ExternalGo href="https://ulanish.dev/terms" />} />
      <Route path="/policies" element={<ExternalGo href="https://ulanish.dev/privacy" />} />

      <Route element={<GuestLayout />}>
        <Route path="/help" element={<HelpPage />} />
        <Route path="/help/:guideId" element={<HelpShowPage />} />
        <Route path="/affiliates" element={<Navigate to="/" replace />} />
        <Route path="/resellers" element={<Navigate to="/" replace />} />
        <Route path="/become-reseller" element={<Navigate to="/" replace />} />
        <Route path="/exchange-rates" element={<Navigate to="/" replace />} />
        <Route path="/exchange-rates/:from/:to" element={<Navigate to="/" replace />} />
        <Route path="/reseller-terms" element={<Navigate to="/" replace />} />
      </Route>

      <Route element={<AppLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/incomes" element={<IncomesPage />} />
        <Route path="/expenses" element={<ExpensesPage />} />
        <Route path="/expense-analysis" element={<ExpenseAnalysisPage />} />
        <Route path="/guide" element={<GuidePage />} />
        <Route path="/counterparties" element={<CounterpartiesPage />} />
        <Route path="/counterparties/transactions" element={<CounterpartyTransactionsPage />} />
        <Route path="/counterparties/:customerId" element={<CounterpartyShowPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/wallet" element={<Navigate to="/accounts" replace />} />
        <Route path="/wallet/*" element={<Navigate to="/accounts" replace />} />
        <Route path="/companies" element={<Navigate to="/dashboard" replace />} />
        <Route path="/premium" element={<PremiumPage />} />
      </Route>

      <Route path="/business/*" element={<Navigate to="/dashboard" replace />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function AppShell() {
  const location = useLocation()
  const isWorkspaceSwitching = useWorkspaceSwitchStore((state) => state.isActive)
  const marketing = isChromeHiddenPath(location.pathname)

  return (
    <div
      className={`electron-shell electron-shell--web${marketing ? ' electron-shell--marketing' : ''}${
        isWorkspaceSwitching ? ' electron-shell--workspace-switch' : ''
      }`}
    >
      <div className="app-shell-body">
        <SeoHead />
        <OfflineBanner />
        <SuccessToastHost />
        <AppRoutes />
      </div>
      <WorkspaceSwitchOverlay />
    </div>
  )
}

export default function App() {
  const bootstrapAuth = useAuthStore((state) => state.bootstrap)
  const initializeLocale = useLocaleStore((state) => state.initialize)
  const hydrateSidebar = useSidebarStore((state) => state.hydrate)
  const hydrateCompanyContext = useCompanyContextStore((state) => state.hydrate)
  const localeReady = useLocaleStore((state) => state.isReady)
  const [splashDone, setSplashDone] = useState(false)

  useEffect(() => {
    void initializeLocale()
    void hydrateSidebar()
    void hydrateCompanyContext()
    void bootstrapAuth()
  }, [initializeLocale, hydrateSidebar, hydrateCompanyContext, bootstrapAuth])

  useEffect(() => {
    const timer = window.setTimeout(() => setSplashDone(true), LOGO_ANIMATION_TOTAL_MS)
    return () => window.clearTimeout(timer)
  }, [])

  const ready = splashDone && localeReady

  return (
    <>
      <PwaManager showUi={ready} />
      {ready ? <RouterProvider router={appRouter} /> : <AppLoadingSplash />}
    </>
  )
}

const appRouter = createBrowserRouter([{ path: '*', element: <AppShell /> }])
