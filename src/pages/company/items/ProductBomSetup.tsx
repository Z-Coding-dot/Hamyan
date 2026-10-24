import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { updateItemBom } from '@/lib/business'

type BomComponent = {
  id?: number
  raw_material_item_id: number
  quantity: number
  raw_material_name?: string | null
  raw_material_code?: string | null
  raw_material?: { id?: number; name?: string | null; code?: string | null } | null
}

type RawMaterial = { id: number; name?: string | null; code?: string | null }

type BomRow = { raw_material_item_id: string; quantity: string }

type Props = {
  token: string
  companyId: string
  itemId: number | string
  initialComponents: BomComponent[]
  rawMaterials: RawMaterial[]
  canManage: boolean
}

const emptyRow = (): BomRow => ({ raw_material_item_id: '', quantity: '' })

function mapToRows(components: BomComponent[]): BomRow[] {
  return components.length
    ? components.map((c) => ({
        raw_material_item_id: String(c.raw_material_item_id),
        quantity: String(c.quantity),
      }))
    : []
}

export function ProductBomSetup({
  token,
  companyId,
  itemId,
  initialComponents,
  rawMaterials,
  canManage,
}: Props) {
  const { t } = useTranslation()
  const [components, setComponents] = useState(initialComponents)
  const [rows, setRows] = useState<BomRow[]>(mapToRows(initialComponents))
  const [modalOpen, setModalOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setComponents(initialComponents)
    setRows(mapToRows(initialComponents))
  }, [initialComponents])

  const persist = async (payload: Array<{ raw_material_item_id: number; quantity: number }>) => {
    setSaving(true)
    setError(null)
    try {
      const saved = await updateItemBom(token, companyId, itemId, payload)
      setComponents(saved)
      setRows(mapToRows(saved))
      setConfirmClear(false)
      return saved
    } catch (err) {
      setError(getApiErrorMessage(err))
      throw err
    } finally {
      setSaving(false)
    }
  }

  const save = async () => {
    const payload = rows
      .filter((r) => r.raw_material_item_id && Number(r.quantity) >= 0.001)
      .map((r) => ({
        raw_material_item_id: Number(r.raw_material_item_id),
        quantity: Number(r.quantity),
      }))
    try {
      await persist(payload)
      setModalOpen(false)
    } catch {
      /* shown */
    }
  }

  return (
    <>
      <div className="item-bom-card" dir="rtl">
        <div className="item-bom-card__head">
          <div>
            <h6>{t('desktop.product_bom_title')}</h6>
            <small className="muted">{t('desktop.product_bom_hint')}</small>
          </div>
          {canManage ? (
            <div className="item-bom-card__actions">
              {components.length > 0 ? (
                <button
                  type="button"
                  className="btn-danger btn-sm"
                  disabled={saving}
                  onClick={() => setConfirmClear(true)}
                >
                  {t('desktop.clear_all')}
                </button>
              ) : null}
              <button
                type="button"
                className="btn-primary btn-sm"
                disabled={saving}
                onClick={() => {
                  setRows(mapToRows(components))
                  setError(null)
                  setModalOpen(true)
                }}
              >
                {components.length ? t('desktop.edit') : t('desktop.setup_bom')}
              </button>
            </div>
          ) : null}
        </div>
        {components.length === 0 ? (
          <p className="muted">{t('desktop.no_bom_components')}</p>
        ) : (
          <div className="item-bom-list">
            {components.map((c) => (
              <div className="item-bom-row" key={`${c.raw_material_item_id}-${c.id || 0}`}>
                <strong>
                  {c.raw_material_name || c.raw_material?.name || '—'}
                  {c.raw_material_code || c.raw_material?.code
                    ? ` (${c.raw_material_code || c.raw_material?.code})`
                    : ''}
                </strong>
                <span>{c.quantity}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title={t('desktop.product_bom_title')} wide>
        {error ? <div className="alert-error">{error}</div> : null}
        {rows.map((row, index) => (
          <div className="form-grid" key={index}>
            <select
              value={row.raw_material_item_id}
              onChange={(e) =>
                setRows(rows.map((r, i) => (i === index ? { ...r, raw_material_item_id: e.target.value } : r)))
              }
            >
              <option value="">{t('desktop.select')}</option>
              {rawMaterials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
            <input
              type="number"
              min="0.001"
              step="any"
              value={row.quantity}
              onChange={(e) =>
                setRows(rows.map((r, i) => (i === index ? { ...r, quantity: e.target.value } : r)))
              }
            />
            <button type="button" className="btn-secondary" onClick={() => setRows(rows.filter((_, i) => i !== index))}>
              {t('desktop.delete')}
            </button>
          </div>
        ))}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => setRows([...rows, emptyRow()])}>
            {t('desktop.add_row')}
          </button>
          <button type="button" className="btn-primary" disabled={saving} onClick={() => void save()}>
            {saving ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </Modal>

      <Modal open={confirmClear} onClose={() => !saving && setConfirmClear(false)} title={t('desktop.clear_all')}>
        <p>{t('desktop.clear_bom_confirm')}</p>
        {error ? <div className="alert-error">{error}</div> : null}
        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={saving} onClick={() => setConfirmClear(false)}>
            {t('desktop.cancel')}
          </button>
          <button
            type="button"
            className="btn-danger"
            disabled={saving}
            onClick={() => void persist([]).then(() => undefined).catch(() => undefined)}
          >
            {saving ? t('desktop.processing') : t('desktop.confirm_delete')}
          </button>
        </div>
      </Modal>
    </>
  )
}
