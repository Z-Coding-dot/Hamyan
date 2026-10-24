import type {
  PartyDebtRecordRow,
  PartyDebtRow,
  PartyInvoiceRow,
  PartyPaymentRow,
  PartyPurchaseRow,
} from '@/lib/business'
import { localizeCurrency } from '@/lib/currency'
import { formatAfghanDateValue } from '@/lib/datetime'

type Translate = (key: string) => string

export type PartyShowPdfKind = 'customer' | 'vendor'

export type PartyShowPdfParty = {
  name?: string | null
  company_name?: string | null
  phone?: string | null
  email?: string | null
  address?: string | null
  personality?: string | null
  status?: number | boolean | null
  created_at?: string | null
  remark?: string | null
}

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

function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}

function debtLine(debts: PartyDebtRow[], t: Translate, emptyLabel: string): string {
  const rows = asArray(debts)
  if (!rows.length) return `<p class="muted">${escapeHtml(emptyLabel)}</p>`
  return `<p>${rows
    .map((d) => {
      const amount = Number(d.amount || 0)
      if (amount < 0) {
        return `${escapeHtml(localizeCurrency(d.currency, t))}: <strong>${escapeHtml(money(Math.abs(amount)))}</strong> (${escapeHtml(t('desktop.business_owes_customer'))})`
      }
      return `${escapeHtml(localizeCurrency(d.currency, t))}: <strong>${escapeHtml(money(d.amount))}</strong>`
    })
    .join(' &nbsp;|&nbsp; ')}</p>`
}

function recordsTable(
  rows: PartyDebtRecordRow[],
  t: Translate,
  locale: 'fa' | 'ps' | 'en',
  emptyLabel: string,
): string {
  const list = asArray(rows)
  if (!list.length) return `<p class="muted">${escapeHtml(emptyLabel)}</p>`
  const body = list
    .map((record) => {
      const reason = dash(record.description || record.reason)
      return `<tr>
        <td>${escapeHtml(dash(record.account_name))}</td>
        <td>${escapeHtml(localizeCurrency(record.currency, t))}</td>
        <td>${escapeHtml(money(record.previous_amount))}</td>
        <td>${escapeHtml(money(record.change_amount))}</td>
        <td>${escapeHtml(money(record.new_amount))}</td>
        <td>${escapeHtml(reason)}</td>
        <td>${escapeHtml(formatAfghanDateValue(record.created_at, locale))}</td>
      </tr>`
    })
    .join('')
  return `<table>
    <thead>
      <tr>
        <th>${escapeHtml(t('desktop.account'))}</th>
        <th>${escapeHtml(t('desktop.currency'))}</th>
        <th>${escapeHtml(t('desktop.previous_amount'))}</th>
        <th>${escapeHtml(t('desktop.change_amount'))}</th>
        <th>${escapeHtml(t('desktop.new_amount'))}</th>
        <th>${escapeHtml(t('desktop.description'))}</th>
        <th>${escapeHtml(t('desktop.date'))}</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`
}

function paymentsTable(
  rows: PartyPaymentRow[],
  t: Translate,
  locale: 'fa' | 'ps' | 'en',
  emptyLabel: string,
): string {
  const list = asArray(rows)
  if (!list.length) return `<p class="muted">${escapeHtml(emptyLabel)}</p>`
  const body = list
    .map(
      (payment) => `<tr>
        <td>${escapeHtml(dash(payment.account_name))}</td>
        <td>${escapeHtml(money(payment.amount))}</td>
        <td>${escapeHtml(localizeCurrency(payment.currency, t))}</td>
        <td>${escapeHtml(dash(payment.description))}</td>
        <td>${escapeHtml(formatAfghanDateValue(payment.created_at, locale))}</td>
      </tr>`,
    )
    .join('')
  return `<table>
    <thead>
      <tr>
        <th>${escapeHtml(t('desktop.account'))}</th>
        <th>${escapeHtml(t('desktop.amount'))}</th>
        <th>${escapeHtml(t('desktop.currency'))}</th>
        <th>${escapeHtml(t('desktop.description'))}</th>
        <th>${escapeHtml(t('desktop.date'))}</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`
}

function invoicesTable(
  rows: PartyInvoiceRow[],
  t: Translate,
  locale: 'fa' | 'ps' | 'en',
  emptyLabel: string,
): string {
  const list = asArray(rows)
  if (!list.length) return `<p class="muted">${escapeHtml(emptyLabel)}</p>`
  const body = list
    .map(
      (invoice, index) => `<tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(dash(invoice.invoice_number))}</td>
        <td>${escapeHtml(String(invoice.items_count ?? 0))}</td>
        <td>${escapeHtml(money(invoice.total_price))}</td>
        <td>${escapeHtml(money(invoice.paid_amount))}</td>
        <td>${escapeHtml(money(invoice.remaining_amount))}</td>
        <td>${escapeHtml(localizeCurrency(invoice.currency, t))}</td>
        <td>${escapeHtml(formatAfghanDateValue(invoice.created_at, locale))}</td>
      </tr>`,
    )
    .join('')
  return `<table>
    <thead>
      <tr>
        <th>#</th>
        <th>${escapeHtml(t('desktop.invoice_number'))}</th>
        <th>${escapeHtml(t('desktop.item_rows'))}</th>
        <th>${escapeHtml(t('desktop.invoice_total'))}</th>
        <th>${escapeHtml(t('desktop.paid_amount'))}</th>
        <th>${escapeHtml(t('desktop.remaining_amount'))}</th>
        <th>${escapeHtml(t('desktop.currency'))}</th>
        <th>${escapeHtml(t('desktop.date'))}</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`
}

function purchasesTable(
  rows: PartyPurchaseRow[],
  t: Translate,
  locale: 'fa' | 'ps' | 'en',
  emptyLabel: string,
): string {
  const list = asArray(rows)
  if (!list.length) return `<p class="muted">${escapeHtml(emptyLabel)}</p>`
  const body = list
    .map(
      (purchase, index) => `<tr>
        <td>${index + 1}</td>
        <td>${escapeHtml(dash(purchase.purchase_number ?? purchase.id))}</td>
        <td>${escapeHtml(String(purchase.items_count ?? 0))}</td>
        <td>${escapeHtml(money(purchase.total_price))}</td>
        <td>${escapeHtml(money(purchase.paid_amount))}</td>
        <td>${escapeHtml(money(purchase.remaining_amount))}</td>
        <td>${escapeHtml(localizeCurrency(purchase.currency, t))}</td>
        <td>${escapeHtml(formatAfghanDateValue(purchase.created_at, locale))}</td>
      </tr>`,
    )
    .join('')
  return `<table>
    <thead>
      <tr>
        <th>#</th>
        <th>${escapeHtml(t('desktop.purchase_number'))}</th>
        <th>${escapeHtml(t('desktop.item_rows'))}</th>
        <th>${escapeHtml(t('desktop.invoice_total'))}</th>
        <th>${escapeHtml(t('desktop.paid_amount'))}</th>
        <th>${escapeHtml(t('desktop.remaining_amount'))}</th>
        <th>${escapeHtml(t('desktop.currency'))}</th>
        <th>${escapeHtml(t('desktop.date'))}</th>
      </tr>
    </thead>
    <tbody>${body}</tbody>
  </table>`
}

/**
 * A4 HTML for customer/vendor show — kept simple so html2canvas/jsPDF stay reliable.
 */
export function buildPartyShowPdfHtml(options: {
  kind: PartyShowPdfKind
  party: PartyShowPdfParty
  debts: PartyDebtRow[]
  debtRecords: PartyDebtRecordRow[]
  payments: PartyPaymentRow[]
  invoices?: PartyInvoiceRow[]
  purchases?: PartyPurchaseRow[]
  companyName: string
  logoUrl?: string | null
  companyPhone?: string | null
  companyAddress?: string | null
  t: Translate
  locale: 'fa' | 'ps' | 'en'
  includeLogo?: boolean
}): string {
  const {
    kind,
    party,
    debts,
    debtRecords,
    payments,
    invoices,
    purchases,
    companyName,
    logoUrl,
    companyPhone,
    companyAddress,
    t,
    locale,
    includeLogo = true,
  } = options

  const isRtl = locale !== 'en'
  const dir = isRtl ? 'rtl' : 'ltr'
  const align = isRtl ? 'right' : 'left'
  const title =
    kind === 'customer' ? t('desktop.customer_details') : t('desktop.vendor_details')
  const displayName =
    kind === 'customer'
      ? party.name || party.company_name || t('desktop.customers')
      : party.name || t('desktop.vendor')
  const balanceLabel = kind === 'customer' ? t('desktop.receivables') : t('desktop.payables')
  const recordsTitle =
    kind === 'customer'
      ? t('desktop.customer_payables_records')
      : t('desktop.vendor_payables_records')
  const paymentsTitle =
    kind === 'customer' ? t('desktop.customer_payments_list') : t('desktop.vendor_payments_list')
  const emptyDebts =
    kind === 'customer' ? t('desktop.no_receivables_summary') : t('desktop.no_payables_summary')

  const personality =
    party.personality === 'company'
      ? t('desktop.personality_company')
      : party.personality
        ? t('desktop.personality_human')
        : '—'
  const statusLabel =
    party.status === undefined || party.status === null
      ? '—'
      : party.status
        ? t('desktop.active')
        : t('desktop.inactive')

  const safeLogo =
    includeLogo && logoUrl && /^https?:\/\//i.test(String(logoUrl))
      ? String(logoUrl).replace(/"/g, '')
      : null
  const logo = safeLogo
    ? `<img src="${safeLogo}" alt="${escapeHtml(companyName)}" style="max-height:56px;max-width:110px;object-fit:contain;margin:0 auto 8px;display:block;" />`
    : ''

  const infoLines: Array<[string, string]> = [[t('desktop.name'), dash(party.name)]]
  if (kind === 'customer') {
    infoLines.push([t('desktop.company_name'), dash(party.company_name)])
    infoLines.push([t('desktop.personality'), personality])
  }
  infoLines.push(
    [t('desktop.phone'), dash(party.phone)],
    [t('desktop.email'), dash(party.email)],
    [t('desktop.address'), dash(party.address)],
  )
  if (kind === 'customer') {
    infoLines.push([t('desktop.status'), statusLabel])
    infoLines.push([t('desktop.created_at'), formatAfghanDateValue(party.created_at, locale)])
  }
  if (kind === 'vendor' && party.remark) {
    infoLines.push([t('desktop.description'), dash(party.remark)])
  }

  const infoHtml = infoLines
    .map(
      ([label, value]) =>
        `<p><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</p>`,
    )
    .join('')

  const generatedAt = formatAfghanDateValue(new Date().toISOString(), locale)
  const metaParts = [dash(companyPhone), companyAddress ? dash(companyAddress) : '']
    .filter((part) => part && part !== '—')
    .join(' · ')

  const purchasesSection =
    kind === 'customer'
      ? `<div class="section">
    <div class="section-title">${escapeHtml(t('desktop.customer_purchases'))}</div>
    ${invoicesTable(asArray(invoices), t, locale, t('desktop.no_sales'))}
  </div>`
      : `<div class="section">
    <div class="section-title">${escapeHtml(t('desktop.vendor_purchases'))}</div>
    ${purchasesTable(asArray(purchases), t, locale, t('desktop.no_purchases'))}
  </div>`

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)} — ${escapeHtml(displayName)}</title>
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
    .section { margin-top: 14px; }
    .section-title {
      font-size: 13px;
      font-weight: 700;
      margin-bottom: 6px;
      padding-bottom: 4px;
      border-bottom: 1px solid #e5e7eb;
      color: #5c3618;
    }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 6px; }
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
    <h3>${escapeHtml(title)}</h3>
    <p><strong>${escapeHtml(displayName)}</strong></p>
  </div>

  <div class="section">
    <div class="section-title">${escapeHtml(title)}</div>
    ${infoHtml}
  </div>

  ${purchasesSection}

  <div class="section">
    <div class="section-title">${escapeHtml(balanceLabel)}</div>
    ${debtLine(debts, t, emptyDebts)}
  </div>

  <div class="section">
    <div class="section-title">${escapeHtml(recordsTitle)}</div>
    ${recordsTable(debtRecords, t, locale, t('desktop.no_payables_records'))}
  </div>

  <div class="section">
    <div class="section-title">${escapeHtml(paymentsTitle)}</div>
    ${paymentsTable(payments, t, locale, t('desktop.no_payments'))}
  </div>

  <div class="footer">
    <p>Hamyan · ${escapeHtml(t('desktop.created_at'))}: ${escapeHtml(generatedAt)}</p>
  </div>
</body>
</html>`
}
