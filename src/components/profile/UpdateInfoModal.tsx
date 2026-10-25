import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { updateProfileInfo, type ProfileUser } from '@/lib/user'

type Props = {
  open: boolean
  token: string
  user: ProfileUser
  onClose: () => void
  onUpdated: (payload: { name: string; lastname: string; email: string }) => void
}

export function UpdateInfoModal({ open, token, user, onClose, onUpdated }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(user.name ?? '')
  const [lastname, setLastname] = useState(user.lastname ?? '')
  const [email, setEmail] = useState(user.email ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setName(user.name ?? '')
    setLastname(user.lastname ?? '')
    setEmail(user.email ?? '')
    setError(null)
  }, [open, user.name, user.lastname, user.email])

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await updateProfileInfo(token, { name, lastname, email })
      onUpdated({ name, lastname, email })
      showSuccessToast(t('desktop.info_upload_success'))
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('desktop.update_profile_info')} className="hy-party-dialog hy-finance-dialog hy-profile-dialog">
      <form className="form-grid hy-party-form" onSubmit={(e) => void onSubmit(e)}>
        {error ? <div className="alert-error">{error}</div> : null}

        <div className="form-field">
          <label htmlFor="profile-name">{t('desktop.name')}</label>
          <input id="profile-name" autoComplete="given-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="profile-lastname">{t('desktop.lastname')}</label>
          <input id="profile-lastname" autoComplete="family-name" value={lastname} onChange={(e) => setLastname(e.target.value)} required />
        </div>
        <div className="form-field">
          <label htmlFor="profile-email">{t('desktop.email')}</label>
          <p className="muted" style={{ margin: '0 0 6px', fontSize: '0.8rem' }}>
            {t('desktop.email_change_note')}
          </p>
          <input
            type="email"
            id="profile-email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
            className="eng-input"
          />
        </div>

        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? t('desktop.processing') : t('desktop.save')}
        </button>
      </form>
    </Modal>
  )
}
