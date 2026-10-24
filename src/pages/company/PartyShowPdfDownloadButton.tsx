import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useOutletContext } from 'react-router-dom'

import { showErrorToast, showSuccessToast } from '@/components/ui/SuccessToast'
import type {
  PartyDebtRecordRow,
  PartyDebtRow,
  PartyInvoiceRow,
  PartyPaymentRow,
  PartyPurchaseRow,
} from '@/lib/business'
import { assetUrl } from '@/lib/config'
import { downloadHtmlAsA4Pdf } from '@/lib/invoicePrint'
import {
  buildPartyShowPdfHtml,
  type PartyShowPdfKind,
  type PartyShowPdfParty,
} from '@/lib/partyShowPdfHtml'
import type { BusinessShowData } from '@/lib/user'

type CompanyOutletContext = { business: BusinessShowData }

type Props = {
  kind: PartyShowPdfKind
  party: PartyShowPdfParty
  debts: PartyDebtRow[]
  debtRecords: PartyDebtRecordRow[]
  payments: PartyPaymentRow[]
  invoices?: PartyInvoiceRow[]
  purchases?: PartyPurchaseRow[]
  filenameSlug?: string
}

export function PartyShowPdfDownloadButton({
  kind,
  party,
  debts,
  debtRecords,
  payments,
  invoices,
  purchases,
  filenameSlug,
}: Props) {
  const { t, i18n } = useTranslation()
  const { business } = useOutletContext<CompanyOutletContext>()
  const [busy, setBusy] = useState(false)
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const companyName = business.company?.name || 'Hamyan'
  const logoUrl = assetUrl(business.company?.logo)
  const profile = (business.profile || {}) as {
    phone?: string | null
    address_dari?: string | null
    address_english?: string | null
  }
  const companyPhone = profile.phone || null
  const companyAddress =
    locale === 'en'
      ? profile.address_english || profile.address_dari || null
      : profile.address_dari || profile.address_english || null

  const download = async () => {
    setBusy(true)
    try {
      const html = buildPartyShowPdfHtml({
        kind,
        party,
        debts: Array.isArray(debts) ? debts : [],
        debtRecords: Array.isArray(debtRecords) ? debtRecords : [],
        payments: Array.isArray(payments) ? payments : [],
        invoices: Array.isArray(invoices) ? invoices : [],
        purchases: Array.isArray(purchases) ? purchases : [],
        companyName,
        logoUrl,
        companyPhone,
        companyAddress,
        t,
        locale,
        includeLogo: Boolean(logoUrl),
      })
      const slug =
        filenameSlug ||
        String(party.name || party.company_name || kind)
          .replace(/[^\w\u0600-\u06FF-]+/g, '-')
          .replace(/-+/g, '-')
          .slice(0, 40) ||
        kind
      await downloadHtmlAsA4Pdf(html, `${kind}-${slug}-a4.pdf`)
      showSuccessToast(t('desktop.saved_success'))
    } catch {
      showErrorToast(t('desktop.invoice_export_failed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      className="btn-outline-primary btn-sm"
      disabled={busy}
      onClick={() => void download()}
    >
      <i className="fa-solid fa-file-pdf" />{' '}
      {busy ? t('desktop.processing') : t('desktop.download_pdf_a4')}
    </button>
  )
}
