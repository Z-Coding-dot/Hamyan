import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react'
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
import type { PurchaseCatalogItem, PurchaseShow } from '@/lib/business'

type ItemForm = {
  item_id: string
  quantity: string
  purchase_price: string
  total_price: number
  serial_number: string
  unit_scale: ItemUnitScale
}

type Props = {
  invoice: PurchaseShow
  items: PurchaseCatalogItem[]
  busy?: boolean
  error?: string | null
  footer?: ReactNode
  onAddItem: (payload: {
    item_id: string
    quantity: string
    purchase_price: string
    serial_number?: string
  }) => Promise<boolean> | boolean
}

function toNum(v: unknown) {
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

const emptyForm = (): ItemForm => ({
  item_id: '',
  quantity: '1',
  purchase_price: '',
  total_price: 0,
  serial_number: '',
  unit_scale: 'base',
})

export function PurchaseItemSelection({
  invoice,
  items,
  busy = false,
  error = null,
  footer = null,
  onAddItem,
}: Props) {
  const { t } = useTranslation()
  const [form, setForm] = useState<ItemForm>(emptyForm)
  const [barcode, setBarcode] = useState('')
  const [scanOpen, setScanOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [localErrors, setLocalErrors] = useState<Record<string, string>>({})

  const purchaseCur = String(invoice.currency || 'afn').toLowerCase()
  const curLabel = localizeCurrency(purchaseCur, t)

  const selectedItem = useMemo(
    () => items.find((i) => String(i.id) === String(form.item_id)),
    [items, form.item_id],
  )
  const isDigital = String(selectedItem?.type || '').toLowerCase() === 'digital'
  const unitOptions = useMemo(() => itemUnitOptions(selectedItem), [selectedItem])
  const selectedFactor = itemUnitFactor(selectedItem, form.unit_scale) || 1

  const normalizedSearch = search.trim().toLowerCase()
  const filteredItems = useMemo(() => {
    if (!normalizedSearch) return []
    return items.filter((item) => {
      const fields = [item.name, item.code, item.serial_number]
      return fields.some((v) => String(v || '').toLowerCase().includes(normalizedSearch))
    })
  }, [items, normalizedSearch])

  useEffect(() => {
    const price = toNum(form.purchase_price)
    const qty = toNum(form.quantity)
    setForm((prev) => ({ ...prev, total_price: price > 0 && qty > 0 ? price * qty : 0 }))
  }, [form.purchase_price, form.quantity])

  const applyBarcode = (codeValue: string) => {
    const trimmed = normalizeDigits(codeValue).trim()
    if (!trimmed) return
    setSearch(trimmed)
    setLocalErrors((prev) => {
      const next = { ...prev }
      delete next.barcode
      return next
    })
    const matches = items.filter((item) => {
      const fields = [item.name, item.code, item.serial_number]
      return fields.some((v) => String(v || '').toLowerCase().includes(trimmed.toLowerCase()))
    })
    if (matches.length === 0) {
      setLocalErrors((prev) => ({ ...prev, barcode: t('desktop.barcode_not_found') }))
    }
  }

  const selectItem = (item: PurchaseCatalogItem) => {
    const basePrice =
      purchaseCur === 'usd' ? toNum(item.price_usd) : toNum(item.price_afn)
    const scale: ItemUnitScale = 'base'
    const unitPrice = priceForScale(basePrice, itemUnitFactor(item, scale) || 1)
    setForm((prev) => ({
      ...prev,
      item_id: String(item.id),
      purchase_price: String(unitPrice || ''),
      total_price: unitPrice * toNum(prev.quantity || 1),
      serial_number: String(item.type || '').toLowerCase() === 'digital' ? prev.serial_number : '',
      unit_scale: scale,
    }))
    setSearch(item.name || item.code || '')
    setLocalErrors({})
  }

  const changeUnitScale = (scale: ItemUnitScale) => {
    if (!selectedItem) {
      setForm((prev) => ({ ...prev, unit_scale: scale }))
      return
    }
    const oldFactor = itemUnitFactor(selectedItem, form.unit_scale) || 1
    const newFactor = itemUnitFactor(selectedItem, scale) || 1
    const basePrice = basePriceFromScale(toNum(form.purchase_price), oldFactor)
    const fallback =
      purchaseCur === 'usd' ? toNum(selectedItem.price_usd) : toNum(selectedItem.price_afn)
    const nextPrice = priceForScale(basePrice > 0 ? basePrice : fallback, newFactor)
    const qty = toNum(form.quantity)
    setForm((prev) => ({
      ...prev,
      unit_scale: scale,
      purchase_price: String(nextPrice || ''),
      total_price: (nextPrice || 0) * qty,
    }))
  }

  const adjustField = (name: 'quantity' | 'purchase_price', delta: number) => {
    const current = toNum(form[name])
    const next = Math.round(Math.max(current + delta, 0) * 100) / 100
    setForm((prev) => ({ ...prev, [name]: String(next) }))
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    const errors: Record<string, string> = {}
    if (!form.item_id) errors.item_id = t('desktop.item_required')
    const price = toNum(form.purchase_price)
    if (!(price > 0)) errors.purchase_price = t('desktop.price_required')
    const qty = toNum(form.quantity)
    if (!(qty > 0)) errors.quantity = t('desktop.quantity_required')
    const factor = itemUnitFactor(selectedItem, form.unit_scale) || 1
    const baseQty = toBaseQuantity(qty, selectedItem, form.unit_scale)
    const basePrice = basePriceFromScale(price, factor)
    if (isDigital && baseQty === 1 && !String(form.serial_number || '').trim()) {
      errors.serial_number = t('desktop.serial_required')
    }
    if (Object.keys(errors).length) {
      setLocalErrors(errors)
      return
    }
    if (!(baseQty > 0) || !(basePrice > 0)) return

    const ok = await onAddItem({
      item_id: form.item_id,
      quantity: String(baseQty),
      purchase_price: String(basePrice),
      serial_number: isDigital && baseQty === 1 ? form.serial_number : undefined,
    })
    if (ok) {
      setForm(emptyForm())
      setBarcode('')
      setSearch('')
      setLocalErrors({})
    }
  }

  return (
    <div className="sale-item-selection party-summary" dir="rtl">
      <h5 className="sale-payment__title">{t('desktop.add_item')}</h5>

      <form onSubmit={(e) => void submit(e)} className="form-grid">
        <label>
          {t('desktop.barcode')}
          <div className="d-flex gap-2" style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={barcode}
              onChange={(e) => setBarcode(normalizeDigits(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  applyBarcode(barcode)
                }
              }}
              disabled={busy}
              placeholder={t('desktop.barcode_placeholder')}
            />
            <button
              type="button"
              className="btn-secondary"
              disabled={busy || !barcode}
              onClick={() => applyBarcode(barcode)}
            >
              {t('desktop.find')}
            </button>
            <BarcodeScanButton disabled={busy} onClick={() => setScanOpen(true)} />
          </div>
          {localErrors.barcode ? <span className="field-error">{localErrors.barcode}</span> : null}
        </label>

        <SearchField
          label={t('desktop.search_item')}
          value={search}
          onChange={(value) => setSearch(normalizeDigits(value))}
          disabled={busy}
          placeholder={t('desktop.search_item_placeholder')}
        />

        <div>
          <div className="muted mb-2">{t('desktop.select_item')}</div>
          <div className="border rounded" style={{ border: '1px solid #e5e7eb', borderRadius: 8 }}>
            {normalizedSearch ? (
              filteredItems.length > 0 ? (
                <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                  {filteredItems.map((item) => {
                    const price =
                      purchaseCur === 'usd' ? toNum(item.price_usd) : toNum(item.price_afn)
                    return (
                      <button
                        key={item.id}
                        type="button"
                        className="w-100 text-right"
                        style={{
                          width: '100%',
                          textAlign: 'right',
                          padding: '8px 12px',
                          border: 0,
                          borderBottom: '1px solid #f3f4f6',
                          background: String(form.item_id) === String(item.id) ? '#eff6ff' : '#fff',
                        }}
                        onClick={() => selectItem(item)}
                      >
                        <div style={{ fontWeight: 600 }}>
                          {item.name}
                          {price > 0 ? ` (${price} ${curLabel})` : ''}
                        </div>
                        {item.code ? <div className="muted">{item.code}</div> : null}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="p-3 muted">{t('desktop.no_matching_items')}</div>
              )
            ) : (
              <div className="p-3 muted">{t('desktop.type_to_search_item')}</div>
            )}
          </div>
          {localErrors.item_id ? <span className="field-error">{localErrors.item_id}</span> : null}
        </div>

        {hasExtraItemUnits(selectedItem) ? (
          <label>
            {t('desktop.measure_unit')}
            <Select
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
            </Select>
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
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                quantity: normalizeDigits(value).replace(/[^0-9.]/g, ''),
              }))
            }
            onDecrement={() => adjustField('quantity', -0.1)}
            onIncrement={() => adjustField('quantity', 0.1)}
            inputProps={{ min: 0, step: 'any' }}
          />
          {selectedFactor > 1 && toNum(form.quantity) > 0 ? (
            <span className="muted">
              = {toBaseQuantity(toNum(form.quantity), selectedItem, form.unit_scale)}{' '}
              {selectedItem?.unit_name || t('desktop.unit_small')}
            </span>
          ) : null}
          {localErrors.quantity ? <span className="field-error">{localErrors.quantity}</span> : null}
        </label>

        {isDigital && toBaseQuantity(toNum(form.quantity), selectedItem, form.unit_scale) === 1 ? (
          <label>
            {t('desktop.serial_number')}
            <input
              type="text"
              value={form.serial_number}
              onChange={(e) => setForm((prev) => ({ ...prev, serial_number: e.target.value }))}
              disabled={busy}
            />
            {localErrors.serial_number ? (
              <span className="field-error">{localErrors.serial_number}</span>
            ) : null}
          </label>
        ) : null}

        <label>
          {t('desktop.unit_price')} ({curLabel})
          <NumericStepper
            value={form.purchase_price}
            disabled={busy}
            onChange={(value) =>
              setForm((prev) => ({
                ...prev,
                purchase_price: normalizeDigits(value).replace(/[^0-9.]/g, ''),
              }))
            }
            onDecrement={() => adjustField('purchase_price', -0.01)}
            onIncrement={() => adjustField('purchase_price', 0.01)}
            inputProps={{ min: 0, step: 'any' }}
          />
          {localErrors.purchase_price ? (
            <span className="field-error">{localErrors.purchase_price}</span>
          ) : null}
        </label>

        <label>
          {t('desktop.total')} ({curLabel})
          <input type="text" value={String(form.total_price || 0)} readOnly dir="ltr" />
        </label>

        {error ? <div className="alert-error">{error}</div> : null}

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={busy} style={{ width: '100%' }}>
            {busy ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>

      {footer ? <div className="sale-item-selection__footer">{footer}</div> : null}
      <BarcodeScanModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={(code) => applyBarcode(code)}
      />
    </div>
  )
}
