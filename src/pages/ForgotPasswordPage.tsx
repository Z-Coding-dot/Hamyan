import { FormEvent, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { AuthLayout } from '@/components/AuthLayout'
import { AuthButton, AuthCodeDigits, AuthPasswordField, AuthTextField } from '@/components/auth/AuthFields'
import {
  getApiErrorMessage,
  requestPasswordResetCode,
  resetPasswordWithCode,
} from '@/lib/auth'
import { useAuthStore } from '@/store/useAuthStore'

const RESEND_COOLDOWN_SECONDS = 100

export function ForgotPasswordPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { token, isHydrated } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      isHydrated: state.isHydrated,
    })),
  )

  const [email, setEmail] = useState('')
  const [emailCode, setEmailCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sendCodeMessage, setSendCodeMessage] = useState<string | null>(null)
  const [sendCodeLoading, setSendCodeLoading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [resendCountdown, setResendCountdown] = useState(0)

  useEffect(() => {
    if (resendCountdown <= 0) return
    const timer = window.setInterval(() => {
      setResendCountdown((previous) => (previous <= 1 ? 0 : previous - 1))
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
    if (resendCountdown > 0) return
    if (!trimmedEmail) {
      setSendCodeMessage(t('desktop.enter_email_first'))
      return
    }

    setSendCodeLoading(true)
    setSendCodeMessage(null)
    setError(null)

    try {
      const response = await requestPasswordResetCode(trimmedEmail)
      const retryAfter = response.retry_after_seconds ?? RESEND_COOLDOWN_SECONDS
      setResendCountdown(retryAfter)
      setSendCodeMessage(response.message || t('desktop.email_code_sent'))
    } catch (err) {
      setError(getApiErrorMessage(err))
      setSendCodeMessage(t('desktop.email_code_send_failed'))
    } finally {
      setSendCodeLoading(false)
    }
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (!/^\d{6}$/.test(emailCode)) {
      setError(t('desktop.email_verification_code_invalid'))
      return
    }
    if (password.length < 8) {
      setError(t('auth.password_label'))
      return
    }
    if (password !== passwordConfirmation) {
      setError(t('auth.password_confirmation'))
      return
    }

    setProcessing(true)
    try {
      const result = await resetPasswordWithCode({
        email: email.trim(),
        email_verification_code: emailCode,
        password,
        password_confirmation: passwordConfirmation,
      })
      navigate('/login', {
        replace: true,
        state: { status: result.message || t('desktop.reset_password_success') },
      })
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <AuthLayout>
      <div className="auth-page">
        <div className="auth-page__intro">
          <h2 className="auth-page__title auth-page__title--sm">{t('desktop.forgot_password_heading')}</h2>
          <p className="auth-page__subtitle">{t('desktop.forgot_password_code_intro')}</p>
        </div>

        {error ? (
          <div className="alert-error" role="alert">
            {error}
          </div>
        ) : null}

        <form className="auth-form-stack auth-form-stack--register" onSubmit={(e) => void onSubmit(e)}>
          <AuthTextField
            id="forgot-email"
            label={t('auth.email')}
            icon="fa-solid fa-at"
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            ltr
            required
            disabled={processing}
            onChange={(e) => setEmail(e.target.value)}
          />

          <AuthButton
            type="button"
            variant="soft"
            disabled={sendCodeLoading || processing || resendCountdown > 0}
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
            id="forgot-code"
            label={t('desktop.email_verification_code')}
            value={emailCode}
            disabled={processing}
            onChange={setEmailCode}
          />

          <AuthPasswordField
            id="forgot-password"
            label={t('auth.password_label')}
            icon="fa-solid fa-lock"
            name="password"
            autoComplete="new-password"
            value={password}
            visible={showPassword}
            onToggleVisible={() => setShowPassword((prev) => !prev)}
            toggleLabel={showPassword ? t('auth.hide_password') : t('auth.show_password')}
            disabled={processing}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <AuthPasswordField
            id="forgot-password-confirmation"
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
            disabled={processing}
            required
            onChange={(e) => setPasswordConfirmation(e.target.value)}
          />

          <div className="auth-actions-forgot">
            <AuthButton type="submit" disabled={processing}>
              <span className="auth-btn__content">
                <i className={`fa-solid ${processing ? 'fa-rotate fa-spin' : 'fa-key'}`} />
                <span>
                  {processing ? t('desktop.processing') : t('desktop.change_password_button')}
                </span>
              </span>
            </AuthButton>
          </div>
        </form>

        <div className="auth-footer-links">
          <Link to="/login">{t('desktop.back_to_login')}</Link>
          <span className="auth-footer-links__divider">|</span>
          <Link to="/register">{t('desktop.go_to_register')}</Link>
        </div>
      </div>
    </AuthLayout>
  )
}
