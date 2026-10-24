import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { todayLocalYmd } from '@/lib/datetime'
import {
  addPurchaseItem,
  backPurchaseToItems,
  completePurchase,
  fetchPurchaseShow,
  finalizePurchase,
  removePurchaseItem,
  updatePurchaseDate,
  updatePurchaseNotes,
  updatePurchaseWarehouse,
  type PurchaseCatalogItem,
  type PurchaseShow,
  type QuickSaleExchangeRateContext,
  type BusinessWarehouseRow,
} from '@/lib/business'
import type { InvoicePaperSize } from '@/lib/invoicePrint'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { businessPath } from '@/store/useCompanyContextStore'
import { scheduleBusinessDashboardRefresh } from '@/store/useListsCacheStore'
import { PurchaseInvoiceBill } from '@/pages/company/PurchaseInvoiceBill'
import { PurchaseItemSelection } from '@/pages/company/PurchaseItemSelection'
import { PurchasePayment } from '@/pages/company/PurchasePayment'
import { SaleInvoicePrintActions } from '@/pages/company/SaleInvoicePrintActions'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyPurchaseSetupPage() {
  const { t } = useTranslation()
  const { companyId = '', purchaseNumber = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const invoiceRef = useRef<HTMLDivElement | null>(null)

  const [purchase, setPurchase] = useState<PurchaseShow | null>(null)
  const [catalogItems, setCatalogItems] = useState<PurchaseCatalogItem[]>([])
  const [warehouses, setWarehouses] = useState<BusinessWarehouseRow[]>([])
  const [rateContext, setRateContext] = useState<QuickSaleExchangeRateContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false)
  const [showEquivalentInPrint, setShowEquivalentInPrint] = useState(false)
  const [printPaperSize, setPrintPaperSize] = useState<InvoicePaperSize>('a5')

  const [transferToWarehouse, setTransferToWarehouse] = useState(false)
  const [warehouseId, setWarehouseId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')

  const status = Number(purchase?.status ?? 0)
  const hasPayment = Boolean(purchase?.payment)
  const isDraft = status === 0 && !hasPayment
  const needsPay = status === 1 && !hasPayment
  const isClosed = status === 2 || hasPayment
  const hasItems = (purchase?.items?.length || 0) > 0
  const canEditWarehouse = isDraft && !hasItems
  const canManage =
    Boolean(business.permissions?.canManageInventory) && business.is_active

  const canPrintWithEquivalent = useMemo(() => {
    const fromCurrency = String(rateContext?.from_currency || purchase?.exchange_rate?.from_currency || '')
    const toCurrency = String(rateContext?.to_currency || purchase?.exchange_rate?.to_currency || '')
    return Boolean(fromCurrency && toCurrency && num(purchase?.exchange_rate?.rate) > 0)
  }, [rateContext, purchase])

  const load = async () => {
    if (!token || !companyId || !purchaseNumber) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchPurchaseShow(token, companyId, purchaseNumber)
      setPurchase(data.purchase)
      setCatalogItems(data.items || [])
      setWarehouses(data.warehouses || [])
      setRateContext(data.exchangeRateContext || null)
      setTransferToWarehouse(Boolean(data.purchase.company_warehouse_id))
      setWarehouseId(data.purchase.company_warehouse_id ? String(data.purchase.company_warehouse_id) : '')
      setPurchaseDate(
        String(data.purchase.purchase_date || data.purchase.created_at || '').slice(0, 10) || todayLocalYmd(),
      )
    } catch (err) {
      setError(getApiErrorMessage(err))
      setPurchase(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId, purchaseNumber])

  const handleWarehouseUpdate = async (nextTransfer: boolean, nextWarehouseId: string | null) => {
    if (!token || !purchase || !canEditWarehouse || !canManage) return
    setBusy(true)
    setError(null)
    try {
      const updated = await updatePurchaseWarehouse(token, companyId, purchase.id, {
        transfer_to_warehouse: nextTransfer,
        company_warehouse_id: nextTransfer ? nextWarehouseId : null,
      })
      setPurchase(updated)
      setTransferToWarehouse(Boolean(updated.company_warehouse_id))
      setWarehouseId(updated.company_warehouse_id ? String(updated.company_warehouse_id) : '')
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const onTransferToggle = async (checked: boolean) => {
    setTransferToWarehouse(checked)
    if (!checked) {
      setWarehouseId('')
      await handleWarehouseUpdate(false, null)
      return
    }
    if (warehouseId) {
      await handleWarehouseUpdate(true, warehouseId)
    }
  }

  const onWarehouseSelect = async (value: string) => {
    setWarehouseId(value)
    if (transferToWarehouse && value) {
      await handleWarehouseUpdate(true, value)
    }
  }

  const handleDateUpdate = async (nextDate: string) => {
    if (!token || !purchase || !isDraft || !canManage) return
    const current = String(purchase.purchase_date || '').slice(0, 10)
    if (current === nextDate) return
    setBusy(true)
    setError(null)
    try {
      const updated = await updatePurchaseDate(token, companyId, purchase.id, nextDate || null)
      setPurchase(updated)
      setPurchaseDate(String(updated.purchase_date || '').slice(0, 10))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const onPurchaseDateChange = (ymd: string) => {
    setPurchaseDate(ymd)
    void handleDateUpdate(ymd)
  }

  const handleAddItem = async (payload: {
    item_id: string
    quantity: string
    purchase_price: string
    serial_number?: string
  }) => {
    if (!token || !purchase || !canManage || !isDraft) return false
    if (transferToWarehouse && !purchase.company_warehouse_id) {
      setError(t('desktop.warehouse_required'))
      return false
    }
    setBusy(true)
    setError(null)
    try {
      const updated = await addPurchaseItem(token, companyId, purchase.id, payload)
      setPurchase(updated)
      return true
    } catch (err) {
      setError(getApiErrorMessage(err))
      return false
    } finally {
      setBusy(false)
    }
  }

  const handleRemoveItem = async (purchaseItemId: number) => {
    if (!token || !purchase || !canManage || !isDraft) return
    setBusy(true)
    setError(null)
    try {
      const updated = await removePurchaseItem(token, companyId, purchase.id, purchaseItemId)
      setPurchase(updated)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleComplete = async () => {
    if (!token || !purchase || !canManage || !isDraft || !hasItems) return
    setBusy(true)
    setError(null)
    try {
      const updated = await completePurchase(token, companyId, purchase.id)
      setPurchase(updated)
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      showSuccessToast(t('desktop.complete_purchase'))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleFinalize = async (payload: {
    paidAmount: number
    mode: 'full' | 'partial' | 'remaining'
  }) => {
    if (!token || !purchase || !canManage || !needsPay) return
    setBusy(true)
    setError(null)
    try {
      const updated = await finalizePurchase(token, companyId, purchase.id, {
        paid_amount: payload.paidAmount,
        mode: payload.mode,
      })
      setPurchase(updated)
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      showSuccessToast(t('desktop.saved_success'))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleBackToItems = async () => {
    if (!token || !purchase || !canManage) return
    setBusy(true)
    setError(null)
    try {
      const updated = await backPurchaseToItems(token, companyId, purchase.id)
      setPurchase(updated)
      setReopenConfirmOpen(false)
      showSuccessToast(t('desktop.reopen_purchase_for_edit'))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const saveNotes = async (notes: string) => {
    if (!token || !purchase || !canManage) return
    const updated = await updatePurchaseNotes(token, companyId, purchase.id, notes)
    setPurchase(updated)
    showSuccessToast(t('desktop.invoice_note_saved'))
  }

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!purchase) {
    return <div className="alert-error">{error || t('desktop.no_purchases')}</div>
  }

  const bill = (
    <PurchaseInvoiceBill
      ref={invoiceRef}
      purchase={purchase}
      company={business.company}
      profile={business.profile as Record<string, unknown> | null}
      exchangeRateContext={rateContext}
      canEditItems={Boolean(isDraft && canManage)}
      canManageNotes={canManage}
      onSaveNotes={saveNotes}
      onDeleteItem={isDraft && canManage ? handleRemoveItem : null}
      showEquivalentInPrint={showEquivalentInPrint}
      printPaperSize={printPaperSize}
    />
  )

  const draftPanel = isDraft && canManage ? (
    <div className="purchase-setup-side no-print">
      <div className="party-summary mb-3">
        <label>
          {t('desktop.purchase_date')}
          <JalaliDatePicker
            value={purchaseDate}
            onChange={onPurchaseDateChange}
            allowEmpty
            disabled={busy}
          />
        </label>


        {!canEditWarehouse && hasItems ? (
          <div className="muted mt-2">{t('desktop.warehouse_locked_after_items')}</div>
        ) : null}
      </div>

      <PurchaseItemSelection
        invoice={purchase}
        items={catalogItems}
        busy={busy}
        error={error}
        onAddItem={handleAddItem}
        footer={
          hasItems ? (
            <button
              type="button"
              className="btn-primary"
              style={{ width: '100%' }}
              disabled={busy || (transferToWarehouse && !purchase.company_warehouse_id)}
              onClick={() => void handleComplete()}
            >
              {busy ? t('desktop.processing') : t('desktop.complete_purchase')}
            </button>
          ) : null
        }
      />
    </div>
  ) : null

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar no-print">
        <Link to={businessPath(companyId, 'purchases')} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        <span className="muted">
          #{purchase.purchase_number} ·{' '}
          {isDraft
            ? t('desktop.incomplete')
            : needsPay
              ? t('desktop.awaiting_payment')
              : t('desktop.complete')}
        </span>
      </div>

      {error && !isDraft ? <div className="alert-error no-print">{error}</div> : null}

      {isDraft && canManage ? (
        <div className="sale-setup-layout">{bill}{draftPanel}</div>
      ) : (
        bill
      )}

      {needsPay && canManage ? (
        <div className="mt-3 no-print mb-5">
          <PurchasePayment
            invoice={purchase}
            busy={busy}
            error={error}
            onFinalSubmit={handleFinalize}
            onBackToItems={() => void handleBackToItems()}
          />
        </div>
      ) : null}

      {isClosed ? (
        <div className="sale-complete-print-wrap mt-3 no-print mb-5">
          {canManage ? (
            <button
              type="button"
              className="btn-secondary"
              disabled={busy}
              onClick={() => setReopenConfirmOpen(true)}
            >
              <i className="fa-solid fa-rotate-left" /> {t('desktop.reopen_purchase_for_edit')}
            </button>
          ) : null}
          <SaleInvoicePrintActions
            invoiceRef={invoiceRef}
            invoiceNumber={purchase.purchase_number}
            canPrintWithEquivalent={canPrintWithEquivalent}
            showEquivalentInPrint={showEquivalentInPrint}
            onShowEquivalentChange={setShowEquivalentInPrint}
            onPaperSizeChange={setPrintPaperSize}
            busy={busy}
            onBusyChange={setBusy}
            onError={setError}
          />
          <Link to={businessPath(companyId, 'purchases')} className="btn-secondary">
            {t('desktop.purchases')}
          </Link>
        </div>
      ) : null}

      <Modal
        open={reopenConfirmOpen}
        onClose={() => {
          if (!busy) setReopenConfirmOpen(false)
        }}
        title={t('desktop.reopen_purchase_for_edit')}
      >
        <p>{t('desktop.confirm_back_to_edit_purchase')}</p>
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={busy}
            onClick={() => setReopenConfirmOpen(false)}
          >
            {t('desktop.cancel')}
          </button>
          <button type="button" className="btn-primary" disabled={busy} onClick={() => void handleBackToItems()}>
            {busy ? t('desktop.processing') : t('desktop.reopen_purchase_for_edit')}
          </button>
        </div>
      </Modal>
    </div>
  )
}

function num(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}
