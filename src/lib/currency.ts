const CURRENCY_SYMBOLS: Record<string, string> = {
  AFN: '؋', USD: '$', EUR: '€', GBP: '£', PKR: '₨', INR: '₹',
  AED: 'د.إ', SAR: 'ر.س', TRY: '₺', CNY: 'CN¥', JPY: 'JP¥',
  RUB: '₽', CAD: 'CA$', AUD: 'A$', CHF: 'CHF', BDT: '৳',
}

/** Compact symbols for amounts; Toman keeps its existing denomination label. */
export function currencySymbol(code?: string | null): string {
  return CURRENCY_SYMBOLS[String(code || '').trim().toUpperCase()] || ''
}

/**
 * Localized currency labels (matches project/lang public AFN → افغانی, USD → دالر, …).
 */
export function localizeCurrency(
  code: string | null | undefined,
  t: (key: string) => string,
  fallback = '—',
): string {
  const raw = String(code || '').trim()
  if (!raw) return fallback

  const key = `desktop.currency_${raw.toLowerCase()}`
  const label = t(key)
  const localized = label && label !== key ? label : raw.toUpperCase()
  const symbol = currencySymbol(raw)
  return symbol && symbol !== localized ? `${symbol} ${localized}` : localized
}

export function formatMoneyWithCurrency(
  amount: number | string | null | undefined,
  currency: string | null | undefined,
  t: (key: string) => string,
  formatMoney: (n: number) => string,
): string {
  const n = Number(amount)
  const money = Number.isFinite(n) ? formatMoney(n) : String(amount ?? '—')
  return `${money} ${localizeCurrency(currency, t)}`
}
