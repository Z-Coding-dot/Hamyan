import type { BusinessSaleRow } from '@/lib/business'
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

function dash(value: unknown): string {
  const text = String(value ?? '').trim()
  return text || '—'
}

export function buildSalesListPdfHtml(options: {
  rows: BusinessSaleRow[]
  totalsText: string
  companyName: string
  logoUrl?: string | null
  companyPhone?: string | null
  companyAddress?: string | null
  filters?: { search?: string; date_from?: string; date_to?: string; currency?: string; status?: string }
  t: Translate
  locale: 'fa' | 'ps' | 'en'
}): string {
  const {
    rows,
    totalsText,
    companyName,
    logoUrl,
    companyPhone,
    companyAddress,
    filters,
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

  const filterParts: string[] = []
  if (filters?.search) filterParts.push(`${t('desktop.search')}: ${filters.search}`)
  if (filters?.date_from) {
    filterParts.push(`${t('desktop.date_from')}: ${formatAfghanDateValue(filters.date_from, locale)}`)
  }
  if (filters?.date_to) {
    filterParts.push(`${t('desktop.date_to')}: ${formatAfghanDateValue(filters.date_to, locale)}`)
  }
  if (filters?.currency) {
    filterParts.push(`${t('desktop.currency')}: ${localizeCurrency(filters.currency, t)}`)
  }
  if (filters?.status === 'draft') {
    filterParts.push(`${t('desktop.status')}: ${t('desktop.draft')}`)
  } else if (filters?.status === 'completed') {
    filterParts.push(`${t('desktop.status')}: ${t('desktop.finalized')}`)
  }

  const body = rows
    .map((row) => {
      const dateValue = row.sale_date || row.created_at
      const isDraft = Number(row.status) !== 1
      return `<tr>
        <td>${escapeHtml(dash(row.invoice_number ?? row.id))}</td>
        <td>${escapeHtml(dash(row.customer_name))}</td>
        <td>${escapeHtml(money(row.total_price))} ${escapeHtml(localizeCurrency(row.currency, t))}</td>
        <td>${escapeHtml(money(row.paid_amount))} ${escapeHtml(localizeCurrency(row.currency, t))}</td>
        <td>${escapeHtml(money(row.remaining_amount))} ${escapeHtml(localizeCurrency(row.currency, t))}</td>
        <td>${escapeHtml(isDraft ? t('desktop.draft') : t('desktop.finalized'))}</td>
        <td>${escapeHtml(formatAfghanDateValue(dateValue, locale))}</td>
      </tr>`
    })
    .join('')

  const table = rows.length
    ? `<table>
    <thead>
      <tr>
        <th>#</th>
        <th>${escapeHtml(t('desktop.customers'))}</th>
        <th>${escapeHtml(t('desktop.amount'))}</th>
        <th>${escapeHtml(t('desktop.paid_amount'))}</th>
        <th>${escapeHtml(t('desktop.remaining_amount'))}</th>
        <th>${escapeHtml(t('desktop.status'))}</th>
        <th>${escapeHtml(t('desktop.date'))}</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`
    : `<p class="muted">${escapeHtml(t('desktop.no_sales'))}</p>`

  const generatedAt = formatAfghanDateValue(new Date().toISOString(), locale)
  const metaParts = [dash(companyPhone), companyAddress ? dash(companyAddress) : '']
    .filter((part) => part && part !== '—')
    .join(' · ')

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(t('desktop.sales'))}</title>
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
    <h3>${escapeHtml(t('desktop.sales'))}</h3>
  </div>
  ${filterParts.length ? `<p class="muted">${escapeHtml(filterParts.join(' · '))}</p>` : ''}
  <p><strong>${escapeHtml(t('desktop.total_sales'))}:</strong> ${escapeHtml(totalsText || '—')}</p>
  ${table}
  <div class="footer">www.ishanch.com · ${escapeHtml(generatedAt)}</div>
</body>
</html>`
}
