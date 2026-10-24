import { useShallow } from 'zustand/react/shallow'

import { userCacheKey } from '@/store/useAppCacheStore'
import { useAuthStore } from '@/store/useAuthStore'

export function useUserCacheKey(): string {
  const user = useAuthStore(useShallow((state) => state.user))
  return userCacheKey(user?.user_id, user?.id)
}
