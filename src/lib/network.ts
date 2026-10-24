import { apiBaseUrl } from '@/lib/config'
import i18n from '@/lib/i18n'

export const OFFLINE_ERROR_CODE = 'ERR_OFFLINE'

export class OfflineError extends Error {
  readonly code = OFFLINE_ERROR_CODE
  readonly isOffline = true

  constructor(message?: string) {
    super(message || i18n.t('desktop.offline_operation_blocked'))
    this.name = 'OfflineError'
  }
}

/** Local Laravel/API works without an active internet connection. */
export function isLocalApiBase(baseUrl: string = apiBaseUrl): boolean {
  const normalized = baseUrl.trim()
  // Relative /api via Vite proxy counts as local.
  if (normalized === '/api' || normalized.startsWith('/api/')) return true
  try {
    const host = new URL(normalized, typeof window !== 'undefined' ? window.location.origin : 'http://localhost')
      .hostname
      .toLowerCase()
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '0.0.0.0'
  } catch {
    return /localhost|127\.0\.0\.1/i.test(normalized)
  }
}

export function isOnline(): boolean {
  if (typeof navigator === 'undefined') return true
  // Local API (e.g. http://localhost:8000/api) does not need internet.
  if (isLocalApiBase()) return true
  return navigator.onLine !== false
}

export function isOfflineError(error: unknown): boolean {
  if (error instanceof OfflineError) return true
  if (error && typeof error === 'object' && 'code' in error) {
    return (error as { code?: string }).code === OFFLINE_ERROR_CODE
  }
  return false
}

/** Throws OfflineError when there is no internet connection. */
export function assertOnline(): void {
  if (!isOnline()) {
    throw new OfflineError()
  }
}
