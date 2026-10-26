import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { getApiErrorMessage } from '@/lib/auth'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { useUnsavedLeaveGuard } from '@/hooks/useUnsavedLeaveGuard'
import { localizeCurrency } from '@/lib/currency'
import { todayLocalYmd } from '@/lib/datetime'
import {
  addSaleItemsBatch,
  fetchBusinessAccountsList,
  fetchBusinessCustomers,
  fetchSaleShow,
  finalizeSale,
  removeSaleItem,
  reopenSale,
  setSaleClient,
  suggestedExchangeRateInput,
  updateSaleItemQuantity,
  updateSaleNotes,
  type BusinessCustomerRow,
  type QuickSaleExchangeRateContext,
  type SaleCatalogItem,
  type SaleInvoiceItemRow,
  type SaleInvoiceShow,
} from '@/lib/business'
import type { InvoicePaperSize, InvoicePrintTheme } from '@/lib/invoicePrint'
import type { BusinessAccountRow, BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { businessPath } from '@/store/useCompanyContextStore'
import { scheduleBusinessDashboardRefresh } from '@/store/useListsCacheStore'
import { InvoiceThemePicker } from '@/pages/company/InvoiceThemePicker'
import { SaleInvoiceBill } from '@/pages/company/SaleInvoiceBill'
import { SaleInvoicePrintActions } from '@/pages/company/SaleInvoicePrintActions'
import { hasCatalogPurchaseCost, SaleItemSelection } from '@/pages/company/SaleItemSelection'
import { SalePayment } from '@/pages/company/SalePayment'

type CompanyOutletContext = { business: BusinessShowData }

function resolveInitialStep(invoice: SaleInvoiceShow): 1 | 2 | 3 | 4 {
  if (Number(invoice.status) === 1) return 4
  if (invoice.exchange_rate_id || invoice.exchange_rate?.id) return 2
  return 1
}

function pairFromCapitalAndAccount(
  capital: BusinessAccountRow | undefined,
  account: BusinessAccountRow | undefined,
): QuickSaleExchangeRateContext | null {
  if (!capital || !account || String(capital.id) === String(account.id)) return null
  const from = String(capital.currency || '').toLowerCase()
  const to = String(account.currency || '').toLowerCase()
  if (!from || !to || from === to) return null
  return {
    from_currency: from,
    to_currency: to,
    capital_account_id: capital.id,
    sell_account_id: account.is_sell_account ? account.id : null,
    sale_account_id: account.id,
  }
}

function isPendingSaleItem(row: SaleInvoiceItemRow | null | undefined) {
  return Boolean(row?.pending) || Number(row?.id) < 0
}

function invoiceItemsTotal(items: SaleInvoiceItemRow[]) {
  return items.reduce((sum, row) => sum + (Number(row.total_price) || 0), 0)
}

function adjustCatalogStock(items: SaleCatalogItem[], itemId: number, delta: number) {
  return items.map((item) => {
    if (Number(item.id) !== itemId) return item
    return { ...item, stock: Math.max(0, Number(item.stock || 0) + delta) }
  })
}

function deductPendingFromCatalog(items: SaleCatalogItem[], pending: SaleInvoiceItemRow[]) {
  const used = new Map<number, number>()
  pending.forEach((row) => {
    const id = Number(row.item_id)
    if (!id) return
    used.set(id, (used.get(id) || 0) + Number(row.quantity || 0))
  })
  if (used.size === 0) return items
  return items.map((item) => {
    const qty = used.get(Number(item.id)) || 0
    if (!qty) return item
    return { ...item, stock: Math.max(0, Number(item.stock || 0) - qty) }
  })
}

function sellableCatalog(items: SaleCatalogItem[] | undefined) {
  return (Array.isArray(items) ? items : []).filter(hasCatalogPurchaseCost)
}

export function CompanySaleSetupPage() {
  const { t } = useTranslation()
  const { companyId = '', invoiceId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const invoiceRef = useRef<HTMLDivElement>(null)

  const [invoice, setInvoice] = useState<SaleInvoiceShow | null>(null)
  const [rateContext, setRateContext] = useState<QuickSaleExchangeRateContext | null>(null)
  const [catalogItems, setCatalogItems] = useState<SaleCatalogItem[]>([])
  const [customers, setCustomers] = useState<BusinessCustomerRow[]>([])
  const [accounts, setAccounts] = useState<BusinessAccountRow[]>([])
  const [accountId, setAccountId] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [itemError, setItemError] = useState<string | null>(null)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  const [withoutCustomer, setWithoutCustomer] = useState(false)
  const [customerId, setCustomerId] = useState('')
  const [exchangeRate, setExchangeRate] = useState('1')
  const [busy, setBusy] = useState(false)
  const [printPaperSize, setPrintPaperSize] = useState<InvoicePaperSize>('a5')
  const [printTheme, setPrintTheme] = useState<InvoicePrintTheme>('classic')
  const [showEquivalentInPrint, setShowEquivalentInPrint] = useState(false)
  const [showPreviousRemainingInPrint, setShowPreviousRemainingInPrint] = useState(false)
  const [reopenConfirmOpen, setReopenConfirmOpen] = useState(false)
  const [saleDate, setSaleDate] = useState(todayLocalYmd())
  const pendingIdRef = useRef(-1)

  const hasUnsavedPending = (invoice?.items || []).some((row) => isPendingSaleItem(row))
  const { guardModal } = useUnsavedLeaveGuard(hasUnsavedPending)

  const canEdit =
    Boolean(business.permissions?.canCreateSales) &&
    business.is_active &&
    Number(invoice?.status) !== 1

  const selectedAccount = accounts.find((a) => String(a.id) === String(accountId))
  const capitalAccount = accounts.find((a) => Boolean(a.is_capital))
  const accountCurrency = String(selectedAccount?.currency || invoice?.currency || '').toLowerCase()
  const sameAsCapital = Boolean(
    selectedAccount && capitalAccount && String(selectedAccount.id) === String(capitalAccount.id),
  )
  const livePair = sameAsCapital ? null : pairFromCapitalAndAccount(capitalAccount, selectedAccount)
  // Rate only when selected sale account differs from capital AND currencies differ.
  const hasDirectionalRate = Boolean(livePair?.from_currency && livePair?.to_currency)
  const activeRateContext = livePair
  const rateLabel = hasDirectionalRate
    ? t('desktop.exchange_rate_pair', {
        from: localizeCurrency(activeRateContext?.from_currency, t),
        to: localizeCurrency(activeRateContext?.to_currency, t),
      })
    : t('desktop.exchange_rate')

  const steps = useMemo(
    () =>
      [
        { id: 1 as const, label: t('desktop.sale_step_customer') },
        { id: 2 as const, label: t('desktop.sale_step_items') },
        { id: 3 as const, label: t('desktop.sale_step_payment') },
        { id: 4 as const, label: t('desktop.sale_step_complete') },
      ] as const,
    [t],
  )

  const applyInvoice = (next: SaleInvoiceShow, keepPending = false) => {
    setInvoice((prev) => {
      if (!keepPending) return next
      const pending = (prev?.items || []).filter(isPendingSaleItem)
      if (pending.length === 0) return next
      const items = [...(next.items || []), ...pending]
      return { ...next, items, total_price: invoiceItemsTotal(items) }
    })
  }

  const load = async () => {
    if (!token || !companyId || !invoiceId) return
    setLoading(true)
    setError(null)
    try {
      const [data, accountRows] = await Promise.all([
        fetchSaleShow(token, companyId, invoiceId),
        fetchBusinessAccountsList(token, companyId),
      ])
      applyInvoice(data.invoice)
      const activeAccounts = accountRows.filter((a) => a.status !== false)
      setAccounts(activeAccounts)

      const preferredId =
        data.invoice.company_account_id ??
        data.sale_account?.id ??
        data.sell_account?.id ??
        activeAccounts.find((a) => a.is_sell_account)?.id ??
        activeAccounts[0]?.id
      setAccountId(preferredId ? String(preferredId) : '')

      setRateContext({
        ...(data.exchangeRateContext ?? {}),
        suggested_rate:
          data.exchangeRateContext?.suggested_rate ?? data.exchangeRate?.rate ?? null,
      })
      setCatalogItems(sellableCatalog(data.items))
      if (data.invoice.customer_id) setCustomerId(String(data.invoice.customer_id))
      setWithoutCustomer(!data.invoice.customer_id && Boolean(data.invoice.exchange_rate_id))
      setSaleDate(String(data.invoice.sale_date || '').slice(0, 10) || todayLocalYmd())
      const hasDirectional = Boolean(
        data.exchangeRateContext?.from_currency && data.exchangeRateContext?.to_currency,
      )
      setExchangeRate(
        suggestedExchangeRateInput(
          data.invoice.exchange_rate?.rate,
          data.exchangeRate?.rate ?? data.exchangeRateContext?.suggested_rate,
          hasDirectional,
        ),
      )
      setStep(resolveInitialStep(data.invoice))
    } catch (err) {
      setError(getApiErrorMessage(err))
      setInvoice(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    if (token && companyId) {
      void fetchBusinessCustomers(token, companyId).then(setCustomers).catch(() => setCustomers([]))
    }
  }, [token, companyId, invoiceId])

  useEffect(() => {
    if (!selectedAccount || !capitalAccount) return
    if (String(selectedAccount.id) === String(capitalAccount.id)) {
      setExchangeRate('1')
      setRateContext((prev) =>
        prev
          ? {
              ...prev,
              from_currency: null,
              to_currency: null,
            }
          : prev,
      )
      return
    }
    const pair = pairFromCapitalAndAccount(capitalAccount, selectedAccount)
    if (!pair) {
      setExchangeRate((prev) => (Number(prev) > 0 ? prev : '1'))
      setRateContext((prev) =>
        prev
          ? {
              ...prev,
              from_currency: null,
              to_currency: null,
            }
          : prev,
      )
      return
    }
    setRateContext((prev) => ({
      ...(prev ?? {}),
      ...pair,
    }))
  }, [accountId, capitalAccount?.id, selectedAccount?.id, capitalAccount?.currency, selectedAccount?.currency])

  const saveClient = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !canEdit) return
    if (!accountId) {
      setError(t('desktop.required_field'))
      return
    }
    if (hasDirectionalRate && !(Number(exchangeRate) > 0)) {
      setError(t('desktop.exchange_rate_required'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      const updated = await setSaleClient(token, companyId, invoiceId, {
        without_customer: withoutCustomer,
        customer_id: withoutCustomer ? undefined : customerId,
        company_account_id: accountId,
        exchange_rate: hasDirectionalRate ? exchangeRate : 1,
        sale_date: saleDate || null,
      })
      applyInvoice(updated)
      setStep(2)
      const refreshed = await fetchSaleShow(token, companyId, invoiceId)
      applyInvoice(refreshed.invoice)
      setRateContext(refreshed.exchangeRateContext ?? null)
      setCatalogItems(sellableCatalog(refreshed.items))
      if (refreshed.invoice.company_account_id) {
        setAccountId(String(refreshed.invoice.company_account_id))
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const handleAddItem = async (payload: {
    item_id: string
    quantity: string
    price: string
    serial_number?: string
    remark?: string
  }) => {
    if (!canEdit || !invoice) return false
    const catalogItem = catalogItems.find((item) => String(item.id) === String(payload.item_id))
    if (!catalogItem) {
      setItemError(t('desktop.item_not_found'))
      return false
    }
    if (!hasCatalogPurchaseCost(catalogItem)) {
      setItemError(t('desktop.item_purchase_cost_required'))
      return false
    }
    const qty = Number(payload.quantity)
    const unit = Number(payload.price)
    if (!(qty > 0) || !(unit > 0)) {
      setItemError(t('desktop.item_purchase_cost_required'))
      return false
    }
    if (Number(catalogItem.stock || 0) < qty) {
      setItemError(t('desktop.insufficient_stock'))
      return false
    }

    const currency = accountCurrency || String(invoice.currency || '')
    const lineTotal = Math.round(unit * qty * 100) / 100
    const row: SaleInvoiceItemRow = {
      id: pendingIdRef.current--,
      item_id: catalogItem.id,
      item_name: catalogItem.name,
      item_code: catalogItem.code,
      quantity: qty,
      price: unit,
      total_price: lineTotal,
      currency,
      serial_number: payload.serial_number || null,
      remark: payload.remark || null,
      pending: true,
      item: {
        id: catalogItem.id,
        code: catalogItem.code,
        name: catalogItem.name,
        brand: catalogItem.brand,
        model: catalogItem.model,
        color: catalogItem.color,
      },
    }

    setItemError(null)
    setInvoice((prev) => {
      if (!prev) return prev
      const items = [...(prev.items || []), row]
      return { ...prev, items, total_price: invoiceItemsTotal(items) }
    })
    setCatalogItems((prev) => adjustCatalogStock(prev, catalogItem.id, -qty))
    return true
  }

  const removeItem = async (id: number) => {
    if (!canEdit || !invoice) return
    const row = (invoice.items || []).find((item) => item.id === id)
    if (!row) return

    if (isPendingSaleItem(row)) {
      const qty = Number(row.quantity || 0)
      const itemId = Number(row.item_id || 0)
      setInvoice((prev) => {
        if (!prev) return prev
        const items = (prev.items || []).filter((item) => item.id !== id)
        return { ...prev, items, total_price: invoiceItemsTotal(items) }
      })
      if (itemId && qty) {
        setCatalogItems((prev) => adjustCatalogStock(prev, itemId, qty))
      }
      return
    }

    if (!token) return
    const pending = (invoice.items || []).filter(isPendingSaleItem)
    setBusy(true)
    setItemError(null)
    try {
      const updated = await removeSaleItem(token, companyId, invoiceId, id)
      applyInvoice(updated, true)
      const refreshed = await fetchSaleShow(token, companyId, invoiceId)
      setCatalogItems(deductPendingFromCatalog(sellableCatalog(refreshed.items), pending))
    } catch (err) {
      setItemError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const changeQuantity = async (itemSaleId: number, delta: number) => {
    if (!canEdit || !invoice) return
    const row = (invoice.items || []).find((item) => item.id === itemSaleId)
    if (!row) return
    const nextQty = Math.max(0, Number(row.quantity || 0) + delta)

    if (isPendingSaleItem(row)) {
      const currentQty = Number(row.quantity || 0)
      const itemId = Number(row.item_id || 0)
      const stockDelta = currentQty - nextQty
      if (nextQty > currentQty) {
        const catalogItem = catalogItems.find((item) => Number(item.id) === itemId)
        if (Number(catalogItem?.stock || 0) < nextQty - currentQty) {
          setItemError(t('desktop.insufficient_stock'))
          return
        }
      }
      if (nextQty <= 0) {
        await removeItem(itemSaleId)
        return
      }
      const unit = Number(row.price || 0)
      setInvoice((prev) => {
        if (!prev) return prev
        const items = (prev.items || []).map((item) =>
          item.id === itemSaleId
            ? { ...item, quantity: nextQty, total_price: Math.round(unit * nextQty * 100) / 100 }
            : item,
        )
        return { ...prev, items, total_price: invoiceItemsTotal(items) }
      })
      if (itemId && stockDelta) {
        setCatalogItems((prev) => adjustCatalogStock(prev, itemId, stockDelta))
      }
      return
    }

    if (!token) return
    const pending = (invoice.items || []).filter(isPendingSaleItem)
    setBusy(true)
    setItemError(null)
    try {
      const updated = await updateSaleItemQuantity(token, companyId, invoiceId, {
        invoice_item_id: itemSaleId,
        quantity: nextQty,
      })
      applyInvoice(updated, true)
      const refreshed = await fetchSaleShow(token, companyId, invoiceId)
      setCatalogItems(deductPendingFromCatalog(sellableCatalog(refreshed.items), pending))
    } catch (err) {
      setItemError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const goToPayment = async () => {
    if (!canEdit || !invoice) return
    const pending = (invoice.items || []).filter(isPendingSaleItem)
    if (pending.length === 0) {
      if ((invoice.items || []).length === 0) return
      setStep(3)
      return
    }
    if (!token) return
    setBusy(true)
    setItemError(null)
    try {
      const updated = await addSaleItemsBatch(
        token,
        companyId,
        invoiceId,
        pending.map((row) => ({
          item_id: row.item_id as number,
          quantity: row.quantity as number,
          price: row.price as number,
          currency: row.currency || accountCurrency || undefined,
          serial_number: row.serial_number || undefined,
          remark: row.remark || undefined,
        })),
      )
      applyInvoice(updated)
      const refreshed = await fetchSaleShow(token, companyId, invoiceId)
      applyInvoice(refreshed.invoice)
      setCatalogItems(sellableCatalog(refreshed.items))
      setStep(3)
    } catch (err) {
      setItemError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const finalize = async (payload: {
    paidAmount: number
    mode: 'full' | 'partial' | 'remaining' | 'without_customer'
    discountPercent?: number
    discountAmount?: number
  }) => {
    if (!token || !canEdit) return
    setBusy(true)
    setPaymentError(null)
    setError(null)
    try {
      const paidAccountId =
        invoice?.company_account_id ?? (accountId ? Number(accountId) : undefined)
      const updated = await finalizeSale(token, companyId, invoiceId, {
        paid_amount: payload.paidAmount,
        mode: payload.mode,
        paid_account_id: paidAccountId,
        discount_percent: payload.discountPercent ?? 0,
        discount_amount: payload.discountAmount ?? 0,
      })
      applyInvoice(updated)
      setStep(4)
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      showSuccessToast(t('desktop.saved_success'))
    } catch (err) {
      setPaymentError(getApiErrorMessage(err))
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
      applyInvoice(updated)
      setReopenConfirmOpen(false)
      await load()
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      showSuccessToast(t('desktop.back_to_edit_sale'))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const saveNotes = async (notes: string) => {
    if (!token) return
    const updated = await updateSaleNotes(token, companyId, invoiceId, notes)
    applyInvoice(updated, true)
    showSuccessToast(t('desktop.invoice_note_saved'))
  }

  if (loading) {
    return (
      <>
        <div className="center-screen">
          <div className="spinner" />
        </div>
        {guardModal}
      </>
    )
  }

  if (!invoice) {
    return (
      <>
        <div className="alert-error">{error || t('desktop.no_sales')}</div>
        {guardModal}
      </>
    )
  }

  const finalized = Number(invoice.status) === 1
  const hasItems = (invoice.items || []).length > 0
  const showBill = step >= 2 || hasItems || finalized

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar no-print">
        <Link to={businessPath(companyId, 'sales')} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        <span className="muted">
          #{invoice.invoice_number} · {finalized ? t('desktop.finalized') : t('desktop.draft')}
        </span>
      </div>

      <div className="dash-header dash-header--section mb-3 no-print">
        <h5 className="mb-0">
          {t('desktop.sale')} #{invoice.invoice_number}
        </h5>
      </div>

      <div className="sale-steps no-print" aria-label={t('desktop.sale')}>
        {steps.map((row) => {
          const className = [
            'sale-step-chip',
            step === row.id ? 'is-active' : '',
            step > row.id ? 'is-done' : '',
          ]
            .filter(Boolean)
            .join(' ')
          return (
            <span key={row.id} className={className}>
              <span className="sale-step-chip__num">{row.id}</span>
              {row.label}
            </span>
          )
        })}
      </div>

      {error ? <div className="alert-error no-print">{error}</div> : null}

      {showBill ? (
        <div
          className={
            step === 2 && canEdit ? 'sale-setup-layout' : 'invoice-bill-stage'
          }
        >
          {!(step === 2 && canEdit) ? (
            <aside className="invoice-bill-stage__themes">
              <InvoiceThemePicker
                value={printTheme}
                onChange={setPrintTheme}
                busy={busy}
                variant="side"
              />
            </aside>
          ) : null}
          <div className={step === 2 && canEdit ? undefined : 'invoice-bill-stage__bill'}>
            <SaleInvoiceBill
              ref={invoiceRef}
              invoice={invoice}
              company={business.company}
              profile={business.profile}
              exchangeRateContext={rateContext}
              canEditItems={canEdit && step === 2}
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

          {step === 2 && canEdit ? (
            <SaleItemSelection
              invoice={invoice}
              items={catalogItems}
              exchangeRateContext={rateContext}
              busy={busy}
              error={itemError}
              onAddItem={handleAddItem}
              onGoToPayment={() => void goToPayment()}
            />
          ) : null}
        </div>
      ) : null}

      {step === 1 && canEdit ? (
        <form onSubmit={(e) => void saveClient(e)} className="party-summary form-grid mb-3">
          <h6 style={{ margin: 0, gridColumn: '1 / -1' }}>{t('desktop.sale_step_customer')}</h6>
          <label className="check-row">
            <input
              type="checkbox"
              checked={withoutCustomer}
              onChange={(e) => setWithoutCustomer(e.target.checked)}
            />
            {t('desktop.without_customer')}
          </label>
          {!withoutCustomer ? (
            <label>
              {t('desktop.customers')}
              <Select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">{t('desktop.select')}</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </label>
          ) : null}
          <label>
            {t('desktop.sale_date')}
            <JalaliDatePicker value={saleDate} onChange={setSaleDate} allowEmpty disabled={busy} />
          </label>
          <label>
            {t('desktop.sale_bill_currency')}
            <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
              <option value="">{t('desktop.select')}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {(a.name || `#${a.id}`) +
                    ' - ' +
                    localizeCurrency(a.currency, t) +
                    (a.is_sell_account ? ` (${t('desktop.sell_account')})` : '')}
                </option>
              ))}
            </Select>
          </label>
          {hasDirectionalRate ? (
            <label>
              {rateLabel}
              <input
                type="number"
                min="0.0001"
                step="0.0001"
                value={exchangeRate}
                onChange={(e) => setExchangeRate(e.target.value)}
                required
              />
            </label>
          ) : null}
          {hasDirectionalRate ? (
            <p className="muted" style={{ margin: 0, gridColumn: '1 / -1' }}>
              {t('desktop.exchange_rate_direction', {
                from: localizeCurrency(activeRateContext?.from_currency, t),
                to: localizeCurrency(activeRateContext?.to_currency, t),
              })}
              {activeRateContext?.suggested_rate || Number(exchangeRate) > 0
                ? ` — ${t('desktop.latest_exchange_rate')}: ${
                    activeRateContext?.suggested_rate ?? exchangeRate
                  }`
                : null}
            </p>
          ) : null}
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? t('desktop.processing') : t('desktop.next_step')}
            </button>
          </div>
        </form>
      ) : null}

      {step === 2 && !canEdit ? (
        <div className="form-actions mt-3">
          <button type="button" className="btn-primary" onClick={() => setStep(3)} disabled={!hasItems}>
            {t('desktop.go_to_payment')}
          </button>
        </div>
      ) : null}

      {step === 3 && canEdit ? (
        <SalePayment
          invoice={invoice}
          busy={busy}
          error={paymentError}
          onFinalSubmit={finalize}
          onBackToItems={() => {
            setPaymentError(null)
            setStep(2)
          }}
        />
      ) : null}

      {step === 4 ? (
        <div className="party-summary party-summary--complete mt-3 no-print">
          <h6 style={{ marginTop: 0 }}>{t('desktop.sale_step_complete')}</h6>
          <p className="muted" style={{ marginBottom: 12 }}>
            {finalized ? t('desktop.finalized') : t('desktop.awaiting_payment')}
          </p>
          <div className="sale-complete-print-wrap">
            {finalized && business.permissions?.canCreateSales && business.is_active ? (
              <button
                type="button"
                className="btn-secondary"
                style={{ marginBottom: 10 }}
                disabled={busy}
                onClick={() => setReopenConfirmOpen(true)}
              >
                <>
                  <i className="fa-solid fa-rotate-left" /> {t('desktop.back_to_edit_sale')}
                </>
              </button>
            ) : null}
            {finalized ? (
              <SaleInvoicePrintActions
                invoiceRef={invoiceRef}
                invoiceNumber={invoice.invoice_number}
                canPrintWithEquivalent={hasDirectionalRate}
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
            ) : null}
            <div className="form-actions" style={{ justifyContent: 'center', width: '100%', maxWidth: 420 }}>
              {!finalized && canEdit ? (
                <button type="button" className="btn-secondary" onClick={() => setStep(3)}>
                  {t('desktop.prev_step')}
                </button>
              ) : null}
              <Link to={businessPath(companyId, 'sales')} className="btn-primary">
                {t('desktop.sales')}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

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
      {guardModal}
    </div>
  )
}
