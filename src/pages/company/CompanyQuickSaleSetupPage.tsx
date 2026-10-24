import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { SearchField } from '@/components/inputs/SearchField'
import { BarcodeScanButton, BarcodeScanModal } from '@/components/BarcodeScanModal'
import { getApiErrorMessage } from '@/lib/auth'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import {
  fetchQuickSaleSetup,
  finalizeSale,
  quickScanSaleItem,
  removeSaleItem,
  reopenSale,
  updateSaleItemQuantity,
  updateSaleNotes,
  type QuickSaleExchangeRateContext,
  type SaleCatalogItem,
  type SaleInvoiceShow,
} from '@/lib/business'
import type { InvoicePaperSize, InvoicePrintTheme } from '@/lib/invoicePrint'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { businessPath } from '@/store/useCompanyContextStore'
import { scheduleBusinessDashboardRefresh } from '@/store/useListsCacheStore'
import { InvoiceThemePicker } from '@/pages/company/InvoiceThemePicker'
import { SaleInvoiceBill } from '@/pages/company/SaleInvoiceBill'
import { SaleInvoicePrintActions } from '@/pages/company/SaleInvoicePrintActions'

type CompanyOutletContext = { business: BusinessShowData }

function num(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function normalizeDigits(value: string) {
  const map: Record<string, string> = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
    '٫': '.',
    '٬': '.',
  }
  return String(value).replace(/[\u06F0-\u06F9\u0660-\u0669\u066B\u066C]/g, (char) => map[char] || char)
}

function playScanSuccessTone() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = 950
    gain.gain.setValueAtTime(0.001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.13)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.14)
    setTimeout(() => {
      void ctx.close().catch(() => undefined)
    }, 250)
  } catch {
    /* optional feedback */
  }
}

export function CompanyQuickSaleSetupPage() {
  const { t } = useTranslation()
  const { companyId = '', invoiceId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const barcodeInputRef = useRef<HTMLInputElement>(null)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [invoice, setInvoice] = useState<SaleInvoiceShow | null>(null)
  const [catalogItems, setCatalogItems] = useState<SaleCatalogItem[]>([])
  const [rateContext, setRateContext] = useState<QuickSaleExchangeRateContext | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scanSuccess, setScanSuccess] = useState('')
  const [scanFlash, setScanFlash] = useState(false)
  const [barcode, setBarcode] = useState('')
  const [scanOpen, setScanOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SaleCatalogItem[]>([])
  const [printPaperSize, setPrintPaperSize] = useState<InvoicePaperSize>('a5')
  const [printTheme, setPrintTheme] = useState<InvoicePrintTheme>('classic')
  const [showEquivalentInPrint, setShowEquivalentInPrint] = useState(false)
  const [showPreviousRemainingInPrint, setShowPreviousRemainingInPrint] = useState(false)
  const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false)

  const canEdit =
    Boolean(business.permissions?.canCreateSales) &&
    business.is_active &&
    Number(invoice?.status) !== 1

  const applyCatalogStock = (items: SaleCatalogItem[], nextInvoice: SaleInvoiceShow) => {
    const soldByItem = new Map<number, number>()
    for (const row of nextInvoice.items || []) {
      const id = Number(row.item_id)
      if (!id) continue
      soldByItem.set(id, (soldByItem.get(id) || 0) + num(row.quantity))
    }
    // Prefer API catalog refresh; keep local stock adjusted if we only update invoice
    return items.map((item) => {
      const sold = soldByItem.get(item.id) || 0
      if (sold <= 0) return item
      const stock = num(item.stock)
      return stock > 0 ? { ...item, stock: Math.max(0, stock) } : item
    })
  }

  const load = async () => {
    if (!token || !companyId || !invoiceId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchQuickSaleSetup(token, companyId, invoiceId)
      setInvoice(data.invoice)
      setRateContext(data.exchangeRateContext ?? null)
      setCatalogItems(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      setError(getApiErrorMessage(err))
      setInvoice(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId, invoiceId])

  useEffect(() => {
    if (busy || Number(invoice?.status) === 1) return
    barcodeInputRef.current?.focus()
  }, [busy, invoice?.status, loading])

  const itemCount = useMemo(
    () => (invoice?.items || []).reduce((acc, row) => acc + num(row.quantity), 0),
    [invoice?.items],
  )

  const handleAdd = async (payload: { barcode?: string; item_id?: number }) => {
    if (!token || !canEdit || busy) return
    const hasBarcode = Boolean(String(payload.barcode || '').trim())
    const hasItemId = Boolean(payload.item_id)
    if (!hasBarcode && !hasItemId) return

    setBusy(true)
    setError(null)
    try {
      const result = await quickScanSaleItem(token, companyId, invoiceId, {
        barcode: hasBarcode ? String(payload.barcode).trim() : undefined,
        item_id: hasItemId ? payload.item_id : undefined,
      })
      setInvoice(result.invoice)
      setCatalogItems((prev) => {
        const next = prev.map((item) => {
          if (hasItemId && item.id === payload.item_id) {
            return { ...item, stock: Math.max(0, num(item.stock) - 1) }
          }
          if (hasBarcode && String(item.code || '').trim() === String(payload.barcode).trim()) {
            return { ...item, stock: Math.max(0, num(item.stock) - 1) }
          }
          return item
        })
        return applyCatalogStock(next, result.invoice)
      })
      setBarcode('')
      setSearchQuery('')
      setSearchResults([])
      setScanFlash(true)
      const msg = result.message || t('desktop.barcode_item_added')
      setScanSuccess(msg)
      setTimeout(() => setScanFlash(false), 600)
      playScanSuccessTone()
      showSuccessToast(msg)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setScanSuccess('')
    } finally {
      setBusy(false)
      setTimeout(() => barcodeInputRef.current?.focus(), 0)
    }
  }

  const performSearch = (q: string) => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
    searchTimeoutRef.current = setTimeout(() => {
      const query = normalizeDigits(String(q || ''))
        .trim()
        .toLowerCase()
      if (!query) {
        setSearchResults([])
        return
      }
      setSearchResults(
        catalogItems.filter((item) =>
          [item.name, item.code, item.brand, item.model].some((value) =>
            String(value || '')
              .toLowerCase()
              .includes(query),
          ),
        ),
      )
    }, 150)
  }

  const handleSelectSearchItem = (item: SaleCatalogItem) => {
    if (!item?.id) {
      setError(t('desktop.item_not_found'))
      return
    }
    void handleAdd({ item_id: item.id })
  }

  const removeItem = async (id: number) => {
    if (!token || !canEdit) return
    setBusy(true)
    setError(null)
    try {
      const updated = await removeSaleItem(token, companyId, invoiceId, id)
      setInvoice(updated)
      // Soft-refresh catalog after remove so stock/search stay accurate
      if (token) {
        try {
          const data = await fetchQuickSaleSetup(token, companyId, invoiceId)
          setCatalogItems(Array.isArray(data.items) ? data.items : [])
        } catch {
          /* keep previous catalog */
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
      setTimeout(() => barcodeInputRef.current?.focus(), 0)
    }
  }

  const changeQuantity = async (itemSaleId: number, delta: number) => {
    if (!token || !canEdit || !invoice || busy) return
    const current = (invoice.items || []).find((row) => row.id === itemSaleId)
    if (!current) return
    const newQty = Math.max(0, num(current.quantity) + Number(delta))
    setBusy(true)
    setError(null)
    try {
      const updated =
        newQty > 0
          ? await updateSaleItemQuantity(token, companyId, invoiceId, {
              invoice_item_id: itemSaleId,
              quantity: newQty,
            })
          : await removeSaleItem(token, companyId, invoiceId, itemSaleId)
      setInvoice(updated)
      try {
        const data = await fetchQuickSaleSetup(token, companyId, invoiceId)
        setCatalogItems(Array.isArray(data.items) ? data.items : [])
      } catch {
        /* keep previous */
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
      setTimeout(() => barcodeInputRef.current?.focus(), 0)
    }
  }

  const handleComplete = async () => {
    if (!token || !canEdit || !invoice || busy) return
    const total = num(invoice.total_price)
    if (!(total > 0)) {
      setError(t('desktop.invoice_empty'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      const updated = await finalizeSale(token, companyId, invoiceId, {
        paid_amount: total,
        mode: 'without_customer',
        paid_account_id: rateContext?.sell_account_id ?? undefined,
      })
      setInvoice(updated)
      setScanSuccess('')
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      showSuccessToast(t('desktop.saved_success'))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleReopen = async () => {
    if (!token || !invoice || Number(invoice.status) !== 1 || busy) return
    if (!business.permissions?.canCreateSales || !business.is_active) return
    setBusy(true)
    setError(null)
    try {
      const updated = await reopenSale(token, companyId, invoiceId)
      setInvoice(updated)
      setScanSuccess('')
      setReopenConfirmOpen(false)
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      showSuccessToast(t('desktop.back_to_edit_sale'))
      try {
        const data = await fetchQuickSaleSetup(token, companyId, invoiceId)
        setCatalogItems(Array.isArray(data.items) ? data.items : [])
        setRateContext(data.exchangeRateContext ?? null)
      } catch {
        /* keep current catalog */
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const saveNotes = async (notes: string) => {
    if (!token) return
    const updated = await updateSaleNotes(token, companyId, invoiceId, notes)
    setInvoice(updated)
    showSuccessToast(t('desktop.invoice_note_saved'))
  }

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!invoice) {
    return <div className="alert-error">{error || t('desktop.no_sales')}</div>
  }

  const finalized = Number(invoice.status) === 1
  const canPrintWithEquivalent = Boolean(
    String(rateContext?.from_currency || '').trim() && String(rateContext?.to_currency || '').trim(),
  )

  return (
    <div className="dash-div party-page quick-sale-page" dir="rtl">
      <div className="party-toolbar no-print">
        <Link to={businessPath(companyId, 'sales')} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        <span className="muted">
          {t('desktop.quick_sale')} #{invoice.invoice_number} ·{' '}
          {finalized ? t('desktop.finalized') : t('desktop.draft')}
        </span>
      </div>

      {finalized ? (
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
              canEditItems={false}
              canManageNotes={Boolean(business.permissions?.canCreateSales) && business.is_active}
              onSaveNotes={saveNotes}
              onDeleteItem={removeItem}
              onChangeQuantity={changeQuantity}
              showEquivalentInPrint={showEquivalentInPrint}
              showPreviousRemainingInPrint={showPreviousRemainingInPrint}
              printPaperSize={printPaperSize}
              printTheme={printTheme}
            />
          </div>
        </div>
      ) : (
        <SaleInvoiceBill
          ref={invoiceRef}
          invoice={invoice}
          company={business.company}
          profile={business.profile}
          exchangeRateContext={rateContext}
          canEditItems={canEdit}
          canManageNotes={Boolean(business.permissions?.canCreateSales) && business.is_active}
          onSaveNotes={saveNotes}
          onDeleteItem={removeItem}
          onChangeQuantity={changeQuantity}
          showEquivalentInPrint={showEquivalentInPrint}
          showPreviousRemainingInPrint={showPreviousRemainingInPrint}
          printPaperSize={printPaperSize}
          printTheme={printTheme}
        />
      )}

      <div className="quick-sale-panel no-print" dir="rtl">
        <h5 className="quick-sale-panel__title">{t('desktop.quick_sale')}</h5>
        <div className="quick-sale-panel__meta">
          {t('desktop.total_items')}: {itemCount}
        </div>

        {error ? <div className="alert-error">{error}</div> : null}
        {!error && scanSuccess ? <div className="alert-success">{scanSuccess}</div> : null}

        {canEdit ? (
          <>
            <div className="quick-sale-add-row">
              <label className="quick-sale-field quick-sale-field--grow" htmlFor="quick_barcode">
                <span>{t('desktop.barcode')}</span>
                <input
                  id="quick_barcode"
                  ref={barcodeInputRef}
                  value={barcode}
                  onChange={(e) => {
                    setBarcode(e.target.value)
                    if (error) setError(null)
                    if (scanSuccess) setScanSuccess('')
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      void handleAdd({ barcode })
                    }
                  }}
                  disabled={busy}
                  className={scanFlash ? 'is-scan-success' : undefined}
                  placeholder={t('desktop.barcode_scan_placeholder')}
                  autoComplete="off"
                />
              </label>

              <button
                type="button"
                className="btn-primary quick-sale-action"
                disabled={busy || !barcode.trim()}
                onClick={() => void handleAdd({ barcode })}
              >
                {busy ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.processing')}
                  </>
                ) : (
                  t('desktop.add_item')
                )}
              </button>

              <BarcodeScanButton disabled={busy} onClick={() => setScanOpen(true)} />

              <button
                type="button"
                className="btn-primary quick-sale-action"
                disabled={busy || !(num(invoice.total_price) > 0)}
                onClick={() => void handleComplete()}
              >
                {busy ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.processing')}
                  </>
                ) : (
                  t('desktop.complete_without_customer')
                )}
              </button>
            </div>

            <SearchField
              id="quick_item_search"
              className="mt-3"
              label={t('desktop.search_item')}
              value={searchQuery}
              onChange={(value) => {
                setSearchQuery(value)
                performSearch(value)
              }}
              disabled={busy}
              placeholder={t('desktop.search_item_placeholder')}
            />

            {searchQuery.trim() ? (
              <div className="sale-search-results quick-sale-search-results mt-2">
                {searchResults.length === 0 ? (
                  <div className="sale-search-empty">{t('desktop.no_matching_items')}</div>
                ) : (
                  searchResults.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className="sale-search-result"
                      disabled={busy || !(num(item.stock) > 0)}
                      onClick={() => handleSelectSearchItem(item)}
                    >
                      <span className="sale-search-result__main">
                        {item.name || `#${item.id}`}
                        {item.code ? ` — ${item.code}` : ''}
                      </span>
                      <span className="muted">
                        ({t('desktop.quantity')}: {fmtStock(item.stock)})
                      </span>
                    </button>
                  ))
                )}
              </div>
            ) : null}
          </>
        ) : (
          <div className="quick-sale-complete-actions">
            {business.permissions?.canCreateSales && business.is_active ? (
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%' }}
                disabled={busy}
                onClick={() => setReopenConfirmOpen(true)}
              >
                <>
                  <i className="fa-solid fa-rotate-left" /> {t('desktop.back_to_edit_sale')}
                </>
              </button>
            ) : null}
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
            <Link to={businessPath(companyId, 'sales')} className="btn-secondary">
              {t('desktop.sales')}
            </Link>
          </div>
        )}
      </div>

      <Modal
        open={reopenConfirmOpen}
        onClose={() => {
          if (!busy) setReopenConfirmOpen(false)
        }}
        title={t('desktop.back_to_edit_sale')}
      >
        <div dir="rtl">
          <p>{t('desktop.confirm_back_to_edit_sale')}</p>
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn-secondary"
              disabled={busy}
              onClick={() => setReopenConfirmOpen(false)}
            >
              {t('desktop.cancel')}
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={busy}
              onClick={() => void handleReopen()}
            >
              {busy ? t('desktop.processing') : t('desktop.confirm')}
            </button>
          </div>
        </div>
      </Modal>
      <BarcodeScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={(code) => void handleAdd({ barcode: code })}
      />
    </div>
  )
}

function fmtStock(v: unknown) {
  return num(v).toLocaleString(undefined, { maximumFractionDigits: 2 })
}
