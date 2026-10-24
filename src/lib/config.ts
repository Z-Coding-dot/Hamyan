const configured = import.meta.env.VITE_API_BASE_URL as string | undefined
const configuredOrigin = import.meta.env.VITE_API_ORIGIN as string | undefined
const PRODUCTION_APP_ORIGIN = 'https://app.ishanch.com'

export const apiBaseUrl =
  configured && configured.trim().length > 0
    ? configured.trim().replace(/\/$/, '')
    : `${PRODUCTION_APP_ORIGIN}/api`

function isLocalHostName(hostname: string): boolean {
  const host = hostname.toLowerCase()
  return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '0.0.0.0'
}

function isLocalOrigin(value: string): boolean {
  try {
    return isLocalHostName(new URL(value).hostname)
  } catch {
    return /localhost|127\.0\.0\.1/i.test(value)
  }
}

function stripLocalOrigin(value: string | undefined): string | undefined {
  const origin = value?.trim().replace(/\/$/, '')
  if (!origin) return undefined
  if (import.meta.env.PROD && isLocalOrigin(origin)) return undefined
  return origin
}

/** Origin of the Laravel app (for uploaded media). Prefer VITE_API_ORIGIN for relative /api. */
export const appOrigin = (() => {
  const fromEnv = stripLocalOrigin(configuredOrigin)
  if (fromEnv) return fromEnv

  if (/^https?:\/\//i.test(apiBaseUrl)) {
    const derived = stripLocalOrigin(apiBaseUrl.replace(/\/api\/?$/, ''))
    if (derived) return derived
  }

  if (import.meta.env.PROD) return PRODUCTION_APP_ORIGIN
  // Relative /api in Vite → Laravel usually on :8000 in local dev
  return 'http://localhost:8000'
})()

const apiIsRelative = !/^https?:\/\//i.test(apiBaseUrl)

function asRelativePath(path: string): string {
  return `/${path.replace(/^\//, '')}`
}

function rewriteToSameOrigin(absoluteUrl: string): string | null {
  try {
    const url = new URL(absoluteUrl)
    const origin = new URL(appOrigin)
    if (url.origin === origin.origin) {
      return `${url.pathname}${url.search}`
    }
  } catch {
    return null
  }
  return null
}

/** Replace accidental localhost/127.0.0.1 asset URLs with the real API origin. */
function rewriteLocalHostUrl(absoluteUrl: string): string | null {
  try {
    const url = new URL(absoluteUrl)
    if (!isLocalHostName(url.hostname)) return null
    return `${appOrigin}${url.pathname}${url.search}`
  } catch {
    return null
  }
}

/**
 * Resolve stored media paths the same way as mobile/desktop:
 * absolute URLs stay as-is; relative paths are joined to the API origin.
 * On local Vite (`VITE_API_BASE_URL=/api`) we keep same-origin `/uploaded/...`
 * so the dev proxy and CSP `img-src 'self'` can load logos, avatars, and item photos.
 */
export function assetUrl(path?: string | null): string | null {
  if (!path) return null
  const trimmed = String(path).trim()
  if (!trimmed) return null
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('ishanch-media:')
  ) {
    return trimmed
  }

  if (/^https?:\/\//i.test(trimmed)) {
    const withoutLocalhost = rewriteLocalHostUrl(trimmed) ?? trimmed
    if (apiIsRelative) {
      return rewriteToSameOrigin(withoutLocalhost) ?? withoutLocalhost
    }
    return withoutLocalhost
  }

  const relative = asRelativePath(trimmed)
  if (apiIsRelative) return relative
  return `${appOrigin}${relative}`
}
