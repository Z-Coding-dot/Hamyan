import { FormEvent, useEffect, useMemo, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { SearchField } from '@/components/inputs/SearchField'
import { Modal } from '@/components/ui/Modal'
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits'
import { getApiErrorMessage } from '@/lib/auth'
import {
  createWarehouseTransfer,
  fetchWarehouseInventory,
  type InventoryPayload,
  type InventoryStockRow,
} from '@/lib/business'
import { formatJalaliSlash } from '@/lib/datetime'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

type TransferType = 'warehouse_to_warehouse' | 'warehouse_to_company' | 'company_to_warehouse'

type TransferForm = {
  type: TransferType
  item_id: string
  quantity: string
  from_warehouse_id: string
  to_warehouse_id: string
  remark: string
}

const emptyTransferForm: TransferForm = {
  type: 'warehouse_to_warehouse',
  item_id: '',
  quantity: '',
  from_warehouse_id: '',
  to_warehouse_id: '',
  remark: '',
}

function formatQty(value: number | string | null | undefined): string {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n.toLocaleString('en-US') : '0'
}

export function CompanyWarehouseInventoryPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const { resolveName } = useMeasurementUnits(companyId)
  const canManage = Boolean(business.permissions?.canManageInventory) && business.is_active
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [payload, setPayload] = useState<InventoryPayload>({
    company_stock: [],
    warehouses: [],
    inventory_rows: [],
    warehouse_options: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState<'all' | 'warehouse' | 'company'>('all')
  const [warehouseFilter, setWarehouseFilter] = useState('all')
  const [transferOpen, setTransferOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<InventoryStockRow | null>(null)
  const [transferForm, setTransferForm] = useState<TransferForm>(emptyTransferForm)
  const [transferLoading, setTransferLoading] = useState(false)
  const [transferError, setTransferError] = useState<string | null>(null)

  const load = async () => {
    if (!token || !companyId) return
    setLoading(true)
    setError(null)
    try {
      setPayload(await fetchWarehouseInventory(token, companyId))
    } catch (err) {
      setError(getApiErrorMessage(err))
      setPayload({
        company_stock: [],
        warehouses: [],
        inventory_rows: [],
        warehouse_options: [],
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId])

  const rows = payload.inventory_rows
  const warehouses = payload.warehouse_options

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase()
    return rows.filter((row) => {
      const matchesSearch =
        !q ||
        [row.name, row.code, row.model, row.warehouse_name].some((value) =>
          String(value || '').toLowerCase().includes(q),
        )
      const matchesLocation =
        locationFilter === 'all' ||
        (locationFilter === 'company' && row.location === 'company') ||
        (locationFilter === 'warehouse' && row.location === 'warehouse')
      const matchesWarehouse =
        warehouseFilter === 'all' || String(row.warehouse_id ?? '') === String(warehouseFilter)
      return matchesSearch && matchesLocation && matchesWarehouse
    })
  }, [rows, search, locationFilter, warehouseFilter])

  const itemOptions = useMemo(() => {
    const map = new Map<number, { id: number; name?: string | null; code?: string | null }>()
    for (const row of rows) {
      if (!map.has(row.item_id)) {
        map.set(row.item_id, { id: row.item_id, name: row.name, code: row.code })
      }
    }
    return Array.from(map.values())
  }, [rows])

  const openTransferModal = (row: InventoryStockRow | null = null) => {
    setSelectedRow(row)
    setTransferError(null)
    if (row?.location === 'company') {
      setTransferForm({
        ...emptyTransferForm,
        type: 'company_to_warehouse',
        item_id: String(row.item_id),
        from_warehouse_id: '',
        to_warehouse_id: warehouses[0]?.id ? String(warehouses[0].id) : '',
      })
    } else if (row?.location === 'warehouse') {
      setTransferForm({
        ...emptyTransferForm,
        type: 'warehouse_to_company',
        item_id: String(row.item_id),
        from_warehouse_id: String(row.warehouse_id ?? ''),
        to_warehouse_id: '',
      })
    } else {
      setTransferForm(emptyTransferForm)
    }
    setTransferOpen(true)
  }

  const closeTransferModal = () => {
    if (transferLoading) return
    setTransferOpen(false)
    setSelectedRow(null)
    setTransferForm(emptyTransferForm)
    setTransferError(null)
  }

  const submitTransfer = async (event?: FormEvent) => {
    event?.preventDefault()
    if (!token) return
    if (!transferForm.item_id) {
      setTransferError(t('desktop.item_required'))
      return
    }
    setTransferLoading(true)
    setTransferError(null)
    try {
      await createWarehouseTransfer(token, companyId, {
        type: transferForm.type,
        item_id: Number(transferForm.item_id),
        quantity: Number(transferForm.quantity),
        from_warehouse_id: transferForm.from_warehouse_id
          ? Number(transferForm.from_warehouse_id)
          : null,
        to_warehouse_id: transferForm.to_warehouse_id
          ? Number(transferForm.to_warehouse_id)
          : null,
        remark: transferForm.remark || undefined,
      })
      setTransferOpen(false)
      setSelectedRow(null)
      setTransferForm(emptyTransferForm)
      await load()
    } catch (err) {
      setTransferError(getApiErrorMessage(err))
    } finally {
      setTransferLoading(false)
    }
  }

  const locationLabel = (row: InventoryStockRow) =>
    row.location === 'company'
      ? t('desktop.company_sales_center_full')
      : row.warehouse_name || '—'

  return (
    <div className="dash-div party-page warehouse-inventory-page" dir="rtl">
      <div className="dash-header dash-header--section mb-2 warehouse-inventory-header">
        <h5 className="mb-0">
          {t('desktop.warehouse_inventory')} — <span>{business.company.name}</span>
        </h5>
        <div className="muted small">
          {t('desktop.today_date')}: {formatJalaliSlash(new Date().toISOString(), locale)}
        </div>
      </div>

      <div className="party-toolbar warehouse-inventory-toolbar">
        <Link className="btn-secondary btn-sm" to={businessPath(companyId, 'warehouses')}>
          <i className="fa-solid fa-reply" /> {t('desktop.warehouses')}
        </Link>
        <Link className="btn-secondary btn-sm" to={businessPath(companyId, 'warehouses/transfers')}>
          <i className="fa-solid fa-clock-rotate-left" /> {t('desktop.warehouse_transfer_records')}
        </Link>
        {canManage ? (
          <button type="button" className="btn-primary btn-sm" onClick={() => openTransferModal()}>
            <i className="fa-solid fa-right-left" /> {t('desktop.new_transfer')}
          </button>
        ) : null}
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="warehouse-inventory-filters">
        <SearchField
          value={search}
          onChange={setSearch}
          placeholder={t('desktop.search_by_name')}
        />
        <select
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value as typeof locationFilter)}
        >
          <option value="all">{t('desktop.all_locations')}</option>
          <option value="warehouse">{t('desktop.warehouse_stock')}</option>
          <option value="company">{t('desktop.company_sales_center_full')}</option>
        </select>
        <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
          <option value="all">{t('desktop.all_warehouses')}</option>
          {warehouses.map((wh) => (
            <option key={wh.id} value={wh.id}>
              {wh.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : filteredRows.length === 0 ? (
        <div className="party-empty">{t('desktop.no_warehouse_inventory')}</div>
      ) : (
        <div className="table-wrap party-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('desktop.name')}</th>
                <th>{t('desktop.code')}</th>
                <th>{t('desktop.location')}</th>
                <th>{t('desktop.quantity')}</th>
                <th>{t('desktop.unit_label')}</th>
                {canManage ? <th>{t('desktop.action')}</th> : null}
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((row) => (
                <tr key={`${row.location}-${row.item_id}-${row.warehouse_id ?? 'company'}`}>
                  <td className="fw-semibold">{row.name || '—'}</td>
                  <td>{row.code || '—'}</td>
                  <td>{locationLabel(row)}</td>
                  <td className="fw-semibold">{formatQty(row.quantity)}</td>
                  <td>{resolveName(row.unit_id, row.unit_name) || '—'}</td>
                  {canManage ? (
                    <td>
                      <button
                        type="button"
                        className="btn-outline-primary btn-sm btn-transfer-action"
                        title={t('desktop.transfer')}
                        onClick={() => openTransferModal(row)}
                      >
                        <i className="fa-solid fa-right-left" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={transferOpen} onClose={closeTransferModal} title={t('desktop.new_transfer')} wide>
        <form className="form-grid" onSubmit={(e) => void submitTransfer(e)}>
          {transferError ? <div className="alert-error">{transferError}</div> : null}

          <label>
            {t('desktop.transfer_type')}
            <select
              value={transferForm.type}
              disabled={transferLoading}
              onChange={(e) =>
                setTransferForm((prev) => ({
                  ...prev,
                  type: e.target.value as TransferType,
                  from_warehouse_id: '',
                  to_warehouse_id: '',
                }))
              }
            >
              <option value="warehouse_to_warehouse">{t('desktop.warehouse_to_warehouse')}</option>
              <option value="warehouse_to_company">{t('desktop.warehouse_to_company')}</option>
              <option value="company_to_warehouse">{t('desktop.company_to_warehouse')}</option>
            </select>
          </label>

          <label>
            {t('desktop.item')}
            <select
              required
              value={transferForm.item_id}
              disabled={transferLoading}
              onChange={(e) => setTransferForm((prev) => ({ ...prev, item_id: e.target.value }))}
            >
              <option value="">{t('desktop.select')}</option>
              {itemOptions.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                  {item.code ? ` (${item.code})` : ''}
                </option>
              ))}
            </select>
          </label>

          {transferForm.type === 'warehouse_to_warehouse' ||
          transferForm.type === 'warehouse_to_company' ? (
            <label>
              {t('desktop.from_warehouse')}
              <select
                required
                value={transferForm.from_warehouse_id}
                disabled={transferLoading}
                onChange={(e) =>
                  setTransferForm((prev) => ({ ...prev, from_warehouse_id: e.target.value }))
                }
              >
                <option value="">{t('desktop.select')}</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {transferForm.type === 'warehouse_to_warehouse' ||
          transferForm.type === 'company_to_warehouse' ? (
            <label>
              {t('desktop.to_warehouse')}
              <select
                required
                value={transferForm.to_warehouse_id}
                disabled={transferLoading}
                onChange={(e) =>
                  setTransferForm((prev) => ({ ...prev, to_warehouse_id: e.target.value }))
                }
              >
                <option value="">{t('desktop.select')}</option>
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label>
            {t('desktop.quantity')}
            <input
              type="number"
              min="0.001"
              step="0.001"
              required
              value={transferForm.quantity}
              disabled={transferLoading}
              onChange={(e) => setTransferForm((prev) => ({ ...prev, quantity: e.target.value }))}
            />
            {selectedRow ? (
              <small className="muted">
                {t('desktop.available')}: {formatQty(selectedRow.quantity)}
              </small>
            ) : null}
          </label>

          <label>
            {t('desktop.description')}
            <textarea
              rows={2}
              value={transferForm.remark}
              disabled={transferLoading}
              onChange={(e) => setTransferForm((prev) => ({ ...prev, remark: e.target.value }))}
            />
          </label>

          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              disabled={transferLoading}
              onClick={closeTransferModal}
            >
              {t('desktop.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={transferLoading}>
              {transferLoading ? t('desktop.processing') : t('desktop.transfer')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
