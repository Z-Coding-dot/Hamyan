import { Children, createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, useNavigate, useParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { CompanyLogoThumb } from '@/components/CompanyLogoThumb'
import { Modal } from '@/components/ui/Modal'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { useWorkspaceSwitch } from '@/hooks/useWorkspaceSwitch'
import { companyNavScope, isSalesFocusedNavScope, type CompanyNavScope } from '@/lib/companyRoles'
import { prefetchCachedAssets } from '@/lib/mediaCache'
import type { BusinessCompany, CompanyRow } from '@/lib/user'
import { useAppCacheStore } from '@/store/useAppCacheStore'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type Props = {
  company: BusinessCompany
  isActive: boolean
  roleCode?: string | null
  isOwner?: boolean
  canViewActivityLogs?: boolean
  canViewStaff?: boolean
  canViewBusinessSettings?: boolean
  canViewTransactions?: boolean
  canViewReports?: boolean
  canViewSales?: boolean
  canCreateSales?: boolean
  canViewExpenses?: boolean
  canViewCustomers?: boolean
  canViewVendors?: boolean
  canViewInventory?: boolean
  canManageInventory?: boolean
  canViewAccounts?: boolean
  modulesLocked?: boolean
}

const ModulesLockContext = createContext(false)

type SidebarTabProps = {
  to: string
  icon: string
  label: string
  end?: boolean
  createAction?: boolean
  hiddenWhenInactive?: boolean
  inactive?: boolean
  accent?: 'help'
  fullWidth?: boolean
  onNavigate?: () => void
  lockExempt?: boolean
}

function SidebarTab({
  to,
  icon,
  label,
  end,
  createAction,
  hiddenWhenInactive,
  inactive,
  accent,
  fullWidth,
  onNavigate,
  lockExempt,
}: SidebarTabProps) {
  const locked = useContext(ModulesLockContext) && !lockExempt
  if (inactive && (createAction || hiddenWhenInactive)) {
    return null
  }

  if (locked) {
    return (
      <div className={`tab is-disabled${createAction ? ' action-create' : ''}${fullWidth ? ' tab--full' : ''}`}>
        <div className="tab-a" aria-disabled="true">
          <div className="tab-icon">
            <i className={`fa-solid ${icon}`} />
          </div>
          <div className="tab-text">{label}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`tab${createAction ? ' action-create' : ''}${fullWidth ? ' tab--full' : ''}`}>
      <NavLink
        to={to}
        end={end}
        className={`sidebar-tab-link${accent ? ` sidebar-tab--${accent}` : ''}`}
        onClick={onNavigate}
      >
        {({ isActive }) => (
          <div className={`tab-a${isActive ? ' active' : ''}`}>
            <div className="tab-icon">
              <i className={`fa-solid ${icon}`} />
            </div>
            <div className="tab-text">{label}</div>
          </div>
        )}
      </NavLink>
    </div>
  )
}

function SidebarActionButton({
  icon,
  label,
  onClick,
}: {
  icon: string
  label: string
  onClick: () => void
}) {
  const locked = useContext(ModulesLockContext)
  return (
    <div className={`tab${locked ? ' is-disabled' : ''}`}>
      <button type="button" className="sidebar-tab-button" onClick={onClick} disabled={locked}>
        <div className="tab-a">
          <div className="tab-icon">
            <i className={`fa-solid ${icon}`} />
          </div>
          <div className="tab-text">{label}</div>
        </div>
      </button>
    </div>
  )
}

function SidebarSection({
  id,
  icon,
  label,
  open,
  onToggle,
  children,
}: {
  id: string
  icon: string
  label: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  const items = Children.toArray(children).filter(Boolean)
  if (items.length === 0) return null

  return (
    <div className={`sidebar-section${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="sidebar-section-toggle"
        aria-expanded={open}
        aria-controls={`sidebar-section-${id}`}
        onClick={onToggle}
      >
        <span className="sidebar-section-toggle__icon">
          <i className={`fa-solid ${icon}`} />
        </span>
        <span className="sidebar-section-toggle__label">{label}</span>
        <i className="fa-solid fa-angle-down sidebar-caret-icon" aria-hidden />
      </button>
      <div
        id={`sidebar-section-${id}`}
        className={`sidebar-collapse${open ? ' is-open' : ''}`}
        aria-hidden={!open}
        inert={!open ? true : undefined}
      >
        <div className="sidebar-collapse__inner">
          <div className="sidebar-section-body company-side-grid">{children}</div>
        </div>
      </div>
    </div>
  )
}

export function CompanySidebar({
  company,
  isActive,
  roleCode = null,
  isOwner = false,
  canViewActivityLogs = false,
  canViewStaff = false,
  canViewBusinessSettings = false,
  canViewTransactions = false,
  canViewReports = false,
  canViewSales = false,
  canCreateSales = false,
  canViewExpenses = false,
  canViewCustomers = false,
  canViewVendors = false,
  canViewInventory = false,
  canManageInventory = false,
  canViewAccounts = false,
  modulesLocked = false,
}: Props) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId: routeCompanyId = '' } = useParams()
  const companyId = String(company.company_id || routeCompanyId)
  const { switchToUser, switchToCompany } = useWorkspaceSwitch()
  const userKey = useUserCacheKey()

  const { token, logout, isLoading } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      logout: state.logout,
      isLoading: state.isLoading,
    })),
  )

  const cachedCompanies = useAppCacheStore((state) => state.getCompanies(userKey))
  const refreshCompanies = useAppCacheStore((state) => state.refreshCompanies)

  const [companies, setCompanies] = useState<CompanyRow[]>(cachedCompanies ?? [])
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [comingSoon, setComingSoon] = useState<'partners' | null>(null)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({})

  const logoUrl = useCachedAsset(company.logo)
  const isStore = company.is_store !== false
  const isProduction = company.is_production === true
  const inactive = !isActive
  const navScope: CompanyNavScope = companyNavScope(roleCode, isOwner)
  const salesFocused = isSalesFocusedNavScope(navScope)

  const showSalesNav = canViewSales && (navScope === 'full' || navScope === 'sales_only' || navScope === 'sales_and_purchase')
  const showPurchaseNav =
    canViewInventory && (navScope === 'full' || navScope === 'sales_and_purchase')
  const showTradeSection = isStore && (showSalesNav || showPurchaseNav)

  const showExpensesNav = canViewExpenses && !salesFocused
  const showReportsNav = canViewReports && !salesFocused
  const showCustomersNav = canViewCustomers && !salesFocused
  const showVendorsNav = canViewVendors && !salesFocused
  const showStaffNav = canViewStaff && !salesFocused
  const showPeopleNav = showCustomersNav || showVendorsNav || showStaffNav
  const showInventoryNav = canViewInventory && !salesFocused && isStore
  const showPackagesNav = company.is_service === true && canViewSales
  const showAccountsNav = canViewAccounts && !salesFocused
  const showSubscriptionNav = (isOwner || canViewBusinessSettings) && !salesFocused
  const showActivityLogsNav = canViewActivityLogs && !salesFocused
  const showBusinessSettingsNav = canViewBusinessSettings && !salesFocused

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  useEffect(() => {
    setOpenSections({})
  }, [companyId])

  useEffect(() => {
    if (cachedCompanies) {
      setCompanies(cachedCompanies)
      prefetchCachedAssets(cachedCompanies.map((row) => row.logo))
    }
  }, [cachedCompanies])

  useEffect(() => {
    if (!token) return
    void refreshCompanies(token, userKey).then((data) => {
      if (data) {
        setCompanies(data)
        prefetchCachedAssets(data.map((row) => row.logo))
      }
    })
  }, [token, userKey, refreshCompanies])

  useEffect(() => {
    prefetchCachedAssets([company.logo])
  }, [company.logo])

  return (
    <aside className={`sidebar sidebar--desktop sidebar--company${inactive ? ' company-inactive' : ''}`}>
      <div className={`side-profile-dropdown${switcherOpen ? ' is-open' : ''}`}>
      <div className="side-profile-link side-profile-switcher">
        <button
          type="button"
          className="side-profile-main"
          onClick={() => void switchToCompany(companyId)}
        >
          <div className="side-profile-logo">
            {logoUrl ? (
              <img src={logoUrl} alt={company.name} />
            ) : (
              <i className="fa-solid fa-building" />
            )}
          </div>
          <div className="side-profile-name">
            <h5>{company.name}</h5>
            <small className="text-muted">
              {companies.length > 0
                ? t('desktop.sidebar_business_count', { count: companies.length })
                : t('desktop.company')}
              {inactive ? ` · ${t('desktop.inactive')}` : ''}
            </small>
          </div>
        </button>
        <button
          type="button"
          className="side-profile-caret"
          onClick={() => setSwitcherOpen((prev) => !prev)}
          aria-expanded={switcherOpen}
          aria-label={t('desktop.sidebar_switch_account')}
        >
          <i className="fa-solid fa-angle-down sidebar-caret-icon" />
        </button>
      </div>

      <div
        className={`sidebar-collapse${switcherOpen ? ' is-open' : ''}`}
        aria-hidden={!switcherOpen}
        inert={!switcherOpen ? true : undefined}
      >
        <div className="sidebar-collapse__inner">
        <div className="side-account-switcher">
          <button
            type="button"
            className="side-switcher-item"
            onClick={() => {
              setSwitcherOpen(false)
              void switchToUser()
            }}
          >
            <i className="fa-solid fa-user" />
            <span>
              {t('desktop.nav_dashboard')} {t('desktop.sidebar_user_suffix')}
            </span>
          </button>

          <NavLink
            to={businessPath(companyId, 'profile')}
            className="side-switcher-item"
            onClick={() => setSwitcherOpen(false)}
          >
            <i className="fa-solid fa-id-badge" />
            <span>{t('desktop.nav_profile')}</span>
          </NavLink>

          {showSubscriptionNav ? (
          <NavLink
            to={businessPath(companyId, 'subscription')}
            className="side-switcher-item"
            onClick={() => setSwitcherOpen(false)}
          >
            <i className="fa-solid fa-calendar-check" />
            <span>{t('desktop.company_subscription_page_title')}</span>
          </NavLink>
          ) : null}

          {companies.map((item) => {
            const id = String(item.company_id)
            const active = id === companyId
            return (
              <button
                key={id}
                type="button"
                className={`side-switcher-item${active ? ' active' : ''}`}
                onClick={() => {
                  setSwitcherOpen(false)
                  void switchToCompany(id)
                }}
              >
                <CompanyLogoThumb logo={item.logo} name={item.name} />
                <span>{item.name}</span>
              </button>
            )
          })}
        </div>
        </div>
      </div>
      </div>

      <ModulesLockContext.Provider value={modulesLocked}>
      <SidebarTab
        to={businessPath(companyId)}
        icon="fa-gauge-high"
        label={t('desktop.nav_dashboard')}
        end
        fullWidth
        lockExempt
      />

      {showTradeSection ? (
      <SidebarSection
        id="trade"
        icon="fa-cart-shopping"
        label={t('desktop.sidebar_group_trade')}
        open={Boolean(openSections.trade)}
        onToggle={() => toggleSection('trade')}
      >
        {showSalesNav ? (
          <>
            {canCreateSales ? (
              <SidebarTab
                to={businessPath(companyId, 'sale')}
                icon="fa-cart-plus"
                label={`${t('desktop.insert')} ${t('desktop.sale')}`}
                createAction
                inactive={inactive}
              />
            ) : null}
            {canCreateSales ? (
              <SidebarTab
                to={businessPath(companyId, 'easy-sale')}
                icon="fa-bolt"
                label={t('desktop.easy_sale')}
                createAction
                inactive={inactive}
              />
            ) : null}
            <SidebarTab
              to={businessPath(companyId, 'sales')}
              icon="fa-cart-shopping"
              label={t('desktop.sales')}
            />
          </>
        ) : null}
        {showPurchaseNav ? (
          <>
            {canManageInventory ? (
              <SidebarTab
                to={businessPath(companyId, 'purchase')}
                icon="fa-plus"
                label={`${t('desktop.insert')} ${t('desktop.purchase')}`}
                createAction
                inactive={inactive}
              />
            ) : null}
            <SidebarTab
              to={businessPath(companyId, 'purchases')}
              icon="fa-basket-shopping"
              label={t('desktop.purchases')}
            />
          </>
        ) : null}
      </SidebarSection>
      ) : null}

      {showExpensesNav ? (
      <SidebarSection
        id="expenses"
        icon="fa-coins"
        label={t('desktop.sidebar_group_expenses')}
        open={Boolean(openSections.expenses)}
        onToggle={() => toggleSection('expenses')}
      >
        <SidebarTab to={businessPath(companyId, 'expenses')} icon="fa-coins" label={t('desktop.expenses')} />
      </SidebarSection>
      ) : null}

      {showReportsNav ? (
      <SidebarSection
        id="reports"
        icon="fa-chart-column"
        label={t('desktop.sidebar_group_reports')}
        open={Boolean(openSections.reports)}
        onToggle={() => toggleSection('reports')}
      >
        {canViewTransactions ? (
          <SidebarTab
            to={businessPath(companyId, 'journal')}
            icon="fa-book"
            label={t('desktop.journal')}
          />
        ) : null}
        {isStore && canViewSales ? (
          <>
            <SidebarTab
              to={businessPath(companyId, 'sales-daily-report')}
              icon="fa-calendar-day"
              label={t('desktop.daily_sales_report')}
            />
            <SidebarTab
              to={businessPath(companyId, 'sales-profit-report')}
              icon="fa-chart-line"
              label={t('desktop.profit_report')}
            />
            <SidebarTab
              to={businessPath(companyId, 'sales-profit-loss-report')}
              icon="fa-scale-balanced"
              label={t('desktop.profit_loss_report')}
            />
          </>
        ) : null}
      </SidebarSection>
      ) : null}

      {showPeopleNav ? (
      <SidebarSection
        id="people"
        icon="fa-users"
        label={t('desktop.sidebar_group_people')}
        open={Boolean(openSections.people)}
        onToggle={() => toggleSection('people')}
      >
        {showCustomersNav ? (
          <SidebarTab to={businessPath(companyId, 'customers')} icon="fa-users" label={t('desktop.customers')} />
        ) : null}
        {showVendorsNav ? (
          <SidebarTab to={businessPath(companyId, 'vendors')} icon="fa-truck" label={t('desktop.vendors')} />
        ) : null}
        {showStaffNav ? (
          <SidebarTab to={businessPath(companyId, 'staff')} icon="fa-user-tie" label={t('desktop.staff')} />
        ) : null}
        {showCustomersNav || showVendorsNav ? (
          <SidebarActionButton
            icon="fa-handshake"
            label={t('desktop.partners')}
            onClick={() => setComingSoon('partners')}
          />
        ) : null}
      </SidebarSection>
      ) : null}

      {showPackagesNav ? (
      <SidebarSection
        id="packages"
        icon="fa-tower-broadcast"
        label={t('desktop.packages')}
        open={Boolean(openSections.packages)}
        onToggle={() => toggleSection('packages')}
      >
        <SidebarTab
          to={businessPath(companyId, 'packages')}
          icon="fa-wifi"
          label={t('desktop.packages')}
        />
        <SidebarTab
          to={businessPath(companyId, 'package-sale')}
          icon="fa-cart-plus"
          label={t('desktop.sell_package')}
        />
        <SidebarTab
          to={businessPath(companyId, 'customer-packages')}
          icon="fa-user-tag"
          label={t('desktop.customer_packages')}
        />
      </SidebarSection>
      ) : null}

      {showInventoryNav ? (
      <SidebarSection
        id="inventory"
        icon="fa-box-open"
        label={t('desktop.sidebar_group_inventory')}
        open={Boolean(openSections.inventory)}
        onToggle={() => toggleSection('inventory')}
      >
        <SidebarTab
          to={businessPath(companyId, 'items')}
          icon="fa-list-check"
          label={t('desktop.items_products')}
        />
        <SidebarTab
          to={businessPath(companyId, 'item-categories')}
          icon="fa-tags"
          label={t('desktop.item_categories')}
        />
        {isProduction ? (
          <>
            <SidebarTab
              to={businessPath(companyId, 'raw-materials')}
              icon="fa-flask"
              label={t('desktop.raw_materials')}
            />
            <SidebarTab
              to={businessPath(companyId, 'productions')}
              icon="fa-industry"
              label={t('desktop.productions')}
            />
          </>
        ) : null}
      </SidebarSection>
      ) : null}

      {showAccountsNav ? (
      <SidebarSection
        id="accounts"
        icon="fa-vault"
        label={t('desktop.sidebar_group_accounts')}
        open={modulesLocked || Boolean(openSections.accounts)}
        onToggle={() => toggleSection('accounts')}
      >
        <SidebarTab
          to={businessPath(companyId, 'accounts')}
          icon="fa-vault"
          label={t('desktop.company_accounts')}
          end
          lockExempt
        />
        <SidebarTab
          to={businessPath(companyId, 'accounts/transfers')}
          icon="fa-right-left"
          label={t('desktop.account_transfers')}
        />
      </SidebarSection>
      ) : null}

      {showSubscriptionNav ? (
      <SidebarTab
        to={businessPath(companyId, 'subscription')}
        icon="fa-calendar-check"
        label={t('desktop.company_subscription_page_title')}
        fullWidth
      />
      ) : null}

      <SidebarSection
        id="settings"
        icon="fa-gears"
        label={t('desktop.nav_settings')}
        open={Boolean(openSections.settings)}
        onToggle={() => toggleSection('settings')}
      >
        {showActivityLogsNav ? (
          <SidebarTab
            to={businessPath(companyId, 'activity-logs')}
            icon="fa-clock-rotate-left"
            label={t('desktop.activity_logs')}
          />
        ) : null}
        {showBusinessSettingsNav ? (
          <SidebarTab
            to={businessPath(companyId, 'settings')}
            icon="fa-gears"
            label={`${t('desktop.nav_settings')} ${t('desktop.business')}`}
          />
        ) : null}
        <SidebarActionButton
          icon="fa-gears"
          label={t('desktop.nav_settings')}
          onClick={() => navigate('/settings')}
        />
      </SidebarSection>

      <SidebarTab
        to="/help"
        icon="fa-circle-info"
        label={t('desktop.help_center')}
        accent="help"
        fullWidth
        lockExempt
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

      <Modal
        open={comingSoon !== null}
        onClose={() => setComingSoon(null)}
        title={comingSoon === 'partners' ? t('desktop.partners') : undefined}
      >
        <p className="muted" style={{ margin: 0, textAlign: 'center', fontSize: '1.05rem' }}>
          {t('desktop.coming_soon')}
        </p>
        <div className="form-actions" style={{ marginTop: 16, justifyContent: 'center' }}>
          <button type="button" className="btn-secondary" onClick={() => setComingSoon(null)}>
            {t('desktop.close')}
          </button>
        </div>
      </Modal>
      </ModulesLockContext.Provider>
    </aside>
  )
}
