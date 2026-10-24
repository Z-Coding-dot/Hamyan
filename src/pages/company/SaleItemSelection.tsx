import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { SearchField } from '@/components/inputs/SearchField'
import { BarcodeScanButton, BarcodeScanModal } from '@/components/BarcodeScanModal'
import { NumericStepper } from '@/components/ui/NumericStepper'
import { localizeCurrency } from '@/lib/currency'
import {
  basePriceFromScale,
  hasExtraItemUnits,
  itemUnitFactor,
  itemUnitOptions,
  priceForScale,
  toBaseQuantity,
  type ItemUnitScale,
} from '@/lib/itemUnits'
import type {
  QuickSaleExchangeRateContext,
  SaleCatalogItem,
  SaleInvoiceShow,
} from '@/lib/business'

type ItemForm = {
  item_id: string
  quantity: string
  price: string
  total_price: number
  serial_number: string
  remark: string
  unit_scale: ItemUnitScale
}

type Props = {
  invoice: SaleInvoiceShow
  items: SaleCatalogItem[]
  exchangeRateContext?: QuickSaleExchangeRateContext | null
  busy?: boolean
  error?: string | null
  onAddItem: (payload: {
    item_id: string
    quantity: string
    price: string
    serial_number?: string
    remark?: string
  }) => Promise<boolean>
  onGoToPayment: () => void
}

function toNum(v: unknown) {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

function fmt(v: unknown) {
  return toNum(v).toLocaleString(undefined, { maximumFractionDigits: 2 })
}

function purchaseUnit(item: SaleCatalogItem, isUSD: boolean, rate: number) {
  const cost = toNum(item.purchase_unit_cost)
  const cur = String(item.purchase_currency || '').toLowerCase()
  if (cost > 0 && (cur === 'usd' || cur === 'afn')) {
    if (isUSD) return cur === 'usd' ? cost : rate > 0 ? cost / rate : 0
    return cur === 'afn' ? cost : rate > 0 ? cost * rate : 0
  }
  const ppAFN = toNum(item.price_afn)
  const ppUSD = toNum(item.price_usd)
  if (isUSD) {
    if (ppUSD > 0) return ppUSD
    if (ppAFN > 0 && rate > 0) return ppAFN / rate
    return 0
  }
  if (ppAFN > 0) return ppAFN
  if (ppUSD > 0 && rate > 0) return ppUSD * rate
  return 0
}

function pickDefaultSellUnit(item: SaleCatalogItem, isUSD: boolean, rate: number) {
  const spAFN = toNum(item.sale_price_afn ?? (item.sale_currency === 'afn' ? item.sale_price : 0))
  const spUSD = toNum(item.sale_price_usd ?? (item.sale_currency === 'usd' ? item.sale_price : 0))

  if (isUSD) {
    if (spUSD > 0) return spUSD
    if (spAFN > 0 && rate > 0) return spAFN / rate
    return purchaseUnit(item, true, rate)
  }
  if (spAFN > 0) return spAFN
  if (spUSD > 0 && rate > 0) return spUSD * rate
  return purchaseUnit(item, false, rate)
}

export function hasCatalogPurchaseCost(item: SaleCatalogItem | null | undefined) {
  if (!item) return false
  if (toNum(item.purchase_unit_cost) > 0) return true
  return toNum(item.price_afn) > 0 || toNum(item.price_usd) > 0
}

const emptyForm = (): ItemForm => ({
  item_id: '',
  quantity: '1',
  price: '',
  total_price: 0,
  serial_number: '',
  remark: '',
  unit_scale: 'base',
})

export function SaleItemSelection({
  invoice,
  items,
  exchangeRateContext,
  busy = false,
  error = null,
  onAddItem,
  onGoToPayment,
}: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState<ItemForm>(emptyForm)
  const [barcode, setBarcode] = useState('')
  const [barcodeMsg, setBarcodeMsg] = useState('')
  const [barcodeError, setBarcodeError] = useState('')
  const [scanOpen, setScanOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [selectedName, setSelectedName] = useState('')
  const [selectError, setSelectError] = useState('')

  const currency = String(invoice.currency || 'afn').toLowerCase()
  const isUSD = currency === 'usd'
  const currLabel = localizeCurrency(isUSD ? 'usd' : 'afn', t)
  const altLabel = localizeCurrency(isUSD ? 'afn' : 'usd', t)
  const invoiceRate = toNum(invoice.exchange_rate?.rate)
  const hasItems = (invoice.items || []).length > 0
  const selectedItem = useMemo(
    () => items.find((item) => String(item.id) === String(form.item_id)),
    [items, form.item_id],
  )
  const isDigital = String(selectedItem?.type || '').toLowerCase() === 'digital'

  const fromCurrency = String(exchangeRateContext?.from_currency || '').toLowerCase()
  const toCurrency = String(exchangeRateContext?.to_currency || '').toLowerCase()
  const hasDirectionalRate = Boolean(fromCurrency && toCurrency)
  const showRate = hasDirectionalRate && invoiceRate > 0

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return [] as SaleCatalogItem[]
    return items.filter(
      (item) =>
        hasCatalogPurchaseCost(item) &&
        [item.name, item.code, item.brand, item.model].some((v) =>
          String(v || '')
            .toLowerCase()
            .includes(q),
        ),
    )
  }, [items, search])

  const unitOptions = useMemo(() => itemUnitOptions(selectedItem), [selectedItem])
  const selectedFactor = itemUnitFactor(selectedItem, form.unit_scale) || 1

  const selectItem = (item: SaleCatalogItem) => {
    if (!hasCatalogPurchaseCost(item)) {
      setSelectError(t('desktop.item_purchase_cost_required'))
      return false
    }
    const baseUnit = pickDefaultSellUnit(item, isUSD, invoiceRate)
    if (!(baseUnit > 0)) {
      setSelectError(t('desktop.item_purchase_cost_required'))
      return false
    }
    const scale: ItemUnitScale = 'base'
    const factor = itemUnitFactor(item, scale) || 1
    const unit = priceForScale(baseUnit, factor)
    const qty = Math.max(0.01, toNum(form.quantity) || 1)
    setForm({
      item_id: String(item.id),
      quantity: String(qty),
      price: String(unit || ''),
      total_price: (unit || 0) * qty,
      serial_number: String(item.type || '').toLowerCase() === 'digital' ? form.serial_number : '',
      remark: '',
      unit_scale: scale,
    })
    setSelectedName(item.name || `#${item.id}`)
    setSearch(item.name || '')
    setShowResults(false)
    setBarcodeMsg('')
    setBarcodeError('')
    setSelectError('')
    return true
  }

  const changeUnitScale = (scale: ItemUnitScale) => {
    if (!selectedItem) {
      setForm((prev) => ({ ...prev, unit_scale: scale }))
      return
    }
    const oldFactor = itemUnitFactor(selectedItem, form.unit_scale) || 1
    const newFactor = itemUnitFactor(selectedItem, scale) || 1
    const basePrice = basePriceFromScale(toNum(form.price), oldFactor)
    const nextPrice = priceForScale(basePrice > 0 ? basePrice : pickDefaultSellUnit(selectedItem, isUSD, invoiceRate), newFactor)
    const qty = Math.max(0.01, toNum(form.quantity) || 1)
    setForm((prev) => ({
      ...prev,
      unit_scale: scale,
      price: String(nextPrice || ''),
      total_price: (nextPrice || 0) * qty,
    }))
  }

  useEffect(() => {
    if (!form.item_id) return
    const item = items.find((i) => String(i.id) === String(form.item_id))
    if (!item) return
    const qty = Math.max(0.01, toNum(form.quantity) || 1)
    if (!(toNum(form.price) > 0)) {
      const baseUnit = pickDefaultSellUnit(item, isUSD, invoiceRate)
      const unit = priceForScale(baseUnit, itemUnitFactor(item, form.unit_scale) || 1)
      setForm((prev) => ({
        ...prev,
        price: String(unit || ''),
        total_price: (unit || 0) * qty,
      }))
    } else {
      setForm((prev) => ({
        ...prev,
        total_price: toNum(prev.price) * qty,
      }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.item_id, form.quantity, invoiceRate])

  useEffect(() => {
    const qty = Math.max(0.01, toNum(form.quantity) || 1)
    const unit = toNum(form.price)
    setForm((prev) => ({ ...prev, total_price: qty > 0 && unit > 0 ? unit * qty : 0 }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.price])

  const applyBarcode = (raw: string) => {
    const code = String(raw || '').trim()
    if (!code) return
    const found = items.find((item) => String(item.code || '').trim() === code)
    if (!found) {
      setBarcodeError(t('desktop.item_not_found'))
      setBarcodeMsg('')
      return
    }
    if (!selectItem(found)) {
      setBarcodeError(t('desktop.item_purchase_cost_required'))
      setBarcodeMsg('')
      return
    }
    setBarcode('')
    setBarcodeError('')
    setBarcodeMsg(found.name || t('desktop.saved_success'))
  }

  const restoreDefaultPrice = () => {
    if (!form.item_id) return
    const item = items.find((i) => String(i.id) === String(form.item_id))
    if (!item) return
    const qty = Math.max(0.01, toNum(form.quantity) || 1)
    const baseUnit = pickDefaultSellUnit(item, isUSD, invoiceRate)
    const unit = priceForScale(baseUnit, itemUnitFactor(item, form.unit_scale) || 1)
    setForm((prev) => ({
      ...prev,
      price: String(unit || ''),
      total_price: (unit || 0) * qty,
    }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.item_id || !(toNum(form.quantity) > 0)) return
    if (!(toNum(form.price) > 0)) return
    if (!hasCatalogPurchaseCost(selectedItem)) {
      setSelectError(t('desktop.item_purchase_cost_required'))
      return
    }
    const factor = itemUnitFactor(selectedItem, form.unit_scale) || 1
    const baseQty = toBaseQuantity(toNum(form.quantity), selectedItem, form.unit_scale)
    const basePrice = basePriceFromScale(toNum(form.price), factor)
    if (!(baseQty > 0) || !(basePrice > 0)) return
    const ok = await onAddItem({
      item_id: form.item_id,
      quantity: String(baseQty),
      price: String(basePrice),
      serial_number: isDigital && baseQty === 1 ? form.serial_number || undefined : undefined,
      remark: form.remark || undefined,
    })
    if (ok) {
      setForm(emptyForm())
      setSearch('')
      setSelectedName('')
      setBarcodeMsg('')
    }
  }

  const altUnit =
    showRate && toNum(form.price) > 0
      ? isUSD
        ? toNum(form.price) * invoiceRate
        : toNum(form.price) / invoiceRate
      : null
  const altTotal =
    showRate && form.total_price > 0
      ? isUSD
        ? form.total_price * invoiceRate
        : form.total_price / invoiceRate
      : null

  return (
    <div className="sale-item-selection party-summary" dir="rtl">
      <h6 style={{ marginTop: 0 }}>{t('desktop.add_item')}</h6>

      {!(invoiceRate > 0) && hasDirectionalRate ? (
        <div className="alert-error">{t('desktop.invoice_rate_missing')}</div>
      ) : null}

      <form onSubmit={(e) => void submit(e)} className="form-grid">
        <label>
          {t('desktop.barcode')}
          <div className="sale-inline-row">
            <input
              value={barcode}
              onChange={(e) => {
                setBarcode(e.target.value)
                setBarcodeError('')
                setBarcodeMsg('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyBarcode(barcode)
                }
              }}
              disabled={busy}
              placeholder={t('desktop.barcode')}
            />
            <button
              type="button"
              className="btn-primary"
              disabled={busy || !barcode.trim()}
              onClick={() => applyBarcode(barcode)}
            >
              {t('desktop.find')}
            </button>
            <BarcodeScanButton disabled={busy} onClick={() => setScanOpen(true)} />
          </div>
          {barcodeError ? <span className="field-error">{barcodeError}</span> : null}
          {!barcodeError && barcodeMsg ? <span className="muted">{barcodeMsg}</span> : null}
        </label>

        <SearchField
          label={t('desktop.search_item')}
          value={search}
          onChange={(value) => {
            setSearch(value)
            setShowResults(Boolean(value.trim()))
          }}
          disabled={busy}
          placeholder={t('desktop.search_item')}
        />

        {showResults ? (
          <div className="sale-search-results">
            {filtered.length === 0 ? (
              <div className="muted">{t('desktop.no_matching_items')}</div>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="sale-search-result"
                  onClick={() => selectItem(item)}
                >
                  {item.name || `#${item.id}`}
                  {item.code ? ` — ${item.code}` : ''}
                  <span className="muted"> ({fmt(item.stock)})</span>
                </button>
              ))
            )}
          </div>
        ) : null}

        {selectedName ? (
          <div className="muted">
            {t('desktop.items')}: <strong>{selectedName}</strong>
          </div>
        ) : null}
        {selectError ? <div className="alert-error">{selectError}</div> : null}

        {hasExtraItemUnits(selectedItem) ? (
          <label>
            {t('desktop.measure_unit')}
            <select
              disabled={busy}
              value={form.unit_scale}
              onChange={(e) => changeUnitScale(e.target.value as ItemUnitScale)}
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
          {unitOptions.find((o) => o.scale === form.unit_scale)
            ? ` (${unitOptions.find((o) => o.scale === form.unit_scale)?.label})`
            : null}
          <NumericStepper
            value={form.quantity}
            disabled={busy}
            onChange={(value) => setForm((prev) => ({ ...prev, quantity: value }))}
            onDecrement={() =>
              setForm((prev) => ({
                ...prev,
                quantity: String(Math.max(0.01, Math.round((toNum(prev.quantity) - 1) * 100) / 100)),
              }))
            }
            onIncrement={() =>
              setForm((prev) => ({
                ...prev,
                quantity: String(Math.round((toNum(prev.quantity) + 1) * 100) / 100),
              }))
            }
            inputProps={{ min: 0, step: 'any', required: true }}
          />
          {selectedFactor > 1 && toNum(form.quantity) > 0 ? (
            <span className="muted">
              = {toBaseQuantity(toNum(form.quantity), selectedItem, form.unit_scale)}{' '}
              {selectedItem?.unit_name || t('desktop.unit_small')}
            </span>
          ) : null}
        </label>

        {isDigital && toBaseQuantity(toNum(form.quantity), selectedItem, form.unit_scale) === 1 ? (
          <label>
            {t('desktop.serial_number')}
            <input
              value={form.serial_number}
              onChange={(e) => setForm((prev) => ({ ...prev, serial_number: e.target.value }))}
              disabled={busy}
            />
          </label>
        ) : null}

        <label>
          {t('desktop.price_per_unit')} ({currLabel})
          <NumericStepper
            value={form.price}
            disabled={busy}
            onChange={(value) => setForm((prev) => ({ ...prev, price: value }))}
            onDecrement={() =>
              setForm((prev) => ({
                ...prev,
                price: String(Math.max(0.01, Math.round((toNum(prev.price) - 0.01) * 100) / 100)),
              }))
            }
            onIncrement={() =>
              setForm((prev) => ({
                ...prev,
                price: String(Math.round((toNum(prev.price) + 0.01) * 100) / 100),
              }))
            }
            inputProps={{ min: 0, step: 'any', required: true }}
          />
          <button
            type="button"
            className="btn-secondary btn-sm"
            style={{ marginTop: 6 }}
            onClick={restoreDefaultPrice}
            disabled={busy || !form.item_id}
          >
            {t('desktop.reset_item_price')}
          </button>
          {altUnit != null ? (
            <span className="muted">
              ≈ {fmt(altUnit)} {altLabel}
            </span>
          ) : null}
        </label>

        {showRate ? (
          <label>
            {t('desktop.exchange_rate')}
            <input value={invoiceRate > 0 ? String(invoiceRate) : '—'} readOnly />
          </label>
        ) : null}

        <label>
          {t('desktop.total_cost')} ({currLabel})
          <input value={fmt(form.total_price)} readOnly />
          {altTotal != null ? (
            <span className="muted">
              ≈ {fmt(altTotal)} {altLabel}
            </span>
          ) : null}
        </label>

        <label>
          {t('desktop.remark')}
          <input
            value={form.remark}
            onChange={(e) => setForm((prev) => ({ ...prev, remark: e.target.value }))}
            disabled={busy}
          />
        </label>

        {error ? <div className="alert-error">{error}</div> : null}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={busy || !form.item_id}>
            {busy ? t('desktop.processing') : t('desktop.save')}
          </button>
          <button
            type="button"
            className="btn-primary"
            disabled={busy || !hasItems}
            onClick={onGoToPayment}
          >
            {t('desktop.go_to_payment')}
          </button>
        </div>
      </form>
      <BarcodeScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={(code) => applyBarcode(code)}
      />
    </div>
  )
}
