import type { JournalRow } from '@/lib/business'
import {
  translateTransactionDescription,
  translateTransactionLabel,
} from '@/lib/companyDashboard'
import { localizeCurrency } from '@/lib/currency'
import { formatAfghanDateValue } from '@/lib/datetime'

type Translate = (key: string) => string

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function money(value: unknown): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return '—'
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function clock(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function rowDetail(row: JournalRow, t: Translate): string {
  const title = translateTransactionLabel(row, {
    credit: t('desktop.credit_in'),
    debit: t('desktop.debit_out'),
    sales: t('desktop.sales'),
    expenses: t('desktop.expenses'),
  })
  const account = row.account_name || t('desktop.account')
  const extra = translateTransactionDescription(row.description)
  return extra && extra !== title ? `${title} — ${account} — ${extra}` : `${title} — ${account}`
}

function chipsText(
  map: Record<string, number> | undefined,
  t: Translate,
  emptyLabel: string,
): string {
  const parts = Object.entries(map || {})
    .filter(([, amount]) => Number(amount) !== 0)
    .map(([currency, amount]) => `${money(amount)} ${localizeCurrency(currency, t)}`)
  return parts.length ? parts.join('  |  ') : emptyLabel
}

export function buildJournalPdfHtml(options: {
  rows: JournalRow[]
  date: string
  count?: number
  inByCurrency?: Record<string, number>
  outByCurrency?: Record<string, number>
  companyName: string
  logoUrl?: string | null
  companyPhone?: string | null
  companyAddress?: string | null
  t: Translate
  locale: 'fa' | 'ps' | 'en'
}): string {
  const {
    rows,
    date,
    count,
    inByCurrency,
    outByCurrency,
    companyName,
    logoUrl,
    companyPhone,
    companyAddress,
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

  const body = rows
    .map((row) => {
      const inAmount = Number(row.in_amount || 0)
      const outAmount = Number(row.out_amount || 0)
      return `<tr>
        <td>${escapeHtml(rowDetail(row, t))}</td>
        <td>${escapeHtml(localizeCurrency(row.currency, t))}</td>
        <td>${escapeHtml(inAmount > 0 ? money(inAmount) : '—')}</td>
        <td>${escapeHtml(outAmount > 0 ? money(outAmount) : '—')}</td>
        <td>${escapeHtml(money(row.balance_after))}</td>
        <td>${escapeHtml(clock(row.created_at))}</td>
      </tr>`
    })
    .join('')

  const table = rows.length
    ? `<table>
    <thead>
      <tr>
        <th>${escapeHtml(t('desktop.journal_detail'))}</th>
        <th>${escapeHtml(t('desktop.currency'))}</th>
        <th>${escapeHtml(t('desktop.credit_in'))}</th>
        <th>${escapeHtml(t('desktop.debit_out'))}</th>
        <th>${escapeHtml(t('desktop.journal_balance'))}</th>
        <th>${escapeHtml(t('desktop.journal_time'))}</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`
    : `<p class="muted">${escapeHtml(t('desktop.no_journal_on_date'))}</p>`

  const generatedAt = formatAfghanDateValue(new Date().toISOString(), locale)
  const metaParts = [companyPhone, companyAddress].filter((part) => String(part || '').trim()).join(' · ')
  const empty = t('desktop.no_data')

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(t('desktop.journal'))}</title>
  <style>
    @page { margin: 14mm; }
    body {
      margin: 0;
      padding: 12px;
      font-family: Tahoma, Arial, sans-serif;
      color: #111;
      font-size: 12px;
      line-height: 1.5;
      direction: ${dir};
      text-align: ${align};
      box-sizing: border-box;
      width: 190mm;
      background: #fff;
    }
    h1, h2, h3, p { margin: 0 0 6px; }
    .center { text-align: center; }
    .muted { color: #666; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
    th, td { border: 1px solid #ddd; padding: 6px; text-align: ${align}; vertical-align: top; }
    th { background: #f8fafc; font-weight: 700; }
    .summary { margin: 8px 0 4px; }
    .footer {
      margin-top: 18px;
      padding-top: 8px;
      border-top: 1px solid #eee;
      font-size: 10px;
      color: #666;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="center">
    ${logo}
    <h2>${escapeHtml(companyName || 'Hamyan')}</h2>
    ${metaParts ? `<p class="muted">${escapeHtml(metaParts)}</p>` : ''}
    <h3>${escapeHtml(t('desktop.journal'))}</h3>
    <p>${escapeHtml(formatAfghanDateValue(date, locale))}</p>
  </div>
  <p class="summary"><strong>${escapeHtml(t('desktop.transactions'))}:</strong> ${escapeHtml(String(count || rows.length || 0))}</p>
  <p class="summary"><strong>${escapeHtml(t('desktop.credit_in'))}:</strong> ${escapeHtml(chipsText(inByCurrency, t, empty))}</p>
  <p class="summary"><strong>${escapeHtml(t('desktop.debit_out'))}:</strong> ${escapeHtml(chipsText(outByCurrency, t, empty))}</p>
  ${table}
  <div class="footer">www.ishanch.com · ${escapeHtml(generatedAt)}</div>
</body>
</html>`
}
