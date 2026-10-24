import { localizeCurrency } from '@/lib/currency'
import { formatAfghanDateValue } from '@/lib/datetime'
import type { SalesProfitLossSummary } from '@/lib/business'

type Translate = (key: string, options?: Record<string, unknown>) => string

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function money(value: unknown): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return '0'
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function line(
  label: string,
  sell: unknown,
  sellCurrency: string | null | undefined,
  capital: unknown | undefined,
  capitalCurrency: string | null | undefined,
  accountsDiffer: boolean,
  t: Translate,
  emphasize = false,
): string {
  const sellText = `${money(sell)} ${escapeHtml(localizeCurrency(sellCurrency || '', t))}`
  const capitalText =
    accountsDiffer && capitalCurrency
      ? ` / ${money(capital)} ${escapeHtml(localizeCurrency(capitalCurrency, t))}`
      : ''
  const weight = emphasize ? 'font-weight:800;' : ''
  const color = emphasize
    ? Number(sell) < 0
      ? 'color:#b91c1c;'
      : 'color:#0f7a4a;'
    : ''
  return `<tr>
    <td style="padding:8px 10px;border-bottom:1px solid #eee;${weight}">${escapeHtml(label)}</td>
    <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:left;${weight}${color}">${sellText}${capitalText}</td>
  </tr>`
}

export function buildProfitLossReportPdfHtml(options: {
  summary: SalesProfitLossSummary
  companyName: string
  logoUrl?: string | null
  companyPhone?: string | null
  companyAddress?: string | null
  from?: string | null
  to?: string | null
  sellCurrency?: string | null
  capitalCurrency?: string | null
  accountsDiffer?: boolean
  t: Translate
  locale: 'fa' | 'ps' | 'en'
}): string {
  const {
    summary,
    companyName,
    logoUrl,
    companyPhone,
    companyAddress,
    from,
    to,
    sellCurrency,
    capitalCurrency,
    accountsDiffer = false,
    t,
    locale,
  } = options

  const isRtl = locale !== 'en'
  const dir = isRtl ? 'rtl' : 'ltr'
  const align = isRtl ? 'right' : 'left'
  const safeLogo =
    logoUrl && /^https?:\/\//i.test(String(logoUrl)) ? String(logoUrl).replace(/"/g, '') : null
  const logo = safeLogo
    ? `<img src="${safeLogo}" alt="${escapeHtml(companyName)}" style="max-height:56px;max-width:110px;object-fit:contain;margin:0 auto 8px;display:block;" />`
    : ''

  const rangeParts: string[] = []
  if (from) rangeParts.push(`${t('desktop.date_from')}: ${formatAfghanDateValue(from, locale)}`)
  if (to) rangeParts.push(`${t('desktop.date_to')}: ${formatAfghanDateValue(to, locale)}`)

  const rows = [
    line(
      t('desktop.pl_gross_sales'),
      summary.gross_sales_sell,
      sellCurrency,
      summary.gross_sales_capital,
      capitalCurrency,
      accountsDiffer,
      t,
    ),
    line(
      t('desktop.pl_cogs'),
      summary.cogs_sell,
      sellCurrency,
      summary.cogs_capital,
      capitalCurrency,
      accountsDiffer,
      t,
    ),
    line(
      t('desktop.pl_gross_profit'),
      summary.gross_profit_sell,
      sellCurrency,
      summary.gross_profit_capital,
      capitalCurrency,
      accountsDiffer,
      t,
    ),
    line(
      t('desktop.pl_discounts'),
      summary.discounts_sell,
      sellCurrency,
      summary.discounts_capital,
      capitalCurrency,
      accountsDiffer,
      t,
    ),
    line(
      t('desktop.pl_expenses'),
      summary.expenses_sell,
      sellCurrency,
      summary.expenses_capital,
      capitalCurrency,
      accountsDiffer,
      t,
    ),
  ]

  if (Number(summary.transfer_costs_sell) > 0 || Number(summary.transfer_costs_capital) > 0) {
    rows.push(
      line(
        t('desktop.pl_transfer_costs'),
        summary.transfer_costs_sell,
        sellCurrency,
        summary.transfer_costs_capital,
        capitalCurrency,
        accountsDiffer,
        t,
      ),
    )
  }

  rows.push(
    line(
      t('desktop.pl_net_profit'),
      summary.net_profit_sell,
      sellCurrency,
      summary.net_profit_capital,
      capitalCurrency,
      accountsDiffer,
      t,
      true,
    ),
  )

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(t('desktop.profit_loss_report'))}</title>
<style>
  body{font-family:Tahoma,Arial,sans-serif;color:#111;margin:0;padding:18px;direction:${dir};text-align:${align};}
  h1{font-size:18px;margin:0 0 6px;text-align:center;}
  .meta{font-size:12px;color:#555;text-align:center;margin-bottom:14px;}
  table{width:100%;border-collapse:collapse;font-size:13px;}
  .foot{margin-top:16px;font-size:11px;color:#666;text-align:center;}
</style>
</head>
<body>
  ${logo}
  <h1>${escapeHtml(companyName)}</h1>
  <div class="meta">${escapeHtml(t('desktop.profit_loss_report'))}</div>
  ${rangeParts.length ? `<div class="meta">${escapeHtml(rangeParts.join(' · '))}</div>` : ''}
  <table>
    <tbody>${rows.join('')}</tbody>
  </table>
  <div class="foot">
    ${companyPhone ? `${escapeHtml(t('desktop.phone'))}: ${escapeHtml(companyPhone)}` : ''}
    ${companyAddress ? `<br/>${escapeHtml(t('desktop.address'))}: ${escapeHtml(companyAddress)}` : ''}
  </div>
</body>
</html>`
}
