import i18n from '@/lib/i18n'

export type CurrencyMap = Record<string, number | string> | null | undefined

export function formatMoney(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)

  const rounded = Math.round(n * 100) / 100
  const showDecimals = Math.round(Math.abs(n) * 100) % 100 !== 0

  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  })
}

/** Inventory / quantity — keep up to 3 fraction digits (items.stock is decimal:3). */
export function formatQty(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === '') return '0'
  const n = Number(value)
  if (!Number.isFinite(n)) return String(value)
  const rounded = Math.round(n * 1000) / 1000
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 3,
  })
}

export function currenciesText(
  obj: CurrencyMap,
  currencyLabel: (currency: string) => string,
): string {
  if (!obj || typeof obj !== 'object' || Object.keys(obj).length === 0) return '0'
  return Object.entries(obj)
    .map(([currency, amount]) => `${formatMoney(amount)} ${currencyLabel(currency)}`)
    .join('  |  ')
}

function toSafeString(value: unknown): string {
  if (value === null || value === undefined) return ''
  return String(value).trim()
}

function toSnakeKey(value: unknown): string {
  const base = toSafeString(value)
  if (!base) return ''
  return base
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .replace(/[\s\-/]+/g, '_')
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function keyCandidates(value: string): string[] {
  const raw = toSafeString(value)
  if (!raw) return []
  const snake = toSnakeKey(raw)
  const flat = snake.replace(/_/g, '')
  const lower = raw.toLowerCase()
  return Array.from(new Set([snake, flat, lower, raw])).filter(Boolean)
}

/** Strip trailing "#123" so "Purchase Reopen #13" maps to purchase_reopen. */
function splitTitleSuffix(title: string): { base: string; suffix: string } {
  const match = title.match(/^(.*?)(?:\s*#\s*(\d+))\s*$/)
  if (!match) return { base: title, suffix: '' }
  return { base: match[1].trim(), suffix: match[2] ? ` #${match[2]}` : '' }
}

function lookupTxLabel(value: string): string | null {
  const { base, suffix } = splitTitleSuffix(value)
  for (const candidate of keyCandidates(base)) {
    const key = `desktop.tx_${candidate}`
    const translated = i18n.t(key)
    if (translated && translated !== key) {
      return `${translated}${suffix}`
    }
  }
  return null
}

export function isCreditTransaction(tx: {
  direction?: string | null
  type?: string | null
}): boolean {
  return toSnakeKey(tx?.direction || tx?.type) === 'credit'
}

export function translateTransactionLabel(
  tx: {
    title?: string | null
    field?: string | null
    direction?: string | null
    type?: string | null
  },
  labels?: {
    credit?: string
    debit?: string
    sales?: string
    expenses?: string
  },
): string {
  const title = toSafeString(tx.title)
  if (title) {
    const localized = lookupTxLabel(title)
    if (localized) return localized
  }

  const field = toSafeString(tx.field)
  if (field) {
    const localized = lookupTxLabel(field)
    if (localized) return localized
  }

  const dir = toSnakeKey(tx.direction || tx.type)
  if (dir === 'credit') {
    return labels?.credit || labels?.sales || i18n.t('desktop.credit')
  }
  if (dir === 'debit') {
    return labels?.debit || labels?.expenses || i18n.t('desktop.debit')
  }

  return title || field || dir || '—'
}

/** Localize common English transaction description patterns like "Purchase #13". */
export function translateTransactionDescription(description?: string | null): string {
  const raw = toSafeString(description)
  if (!raw) return ''

  const localizedFull = lookupTxLabel(raw)
  if (localizedFull) return localizedFull

  const numbered = raw.match(/^([A-Za-z][A-Za-z\s]+?)\s*#\s*(\d+)\s*$/)
  if (numbered) {
    const label = lookupTxLabel(numbered[1].trim())
    if (label) return `${label} #${numbered[2]}`
  }

  return raw
}
