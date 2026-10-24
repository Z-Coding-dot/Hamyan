const SAVED_LOGINS_KEY = 'netrix_saved_login_emails'

export type SavedLoginAccount = {
  email: string
  password: string
}

export function readSavedLogins(): SavedLoginAccount[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const rawValue = window.localStorage.getItem(SAVED_LOGINS_KEY)
    const parsedValue = rawValue ? JSON.parse(rawValue) : []

    if (!Array.isArray(parsedValue)) {
      return []
    }

    return parsedValue
      .map((value) => {
        if (typeof value === 'string' && value.trim() !== '') {
          return { email: value.trim().toLowerCase(), password: '' }
        }

        if (value && typeof value === 'object' && typeof value.email === 'string') {
          return {
            email: value.email.trim().toLowerCase(),
            password: typeof value.password === 'string' ? value.password : '',
          }
        }

        return null
      })
      .filter((value): value is SavedLoginAccount => Boolean(value?.email))
  } catch {
    return []
  }
}

export function writeSavedLogins(items: SavedLoginAccount[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(SAVED_LOGINS_KEY, JSON.stringify(items))
}

export function persistSavedLogin(
  accounts: SavedLoginAccount[],
  email: string,
  password: string,
): SavedLoginAccount[] {
  const normalizedEmail = email.trim().toLowerCase()
  const normalizedPassword = password ?? ''

  if (!normalizedEmail || !normalizedPassword) {
    return accounts
  }

  return [
    { email: normalizedEmail, password: normalizedPassword },
    ...accounts.filter((item) => item.email !== normalizedEmail),
  ].slice(0, 6)
}

const REGISTER_COOLDOWN_KEY = 'register_email_code_cooldown_until'

export function readRegisterCooldown(): number {
  const raw = localStorage.getItem(REGISTER_COOLDOWN_KEY)
  const cooldownUntil = Number(raw)

  if (!raw || Number.isNaN(cooldownUntil)) {
    return 0
  }

  return Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))
}

export function persistRegisterCooldown(seconds: number): void {
  localStorage.setItem(REGISTER_COOLDOWN_KEY, String(Date.now() + seconds * 1000))
}

export function clearRegisterCooldown(): void {
  localStorage.removeItem(REGISTER_COOLDOWN_KEY)
}

/** Show the start of an email (first N characters) for compact saved-account chips. */
export function formatSavedEmailPreview(email: string, maxChars = 10): string {
  const value = email.trim()
  if (value.length <= maxChars) return value
  return `${value.slice(0, maxChars)}…`
}
