import { create } from 'zustand'

import { getSessionItem, setSessionItem, deleteSessionItem } from '@/lib/session'
import {
  fetchBusinessAccountsList,
  fetchBusinessCustomers,
  fetchBusinessDashboard,
  fetchBusinessVendors,
  fetchItemsPage,
  fetchWarehouses,
  type BusinessCustomerRow,
  type BusinessVendorRow,
  type ItemsPagePayload,
  type WarehouseDetail,
} from '@/lib/business'
import {
  fetchCounterparties,
  type BusinessAccountRow,
  type BusinessDashboardPayload,
  type CounterpartiesData,
} from '@/lib/user'
import { fetchHelpGuides, type HelpGuideRow } from '@/lib/help'
import { DAILY_CACHE_TTL_MS } from '@/store/useAppCacheStore'

const LISTS_PREFIX = 'hamyan_web_lists_'

/** Coalesce parallel refreshes for the same resource (StrictMode / multi-caller). */
const refreshInflight = new Map<string, Promise<unknown>>()

function withInflight<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = refreshInflight.get(key)
  if (existing) return existing as Promise<T>
  const promise = run().finally(() => {
    if (refreshInflight.get(key) === promise) refreshInflight.delete(key)
  })
  refreshInflight.set(key, promise)
  return promise
}

export type CompanyListEntry<T> = {
  data: T
  fetchedAt: number
}

type ListsBundle = {
  customers?: Record<string, CompanyListEntry<BusinessCustomerRow[]>>
  vendors?: Record<string, CompanyListEntry<BusinessVendorRow[]>>
  items?: Record<string, CompanyListEntry<ItemsPagePayload>>
  warehouses?: Record<string, CompanyListEntry<WarehouseDetail[]>>
  dashboard?: Record<string, CompanyListEntry<BusinessDashboardPayload>>
  accounts?: Record<string, CompanyListEntry<BusinessAccountRow[]>>
  counterparties?: CounterpartiesData
  counterpartiesFetchedAt?: number
  helpGuides?: HelpGuideRow[]
  helpGuidesFetchedAt?: number
}

const hydrateInflight = new Map<string, Promise<ListsBundle | undefined>>()

type EnsureOptions = {
  force?: boolean
}

type ListsCacheStore = {
  bundles: Record<string, ListsBundle>
  /** Mark cached list timestamps stale so the next ensure* refetches from API. */
  markAllStale: (userKey?: string) => Promise<void>
  clearAll: () => Promise<void>
  getCustomers: (userKey: string, companyId: string | number) => BusinessCustomerRow[] | null
  getVendors: (userKey: string, companyId: string | number) => BusinessVendorRow[] | null
  getItems: (
    userKey: string,
    companyId: string | number,
    classification?: string,
  ) => ItemsPagePayload | null
  getWarehouses: (userKey: string, companyId: string | number) => WarehouseDetail[] | null
  getDashboard: (userKey: string, companyId: string | number) => BusinessDashboardPayload | null
  getAccounts: (userKey: string, companyId: string | number) => BusinessAccountRow[] | null
  getCounterparties: (userKey: string) => CounterpartiesData | null
  getHelpGuides: (userKey: string) => HelpGuideRow[] | null
  isHelpGuidesFresh: (userKey: string) => boolean
  setCustomers: (
    userKey: string,
    companyId: string | number,
    data: BusinessCustomerRow[],
    fetchedAt?: number,
  ) => Promise<void>
  setVendors: (
    userKey: string,
    companyId: string | number,
    data: BusinessVendorRow[],
    fetchedAt?: number,
  ) => Promise<void>
  setItems: (
    userKey: string,
    companyId: string | number,
    classification: string,
    data: ItemsPagePayload,
    fetchedAt?: number,
  ) => Promise<void>
  setWarehouses: (
    userKey: string,
    companyId: string | number,
    data: WarehouseDetail[],
    fetchedAt?: number,
  ) => Promise<void>
  setDashboard: (
    userKey: string,
    companyId: string | number,
    data: BusinessDashboardPayload,
    fetchedAt?: number,
  ) => Promise<void>
  setAccounts: (
    userKey: string,
    companyId: string | number,
    data: BusinessAccountRow[],
    fetchedAt?: number,
  ) => Promise<void>
  setCounterparties: (
    userKey: string,
    data: CounterpartiesData,
    fetchedAt?: number,
  ) => Promise<void>
  setHelpGuides: (userKey: string, data: HelpGuideRow[], fetchedAt?: number) => Promise<void>
  refreshCustomers: (
    token: string,
    userKey: string,
    companyId: string | number,
  ) => Promise<BusinessCustomerRow[] | null>
  refreshVendors: (
    token: string,
    userKey: string,
    companyId: string | number,
  ) => Promise<BusinessVendorRow[] | null>
  refreshItems: (
    token: string,
    userKey: string,
    companyId: string | number,
    classification?: string,
  ) => Promise<ItemsPagePayload | null>
  refreshWarehouses: (
    token: string,
    userKey: string,
    companyId: string | number,
  ) => Promise<WarehouseDetail[] | null>
  refreshDashboard: (
    token: string,
    userKey: string,
    companyId: string | number,
  ) => Promise<BusinessDashboardPayload | null>
  refreshAccounts: (
    token: string,
    userKey: string,
    companyId: string | number,
  ) => Promise<BusinessAccountRow[] | null>
  refreshCounterparties: (token: string, userKey: string) => Promise<CounterpartiesData | null>
  refreshHelpGuides: (token: string | null | undefined, userKey: string) => Promise<HelpGuideRow[] | null>
  ensureCustomers: (
    token: string,
    userKey: string,
    companyId: string | number,
    options?: EnsureOptions,
  ) => Promise<BusinessCustomerRow[] | null>
  ensureVendors: (
    token: string,
    userKey: string,
    companyId: string | number,
    options?: EnsureOptions,
  ) => Promise<BusinessVendorRow[] | null>
  ensureItems: (
    token: string,
    userKey: string,
    companyId: string | number,
    classification?: string,
    options?: EnsureOptions,
  ) => Promise<ItemsPagePayload | null>
  ensureWarehouses: (
    token: string,
    userKey: string,
    companyId: string | number,
    options?: EnsureOptions,
  ) => Promise<WarehouseDetail[] | null>
  ensureDashboard: (
    token: string,
    userKey: string,
    companyId: string | number,
    options?: EnsureOptions,
  ) => Promise<BusinessDashboardPayload | null>
  ensureAccounts: (
    token: string,
    userKey: string,
    companyId: string | number,
    options?: EnsureOptions,
  ) => Promise<BusinessAccountRow[] | null>
  ensureCounterparties: (
    token: string,
    userKey: string,
    options?: EnsureOptions,
  ) => Promise<CounterpartiesData | null>
  ensureHelpGuides: (
    token: string | null | undefined,
    userKey: string,
    options?: EnsureOptions,
  ) => Promise<HelpGuideRow[] | null>
}

function listsKey(userKey: string): string {
  return `${LISTS_PREFIX}${userKey}`
}

function companyKey(companyId: string | number): string {
  return String(companyId)
}

function itemsKey(companyId: string | number, classification = 'product'): string {
  return `${companyId}::${classification}`
}

function isFresh(fetchedAt?: number | null): boolean {
  if (typeof fetchedAt !== 'number') return false
  return Date.now() - fetchedAt < DAILY_CACHE_TTL_MS
}

async function readBundle(userKey: string): Promise<ListsBundle | null> {
  const raw = await getSessionItem(listsKey(userKey))
  if (!raw) return null
  try {
    return JSON.parse(raw) as ListsBundle
  } catch {
    return null
  }
}

async function writeBundle(userKey: string, bundle: ListsBundle): Promise<void> {
  await setSessionItem(listsKey(userKey), JSON.stringify(bundle))
}

function mergeBundle(
  bundles: Record<string, ListsBundle>,
  userKey: string,
  patch: Partial<ListsBundle>,
): Record<string, ListsBundle> {
  return {
    ...bundles,
    [userKey]: {
      ...(bundles[userKey] ?? {}),
      ...patch,
    },
  }
}

async function hydrateIfNeeded(
  get: () => ListsCacheStore,
  set: (partial: Partial<ListsCacheStore>) => void,
  userKey: string,
): Promise<ListsBundle | undefined> {
  if (get().bundles[userKey]) return get().bundles[userKey]

  const pending = hydrateInflight.get(userKey)
  if (pending) return pending

  const promise = (async () => {
    const stored = await readBundle(userKey)
    if (stored) {
      set({ bundles: mergeBundle(get().bundles, userKey, stored) })
    }
    return get().bundles[userKey]
  })().finally(() => {
    hydrateInflight.delete(userKey)
  })

  hydrateInflight.set(userKey, promise)
  return promise
}

async function patchAndPersist(
  get: () => ListsCacheStore,
  set: (partial: Partial<ListsCacheStore>) => void,
  userKey: string,
  patch: Partial<ListsBundle>,
): Promise<void> {
  const bundles = mergeBundle(get().bundles, userKey, patch)
  set({ bundles })
  const existing = (await readBundle(userKey)) ?? {}
  await writeBundle(userKey, { ...existing, ...patch })
}

function entryFresh<T>(entry?: CompanyListEntry<T> | null): boolean {
  return Boolean(entry?.data) && isFresh(entry?.fetchedAt)
}

const STALE_FETCHED_AT = 0

function staleCompanyListEntries<T>(
  map: Record<string, CompanyListEntry<T>> | undefined,
): Record<string, CompanyListEntry<T>> | undefined {
  if (!map) return undefined
  return Object.fromEntries(
    Object.entries(map).map(([key, entry]) => [key, { ...entry, fetchedAt: STALE_FETCHED_AT }]),
  )
}

function staleListsBundle(bundle: ListsBundle): ListsBundle {
  return {
    ...bundle,
    customers: staleCompanyListEntries(bundle.customers),
    vendors: staleCompanyListEntries(bundle.vendors),
    items: staleCompanyListEntries(bundle.items),
    warehouses: staleCompanyListEntries(bundle.warehouses),
    dashboard: staleCompanyListEntries(bundle.dashboard),
    accounts: staleCompanyListEntries(bundle.accounts),
    counterpartiesFetchedAt: STALE_FETCHED_AT,
    helpGuidesFetchedAt: STALE_FETCHED_AT,
  }
}

export const useListsCacheStore = create<ListsCacheStore>((set, get) => ({
  bundles: {},
  markAllStale: async (userKey) => {
    const keys = new Set(userKey ? [userKey] : Object.keys(get().bundles))
    const nextBundles = { ...get().bundles }

    for (const key of keys) {
      const bundle = nextBundles[key]
      if (bundle) nextBundles[key] = staleListsBundle(bundle)
    }

    if (userKey && !nextBundles[userKey]) {
      const stored = await readBundle(userKey)
      if (stored) {
        nextBundles[userKey] = staleListsBundle(stored)
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
  clearAll: async () => {
    const keys = Object.keys(get().bundles)
    await Promise.all(keys.map((key) => deleteSessionItem(listsKey(key))))
    set({ bundles: {} })
  },
  getCustomers: (userKey, companyId) =>
    get().bundles[userKey]?.customers?.[companyKey(companyId)]?.data ?? null,
  getVendors: (userKey, companyId) =>
    get().bundles[userKey]?.vendors?.[companyKey(companyId)]?.data ?? null,
  getItems: (userKey, companyId, classification = 'product') =>
    get().bundles[userKey]?.items?.[itemsKey(companyId, classification)]?.data ?? null,
  getWarehouses: (userKey, companyId) =>
    get().bundles[userKey]?.warehouses?.[companyKey(companyId)]?.data ?? null,
  getDashboard: (userKey, companyId) =>
    get().bundles[userKey]?.dashboard?.[companyKey(companyId)]?.data ?? null,
  getAccounts: (userKey, companyId) =>
    get().bundles[userKey]?.accounts?.[companyKey(companyId)]?.data ?? null,
  getCounterparties: (userKey) => get().bundles[userKey]?.counterparties ?? null,
  getHelpGuides: (userKey) => get().bundles[userKey]?.helpGuides ?? null,
  isHelpGuidesFresh: (userKey) => {
    const bundle = get().bundles[userKey]
    return Boolean(bundle?.helpGuides) && isFresh(bundle?.helpGuidesFetchedAt)
  },
  setCustomers: async (userKey, companyId, data, fetchedAt = Date.now()) => {
    const map = {
      ...(get().bundles[userKey]?.customers ?? {}),
      [companyKey(companyId)]: { data, fetchedAt },
    }
    await patchAndPersist(get, set, userKey, { customers: map })
  },
  setVendors: async (userKey, companyId, data, fetchedAt = Date.now()) => {
    const map = {
      ...(get().bundles[userKey]?.vendors ?? {}),
      [companyKey(companyId)]: { data, fetchedAt },
    }
    await patchAndPersist(get, set, userKey, { vendors: map })
  },
  setItems: async (userKey, companyId, classification, data, fetchedAt = Date.now()) => {
    const map = {
      ...(get().bundles[userKey]?.items ?? {}),
      [itemsKey(companyId, classification)]: { data, fetchedAt },
    }
    await patchAndPersist(get, set, userKey, { items: map })
  },
  setWarehouses: async (userKey, companyId, data, fetchedAt = Date.now()) => {
    const map = {
      ...(get().bundles[userKey]?.warehouses ?? {}),
      [companyKey(companyId)]: { data, fetchedAt },
    }
    await patchAndPersist(get, set, userKey, { warehouses: map })
  },
  setDashboard: async (userKey, companyId, data, fetchedAt = Date.now()) => {
    const map = {
      ...(get().bundles[userKey]?.dashboard ?? {}),
      [companyKey(companyId)]: { data, fetchedAt },
    }
    await patchAndPersist(get, set, userKey, { dashboard: map })
  },
  setAccounts: async (userKey, companyId, data, fetchedAt = Date.now()) => {
    const map = {
      ...(get().bundles[userKey]?.accounts ?? {}),
      [companyKey(companyId)]: { data, fetchedAt },
    }
    await patchAndPersist(get, set, userKey, { accounts: map })
  },
  setCounterparties: async (userKey, data, fetchedAt = Date.now()) => {
    await patchAndPersist(get, set, userKey, {
      counterparties: data,
      counterpartiesFetchedAt: fetchedAt,
    })
  },
  setHelpGuides: async (userKey, data, fetchedAt = Date.now()) => {
    await patchAndPersist(get, set, userKey, {
      helpGuides: data,
      helpGuidesFetchedAt: fetchedAt,
    })
  },
  refreshCustomers: async (token, userKey, companyId) => {
    return withInflight(`customers:${userKey}:${companyKey(companyId)}`, async () => {
      try {
        const data = await fetchBusinessCustomers(token, companyId)
        await get().setCustomers(userKey, companyId, data)
        return data
      } catch {
        return get().getCustomers(userKey, companyId)
      }
    })
  },
  refreshVendors: async (token, userKey, companyId) => {
    return withInflight(`vendors:${userKey}:${companyKey(companyId)}`, async () => {
      try {
        const data = await fetchBusinessVendors(token, companyId)
        await get().setVendors(userKey, companyId, data)
        return data
      } catch {
        return get().getVendors(userKey, companyId)
      }
    })
  },
  refreshItems: async (token, userKey, companyId, classification = 'product') => {
    return withInflight(
      `items:${userKey}:${itemsKey(companyId, classification)}`,
      async () => {
        try {
          const data = await fetchItemsPage(token, companyId, classification)
          await get().setItems(userKey, companyId, classification, data)
          return data
        } catch {
          return get().getItems(userKey, companyId, classification)
        }
      },
    )
  },
  refreshWarehouses: async (token, userKey, companyId) => {
    return withInflight(`warehouses:${userKey}:${companyKey(companyId)}`, async () => {
      try {
        const data = await fetchWarehouses(token, companyId)
        await get().setWarehouses(userKey, companyId, data)
        return data
      } catch {
        return get().getWarehouses(userKey, companyId)
      }
    })
  },
  refreshDashboard: async (token, userKey, companyId) => {
    return withInflight(`dashboard:${userKey}:${companyKey(companyId)}`, async () => {
      try {
        const data = await fetchBusinessDashboard(token, companyId)
        await get().setDashboard(userKey, companyId, data)
        return data
      } catch {
        return get().getDashboard(userKey, companyId)
      }
    })
  },
  refreshAccounts: async (token, userKey, companyId) => {
    return withInflight(`accounts:${userKey}:${companyKey(companyId)}`, async () => {
      try {
        const data = await fetchBusinessAccountsList(token, companyId)
        await get().setAccounts(userKey, companyId, data)
        return data
      } catch {
        return get().getAccounts(userKey, companyId)
      }
    })
  },
  refreshCounterparties: async (token, userKey) => {
    return withInflight(`counterparties:${userKey}`, async () => {
      try {
        const data = await fetchCounterparties(token)
        await get().setCounterparties(userKey, data)
        return data
      } catch {
        return get().getCounterparties(userKey)
      }
    })
  },
  refreshHelpGuides: async (token, userKey) => {
    return withInflight(`help:${userKey}`, async () => {
      try {
        const data = await fetchHelpGuides(token)
        await get().setHelpGuides(userKey, data)
        return data
      } catch {
        return get().getHelpGuides(userKey)
      }
    })
  },
  ensureCustomers: async (token, userKey, companyId, options) => {
    const force = options?.force === true
    await hydrateIfNeeded(get, set, userKey)
    const entry = get().bundles[userKey]?.customers?.[companyKey(companyId)]
    if (!force && entryFresh(entry)) return entry?.data ?? null
    return get().refreshCustomers(token, userKey, companyId)
  },
  ensureVendors: async (token, userKey, companyId, options) => {
    const force = options?.force === true
    await hydrateIfNeeded(get, set, userKey)
    const entry = get().bundles[userKey]?.vendors?.[companyKey(companyId)]
    if (!force && entryFresh(entry)) return entry?.data ?? null
    return get().refreshVendors(token, userKey, companyId)
  },
  ensureItems: async (token, userKey, companyId, classification = 'product', options) => {
    const force = options?.force === true
    await hydrateIfNeeded(get, set, userKey)
    const entry = get().bundles[userKey]?.items?.[itemsKey(companyId, classification)]
    if (!force && entryFresh(entry)) return entry?.data ?? null
    return get().refreshItems(token, userKey, companyId, classification)
  },
  ensureWarehouses: async (token, userKey, companyId, options) => {
    const force = options?.force === true
    await hydrateIfNeeded(get, set, userKey)
    const entry = get().bundles[userKey]?.warehouses?.[companyKey(companyId)]
    if (!force && entryFresh(entry)) return entry?.data ?? null
    return get().refreshWarehouses(token, userKey, companyId)
  },
  ensureDashboard: async (token, userKey, companyId, options) => {
    const force = options?.force === true
    await hydrateIfNeeded(get, set, userKey)
    const entry = get().bundles[userKey]?.dashboard?.[companyKey(companyId)]
    if (!force && entryFresh(entry)) return entry?.data ?? null
    return get().refreshDashboard(token, userKey, companyId)
  },
  ensureAccounts: async (token, userKey, companyId, options) => {
    const force = options?.force === true
    await hydrateIfNeeded(get, set, userKey)
    const entry = get().bundles[userKey]?.accounts?.[companyKey(companyId)]
    if (!force && entryFresh(entry)) return entry?.data ?? null
    return get().refreshAccounts(token, userKey, companyId)
  },
  ensureCounterparties: async (token, userKey, options) => {
    const force = options?.force === true
    await hydrateIfNeeded(get, set, userKey)
    const bundle = get().bundles[userKey]
    if (!force && bundle?.counterparties && isFresh(bundle.counterpartiesFetchedAt)) {
      return bundle.counterparties
    }
    return get().refreshCounterparties(token, userKey)
  },
  ensureHelpGuides: async (token, userKey, options) => {
    const force = options?.force === true
    await hydrateIfNeeded(get, set, userKey)
    const bundle = get().bundles[userKey]
    if (!force && bundle?.helpGuides && isFresh(bundle.helpGuidesFetchedAt)) {
      return bundle.helpGuides
    }
    return get().refreshHelpGuides(token, userKey)
  },
}))

export async function loadListsCacheBundle(userKey: string): Promise<ListsBundle | null> {
  return readBundle(userKey)
}

/** Hydrate memory from disk so get* can return data on first paint. */
export async function hydrateListsCache(userKey: string): Promise<void> {
  const store = useListsCacheStore.getState()
  if (store.bundles[userKey]) return
  const stored = await readBundle(userKey)
  if (stored) {
    useListsCacheStore.setState({
      bundles: mergeBundle(store.bundles, userKey, stored),
    })
  }
}

/** Soft background refresh after sales/purchases/expenses/transactions change. */
export function scheduleBusinessDashboardRefresh(
  token: string | null | undefined,
  userKey: string,
  companyId: string | number,
): void {
  if (!token || !companyId) return
  const store = useListsCacheStore.getState()
  void store.refreshDashboard(token, userKey, companyId)
  void store.refreshAccounts(token, userKey, companyId)
}
