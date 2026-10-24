import { create } from 'zustand'

import { getSessionItem, setSessionItem } from '@/lib/session'

const SIDEBAR_KEY = 'hamyan_web_sidebar_open'

type SidebarStore = {
  isOpen: boolean
  isHydrated: boolean
  hydrate: () => Promise<void>
  open: () => void
  close: () => void
  toggle: () => void
}

async function persist(isOpen: boolean): Promise<void> {
  await setSessionItem(SIDEBAR_KEY, isOpen ? '1' : '0')
}

export const useSidebarStore = create<SidebarStore>((set, get) => ({
  isOpen: true,
  isHydrated: false,
  hydrate: async () => {
    if (get().isHydrated) return
    const saved = await getSessionItem(SIDEBAR_KEY)
    const isMobile =
      typeof window !== 'undefined' && window.matchMedia('(max-width: 900px)').matches
    set({
      // Mobile drawer starts closed; desktop keeps saved preference (default open).
      isOpen: isMobile ? false : saved !== '0',
      isHydrated: true,
    })
  },
  open: () => {
    set({ isOpen: true })
    void persist(true)
  },
  close: () => {
    set({ isOpen: false })
    void persist(false)
  },
  toggle: () => {
    const next = !get().isOpen
    set({ isOpen: next })
    void persist(next)
  },
}))
