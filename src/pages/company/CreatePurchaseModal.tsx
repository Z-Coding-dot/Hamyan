import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { SearchField } from '@/components/inputs/SearchField'
import { Modal } from '@/components/ui/Modal'
import { NumericStepper } from '@/components/ui/NumericStepper'
import { getApiErrorMessage } from '@/lib/auth'
import { todayLocalYmd } from '@/lib/datetime'
import {
  createPurchaseDraft,
  fetchBusinessAccountsList,
  fetchBusinessVendors,
  fetchPurchaseWarehouses,
  type BusinessVendorRow,
  type BusinessWarehouseRow,
} from '@/lib/business'
import { localizeCurrency } from '@/lib/currency'
import type { BusinessAccountRow } from '@/lib/user'

type Props = {
  open: boolean
  companyId: string
  token: string | null
  variant?: 'modal' | 'page'
  onClose: () => void
  onCreated: (purchaseNumber: string | number) => void
  pageHeader?: ReactNode
}

export function CreatePurchaseModal({
  open,
  companyId,
  token,
  variant = 'modal',
  onClose,
  onCreated,
  pageHeader,
}: Props) {
  const { t } = useTranslation()
  const [loadingInit, setLoadingInit] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vendors, setVendors] = useState<BusinessVendorRow[]>([])
  const [accounts, setAccounts] = useState<BusinessAccountRow[]>([])
  const [warehouses, setWarehouses] = useState<BusinessWarehouseRow[]>([])
  const [withoutVendor, setWithoutVendor] = useState(false)
  const [vendorId, setVendorId] = useState('')
  const [vendorSearch, setVendorSearch] = useState('')
  const [accountId, setAccountId] = useState('')
  const [exchangeRate, setExchangeRate] = useState('')
  const [transferToWarehouse, setTransferToWarehouse] = useState(false)
  const [warehouseId, setWarehouseId] = useState('')
  const [purchaseDate, setPurchaseDate] = useState(todayLocalYmd)

  const selectedAccount = accounts.find((a) => String(a.id) === String(accountId))
  const capitalAccount = accounts.find((a) => Boolean(a.is_capital))
  const accountCurrency = String(selectedAccount?.currency || '').toLowerCase()
  const capitalCurrency = String(capitalAccount?.currency || '').toLowerCase()
  const needsRate = Boolean(
    selectedAccount && capitalAccount && String(selectedAccount.id) !== String(capitalAccount.id),
  )

  const filteredVendors = useMemo(() => {
    const q = vendorSearch.trim().toLowerCase()
    if (!q) return []
    return vendors.filter((v) => {
      const fields = [v.name, v.phone, v.id]
      return fields.some((value) => String(value || '').toLowerCase().includes(q))
    })
  }, [vendors, vendorSearch])

  useEffect(() => {
    if (!open || !token || !companyId) return
    let cancelled = false
    const loadInit = async () => {
      setLoadingInit(true)
      setError(null)
      try {
        const [vendorRows, accountRows, warehouseRows] = await Promise.all([
          fetchBusinessVendors(token, companyId),
          fetchBusinessAccountsList(token, companyId),
          fetchPurchaseWarehouses(token, companyId),
        ])
        if (cancelled) return
        setVendors(vendorRows)
        const activeAccounts = accountRows.filter((a) => a.status !== false)
        setAccounts(activeAccounts)
        const preferred = activeAccounts.find((a) => a.is_capital) || activeAccounts[0]
        setAccountId(preferred ? String(preferred.id) : '')
        setWarehouses(warehouseRows)
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err))
      } finally {
        if (!cancelled) setLoadingInit(false)
      }
    }
    void loadInit()
    return () => {
      cancelled = true
    }
  }, [open, token, companyId])

  useEffect(() => {
    if (!open) {
      setError(null)
      setWithoutVendor(false)
      setVendorId('')
      setVendorSearch('')
      setAccountId('')
      setExchangeRate('')
      setTransferToWarehouse(false)
      setWarehouseId('')
      setPurchaseDate(todayLocalYmd())
      setVendors([])
      setAccounts([])
      setWarehouses([])
    }
  }, [open])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!token) return
    if (!withoutVendor && !vendorId) {
      setError(t('desktop.vendor_required'))
      return
    }
    if (!accountId) {
      setError(t('desktop.required_field'))
      return
    }
    if (needsRate && !(Number(exchangeRate) > 0)) {
      setError(t('desktop.exchange_rate_required'))
      return
    }
    if (transferToWarehouse && !warehouseId) {
      setError(t('desktop.warehouse_required'))
      return
    }

    setProcessing(true)
    setError(null)
    try {
      const created = await createPurchaseDraft(token, companyId, {
        without_vendor: withoutVendor,
        vendor_id: withoutVendor ? undefined : vendorId,
        company_account_id: accountId,
        exchange_rate: needsRate ? exchangeRate : undefined,
        transfer_to_warehouse: transferToWarehouse,
        company_warehouse_id: transferToWarehouse ? warehouseId : undefined,
        purchase_date: purchaseDate || null,
      })
      onCreated(created.purchase_number ?? created.id)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  const body = loadingInit ? (
    <p className="muted text-center">{t('desktop.loading')}</p>
  ) : (
    <form onSubmit={(e) => void submit(e)} className="form-grid" dir="rtl">
      {error ? <div className="alert-error">{error}</div> : null}

      <label className="check-row">
        <input
          type="checkbox"
          checked={withoutVendor}
          onChange={(e) => setWithoutVendor(e.target.checked)}
        />
        {t('desktop.without_vendor')}
      </label>

      {!withoutVendor ? (
        <div>
          <SearchField
            label={t('desktop.vendors')}
            value={vendorSearch}
            onChange={setVendorSearch}
            placeholder={t('desktop.search_vendor_placeholder')}
          />
          {vendorSearch.trim() ? (
            <div className="mt-2" style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
              {filteredVendors.length > 0 ? (
                filteredVendors.map((v) => {
                  const label = v.name || `#${v.id}`
                  const selected = String(v.id) === String(vendorId)
                  return (
                    <button
                      key={v.id}
                      type="button"
                      style={{
                        width: '100%',
                        textAlign: 'right',
                        padding: '8px 12px',
                        border: 0,
                        borderBottom: '1px solid #f3f4f6',
                        background: selected ? '#2563eb' : '#fff',
                        color: selected ? '#fff' : 'inherit',
                      }}
                      onClick={() => {
                        setVendorId(String(v.id))
                        setVendorSearch(label)
                      }}
                    >
                      <div style={{ fontWeight: 600 }}>{label}</div>
                      {v.phone ? <div className="muted">{v.phone}</div> : null}
                    </button>
                  )
                })
              ) : (
                <div className="p-3 muted">{t('desktop.no_matching_vendors')}</div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}

      <label>
        {t('desktop.purchase_date')}
        <JalaliDatePicker
          value={purchaseDate}
          onChange={setPurchaseDate}
          allowEmpty
          disabled={processing}
        />
      </label>

      <label>
        {t('desktop.company_account')}
        <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
          <option value="">{t('desktop.select')}</option>
          {accounts.map((a) => (
            <option key={a.id} value={a.id}>
              {(a.name || `#${a.id}`) + ' - ' + localizeCurrency(a.currency, t)}
            </option>
          ))}
        </Select>
      </label>

      <label>
        {t('desktop.currency')}
        <input type="text" value={localizeCurrency(accountCurrency, t)} disabled />
      </label>

      {needsRate ? (
        <label>
          {t('desktop.exchange_rate')}
          <small className="muted d-block mb-1">
            {t('desktop.exchange_rate_direction', {
              from: localizeCurrency(capitalCurrency, t),
              to: localizeCurrency(accountCurrency, t),
            })}
          </small>
          <NumericStepper
            value={exchangeRate}
            onChange={setExchangeRate}
            onDecrement={() =>
              setExchangeRate(
                String(Math.round(Math.max(Number(exchangeRate || 0) - 0.01, 0) * 100) / 100),
              )
            }
            onIncrement={() =>
              setExchangeRate(String(Math.round((Number(exchangeRate || 0) + 0.01) * 100) / 100))
            }
            inputProps={{ min: 0, step: 'any', placeholder: '71.25' }}
          />
        </label>
      ) : null}

      <label className="check-row">
        <input
          type="checkbox"
          checked={transferToWarehouse}
          onChange={(e) => {
            setTransferToWarehouse(e.target.checked)
            if (!e.target.checked) setWarehouseId('')
          }}
        />
        {t('desktop.transfer_to_warehouse')}
      </label>

      {transferToWarehouse ? (
        <label>
          {t('desktop.warehouse')}
          <Select value={warehouseId} onChange={(e) => setWarehouseId(e.target.value)} required>
            <option value="">{t('desktop.select')}</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
                {w.address ? ` — ${w.address}` : ''}
              </option>
            ))}
          </Select>
          {warehouses.length === 0 ? (
            <span className="field-error">{t('desktop.no_warehouses')}</span>
          ) : null}
        </label>
      ) : null}

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onClose}>
          {t('desktop.cancel')}
        </button>
        <button type="submit" className="btn-primary" disabled={processing}>
          {processing ? t('desktop.processing') : t('desktop.continue')}
        </button>
      </div>
    </form>
  )

  if (variant === 'page') {
    return (
      <div className="dash-div party-page" dir="rtl">
        {pageHeader}
        {body}
      </div>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={t('desktop.create_purchase')} wide>
      {body}
    </Modal>
  )
}
