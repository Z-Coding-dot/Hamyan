import { useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { isPremiumUser, type AuthUser } from '@/lib/auth'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppCacheStore } from '@/store/useAppCacheStore'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'

export function usePremiumStatus() {
  const userKey = useUserCacheKey()
  const { token, user } = useAuthStore(
    useShallow((state) => ({ token: state.token, user: state.user })),
  )
  const ensurePremium = useAppCacheStore((state) => state.ensurePremium)
  const premiumUntil = useAppCacheStore((state) => state.getPremiumUntil(userKey))

  useEffect(() => {
    if (!token) return
    void ensurePremium(token, userKey)
  }, [token, userKey, ensurePremium])

  const effectiveUser = useMemo<AuthUser | null>(() => {
    if (!user) return null
    if (premiumUntil === undefined) return user
    return { ...user, premium_until: premiumUntil }
  }, [user, premiumUntil])

  return {
    premiumUntil: premiumUntil ?? user?.premium_until ?? null,
    premiumActive: isPremiumUser(effectiveUser),
    user: effectiveUser,
  }
}
