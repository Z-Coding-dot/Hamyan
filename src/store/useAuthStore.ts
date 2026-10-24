import { create } from 'zustand'

import {
  fetchCurrentUser,
  getApiErrorMessage,
  loginRequest,
  logoutRequest,
  registerRequest,
  sendRegisterEmailCodeRequest,
  type AuthUser,
  type LoginPayload,
  type RegisterPayload,
  type SendRegisterEmailCodeResponse,
} from '@/lib/auth'
import { deleteSessionItem, getSessionItem, setSessionItem } from '@/lib/session'
import { invalidateBusinessShow } from '@/lib/user'
import { useAppCacheStore, userCacheKey } from '@/store/useAppCacheStore'
import { useCompanyContextStore } from '@/store/useCompanyContextStore'
import { useListsCacheStore } from '@/store/useListsCacheStore'

const TOKEN_KEY = 'hamyan_web_token'
const USER_KEY = 'hamyan_web_user'

type AuthStore = {
  user: AuthUser | null
  token: string | null
  error: string | null
  isHydrated: boolean
  isLoading: boolean
  bootstrap: () => Promise<void>
  refreshCurrentUser: () => Promise<void>
  login: (payload: LoginPayload) => Promise<void>
  sendRegisterEmailCode: (email: string) => Promise<SendRegisterEmailCodeResponse>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

async function persistSession(token: string, user: AuthUser): Promise<void> {
  await Promise.all([
    setSessionItem(TOKEN_KEY, token),
    setSessionItem(USER_KEY, JSON.stringify(user)),
  ])
}

async function clearPersistedSession(): Promise<void> {
  await Promise.all([deleteSessionItem(TOKEN_KEY), deleteSessionItem(USER_KEY)])
}

function prefetchUserCache(token: string, user: AuthUser): void {
  const key = userCacheKey(user.user_id, user.id)
  useAppCacheStore.getState().prefetchUser(token, key)
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  error: null,
  isHydrated: false,
  isLoading: false,
  clearError: () => set({ error: null }),
  bootstrap: async () => {
    if (get().isHydrated || get().isLoading) {
      return
    }

    set({ isLoading: true, error: null })

    try {
      const [savedToken, savedUser] = await Promise.all([
        getSessionItem(TOKEN_KEY),
        getSessionItem(USER_KEY),
      ])

      if (!savedToken) {
        set({ user: null, token: null, isHydrated: true, isLoading: false })
        return
      }

      const fallbackUser = savedUser ? (JSON.parse(savedUser) as AuthUser) : null
      set({ token: savedToken, user: fallbackUser })

      const currentUser = await fetchCurrentUser(savedToken)
      await persistSession(savedToken, currentUser)

      set({ user: currentUser, token: savedToken, isHydrated: true, isLoading: false })
      prefetchUserCache(savedToken, currentUser)
    } catch {
      await clearPersistedSession()
      set({ user: null, token: null, isHydrated: true, isLoading: false })
    }
  },
  refreshCurrentUser: async () => {
    const currentToken = get().token

    if (!currentToken) {
      set({ user: null, token: null, isHydrated: true })
      return
    }

    try {
      const currentUser = await fetchCurrentUser(currentToken)
      await persistSession(currentToken, currentUser)
      set({ user: currentUser, token: currentToken, error: null, isHydrated: true })
    } catch {
      await clearPersistedSession()
      set({ user: null, token: null, error: null, isHydrated: true })
    }
  },
  login: async (payload) => {
    set({ isLoading: true, error: null })

    try {
      const response = await loginRequest(payload)
      await persistSession(response.token, response.user)

      set({
        user: response.user,
        token: response.token,
        error: null,
        isHydrated: true,
        isLoading: false,
      })
      prefetchUserCache(response.token, response.user)
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false })
      throw error
    }
  },
  sendRegisterEmailCode: async (email) => {
    set({ error: null })

    try {
      const response = await sendRegisterEmailCodeRequest({ email })
      return response
    } catch (error) {
      set({ error: getApiErrorMessage(error) })
      throw error
    }
  },
  register: async (payload) => {
    set({ isLoading: true, error: null })

    try {
      const response = await registerRequest(payload)
      await persistSession(response.token, response.user)

      set({
        user: response.user,
        token: response.token,
        error: null,
        isHydrated: true,
        isLoading: false,
      })
      prefetchUserCache(response.token, response.user)
    } catch (error) {
      set({ error: getApiErrorMessage(error), isLoading: false })
      throw error
    }
  },
  logout: async () => {
    const currentToken = get().token

    // Drop local session first so mounted pages stop authenticated fetches (avoids 401 spam).
    set({ user: null, token: null, error: null, isLoading: true, isHydrated: true })

    try {
      if (currentToken) {
        await logoutRequest(currentToken)
      }
    } catch {
      // ignore network errors on logout
    } finally {
      await clearPersistedSession()
      invalidateBusinessShow()
      await Promise.all([
        useAppCacheStore.getState().clearAll(),
        useListsCacheStore.getState().clearAll(),
      ])
      await useCompanyContextStore.getState().setUserContext()
      set({ user: null, token: null, error: null, isHydrated: true, isLoading: false })
    }
  },
}))
