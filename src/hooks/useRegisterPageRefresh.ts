import { useEffect } from 'react'

import { usePageRefreshStore } from '@/store/usePageRefreshStore'

/** Registers the current page reload action for the floating header refresh button. */
export function useRegisterPageRefresh(onRefresh: () => void, busy = false) {
  const register = usePageRefreshStore((s) => s.register)
  const setBusy = usePageRefreshStore((s) => s.setBusy)
  const clear = usePageRefreshStore((s) => s.clear)

  useEffect(() => {
    register(onRefresh)
    return () => clear()
  }, [onRefresh, register, clear])

  useEffect(() => {
    setBusy(busy)
  }, [busy, setBusy])
}
