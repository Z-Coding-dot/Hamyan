import { create } from 'zustand'

import { getSessionItem, setSessionItem, deleteSessionItem } from '@/lib/session'

const COMPANY_MODE_KEY = 'hamyan_web_is_company'
const COMPANY_ID_KEY = 'hamyan_web_company_id'

export type ActiveBusinessMeta = {
  companyId: string
  name: string
  isActive: boolean
  validUpTo: string | null
  logo?: string | null
  roleCode?: string | null
  roleTitle?: string | null
}

type CompanyContextStore = {
  isCompany: boolean
  companyId: string
  activeBusiness: ActiveBusinessMeta | null
  isHydrated: boolean
  hydrate: () => Promise<void>
  setUserContext: () => Promise<void>
  setCompanyContext: (companyId: string | number) => Promise<void>
  setActiveBusiness: (meta: ActiveBusinessMeta | null) => void
}

async function persistUser(): Promise<void> {
  await Promise.all([
    setSessionItem(COMPANY_MODE_KEY, '0'),
    deleteSessionItem(COMPANY_ID_KEY),
  ])
}

async function persistCompany(companyId: string): Promise<void> {
  await Promise.all([
    setSessionItem(COMPANY_MODE_KEY, '1'),
    setSessionItem(COMPANY_ID_KEY, companyId),
  ])
}

export const useCompanyContextStore = create<CompanyContextStore>((set) => ({
  isCompany: false,
  companyId: '',
  activeBusiness: null,
  isHydrated: false,
  hydrate: async () => {
    const [mode, companyId] = await Promise.all([
      getSessionItem(COMPANY_MODE_KEY),
      getSessionItem(COMPANY_ID_KEY),
    ])
    const isCompany = mode === '1' || mode === 'true'
    set({
      isCompany,
      companyId: isCompany ? String(companyId || '').trim() : '',
      activeBusiness: null,
      isHydrated: true,
    })
  },
  setUserContext: async () => {
    await persistUser()
    set({ isCompany: false, companyId: '', activeBusiness: null })
  },
  setCompanyContext: async (companyId) => {
    const normalized = String(companyId || '').trim()
    if (!normalized) {
      await persistUser()
      set({ isCompany: false, companyId: '', activeBusiness: null })
      return
    }
    await persistCompany(normalized)
    set((state) => ({
      isCompany: true,
      companyId: normalized,
      activeBusiness:
        state.activeBusiness?.companyId === normalized ? state.activeBusiness : null,
    }))
  },
  setActiveBusiness: (meta) => {
    set({
      activeBusiness: meta,
      isCompany: Boolean(meta),
      companyId: meta?.companyId ?? '',
    })
  },
}))

export function businessPath(companyId: string | number, suffix = ''): string {
  const base = `/business/${String(companyId).trim()}`
  if (!suffix) return base
  return `${base}/${suffix.replace(/^\//, '')}`
}
