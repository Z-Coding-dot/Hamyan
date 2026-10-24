import { api } from '@/lib/api'

export type HelpGuideRow = {
  id: number
  category?: string | null
  title?: string | null
  description?: string | null
  link?: string | null
  created_at?: string | null
}

type HelpListResponse = {
  guides?: HelpGuideRow[]
  data?: { guides?: HelpGuideRow[] }
}

type HelpShowResponse = {
  guide?: HelpGuideRow
  data?: { guide?: HelpGuideRow }
  message?: string
}

export const HELP_PRODUCT_SLUG = 'netrix'

export async function fetchHelpGuides(token?: string | null): Promise<HelpGuideRow[]> {
  const response = await api.get<HelpListResponse>('/help', {
    params: { product: HELP_PRODUCT_SLUG },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const raw = response.data
  if (Array.isArray(raw.guides)) return raw.guides
  if (Array.isArray(raw.data?.guides)) return raw.data.guides
  return []
}

export async function fetchHelpGuide(
  id: string | number,
  token?: string | null,
): Promise<HelpGuideRow> {
  const response = await api.get<HelpShowResponse>(`/help/${id}`, {
    params: { product: HELP_PRODUCT_SLUG },
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  const raw = response.data
  const guide = raw.guide ?? raw.data?.guide
  if (!guide) {
    throw new Error(raw.message || 'Help guide not found')
  }
  return guide
}

export function extractYoutubeVideoId(input: string | null | undefined): string {
  const value = String(input ?? '').trim()
  if (!value) return ''

  const idPattern = /^[a-zA-Z0-9_-]{11}$/
  if (idPattern.test(value)) return value

  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase().replace(/^www\./, '').replace(/^m\./, '')

    if (host === 'youtu.be') {
      const pathId = url.pathname.replace(/^\//, '').split('/')[0] || ''
      return idPattern.test(pathId) ? pathId : ''
    }

    if (host.includes('youtube.com')) {
      const queryId = url.searchParams.get('v')
      if (queryId && idPattern.test(queryId)) return queryId

      const pathParts = url.pathname.split('/').filter(Boolean)
      for (const marker of ['embed', 'shorts', 'live', 'v']) {
        const index = pathParts.indexOf(marker)
        if (index >= 0 && pathParts[index + 1]) {
          const candidate = pathParts[index + 1].split('&')[0]
          if (idPattern.test(candidate)) return candidate
        }
      }
    }
  } catch {
    // Fall through and try a loose regex for malformed pasted text.
  }

  const loose = value.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|shorts\/|live\/|watch\?.*?v=))([a-zA-Z0-9_-]{11})/,
  )
  return loose?.[1] ?? ''
}

export function buildYoutubeEmbedUrl(videoId: string): string {
  const id = String(videoId || '').trim()
  if (!id) return ''
  const params = new URLSearchParams({
    rel: '0',
    modestbranding: '1',
    playsinline: '1',
  })
  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`
}
