import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import type { BusinessStaffRow, StaffFormPayload } from '@/lib/business'

type Props = {
  open: boolean
  staff: BusinessStaffRow | null
  onClose: () => void
  onSubmit: (payload: StaffFormPayload) => Promise<void>
}

export function StaffFormModal({ open, staff, onClose, onSubmit }: Props) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [position, setPosition] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  useEffect(() => {
    if (!open) return
    setError(null)
    setFirstName(staff?.first_name || '')
    setLastName(staff?.last_name || '')
    setPosition(staff?.position || '')
    setPhone(staff?.phone || '')
    setEmail(staff?.email || '')
    setAddress(staff?.address || '')
  }, [open, staff])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setProcessing(true)
    setError(null)
    try {
      await onSubmit({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        position: position.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
      })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={staff ? t('desktop.edit_staff') : t('desktop.add_staff')}
      wide
    >
      <form onSubmit={(e) => void submit(e)} className="form-grid">
        {error ? <div className="alert-error">{error}</div> : null}
        <label>
          {t('desktop.first_name')}
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </label>
        <label>
          {t('desktop.last_name')}
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </label>
        <label>
          {t('desktop.position')}
          <input value={position} onChange={(e) => setPosition(e.target.value)} />
        </label>
        <label>
          {t('desktop.phone')}
          <input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <label>
          {t('desktop.email')}
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          {t('desktop.address')}
          <input value={address} onChange={(e) => setAddress(e.target.value)} />
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('desktop.cancel')}
          </button>
          <button type="submit" className="btn-primary" disabled={processing}>
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
