import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import {
  updateSubscriptionResellerAddress,
  type ProvinceRow,
  type SubscriptionResellerPayload,
} from '@/lib/user'
import type { SupportedLanguage } from '@/store/useLocaleStore'

type Props = {
  open: boolean
  token: string
  provinces: ProvinceRow[]
  language: SupportedLanguage
  initial: {
    province_id?: number | null
    city_district?: string | null
    address?: string | null
    whatsapp?: string | null
  }
  onClose: () => void
  onSaved: (payload: SubscriptionResellerPayload) => void
}

function provinceLabel(row: ProvinceRow, language: SupportedLanguage): string {
  if (language === 'ps') return row.name_ps || row.name_fa
  if (language === 'en') return row.name_en || row.name_fa
  return row.name_fa
}

export function ResellerAddressModal({
  open,
  token,
  provinces,
  language,
  initial,
  onClose,
  onSaved,
}: Props) {
  const { t } = useTranslation()
  const [provinceId, setProvinceId] = useState('')
  const [cityDistrict, setCityDistrict] = useState('')
  const [address, setAddress] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setProvinceId(initial.province_id ? String(initial.province_id) : '')
    setCityDistrict(initial.city_district ?? '')
    setAddress(initial.address ?? '')
    setWhatsapp(initial.whatsapp ?? '')
    setError(null)
  }, [open, initial.province_id, initial.city_district, initial.address, initial.whatsapp])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (saving) return
    const pid = Number(provinceId)
    if (!pid) {
      setError(t('desktop.reseller_province_required'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const result = await updateSubscriptionResellerAddress(token, {
        province_id: pid,
        city_district: cityDistrict,
        address,
        whatsapp,
      })
      onSaved(result)
      showSuccessToast(result.message || t('desktop.reseller_address_success'))
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={() => (!saving ? onClose() : undefined)} title={t('desktop.reseller_address_title')} wide>
      <p className="muted">{t('desktop.reseller_address_desc')}</p>
      {error ? (
        <div className="alert-error" role="alert">
          {error}
        </div>
      ) : null}
      <form className="form-grid affiliate-apply-form" onSubmit={(e) => void onSubmit(e)}>
        <div className="form-field">
          <label htmlFor="reseller-modal-province">{t('desktop.reseller_province')}</label>
          <Select
            id="reseller-modal-province"
            value={provinceId}
            disabled={saving}
            onChange={(e) => setProvinceId(e.target.value)}
            required
          >
            <option value="">{t('desktop.reseller_province_placeholder')}</option>
            {provinces.map((row) => (
              <option key={row.id} value={row.id}>
                {provinceLabel(row, language)}
              </option>
            ))}
          </Select>
        </div>
        <div className="form-field">
          <label htmlFor="reseller-modal-city">{t('desktop.reseller_city_district')}</label>
          <input
            id="reseller-modal-city"
            type="text"
            value={cityDistrict}
            disabled={saving}
            onChange={(e) => setCityDistrict(e.target.value)}
            required
            minLength={2}
            maxLength={120}
          />
        </div>
        <div className="form-field affiliate-apply-form__reason">
          <label htmlFor="reseller-modal-address">{t('desktop.reseller_full_address')}</label>
          <textarea
            id="reseller-modal-address"
            rows={3}
            value={address}
            disabled={saving}
            onChange={(e) => setAddress(e.target.value)}
            required
            minLength={5}
            maxLength={1000}
          />
        </div>
        <div className="form-field">
          <label htmlFor="reseller-modal-whatsapp">{t('desktop.reseller_whatsapp')}</label>
          <input
            id="reseller-modal-whatsapp"
            type="tel"
            dir="ltr"
            value={whatsapp}
            disabled={saving}
            onChange={(e) => setWhatsapp(e.target.value)}
            required
            minLength={9}
            maxLength={32}
            placeholder="07XXXXXXXX"
          />
        </div>
        <div className="form-actions" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn-secondary" disabled={saving} onClick={onClose}>
            {t('desktop.close')}
          </button>
          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? t('desktop.processing') : t('desktop.reseller_address_submit')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
