import { FormEvent, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { BarcodeScanButton, BarcodeScanModal } from '@/components/BarcodeScanModal'
import { SearchField } from '@/components/inputs/SearchField'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  createBusinessCustomer,
  easySaleAddItemsBatch,
  easySaleFinalizePayment,
  easySaleRemoveItem,
  easySaleUpdateMeta,
  fetchBusinessCustomers,
  fetchEasySaleSetup,
  updateSaleItemQuantity,
  type BusinessCustomerRow,
  type QuickSaleExchangeRateContext,
  type SaleCatalogItem,
  type SaleInvoiceItemRow,
  type SaleInvoiceShow,
} from '@/lib/business'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { useUnsavedLeaveGuard } from '@/hooks/useUnsavedLeaveGuard'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import {
  readEasySaleCatalogCache,
  syncEasySaleCatalogCache,
} from '@/lib/easySaleCatalogCache'
import { prefetchCachedAssets } from '@/lib/mediaCache'
import { formatQty } from '@/lib/companyDashboard'
import {
  basePriceFromScale,
  fromBaseQuantity,
  hasExtraItemUnits,
  itemUnitFactor,
  itemUnitOptions,
  priceForScale,
  toBaseQuantity,
  type ItemUnitScale,
} from '@/lib/itemUnits'
import { hasCatalogPurchaseCost } from '@/pages/company/SaleItemSelection'

function num(v: unknown): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
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

function isPendingSaleItem(row: SaleInvoiceItemRow | null | undefined) {
  return Boolean(row?.pending) || Number(row?.id) < 0
}

function CatalogImage({ src, alt }: { src?: string | null; alt: string }) {
  const resolved = useCachedAsset(src || null)
  if (!resolved) {
    return (
      <div className="easy-sale-item-image-placeholder" aria-hidden="true">
        <i className="fa-solid fa-box" />
      </div>
    )
  }
  return <img src={resolved} alt={alt} className="easy-sale-item-image" loading="lazy" />
}

function CustomerSearchSelect({
  customers,
  value,
  onChange,
  disabled,
  noneLabel,
  searchPlaceholder,
  emptyLabel,
}: {
  customers: BusinessCustomerRow[]
  value: number | ''
  onChange: (value: number | '') => void
  disabled?: boolean
  noneLabel: string
  searchPlaceholder: string
  emptyLabel: string
}) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selected = useMemo(
    () => (value ? customers.find((c) => Number(c.id) === Number(value)) : null),
    [customers, value],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return customers
    return customers.filter((c) => String(c.name || '').toLowerCase().includes(q))
  }, [customers, query])

  useEffect(() => {
    if (!open) return
    const onDocClick = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [open])

  const displayValue = open ? query : selected?.name || noneLabel

  return (
    <div className={`easy-sale-customer-select${open ? ' is-open' : ''}`} ref={rootRef}>
      <div className="easy-sale-customer-select__control">
        <input
          type="text"
          value={displayValue}
          placeholder={searchPlaceholder}
          disabled={disabled}
          onFocus={() => {
            setOpen(true)
            setQuery('')
          }}
          onChange={(e) => {
            setOpen(true)
            setQuery(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false)
              setQuery('')
            }
            if (e.key === 'Enter') {
              e.preventDefault()
              if (filtered.length === 1) {
                onChange(Number(filtered[0].id))
                setOpen(false)
                setQuery('')
              }
            }
          }}
          autoComplete="off"
        />
        <button
          type="button"
          className="easy-sale-customer-select__caret"
          disabled={disabled}
          aria-label={searchPlaceholder}
          onClick={() => {
            if (disabled) return
            setOpen((prev) => !prev)
            setQuery('')
          }}
        >
          <i className="fa-solid fa-angle-down" />
        </button>
      </div>
      {open ? (
        <div className="easy-sale-customer-select__menu" role="listbox">
          <button
            type="button"
            className={`easy-sale-customer-select__option${!value ? ' is-active' : ''}`}
            onClick={() => {
              onChange('')
              setOpen(false)
              setQuery('')
            }}
          >
            {noneLabel}
          </button>
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`easy-sale-customer-select__option${
                Number(value) === Number(c.id) ? ' is-active' : ''
              }`}
              onClick={() => {
                onChange(Number(c.id))
                setOpen(false)
                setQuery('')
              }}
            >
              {c.name}
            </button>
          ))}
          {filtered.length === 0 ? (
            <div className="easy-sale-customer-select__empty muted">{emptyLabel}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}

function EasySaleEditLineModal({
  open,
  row,
  catalogItem,
  currencyLabel,
  busy,
  onClose,
  onSave,
}: {
  open: boolean
  row: SaleInvoiceItemRow | null
  catalogItem?: SaleCatalogItem | null
  currencyLabel: string
  busy?: boolean
  onClose: () => void
  onSave: (payload: { quantity: number; price: number }) => Promise<void> | void
}) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState('1')
  const [price, setPrice] = useState('0')
  const [unitScale, setUnitScale] = useState<ItemUnitScale>('base')
  const [localError, setLocalError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  const unitOptions = useMemo(() => itemUnitOptions(catalogItem), [catalogItem])
  const showUnitPicker = hasExtraItemUnits(catalogItem)
  const selectedFactor = itemUnitFactor(catalogItem, unitScale) || 1
  const selectedUnitLabel =
    unitOptions.find((o) => o.scale === unitScale)?.label || catalogItem?.unit_name || ''

  useEffect(() => {
    if (!open || !row) return
    setUnitScale('base')
    setQuantity(String(num(row.quantity) || 1))
    setPrice(String(num(row.price) || 0))
    setLocalError(null)
    setProcessing(false)
  }, [open, row])

  const changeUnitScale = (scale: ItemUnitScale) => {
    const oldFactor = itemUnitFactor(catalogItem, unitScale) || 1
    const newFactor = itemUnitFactor(catalogItem, scale) || 1
    const baseQty = toBaseQuantity(num(quantity), catalogItem, unitScale)
    const basePrice = basePriceFromScale(num(price), oldFactor)
    const nextQty = fromBaseQuantity(baseQty > 0 ? baseQty : num(row?.quantity), catalogItem, scale)
    const nextPrice = priceForScale(
      basePrice > 0 ? basePrice : num(row?.price),
      newFactor,
    )
    setUnitScale(scale)
    setQuantity(String(nextQty > 0 ? nextQty : 1))
    setPrice(String(nextPrice > 0 ? nextPrice : 0))
  }

  const qtyNum = num(quantity)
  const priceNum = num(price)
  const lineTotal = Math.round(qtyNum * priceNum * 100) / 100
  const baseQtyPreview =
    selectedFactor > 1 && qtyNum > 0
      ? toBaseQuantity(qtyNum, catalogItem, unitScale)
      : null

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!(qtyNum > 0) || !(priceNum > 0)) {
      setLocalError(t('desktop.paid_amount_positive'))
      return
    }
    const factor = itemUnitFactor(catalogItem, unitScale) || 1
    const baseQty = toBaseQuantity(qtyNum, catalogItem, unitScale)
    const basePrice = basePriceFromScale(priceNum, factor)
    if (!(baseQty > 0) || !(basePrice > 0)) {
      setLocalError(t('desktop.paid_amount_positive'))
      return
    }
    setProcessing(true)
    setLocalError(null)
    try {
      await onSave({ quantity: baseQty, price: basePrice })
      onClose()
    } catch (err) {
      setLocalError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={busy || processing ? () => undefined : onClose}
      title={t('desktop.edit')}
    >
      <form className="easy-sale-edit-line-form" onSubmit={(e) => void submit(e)} dir="rtl">
        {row?.item_name ? <p className="easy-sale-edit-line-form__name">{row.item_name}</p> : null}
        {localError ? <div className="alert-error">{localError}</div> : null}
        {showUnitPicker ? (
          <label>
            {t('desktop.measure_unit')}
            <select
              value={unitScale}
              onChange={(e) => changeUnitScale(e.target.value as ItemUnitScale)}
              disabled={busy || processing}
            >
              {unitOptions.map((opt) => (
                <option key={opt.scale} value={opt.scale}>
                  {opt.label}
                  {opt.factor > 1 ? ` (=${opt.factor})` : ''}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <label>
          {t('desktop.quantity')}
          {selectedUnitLabel ? ` (${selectedUnitLabel})` : null}
          <input
            type="number"
            min={0.001}
            step="any"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            disabled={busy || processing}
            required
          />
          {baseQtyPreview != null ? (
            <span className="muted">
              = {baseQtyPreview} {catalogItem?.unit_name || t('desktop.unit_small')}
            </span>
          ) : null}
        </label>
        <label>
          {t('desktop.unit_price')} ({currencyLabel})
          {selectedUnitLabel ? ` / ${selectedUnitLabel}` : null}
          <input
            type="number"
            min={0.01}
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={busy || processing}
            required
          />
        </label>
        <p className="easy-sale-edit-line-form__total muted">
          {t('desktop.total')}:{' '}
          <strong>
            {lineTotal.toLocaleString()} {currencyLabel}
          </strong>
        </p>
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={busy || processing}
          >
            {t('desktop.close')}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={busy || processing || !(qtyNum > 0) || !(priceNum > 0)}
          >
            {processing || busy ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function EasySaleAddCustomerModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
}) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) {
      setName('')
      setError(null)
      setProcessing(false)
      return
    }
    const timer = window.setTimeout(() => inputRef.current?.focus(), 40)
    return () => window.clearTimeout(timer)
  }, [open])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      setError(t('desktop.customer_name'))
      return
    }
    setProcessing(true)
    setError(null)
    try {
      await onSubmit(trimmed)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal open={open} onClose={processing ? () => undefined : onClose} title={t('desktop.add_customer')}>
      <form onSubmit={(e) => void submit(e)} className="form-grid easy-sale-add-customer-form">
        {error ? <div className="alert-error">{error}</div> : null}
        <label>
          {t('desktop.customer_name')}
          <input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t('desktop.customer_name')}
            disabled={processing}
            required
            autoComplete="off"
          />
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={processing}>
            {t('desktop.close')}
          </button>
          <button type="submit" className="btn-primary" disabled={processing || !name.trim()}>
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export function CompanyEasySalePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { companyId = '', invoiceId = '' } = useParams()
  const token = useAuthStore(useShallow((s) => s.token))
  const pendingIdRef = useRef(-1)

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [invoice, setInvoice] = useState<SaleInvoiceShow | null>(null)
  const [cart, setCart] = useState<SaleInvoiceItemRow[]>([])
  const [catalog, setCatalog] = useState<SaleCatalogItem[]>([])
  const [rateContext, setRateContext] = useState<QuickSaleExchangeRateContext | null>(null)
  const [customers, setCustomers] = useState<BusinessCustomerRow[]>([])
  const [query, setQuery] = useState('')
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | ''>('')
  const [addCustomerOpen, setAddCustomerOpen] = useState(false)
  const [paidAmount, setPaidAmount] = useState('0')
  const [discountPercent, setDiscountPercent] = useState('')
  const [discountAmount, setDiscountAmount] = useState('')
  const [exchangeRate, setExchangeRate] = useState('1')
  const [savedExchangeRate, setSavedExchangeRate] = useState('1')
  const [scanOpen, setScanOpen] = useState(false)
  const [editLine, setEditLine] = useState<SaleInvoiceItemRow | null>(null)

  const hasUnsavedPending = cart.some((row) => isPendingSaleItem(row))
  const { guardModal, bypassGuard } = useUnsavedLeaveGuard(hasUnsavedPending)

  const syncPaidWithTotal = (nextTotal: number, keepPaid: boolean, hasCustomerNow: boolean) => {
    if (!keepPaid || !hasCustomerNow) {
      setPaidAmount(String(nextTotal))
      return
    }
    setPaidAmount((prev) => {
      const current = num(prev)
      if (!(current >= 0)) return String(nextTotal)
      return String(Math.min(current, nextTotal))
    })
  }

  const syncDiscountAndPaidForCartTotal = (nextTotal: number, hasCustomerNow: boolean) => {
    const pct = Math.min(100, Math.max(0, num(discountPercent)))
    let nextDiscount = 0
    if (pct > 0) {
      nextDiscount = Math.round(((nextTotal * pct) / 100) * 100) / 100
      setDiscountAmount(nextDiscount > 0 ? String(nextDiscount) : '')
    } else {
      nextDiscount = Math.min(nextTotal, Math.max(0, num(discountAmount)))
      setDiscountAmount(nextDiscount > 0 ? String(nextDiscount) : '')
    }
    syncPaidWithTotal(Math.max(0, Math.round((nextTotal - nextDiscount) * 100) / 100), true, hasCustomerNow)
  }

  const load = async () => {
    if (!token || !companyId || !invoiceId) return
    setLoading(true)
    setError(null)

    const cached = readEasySaleCatalogCache(companyId)
    if (cached?.items?.length) {
      setCatalog(cached.items)
      prefetchCachedAssets(cached.items.map((item) => item.image))
    }

    try {
      const [setup, customerData] = await Promise.all([
        fetchEasySaleSetup(token, companyId, invoiceId),
        fetchBusinessCustomers(token, companyId),
      ])
      setInvoice(setup.invoice)
      if (Number(setup.invoice.status) === 1) {
        navigate(businessPath(companyId, `easy-sale/${setup.invoice.id}/bill`), { replace: true })
        return
      }
      const existingItems = Array.isArray(setup.invoice.items) ? setup.invoice.items : []
      setCart(existingItems.map((row) => ({ ...row, pending: false })))
      const nextCatalog = syncEasySaleCatalogCache(companyId, setup.items || [])
      const usedByItem = new Map<number, number>()
      existingItems.forEach((row) => {
        const id = Number(row.item_id)
        if (!id) return
        usedByItem.set(id, (usedByItem.get(id) || 0) + num(row.quantity))
      })
      setCatalog(
        nextCatalog.map((item) => {
          const used = usedByItem.get(Number(item.id)) || 0
          if (!used) return item
          return { ...item, stock: Math.max(0, num(item.stock) - used) }
        }),
      )
      prefetchCachedAssets(nextCatalog.map((item) => item.image))
      setRateContext(setup.exchangeRateContext ?? null)
      setCustomers(customerData || [])
      const cid = Number(setup.invoice.customer_id || 0)
      setSelectedCustomerId(cid > 0 ? cid : '')
      const rate =
        setup.invoice.exchange_rate?.rate ??
        setup.exchangeRateContext?.suggested_rate ??
        setup.exchangeRateContext?.rate ??
        1
      const rateText = String(rate || 1)
      setExchangeRate(rateText)
      setSavedExchangeRate(rateText)
      setPaidAmount(String(invoiceItemsTotal(existingItems)))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId, invoiceId])

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalog
    return catalog.filter((item) => {
      const name = String(item.name || '').toLowerCase()
      const code = String(item.code || '').toLowerCase()
      return name.includes(q) || code.includes(q)
    })
  }, [catalog, query])

  const total = invoiceItemsTotal(cart)
  const discountAmt = Math.min(total, Math.max(0, num(discountAmount)))
  const payable = Math.round(Math.max(0, total - discountAmt) * 100) / 100
  const hasCustomer = Number(selectedCustomerId) > 0
  const paid = hasCustomer ? Math.max(0, Math.min(payable, num(paidAmount))) : payable
  const canFinalize = cart.length > 0 && !saving
  const currency =
    invoice?.company_account?.currency ||
    invoice?.currency ||
    invoice?.exchange_rate?.to_currency ||
    rateContext?.to_currency ||
    ''
  const rateFrom = invoice?.exchange_rate?.from_currency || rateContext?.from_currency
  const rateTo = invoice?.exchange_rate?.to_currency || rateContext?.to_currency
  const hasDirectionalRate = Boolean(rateFrom && rateTo && rateFrom !== rateTo)

  const setDiscountFromPercent = (raw: string) => {
    setDiscountPercent(raw)
    const pct = Math.min(100, Math.max(0, num(raw)))
    const amount = Math.round(((total * pct) / 100) * 100) / 100
    setDiscountAmount(amount > 0 ? String(amount) : '')
    if (!hasCustomer) setPaidAmount(String(Math.max(0, total - amount)))
    else syncPaidWithTotal(Math.max(0, total - amount), true, true)
  }

  const setDiscountFromAmount = (raw: string) => {
    setDiscountAmount(raw)
    const amount = Math.min(total, Math.max(0, num(raw)))
    const pct = total > 0 ? Math.round((amount / total) * 10000) / 100 : 0
    setDiscountPercent(amount > 0 ? String(pct) : '')
    if (!hasCustomer) setPaidAmount(String(Math.max(0, total - amount)))
    else syncPaidWithTotal(Math.max(0, total - amount), true, true)
  }

  const findCatalogItem = (payload: string | { barcode?: string; item_id?: number | string }) => {
    if (typeof payload === 'string') {
      const code = payload.trim().toLowerCase()
      return (
        catalog.find((item) => String(item.code || '').toLowerCase() === code) ||
        catalog.find((item) => String(item.code || '').toLowerCase().includes(code))
      )
    }
    if (payload.item_id != null) {
      return catalog.find((item) => Number(item.id) === Number(payload.item_id))
    }
    if (payload.barcode) {
      const code = String(payload.barcode).trim().toLowerCase()
      return catalog.find((item) => String(item.code || '').toLowerCase() === code)
    }
    return undefined
  }

  const addCatalogItem = (catalogItem: SaleCatalogItem) => {
    if (!hasCatalogPurchaseCost(catalogItem)) {
      setError(t('desktop.item_purchase_cost_required'))
      return
    }
    const unit = num(catalogItem.sale_price)
    if (!(unit > 0)) {
      setError(t('desktop.item_purchase_cost_required'))
      return
    }
    if (num(catalogItem.stock) < 1) {
      setError(t('desktop.insufficient_stock'))
      return
    }

    setError(null)
    const existing = cart.find(
      (row) => Number(row.item_id) === Number(catalogItem.id) && isPendingSaleItem(row),
    )
    let nextCart: SaleInvoiceItemRow[]
    if (existing) {
      const qty = num(existing.quantity) + 1
      const lineUnit = num(existing.price) > 0 ? num(existing.price) : unit
      nextCart = cart.map((row) =>
        row.id === existing.id
          ? {
              ...row,
              quantity: qty,
              price: lineUnit,
              total_price: Math.round(lineUnit * qty * 100) / 100,
            }
          : row,
      )
    } else {
      nextCart = [
        ...cart,
        {
          id: pendingIdRef.current--,
          item_id: catalogItem.id,
          item_name: catalogItem.name,
          item_code: catalogItem.code,
          quantity: 1,
          price: unit,
          total_price: unit,
          currency: catalogItem.sale_currency || currency,
          pending: true,
          item: {
            id: catalogItem.id,
            code: catalogItem.code,
            name: catalogItem.name,
            brand: catalogItem.brand,
            model: catalogItem.model,
            color: catalogItem.color,
          },
        },
      ]
    }
    setCart(nextCart)
    setCatalog((prev) => adjustCatalogStock(prev, catalogItem.id, -1))
    syncDiscountAndPaidForCartTotal(invoiceItemsTotal(nextCart), hasCustomer)
  }

  const handleAdd = (
    payload: string | { barcode?: string; item_id?: number | string },
    clearQuery = true,
  ) => {
    const catalogItem = findCatalogItem(payload)
    if (!catalogItem) {
      setError(t('desktop.item_not_found'))
      return
    }
    addCatalogItem(catalogItem)
    if (clearQuery) setQuery('')
  }

  const submitQuery = () => {
    const q = query.trim()
    if (!q) return

    const exactCode = catalog.find((item) => String(item.code || '').toLowerCase() === q.toLowerCase())
    if (exactCode) {
      handleAdd({ item_id: exactCode.id })
      return
    }

    if (filteredCatalog.length === 1) {
      handleAdd({ item_id: filteredCatalog[0].id })
      return
    }

    setError(t('desktop.item_not_found'))
  }

  const removeItem = async (itemSaleId: number | string) => {
    const row = cart.find((item) => item.id === Number(itemSaleId))
    if (!row) return
    const qty = num(row.quantity)
    const itemId = Number(row.item_id)

    if (!isPendingSaleItem(row)) {
      if (!token) return
      setSaving(true)
      setError(null)
      try {
        await easySaleRemoveItem(token, companyId, invoiceId, row.id)
      } catch (err) {
        setError(getApiErrorMessage(err))
        setSaving(false)
        return
      } finally {
        setSaving(false)
      }
    }

    const nextCart = cart.filter((item) => item.id !== row.id)
    setCart(nextCart)
    syncDiscountAndPaidForCartTotal(invoiceItemsTotal(nextCart), hasCustomer)
    if (itemId) setCatalog((prev) => adjustCatalogStock(prev, itemId, qty))
  }

  const updateCartLine = async (
    itemSaleId: number | string,
    patch: { quantity?: number; price?: number },
  ): Promise<boolean> => {
    const row = cart.find((item) => item.id === Number(itemSaleId))
    if (!row || saving) return false

    const oldQty = num(row.quantity)
    const oldPrice = num(row.price)
    let nextQty = patch.quantity != null ? num(patch.quantity) : oldQty
    let nextPrice = patch.price != null ? num(patch.price) : oldPrice

    if (!(nextQty > 0)) {
      await removeItem(row.id)
      return true
    }
    if (!(nextPrice > 0)) {
      return false
    }

    nextQty = Math.round(nextQty * 1000) / 1000
    nextPrice = Math.round(nextPrice * 100) / 100
    if (Math.abs(nextQty - oldQty) < 0.00001 && Math.abs(nextPrice - oldPrice) < 0.00001) {
      return true
    }

    const qtyDelta = nextQty - oldQty
    const itemId = Number(row.item_id)
    if (qtyDelta > 0 && itemId) {
      const catalogItem = catalog.find((item) => Number(item.id) === itemId)
      if (num(catalogItem?.stock) < qtyDelta) {
        setError(t('desktop.insufficient_stock'))
        throw new Error(t('desktop.insufficient_stock'))
      }
    }

    if (!isPendingSaleItem(row)) {
      if (!token) return false
      setSaving(true)
      setError(null)
      try {
        await updateSaleItemQuantity(token, companyId, invoiceId, {
          invoice_item_id: row.id,
          quantity: nextQty,
          price: nextPrice,
        })
      } catch (err) {
        setError(getApiErrorMessage(err))
        setSaving(false)
        throw err
      } finally {
        setSaving(false)
      }
    } else {
      setError(null)
    }

    const nextCart = cart.map((item) =>
      item.id === row.id
        ? {
            ...item,
            quantity: nextQty,
            price: nextPrice,
            total_price: Math.round(nextPrice * nextQty * 100) / 100,
          }
        : item,
    )
    setCart(nextCart)
    if (qtyDelta !== 0 && itemId) {
      setCatalog((prev) => adjustCatalogStock(prev, itemId, -qtyDelta))
    }
    syncDiscountAndPaidForCartTotal(invoiceItemsTotal(nextCart), hasCustomer)
    return true
  }

  const onCustomerChange = (nextId: number | '') => {
    setSelectedCustomerId(nextId)
    if (!nextId) setPaidAmount(String(payable))
  }

  const createCustomerQuick = async (name: string) => {
    if (!token || !companyId) return
    const created = await createBusinessCustomer(token, companyId, {
      name,
      personality: 'human',
    })
    const nextId = Number(created.id)
    if (!Number.isFinite(nextId) || nextId <= 0) {
      throw new Error(t('desktop.add_customer'))
    }
    setCustomers((prev) => {
      if (prev.some((row) => Number(row.id) === nextId)) return prev
      return [{ ...created, id: nextId }, ...prev]
    })
    onCustomerChange(nextId)
    setAddCustomerOpen(false)
  }

  const saveMeta = async (rateOverride?: string) => {
    if (!token || !invoice) return invoice
    const rateText = rateOverride ?? exchangeRate
    const rateNum = num(rateText)
    if (hasDirectionalRate && !(rateNum > 0)) {
      setError(t('desktop.exchange_rate_required'))
      return null
    }

    const updated = await easySaleUpdateMeta(token, companyId, invoiceId, {
      without_customer: !hasCustomer,
      customer_id: hasCustomer ? Number(selectedCustomerId) : undefined,
      company_account_id: invoice.company_account_id || invoice.company_account?.id,
      exchange_rate: hasDirectionalRate ? rateNum : 1,
    })
    setInvoice(updated)
    const nextRate = String(updated.exchange_rate?.rate ?? rateNum ?? 1)
    setExchangeRate(nextRate)
    setSavedExchangeRate(nextRate)
    return updated
  }

  const onRateBlur = async () => {
    if (!hasDirectionalRate) return
    if (String(exchangeRate) === String(savedExchangeRate)) return
    setSaving(true)
    setError(null)
    try {
      await saveMeta(exchangeRate)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setExchangeRate(savedExchangeRate)
    } finally {
      setSaving(false)
    }
  }

  const finalize = async () => {
    if (!token || !invoice || cart.length === 0) return
    if (!hasCustomer && Math.abs(num(paidAmount) - payable) > 0.00001) {
      setError(t('desktop.easy_sale_full_payment_required'))
      return
    }
    if (hasDirectionalRate && !(num(exchangeRate) > 0)) {
      setError(t('desktop.exchange_rate_required'))
      return
    }
    if (discountAmt > total + 0.00001) {
      setError(t('desktop.discount_exceeds_total'))
      return
    }

    setSaving(true)
    setError(null)
    try {
      await saveMeta(exchangeRate)
      const pending = cart.filter(isPendingSaleItem)
      if (pending.length > 0) {
        await easySaleAddItemsBatch(
          token,
          companyId,
          invoiceId,
          pending.map((row) => ({
            item_id: Number(row.item_id),
            quantity: num(row.quantity),
            price: num(row.price),
            currency: row.currency || currency,
          })),
        )
      }
      const updated = await easySaleFinalizePayment(token, companyId, invoice.id, {
        paid_amount: hasCustomer ? paid : payable,
        customer_id: hasCustomer ? Number(selectedCustomerId) : undefined,
        discount_percent: Math.min(100, Math.max(0, num(discountPercent))),
        discount_amount: discountAmt,
      })
      bypassGuard()
      setCart([])
      navigate(businessPath(companyId, `easy-sale/${updated.id}/bill`))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className="loading-state">{t('desktop.loading')}</div>
        {guardModal}
      </>
    )
  }
  if (error && !invoice) {
    return (
      <>
        <div className="alert-error">{error}</div>
        {guardModal}
      </>
    )
  }
  if (!invoice) return <>{guardModal}</>

  return (
    <div className="easy-sale-page" dir="rtl">
      <div className="easy-sale-grid">
        <section className="easy-sale-col8">
          <div className="easy-sale-col8__body">
            <div className="easy-sale-search-row">
              <SearchField
                value={query}
                onChange={(value) => {
                  setQuery(value)
                  if (error) setError(null)
                }}
                placeholder={t('desktop.search_item_placeholder')}
                className="easy-sale-unified-search"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    submitQuery()
                  }
                }}
                disabled={saving}
                autoFocus
              />
              <BarcodeScanButton onClick={() => setScanOpen(true)} disabled={saving} />
              <button type="button" className="btn-primary" onClick={submitQuery} disabled={saving}>
                {t('desktop.insert')}
              </button>
            </div>

            <div className="easy-sale-catalog-grid">
              {filteredCatalog.length === 0 ? (
                <div className="easy-sale-empty muted">{t('desktop.no_items')}</div>
              ) : (
                filteredCatalog.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className="easy-sale-item-card"
                    onClick={() => handleAdd({ item_id: item.id }, false)}
                    disabled={saving}
                  >
                    <CatalogImage src={item.image} alt={String(item.name || '')} />
                    <div className="easy-sale-item-meta">
                      <strong title={item.name || ''}>{item.name || '-'}</strong>
                      <span>
                        {num(item.sale_price).toLocaleString()}{' '}
                        {localizeCurrency(item.sale_currency, t)}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="easy-sale-footer-sticky">
            <div className="easy-sale-footer-customer">
              <div className="easy-sale-footer-customer__row">
                <CustomerSearchSelect
                  customers={customers}
                  value={selectedCustomerId}
                  onChange={onCustomerChange}
                  disabled={saving}
                  noneLabel={t('desktop.without_customer')}
                  searchPlaceholder={t('desktop.search_customer')}
                  emptyLabel={t('desktop.no_customers')}
                />
                <button
                  type="button"
                  className="easy-sale-add-customer-btn"
                  onClick={() => setAddCustomerOpen(true)}
                  disabled={saving}
                  aria-label={t('desktop.add_customer')}
                  title={t('desktop.add_customer')}
                >
                  <i className="fa-solid fa-plus" aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="easy-sale-footer-rate">
              <label className="easy-sale-footer-rate__label" htmlFor="easy-sale-exchange-rate">
                {t('desktop.exchange_rate')}
                {rateFrom && rateTo
                  ? ` (${localizeCurrency(rateFrom, t)} → ${localizeCurrency(rateTo, t)})`
                  : ''}
              </label>
              <input
                id="easy-sale-exchange-rate"
                type="number"
                min="0.0001"
                step="0.0001"
                value={hasDirectionalRate ? exchangeRate : '1'}
                onChange={(e) => setExchangeRate(e.target.value)}
                onBlur={() => void onRateBlur()}
                disabled={!hasDirectionalRate || saving}
              />
            </div>
          </div>
        </section>

        <aside className="easy-sale-col4">
          <div className="easy-sale-col4__head">
            <h5>{t('desktop.sale_step_items')}</h5>
            <span className="muted">
              {cart.length} {t('desktop.total_count')}
            </span>
          </div>

          {error ? <div className="alert-error">{error}</div> : null}

          <div className="easy-sale-selected-list">
            {cart.length === 0 ? (
              <div className="easy-sale-empty muted">{t('desktop.no_items')}</div>
            ) : (
              cart.map((row) => (
                <div key={row.id} className="easy-sale-selected-item-card">
                  <div className="easy-sale-selected-item-main">
                    <strong title={String(row.item_name || '')}>{row.item_name}</strong>
                    <div className="easy-sale-selected-item-meta">
                      <span>
                        {t('desktop.quantity')}: {formatQty(row.quantity)}
                      </span>
                      <span className="easy-sale-dot" aria-hidden="true">
                        ·
                      </span>
                      <span>
                        {t('desktop.unit_price')}: {num(row.price).toLocaleString()}
                      </span>
                      <span className="easy-sale-dot" aria-hidden="true">
                        ·
                      </span>
                      <span>
                        {num(row.total_price).toLocaleString()}{' '}
                        {localizeCurrency(row.currency || currency, t)}
                      </span>
                    </div>
                  </div>
                  <div className="easy-sale-selected-item-actions">
                    <button
                      type="button"
                      className="easy-sale-edit-btn"
                      onClick={() => setEditLine(row)}
                      disabled={saving}
                      aria-label={t('desktop.edit')}
                      title={t('desktop.edit')}
                    >
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button
                      type="button"
                      className="easy-sale-remove-btn"
                      onClick={() => removeItem(row.id)}
                      disabled={saving}
                      aria-label={t('desktop.delete')}
                      title={t('desktop.delete')}
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="easy-sale-payment-box">
            <div className="easy-sale-payment-total">
              <span>{t('desktop.total')}</span>
              <strong>
                {total.toLocaleString()} {localizeCurrency(currency, t)}
              </strong>
            </div>
            <div className="easy-sale-discount-row">
              <label className="easy-sale-payment-field">
                {t('desktop.discount_percent')}
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.01"
                  value={discountPercent}
                  onChange={(e) => setDiscountFromPercent(e.target.value)}
                  disabled={saving || total <= 0}
                  placeholder="0"
                />
              </label>
              <label className="easy-sale-payment-field">
                {t('desktop.discount_amount')}
                <input
                  type="number"
                  min={0}
                  max={total}
                  step="0.01"
                  value={discountAmount}
                  onChange={(e) => setDiscountFromAmount(e.target.value)}
                  disabled={saving || total <= 0}
                  placeholder="0"
                />
              </label>
            </div>
            {discountAmt > 0 ? (
              <div className="easy-sale-payment-total">
                <span>{t('desktop.total_payable')}</span>
                <strong>
                  {payable.toLocaleString()} {localizeCurrency(currency, t)}
                </strong>
              </div>
            ) : null}
            <label className="easy-sale-payment-field">
              {t('desktop.easy_sale_pay')}
              <input
                type="number"
                min={hasCustomer ? 0 : payable}
                max={payable}
                step="0.01"
                value={hasCustomer ? paidAmount : String(payable)}
                onChange={(e) => setPaidAmount(e.target.value)}
                disabled={!hasCustomer || saving}
              />
            </label>
            <button
              type="button"
              className="btn-primary easy-sale-finalize-btn"
              onClick={() => void finalize()}
              disabled={!canFinalize}
            >
              {saving ? t('desktop.processing') : t('desktop.finalize_payment')}
            </button>
          </div>
        </aside>
      </div>

      <BarcodeScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={(value) => {
          setScanOpen(false)
          handleAdd(value)
        }}
      />
      <EasySaleAddCustomerModal
        open={addCustomerOpen}
        onClose={() => setAddCustomerOpen(false)}
        onSubmit={createCustomerQuick}
      />
      <EasySaleEditLineModal
        open={Boolean(editLine)}
        row={editLine}
        catalogItem={
          editLine?.item_id != null
            ? catalog.find((item) => Number(item.id) === Number(editLine.item_id)) || null
            : null
        }
        currencyLabel={localizeCurrency(editLine?.currency || currency, t)}
        busy={saving}
        onClose={() => setEditLine(null)}
        onSave={async ({ quantity, price }) => {
          if (!editLine) return
          await updateCartLine(editLine.id, { quantity, price })
        }}
      />
      {guardModal}
    </div>
  )
}
