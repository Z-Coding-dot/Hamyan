import type { SaleCatalogItem } from '@/lib/business'

const PREFIX = 'netrix_easy_sale_catalog_v1_'

export type EasySaleCatalogCache = {
  companyId: string
  identity: string
  items: SaleCatalogItem[]
  savedAt: number
}

function storageKey(companyId: string | number) {
  return `${PREFIX}${String(companyId)}`
}

/** Identity of catalog membership (added/removed items). */
export function easySaleCatalogIdentity(items: SaleCatalogItem[] | null | undefined): string {
  return (Array.isArray(items) ? items : [])
    .map((item) => Number(item.id))
    .filter((id) => Number.isFinite(id) && id > 0)
    .sort((a, b) => a - b)
    .join(',')
}

export function readEasySaleCatalogCache(
  companyId: string | number,
): EasySaleCatalogCache | null {
  try {
    const raw = localStorage.getItem(storageKey(companyId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as EasySaleCatalogCache
    if (!parsed || !Array.isArray(parsed.items)) return null
    return parsed
  } catch {
    return null
  }
}

export function writeEasySaleCatalogCache(
  companyId: string | number,
  items: SaleCatalogItem[],
): void {
  try {
    const payload: EasySaleCatalogCache = {
      companyId: String(companyId),
      identity: easySaleCatalogIdentity(items),
      items,
      savedAt: Date.now(),
    }
    localStorage.setItem(storageKey(companyId), JSON.stringify(payload))
  } catch {
    /* quota / private mode — ignore */
  }
}

/**
 * Prefer remote catalog. If membership (ids) is unchanged, still replace with remote
 * so stock/prices stay fresh, and rewrite localStorage. If membership changed, replace too.
 */
export function syncEasySaleCatalogCache(
  companyId: string | number,
  remoteItems: SaleCatalogItem[],
): SaleCatalogItem[] {
  const cached = readEasySaleCatalogCache(companyId)
  const remoteIdentity = easySaleCatalogIdentity(remoteItems)
  if (!cached || cached.identity !== remoteIdentity) {
    writeEasySaleCatalogCache(companyId, remoteItems)
    return remoteItems
  }
  // Same items set: keep using remote data (fresh stock/prices) and refresh cache.
  writeEasySaleCatalogCache(companyId, remoteItems)
  return remoteItems
}
