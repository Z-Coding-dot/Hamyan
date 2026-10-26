import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { showSuccessToast } from '@/components/ui/SuccessToast'
import { Modal } from '@/components/ui/Modal'
import { useMeasurementUnits } from '@/hooks/useMeasurementUnits'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { getApiErrorMessage } from '@/lib/auth'
import {
  deleteBusinessItem,
  fetchBusinessItems,
  fetchItemCategories,
  fetchItemShow,
  setItemSalePrice,
  updateBusinessItem,
  updateItemBom,
  type BusinessItemCategoryRow,
  type BusinessItemRow,
  type BusinessItemShow,
} from '@/lib/business'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useListsCacheStore } from '@/store/useListsCacheStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }
type BomRow = { raw_material_item_id: string; quantity: string }

function emptyToNull(value: string): string | null {
  const trimmed = value.trim()
  return trimmed === '' ? null : trimmed
}

function buildItemUpdatePayload(
  form: Record<string, string | boolean>,
): Record<string, unknown> {
  const type = String(form.type || 'normal')
  const mediumUnitId = String(form.medium_unit_id || '').trim()
  const largeUnitId = String(form.large_unit_id || '').trim()
  return {
    name: String(form.name || '').trim(),
    code: emptyToNull(String(form.code || '')),
    brand: emptyToNull(String(form.brand || '')),
    model: emptyToNull(String(form.model || '')),
    color: emptyToNull(String(form.color || '')),
    unit_id: form.unit_id || null,
    medium_unit_id: mediumUnitId || null,
    medium_to_base_qty: mediumUnitId ? emptyToNull(String(form.medium_to_base_qty || '')) : null,
    large_unit_id: largeUnitId || null,
    large_to_base_qty: largeUnitId ? emptyToNull(String(form.large_to_base_qty || '')) : null,
    type,
    generation: type === 'digital' ? emptyToNull(String(form.generation || '')) : null,
    ram_capacity: type === 'digital' ? emptyToNull(String(form.ram_capacity || '')) : null,
    storage_capacity: type === 'digital' ? emptyToNull(String(form.storage_capacity || '')) : null,
    minimum_stock_level: emptyToNull(String(form.minimum_stock_level || '')),
    category_id: form.category_id ? Number(form.category_id) : null,
    public: Boolean(form.public),
  }
}

export function CompanyItemSetupPage() {
  const { t } = useTranslation()
  const { companyId = '', itemId = '' } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const refreshItems = useListsCacheStore((s) => s.refreshItems)
  const { labeledUnits } = useMeasurementUnits(companyId)

  const classification = location.pathname.includes('raw-materials') ? 'raw_material' : 'product'
  const segment = classification === 'raw_material' ? 'raw-materials' : 'items'
  const canManage = Boolean(business.permissions?.canManageInventory) && business.is_active
  const production = Boolean((business.company as { is_production?: boolean }).is_production)

  const [item, setItem] = useState<BusinessItemShow | null>(null)
  const [categories, setCategories] = useState<BusinessItemCategoryRow[]>([])
  const [materials, setMaterials] = useState<BusinessItemRow[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState<Record<string, string | boolean>>({
    name: '',
    code: '',
    brand: '',
    model: '',
    color: '',
    unit_id: '',
    medium_unit_id: '',
    medium_to_base_qty: '',
    large_unit_id: '',
    large_to_base_qty: '',
    type: 'normal',
    generation: '',
    ram_capacity: '',
    storage_capacity: '',
    minimum_stock_level: '',
    category_id: '',
    public: false,
  })
  const [price, setPrice] = useState('')
  const [bom, setBom] = useState<BomRow[]>([])

  const load = async () => {
    if (!token || !companyId || !itemId) return
    setLoading(true)
    setError(null)
    try {
      const current = await fetchItemShow(token, companyId, itemId)
      setItem(current)
      setForm({
        name: current.name || '',
        code: current.code || '',
        brand: current.brand || '',
        model: current.model || '',
        color: current.color || '',
        unit_id: current.unit_id ? String(current.unit_id) : '',
        medium_unit_id: current.medium_unit_id ? String(current.medium_unit_id) : '',
        medium_to_base_qty:
          current.medium_to_base_qty == null ? '' : String(current.medium_to_base_qty),
        large_unit_id: current.large_unit_id ? String(current.large_unit_id) : '',
        large_to_base_qty:
          current.large_to_base_qty == null ? '' : String(current.large_to_base_qty),
        type: current.type || 'normal',
        generation: current.generation == null ? '' : String(current.generation),
        ram_capacity: current.ram_capacity == null ? '' : String(current.ram_capacity),
        storage_capacity: current.storage_capacity == null ? '' : String(current.storage_capacity),
        minimum_stock_level:
          current.minimum_stock_level == null ? '' : String(current.minimum_stock_level),
        category_id: current.category_id ? String(current.category_id) : '',
        public: Boolean(current.public),
      })
      const sp = current.salePrice || current.salePrices?.[0]
      setPrice(sp?.sale_price == null ? '' : String(sp.sale_price))
      setBom(
        (current.bomComponents || []).map((x) => ({
          raw_material_item_id: String(x.raw_material_item_id),
          quantity: String(x.quantity),
        })),
      )
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
    if (token && companyId) {
      void fetchItemCategories(token, companyId).then(setCategories).catch(() => setCategories([]))
      void fetchBusinessItems(token, companyId, 'raw_material')
        .then(setMaterials)
        .catch(() => setMaterials([]))
    }
  }, [token, companyId, itemId])

  const save = async (e: FormEvent) => {
    e.preventDefault()
    if (!token || !canManage) return
    setBusy(true)
    setError(null)
    try {
      await updateBusinessItem(token, companyId, itemId, buildItemUpdatePayload(form))
      if (classification === 'product' && price) {
        await setItemSalePrice(token, companyId, itemId, {
          sale_price: price,
        })
      }
      if (classification === 'product' && production) {
        await updateItemBom(
          token,
          companyId,
          itemId,
          bom.filter((x) => x.raw_material_item_id && x.quantity),
        )
      }
      await load()
      void refreshItems(token, userKey, companyId, classification)
      showSuccessToast(t('desktop.saved_success'))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!token || !canManage) return
    setDeleting(true)
    setError(null)
    try {
      await deleteBusinessItem(token, companyId, itemId)
      setDeleteOpen(false)
      void refreshItems(token, userKey, companyId, classification)
      navigate(businessPath(companyId, segment))
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="dash-div party-page" dir="rtl">
        <p className="muted">{t('desktop.loading')}</p>
      </div>
    )
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link className="btn-secondary btn-sm" to={businessPath(companyId, segment)}>
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        {canManage ? (
          <button
            type="button"
            className="btn-danger btn-sm"
            onClick={() => {
              setError(null)
              setDeleteOpen(true)
            }}
          >
            {t('desktop.delete')}
          </button>
        ) : null}
      </div>
      <div className="dash-header dash-header--section mb-2">
        <h5 className="mb-0">{item?.name || t('desktop.items')}</h5>
      </div>
      {error ? <div className="alert-error">{error}</div> : null}
      <form className="form-grid" onSubmit={(e) => void save(e)}>
        <label>
          {t('desktop.name')}
          <input
            required
            disabled={!canManage}
            value={String(form.name)}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label>
          {t('desktop.barcode')}
          <input
            disabled={!canManage}
            value={String(form.code)}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </label>
        <label>
          {t('desktop.brand')}
          <input
            disabled={!canManage}
            value={String(form.brand)}
            onChange={(e) => setForm({ ...form, brand: e.target.value })}
          />
        </label>
        <label>
          {t('desktop.color')}
          <input
            disabled={!canManage}
            value={String(form.color)}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
          />
        </label>
        <label>
          {t('desktop.unit_small')}
          <Select
            required
            disabled={!canManage}
            value={String(form.unit_id)}
            onChange={(e) => setForm({ ...form, unit_id: e.target.value })}
          >
            <option value="">{t('desktop.select')}</option>
            {labeledUnits.map((u) => (
              <option key={u.id} value={u.id}>
                {u.label}
              </option>
            ))}
          </Select>
        </label>
        <label>
          {t('desktop.unit_medium')}
          <Select
            disabled={!canManage}
            value={String(form.medium_unit_id)}
            onChange={(e) =>
              setForm({
                ...form,
                medium_unit_id: e.target.value,
                medium_to_base_qty: e.target.value ? String(form.medium_to_base_qty) : '',
              })
            }
          >
            <option value="">—</option>
            {labeledUnits
              .filter((u) => String(u.id) !== String(form.unit_id) && String(u.id) !== String(form.large_unit_id))
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
          </Select>
        </label>
        {form.medium_unit_id ? (
          <label>
            {t('desktop.unit_to_base_qty')}
            <input
              type="number"
              min="0"
              step="any"
              required
              disabled={!canManage}
              value={String(form.medium_to_base_qty)}
              onChange={(e) => setForm({ ...form, medium_to_base_qty: e.target.value })}
              placeholder="مثلاً ۱۰"
            />
          </label>
        ) : null}
        <label>
          {t('desktop.unit_large')}
          <Select
            disabled={!canManage}
            value={String(form.large_unit_id)}
            onChange={(e) =>
              setForm({
                ...form,
                large_unit_id: e.target.value,
                large_to_base_qty: e.target.value ? String(form.large_to_base_qty) : '',
              })
            }
          >
            <option value="">—</option>
            {labeledUnits
              .filter((u) => String(u.id) !== String(form.unit_id) && String(u.id) !== String(form.medium_unit_id))
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.label}
                </option>
              ))}
          </Select>
        </label>
        {form.large_unit_id ? (
          <label>
            {t('desktop.unit_to_base_qty')}
            <input
              type="number"
              min="0"
              step="any"
              required
              disabled={!canManage}
              value={String(form.large_to_base_qty)}
              onChange={(e) => setForm({ ...form, large_to_base_qty: e.target.value })}
              placeholder="مثلاً ۱۲۰"
            />
          </label>
        ) : null}
        <p className="muted" style={{ gridColumn: '1 / -1', margin: 0 }}>
          {t('desktop.unit_scale_hint')}
        </p>
        <label>
          {t('desktop.item_type')}
          <Select
            disabled={!canManage}
            value={String(form.type)}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            <option value="normal">{t('desktop.item_type_normal')}</option>
            <option value="digital">{t('desktop.item_type_digital')}</option>
          </Select>
        </label>
        {form.type === 'digital' ? (
          <div className="item-digital-fields">
            <label>
              {t('desktop.model')}
              <input
                disabled={!canManage}
                value={String(form.model)}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </label>
            <label>
              {t('desktop.generation')}
              <input
                disabled={!canManage}
                value={String(form.generation)}
                onChange={(e) => setForm({ ...form, generation: e.target.value })}
              />
            </label>
            <label>
              {t('desktop.ram_capacity')}
              <input
                disabled={!canManage}
                value={String(form.ram_capacity)}
                onChange={(e) => setForm({ ...form, ram_capacity: e.target.value })}
              />
            </label>
            <label>
              {t('desktop.storage')}
              <input
                disabled={!canManage}
                value={String(form.storage_capacity)}
                onChange={(e) => setForm({ ...form, storage_capacity: e.target.value })}
              />
            </label>
          </div>
        ) : null}
        <label>
          {t('desktop.minimum_stock_level')}
          <input
            type="number"
            disabled={!canManage}
            value={String(form.minimum_stock_level)}
            onChange={(e) => setForm({ ...form, minimum_stock_level: e.target.value })}
          />
        </label>
        <label>
          دسته‌بندی
          <Select
            disabled={!canManage}
            value={String(form.category_id)}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
          >
            <option value="">—</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </label>
        <label className="check-row">
          <input
            type="checkbox"
            disabled={!canManage}
            checked={Boolean(form.public)}
            onChange={(e) => setForm({ ...form, public: e.target.checked })}
          />{' '}
          {t('desktop.show_on_website')}
        </label>
        {classification === 'product' ? (
          <fieldset>
            <legend>قیمت فروش</legend>
            <div className="form-grid">
              <label>
                مبلغ
                <input
                  type="number"
                  min="0"
                  disabled={!canManage}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </label>
            </div>
          </fieldset>
        ) : null}
        {classification === 'product' && production ? (
          <fieldset>
            <legend>مواد اولیه (BOM)</legend>
            {bom.map((row, index) => (
              <div className="form-grid" key={index}>
                <Select
                  disabled={!canManage}
                  value={row.raw_material_item_id}
                  onChange={(e) =>
                    setBom(
                      bom.map((x, i) =>
                        i === index ? { ...x, raw_material_item_id: e.target.value } : x,
                      ),
                    )
                  }
                >
                  <option value="">انتخاب ماده خام</option>
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code})
                    </option>
                  ))}
                </Select>
                <input
                  type="number"
                  min="0"
                  step="any"
                  disabled={!canManage}
                  value={row.quantity}
                  onChange={(e) =>
                    setBom(
                      bom.map((x, i) => (i === index ? { ...x, quantity: e.target.value } : x)),
                    )
                  }
                />
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={!canManage}
                  onClick={() => setBom(bom.filter((_, i) => i !== index))}
                >
                  حذف
                </button>
              </div>
            ))}
            {canManage ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setBom([...bom, { raw_material_item_id: '', quantity: '1' }])}
              >
                افزودن ردیف
              </button>
            ) : null}
          </fieldset>
        ) : null}
        {canManage ? (
          <div className="form-actions">
            <button className="btn-primary" disabled={busy}>
              {busy ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        ) : null}
      </form>

      <Modal
        open={deleteOpen}
        onClose={() => {
          if (!deleting) setDeleteOpen(false)
        }}
        title={t('desktop.confirm_delete_item')}
      >
        <p>
          {t('desktop.confirm_delete_item_body')}
          {item?.name ? (
            <>
              {' '}
              (<strong>{item.name}</strong>)
            </>
          ) : null}
        </p>
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={deleting}
            onClick={() => setDeleteOpen(false)}
          >
            {t('desktop.cancel')}
          </button>
          <button
            type="button"
            className="btn-danger"
            disabled={deleting}
            onClick={() => void remove()}
          >
            {deleting ? t('desktop.processing') : t('desktop.confirm_delete')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
