import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'

import {
  downloadInvoiceImage,
  downloadInvoicePdf,
  printInvoice,
  type InvoicePaperSize,
  type InvoicePrintTheme,
} from '@/lib/invoicePrint'
import { InvoiceThemePicker } from '@/pages/company/InvoiceThemePicker'

type Props = {
  invoiceRef: RefObject<HTMLElement | null>
  invoiceNumber?: string | number | null
  canPrintWithEquivalent: boolean
  showEquivalentInPrint: boolean
  onShowEquivalentChange: (value: boolean) => void
  canPrintWithPreviousRemaining?: boolean
  showPreviousRemainingInPrint?: boolean
  onShowPreviousRemainingChange?: (value: boolean) => void
  onPaperSizeChange: (size: InvoicePaperSize) => void
  printTheme?: InvoicePrintTheme
  onPrintThemeChange?: (theme: InvoicePrintTheme) => void
  /** When false, theme picker is rendered beside the bill instead. */
  showThemePicker?: boolean
  busy?: boolean
  onBusyChange?: (busy: boolean) => void
  onError?: (message: string | null) => void
}

export function SaleInvoicePrintActions({
  invoiceRef,
  invoiceNumber,
  canPrintWithEquivalent,
  showEquivalentInPrint,
  onShowEquivalentChange,
  canPrintWithPreviousRemaining = false,
  showPreviousRemainingInPrint = false,
  onShowPreviousRemainingChange,
  onPaperSizeChange,
  printTheme = 'classic',
  onPrintThemeChange,
  showThemePicker = true,
  busy = false,
  onBusyChange,
  onError,
}: Props) {
  const { t } = useTranslation()

  const withExport = async (action: () => Promise<void>) => {
    onBusyChange?.(true)
    onError?.(null)
    try {
      await action()
    } catch {
      onError?.(t('desktop.invoice_export_failed'))
    } finally {
      onBusyChange?.(false)
    }
  }

  const handlePrint = (paperSize: InvoicePaperSize) => {
    onPaperSizeChange(paperSize)
    // Give React a tick to apply paper size / theme classes before print.
    window.setTimeout(() => printInvoice(paperSize), 50)
  }

  const handlePdf = (paperSize: InvoicePaperSize) => {
    const el = invoiceRef.current
    if (!el) {
      onError?.(t('desktop.invoice_export_failed'))
      return
    }
    void withExport(() => downloadInvoicePdf(el, invoiceNumber, paperSize, onPaperSizeChange))
  }

  const handleImage = (paperSize: InvoicePaperSize) => {
    const el = invoiceRef.current
    if (!el) {
      onError?.(t('desktop.invoice_export_failed'))
      return
    }
    void withExport(() => downloadInvoiceImage(el, invoiceNumber, paperSize, onPaperSizeChange))
  }

  return (
    <div className="invoice-print-actions no-print" dir="rtl">
      {canPrintWithEquivalent ? (
        <label className="invoice-print-equivalent check-row">
          <input
            type="checkbox"
            checked={showEquivalentInPrint}
            onChange={(e) => onShowEquivalentChange(e.target.checked)}
            disabled={busy}
          />
          {t('desktop.print_with_equivalent')}
        </label>
      ) : null}

      {canPrintWithPreviousRemaining && onShowPreviousRemainingChange ? (
        <label className="invoice-print-equivalent check-row">
          <input
            type="checkbox"
            checked={showPreviousRemainingInPrint}
            onChange={(e) => onShowPreviousRemainingChange(e.target.checked)}
            disabled={busy}
          />
          {t('desktop.print_with_previous_remaining')}
        </label>
      ) : null}

      {showThemePicker && onPrintThemeChange ? (
        <InvoiceThemePicker
          value={printTheme}
          onChange={onPrintThemeChange}
          busy={busy}
          variant="stack"
        />
      ) : null}

      <button type="button" className="btn-primary" disabled={busy} onClick={() => handlePrint('a5')}>
        <i className="fa-solid fa-print" /> {t('desktop.print_invoice_a5')}
      </button>
      <button type="button" className="btn-primary" disabled={busy} onClick={() => handlePrint('80mm')}>
        <i className="fa-solid fa-print" /> {t('desktop.print_invoice_80mm')}
      </button>
      <button type="button" className="btn-primary" disabled={busy} onClick={() => handlePdf('a5')}>
        <i className="fa-solid fa-file-pdf" /> {t('desktop.download_pdf_a5')}
      </button>
      <button type="button" className="btn-primary" disabled={busy} onClick={() => handlePdf('80mm')}>
        <i className="fa-solid fa-file-pdf" /> {t('desktop.download_pdf_80mm')}
      </button>
      <button type="button" className="btn-primary" disabled={busy} onClick={() => handleImage('a5')}>
        <i className="fa-solid fa-image" /> {t('desktop.download_image_a5')}
      </button>
      <button type="button" className="btn-primary" disabled={busy} onClick={() => handleImage('80mm')}>
        <i className="fa-solid fa-image" /> {t('desktop.download_image_80mm')}
      </button>
    </div>
  )
}
