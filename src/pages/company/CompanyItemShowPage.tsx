import { Select } from '@/components/inputs/SearchableSelect'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import { localizeCurrency } from '@/lib/currency'

import { ItemBarcode } from '@/components/ItemBarcode'
import { Modal } from '@/components/ui/Modal'
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits'
import { getApiErrorMessage } from '@/lib/auth'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import {
  deleteItemInventoryRecord,
  fetchItemInventories,
  fetchItemShowPayload,
  type BusinessItemShow,
  type ItemInventoryRecord,
  type ItemShowPayload,
} from '@/lib/business'
import { formatMoney, formatQty } from '@/lib/companyDashboard'
import { formatItemUnitsLabel, itemUnitOptions } from '@/lib/itemUnits'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import { AddInventoryModal } from '@/pages/company/items/AddInventoryModal'
import { ProductBomSetup } from '@/pages/company/items/ProductBomSetup'
import { SetSalePriceModal } from '@/pages/company/items/SetSalePriceModal'
import { UploadItemImageModal } from '@/pages/company/items/UploadItemImageModal'

type CompanyOutletContext = { business: BusinessShowData }

function stockValue(value: unknown): number {
  const n = Number(value ?? 0)
  return Number.isFinite(n) ? n : 0
}

function getStockAlert(item: BusinessItemShow | null, t: (k: string) => string) {
  const stock = stockValue(item?.total_inventory ?? item?.stock)
  const minimum = Number(item?.minimum_stock_level)
  if (stock === 0) {
    return { title: t('desktop.out_of_stock_alert'), icon: 'fa-circle-xmark', className: 'text-danger' }
  }
  if (Number.isFinite(minimum) && minimum >= 0 && stock <= minimum) {
    return { title: t('desktop.low_stock_alert'), icon: 'fa-triangle-exclamation', className: 'text-warning' }
  }
  return { title: t('desktop.in_stock_status'), icon: 'fa-circle-check', className: 'text-success' }
}


function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <p className="item-show-row">
      <strong>{label}:</strong> <span>{children ?? '—'}</span>
    </p>
  )
}

export function CompanyItemShowPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { companyId = '', itemId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const { resolveName } = useMeasurementUnits(companyId)

  const classification = location.pathname.includes('raw-materials') ? 'raw_material' : 'product'
  const segment = classification === 'raw_material' ? 'raw-materials' : 'items'
  const canManage = Boolean(business.permissions?.canManageInventory) && business.is_active
  const canDelete = Boolean(business.permissions?.canDeleteRecords) && business.is_active

  const [payload, setPayload] = useState<ItemShowPayload | null>(null)
  const [item, setItem] = useState<BusinessItemShow | null>(null)
  const [salePrice, setSalePrice] = useState<ItemShowPayload['salePrice']>(null)
  const [inventoryRecords, setInventoryRecords] = useState<ItemInventoryRecord[]>([])
  const [inventoryFilter, setInventoryFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [reloading, setReloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [addOpen, setAddOpen] = useState(false)
  const [uploadOpen, setUploadOpen] = useState(false)
  const [saleOpen, setSaleOpen] = useState(false)
  const [deleteRecord, setDeleteRecord] = useState<ItemInventoryRecord | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const stockAlert = getStockAlert(item, t)
  const hasOpeningInventory = inventoryRecords.some((r) => r.source === 'openingInventory')
  const imageSrc = useCachedAsset(item?.image)
  const unitLabel = resolveName(item?.unit_id ?? item?.unit?.id, item?.unit_name || item?.unit?.name)
  const unitsLabel = formatItemUnitsLabel(item) || unitLabel
  const unitScales = itemUnitOptions(item)

  const inventoryFilterOptions = useMemo(() => {
    const options = [
      { value: 'all', label: t('desktop.all') },
      { value: 'openingInventory', label: t('desktop.opening_inventory') },
      { value: 'noWarehouse', label: t('desktop.purchases_without_warehouse') },
    ]
    const warehouses = new Map<string, string>()
    inventoryRecords.forEach((record) => {
      if (record.warehouse_id && record.warehouse_name) {
        warehouses.set(String(record.warehouse_id), record.warehouse_name)
      }
    })
    warehouses.forEach((name, id) => options.push({ value: `warehouse:${id}`, label: name }))
    return options
  }, [inventoryRecords, t])

  const filteredInventoryRecords = useMemo(() => {
    if (inventoryFilter === 'all') return inventoryRecords
    if (inventoryFilter === 'openingInventory') {
      return inventoryRecords.filter((r) => r.source === 'openingInventory')
    }
    if (inventoryFilter === 'noWarehouse') {
      return inventoryRecords.filter((r) => r.source === 'purchase' && !r.warehouse_id)
    }
    if (inventoryFilter.startsWith('warehouse:')) {
      const id = inventoryFilter.replace('warehouse:', '')
      return inventoryRecords.filter((r) => String(r.warehouse_id || '') === id)
    }
    return inventoryRecords
  }, [inventoryRecords, inventoryFilter])

  const reloadInventory = async (currentItemId = itemId) => {
    if (!token || !companyId || !currentItemId) return
    setReloading(true)
    try {
      const data = await fetchItemInventories(token, companyId, currentItemId)
      setInventoryRecords(data.inventoryRecords || [])
      if (data.item) setItem(data.item)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setReloading(false)
    }
  }

  const load = async () => {
    if (!token || !companyId || !itemId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchItemShowPayload(token, companyId, itemId)
      setPayload(data)
      setItem(data.item)
      setSalePrice(data.salePrice ?? null)
      await reloadInventory(itemId)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId, itemId])

  const confirmDelete = async () => {
    if (!token || !deleteRecord || !item) return
    setDeleting(true)
    setDeleteError(null)
    try {
      const data = await deleteItemInventoryRecord(token, companyId, item.id, deleteRecord.id)
      if (data.updated_item) setItem(data.updated_item)
      setDeleteRecord(null)
      await reloadInventory()
    } catch (err) {
      setDeleteError(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  if (loading && !item) {
    return (
      <div className="dash-div party-page" dir="rtl">
        <p className="muted">{t('desktop.loading')}</p>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="dash-div party-page" dir="rtl">
        {error ? <div className="alert-error">{error}</div> : null}
        <Link className="btn-secondary btn-sm" to={businessPath(companyId, segment)}>
          {t('desktop.back')}
        </Link>
      </div>
    )
  }

  return (
    <div className="dash-div party-page item-show-page" dir="rtl">
      <div className="party-toolbar">
        <button type="button" className="btn-secondary btn-sm" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </button>
        {canManage ? (
          <Link className="btn-success btn-sm" to={businessPath(companyId, `${segment}/${item.id}/setup`)}>
            <i className="fa-regular fa-pen-to-square" /> {t('desktop.edit')}
          </Link>
        ) : null}
      </div>

      <div className="dash-header dash-header--section mb-2">
        <h5 className="mb-0">
          {t('desktop.item_details')}
          {item.name ? <span> - {item.name}</span> : null}
        </h5>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="item-show-grid">
        <div className="item-show-card">
          <h6>{t('desktop.item_specs')}</h6>
          {imageSrc ? (
            <div className="item-show-image">
              <img src={imageSrc} alt={item.name || ''} />
            </div>
          ) : null}
          <Row label={t('desktop.name')}>{item.name}</Row>
          {item.brand ? <Row label={t('desktop.brand')}>{item.brand}</Row> : null}
          <Row label={t('desktop.unit_label')}>
            {unitsLabel || '—'}
            {unitScales.length > 1 ? (
              <small className="muted d-block mt-1">
                {unitScales
                  .filter((o) => o.scale !== 'base')
                  .map((o) => `۱ ${o.label} = ${o.factor} ${unitLabel}`)
                  .join(' · ')}
              </small>
            ) : null}
          </Row>
          <Row label={t('desktop.model')}>{item.model || '—'}</Row>
          {item.type === 'digital' ? (
            <>
              <Row label={t('desktop.color')}>{item.color || '—'}</Row>
              <Row label={t('desktop.generation')}>{item.generation ?? '—'}</Row>
              <Row label="RAM">{item.ram_capacity ? `${item.ram_capacity} GB` : '—'}</Row>
              <Row label={t('desktop.storage')}>
                {item.storage_capacity ? `${item.storage_capacity} GB` : '—'}
              </Row>
            </>
          ) : null}
          <Row label={t('desktop.avg_purchase_cost')}>
            {payload?.latestPurchaseCost ? (
              <>
                {formatMoney(payload.latestPurchaseCost.unit_cost)}{' '}
                {localizeCurrency(payload.latestPurchaseCost.currency, t)}
              </>
            ) : (
              '—'
            )}
          </Row>
          <Row label={t('desktop.sale_price_label')}>
            {salePrice ? (
              <>
                {formatMoney(salePrice.sale_price)} {localizeCurrency(salePrice.currency, t)}
              </>
            ) : (
              '—'
            )}
          </Row>
          <Row label={t('desktop.inventory')}>
            <span className="d-inline-flex align-items-center gap-2 flex-wrap">
              <span>
                {formatQty(stockValue(item.total_inventory ?? item.stock))} {unitLabel}
              </span>
              <i className={`fa-solid ${stockAlert.icon} ${stockAlert.className}`} title={stockAlert.title} />
            </span>
            {stockValue(item.warehouse_stock) > 0 ? (
              <small className="muted d-block mt-1">
                {t('desktop.company_stock')}: {formatQty(stockValue(item.company_stock ?? item.stock))}
                {' · '}
                {t('desktop.warehouse_stock')}: {formatQty(stockValue(item.warehouse_stock))}
              </small>
            ) : null}
          </Row>
          <Row label={t('desktop.minimum_stock_level')}>{item.minimum_stock_level ?? '—'}</Row>
          <Row label={t('desktop.show_on_website')}>
            {item.public ? t('desktop.yes') : t('desktop.no')}
          </Row>
          {item.code ? (
            <div className="mt-3">
              <p className="item-show-row">
                <strong>{t('desktop.code')}:</strong>
              </p>
              <ItemBarcode value={item.code} height={70} width={2} fontSize={14} downloadName={`ishanch-item-${item.id}-barcode`} />
            </div>
          ) : null}
        </div>

        <div className="item-show-actions">
          {canManage && !hasOpeningInventory ? (
            <button type="button" className="btn-primary" onClick={() => setAddOpen(true)}>
              <i className="fa-solid fa-circle-plus" /> {t('desktop.add_inventory')}
            </button>
          ) : null}
          {canManage ? (
            <button type="button" className="btn-primary" onClick={() => setUploadOpen(true)}>
              <i className="fa-regular fa-image" /> {t('desktop.upload_image')}
            </button>
          ) : null}
          {canManage ? (
            <button type="button" className="btn-primary" onClick={() => setSaleOpen(true)}>
              <i className="fa-solid fa-coins" /> {t('desktop.set_sale_price')}
            </button>
          ) : null}
          <button type="button" className="btn-primary" disabled={reloading} onClick={() => void reloadInventory()}>
            {reloading ? (
              <i className="fa-solid fa-spinner fa-spin" />
            ) : (
              <i className="fa-solid fa-rotate" />
            )}{' '}
            {t('desktop.reload')}
          </button>
        </div>
      </div>

      {payload?.hasProductionMode && payload?.isProduct ? (
        <div className="mt-3">
          <ProductBomSetup
            token={token || ''}
            companyId={companyId}
            itemId={item.id}
            initialComponents={payload.bomComponents || []}
            rawMaterials={payload.rawMaterials || []}
            canManage={canManage}
          />
        </div>
      ) : null}

      <div className="item-inventory-history mt-4">
        <div className="item-inventory-history__head">
          <h6>{t('desktop.inventory_history')}</h6>
          {inventoryRecords.length > 0 ? (
            <label className="item-inventory-filter">
              {t('desktop.filters')}:
              <Select value={inventoryFilter} onChange={(e) => setInventoryFilter(e.target.value)}>
                {inventoryFilterOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </Select>
            </label>
          ) : null}
        </div>

        {inventoryRecords.length === 0 ? (
          <p className="muted text-center">{t('desktop.no_inventory')}</p>
        ) : filteredInventoryRecords.length === 0 ? (
          <p className="muted text-center">{t('desktop.no_matching_inventory')}</p>
        ) : (
          <div className="table-wrap party-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('desktop.type')}</th>
                  <th>{t('desktop.warehouse')}</th>
                  <th>{t('desktop.vendor')}</th>
                  <th>{t('desktop.date')}</th>
                  <th>{t('desktop.quantity')}</th>
                  <th>{t('desktop.price')}</th>
                  <th>{t('desktop.total')}</th>
                  <th>{t('desktop.action')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventoryRecords.map((r) => (
                  <tr key={r.id}>
                    <td>
                      {r.source === 'openingInventory'
                        ? t('desktop.opening_inventory')
                        : t('desktop.purchase')}
                    </td>
                    <td>{r.warehouse_name || '—'}</td>
                    <td>{r.vendor || '—'}</td>
                    <td>{r.date_jalali || '—'}</td>
                    <td>{r.quantity ?? '—'}</td>
                    <td>
                      {formatMoney(r.unit_price)} {localizeCurrency(r.currency, t)}
                    </td>
                    <td>
                      {formatMoney(r.total_price)} {localizeCurrency(r.currency, t)}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-danger btn-sm"
                        disabled={!r.can_delete || !canDelete}
                        title={r.can_delete ? t('desktop.delete') : t('desktop.not_deletable')}
                        onClick={() => {
                          setDeleteError(null)
                          setDeleteRecord(r)
                        }}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title={t('desktop.add_inventory')}>
        {token ? (
          <AddInventoryModal
            token={token}
            companyId={companyId}
            item={item}
            capitalAccounts={payload?.capitalAccounts || []}
            onClose={() => setAddOpen(false)}
            onSaved={(updated) => {
              if (updated) setItem(updated)
              void reloadInventory()
            }}
          />
        ) : null}
      </Modal>

      <Modal open={uploadOpen} onClose={() => setUploadOpen(false)} title={t('desktop.upload_image')}>
        {token ? (
          <UploadItemImageModal
            token={token}
            companyId={companyId}
            item={item}
            onClose={() => setUploadOpen(false)}
            onSaved={setItem}
          />
        ) : null}
      </Modal>

      <Modal open={saleOpen} onClose={() => setSaleOpen(false)} title={t('desktop.set_sale_price')}>
        {token ? (
          <SetSalePriceModal
            token={token}
            companyId={companyId}
            item={item}
            sellAccount={payload?.sellAccount || null}
            currentSalePrice={salePrice}
            onClose={() => setSaleOpen(false)}
            onSaved={(sale) => setSalePrice(sale)}
          />
        ) : null}
      </Modal>

      <Modal
        open={Boolean(deleteRecord)}
        onClose={() => !deleting && setDeleteRecord(null)}
        title={t('desktop.confirm_delete')}
      >
        <p>{t('desktop.delete_inventory_confirm')}</p>
        {deleteError ? <div className="alert-error">{deleteError}</div> : null}
        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={deleting} onClick={() => setDeleteRecord(null)}>
            {t('desktop.cancel')}
          </button>
          <button type="button" className="btn-danger" disabled={deleting} onClick={() => void confirmDelete()}>
            {deleting ? t('desktop.processing') : t('desktop.delete')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
