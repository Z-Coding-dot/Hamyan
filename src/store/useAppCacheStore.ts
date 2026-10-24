import { create } from 'zustand'

import { getSessionItem, setSessionItem, deleteSessionItem } from '@/lib/session'
import {
  fetchAccountsData,
  fetchExpenseAccounts,
  fetchLatestPublicExchangeRates,
  fetchPremiumData,
  fetchProfileData,
  fetchUserCompanies,
  fetchUserKycProfile,
  type CompanyRow,
  type ExpenseAccountRow,
  type PremiumData,
  type ProfileData,
  type PublicExchangeRateRow,
  type UserAccountDeposit,
  type UserAccountRow,
  type UserProfileKyc,
} from '@/lib/user'
import { fetchMeasurementUnits, type MeasurementUnitRow } from '@/lib/business'

const CACHE_PREFIX = 'hamyan_web_cache_'
/** Local cache TTL — about one day. */
export const DAILY_CACHE_TTL_MS = 24 * 60 * 60 * 1000
export const COMPANIES_CACHE_TTL_MS = DAILY_CACHE_TTL_MS
/** Reference data — refresh weekly. */
export const MEASUREMENT_UNITS_CACHE_TTL_MS = 7 * DAILY_CACHE_TTL_MS

export type CompanyValidityEntry = {
  validUpTo: string | null
  fetchedAt: number
}

export type PersonalAccountsCache = {
  active: boolean
  accounts: UserAccountRow[]
  deposits: UserAccountDeposit[]
  fetchedAt: number
}

type CacheBundle = {
  profile?: ProfileData
  profileFetchedAt?: number
  kyc?: UserProfileKyc
  kycFetchedAt?: number
  companies?: CompanyRow[]
  companiesFetchedAt?: number
  premiumUntil?: string | null
  premiumFetchedAt?: number
  expenseAccounts?: ExpenseAccountRow[]
  expenseAccountsFetchedAt?: number
  companyValidities?: Record<string, CompanyValidityEntry>
  personalAccounts?: PersonalAccountsCache
  exchangeRates?: PublicExchangeRateRow[]
  exchangeRatesFetchedAt?: number
  measurementUnits?: MeasurementUnitRow[]
  measurementUnitsFetchedAt?: number
}

type EnsureOptions = {
  force?: boolean
}

type AppCacheStore = {
  bundles: Record<string, CacheBundle>
  syncing: Record<string, boolean>
  isHydrated: boolean
  hydrate: () => Promise<void>
  clearAll: () => Promise<void>
  getProfile: (userKey: string) => ProfileData | null
  getKyc: (userKey: string) => UserProfileKyc | null
  isProfileFresh: (userKey: string) => boolean
  isKycFresh: (userKey: string) => boolean
  getCompanies: (userKey: string) => CompanyRow[] | null
  getCompaniesFetchedAt: (userKey: string) => number | null
  isCompaniesFresh: (userKey: string) => boolean
  getPremiumUntil: (userKey: string) => string | null | undefined
  isPremiumFresh: (userKey: string) => boolean
  getExpenseAccounts: (userKey: string) => ExpenseAccountRow[] | null
  isExpenseAccountsFresh: (userKey: string) => boolean
  getPersonalAccounts: (userKey: string) => PersonalAccountsCache | null
  isPersonalAccountsFresh: (userKey: string) => boolean
  isPersonalAccountsActive: (userKey: string) => boolean | null
  getExchangeRates: (userKey: string) => PublicExchangeRateRow[] | null
  isExchangeRatesFresh: (userKey: string) => boolean
  getMeasurementUnits: (userKey: string) => MeasurementUnitRow[] | null
  isMeasurementUnitsFresh: (userKey: string) => boolean
  getCompanyValidUpTo: (userKey: string, companyId: string | number) => string | null | undefined
  isCompanyValidityFresh: (userKey: string, companyId: string | number) => boolean
  isSyncing: (userKey: string) => boolean
  setProfile: (userKey: string, data: ProfileData, fetchedAt?: number) => Promise<void>
  setKyc: (userKey: string, data: UserProfileKyc, fetchedAt?: number) => Promise<void>
  setCompanies: (userKey: string, data: CompanyRow[], fetchedAt?: number) => Promise<void>
  patchCompany: (
    userKey: string,
    companyId: string | number,
    patch: Partial<CompanyRow>,
  ) => Promise<void>
  setPremiumUntil: (userKey: string, premiumUntil: string | null, fetchedAt?: number) => Promise<void>
  setExpenseAccounts: (
    userKey: string,
    data: ExpenseAccountRow[],
    fetchedAt?: number,
  ) => Promise<void>
  setPersonalAccounts: (
    userKey: string,
    data: {
      accounts: UserAccountRow[]
      deposits?: UserAccountDeposit[]
      active?: boolean
    },
    fetchedAt?: number,
  ) => Promise<void>
  setExchangeRates: (
    userKey: string,
    data: PublicExchangeRateRow[],
    fetchedAt?: number,
  ) => Promise<void>
  setMeasurementUnits: (
    userKey: string,
    data: MeasurementUnitRow[],
    fetchedAt?: number,
  ) => Promise<void>
  setCompanyValidity: (
    userKey: string,
    companyId: string | number,
    validUpTo: string | null,
    fetchedAt?: number,
  ) => Promise<void>
  refreshProfile: (token: string, userKey: string) => Promise<ProfileData | null>
  refreshKyc: (token: string, userKey: string) => Promise<UserProfileKyc | null>
  refreshCompanies: (token: string, userKey: string) => Promise<CompanyRow[] | null>
  refreshPremium: (token: string, userKey: string) => Promise<string | null>
  refreshExpenseAccounts: (token: string, userKey: string) => Promise<ExpenseAccountRow[] | null>
  refreshPersonalAccounts: (token: string, userKey: string) => Promise<PersonalAccountsCache | null>
  refreshExchangeRates: (token: string, userKey: string) => Promise<PublicExchangeRateRow[] | null>
  refreshMeasurementUnits: (
    token: string,
    userKey: string,
    companyId: string | number,
  ) => Promise<MeasurementUnitRow[] | null>
  ensureProfile: (token: string, userKey: string, options?: EnsureOptions) => Promise<ProfileData | null>
  ensureKyc: (token: string, userKey: string, options?: EnsureOptions) => Promise<UserProfileKyc | null>
  ensureCompanies: (
    token: string,
    userKey: string,
    options?: EnsureOptions,
  ) => Promise<CompanyRow[] | null>
  ensurePremium: (token: string, userKey: string, options?: EnsureOptions) => Promise<string | null>
  ensureExpenseAccounts: (
    token: string,
    userKey: string,
    options?: EnsureOptions,
  ) => Promise<ExpenseAccountRow[] | null>
  ensurePersonalAccounts: (
    token: string,
    userKey: string,
    options?: EnsureOptions,
  ) => Promise<PersonalAccountsCache | null>
  ensureExchangeRates: (
    token: string,
    userKey: string,
    options?: EnsureOptions,
  ) => Promise<PublicExchangeRateRow[] | null>
  ensureMeasurementUnits: (
    token: string,
    userKey: string,
    companyId: string | number,
    options?: EnsureOptions,
  ) => Promise<MeasurementUnitRow[] | null>
  ensureCompanyValidity: (
    token: string,
    userKey: string,
    companyId: string | number,
    options?: EnsureOptions,
  ) => Promise<string | null>
  /** Mark cached timestamps stale so the next ensure* refetches from API. */
  markAllStale: (userKey?: string) => Promise<void>
  prefetchUser: (token: string, userKey: string) => void
}

function cacheKey(userKey: string): string {
  return `${CACHE_PREFIX}${userKey}`
}

async function readBundle(userKey: string): Promise<CacheBundle | null> {
  const raw = await getSessionItem(cacheKey(userKey))
  if (!raw) return null
  try {
    return JSON.parse(raw) as CacheBundle
  } catch {
    return null
  }
}

async function writeBundle(userKey: string, bundle: CacheBundle): Promise<void> {
  await setSessionItem(cacheKey(userKey), JSON.stringify(bundle))
}

function mergeBundle(
  bundles: Record<string, CacheBundle>,
  userKey: string,
  patch: Partial<CacheBundle>,
): Record<string, CacheBundle> {
  return {
    ...bundles,
    [userKey]: {
      ...(bundles[userKey] ?? {}),
      ...patch,
    },
  }
}

function isFresh(fetchedAt?: number | null): boolean {
  if (typeof fetchedAt !== 'number') return false
  return Date.now() - fetchedAt < DAILY_CACHE_TTL_MS
}

function companiesCacheIsFresh(bundle?: CacheBundle | null): boolean {
  if (!bundle?.companies || typeof bundle.companiesFetchedAt !== 'number') return false
  return isFresh(bundle.companiesFetchedAt)
}

function premiumCacheIsFresh(bundle?: CacheBundle | null): boolean {
  if (!bundle || typeof bundle.premiumFetchedAt !== 'number') return false
  return isFresh(bundle.premiumFetchedAt)
}

function expenseAccountsCacheIsFresh(bundle?: CacheBundle | null): boolean {
  if (!bundle?.expenseAccounts || typeof bundle.expenseAccountsFetchedAt !== 'number') return false
  return isFresh(bundle.expenseAccountsFetchedAt)
}

function personalAccountsCacheIsFresh(bundle?: CacheBundle | null): boolean {
  if (!bundle?.personalAccounts || typeof bundle.personalAccounts.fetchedAt !== 'number') return false
  return isFresh(bundle.personalAccounts.fetchedAt)
}

function exchangeRatesCacheIsFresh(bundle?: CacheBundle | null): boolean {
  if (!bundle?.exchangeRates || typeof bundle.exchangeRatesFetchedAt !== 'number') return false
  return isFresh(bundle.exchangeRatesFetchedAt)
}

function measurementUnitsCacheIsFresh(bundle?: CacheBundle | null): boolean {
  if (!bundle?.measurementUnits?.length || typeof bundle.measurementUnitsFetchedAt !== 'number') {
    return false
  }
  return Date.now() - bundle.measurementUnitsFetchedAt < MEASUREMENT_UNITS_CACHE_TTL_MS
}

function profileCacheIsFresh(bundle?: CacheBundle | null): boolean {
  if (!bundle?.profile || typeof bundle.profileFetchedAt !== 'number') return false
  return isFresh(bundle.profileFetchedAt)
}

function kycCacheIsFresh(bundle?: CacheBundle | null): boolean {
  if (!bundle?.kyc || typeof bundle.kycFetchedAt !== 'number') return false
  return isFresh(bundle.kycFetchedAt)
}

function companyValidityFromRows(
  companies: CompanyRow[],
  fetchedAt: number,
): Record<string, CompanyValidityEntry> {
  const map: Record<string, CompanyValidityEntry> = {}
  for (const row of companies) {
    const id = String(row.company_id)
    map[id] = {
      validUpTo: row.valid_up_to ?? null,
      fetchedAt,
    }
  }
  return map
}

async function hydrateBundleIfNeeded(
  get: () => AppCacheStore,
  set: (partial: Partial<AppCacheStore>) => void,
  userKey: string,
): Promise<CacheBundle | undefined> {
  if (!get().bundles[userKey]) {
    const stored = await readBundle(userKey)
    if (stored) {
      set({ bundles: mergeBundle(get().bundles, userKey, stored) })
    }
  }
  return get().bundles[userKey]
}

export function userCacheKey(userId?: number | string | null, fallbackId?: number): string {
  if (userId !== undefined && userId !== null && String(userId).trim() !== '') {
    return String(userId)
  }
  return String(fallbackId ?? 'guest')
}

const STALE_FETCHED_AT = 0

function staleAppBundle(bundle: CacheBundle): CacheBundle {
  const next: CacheBundle = {
    ...bundle,
    profileFetchedAt: STALE_FETCHED_AT,
    kycFetchedAt: STALE_FETCHED_AT,
    companiesFetchedAt: STALE_FETCHED_AT,
    premiumFetchedAt: STALE_FETCHED_AT,
    expenseAccountsFetchedAt: STALE_FETCHED_AT,
    exchangeRatesFetchedAt: STALE_FETCHED_AT,
    measurementUnitsFetchedAt: STALE_FETCHED_AT,
  }
  if (next.personalAccounts) {
    next.personalAccounts = { ...next.personalAccounts, fetchedAt: STALE_FETCHED_AT }
  }
  if (next.companyValidities) {
    next.companyValidities = Object.fromEntries(
      Object.entries(next.companyValidities).map(([key, entry]) => [
        key,
        { ...entry, fetchedAt: STALE_FETCHED_AT },
      ]),
    )
  }
  return next
}

export const useAppCacheStore = create<AppCacheStore>((set, get) => ({
  bundles: {},
  syncing: {},
  isHydrated: false,
  hydrate: async () => {
    if (get().isHydrated) return
    set({ isHydrated: true })
  },
  clearAll: async () => {
    const keys = Object.keys(get().bundles)
    await Promise.all(keys.map((key) => deleteSessionItem(cacheKey(key))))
    set({ bundles: {}, syncing: {} })
  },
  getProfile: (userKey) => get().bundles[userKey]?.profile ?? null,
  getKyc: (userKey) => get().bundles[userKey]?.kyc ?? null,
  isProfileFresh: (userKey) => profileCacheIsFresh(get().bundles[userKey]),
  isKycFresh: (userKey) => kycCacheIsFresh(get().bundles[userKey]),
  getCompanies: (userKey) => get().bundles[userKey]?.companies ?? null,
  getCompaniesFetchedAt: (userKey) => get().bundles[userKey]?.companiesFetchedAt ?? null,
  isCompaniesFresh: (userKey) => companiesCacheIsFresh(get().bundles[userKey]),
  getPremiumUntil: (userKey) => get().bundles[userKey]?.premiumUntil,
  isPremiumFresh: (userKey) => premiumCacheIsFresh(get().bundles[userKey]),
  getExpenseAccounts: (userKey) => get().bundles[userKey]?.expenseAccounts ?? null,
  isExpenseAccountsFresh: (userKey) => expenseAccountsCacheIsFresh(get().bundles[userKey]),
  getPersonalAccounts: (userKey) => get().bundles[userKey]?.personalAccounts ?? null,
  isPersonalAccountsFresh: (userKey) => personalAccountsCacheIsFresh(get().bundles[userKey]),
  isPersonalAccountsActive: (userKey) => {
    const cached = get().bundles[userKey]?.personalAccounts
    if (!cached) return null
    return Boolean(cached.active)
  },
  getExchangeRates: (userKey) => get().bundles[userKey]?.exchangeRates ?? null,
  isExchangeRatesFresh: (userKey) => exchangeRatesCacheIsFresh(get().bundles[userKey]),
  getMeasurementUnits: (userKey) => get().bundles[userKey]?.measurementUnits ?? null,
  isMeasurementUnitsFresh: (userKey) => measurementUnitsCacheIsFresh(get().bundles[userKey]),
  getCompanyValidUpTo: (userKey, companyId) =>
    get().bundles[userKey]?.companyValidities?.[String(companyId)]?.validUpTo,
  isCompanyValidityFresh: (userKey, companyId) => {
    const entry = get().bundles[userKey]?.companyValidities?.[String(companyId)]
    return isFresh(entry?.fetchedAt)
  },
  isSyncing: (userKey) => Boolean(get().syncing[userKey]),
  setProfile: async (userKey, data, fetchedAt) => {
    const patch: Partial<CacheBundle> = { profile: data }
    if (typeof fetchedAt === 'number') {
      patch.profileFetchedAt = fetchedAt
    }
    if (data.user?.premium_until !== undefined) {
      patch.premiumUntil = data.user.premium_until ?? null
      if (typeof fetchedAt === 'number') {
        patch.premiumFetchedAt = fetchedAt
      }
    }
    if (data.user?.profile) {
      patch.kyc = data.user.profile
      if (typeof fetchedAt === 'number') {
        patch.kycFetchedAt = fetchedAt
      }
    }
    const bundles = mergeBundle(get().bundles, userKey, patch)
    set({ bundles })
    const existing = (await readBundle(userKey)) ?? {}
    await writeBundle(userKey, { ...existing, ...patch })
  },
  setKyc: async (userKey, data, fetchedAt) => {
    const patch: Partial<CacheBundle> = { kyc: data }
    if (typeof fetchedAt === 'number') {
      patch.kycFetchedAt = fetchedAt
    }
    const existingProfile = get().bundles[userKey]?.profile
    if (existingProfile?.user) {
      patch.profile = {
        ...existingProfile,
        user: { ...existingProfile.user, profile: data },
      }
    }
    const bundles = mergeBundle(get().bundles, userKey, patch)
    set({ bundles })
    const existing = (await readBundle(userKey)) ?? {}
    await writeBundle(userKey, { ...existing, ...patch })
  },
  setCompanies: async (userKey, data, fetchedAt = Date.now()) => {
    const existingValidities = get().bundles[userKey]?.companyValidities ?? {}
    const companyValidities = {
      ...existingValidities,
      ...companyValidityFromRows(data, fetchedAt),
    }
    const patch = {
      companies: data,
      companiesFetchedAt: fetchedAt,
      companyValidities,
    }
    const bundles = mergeBundle(get().bundles, userKey, patch)
    set({ bundles })
    const existing = (await readBundle(userKey)) ?? {}
    await writeBundle(userKey, { ...existing, ...patch })
  },
  patchCompany: async (userKey, companyId, patch) => {
    const id = String(companyId)
    const current = get().getCompanies(userKey)
    if (!current?.length) return
    const next = current.map((row) =>
      String(row.company_id) === id ? { ...row, ...patch } : row,
    )
    await get().setCompanies(userKey, next, get().bundles[userKey]?.companiesFetchedAt ?? Date.now())
  },
  setPremiumUntil: async (userKey, premiumUntil, fetchedAt = Date.now()) => {
    const patch = { premiumUntil, premiumFetchedAt: fetchedAt }
    const bundles = mergeBundle(get().bundles, userKey, patch)
    set({ bundles })
    const existing = (await readBundle(userKey)) ?? {}
    await writeBundle(userKey, { ...existing, ...patch })
  },
  setExpenseAccounts: async (userKey, data, fetchedAt = Date.now()) => {
    const patch = { expenseAccounts: data, expenseAccountsFetchedAt: fetchedAt }
    const bundles = mergeBundle(get().bundles, userKey, patch)
    set({ bundles })
    const existing = (await readBundle(userKey)) ?? {}
    await writeBundle(userKey, { ...existing, ...patch })
  },
  setPersonalAccounts: async (userKey, data, fetchedAt = Date.now()) => {
    const accounts = Array.isArray(data.accounts) ? data.accounts : []
    const deposits = Array.isArray(data.deposits) ? data.deposits.slice(0, 10) : []
    const personalAccounts: PersonalAccountsCache = {
      active: typeof data.active === 'boolean' ? data.active : accounts.length > 0,
      accounts,
      deposits,
      fetchedAt,
    }
    const bundles = mergeBundle(get().bundles, userKey, { personalAccounts })
    set({ bundles })
    const existing = (await readBundle(userKey)) ?? {}
    await writeBundle(userKey, { ...existing, personalAccounts })
  },
  setExchangeRates: async (userKey, data, fetchedAt = Date.now()) => {
    const patch = { exchangeRates: data, exchangeRatesFetchedAt: fetchedAt }
    const bundles = mergeBundle(get().bundles, userKey, patch)
    set({ bundles })
    const existing = (await readBundle(userKey)) ?? {}
    await writeBundle(userKey, { ...existing, ...patch })
  },
  setMeasurementUnits: async (userKey, data, fetchedAt = Date.now()) => {
    const patch = { measurementUnits: data, measurementUnitsFetchedAt: fetchedAt }
    const bundles = mergeBundle(get().bundles, userKey, patch)
    set({ bundles })
    const existing = (await readBundle(userKey)) ?? {}
    await writeBundle(userKey, { ...existing, ...patch })
  },
  setCompanyValidity: async (userKey, companyId, validUpTo, fetchedAt = Date.now()) => {
    const existingValidities = get().bundles[userKey]?.companyValidities ?? {}
    const companyValidities = {
      ...existingValidities,
      [String(companyId)]: { validUpTo, fetchedAt },
    }
    const bundles = mergeBundle(get().bundles, userKey, { companyValidities })
    set({ bundles })
    const existing = (await readBundle(userKey)) ?? {}
    await writeBundle(userKey, { ...existing, companyValidities })
  },
  refreshProfile: async (token, userKey) => {
    set({ syncing: { ...get().syncing, [userKey]: true } })
    try {
      const data = await fetchProfileData(token)
      await get().setProfile(userKey, data, Date.now())
      return data
    } catch {
      return get().getProfile(userKey)
    } finally {
      set({ syncing: { ...get().syncing, [userKey]: false } })
    }
  },
  refreshKyc: async (token, userKey) => {
    try {
      const data = await fetchUserKycProfile(token)
      await get().setKyc(userKey, data, Date.now())
      return data
    } catch {
      return get().getKyc(userKey)
    }
  },
  refreshCompanies: async (token, userKey) => {
    try {
      const data = await fetchUserCompanies(token)
      await get().setCompanies(userKey, data)
      return data
    } catch {
      return get().getCompanies(userKey)
    }
  },
  refreshPremium: async (token, userKey) => {
    try {
      const data: PremiumData = await fetchPremiumData(token)
      const premiumUntil = data.premiumUntil ?? null
      await get().setPremiumUntil(userKey, premiumUntil)
      return premiumUntil
    } catch {
      return get().getPremiumUntil(userKey) ?? null
    }
  },
  refreshExpenseAccounts: async (token, userKey) => {
    if (!token) return get().getExpenseAccounts(userKey)
    try {
      const data = await fetchExpenseAccounts(token)
      await get().setExpenseAccounts(userKey, data)
      return data
    } catch {
      return get().getExpenseAccounts(userKey)
    }
  },
  refreshPersonalAccounts: async (token, userKey) => {
    if (!token) return get().getPersonalAccounts(userKey)
    try {
      const data = await fetchAccountsData(token)
      const accounts = Array.isArray(data.accounts) ? data.accounts : []
      const deposits = Array.isArray(data.deposits) ? data.deposits : []
      await get().setPersonalAccounts(userKey, {
        accounts,
        deposits,
        active: accounts.length > 0 || Boolean(data.account?.id),
      })
      if (Array.isArray(data.expense_accounts) && data.expense_accounts.length > 0) {
        await get().setExpenseAccounts(userKey, data.expense_accounts)
      }
      return get().getPersonalAccounts(userKey)
    } catch {
      return get().getPersonalAccounts(userKey)
    }
  },
  refreshExchangeRates: async (token, userKey) => {
    try {
      const data = await fetchLatestPublicExchangeRates(token)
      await get().setExchangeRates(userKey, data)
      return data
    } catch {
      return get().getExchangeRates(userKey)
    }
  },
  refreshMeasurementUnits: async (token, userKey, companyId) => {
    try {
      const data = await fetchMeasurementUnits(token, companyId)
      await get().setMeasurementUnits(userKey, data)
      return data
    } catch {
      return get().getMeasurementUnits(userKey)
    }
  },
  ensureProfile: async (token, userKey, options) => {
    const force = options?.force === true
    await hydrateBundleIfNeeded(get, set, userKey)
    const bundle = get().bundles[userKey]
    if (!force && profileCacheIsFresh(bundle)) {
      return bundle?.profile ?? null
    }
    return get().refreshProfile(token, userKey)
  },
  ensureKyc: async (token, userKey, options) => {
    const force = options?.force === true
    await hydrateBundleIfNeeded(get, set, userKey)
    const bundle = get().bundles[userKey]
    if (!force && kycCacheIsFresh(bundle)) {
      return bundle?.kyc ?? null
    }
    if (!force && profileCacheIsFresh(bundle) && bundle?.profile?.user?.profile) {
      return bundle.profile.user.profile
    }
    return get().refreshKyc(token, userKey)
  },
  ensureCompanies: async (token, userKey, options) => {
    const force = options?.force === true
    await hydrateBundleIfNeeded(get, set, userKey)
    const bundle = get().bundles[userKey]
    if (!force && companiesCacheIsFresh(bundle)) {
      return bundle?.companies ?? null
    }
    return get().refreshCompanies(token, userKey)
  },
  ensurePremium: async (token, userKey, options) => {
    const force = options?.force === true
    await hydrateBundleIfNeeded(get, set, userKey)
    const bundle = get().bundles[userKey]
    if (!force && premiumCacheIsFresh(bundle)) {
      return bundle?.premiumUntil ?? null
    }
    return get().refreshPremium(token, userKey)
  },
  ensureExpenseAccounts: async (token, userKey, options) => {
    if (!token) return null
    const force = options?.force === true
    await hydrateBundleIfNeeded(get, set, userKey)
    const bundle = get().bundles[userKey]
    if (!force && expenseAccountsCacheIsFresh(bundle)) {
      return bundle?.expenseAccounts ?? null
    }
    return get().refreshExpenseAccounts(token, userKey)
  },
  ensurePersonalAccounts: async (token, userKey, options) => {
    if (!token) return null
    const force = options?.force === true
    await hydrateBundleIfNeeded(get, set, userKey)
    const bundle = get().bundles[userKey]
    if (!force && personalAccountsCacheIsFresh(bundle)) {
      return bundle?.personalAccounts ?? null
    }
    return get().refreshPersonalAccounts(token, userKey)
  },
  ensureExchangeRates: async (token, userKey, options) => {
    const force = options?.force === true
    await hydrateBundleIfNeeded(get, set, userKey)
    const bundle = get().bundles[userKey]
    if (!force && exchangeRatesCacheIsFresh(bundle)) {
      return bundle?.exchangeRates ?? null
    }
    return get().refreshExchangeRates(token, userKey)
  },
  ensureMeasurementUnits: async (token, userKey, companyId, options) => {
    const force = options?.force === true
    await hydrateBundleIfNeeded(get, set, userKey)
    const bundle = get().bundles[userKey]
    if (!force && measurementUnitsCacheIsFresh(bundle)) {
      return bundle?.measurementUnits ?? null
    }
    return get().refreshMeasurementUnits(token, userKey, companyId)
  },
  ensureCompanyValidity: async (token, userKey, companyId, options) => {
    const force = options?.force === true
    const id = String(companyId)
    await hydrateBundleIfNeeded(get, set, userKey)

    if (!force && get().isCompanyValidityFresh(userKey, id)) {
      return get().getCompanyValidUpTo(userKey, id) ?? null
    }

    const companies = await get().ensureCompanies(token, userKey, { force })
    const fromList = companies?.find((row) => String(row.company_id) === id)?.valid_up_to ?? null
    if (fromList !== undefined) {
      await get().setCompanyValidity(userKey, id, fromList)
      return fromList
    }
    return get().getCompanyValidUpTo(userKey, id) ?? null
  },
  markAllStale: async (userKey) => {
    const keys = new Set(userKey ? [userKey] : Object.keys(get().bundles))
    const nextBundles = { ...get().bundles }

    for (const key of keys) {
      const bundle = nextBundles[key]
      if (bundle) nextBundles[key] = staleAppBundle(bundle)
    }

    if (userKey && !nextBundles[userKey]) {
      const stored = await readBundle(userKey)
      if (stored) {
        nextBundles[userKey] = staleAppBundle(stored)
        keys.add(userKey)
      }
    }

    set({ bundles: nextBundles })

    await Promise.all(
      [...keys].map(async (key) => {
        const bundle = nextBundles[key]
        if (!bundle) return
        const existing = (await readBundle(key)) ?? {}
        await writeBundle(key, { ...existing, ...bundle })
      }),
    )
  },
  prefetchUser: (token, userKey) => {
    void (async () => {
      const stored = await readBundle(userKey)
      if (stored) {
        set({ bundles: mergeBundle(get().bundles, userKey, stored) })
      }
      set({ syncing: { ...get().syncing, [userKey]: true } })
      const current = stored ?? get().bundles[userKey]
      const tasks: Array<Promise<unknown>> = []
      if (!profileCacheIsFresh(current)) {
        tasks.push(get().refreshProfile(token, userKey))
      } else if (!kycCacheIsFresh(current) && !current?.profile?.user?.profile) {
        tasks.push(get().refreshKyc(token, userKey))
      }
      if (!companiesCacheIsFresh(current)) {
        tasks.push(get().refreshCompanies(token, userKey))
      }
      if (!premiumCacheIsFresh(current)) {
        tasks.push(get().refreshPremium(token, userKey))
      }
      if (!expenseAccountsCacheIsFresh(current)) {
        tasks.push(get().refreshExpenseAccounts(token, userKey))
      }
      if (!personalAccountsCacheIsFresh(current)) {
        tasks.push(get().refreshPersonalAccounts(token, userKey))
      }
      if (!exchangeRatesCacheIsFresh(current)) {
        tasks.push(get().refreshExchangeRates(token, userKey))
      }
      if (tasks.length > 0) {
        await Promise.all(tasks)
      }
      set({ syncing: { ...get().syncing, [userKey]: false } })
    })()
  },
}))

export async function loadUserCacheBundle(userKey: string): Promise<CacheBundle | null> {
  return readBundle(userKey)
}
