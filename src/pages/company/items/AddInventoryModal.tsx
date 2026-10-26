import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getApiErrorMessage } from '@/lib/auth'
import { addItemOpeningInventory, type BusinessItemShow } from '@/lib/business'
import { localizeCurrency } from '@/lib/currency'

type CapitalAccount = {
  id: number
  name?: string | null
  currency?: string | null
}

type Props = {
  token: string
  companyId: string
  item: BusinessItemShow
  capitalAccounts: CapitalAccount[]
  onClose: () => void
  onSaved: (item?: BusinessItemShow | null) => void
}

export function AddInventoryModal({
  token,
  companyId,
  item,
  capitalAccounts,
  onClose,
  onSaved,
}: Props) {
  const { t } = useTranslation()
  const [quantity, setQuantity] = useState('')
  const [unitCost, setUnitCost] = useState('')
  const [capitalAccountId, setCapitalAccountId] = useState(
    capitalAccounts[0] ? String(capitalAccounts[0].id) : '',
  )
  const [remark, setRemark] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selected = useMemo(
    () => capitalAccounts.find((a) => String(a.id) === capitalAccountId),
    [capitalAccounts, capitalAccountId],
  )

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const data = await addItemOpeningInventory(token, companyId, item.id, {
        quantity,
        unit_cost: unitCost,
        capital_account_id: capitalAccountId,
        remark: remark || null,
      })
      onSaved(data.item)
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form-grid" dir="rtl" onSubmit={(e) => void submit(e)}>
      <h5 className="item-show-modal-title">{t('desktop.add_inventory')}</h5>
      {error ? <div className="alert-error">{error}</div> : null}
      <label>
        {t('desktop.quantity')}
        <input
          type="number"
          min="1"
          step="any"
          required
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
      </label>
      <label>
        {t('desktop.unit_cost')}
        <input
          type="number"
          min="0.01"
          step="any"
          required
          value={unitCost}
          onChange={(e) => setUnitCost(e.target.value)}
        />
      </label>
      <label>
        {t('desktop.capital_account')}
        <Select
          required
          value={capitalAccountId}
          onChange={(e) => setCapitalAccountId(e.target.value)}
        >
          <option value="">{t('desktop.select')}</option>
          {capitalAccounts.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} ({localizeCurrency(a.currency, t)})
            </option>
          ))}
        </Select>
      </label>
      {selected?.currency ? (
        <p className="muted small">
          {t('desktop.currency')}: {localizeCurrency(selected.currency, t)}
        </p>
      ) : null}
      <label>
        {t('desktop.remark')}
        <input value={remark} onChange={(e) => setRemark(e.target.value)} />
      </label>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
          {t('desktop.cancel')}
        </button>
        <button className="btn-primary" disabled={busy}>
          {busy ? t('desktop.processing') : t('desktop.save')}
        </button>
      </div>
    </form>
  )
}
