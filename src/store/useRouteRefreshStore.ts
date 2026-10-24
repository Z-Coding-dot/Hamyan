import { create } from 'zustand'

import { userCacheKey, useAppCacheStore } from '@/store/useAppCacheStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useListsCacheStore } from '@/store/useListsCacheStore'

type RouteRefreshStore = {
  /** Bumped to remount the current route tree without touching browser history. */
  refreshKey: number
  isRefreshing: boolean
  refresh: () => void
  finishRefresh: () => void
}

export const useRouteRefreshStore = create<RouteRefreshStore>((set, get) => ({
  refreshKey: 0,
  isRefreshing: false,
  refresh: () => {
    if (get().isRefreshing) return
    set({ isRefreshing: true })
    void (async () => {
      const user = useAuthStore.getState().user
      const cacheKey = userCacheKey(user?.user_id, user?.id)
      await Promise.all([
        useListsCacheStore.getState().markAllStale(cacheKey),
        useAppCacheStore.getState().markAllStale(cacheKey),
      ])
      set((state) => ({
        refreshKey: state.refreshKey + 1,
      }))
    })()
  },
  finishRefresh: () => {
    if (!get().isRefreshing) return
    set({ isRefreshing: false })
  },
}))
