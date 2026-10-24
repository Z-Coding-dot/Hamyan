import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { CompanyBottomBar } from '@/components/layout/CompanyBottomBar'
import { CompanySidebar } from '@/components/layout/CompanySidebar'
import { SidebarEdgeToggle } from '@/components/layout/SidebarEdgeToggle'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCompanyRoleTitle } from '@/lib/companyRoles'
import { isCompanyValidOnDate } from '@/lib/datetime'
import { companyHasSaleAndCapitalAccounts, fetchBusiness, type BusinessShowData } from '@/lib/user'
import { useListsCacheStore } from '@/store/useListsCacheStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppCacheStore } from '@/store/useAppCacheStore'
import { useCompanyContextStore } from '@/store/useCompanyContextStore'
import { useSidebarStore } from '@/store/useSidebarStore'
import { useIsMobileSidebar } from '@/hooks/useMediaQuery'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'

function isCompanySetupPath(pathname: string, companyId: string): boolean {
  const prefix = `/business/${companyId}`
  if (!pathname.startsWith(prefix)) return true
  const rest = pathname.slice(prefix.length).replace(/^\//, '').replace(/\/$/, '')
  if (rest === '' || rest === 'profile' || rest === 'notifications' || rest === 'accounts') return true
  return /^accounts\/\d+$/.test(rest)
}

export function CompanyLayout() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const location = useLocation()
  const userKey = useUserCacheKey()
  const { token, isHydrated } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      isHydrated: state.isHydrated,
    })),
  )
  const setCompanyContext = useCompanyContextStore((state) => state.setCompanyContext)
  const setActiveBusiness = useCompanyContextStore((state) => state.setActiveBusiness)
  const setUserContext = useCompanyContextStore((state) => state.setUserContext)
  const setCompanyValidity = useAppCacheStore((state) => state.setCompanyValidity)
  const cachedValidUpTo = useAppCacheStore((state) =>
    companyId ? state.getCompanyValidUpTo(userKey, companyId) : undefined,
  )
  const ensureCompanyValidity = useAppCacheStore((state) => state.ensureCompanyValidity)
  const ensureMeasurementUnits = useAppCacheStore((state) => state.ensureMeasurementUnits)
  const { isOpen, hydrate, close } = useSidebarStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      hydrate: state.hydrate,
      close: state.close,
    })),
  )
  const isMobile = useIsMobileSidebar()
  const cachedAccounts = useListsCacheStore((state) =>
    companyId ? state.getAccounts(userKey, companyId) : null,
  )
  const ensureAccounts = useListsCacheStore((state) => state.ensureAccounts)
  const accountsLocked =
    cachedAccounts != null && !companyHasSaleAndCapitalAccounts(cachedAccounts)

  useEffect(() => {
    if (!token || !companyId) return
    void ensureAccounts(token, userKey, companyId)
  }, [token, companyId, userKey, ensureAccounts])

  useEffect(() => {
    if (isMobile) close()
  }, [location.pathname, isMobile, close])

  useEffect(() => {
    if (isMobile) close()
  }, [isMobile, close])

  const [business, setBusinessState] = useState<BusinessShowData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const syncActiveBusiness = (data: BusinessShowData) => {
    const validUpTo = data.valid_up_to ?? data.company.valid_up_to ?? null
    const isActive =
      typeof data.is_active === 'boolean' ? data.is_active : isCompanyValidOnDate(validUpTo)
    const perms = data.permissions ?? {}
    const roleCode = perms.isOwner
      ? 'owner'
      : typeof perms.roleCode === 'string'
        ? perms.roleCode
        : null
    const roleTitle = localizeCompanyRoleTitle(
      roleCode,
      t,
      typeof perms.roleTitle === 'string' ? perms.roleTitle : null,
    ) || (perms.isOwner ? t('desktop.role_owner') : null)
    setActiveBusiness({
      companyId: String(data.company.company_id),
      name: data.company.name,
      isActive,
      validUpTo,
      logo: data.company.logo,
      roleCode,
      roleTitle,
    })
  }

  const setBusiness = (data: BusinessShowData | null) => {
    setBusinessState(data)
    if (data) syncActiveBusiness(data)
    else setActiveBusiness(null)
  }

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  useEffect(() => {
    if (!companyId) return
    void setCompanyContext(companyId)
  }, [companyId, setCompanyContext])

  useEffect(() => {
    if (!token || !companyId) return
    // Only warm light reference data here. Operational lists warm on their own pages
    // (daily cache) so remounting the company shell does not spam the API.
    void ensureCompanyValidity(token, userKey, companyId)
    void ensureMeasurementUnits(token, userKey, companyId)
  }, [token, companyId, userKey, ensureCompanyValidity, ensureMeasurementUnits])

  useEffect(() => {
    if (!token || !companyId) return
    let active = true
    setLoading(true)
    setError(null)

    void fetchBusiness(token, companyId)
      .then(async (data) => {
        if (!active) return
        const validUpTo = data.valid_up_to ?? data.company.valid_up_to ?? null
        const isActive =
          typeof data.is_active === 'boolean'
            ? data.is_active
            : isCompanyValidOnDate(validUpTo ?? cachedValidUpTo)
        const normalized: BusinessShowData = { ...data, is_active: isActive }
        setBusiness(normalized)
        await setCompanyValidity(userKey, companyId, validUpTo)
      })
      .catch(async (err) => {
        if (!active) return
        setError(getApiErrorMessage(err))
        setBusiness(null)
        await setUserContext()
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [
    token,
    companyId,
    userKey,
    setUserContext,
    setActiveBusiness,
    setCompanyValidity,
    cachedValidUpTo,
    t,
  ])

  useEffect(() => {
    return () => {
      // Clear toolbar company name / validity when leaving the company shell.
      setActiveBusiness(null)
    }
  }, [setActiveBusiness])

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

  if (!companyId) {
    return <Navigate to="/dashboard" replace />
  }

  if (loading && !business) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!business) {
    return <Navigate to="/dashboard" replace />
  }

  const inactive = !business.is_active

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
      <CompanySidebar
        company={business.company}
        isActive={business.is_active}
        roleCode={
          typeof business.permissions?.roleCode === 'string'
            ? business.permissions.roleCode
            : null
        }
        isOwner={Boolean(business.permissions?.isOwner)}
        canViewActivityLogs={Boolean(business.permissions?.canViewActivityLogs)}
        canViewStaff={Boolean(business.permissions?.canViewStaff)}
        canViewBusinessSettings={Boolean(business.permissions?.canViewBusinessSettings)}
        canViewTransactions={Boolean(business.permissions?.canViewTransactions)}
        canViewSales={Boolean(business.permissions?.canViewSales)}
        canCreateSales={Boolean(business.permissions?.canCreateSales)}
        canViewExpenses={Boolean(business.permissions?.canViewExpenses)}
        canViewCustomers={Boolean(business.permissions?.canViewCustomers)}
        canViewVendors={Boolean(business.permissions?.canViewVendors)}
        canViewInventory={Boolean(business.permissions?.canViewInventory)}
        canManageInventory={Boolean(business.permissions?.canManageInventory)}
        canViewAccounts={Boolean(business.permissions?.canViewAccounts)}
        modulesLocked={accountsLocked}
        canViewReports={
          typeof business.permissions?.canViewReports === 'boolean'
            ? business.permissions.canViewReports
            : Boolean(
                business.permissions?.isOwner ||
                  business.permissions?.canViewTransactions ||
                  business.permissions?.roleCode === 'manager' ||
                  business.permissions?.roleCode === 'accountant' ||
                  business.permissions?.roleCode === 'analyser' ||
                  business.permissions?.roleCode === 'admin',
              )
        }
      />
      <main className={`app-content${inactive ? ' company-inactive' : ''}`}>
        {inactive ? (
          <div className="company-inactive-note" role="status">
            {t('desktop.company_inactive_alert', { company: business.company.name })}
          </div>
        ) : null}
        {error ? <div className="alert-error">{error}</div> : null}
        {accountsLocked && !isCompanySetupPath(location.pathname, companyId) ? (
          <Navigate to={`/business/${companyId}`} replace />
        ) : (
        <Outlet
          context={{
            business,
            accountsLocked,
            setBusiness,
            reloadBusiness: async () => {
              if (!token || !companyId) return
              const data = await fetchBusiness(token, companyId, { force: true })
              const validUpTo = data.valid_up_to ?? data.company.valid_up_to ?? null
              const isActive =
                typeof data.is_active === 'boolean'
                  ? data.is_active
                  : isCompanyValidOnDate(validUpTo ?? cachedValidUpTo)
              const normalized: BusinessShowData = { ...data, is_active: isActive }
              setBusiness(normalized)
              await setCompanyValidity(userKey, companyId, validUpTo)
            },
          }}
        />
        )}
      </main>
      <CompanyBottomBar companyId={String(business.company.company_id)} />
      <SidebarEdgeToggle />
    </div>
  )
}
