import { api } from '@/lib/api'

export type PublicBusiness = {
  company_id: string | number
  name: string
  slug: string
  logo?: string | null
  phone?: string | null
  tagline?: string | null
}

export type PublicBusinessProfile = {
  address_dari?: string | null
  address_pashto?: string | null
  address_english?: string | null
  phone?: string | null
  whatsapp?: string | null
  email?: string | null
  facebook?: string | null
  instagram?: string | null
  telegram?: string | null
  youtube?: string | null
  linkedin?: string | null
  twitter?: string | null
}

export type PublicProductCard = {
  id: number
  name: string
  afn: number
  usd: number
  image?: string | null
  slug: string
}

export type PublicProductDetail = PublicProductCard & {
  type?: string | null
  code?: string | null
  brand?: string | null
  model?: string | null
  color?: string | null
  generation?: string | null
  ram?: string | number | null
  storage?: string | number | null
  stock?: number
  is_public?: boolean
  in_stock?: boolean
  category?: string | null
  unit?: string | null
  description?: string | null
}

export type PublicSlider = {
  id: number
  image?: string | null
  description?: string | null
  status?: number | boolean
}

type Envelope<T> = { data: T; message?: string }

async function getData<T>(path: string, params?: Record<string, string | undefined>): Promise<T> {
  const response = await api.get<Envelope<T>>(path, { params })
  return response.data.data
}

export function fetchPublicBusinessWebsite(slug: string) {
  return getData<{
    business: PublicBusiness
    profile: PublicBusinessProfile | null
    sliders: PublicSlider[]
    items: PublicProductCard[]
  }>(`/public/c/${encodeURIComponent(slug)}`)
}

export function fetchPublicBusinessContact(slug: string) {
  return getData<{
    business: PublicBusiness
    profile: PublicBusinessProfile | null
  }>(`/public/c/${encodeURIComponent(slug)}/contact`)
}

export function fetchPublicBusinessProducts(
  slug: string,
  filters: { q?: string; sort?: string; page?: number } = {},
) {
  return getData<{
    business: PublicBusiness
    profile: PublicBusinessProfile | null
    filters: { q: string; sort: string }
    items: {
      data: PublicProductCard[]
      current_page: number
      last_page: number
      per_page: number
      total: number
    }
  }>(`/public/c/${encodeURIComponent(slug)}/products`, {
    q: filters.q || undefined,
    sort: filters.sort || undefined,
    page: filters.page ? String(filters.page) : undefined,
  })
}

export function fetchPublicBusinessProduct(slug: string, productId: string | number) {
  return getData<{
    business: PublicBusiness
    profile: PublicBusinessProfile | null
    item: PublicProductDetail
    related: PublicProductCard[]
  }>(`/public/c/${encodeURIComponent(slug)}/products/${productId}`)
}
