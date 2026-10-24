import type { TFunction } from 'i18next'

const ROLE_CODES = [
  'owner',
  'admin',
  'manager',
  'sales_full_manager',
  'sales_manager',
  'accountant',
  'analyser',
  'hr',
] as const

export type CompanyRoleCode = (typeof ROLE_CODES)[number]

/** Sidebar/module visibility for sales-focused company roles. */
export type CompanyNavScope = 'full' | 'sales_only' | 'sales_and_purchase'

function normalizeRoleCode(code?: string | null): string {
  return String(code || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

/**
 * مدیر فروش → فقط فروش؛ مدیر عمومی فروش → خرید + فروش؛ بقیه → بر اساس permissionها.
 * UI-only narrowing؛ API permissions مرجع نهایی دسترسی هستند.
 */
export function companyNavScope(
  roleCode?: string | null,
  isOwner?: boolean,
): CompanyNavScope {
  if (isOwner) return 'full'
  const code = normalizeRoleCode(roleCode)
  if (code === 'sales_manager') return 'sales_only'
  if (code === 'sales_full_manager') return 'sales_and_purchase'
  return 'full'
}

/** نقش‌های فروش‌محور: ماژول‌های غیرتجاری در UI پنهان می‌شوند حتی اگر API اجازه دهد. */
export function isSalesFocusedNavScope(scope: CompanyNavScope): boolean {
  return scope === 'sales_only' || scope === 'sales_and_purchase'
}

export function localizeCompanyRoleTitle(
  code: string | null | undefined,
  t: TFunction,
  fallback?: string | null,
): string {
  const normalized = normalizeRoleCode(code)
  if (!normalized) return String(fallback || '').trim()

  const key = `desktop.company_role_title_${normalized}`
  const translated = t(key)
  if (translated && translated !== key) return translated

  return String(fallback || normalized).trim()
}

export function localizeCompanyRoleDescription(
  code: string | null | undefined,
  t: TFunction,
  fallback?: string | null,
): string {
  const normalized = normalizeRoleCode(code)
  if (!normalized) return String(fallback || '').trim()

  const key = `desktop.company_role_description_${normalized}`
  const translated = t(key)
  if (translated && translated !== key) return translated

  return String(fallback || '').trim()
}
