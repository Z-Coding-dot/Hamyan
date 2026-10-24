import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { AuthLayout } from '@/components/AuthLayout'
import { AuthBadge } from '@/components/auth/AuthBadge'
import { AuthButton, AuthCodeDigits, AuthPasswordField, AuthTextField } from '@/components/auth/AuthFields'
import { fetchReferrer, type ReferrerInfo } from '@/lib/auth'
import {
  clearRegisterCooldown,
  persistRegisterCooldown,
  readRegisterCooldown,
} from '@/lib/saved-logins'
import { useAuthStore } from '@/store/useAuthStore'

const RESEND_COOLDOWN_SECONDS = 100

export function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { token, isHydrated, isLoading, error, register, sendRegisterEmailCode, clearError } =
    useAuthStore(
      useShallow((state) => ({
        token: state.token,
        isHydrated: state.isHydrated,
        isLoading: state.isLoading,
        error: state.error,
        register: state.register,
        sendRegisterEmailCode: state.sendRegisterEmailCode,
        clearError: state.clearError,
      })),
    )

  const [name, setName] = useState('')
  const [lastname, setLastname] = useState('')
  const [email, setEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [sendCodeLoading, setSendCodeLoading] = useState(false)
  const [sendCodeMessage, setSendCodeMessage] = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(() => readRegisterCooldown())
  const [referralId, setReferralId] = useState('')
  const [referrer, setReferrer] = useState<ReferrerInfo | null>(null)

  useEffect(() => {
    const ref = searchParams.get('ref')?.trim()
    if (!ref) return

    let cancelled = false
    void fetchReferrer(ref)
      .then((data) => {
        if (cancelled) return
        setReferrer(data)
        setReferralId(ref)
      })
      .catch(() => {
        if (cancelled) return
        setReferrer(null)
        setReferralId('')
      })

    return () => {
      cancelled = true
    }
  }, [searchParams])

  useEffect(() => {
    if (resendCountdown <= 0) {
      return
    }

    const timer = window.setInterval(() => {
      setResendCountdown((previous) => {
        if (previous <= 1) {
          clearRegisterCooldown()
          return 0
        }
        return previous - 1
      })
    }, 1000)

    return () => window.clearInterval(timer)
  }, [resendCountdown])

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

  const onSendEmailCode = async () => {
    const trimmedEmail = email.trim()

    if (resendCountdown > 0) {
      return
    }

    if (!trimmedEmail) {
      setSendCodeMessage(t('desktop.enter_email_first'))
      return
    }

    setSendCodeLoading(true)
    setSendCodeMessage(null)
    clearError()

    try {
      const response = await sendRegisterEmailCode(trimmedEmail)
      const retryAfter = response.retry_after_seconds ?? RESEND_COOLDOWN_SECONDS
      setResendCountdown(retryAfter)
      persistRegisterCooldown(retryAfter)
      setSendCodeMessage(response.message || t('desktop.email_code_sent'))
    } catch {
      setSendCodeMessage(t('desktop.email_code_send_failed'))
    } finally {
      setSendCodeLoading(false)
    }
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    clearError()
    setLocalError(null)

    if (name.trim().length < 2) {
      setLocalError(t('public.first_name'))
      return
    }

    if (!/^\d{6}$/.test(emailCode)) {
      setLocalError(t('desktop.email_verification_code_invalid'))
      return
    }

    if (password.length < 8) {
      setLocalError(t('auth.password_label'))
      return
    }

    if (password !== passwordConfirmation) {
      setLocalError(t('auth.password_confirmation'))
      return
    }

    try {
      await register({
        name: name.trim(),
        lastname: lastname.trim() || undefined,
        email: email.trim(),
        email_verification_code: emailCode,
        password,
        password_confirmation: passwordConfirmation,
        referral_id: referralId || undefined,
      })
      navigate('/dashboard', { replace: true })
    } catch {
      // store handles error
    }
  }

  return (
    <AuthLayout>
      <div className="auth-page">
        <div className="auth-page__intro">
          <AuthBadge>{t('desktop.join_ishanch')}</AuthBadge>
          <h2 className="auth-page__title">{t('desktop.register_heading')}</h2>
          <p className="auth-page__subtitle">{t('desktop.register_subtitle_long')}</p>
          <p className="auth-ulanish-note" role="note">
            {t('desktop.auth_ulanish_register_note')}{' '}
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

        {(error || localError) && (
          <div className="alert-error" role="alert">
            {localError || error}
          </div>
        )}

        <form className="auth-form-stack auth-form-stack--register" onSubmit={(e) => void onSubmit(e)}>
          {referrer ? (
            <div className="auth-terms-box" style={{ borderColor: '#f5d9b8', background: '#fff6eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, marginBottom: 4 }}>
                <i className="fa-solid fa-user-group" />
                <span>{t('auth.inviter_label')}</span>
              </div>
              <div>{[referrer.name, referrer.lastname].filter(Boolean).join(' ')}</div>
            </div>
          ) : null}

          <div className="auth-form-grid">
            <AuthTextField
              id="register-name"
              label={t('public.first_name')}
              icon="fa-regular fa-user"
              name="name"
              autoComplete="name"
              value={name}
              disabled={isLoading}
              required
              onChange={(e) => setName(e.target.value)}
            />
            <AuthTextField
              id="register-lastname"
              label={t('public.last_name')}
              icon="fa-regular fa-address-card"
              name="lastname"
              autoComplete="family-name"
              value={lastname}
              disabled={isLoading}
              onChange={(e) => setLastname(e.target.value)}
            />
          </div>

          <AuthTextField
            id="register-email"
            label={t('auth.email')}
            icon="fa-solid fa-at"
            type="email"
            name="email"
            autoComplete="username"
            value={email}
            ltr
            disabled={isLoading}
            required
            onChange={(e) => setEmail(e.target.value)}
          />

          <AuthButton
            type="button"
            variant="soft"
            disabled={sendCodeLoading || isLoading || resendCountdown > 0}
            onClick={() => void onSendEmailCode()}
          >
            <span className="auth-btn__content">
              <i className={`fa-solid ${sendCodeLoading ? 'fa-rotate fa-spin' : 'fa-paper-plane'}`} />
              <span>
                {sendCodeLoading
                  ? t('desktop.sending_code')
                  : resendCountdown > 0
                    ? `${t('desktop.resend_after')} ${resendCountdown} ${t('desktop.seconds_short')}`
                    : t('desktop.send_code')}
              </span>
            </span>
          </AuthButton>

          {sendCodeMessage ? <p className="form-hint form-hint--accent">{sendCodeMessage}</p> : null}

          <AuthCodeDigits
            id="register-code"
            label={t('desktop.email_verification_code')}
            value={emailCode}
            disabled={isLoading}
            onChange={setEmailCode}
          />

          <div className="auth-form-grid">
            <AuthPasswordField
              id="register-password"
              label={t('auth.password_label')}
              icon="fa-solid fa-lock"
              name="password"
              autoComplete="new-password"
              value={password}
              visible={showPassword}
              onToggleVisible={() => setShowPassword((prev) => !prev)}
              toggleLabel={showPassword ? t('auth.hide_password') : t('auth.show_password')}
              disabled={isLoading}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <AuthPasswordField
              id="register-password-confirmation"
              label={t('auth.password_confirmation')}
              icon="fa-solid fa-shield-heart"
              name="password_confirmation"
              autoComplete="new-password"
              value={passwordConfirmation}
              visible={showConfirmPassword}
              onToggleVisible={() => setShowConfirmPassword((prev) => !prev)}
              toggleLabel={
                showConfirmPassword ? t('auth.hide_password') : t('auth.show_password')
              }
              disabled={isLoading}
              required
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </div>

          <div className="auth-terms-box">
            {t('auth.accept_terms')}{' '}
            <a href="https://ulanish.dev/terms" className="auth-link" target="_blank" rel="noopener noreferrer">
              {t('desktop.terms')}
            </a>
            {' - '}
            <a href="https://ulanish.dev/privacy" className="auth-link" target="_blank" rel="noopener noreferrer">
              {t('desktop.policies')}
            </a>
          </div>

          <div className="auth-actions-register">
            <AuthButton type="submit" disabled={isLoading}>
              <span className="auth-btn__content">
                <i className={`fa-solid ${isLoading ? 'fa-rotate fa-spin' : 'fa-user-check'}`} />
                <span>{t('auth.register_button_full')}</span>
              </span>
            </AuthButton>
            <Link to="/login" className="auth-link auth-link--strong">
              {t('auth.already_registered')}
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  )
}
