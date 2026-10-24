export const INCOME_CATEGORIES = [
  'salary',
  'project',
  'prize',
  'gift',
  'rent',
  'sale',
  'profit',
  'other',
] as const

export type IncomeCategory = (typeof INCOME_CATEGORIES)[number]

export function incomeCategoryKey(code?: string | null): string | null {
  if (!code) return null
  return (INCOME_CATEGORIES as readonly string[]).includes(code) ? `desktop.income_cat_${code}` : null
}

type TxTitleRow = {
  type?: string | null
  section?: string | number | null
  counterparty_name?: string | null
  income_category?: string | null
  exchange?: boolean | null
  exchange_peer_currency?: string | null
}

export function personalTxTitle(
  row: TxTitleRow,
  t: (key: string, options?: Record<string, string>) => string,
  expenseMap: Record<string, string>,
): string {
  const isCredit = row.type === 'credit'
  if (row.exchange) {
    const peer = row.exchange_peer_currency || '—'
    return isCredit
      ? t('desktop.hy_fx_tx_in', { currency: peer })
      : t('desktop.hy_fx_tx_out', { currency: peer })
  }
  if (row.counterparty_name) {
    const verb = isCredit ? t('desktop.cp_incoming') : t('desktop.cp_outgoing')
    return `${verb}: ${row.counterparty_name}`
  }
  if (isCredit) {
    const key = incomeCategoryKey(row.income_category)
    return key ? t(key) : t('desktop.dash_inject')
  }
  const section = expenseMap[String(row.section ?? '')]
  if (section) return section
  return t('desktop.withdraw')
}
