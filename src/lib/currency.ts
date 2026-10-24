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
  if (label && label !== key) return label

  return raw.toUpperCase()
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
