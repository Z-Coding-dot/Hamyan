import type { AccountTransferRow } from '@/lib/business'
import { localizeCurrency } from '@/lib/currency'
import { formatAfghanDateValue, formatJalaliDateTime } from '@/lib/datetime'

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

function dash(value: unknown): string {
  const text = String(value ?? '').trim()
  return text || '—'
}

function totalsByCurrency(rows: AccountTransferRow[], t: Translate): string {
  const map = new Map<string, number>()
  for (const row of rows) {
    const currency = String(row.currency || '').toLowerCase() || '—'
    map.set(currency, (map.get(currency) || 0) + Number(row.amount || 0))
  }
  const parts = [...map.entries()]
    .filter(([, amount]) => Number(amount) !== 0)
    .map(([currency, amount]) => `${money(amount)} ${localizeCurrency(currency, t)}`)
  return parts.length ? parts.join('  |  ') : t('desktop.no_data')
}

export function buildAccountTransfersPdfHtml(options: {
  rows: AccountTransferRow[]
  search?: string
  companyName: string
  logoUrl?: string | null
  companyPhone?: string | null
  companyAddress?: string | null
  t: Translate
  locale: 'fa' | 'ps' | 'en'
}): string {
  const {
    rows,
    search,
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
    .map(
      (row) => `<tr>
        <td>${escapeHtml(row.id)}</td>
        <td>${escapeHtml(formatJalaliDateTime(row.created_at, locale))}</td>
        <td>${escapeHtml(dash(row.from_account_name))}</td>
        <td>${escapeHtml(dash(row.to_account_name))}</td>
        <td>${escapeHtml(money(row.amount))}</td>
        <td>${escapeHtml(localizeCurrency(row.currency, t))}</td>
        <td>${escapeHtml(dash(row.remark))}</td>
      </tr>`,
    )
    .join('')

  const table = rows.length
    ? `<table>
    <thead>
      <tr>
        <th>#</th>
        <th>${escapeHtml(t('desktop.date'))}</th>
        <th>${escapeHtml(t('desktop.transfer_from_account'))}</th>
        <th>${escapeHtml(t('desktop.transfer_to_account'))}</th>
        <th>${escapeHtml(t('desktop.amount'))}</th>
        <th>${escapeHtml(t('desktop.currency'))}</th>
        <th>${escapeHtml(t('desktop.remark'))}</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`
    : `<p class="muted">${escapeHtml(t('desktop.no_account_transfers'))}</p>`

  const generatedAt = formatAfghanDateValue(new Date().toISOString(), locale)
  const metaParts = [companyPhone, companyAddress].filter((part) => String(part || '').trim()).join(' · ')

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(t('desktop.account_transfers'))}</title>
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
    <h3>${escapeHtml(t('desktop.account_transfers'))}</h3>
  </div>
  <p class="summary"><strong>${escapeHtml(t('desktop.account_transfers'))}:</strong> ${escapeHtml(String(rows.length))}</p>
  <p class="summary"><strong>${escapeHtml(t('desktop.amount'))}:</strong> ${escapeHtml(totalsByCurrency(rows, t))}</p>
  ${search ? `<p class="summary"><strong>${escapeHtml(t('desktop.search'))}:</strong> ${escapeHtml(search)}</p>` : ''}
  ${table}
  <div class="footer">www.ishanch.com · ${escapeHtml(generatedAt)}</div>
</body>
</html>`
}
