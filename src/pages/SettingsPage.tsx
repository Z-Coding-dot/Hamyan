import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { AuthPasswordField } from '@/components/auth/AuthFields'
import { LanguageModal } from '@/components/LanguageModal'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import {
  getApiErrorMessage,
  updatePasswordRequest,
  updateSettingsRequest,
} from '@/lib/auth'
import { formatJalaliSlash } from '@/lib/datetime'
import {
  fetchUsernameStatus,
  updateUsername,
  type UsernameStatus,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useLocaleStore, type SupportedLanguage } from '@/store/useLocaleStore'

const USERNAME_PATTERN = /^[a-z][a-z0-9_]{2,29}$/

export function SettingsPage() {
  const { t } = useTranslation()
  const locale = useLocaleStore((state) => state.language)
  const { token, user, refreshCurrentUser, logout } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      user: state.user,
      refreshCurrentUser: state.refreshCurrentUser,
      logout: state.logout,
    })),
  )
  const setLanguage = useLocaleStore((state) => state.setLanguage)

  const [languageOpen, setLanguageOpen] = useState(false)
  const [passwordOpen, setPasswordOpen] = useState(false)
  const [usernameOpen, setUsernameOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordBusy, setPasswordBusy] = useState(false)

  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus | null>(null)
  const [usernameDraft, setUsernameDraft] = useState('')
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const [usernameBusy, setUsernameBusy] = useState(false)
  const [usernameLoading, setUsernameLoading] = useState(false)

  const resetPasswordForm = () => {
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
    setShowCurrent(false)
    setShowNew(false)
    setShowConfirm(false)
    setPasswordError(null)
  }

  const loadUsernameStatus = async () => {
    if (!token) return
    setUsernameLoading(true)
    try {
      const status = await fetchUsernameStatus(token)
      setUsernameStatus(status)
      setUsernameDraft(String(status.username || user?.username || ''))
    } catch (err) {
      setUsernameError(getApiErrorMessage(err))
    } finally {
      setUsernameLoading(false)
    }
  }

  useEffect(() => {
    if (!token) return
    void loadUsernameStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  const openUsernameModal = () => {
    setUsernameError(null)
    setUsernameDraft(String(usernameStatus?.username || user?.username || ''))
    setUsernameOpen(true)
    void loadUsernameStatus()
  }

  const onSelectLanguage = async (lang: SupportedLanguage) => {
    if (!token) return
    setPending(true)
    setError(null)
    try {
      await updateSettingsRequest(token, { lang })
      await setLanguage(lang)
      await refreshCurrentUser()
      showSuccessToast(t('desktop.saved_success'))
      setLanguageOpen(false)
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setPending(false)
    }
  }

  const onSavePassword = async () => {
    if (!token) return
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError(t('desktop.required_field'))
      return
    }
    if (newPassword.length < 8) {
      setPasswordError(t('desktop.password_min_length'))
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('desktop.password_mismatch'))
      return
    }

    setPasswordBusy(true)
    setPasswordError(null)
    try {
      const result = await updatePasswordRequest(token, {
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      })
      showSuccessToast(result.message || t('desktop.password_updated_success'))
      setPasswordOpen(false)
      resetPasswordForm()
      await logout()
    } catch (err) {
      setPasswordError(getApiErrorMessage(err))
    } finally {
      setPasswordBusy(false)
    }
  }

  const onSaveUsername = async () => {
    if (!token) return
    const next = usernameDraft.trim().toLowerCase()
    if (!USERNAME_PATTERN.test(next)) {
      setUsernameError(t('desktop.username_invalid_hint'))
      return
    }
    if (!usernameStatus?.can_change) {
      setUsernameError(
        t('desktop.username_cooldown_hint', {
          days: usernameStatus?.days_remaining ?? 60,
        }),
      )
      return
    }

    setUsernameBusy(true)
    setUsernameError(null)
    try {
      const result = await updateUsername(token, next)
      setUsernameStatus(result.status)
      setUsernameDraft(String(result.status.username || next))
      await refreshCurrentUser()
      showSuccessToast(result.message || t('desktop.username_updated_success'))
      setUsernameOpen(false)
    } catch (err) {
      setUsernameError(getApiErrorMessage(err))
    } finally {
      setUsernameBusy(false)
    }
  }

  const currentUsername = usernameStatus?.username || user?.username || '—'
  const canChangeUsername = usernameStatus?.can_change !== false

  return (
    <div>
      <section className="page-header">
        <p className="muted">{t('desktop.page_settings_desc')}</p>
      </section>

      {error ? <div className="alert-error">{error}</div> : null}

      <section className="page-card settings-list">
        <button type="button" className="settings-list__item" onClick={() => setLanguageOpen(true)}>
          <span>
            <i className="fa-solid fa-language" />
            {t('desktop.change_language')}
          </span>
          <span className="settings-list__meta">
            {user?.lang ? String(user.lang).toUpperCase() : ''}
            <i className="fa-solid fa-chevron-left" />
          </span>
        </button>

        <button type="button" className="settings-list__item" onClick={openUsernameModal}>
          <span>
            <i className="fa-solid fa-at" />
            {t('desktop.set_username')}
          </span>
          <span className="settings-list__meta" dir="ltr">
            {String(currentUsername)}
            <i className="fa-solid fa-chevron-left" />
          </span>
        </button>

        <button
          type="button"
          className="settings-list__item"
          onClick={() => {
            resetPasswordForm()
            setPasswordOpen(true)
          }}
        >
          <span>
            <i className="fa-solid fa-lock" />
            {t('desktop.change_password_button')}
          </span>
          <span className="settings-list__meta">
            <i className="fa-solid fa-chevron-left" />
          </span>
        </button>
      </section>

      <LanguageModal
        open={languageOpen}
        onClose={() => (pending ? undefined : setLanguageOpen(false))}
        onSelect={onSelectLanguage}
        pending={pending}
      />

      <Modal
        open={passwordOpen}
        onClose={() => {
          if (passwordBusy) return
          setPasswordOpen(false)
          resetPasswordForm()
        }}
        title={t('desktop.change_password_button')}
      >
        {passwordError ? <div className="alert-error">{passwordError}</div> : null}

        <AuthPasswordField
          id="settings-current-password"
          label={t('desktop.current_password')}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          visible={showCurrent}
          onToggleVisible={() => setShowCurrent((v) => !v)}
          toggleLabel={showCurrent ? t('auth.hide_password') : t('auth.show_password')}
          autoComplete="current-password"
          disabled={passwordBusy}
        />
        <AuthPasswordField
          id="settings-new-password"
          label={t('desktop.new_password')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          visible={showNew}
          onToggleVisible={() => setShowNew((v) => !v)}
          toggleLabel={showNew ? t('auth.hide_password') : t('auth.show_password')}
          autoComplete="new-password"
          disabled={passwordBusy}
        />
        <AuthPasswordField
          id="settings-confirm-password"
          label={t('desktop.confirm_password')}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          visible={showConfirm}
          onToggleVisible={() => setShowConfirm((v) => !v)}
          toggleLabel={showConfirm ? t('auth.hide_password') : t('auth.show_password')}
          autoComplete="new-password"
          disabled={passwordBusy}
        />

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn-primary"
            disabled={passwordBusy}
            onClick={() => void onSavePassword()}
          >
            {passwordBusy ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </Modal>

      <Modal
        open={usernameOpen}
        onClose={() => {
          if (usernameBusy) return
          setUsernameOpen(false)
          setUsernameError(null)
        }}
        title={t('desktop.set_username')}
      >
        {usernameError ? <div className="alert-error">{usernameError}</div> : null}

        <p className="muted" style={{ marginBottom: 12 }}>
          {t('desktop.username_invalid_hint')}
        </p>
        <p className="muted" style={{ marginBottom: 12 }}>
          {t('desktop.username_cooldown_rule', { days: usernameStatus?.cooldown_days ?? 60 })}
        </p>

        {!canChangeUsername && usernameStatus ? (
          <div className="alert-error" role="status" style={{ background: '#fff7ed', color: '#9a3412', borderColor: '#fdba74' }}>
            {t('desktop.username_cooldown_hint', {
              days: usernameStatus.days_remaining || 1,
            })}
            {usernameStatus.next_change_at
              ? ` (${formatJalaliSlash(usernameStatus.next_change_at, locale)})`
              : ''}
          </div>
        ) : null}

        <label className="field-label" htmlFor="settings-username">
          {t('desktop.username')}
        </label>
        <input
          id="settings-username"
          className="auth-input"
          dir="ltr"
          value={usernameDraft}
          onChange={(e) => setUsernameDraft(e.target.value.toLowerCase())}
          disabled={usernameBusy || usernameLoading || !canChangeUsername}
          autoComplete="username"
          maxLength={30}
        />

        <div className="form-actions" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="btn-primary"
            disabled={usernameBusy || usernameLoading || !canChangeUsername}
            onClick={() => void onSaveUsername()}
          >
            {usernameBusy ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>

        {(usernameStatus?.changes?.length ?? 0) > 0 ? (
          <div className="username-history">
            <h4>{t('desktop.username_history')}</h4>
            <ul>
              {usernameStatus?.changes.map((row) => (
                <li key={row.id}>
                  <span dir="ltr">
                    {row.old_username || '—'} → {row.new_username}
                  </span>
                  <small>{formatJalaliSlash(row.created_at, locale)}</small>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="muted" style={{ marginTop: 14 }}>
            {t('desktop.username_history_empty')}
          </p>
        )}
      </Modal>
    </div>
  )
}
