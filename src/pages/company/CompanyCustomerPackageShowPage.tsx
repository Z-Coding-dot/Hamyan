import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import {
  deleteCustomerInternetPackage,
  fetchCustomerInternetPackage,
  type CustomerInternetPackageRow,
} from '@/lib/business'
import type { InvoicePaperSize, InvoicePrintTheme } from '@/lib/invoicePrint'
import type { BusinessShowData } from '@/lib/user'
import { PackageSaleBill } from '@/pages/company/PackageSaleBill'
import { SaleInvoicePrintActions } from '@/pages/company/SaleInvoicePrintActions'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyCustomerPackageShowPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '', saleId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const canDelete = Boolean(business.permissions?.canDeleteRecords) && business.is_active
  const [row, setRow] = useState<CustomerInternetPackageRow | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [printPaperSize, setPrintPaperSize] = useState<InvoicePaperSize>('a5')
  const [printTheme, setPrintTheme] = useState<InvoicePrintTheme>('classic')
  const billRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token || !saleId) return
    setLoading(true)
    void fetchCustomerInternetPackage(token, companyId, saleId)
      .then(setRow)
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false))
  }, [token, companyId, saleId])

  const remove = async () => {
    if (!token || !row) return
    setBusy(true)
    setError(null)
    try {
      await deleteCustomerInternetPackage(token, companyId, row.id)
      showSuccessToast(t('desktop.package_sale_deleted'))
      navigate(businessPath(companyId, 'customer-packages'))
    } catch (err) {
      setError(getApiErrorMessage(err))
      setConfirmOpen(false)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!row) {
    return <div className="alert-error">{error || t('desktop.no_records')}</div>
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar no-print">
        <Link className="btn-secondary btn-sm" to={businessPath(companyId, 'customer-packages')}>
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        {canDelete ? (
          <button type="button" className="btn-danger btn-sm" onClick={() => setConfirmOpen(true)}>
            <i className="fa-solid fa-trash" /> {t('desktop.delete')}
          </button>
        ) : null}
      </div>

      {error ? <div className="alert-error no-print">{error}</div> : null}

      <PackageSaleBill
        ref={billRef}
        sale={{
          id: row.id,
          customerName: row.customer_name || '—',
          customerPhone: row.customer_phone,
          packageName: row.package_name,
          dataAmount: row.data_amount,
          dataUnit: row.data_unit,
          startDate: row.start_date || '',
          endDate: row.end_date || '',
          price: Number(row.price),
          paid: Number(row.paid_amount),
          remaining: Number(row.remaining_amount),
          currency: row.currency,
          note: row.note,
        }}
        company={business.company}
        profile={business.profile}
        printPaperSize={printPaperSize}
        printTheme={printTheme}
      />

      <div className="party-summary party-summary--complete mt-3 no-print">
        <SaleInvoicePrintActions
          invoiceRef={billRef}
          invoiceNumber={row.id}
          canPrintWithEquivalent={false}
          showEquivalentInPrint={false}
          onShowEquivalentChange={() => undefined}
          onPaperSizeChange={setPrintPaperSize}
          printTheme={printTheme}
          onPrintThemeChange={setPrintTheme}
          busy={busy}
          onBusyChange={setBusy}
          onError={setError}
        />
      </div>

      <Modal open={confirmOpen} onClose={() => !busy && setConfirmOpen(false)} title={t('desktop.package_sale_delete_title')}>
        <p>{t('desktop.package_sale_delete_body')}</p>
        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={busy} onClick={() => setConfirmOpen(false)}>
            {t('desktop.cancel')}
          </button>
          <button type="button" className="btn-danger" disabled={busy} onClick={() => void remove()}>
            {busy ? t('desktop.processing') : t('desktop.delete')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
