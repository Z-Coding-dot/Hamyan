import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { AuthLayout } from '@/components/AuthLayout'
import { AuthBadge } from '@/components/auth/AuthBadge'
import { AuthButton, AuthCheckbox, AuthTextField } from '@/components/auth/AuthFields'
import {
  formatSavedEmailPreview,
  persistSavedLogin,
  readSavedLogins,
  writeSavedLogins,
  type SavedLoginAccount,
} from '@/lib/saved-logins'
import { useAuthStore } from '@/store/useAuthStore'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const locationStatus =
    typeof (location.state as { status?: unknown } | null)?.status === 'string'
      ? String((location.state as { status: string }).status)
      : null
  const { token, isHydrated, isLoading, error, login, clearError } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      isHydrated: state.isHydrated,
      isLoading: state.isLoading,
      error: state.error,
      login: state.login,
      clearError: state.clearError,
    })),
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [saveLogin, setSaveLogin] = useState(false)
  const [savedAccounts, setSavedAccounts] = useState<SavedLoginAccount[]>([])
  const [showForm, setShowForm] = useState(true)
  const [quickLoginEmail, setQuickLoginEmail] = useState<string | null>(null)
  const [statusMessage, setStatusMessage] = useState<string | null>(locationStatus)

  useEffect(() => {
    const storedAccounts = readSavedLogins()
    setSavedAccounts(storedAccounts)
    setShowForm(storedAccounts.length === 0)
  }, [])

  useEffect(() => {
    if (locationStatus) {
      setStatusMessage(locationStatus)
      navigate(location.pathname, { replace: true, state: null })
    }
  }, [locationStatus, location.pathname, navigate])

  if (!isHydrated) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (token) {
    return <Navigate to="/dashboard" replace />
  }

  const handlePersistSavedLogin = (accountEmail: string, accountPassword: string) => {
    const nextAccounts = persistSavedLogin(savedAccounts, accountEmail, accountPassword)
    setSavedAccounts(nextAccounts)
    writeSavedLogins(nextAccounts)
  }

  const removeSavedEmail = (accountEmail: string) => {
    if (quickLoginEmail) {
      return
    }

    const nextAccounts = savedAccounts.filter((item) => item.email !== accountEmail)
    setSavedAccounts(nextAccounts)
    writeSavedLogins(nextAccounts)

    if (nextAccounts.length === 0) {
      setShowForm(true)
    }
  }

  const useSavedEmail = async (account: SavedLoginAccount) => {
    if (quickLoginEmail || !account.password) {
      return
    }

    setQuickLoginEmail(account.email)
    setShowForm(false)
    clearError()

    try {
      await login({ email: account.email, password: account.password })
      handlePersistSavedLogin(account.email, account.password)
      navigate('/dashboard', { replace: true })
    } catch {
      setShowForm(true)
    } finally {
      setQuickLoginEmail(null)
    }
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    clearError()

    try {
      await login({ email: email.trim(), password })
      if (saveLogin) {
        handlePersistSavedLogin(email, password)
      }
      navigate('/dashboard', { replace: true })
    } catch {
      // store handles error
    } finally {
      setQuickLoginEmail(null)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-page">
        <div className="auth-page__intro">
          <AuthBadge>{t('desktop.welcome_back')}</AuthBadge>
          <h2 className="auth-page__title">{t('desktop.login_heading')}</h2>
          <p className="auth-ulanish-note" role="note">
            {t('desktop.auth_ulanish_login_note')}{' '}
            <a
              href="https://ulanish.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="auth-ulanish-note__link"
            >
              {t('desktop.auth_ulanish_learn_more')}
            </a>
          </p>
        </div>

        {statusMessage ? (
          <div className="alert-success" role="status">
            {statusMessage}
          </div>
        ) : null}
        {error ? (
          <div className="alert-error" role="alert">
            {error}
          </div>
        ) : null}

        {savedAccounts.length > 0 && !showForm ? (
          <div className="saved-accounts">
            <div className="saved-accounts__head">
              <div>
                <div className="saved-accounts__title">{t('desktop.saved_accounts')}</div>
                <div className="saved-accounts__hint">{t('desktop.saved_accounts_hint')}</div>
              </div>
              <span className="saved-accounts__quick">{t('desktop.saved_accounts_quick')}</span>
            </div>

            <div className="saved-accounts__list">
              {savedAccounts.map((account) => (
                <div
                  key={account.email}
                  className={`saved-account-card${
                    quickLoginEmail && quickLoginEmail !== account.email ? ' is-dimmed' : ''
                  }`}
                >
                  <button
                    type="button"
                    className="saved-account-card__main"
                    aria-label={account.email}
                    disabled={Boolean(quickLoginEmail && quickLoginEmail !== account.email)}
                    onClick={() => void useSavedEmail(account)}
                  >
                    <span className="saved-account-card__avatar">
                      <i
                        className={`fa-solid ${
                          quickLoginEmail === account.email ? 'fa-rotate fa-spin' : 'fa-user'
                        }`}
                      />
                    </span>
                    <span
                      className="saved-account-card__email"
                      dir="ltr"
                      title={account.email}
                    >
                      {formatSavedEmailPreview(account.email, 10)}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="saved-account-card__remove"
                    disabled={Boolean(quickLoginEmail)}
                    aria-label={t('desktop.remove_saved_account')}
                    onClick={() => removeSavedEmail(account.email)}
                  >
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {showForm ? (
          <form className="auth-form-stack" onSubmit={(e) => void onSubmit(e)} autoComplete="on">
            <AuthTextField
              id="login-email"
              label={t('auth.email')}
              icon="fa-solid fa-at"
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              ltr
              disabled={isLoading}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="auth-field">
              <div className="auth-field__label-row">
                <div className="auth-field__label">
                  <i className="fa-solid fa-lock" aria-hidden="true" />
                  <label htmlFor="login-password">{t('auth.password_label')}</label>
                </div>
                <Link to="/forgot-password" className="auth-link">
                  {t('auth.forgot_password_link')}
                </Link>
              </div>
              <div className="auth-input-wrap">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  disabled={isLoading}
                  className="auth-input auth-input--ltr auth-input--password"
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="auth-input__toggle"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? t('auth.hide_password') : t('auth.show_password')}
                  disabled={isLoading}
                >
                  <i className={`fa-regular ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} />
                </button>
              </div>
            </div>

            <div className="auth-options-box">
              <div className="auth-options-box__title">
                <i className="fa-solid fa-clock-rotate-left" />
                <span>{t('desktop.remember_section')}</span>
              </div>
              <div className="auth-options-box__items">
                <AuthCheckbox
                  id="remember-me"
                  label={t('auth.remember_me')}
                  checked={remember}
                  onChange={setRemember}
                  disabled={isLoading}
                />
                <AuthCheckbox
                  id="save-login"
                  label={t('desktop.save_account_on_device')}
                  checked={saveLogin}
                  onChange={setSaveLogin}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="auth-actions-grid">
              <AuthButton type="submit" disabled={isLoading}>
                <span className="auth-btn__content">
                  <i className={`fa-solid ${isLoading ? 'fa-rotate fa-spin' : 'fa-arrow-right-to-bracket'}`} />
                  <span>{t('auth.login_button')}</span>
                </span>
              </AuthButton>

              <Link to="/register" className="auth-link-btn">
                <AuthButton type="button" variant="dark">
                  <span className="auth-btn__content">
                    <i className="fa-solid fa-user-plus" />
                    <span>{t('auth.register_button')}</span>
                  </span>
                </AuthButton>
              </Link>
            </div>
          </form>
        ) : null}

        {savedAccounts.length > 0 ? (
          <div className="auth-toggle-saved">
            <button
              type="button"
              disabled={Boolean(quickLoginEmail)}
              onClick={() => !quickLoginEmail && setShowForm(!showForm)}
            >
              {showForm ? t('desktop.show_saved_accounts') : t('desktop.use_another_account')}
            </button>
          </div>
        ) : null}
      </div>
    </AuthLayout>
  )
}
