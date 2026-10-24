import { AxiosError } from 'axios'

import { api } from '@/lib/api'
import i18n from '@/lib/i18n'
import { isOfflineError, isOnline } from '@/lib/network'

export type AuthUser = {
  id: number
  user_id?: number | null
  username?: string | null
  name: string
  lastname?: string | null
  email: string
  role?: string | null
  status?: string | null
  lang?: string | null
  profile_photo_path?: string | null
  premium_until?: string | null
  is_premium?: boolean
}

export function isPremiumUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false
  if (user.is_premium) return true
  if (!user.premium_until) return false
  return new Date(user.premium_until).getTime() > Date.now()
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  lastname?: string
  email: string
  email_verification_code: string
  password: string
  password_confirmation: string
  referral_id?: number | string
}

export type ReferrerInfo = {
  name?: string | null
  lastname?: string | null
}

export type SendRegisterEmailCodePayload = {
  email: string
}

export type SendRegisterEmailCodeResponse = {
  message: string
  retry_after_seconds?: number
  debug_code?: string | null
}

export async function requestPasswordResetCode(email: string): Promise<{
  message: string
  retry_after_seconds?: number
  debug_code?: string | null
}> {
  const response = await api.post<{
    message: string
    retry_after_seconds?: number
    debug_code?: string | null
  }>('/auth/forgot-password', {
    email: email.trim().toLowerCase(),
  })
  return response.data
}

export async function resetPasswordWithCode(payload: {
  email: string
  email_verification_code: string
  password: string
  password_confirmation: string
}): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/auth/reset-password', {
    ...payload,
    email: payload.email.trim().toLowerCase(),
  })
  return response.data
}

type AuthResponse = {
  message: string
  token: string
  token_type: string
  user: AuthUser
}

export type DashboardResponse = {
  wallet: {
    balance: number
    currency: string
  }
  premium: {
    is_active: boolean
    plan_name: string
    premium_until?: string | null
  }
  profile: {
    is_approved: boolean
    status?: string | null
    lang: string
  }
}

export type CompanyItem = {
  company_id: number
  name: string
  logo?: string | null
  parent_id?: number | null
  parent_company_name?: string | null
  is_owner?: boolean
  access_role_code?: string | null
  access_role_title?: string | null
}

function buildAuthHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
  }
}

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', payload)
  return response.data
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', payload)
  return response.data
}

export async function fetchReferrer(ref: string | number): Promise<ReferrerInfo> {
  const response = await api.get<ReferrerInfo>(`/referrer/${ref}`)
  return response.data
}

export async function sendRegisterEmailCodeRequest(
  payload: SendRegisterEmailCodePayload,
): Promise<SendRegisterEmailCodeResponse> {
  const response = await api.post<SendRegisterEmailCodeResponse>(
    '/auth/register/email-code',
    payload,
  )
  return response.data
}

export async function fetchCurrentUser(token: string): Promise<AuthUser> {
  const response = await api.get<{ user: AuthUser }>('/auth/me', {
    headers: buildAuthHeaders(token),
  })
  return response.data.user
}

export async function logoutRequest(token: string): Promise<void> {
  await api.post(
    '/auth/logout',
    {},
    {
      headers: buildAuthHeaders(token),
    },
  )
}

export async function fetchDashboard(token: string): Promise<DashboardResponse> {
  const response = await api.get<DashboardResponse>('/auth/dashboard', {
    headers: buildAuthHeaders(token),
  })
  return response.data
}

export async function fetchCompanies(token: string): Promise<CompanyItem[]> {
  const response = await api.get<CompanyItem[]>('/auth/companies', {
    headers: buildAuthHeaders(token),
  })
  return response.data ?? []
}

export async function updateSettingsRequest(
  token: string,
  payload: {
    name?: string
    lastname?: string
    lang?: string
  },
): Promise<AuthUser> {
  const response = await api.patch<{ message: string; user: AuthUser }>(
    '/auth/settings',
    payload,
    { headers: buildAuthHeaders(token) },
  )
  return response.data.user
}

export async function updatePasswordRequest(
  token: string,
  payload: {
    current_password: string
    password: string
    password_confirmation: string
  },
): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>(
    '/auth/password',
    payload,
    { headers: buildAuthHeaders(token) },
  )
  return { message: response.data.message }
}

function firstValidationError(
  errors?: Record<string, string[] | undefined>,
): string | null {
  if (!errors) return null
  for (const messages of Object.values(errors)) {
    const first = messages?.find((item) => typeof item === 'string' && item.trim().length > 0)
    if (first) return first
  }
  return null
}

function fieldLabel(attribute: string): string {
  const map: Record<string, string> = {
    name: 'desktop.name',
    lastname: 'desktop.lastname',
    email: 'auth.email',
    password: 'auth.password_label',
    password_confirmation: 'auth.password_confirmation',
    email_verification_code: 'desktop.email_verification_code',
    code: 'desktop.code',
    current_password: 'desktop.current_password',
  }
  const key = map[attribute]
  if (key) return i18n.t(key)
  return attribute.replace(/_/g, ' ')
}

export function localizeApiMessage(message: string): string {
  const normalized = message.trim()
  if (!normalized) return normalized

  const known: Record<string, string> = {
    'The provided credentials are incorrect.': 'desktop.auth_invalid_credentials',
    'These credentials do not match our records.': 'desktop.auth_invalid_credentials',
    'Logout successful.': 'desktop.logout_success',
    'Logout successful': 'desktop.logout_success',
    'Logged out successfully.': 'desktop.logout_success',
    'The given data was invalid.': 'desktop.validation_invalid_data',
    Unauthorized: 'desktop.forbidden',
    'Unauthorized.': 'desktop.forbidden',
    'You do not have permission to perform this action.': 'desktop.forbidden',
    'شما دسترسی لازم را ندارید.': 'desktop.forbidden',
    'تاسو د دې عمل لپاره اړین لاسرسی نه لرئ.': 'desktop.forbidden',
    'این حساب دارای تراکنش است و قابل حذف نیست.': 'desktop.account_has_tx_delete_blocked',
    'نام حساب الزامی است.': 'desktop.required_field',
    'باقیات نمی‌تواند منفی باشد.': 'desktop.remaining_cannot_be_negative',
  }

  const exactKey = known[normalized]
  if (exactKey) return i18n.t(exactKey)

  const required = normalized.match(/^The (.+?) field is required\.?$/i)
  if (required) {
    return i18n.t('desktop.validation_required', { field: fieldLabel(required[1].replace(/ /g, '_')) })
  }

  const emailRule = normalized.match(/^The (.+?) must be a valid email address\.?$/i)
  if (emailRule) {
    return i18n.t('desktop.validation_email', { field: fieldLabel(emailRule[1].replace(/ /g, '_')) })
  }

  const minChars = normalized.match(/^The (.+?) must be at least (\d+) characters\.?$/i)
  if (minChars) {
    return i18n.t('desktop.validation_min_string', {
      field: fieldLabel(minChars[1].replace(/ /g, '_')),
      min: minChars[2],
    })
  }

  const confirmed = normalized.match(/^The (.+?) confirmation does not match\.?$/i)
  if (confirmed) {
    return i18n.t('desktop.validation_confirmed', {
      field: fieldLabel(confirmed[1].replace(/ /g, '_')),
    })
  }

  const unique = normalized.match(/^The (.+?) has already been taken\.?$/i)
  if (unique) {
    return i18n.t('desktop.validation_unique', {
      field: fieldLabel(unique[1].replace(/ /g, '_')),
    })
  }

  const digits = normalized.match(/^The (.+?) must be (\d+) digits\.?$/i)
  if (digits) {
    return i18n.t('desktop.validation_digits', {
      field: fieldLabel(digits[1].replace(/ /g, '_')),
      digits: digits[2],
    })
  }

  return normalized
}

export function getApiErrorMessage(error: unknown): string {
  if (isOfflineError(error)) {
    return i18n.t('desktop.offline_operation_blocked')
  }

  if (error instanceof AxiosError) {
    if (error.response?.status === 429) {
      return i18n.t('desktop.too_many_requests')
    }

    if (error.response?.status === 403) {
      const data = error.response.data as { message?: string } | undefined
      if (typeof data?.message === 'string' && data.message.trim()) {
        return localizeApiMessage(data.message)
      }
      return i18n.t('desktop.forbidden')
    }

    const data = error.response?.data as
      | {
          message?: string
          errors?: Record<string, string[] | undefined>
        }
      | undefined

    const apiMessage =
      firstValidationError(data?.errors) ||
      (typeof data?.message === 'string' ? data.message : null)

    if (typeof apiMessage === 'string' && apiMessage.trim().length > 0) {
      return localizeApiMessage(apiMessage)
    }

    if (!error.response) {
      if (!isOnline()) {
        return i18n.t('desktop.offline_operation_blocked')
      }
      return i18n.t('desktop.api_connection_error')
    }
  }

  return i18n.t('desktop.generic_request_error')
}
