import { create } from 'zustand'

type PageRefreshStore = {
  onRefresh: (() => void) | null
  busy: boolean
  register: (onRefresh: () => void) => void
  setBusy: (busy: boolean) => void
  clear: () => void
}

export const usePageRefreshStore = create<PageRefreshStore>((set) => ({
  onRefresh: null,
  busy: false,
  register: (onRefresh) => set({ onRefresh }),
  setBusy: (busy) => set({ busy }),
  clear: () => set({ onRefresh: null, busy: false }),
}))
