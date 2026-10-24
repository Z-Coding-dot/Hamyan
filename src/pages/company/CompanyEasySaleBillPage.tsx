import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import {
  fetchEasySaleSetup,
  type QuickSaleExchangeRateContext,
  type SaleInvoiceShow,
} from '@/lib/business'
import type { InvoicePaperSize, InvoicePrintTheme } from '@/lib/invoicePrint'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import { InvoiceThemePicker } from '@/pages/company/InvoiceThemePicker'
import { SaleInvoiceBill } from '@/pages/company/SaleInvoiceBill'
import { SaleInvoicePrintActions } from '@/pages/company/SaleInvoicePrintActions'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyEasySaleBillPage() {
  const { t } = useTranslation()
  const { companyId = '', invoiceId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const invoiceRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<SaleInvoiceShow | null>(null)
  const [rateContext, setRateContext] = useState<QuickSaleExchangeRateContext | null>(null)
  const [showEquivalentInPrint, setShowEquivalentInPrint] = useState(false)
  const [showPreviousRemainingInPrint, setShowPreviousRemainingInPrint] = useState(false)
  const [printPaperSize, setPrintPaperSize] = useState<InvoicePaperSize>('a5')
  const [printTheme, setPrintTheme] = useState<InvoicePrintTheme>('classic')

  useEffect(() => {
    let active = true
    const load = async () => {
      if (!token || !companyId || !invoiceId) return
      setLoading(true)
      setError(null)
      try {
        const setup = await fetchEasySaleSetup(token, companyId, invoiceId)
        if (!active) return
        setInvoice(setup.invoice)
        setRateContext(setup.exchangeRateContext ?? null)
      } catch (err) {
        if (!active) return
        setError(getApiErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [token, companyId, invoiceId])

  const canPrintWithEquivalent = useMemo(() => {
    const from = String(
      rateContext?.from_currency || invoice?.exchange_rate?.from_currency || '',
    ).toLowerCase()
    const to = String(
      rateContext?.to_currency || invoice?.exchange_rate?.to_currency || '',
    ).toLowerCase()
    return Boolean(from && to && from !== to)
  }, [rateContext, invoice])

  if (loading) return <div className="loading-state">{t('desktop.loading')}</div>
  if (error && !invoice) return <div className="alert-error">{error}</div>
  if (!invoice) return null

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-summary">
        <h5 style={{ marginTop: 0 }}>{t('desktop.easy_sale')}</h5>
        {error ? <div className="alert-error no-print">{error}</div> : null}

        <div className="invoice-bill-stage">
          <aside className="invoice-bill-stage__themes">
            <InvoiceThemePicker
              value={printTheme}
              onChange={setPrintTheme}
              busy={busy}
              variant="side"
            />
          </aside>
          <div className="invoice-bill-stage__bill">
            <SaleInvoiceBill
              ref={invoiceRef}
              invoice={invoice}
              company={business.company}
              profile={business.profile}
              exchangeRateContext={rateContext}
              showEquivalentInPrint={showEquivalentInPrint}
              showPreviousRemainingInPrint={showPreviousRemainingInPrint}
              printPaperSize={printPaperSize}
              printTheme={printTheme}
            />
          </div>
        </div>

        <div className="quick-sale-complete-actions no-print">
          <SaleInvoicePrintActions
            invoiceRef={invoiceRef}
            invoiceNumber={invoice.invoice_number}
            canPrintWithEquivalent={canPrintWithEquivalent}
            showEquivalentInPrint={showEquivalentInPrint}
            onShowEquivalentChange={setShowEquivalentInPrint}
            canPrintWithPreviousRemaining={Boolean(invoice.customer_id)}
            showPreviousRemainingInPrint={showPreviousRemainingInPrint}
            onShowPreviousRemainingChange={setShowPreviousRemainingInPrint}
            onPaperSizeChange={setPrintPaperSize}
            printTheme={printTheme}
            onPrintThemeChange={setPrintTheme}
            showThemePicker={false}
            busy={busy}
            onBusyChange={setBusy}
            onError={setError}
          />
          <Link to={businessPath(companyId, 'easy-sale')} className="btn-primary">
            {t('desktop.easy_sale_new')}
          </Link>
        </div>
      </div>
    </div>
  )
}
