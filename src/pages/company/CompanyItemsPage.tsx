import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'
import html2canvas from 'html2canvas'
import { localizeCurrency } from '@/lib/currency'

import { SearchField } from '@/components/inputs/SearchField'
import { ItemBarcode } from '@/components/ItemBarcode'
import { Modal } from '@/components/ui/Modal'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import {
  createItemDraft,
  deleteBusinessItem,
  downloadItemsExcelTemplate,
  exportItemsExcel,
  fetchItemsPage,
  importItemsExcel,
  triggerBrowserDownload,
  type BusinessItemRow,
  type ItemsInventorySummary,
} from '@/lib/business'
import { formatMoney, formatQty } from '@/lib/companyDashboard'
import { formatItemUnitsLabel } from '@/lib/itemUnits'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'
import { hydrateListsCache, useListsCacheStore } from '@/store/useListsCacheStore'
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits'
import { useToastStore } from '@/store/useToastStore'

type CompanyOutletContext = { business: BusinessShowData }

type StockAlert = {
  title: string
  icon: string
  className: string
  rowClassName: string
}

function stockValue(value: unknown): number {
  const number = Number(value ?? 0)
  return Number.isFinite(number) ? number : 0
}

function minimumStock(value: unknown): number | null {
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}

function contextStock(item: BusinessItemRow, warehouseFilter: string): number {
  if (warehouseFilter === 'company') return stockValue(item.company_stock ?? item.stock)
  if (warehouseFilter !== 'all') {
    const row = (item.warehouse_quantities || []).find(
      (entry) => String(entry.warehouse_id) === String(warehouseFilter),
    )
    return stockValue(row?.quantity ?? 0)
  }
  return stockValue(item.total_inventory ?? item.stock)
}

function contextInventoryValue(item: BusinessItemRow, warehouseFilter: string): number | null {
  const qty = contextStock(item, warehouseFilter)
  if (qty <= 0) return qty === 0 ? 0 : null
  if (item.purchase_unit_cost_in_capital_currency == null) return null
  return Math.round(Number(item.purchase_unit_cost_in_capital_currency) * qty * 100) / 100
}


function getStockAlert(
  item: BusinessItemRow,
  stockOverride: number,
  t: (key: string) => string,
): StockAlert {
  const stock = stockValue(stockOverride)
  const minimum = minimumStock(item.minimum_stock_level)
  if (stock === 0) {
    return {
      title: t('desktop.out_of_stock_alert'),
      icon: 'fa-circle-xmark',
      className: 'text-danger',
      rowClassName: 'items-row--danger',
    }
  }
  if (minimum !== null && stock <= minimum) {
    return {
      title: t('desktop.low_stock_alert'),
      icon: 'fa-triangle-exclamation',
      className: 'text-warning',
      rowClassName: 'items-row--warning',
    }
  }
  return {
    title: t('desktop.in_stock_status'),
    icon: 'fa-circle-check',
    className: 'text-success',
    rowClassName: '',
  }
}

export function CompanyItemsPage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const ensureItems = useListsCacheStore((s) => s.ensureItems)
  const refreshItems = useListsCacheStore((s) => s.refreshItems)
  const { resolveName } = useMeasurementUnits(companyId)

  const classification = location.pathname.includes('raw-materials') ? 'raw_material' : 'product'
  const isRawMaterial = classification === 'raw_material'
  const segment = isRawMaterial ? 'raw-materials' : 'items'
  const canView = Boolean(business.permissions?.canViewInventory)
  const canManage = Boolean(business.permissions?.canManageInventory) && business.is_active
  const canDelete = Boolean(business.permissions?.canDeleteRecords) && business.is_active

  const cachedItems = useListsCacheStore((s) =>
    companyId ? s.getItems(userKey, companyId, classification) : null,
  )

  const [rows, setRows] = useState<BusinessItemRow[]>(() => cachedItems?.items ?? [])
  const [warehouses, setWarehouses] = useState<Array<{ id: number; name?: string | null }>>(
    () => cachedItems?.warehouses ?? [],
  )
  const [categories, setCategories] = useState<Array<{ id: number; name?: string | null }>>(
    () => cachedItems?.itemCategories ?? [],
  )
  const [summary, setSummary] = useState<ItemsInventorySummary>(() => cachedItems?.inventorySummary ?? {})
  const [loading, setLoading] = useState(!cachedItems)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false)

  const [nameFilter, setNameFilter] = useState('')
  const [codeFilter, setCodeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [warehouseFilter, setWarehouseFilter] = useState('all')
  const [stockSort, setStockSort] = useState('default')

  const [moreItem, setMoreItem] = useState<BusinessItemRow | null>(null)
  const [barcodeItem, setBarcodeItem] = useState<BusinessItemRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<BusinessItemRow | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [downloadingItemCard, setDownloadingItemCard] = useState(false)
  const [excelBusy, setExcelBusy] = useState<'template' | 'export' | 'import' | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)
  const itemMoreModalCaptureRef = useRef<HTMLDivElement | null>(null)
  const showSuccess = useToastStore((s) => s.showSuccess)
  const showError = useToastStore((s) => s.showError)

  const moreStockAlert = moreItem
    ? getStockAlert(moreItem, stockValue(moreItem.total_inventory ?? moreItem.stock), t)
    : null

  const moreDetailRows = moreItem
    ? [
        {
          key: 'category',
          icon: 'fa-tags',
          label: t('desktop.item_category'),
          value: moreItem.category_name || t('desktop.no_category'),
        },
        {
          key: 'model',
          icon: 'fa-cube',
          label: t('desktop.model'),
          value: moreItem.model || '—',
        },
        {
          key: 'color',
          icon: 'fa-palette',
          label: t('desktop.color'),
          value: moreItem.color || '—',
        },
        {
          key: 'stock',
          icon: 'fa-boxes-stacked',
          label: t('desktop.inventory'),
          value: (
            <span className="d-inline-flex align-items-center gap-2">
              <span>
                {`${formatQty(moreItem.total_inventory ?? moreItem.stock)} ${resolveName(moreItem.unit_id, moreItem.unit_name)}`.trim()}
              </span>
              {moreStockAlert ? (
                <i
                  className={`fa-solid ${moreStockAlert.icon} ${moreStockAlert.className}`}
                  title={moreStockAlert.title}
                />
              ) : null}
            </span>
          ),
        },
        {
          key: 'minimum_stock_level',
          icon: 'fa-bell',
          label: t('desktop.minimum_stock_level'),
          value: moreItem.minimum_stock_level ?? '—',
        },
        {
          key: 'website',
          icon: moreItem.public ? 'fa-globe' : 'fa-eye-slash',
          label: t('desktop.show_on_website'),
          value: moreItem.public ? t('desktop.yes') : t('desktop.no'),
        },
      ]
    : []

  const downloadItemMoreImage = async () => {
    if (!itemMoreModalCaptureRef.current || downloadingItemCard || !moreItem) return
    try {
      setDownloadingItemCard(true)
      await new Promise((resolve) => setTimeout(resolve, 200))
      const element = itemMoreModalCaptureRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        logging: false,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
      })
      const imageUrl = canvas.toDataURL('image/jpeg', 0.92)
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `ishanch-item-${moreItem.id}-${moreItem.code || 'card'}.jpg`
      link.click()
    } catch {
      /* ignore */
    } finally {
      setDownloadingItemCard(false)
    }
  }

  const applyPayload = (data: {
    items: BusinessItemRow[]
    warehouses: Array<{ id: number; name?: string | null }>
    itemCategories: Array<{ id: number; name?: string | null }>
    inventorySummary: ItemsInventorySummary
  }) => {
    setRows(data.items)
    setWarehouses(data.warehouses)
    setCategories(data.itemCategories)
    setSummary(data.inventorySummary)
  }

  const load = async (force = false) => {
    if (!token || !companyId || !canView) return
    const hasCache = Boolean(
      useListsCacheStore.getState().getItems(userKey, companyId, classification),
    )
    if (!hasCache) setLoading(true)
    setError(null)
    try {
      const data = await ensureItems(token, userKey, companyId, classification, { force })
      if (data) applyPayload(data)
    } catch (err) {
      setError(getApiErrorMessage(err))
      if (!hasCache) setRows([])
    } finally {
      setLoading(false)
    }
  }

  /** Force reload from API (like project router.reload on items list). */
  const reload = async () => {
    if (!token || !companyId || !canView) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchItemsPage(token, companyId, classification)
      applyPayload(data)
      await useListsCacheStore.getState().setItems(userKey, companyId, classification, data)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    void hydrateListsCache(userKey).then(() => {
      if (!active) return
      const cached = useListsCacheStore.getState().getItems(userKey, companyId, classification)
      if (cached) {
        applyPayload(cached)
        setLoading(false)
      }
    })
    return () => {
      active = false
    }
  }, [userKey, companyId, classification])

  useEffect(() => {
    void load()
  }, [token, companyId, classification, canView, userKey])

  useEffect(() => {
    if (cachedItems) applyPayload(cachedItems)
  }, [cachedItems])

  const clearFilters = () => {
    setNameFilter('')
    setCodeFilter('')
    setCategoryFilter('all')
    setStockFilter('all')
    setWarehouseFilter('all')
    setStockSort('default')
  }

  const filtersActive =
    Boolean(nameFilter) ||
    Boolean(codeFilter) ||
    stockFilter !== 'all' ||
    warehouseFilter !== 'all' ||
    categoryFilter !== 'all' ||
    stockSort !== 'default'

  const filtered = useMemo(() => {
    const nameQ = nameFilter.trim().toLowerCase()
    const codeQ = codeFilter.trim().toLowerCase()
    let list = rows.filter((item) => {
      if (nameQ && !String(item.name || '').toLowerCase().includes(nameQ)) return false
      if (codeQ && !String(item.code || '').toLowerCase().includes(codeQ)) return false
      if (categoryFilter === 'none' && item.category_id) return false
      if (
        categoryFilter !== 'all' &&
        categoryFilter !== 'none' &&
        String(item.category_id) !== String(categoryFilter)
      ) {
        return false
      }
      const stock = contextStock(item, warehouseFilter)
      if (stockFilter === 'zero' && stock !== 0) return false
      if (stockFilter === 'positive' && stock <= 0) return false
      if (warehouseFilter !== 'all' && warehouseFilter !== 'company' && stock <= 0) return false
      return true
    })

    if (stockSort === 'stock-desc') {
      list = [...list].sort(
        (a, b) => contextStock(b, warehouseFilter) - contextStock(a, warehouseFilter),
      )
    } else if (stockSort === 'stock-asc') {
      list = [...list].sort(
        (a, b) => contextStock(a, warehouseFilter) - contextStock(b, warehouseFilter),
      )
    }
    return list
  }, [rows, nameFilter, codeFilter, categoryFilter, stockFilter, warehouseFilter, stockSort])

  const filteredValue = useMemo(
    () =>
      filtered.reduce((sum, item) => {
        const value = contextInventoryValue(item, warehouseFilter)
        return sum + (value ?? 0)
      }, 0),
    [filtered, warehouseFilter],
  )

  const filteredQty = useMemo(
    () => filtered.reduce((sum, item) => sum + contextStock(item, warehouseFilter), 0),
    [filtered, warehouseFilter],
  )

  const missingValuation = useMemo(
    () =>
      filtered.filter((item) => {
        const stock = contextStock(item, warehouseFilter)
        return stock > 0 && item.purchase_unit_cost != null && item.purchase_unit_cost_in_capital_currency == null
      }).length,
    [filtered, warehouseFilter],
  )

  const create = async () => {
    if (!token || !canManage) return
    setCreating(true)
    setError(null)
    try {
      const item = await createItemDraft(token, companyId, classification)
      void refreshItems(token, userKey, companyId, classification)
      navigate(businessPath(companyId, `${segment}/${item.id}/setup`))
    } catch (err) {
      setError(getApiErrorMessage(err))
      setCreating(false)
    }
  }

  const downloadTemplate = async () => {
    if (!token || excelBusy) return
    setExcelBusy('template')
    try {
      const file = await downloadItemsExcelTemplate(token, companyId, classification)
      triggerBrowserDownload(
        file.blob,
        file.filename || (isRawMaterial ? 'raw-materials-template.xlsx' : 'items-template.xlsx'),
      )
    } catch (err) {
      showError(getApiErrorMessage(err))
    } finally {
      setExcelBusy(null)
    }
  }

  const downloadExport = async () => {
    if (!token || excelBusy) return
    setExcelBusy('export')
    try {
      const file = await exportItemsExcel(token, companyId, classification)
      triggerBrowserDownload(
        file.blob,
        file.filename || (isRawMaterial ? 'raw-materials-export.xlsx' : 'items-export.xlsx'),
      )
    } catch (err) {
      showError(getApiErrorMessage(err))
    } finally {
      setExcelBusy(null)
    }
  }

  const onImportFile = async (file: File | null) => {
    if (!token || !canManage || !file || excelBusy) return
    setExcelBusy('import')
    setError(null)
    try {
      const result = await importItemsExcel(token, companyId, file, classification)
      if (result.errors.length > 0) {
        const first = result.errors[0]
        showError(
          t('desktop.items_excel_import_partial', {
            imported: result.imported,
            failed: result.errors.length,
          }) + (first ? ` (ردیف ${first.row}: ${first.message})` : ''),
        )
      } else if (result.imported > 0) {
        showSuccess(t('desktop.items_excel_import_success', { count: result.imported }))
      }
      const data = await refreshItems(token, userKey, companyId, classification)
      if (data) applyPayload(data)
    } catch (err) {
      showError(getApiErrorMessage(err))
    } finally {
      setExcelBusy(null)
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }

  const confirmDelete = async () => {
    if (!token || !deleteTarget) return
    if (deleteTarget.can_delete === false) {
      setDeleteError(deleteTarget.delete_block_reason || t('desktop.not_deletable'))
      return
    }
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteBusinessItem(token, companyId, deleteTarget.id)
      setDeleteTarget(null)
      setMoreItem(null)
      const data = await refreshItems(token, userKey, companyId, classification)
      if (data) applyPayload(data)
    } catch (err) {
      setDeleteError(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const production = Boolean((business.company as { is_production?: boolean }).is_production)

  if (!canView) {
    return (
      <div className="dash-div party-page" dir="rtl">
        <div className="alert-error">دسترسی ندارید.</div>
      </div>
    )
  }

  if (isRawMaterial && !production) {
    return (
      <div className="dash-div party-page" dir="rtl">
        <div className="alert-error">مواد خام فقط برای شرکت‌های تولیدی فعال است.</div>
      </div>
    )
  }

  const capitalCurrency = summary.capital_currency || ''
  const warehouseFilterLabel =
    warehouseFilter === 'all'
      ? t('desktop.all_inventory_locations')
      : warehouseFilter === 'company'
        ? t('desktop.company_stock_only')
        : warehouses.find((w) => String(w.id) === String(warehouseFilter))?.name || '—'

  return (
    <div className="dash-div party-page items-page" dir="rtl">
      <div className="items-actions">
        <Link to={businessPath(companyId)} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        {canManage ? (
          <button type="button" className="btn-primary" disabled={creating} onClick={() => void create()}>
            <i className="fa-solid fa-circle-plus" />{' '}
            {isRawMaterial ? t('desktop.add_raw_material') : t('desktop.add_item')}
          </button>
        ) : null}
        {!isRawMaterial ? (
          <Link to={businessPath(companyId, 'item-categories')} className="btn-secondary">
            <i className="fa-solid fa-tags" /> {t('desktop.item_categories')}
          </Link>
        ) : null}
        <button
          type="button"
          className="btn-secondary"
          disabled={Boolean(excelBusy)}
          onClick={() => void downloadTemplate()}
        >
          <i className={`fa-solid fa-file-excel${excelBusy === 'template' ? ' fa-spin' : ''}`} />{' '}
          {t('desktop.download_items_excel_template')}
        </button>
        <button
          type="button"
          className="btn-secondary"
          disabled={Boolean(excelBusy)}
          onClick={() => void downloadExport()}
        >
          <i className={`fa-solid fa-file-export${excelBusy === 'export' ? ' fa-spin' : ''}`} />{' '}
          {t('desktop.export_items_excel')}
        </button>
        {canManage ? (
          <>
            <input
              ref={importInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              hidden
              onChange={(e) => void onImportFile(e.target.files?.[0] ?? null)}
            />
            <button
              type="button"
              className="btn-secondary"
              disabled={Boolean(excelBusy)}
              onClick={() => importInputRef.current?.click()}
            >
              <i className={`fa-solid fa-file-import${excelBusy === 'import' ? ' fa-spin' : ''}`} />{' '}
              {excelBusy === 'import' ? t('desktop.importing_items_excel') : t('desktop.import_items_excel')}
            </button>
          </>
        ) : null}
        <button type="button" className="btn-secondary" disabled={loading} onClick={() => void reload()}>
          <i className={`fa-solid fa-rotate-left${loading ? ' fa-spin' : ''}`} /> {t('desktop.refresh')}
        </button>
      </div>

      <div className="items-mobile-toggle">
        <button type="button" className="btn-secondary items-collapse-btn" onClick={() => setMobileFiltersOpen((v) => !v)}>
          <span>
            <i className="fa-solid fa-filter" /> {t('desktop.filters')}
          </span>
          <i className={`fa-solid ${mobileFiltersOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
        </button>
      </div>

      <div className={`items-filters${mobileFiltersOpen ? ' is-open' : ''}`}>
        <SearchField
          value={nameFilter}
          onChange={setNameFilter}
          placeholder={t('desktop.search_by_name')}
        />
        <SearchField
          value={codeFilter}
          onChange={setCodeFilter}
          placeholder={t('desktop.search_by_code')}
          dir="ltr"
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">{t('desktop.all_categories')}</option>
          <option value="none">{t('desktop.no_category')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)}>
          <option value="all">{t('desktop.all_inventory')}</option>
          <option value="zero">{t('desktop.zero_inventory')}</option>
          <option value="positive">{t('desktop.positive_inventory')}</option>
        </select>
        <select value={stockSort} onChange={(e) => setStockSort(e.target.value)}>
          <option value="default">{t('desktop.sort_default')}</option>
          <option value="stock-desc">{t('desktop.sort_stock_high_to_low')}</option>
          <option value="stock-asc">{t('desktop.sort_stock_low_to_high')}</option>
        </select>
        <button type="button" className="btn-secondary btn-sm" disabled={!filtersActive} onClick={clearFilters}>
          <i className="fa-solid fa-xmark" /> {t('desktop.clear_filters')}
        </button>
      </div>

      {rows.length > 0 ? (
        <>
          <div className="items-mobile-toggle">
            <button
              type="button"
              className="btn-secondary items-collapse-btn"
              onClick={() => setMobileSummaryOpen((v) => !v)}
            >
              <span>
                <i className="fa-solid fa-layer-group" /> {t('desktop.inventory_summary')}
              </span>
              <i className={`fa-solid ${mobileSummaryOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
            </button>
          </div>

          <div className={`items-summary${mobileSummaryOpen ? ' is-open' : ''}`}>
            <div className="items-summary-card">
              <div className="items-summary-card__head">
                <div>
                  <strong>{t('desktop.inventory_purchase_value_total')}</strong>
                  <div className="muted small">{warehouseFilterLabel}</div>
                </div>
                <div className="items-summary-value">
                  {formatMoney(filteredValue)} {localizeCurrency(capitalCurrency, t)}
                </div>
              </div>
              <div className="muted small">
                {t('desktop.total_inventory_quantity')}: {formatQty(filteredQty)}
                {warehouseFilter === 'all' && Number(summary.total_warehouse_stock_quantity || 0) > 0 ? (
                  <span>
                    {' '}
                    ({t('desktop.company_stock')}: {formatQty(summary.total_company_stock_quantity)} ·{' '}
                    {t('desktop.warehouse_stock')}: {formatQty(summary.total_warehouse_stock_quantity)})
                  </span>
                ) : null}
              </div>
              {!capitalCurrency ? (
                <div className="text-warning small mt-1">{t('desktop.capital_currency_missing')}</div>
              ) : null}
              {capitalCurrency && missingValuation > 0 ? (
                <div className="text-warning small mt-1">{t('desktop.inventory_valuation_partial')}</div>
              ) : null}
            </div>
            <div className="items-summary-card">
              <strong className="small">{t('desktop.stock_status_legend')}</strong>
              <div className="items-legend">
                <div>
                  <i className="fa-solid fa-circle-check text-success" /> {t('desktop.in_stock_status')}
                </div>
                <div>
                  <i className="fa-solid fa-triangle-exclamation text-warning" /> {t('desktop.low_stock_alert')}
                </div>
                <div>
                  <i className="fa-solid fa-circle-xmark text-danger" /> {t('desktop.out_of_stock_alert')}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : rows.length === 0 ? (
        <div className="party-empty">
          {isRawMaterial ? t('desktop.no_raw_materials') : t('desktop.no_items')}
        </div>
      ) : filtered.length === 0 ? (
        <div className="party-empty">{t('desktop.no_matching_items_filter')}</div>
      ) : (
        <div className="table-wrap party-table-wrap">
          <table className="data-table items-table">
            <thead>
              <tr>
                <th>{t('desktop.name')}</th>
                <th>{t('desktop.item_category')}</th>
                <th>{t('desktop.unit_label')}</th>
                <th>{t('desktop.purchase_cost')}</th>
                <th>{t('desktop.inventory_value_capital')}</th>
                <th>{t('desktop.sale_price_label')}</th>
                <th>{t('desktop.inventory')}</th>
                <th>{t('desktop.barcode')}</th>
                <th>{t('desktop.more')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => {
                const stock = contextStock(item, warehouseFilter)
                const value = contextInventoryValue(item, warehouseFilter)
                const alert = getStockAlert(item, stock, t)
                const canDelete = item.can_delete !== false
                return (
                  <tr key={item.id} className={alert.rowClassName}>
                    <td>
                      <Link
                        className="items-name-link"
                        to={businessPath(companyId, `${segment}/${item.id}`)}
                      >
                        {item.name || '—'}
                      </Link>
                    </td>
                    <td>{item.category_name || '—'}</td>
                    <td>{formatItemUnitsLabel(item) || resolveName(item.unit_id, item.unit_name)}</td>
                    <td>
                      {item.purchase_unit_cost == null
                        ? '—'
                        : `${formatMoney(item.purchase_unit_cost)} ${localizeCurrency(item.purchase_currency, t)}`}
                    </td>
                    <td>
                      {value != null && capitalCurrency
                        ? `${formatMoney(value)} ${localizeCurrency(capitalCurrency, t)}`
                        : '—'}
                    </td>
                    <td>
                      {item.sale_price == null
                        ? '—'
                        : `${formatMoney(item.sale_price)} ${localizeCurrency(item.sale_currency, t)}`}
                    </td>
                    <td>
                      <div className="items-stock-cell">
                        <span>
                          {formatQty(stock)} {resolveName(item.unit_id, item.unit_name)}
                          {warehouseFilter === 'all' && Number(item.warehouse_stock || 0) > 0 ? (
                            <small className="muted d-block">
                              {t('desktop.company_stock')}: {formatQty(item.company_stock ?? item.stock)} ·{' '}
                              {t('desktop.warehouse_stock')}: {formatQty(item.warehouse_stock)}
                            </small>
                          ) : null}
                        </span>
                        <i className={`fa-solid ${alert.icon} ${alert.className}`} title={alert.title} />
                      </div>
                    </td>
                    <td className="text-center">
                      {item.code ? (
                        <button
                          type="button"
                          className="btn-icon btn-icon--muted"
                          title={t('desktop.show_barcode')}
                          onClick={() => setBarcodeItem(item)}
                        >
                          <i className="fa-solid fa-barcode" />
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => setMoreItem({ ...item, can_delete: canDelete })}
                      >
                        <i className="fa-solid fa-ellipsis" /> {t('desktop.more')}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={Boolean(moreItem)}
        onClose={() => setMoreItem(null)}
        title={moreItem?.name || t('desktop.more')}
        wide
      >
        {moreItem ? (
          <div className="items-more" dir="rtl">
            <div ref={itemMoreModalCaptureRef} className="items-more-card">
              <div className="items-more-card__head">
                <h5>
                  <i className="fa-solid fa-box-open" /> {moreItem.name || t('desktop.item_details')}
                  {moreStockAlert ? (
                    <i
                      className={`fa-solid ${moreStockAlert.icon} ${moreStockAlert.className}`}
                      title={moreStockAlert.title}
                    />
                  ) : null}
                </h5>
                <p className="muted small mb-0">
                  {t('desktop.code')}: <span dir="ltr">{moreItem.code || '—'}</span>
                </p>
              </div>

              <div className="items-more-facts">
                {moreDetailRows.map((row) => (
                  <div className="items-more-fact" key={row.key}>
                    <span>
                      <i className={`fa-solid ${row.icon}`} /> {row.label}
                    </span>
                    <strong>{row.value}</strong>
                  </div>
                ))}
              </div>

              <div className="items-more-facts items-more-facts--plain">
                <div className="items-more-fact items-more-fact--plain">
                  <span>
                    <i className="fa-solid fa-money-bill-wave text-success" /> {t('desktop.purchase_cost')}
                  </span>
                  <strong>
                    {moreItem.purchase_unit_cost == null
                      ? '—'
                      : `${moreItem.purchase_unit_cost} ${localizeCurrency(moreItem.purchase_currency, t)}`}
                  </strong>
                </div>
                <div className="items-more-fact items-more-fact--plain">
                  <span>
                    <i className="fa-solid fa-coins text-warning" /> {t('desktop.sale_price_label')}
                  </span>
                  <strong>
                    {moreItem.sale_price == null
                      ? '—'
                      : `${moreItem.sale_price} ${localizeCurrency(moreItem.sale_currency, t)}`}
                  </strong>
                </div>
                <div className="items-more-fact items-more-fact--plain">
                  <span>
                    <i className="fa-solid fa-scale-balanced text-info" />{' '}
                    {t('desktop.inventory_purchase_value_capital')}
                  </span>
                  <strong>
                    {moreItem.inventory_value_in_capital_currency != null && capitalCurrency
                      ? `${formatMoney(moreItem.inventory_value_in_capital_currency)} ${localizeCurrency(capitalCurrency, t)}`
                      : '—'}
                  </strong>
                </div>
              </div>

              <div className="items-more-watermark" dir="ltr">
                ishanch.com
              </div>
            </div>

            <div className="items-more-actions">
              <Link
                className="btn-primary"
                to={businessPath(companyId, `${segment}/${moreItem.id}`)}
                onClick={() => setMoreItem(null)}
              >
                <i className="fa-regular fa-eye" /> {t('desktop.view')}
              </Link>
              {canManage ? (
                <Link
                  className="btn-success"
                  to={businessPath(companyId, `${segment}/${moreItem.id}/setup`)}
                  onClick={() => setMoreItem(null)}
                >
                  <i className="fa-regular fa-pen-to-square" /> {t('desktop.edit')}
                </Link>
              ) : null}
              <button
                type="button"
                className="btn-secondary"
                disabled={!moreItem.code}
                onClick={() => {
                  setBarcodeItem(moreItem)
                  setMoreItem(null)
                }}
              >
                <i className="fa-solid fa-barcode" /> {t('desktop.barcode')}
              </button>
              <Link
                className="btn-info"
                to={businessPath(companyId, `${segment}/${moreItem.id}/purchase-cost-history`)}
                onClick={() => setMoreItem(null)}
              >
                <i className="fa-solid fa-clock-rotate-left" /> {t('desktop.average_cost_history')}
              </Link>
              <button
                type="button"
                className="btn-secondary"
                disabled={downloadingItemCard}
                onClick={() => void downloadItemMoreImage()}
              >
                <i className={`fa-solid ${downloadingItemCard ? 'fa-spinner fa-spin' : 'fa-image'}`} />{' '}
                {t('desktop.download_item_card')}
              </button>
              {canDelete ? (
                moreItem.can_delete !== false ? (
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => {
                      setDeleteError(null)
                      setDeleteTarget(moreItem)
                    }}
                  >
                    <i className="fa-solid fa-trash" /> {t('desktop.delete')}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-secondary"
                    disabled
                    title={moreItem.delete_block_reason || t('desktop.not_deletable')}
                  >
                    <i className="fa-solid fa-trash" /> {t('desktop.delete')}
                  </button>
                )
              ) : null}
            </div>
            {moreItem.can_delete === false && moreItem.delete_block_reason ? (
              <p className="text-danger text-center small mt-2">{moreItem.delete_block_reason}</p>
            ) : null}
          </div>
        ) : null}
      </Modal>

      <Modal
        open={Boolean(barcodeItem)}
        onClose={() => setBarcodeItem(null)}
        title={`${t('desktop.barcode')}${barcodeItem?.name ? ` - ${barcodeItem.name}` : ''}`}
      >
        {barcodeItem?.code ? (
          <div className="items-barcode" dir="rtl">
            <p className="muted small">
              {t('desktop.code')}: <span dir="ltr">{barcodeItem.code}</span>
            </p>
            <ItemBarcode
              value={barcodeItem.code}
              height={80}
              width={2}
              fontSize={14}
              downloadName={`ishanch-item-${barcodeItem.id}-barcode`}
            />
          </div>
        ) : (
          <p className="muted">{t('desktop.no_code')}</p>
        )}
      </Modal>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!deleting) {
            setDeleteTarget(null)
            setDeleteError(null)
          }
        }}
        title={t('desktop.confirm_delete_item')}
      >
        <p>
          {t('desktop.confirm_delete_item_body')}
          {deleteTarget?.name ? (
            <>
              {' '}
              (<strong>{deleteTarget.name}</strong>)
            </>
          ) : null}
        </p>
        {deleteError ? <div className="alert-error">{deleteError}</div> : null}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={deleting}
            onClick={() => {
              setDeleteTarget(null)
              setDeleteError(null)
            }}
          >
            {t('desktop.cancel')}
          </button>
          <button type="button" className="btn-danger" disabled={deleting} onClick={() => void confirmDelete()}>
            {deleting ? t('desktop.processing') : t('desktop.confirm_delete')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
