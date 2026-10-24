import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getApiErrorMessage } from '@/lib/auth'
import { setItemSalePrice, type BusinessItemShow } from '@/lib/business'
import { localizeCurrency } from '@/lib/currency'

type SellAccount = {
  id: number
  name?: string | null
  currency?: string | null
}

type SalePrice = {
  id?: number
  currency?: string | null
  sale_price?: number | null
} | null

type Props = {
  token: string
  companyId: string
  item: BusinessItemShow
  sellAccount: SellAccount | null
  currentSalePrice: SalePrice
  onClose: () => void
  onSaved: (sale: NonNullable<SalePrice>) => void
}

export function SetSalePriceModal({
  token,
  companyId,
  item,
  sellAccount,
  currentSalePrice,
  onClose,
  onSaved,
}: Props) {
  const { t } = useTranslation()
  const [salePrice, setSalePrice] = useState('')
  const [remark, setRemark] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSalePrice(currentSalePrice?.sale_price == null ? '' : String(currentSalePrice.sale_price))
  }, [currentSalePrice])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!sellAccount?.id) {
      setError(t('desktop.sell_account_missing'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      const data = await setItemSalePrice(token, companyId, item.id, {
        sale_price: salePrice,
        sell_account_id: sellAccount.id,
        remark: remark || undefined,
      })
      if (data.salePrice) onSaved(data.salePrice)
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form-grid" dir="rtl" onSubmit={(e) => void submit(e)}>
      <h5 className="item-show-modal-title">{t('desktop.set_sale_price')}</h5>
      {sellAccount ? (
        <p className="muted small">
          {sellAccount.name} · {localizeCurrency(sellAccount.currency, t)}
        </p>
      ) : (
        <div className="alert-error">{t('desktop.sell_account_missing')}</div>
      )}
      {error ? <div className="alert-error">{error}</div> : null}
      <label>
        {t('desktop.sale_price_label')}
        <input
          type="number"
          min="0.01"
          step="any"
          required
          value={salePrice}
          onChange={(e) => setSalePrice(e.target.value)}
          disabled={!sellAccount}
        />
      </label>
      <label>
        {t('desktop.remark')}
        <input value={remark} onChange={(e) => setRemark(e.target.value)} disabled={!sellAccount} />
      </label>
      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
          {t('desktop.cancel')}
        </button>
        <button className="btn-primary" disabled={busy || !sellAccount}>
          {busy ? t('desktop.processing') : t('desktop.save')}
        </button>
      </div>
    </form>
  )
}
