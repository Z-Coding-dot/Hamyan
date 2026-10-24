import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { localizeCurrency } from '@/lib/currency'

import { BrandLogo } from '@/components/BrandLogo'
import { openIlgarMessenger } from '@/lib/ilgar'
import { Modal } from '@/components/ui/Modal'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { ItemPriceSearchModal } from '@/pages/company/ItemPriceSearchModal'
import { AddBusinessExpenseModal } from '@/pages/company/AddBusinessExpenseModal'
import { StaffAbsenceModal } from '@/pages/company/staff/StaffAbsenceModal'
import { getApiErrorMessage } from '@/lib/auth'
import { companyNavScope, isSalesFocusedNavScope } from '@/lib/companyRoles'
import {
  createQuickSale,
  exchangePairFromAccounts,
  fetchBusinessStaff,
  parseExchangeRateContextFromError,
  type BusinessStaffRow,
  type QuickSaleExchangeRateContext,
} from '@/lib/business'
import {
  currenciesText,
  formatMoney,
  isCreditTransaction,
  translateTransactionLabel,
} from '@/lib/companyDashboard'
import { formatAfghanDateValue } from '@/lib/datetime'
import type {
  BusinessAccountRow,
  BusinessDashboardDetails,
  BusinessDashboardPayload,
  BusinessDashboardTransaction,
  BusinessShowData,
  BusinessTodayDetails,
  PublicExchangeRateRow,
} from '@/lib/user'
import { isBusinessAccountActive } from '@/lib/user'
import { useAppCacheStore } from '@/store/useAppCacheStore'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import {
  hydrateListsCache,
  scheduleBusinessDashboardRefresh,
  useListsCacheStore,
} from '@/store/useListsCacheStore'

function formatRate(value: number | string | null | undefined): string {
  const amount = Number(value)
  if (!Number.isFinite(amount)) return '—'
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 4,
  })
}

function CompanyDashboardExchangeRates({
  rates,
  ratesLoading,
  hasCached,
  className,
}: {
  rates: PublicExchangeRateRow[]
  ratesLoading: boolean
  hasCached: boolean
  className?: string
}) {
  const { t } = useTranslation()
  return (
    <section className={`dash-xrates company-dash-xrates${className ? ` ${className}` : ''}`}>
      <div className="dash-xrates__head">
        <h3>{t('desktop.latest_exchange_rates')}</h3>
        <Link to="/exchange-rates">{t('desktop.view_all_exchange_rates')}</Link>
      </div>
      {rates.length === 0 ? (
        <p className="muted">
          {ratesLoading && !hasCached ? t('desktop.loading') : t('desktop.exchange_no_data')}
        </p>
      ) : (
        <div className="dash-xrates__badges">
          {rates.map((rate) => {
            const fromCode = String(rate.currency_code || rate.currency || '').toUpperCase()
            const toCode = String(rate.to_currency_code || rate.to_currency || '').toUpperCase()
            const fromLabel = localizeCurrency(fromCode, t)
            const toLabel = localizeCurrency(toCode, t)
            const rateText = formatRate(rate.rate)
            const label = t('desktop.exchange_one_equals', {
              from: fromLabel,
              rate: rateText,
              to: toLabel,
            })
            return (
              <Link
                key={`${fromCode}-${toCode}-${rate.id}`}
                to={`/exchange-rates/${fromCode}/${toCode}`}
                className="dash-xrate-badge"
                title={label}
              >
                <span className="dash-xrate-badge__text">{label}</span>
              </Link>
            )
          })}
        </div>
      )}
    </section>
  )
}

type CompanyOutletContext = {
  business: BusinessShowData
  accountsLocked?: boolean
}

function isExchangeRateRequired(err: unknown): boolean {
  if (!(err instanceof AxiosError) || err.response?.status !== 422) return false
  const data = err.response.data as
    | { message?: string; errors?: Record<string, string[] | undefined> }
    | undefined
  if (data?.errors?.exchange_rate?.length) return true
  const msg = String(data?.message || '')
  return /exchange|تبادل|نرخ/i.test(msg)
}

type DashCardProps = {
  title: string
  value: string | number | null | undefined
  icon: string
  className?: string
  to?: string
  loading?: boolean
}

function DashboardCard({ title, value, icon, className = '', to, loading = false }: DashCardProps) {
  const inner = (
    <div className={`dashboard-card ${className}${loading ? ' is-data-loading' : ''}`}>
      <div className="dashboard-card-icon" aria-hidden="true">
        <i className={`fa-solid ${icon}`} />
      </div>
      <div className="dashboard-card-body">
        <div className="dashboard-card-title">
          <h5>{title}</h5>
        </div>
        <div className="dashboard-card-number">
          {loading ? (
            <span className="dashboard-card-data-loader" aria-hidden="true">
              <i className="fa-solid fa-spinner fa-spin" />
            </span>
          ) : (
            (value ?? 0)
          )}
        </div>
      </div>
    </div>
  )
  if (!to) return inner
  return (
    <Link to={to} className="dash-card-link">
      {inner}
    </Link>
  )
}

const EMPTY_TODAY: BusinessTodayDetails = {
  cash_in_by_currency: {},
  cash_out_by_currency: {},
  sales_by_currency: {},
  deposits_by_currency: {},
  withdrawals_by_currency: {},
  expenses_by_currency: {},
  receivables_by_currency: {},
  payables_by_currency: {},
}

const EMPTY_DASHBOARD: BusinessDashboardDetails = {
  cash_in_by_currency: {},
  cash_out_by_currency: {},
  sales_by_currency: {},
  deposits_by_currency: {},
  withdrawals_by_currency: {},
  expenses_by_currency: {},
  receivables_by_currency: {},
  payables_by_currency: {},
  staff: 0,
  customers: 0,
  vendors: 0,
  inventory_alerts: { out_of_stock: 0, low_stock: 0 },
  customer_payables_by_currency: {},
  vendor_payables_by_currency: {},
}

export function CompanyDashboardPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { business, accountsLocked = false } = useOutletContext<CompanyOutletContext>()
  const company = business.company
  const companyId = String(company.company_id)
  const isStore = company.is_store !== false
  const perms = business.permissions ?? {}
  const navScope = companyNavScope(
    typeof perms.roleCode === 'string' ? perms.roleCode : null,
    Boolean(perms.isOwner),
  )
  const salesFocused = isSalesFocusedNavScope(navScope)
  const canViewAccounts = Boolean(perms.canViewAccounts) && !salesFocused
  const canViewTransactions = Boolean(perms.canViewTransactions) && !salesFocused
  const canViewSales = Boolean(perms.canViewSales)
  const canCreateSales = Boolean(perms.canCreateSales) && business.is_active && isStore
  const canSellPackage = Boolean(perms.canCreateSales) && business.is_active && company.is_service === true
  const canViewExpenses = Boolean(perms.canViewExpenses) && !salesFocused
  const canViewReceivables = Boolean(perms.canViewReceivables) && !salesFocused
  const canViewPayables = Boolean(perms.canViewPayables) && !salesFocused
  const canViewCustomers = Boolean(perms.canViewCustomers) && !salesFocused
  const canViewVendors = Boolean(perms.canViewVendors) && !salesFocused
  const canViewStaff = Boolean(perms.canViewStaff) && !salesFocused
  const canViewInventory = Boolean(perms.canViewInventory) && !salesFocused
  const canAddExpense = Boolean(perms.canManageExpenses) && business.is_active && !salesFocused
  const canAddAbsence = Boolean(perms.canManageStaff) && business.is_active && !salesFocused
  const canSearchItemPrice = !salesFocused && (Boolean(perms.canViewInventory) || canViewSales)
  const showDashTools =
    canCreateSales || canSellPackage || canSearchItemPrice || canAddExpense || canAddAbsence
  const canViewCashFlow =
    canViewTransactions || canViewAccounts || canViewSales || canViewExpenses
  const hasTodaySection =
    canViewCashFlow || canViewSales || canViewReceivables || canViewPayables
  const hasMonthSection = hasTodaySection
  const hasOtherSection =
    canViewCustomers || canViewVendors || canViewStaff || canViewInventory
  const token = useAuthStore(useShallow((state) => state.token))
  const userKey = useUserCacheKey()
  const ensureExchangeRates = useAppCacheStore((state) => state.ensureExchangeRates)
  const cachedRates = useAppCacheStore((state) => state.getExchangeRates(userKey))
  const ensureDashboard = useListsCacheStore((state) => state.ensureDashboard)
  const ensureAccounts = useListsCacheStore((state) => state.ensureAccounts)
  const refreshDashboard = useListsCacheStore((state) => state.refreshDashboard)
  const refreshAccounts = useListsCacheStore((state) => state.refreshAccounts)
  const cachedDashboard = useListsCacheStore((state) =>
    companyId ? state.getDashboard(userKey, companyId) : null,
  )
  const cachedAccounts = useListsCacheStore((state) =>
    companyId ? state.getAccounts(userKey, companyId) : null,
  )

  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const applyDashboard = (payload: BusinessDashboardPayload) => {
    setDashboardDetails({
      ...EMPTY_DASHBOARD,
      ...(payload.dashboardDetails ?? {}),
    })
    setTodayDetails({
      ...EMPTY_TODAY,
      ...(payload.todayDetails ?? {}),
    })
    setTransactions(Array.isArray(payload.transactions) ? payload.transactions : [])
  }

  const [accountsLoading, setAccountsLoading] = useState(
    () => canViewAccounts && !cachedAccounts,
  )
  const [detailsLoading, setDetailsLoading] = useState(() => !cachedDashboard)
  const [accounts, setAccounts] = useState<BusinessAccountRow[]>(() => cachedAccounts ?? [])
  const [dashboardDetails, setDashboardDetails] = useState<BusinessDashboardDetails>(
    () => cachedDashboard?.dashboardDetails ?? EMPTY_DASHBOARD,
  )
  const [quickCreating, setQuickCreating] = useState(false)
  const [rateModalOpen, setRateModalOpen] = useState(false)
  const [exchangeRate, setExchangeRate] = useState('1')
  const [rateError, setRateError] = useState<string | null>(null)
  const [quickError, setQuickError] = useState<string | null>(null)
  const [ratePair, setRatePair] = useState<QuickSaleExchangeRateContext | null>(null)
  const [todayDetails, setTodayDetails] = useState<BusinessTodayDetails>(
    () => cachedDashboard?.todayDetails ?? EMPTY_TODAY,
  )
  const [transactions, setTransactions] = useState<BusinessDashboardTransaction[]>(
    () => cachedDashboard?.transactions ?? [],
  )
  const [rates, setRates] = useState<PublicExchangeRateRow[]>(cachedRates ?? [])
  const [ratesLoading, setRatesLoading] = useState(!cachedRates)
  const [priceSearchOpen, setPriceSearchOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [absenceOpen, setAbsenceOpen] = useState(false)
  const [staffRows, setStaffRows] = useState<BusinessStaffRow[]>([])
  const [toolsOpen, setToolsOpen] = useState(false)

  useEffect(() => {
    if (!toolsOpen) return
    const timer = window.setTimeout(() => setToolsOpen(false), 5000)
    return () => window.clearTimeout(timer)
  }, [toolsOpen])

  useEffect(() => {
    if (!toolsOpen || !canAddAbsence || !token) return
    void fetchBusinessStaff(token, companyId).then(setStaffRows).catch(() => setStaffRows([]))
  }, [toolsOpen, canAddAbsence, token, companyId])

  useEffect(() => {
    if (cachedRates) setRates(cachedRates)
  }, [cachedRates])

  useEffect(() => {
    if (cachedDashboard) applyDashboard(cachedDashboard)
  }, [cachedDashboard])

  useEffect(() => {
    if (cachedAccounts) setAccounts(cachedAccounts)
  }, [cachedAccounts])

  useEffect(() => {
    if (!token) return
    let active = true
    const hasCached = Boolean(useAppCacheStore.getState().getExchangeRates(userKey))
    if (!hasCached) setRatesLoading(true)
    void ensureExchangeRates(token, userKey)
      .then((rows) => {
        if (active && rows) setRates(rows)
      })
      .catch(() => {
        if (active && !hasCached) setRates([])
      })
      .finally(() => {
        if (active) setRatesLoading(false)
      })
    return () => {
      active = false
    }
  }, [token, userKey, ensureExchangeRates])

  useEffect(() => {
    let active = true
    void hydrateListsCache(userKey).then(() => {
      if (!active) return
      const dash = useListsCacheStore.getState().getDashboard(userKey, companyId)
      const acc = useListsCacheStore.getState().getAccounts(userKey, companyId)
      if (dash) {
        applyDashboard(dash)
        setDetailsLoading(false)
      }
      if (acc) {
        setAccounts(acc)
        setAccountsLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [userKey, companyId])

  useEffect(() => {
    if (!token || !companyId) return
    let active = true

    const hasDashCache = Boolean(
      useListsCacheStore.getState().getDashboard(userKey, companyId),
    )
    const hasAccCache = Boolean(
      useListsCacheStore.getState().getAccounts(userKey, companyId),
    )

    if (!hasDashCache) setDetailsLoading(true)
    if (canViewAccounts && !hasAccCache) setAccountsLoading(true)

    if (canViewAccounts) {
      void ensureAccounts(token, userKey, companyId)
        .then((rows) => {
          if (active && rows) setAccounts(rows)
        })
        .finally(() => {
          if (active) setAccountsLoading(false)
        })
    } else {
      setAccounts([])
      setAccountsLoading(false)
    }

    // Prefer daily local cache — only hits the network when stale/missing.
    // Force refresh once if cache still has the old shape (missing cash split fields).
    const cachedDash = useListsCacheStore.getState().getDashboard(userKey, companyId)
    const needsDashboardShapeRefresh = Boolean(
      cachedDash &&
        (cachedDash.todayDetails?.cash_in_by_currency === undefined ||
          cachedDash.todayDetails?.deposits_by_currency === undefined ||
          cachedDash.todayDetails?.withdrawals_by_currency === undefined ||
          cachedDash.dashboardDetails?.cash_in_by_currency === undefined ||
          cachedDash.dashboardDetails?.deposits_by_currency === undefined ||
          cachedDash.dashboardDetails?.withdrawals_by_currency === undefined ||
          cachedDash.dashboardDetails?.receivables_by_currency === undefined ||
          cachedDash.dashboardDetails?.payables_by_currency === undefined),
    )
    void ensureDashboard(token, userKey, companyId, { force: needsDashboardShapeRefresh })
      .then((payload) => {
        if (!active || !payload) return
        applyDashboard(payload)
      })
      .finally(() => {
        if (active) setDetailsLoading(false)
      })

    return () => {
      active = false
    }
  }, [token, companyId, canViewAccounts, userKey, ensureDashboard, ensureAccounts])

  const labelCurrency = (currency: string) => localizeCurrency(currency, t)
  const todayCashInText = useMemo(
    () => currenciesText(todayDetails?.cash_in_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayDetails, i18n.language],
  )
  const todayCashOutText = useMemo(
    () => currenciesText(todayDetails?.cash_out_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayDetails, i18n.language],
  )
  const todaySalesText = useMemo(
    () => currenciesText(todayDetails?.sales_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayDetails, i18n.language],
  )
  const todayDepositsText = useMemo(
    () => currenciesText(todayDetails?.deposits_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayDetails, i18n.language],
  )
  const todayWithdrawalsText = useMemo(
    () => currenciesText(todayDetails?.withdrawals_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayDetails, i18n.language],
  )
  const todayReceivablesText = useMemo(
    () => currenciesText(todayDetails?.receivables_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayDetails, i18n.language],
  )
  const todayPayablesText = useMemo(
    () => currenciesText(todayDetails?.payables_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [todayDetails, i18n.language],
  )
  const monthCashInText = useMemo(
    () => currenciesText(dashboardDetails?.cash_in_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dashboardDetails, i18n.language],
  )
  const monthCashOutText = useMemo(
    () => currenciesText(dashboardDetails?.cash_out_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dashboardDetails, i18n.language],
  )
  const monthSalesText = useMemo(
    () => currenciesText(dashboardDetails?.sales_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dashboardDetails, i18n.language],
  )
  const monthDepositsText = useMemo(
    () => currenciesText(dashboardDetails?.deposits_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dashboardDetails, i18n.language],
  )
  const monthWithdrawalsText = useMemo(
    () => currenciesText(dashboardDetails?.withdrawals_by_currency, labelCurrency),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dashboardDetails, i18n.language],
  )
  const customerOutstandingText = useMemo(
    () =>
      currenciesText(
        dashboardDetails?.receivables_by_currency ?? dashboardDetails?.customer_payables_by_currency,
        labelCurrency,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dashboardDetails, i18n.language],
  )
  const vendorOutstandingText = useMemo(
    () =>
      currenciesText(
        dashboardDetails?.payables_by_currency ?? dashboardDetails?.vendor_payables_by_currency,
        labelCurrency,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dashboardDetails, i18n.language],
  )

  const inventoryAlerts = dashboardDetails.inventory_alerts ?? null
  const salesLink = businessPath(companyId, 'sales')
  const saleLink = businessPath(companyId, 'sale')
  const easySaleLink = businessPath(companyId, 'easy-sale')
  const accountsPageLink = businessPath(companyId, 'accounts')
  const itemsPageLink = businessPath(companyId, 'items')
  const activeAccounts = useMemo(
    () => accounts.filter(isBusinessAccountActive),
    [accounts],
  )

  const closeQuickModal = () => {
    if (quickCreating) return
    setRateError(null)
    setRateModalOpen(false)
  }

  const rateLabel =
    ratePair?.from_currency && ratePair?.to_currency
      ? t('desktop.exchange_rate_pair', {
          from: localizeCurrency(ratePair.from_currency, t),
          to: localizeCurrency(ratePair.to_currency, t),
        })
      : t('desktop.exchange_rate')

  const resolveRatePair = (err?: unknown) => {
    const fromError = err ? parseExchangeRateContextFromError(err) : null
    if (fromError) {
      setRatePair(fromError)
      if (fromError.suggested_rate || fromError.rate) {
        setExchangeRate(String(fromError.suggested_rate || fromError.rate))
      }
      return
    }
    const fromAccounts = exchangePairFromAccounts(activeAccounts)
    if (fromAccounts) setRatePair(fromAccounts)
  }

  const startQuickSale = async (rate?: string) => {
    if (!token) return
    setQuickCreating(true)
    setQuickError(null)
    setRateError(null)
    try {
      const created = await createQuickSale(
        token,
        companyId,
        rate ? { exchange_rate: rate } : undefined,
      )
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      setRateModalOpen(false)
      navigate(businessPath(companyId, `sales/quick/${created.invoice_id ?? created.invoice.id}`))
    } catch (err) {
      if (!rate && isExchangeRateRequired(err)) {
        resolveRatePair(err)
        setRateModalOpen(true)
        setRateError(t('desktop.needs_exchange_rate'))
      } else if (rateModalOpen) {
        setRateError(getApiErrorMessage(err))
      } else {
        resolveRatePair(err)
        setQuickError(getApiErrorMessage(err))
        setRateModalOpen(true)
      }
    } finally {
      setQuickCreating(false)
    }
  }

  const submitRate = async (event: FormEvent) => {
    event.preventDefault()
    const rate = Number(exchangeRate)
    if (!(rate > 0)) {
      setRateError(t('desktop.needs_exchange_rate'))
      return
    }
    await startQuickSale(exchangeRate)
  }

  const refreshDashboardData = async () => {
    if (!token || detailsLoading || accountsLoading) return
    setDetailsLoading(true)
    if (canViewAccounts) setAccountsLoading(true)
    try {
      const tasks: Array<Promise<unknown>> = [refreshDashboard(token, userKey, companyId)]
      if (canViewAccounts) {
        tasks.push(refreshAccounts(token, userKey, companyId))
      }
      const [dashPayload, accountsPayload] = await Promise.all(tasks)
      if (dashPayload) applyDashboard(dashPayload as BusinessDashboardPayload)
      if (canViewAccounts && Array.isArray(accountsPayload)) {
        setAccounts(accountsPayload as BusinessAccountRow[])
      }
    } finally {
      setDetailsLoading(false)
      if (canViewAccounts) setAccountsLoading(false)
    }
  }

  return (
    <div className={`dash-div company-dashboard${accountsLocked ? ' is-accounts-locked' : ''}`} dir="rtl">
      <header className="dash-brand-hero">
        <div className="dash-brand-hero__brand">
          <BrandLogo variant="icon" size={48} className="dash-brand-hero__logo" />
          <div className="dash-brand-hero__text">
            <p className="dash-brand-hero__app">{t('desktop.app_name')}</p>
            <h1 className="dash-brand-hero__title">{t('desktop.company_dashboard')}</h1>
            <p className="dash-brand-hero__company">{company.name}</p>
          </div>
        </div>
        <div className="dash-brand-hero__meta">
          <button
            type="button"
            className="btn-secondary btn-sm"
            disabled={detailsLoading || accountsLoading}
            onClick={() => void refreshDashboardData()}
          >
            <i className={`fa-solid fa-rotate-left${detailsLoading || accountsLoading ? ' fa-spin' : ''}`} />{' '}
            {t('desktop.refresh')}
          </button>
        </div>
      </header>
      {accountsLocked ? (
        <div className="company-accounts-lock" role="status">
          {t('desktop.no_accounts_yet')}
        </div>
      ) : null}
      <div className={`company-dash-row${canViewTransactions ? '' : ' is-full'}`}>
        <div className="company-dash-main">
          {canViewAccounts ? (
            <div className="dashboard-cards dashboard-cards--accounts">
              <div className="dash-header dash-header--section">
                <h5>{t('desktop.company_accounts_cash_bank')}</h5>
                <Link to={accountsPageLink} className="dash-header__link">
                  {t('desktop.view_all')}
                </Link>
              </div>
              <div className="dashboard-cards__grid">
                {accountsLoading && activeAccounts.length === 0 ? (
                  <>
                    <DashboardCard
                      title={t('desktop.account')}
                      icon="fa-vault"
                      value={null}
                      className="dc-cash dashboard-card--account"
                      loading
                    />
                    <DashboardCard
                      title={t('desktop.account')}
                      icon="fa-building-columns"
                      value={null}
                      className="dc-sales dashboard-card--account"
                      loading
                    />
                    <DashboardCard
                      title={t('desktop.account')}
                      icon="fa-wallet"
                      value={null}
                      className="dc-expenses dashboard-card--account"
                      loading
                    />
                    <DashboardCard
                      title={t('desktop.account')}
                      icon="fa-vault"
                      value={null}
                      className="dc-cash dashboard-card--account"
                      loading
                    />
                  </>
                ) : activeAccounts.length === 0 ? (
                  <p className="muted">{t('desktop.no_accounts_yet')}</p>
                ) : (
                  activeAccounts.slice(0, 6).map((acc) => {
                    const typeText =
                      acc.type === 'cash'
                        ? t('desktop.cash')
                        : acc.type === 'bank'
                          ? t('desktop.bank')
                          : t('desktop.etc')
                    const flags = [
                      typeText,
                      acc.is_capital ? t('desktop.capital') : null,
                      acc.is_sell_account ? t('desktop.sell_account') : null,
                    ].filter(Boolean)
                    const cardCls =
                      acc.type === 'cash'
                        ? 'dc-cash'
                        : acc.type === 'bank'
                          ? 'dc-sales'
                          : 'dc-expenses'
                    const icon =
                      acc.type === 'cash'
                        ? 'fa-vault'
                        : acc.type === 'bank'
                          ? 'fa-building-columns'
                          : 'fa-wallet'
                    const title = acc.name || acc.template_name_fa || t('desktop.account')
                    const value = `${formatMoney(acc.balance || 0)} ${localizeCurrency(acc.currency, t)}  |  ${flags.join(' • ')}`
                    return (
                      <DashboardCard
                        key={acc.id}
                        title={title}
                        icon={icon}
                        value={value}
                        className={`${cardCls} dashboard-card--account`}
                        to={businessPath(companyId, `accounts/${acc.id}`)}
                        loading={accountsLoading}
                      />
                    )
                  })
                )}
              </div>
            </div>
          ) : null}

          {hasTodaySection ? (
            <div className="dashboard-cards">
              <div className="dash-header dash-header--section">
                <h5>{t('desktop.dash_today_details')}</h5>
              </div>
              <div className="dashboard-cards__grid">
                {canViewCashFlow ? (
                  <DashboardCard
                    title={t('desktop.credit_in')}
                    icon="fa-arrow-up"
                    value={todayCashInText}
                    className="dc-cash-in"
                    to={canViewAccounts ? businessPath(companyId, 'accounts') : undefined}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewCashFlow ? (
                  <DashboardCard
                    title={t('desktop.debit_out')}
                    icon="fa-arrow-down"
                    value={todayCashOutText}
                    className="dc-cash-out"
                    to={canViewAccounts ? businessPath(companyId, 'accounts') : undefined}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewSales ? (
                  <DashboardCard
                    title={t('desktop.sales')}
                    icon="fa-cart-shopping"
                    value={todaySalesText}
                    className="dc-sales"
                    to={salesLink}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewCashFlow ? (
                  <DashboardCard
                    title={t('desktop.cash_deposits')}
                    icon="fa-circle-plus"
                    value={todayDepositsText}
                    className="dc-deposits"
                    to={canViewAccounts ? businessPath(companyId, 'accounts') : undefined}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewCashFlow ? (
                  <DashboardCard
                    title={t('desktop.cash_withdrawals')}
                    icon="fa-arrow-up-from-bracket"
                    value={todayWithdrawalsText}
                    className="dc-withdrawals"
                    to={canViewAccounts ? businessPath(companyId, 'accounts') : undefined}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewReceivables ? (
                  <DashboardCard
                    title={t('desktop.receivables')}
                    icon="fa-hand-holding-dollar"
                    value={todayReceivablesText}
                    className="dc-receivables"
                    to={`${businessPath(companyId, 'customers')}?fil=receivables`}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewPayables ? (
                  <DashboardCard
                    title={t('desktop.payables')}
                    icon="fa-file-invoice-dollar"
                    value={todayPayablesText}
                    className="dc-payables"
                    to={`${businessPath(companyId, 'vendors')}?fil=payables`}
                    loading={detailsLoading}
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          {hasMonthSection ? (
            <div className="dashboard-cards">
              <div className="dash-header dash-header--section">
                <h5>{t('desktop.dash_month_details')}</h5>
              </div>
              <div className="dashboard-cards__grid">
                {canViewCashFlow ? (
                  <DashboardCard
                    title={t('desktop.credit_in')}
                    icon="fa-arrow-up"
                    value={monthCashInText}
                    className="dc-cash-in"
                    to={canViewAccounts ? businessPath(companyId, 'accounts') : undefined}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewCashFlow ? (
                  <DashboardCard
                    title={t('desktop.debit_out')}
                    icon="fa-arrow-down"
                    value={monthCashOutText}
                    className="dc-cash-out"
                    to={canViewAccounts ? businessPath(companyId, 'accounts') : undefined}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewSales ? (
                  <DashboardCard
                    title={t('desktop.sales')}
                    icon="fa-cart-shopping"
                    value={monthSalesText}
                    className="dc-sales"
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewCashFlow ? (
                  <DashboardCard
                    title={t('desktop.cash_deposits')}
                    icon="fa-circle-plus"
                    value={monthDepositsText}
                    className="dc-deposits"
                    to={canViewAccounts ? businessPath(companyId, 'accounts') : undefined}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewCashFlow ? (
                  <DashboardCard
                    title={t('desktop.cash_withdrawals')}
                    icon="fa-arrow-up-from-bracket"
                    value={monthWithdrawalsText}
                    className="dc-withdrawals"
                    to={canViewAccounts ? businessPath(companyId, 'accounts') : undefined}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewReceivables ? (
                  <DashboardCard
                    title={t('desktop.receivables')}
                    icon="fa-hand-holding-dollar"
                    value={customerOutstandingText}
                    className="dc-receivables"
                    to={`${businessPath(companyId, 'customers')}?fil=receivables`}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewPayables ? (
                  <DashboardCard
                    title={t('desktop.payables')}
                    icon="fa-file-invoice-dollar"
                    value={vendorOutstandingText}
                    className="dc-payables"
                    to={`${businessPath(companyId, 'vendors')}?fil=payables`}
                    loading={detailsLoading}
                  />
                ) : null}
              </div>
            </div>
          ) : null}

          {hasOtherSection ? (
            <div className="dashboard-cards">
              <div className="dash-header dash-header--section">
                <h5>{t('desktop.dash_other_details')}</h5>
              </div>
              <div className="dashboard-cards__grid">
                {canViewInventory ? (
                  <>
                    <DashboardCard
                      title={t('desktop.out_of_stock_items')}
                      icon="fa-boxes-stacked"
                      value={`${formatMoney(inventoryAlerts?.out_of_stock ?? 0)} ${t('desktop.items')}`}
                      className="dc-payables"
                      to={itemsPageLink}
                      loading={detailsLoading}
                    />
                    <DashboardCard
                      title={t('desktop.low_stock_items')}
                      icon="fa-triangle-exclamation"
                      value={`${formatMoney(inventoryAlerts?.low_stock ?? 0)} ${t('desktop.items')}`}
                      className="dc-expenses"
                      to={itemsPageLink}
                      loading={detailsLoading}
                    />
                  </>
                ) : null}
                {canViewCustomers ? (
                  <DashboardCard
                    title={t('desktop.customers')}
                    icon="fa-users"
                    value={dashboardDetails.customers ?? 0}
                    className="dc-clients"
                    to={businessPath(companyId, 'customers')}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewVendors ? (
                  <DashboardCard
                    title={t('desktop.vendors')}
                    icon="fa-truck"
                    value={dashboardDetails.vendors ?? 0}
                    className="dc-clients"
                    to={businessPath(companyId, 'vendors')}
                    loading={detailsLoading}
                  />
                ) : null}
                {canViewStaff ? (
                  <DashboardCard
                    title={t('desktop.staff')}
                    icon="fa-user-tie"
                    value={dashboardDetails.staff ?? 0}
                    className="dc-staff"
                    to={businessPath(companyId, 'staff')}
                    loading={detailsLoading}
                  />
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        {canViewTransactions ? (
          <aside className="company-dash-side">
            <div className="dashboard-cards">
              <div className="dash-header dash-header--section">
                <h5>{t('desktop.transactions')}</h5>
              </div>

              {detailsLoading && transactions.length === 0 ? (
                <p className="muted dashboard-side-loading">
                  <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.loading')}
                </p>
              ) : transactions.length === 0 ? (
                <p className="muted">{t('desktop.no_transactions')}</p>
              ) : (
                transactions.slice(0, 5).map((tx) => {
                  const isCredit = isCreditTransaction(tx)
                  const title = translateTransactionLabel(tx, {
                    credit: t('desktop.credit'),
                    debit: t('desktop.debit'),
                    sales: t('desktop.sales'),
                    expenses: t('desktop.expenses'),
                  })
                  return (
                    <Link
                      key={tx.id}
                      to={businessPath(companyId, `transactions/${tx.id}`)}
                      className={`tx-card-link${isCredit ? ' is-credit' : ' is-debit'}`}
                    >
                      <div className={`tx-card-badge${isCredit ? ' is-credit' : ' is-debit'}`}>
                        <i className={`fa-solid ${isCredit ? 'fa-arrow-up' : 'fa-arrow-down'}`} />
                      </div>
                      <div className="tx-card-body">
                        <h6>{title}</h6>
                        <p>{formatAfghanDateValue(tx.created_at, locale)}</p>
                      </div>
                      <div className={`tx-card-amount${isCredit ? ' is-credit' : ' is-debit'}`}>
                        <strong>
                          {formatMoney(tx.amount)}{' '}
                          <span>{localizeCurrency(tx.currency, t)}</span>
                        </strong>
                        {tx.balance_after !== null && tx.balance_after !== undefined ? (
                          <small>| {formatMoney(tx.balance_after)}</small>
                        ) : null}
                      </div>
                    </Link>
                  )
                })
              )}
            </div>

          </aside>
        ) : null}
      </div>

      <div
        className={`dashSaleButtonsWrap action-create${showDashTools && toolsOpen ? ' is-open' : ''}${showDashTools ? '' : ' dashSaleButtonsWrap--messages-only'}`}
      >
        {showDashTools ? (
          <div className="dashSaleButtonsWrap__actions" aria-hidden={!toolsOpen}>
            {canSearchItemPrice ? (
              <div className="dashSaleButtonAction search">
                <button
                  type="button"
                  className="dashSaleLink"
                  onClick={() => {
                    setToolsOpen(false)
                    setPriceSearchOpen(true)
                  }}
                >
                  <i className="fa-solid fa-magnifying-glass" />
                  <h6>{t('desktop.dash_price_search')}</h6>
                </button>
              </div>
            ) : null}

            {canSellPackage ? (
              <div className="dashSaleButtonAction">
                <Link
                  to={businessPath(companyId, 'package-sale')}
                  className="dashSaleLink"
                  onClick={() => setToolsOpen(false)}
                >
                  <i className="fa-solid fa-wifi" />
                  <h6>{t('desktop.sell_package')}</h6>
                </Link>
              </div>
            ) : null}

            {canCreateSales ? (
              <>
                <div className="dashSaleButtonAction">
                  <Link
                    to={saleLink}
                    className="dashSaleLink"
                    onClick={() => setToolsOpen(false)}
                  >
                    <i className="fa-solid fa-cart-plus" />
                    <h6>
                      {t('desktop.insert')} {t('desktop.sale')}
                    </h6>
                  </Link>
                </div>

                <div className="dashSaleButtonAction quick action-create">
                  <Link
                    to={easySaleLink}
                    className="dashSaleLink"
                    onClick={() => setToolsOpen(false)}
                  >
                    <i className="fa-solid fa-bolt-lightning" />
                    <h6>{t('desktop.easy_sale')}</h6>
                  </Link>
                </div>

                <div className="dashSaleButtonAction quick action-create">
                  <button
                    type="button"
                    className="dashSaleLink"
                    onClick={() => {
                      setToolsOpen(false)
                      void startQuickSale()
                    }}
                    disabled={quickCreating}
                  >
                    {quickCreating ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" />
                        <h6>{t('desktop.processing')}</h6>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-bolt" />
                        <h6>{t('desktop.quick_sale')}</h6>
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : null}

            {canAddExpense ? (
              <div className="dashSaleButtonAction expense">
                <button
                  type="button"
                  className="dashSaleLink"
                  onClick={() => {
                    setToolsOpen(false)
                    setExpenseOpen(true)
                  }}
                >
                  <i className="fa-solid fa-coins" />
                  <h6>
                    {t('desktop.insert')} {t('desktop.tx_expense')}
                  </h6>
                </button>
              </div>
            ) : null}

            {canAddAbsence ? (
              <div className="dashSaleButtonAction absence">
                <button
                  type="button"
                  className="dashSaleLink"
                  onClick={() => {
                    setToolsOpen(false)
                    setAbsenceOpen(true)
                    if (token) {
                      void fetchBusinessStaff(token, companyId)
                        .then(setStaffRows)
                        .catch(() => setStaffRows([]))
                    }
                  }}
                >
                  <i className="fa-solid fa-user-xmark" />
                  <h6>{t('desktop.add_staff_absence')}</h6>
                </button>
              </div>
            ) : null}
          </div>
        ) : null}

        <button
          type="button"
          className="dash-ilgar-fab"
          title={t('desktop.ilgar_messages')}
          aria-label={t('desktop.ilgar_messages')}
          onClick={() => void openIlgarMessenger(token)}
        >
          <i className="fa-solid fa-message" aria-hidden="true" />
        </button>

        {showDashTools ? (
          <div className="dashSaleButtonAction tools">
            <button
              type="button"
              className="dashSaleLink"
              onClick={() => setToolsOpen((open) => !open)}
              aria-expanded={toolsOpen}
              aria-label={t('desktop.dash_tools')}
              disabled={accountsLocked}
            >
              <span className="dash-tools-swap" aria-hidden="true">
                <svg className="dash-tools-icon dash-tools-icon--grid" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="2.2" y="2.2" width="8.2" height="8.2" rx="2.4" />
                  <rect x="13.6" y="2.2" width="8.2" height="8.2" rx="2.4" />
                  <rect x="2.2" y="13.6" width="8.2" height="8.2" rx="2.4" />
                  <path d="M16.7 13.4v3h-3v2.2h3v3h2.2v-3h3v-2.2h-3v-3z" />
                </svg>
                <i className="fa-solid fa-xmark dash-tools-icon dash-tools-icon--close" />
              </span>
            </button>
          </div>
        ) : null}
      </div>

      <ItemPriceSearchModal
        open={priceSearchOpen}
        onClose={() => setPriceSearchOpen(false)}
        token={token}
        userKey={userKey}
        companyId={companyId}
      />

      {token && canAddExpense ? (
        <AddBusinessExpenseModal
          open={expenseOpen}
          token={token}
          companyId={companyId}
          onClose={() => setExpenseOpen(false)}
          onSaved={() => scheduleBusinessDashboardRefresh(token, userKey, companyId)}
        />
      ) : null}

      {token && canAddAbsence ? (
        <StaffAbsenceModal
          open={absenceOpen}
          token={token}
          companyId={companyId}
          staff={staffRows}
          onClose={() => setAbsenceOpen(false)}
          onSaved={() => undefined}
        />
      ) : null}

      <Modal
        open={rateModalOpen}
        onClose={closeQuickModal}
        title={t('desktop.quick_sale')}
      >
        <form onSubmit={(e) => void submitRate(e)} className="form-grid">
          <p className="muted" style={{ margin: 0 }}>
            {t('desktop.needs_exchange_rate')}
          </p>
          {ratePair?.from_currency && ratePair?.to_currency ? (
            <p className="muted" style={{ margin: 0 }}>
              {t('desktop.exchange_rate_direction', {
                from: localizeCurrency(ratePair.from_currency, t),
                to: localizeCurrency(ratePair.to_currency, t),
              })}
              {ratePair.suggested_rate || ratePair.rate
                ? ` — ${t('desktop.latest_exchange_rate')}: ${ratePair.suggested_rate || ratePair.rate}`
                : null}
            </p>
          ) : null}
          {rateError || quickError ? (
            <div className="alert-error">{rateError || quickError}</div>
          ) : null}
          <label>
            {rateLabel}
            <input
              type="number"
              min="0.0001"
              step="0.0001"
              value={exchangeRate}
              onChange={(e) => setExchangeRate(e.target.value)}
              required
              autoFocus
              disabled={quickCreating}
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={closeQuickModal}
              disabled={quickCreating}
            >
              {t('desktop.close')}
            </button>
            <button type="submit" className="btn-primary" disabled={quickCreating}>
              {quickCreating ? t('desktop.processing') : t('desktop.create')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
