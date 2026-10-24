import { create } from 'zustand'

import { isLocalApiBase, isOnline } from '@/lib/network'

type OnlineStatusStore = {
  online: boolean
  hydrate: () => void
  setOnline: (online: boolean) => void
}

let listenersBound = false

export const useOnlineStatusStore = create<OnlineStatusStore>((set) => ({
  online: isOnline(),
  hydrate: () => {
    set({ online: isOnline() })
    if (listenersBound || typeof window === 'undefined') return
    listenersBound = true
    window.addEventListener('online', () => set({ online: true }))
    window.addEventListener('offline', () => {
      // Local API still reachable without internet.
      set({ online: isLocalApiBase() ? true : false })
    })
  },
  setOnline: (online) => {
    if (!online && isLocalApiBase()) {
      set({ online: true })
      return
    }
    set({ online })
  },
}))
