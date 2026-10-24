import { useEffect, useMemo, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'

import type { AuthUser } from '@/lib/auth'
import { getApiErrorMessage } from '@/lib/auth'
import type { ProfileUser, ReferralUser } from '@/lib/user'
import { loadUserCacheBundle, useAppCacheStore } from '@/store/useAppCacheStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'

function authToProfileUser(user: AuthUser | null): ProfileUser | null {
  if (!user) return null
  return {
    id: user.id,
    user_id: user.user_id,
    username: user.username,
    name: user.name,
    lastname: user.lastname,
    email: user.email,
    profile_photo_path: user.profile_photo_path,
    premium_until: user.premium_until,
    is_premium: user.is_premium,
    profile: null,
  }
}

export function useCachedProfilePage() {
  const userKey = useUserCacheKey()
  const { token, authUser } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      authUser: state.user,
    })),
  )

  const cachedProfile = useAppCacheStore((state) => state.getProfile(userKey))
  const ensureProfile = useAppCacheStore((state) => state.ensureProfile)
  const setProfile = useAppCacheStore((state) => state.setProfile)
  const isSyncing = useAppCacheStore((state) => state.isSyncing(userKey))

  const [user, setUser] = useState<ProfileUser | null>(() => cachedProfile?.user ?? authToProfileUser(authUser))
  const [referrals, setReferrals] = useState<ReferralUser[]>(() => cachedProfile?.referrals ?? [])
  const [photoPath, setPhotoPath] = useState(
    () => cachedProfile?.user.profile_photo_path ?? authUser?.profile_photo_path ?? '',
  )
  const [error, setError] = useState<string | null>(null)
  const [cacheReady, setCacheReady] = useState(Boolean(cachedProfile))

  const hasShell = useMemo(() => Boolean(user), [user])

  useEffect(() => {
    let active = true
    void loadUserCacheBundle(userKey).then((bundle) => {
      if (!active || !bundle?.profile) return
      setUser(bundle.profile.user)
      setReferrals(bundle.profile.referrals ?? [])
      setPhotoPath(bundle.profile.user.profile_photo_path ?? '')
      setCacheReady(true)
      useAppCacheStore.setState((state) => ({
        bundles: {
          ...state.bundles,
          [userKey]: {
            ...(state.bundles[userKey] ?? {}),
            profile: bundle.profile,
            kyc: bundle.kyc ?? bundle.profile.user.profile ?? undefined,
            companies: bundle.companies,
          },
        },
      }))
    })
    return () => {
      active = false
    }
  }, [userKey])

  useEffect(() => {
    if (cachedProfile) {
      setUser(cachedProfile.user)
      setReferrals(cachedProfile.referrals ?? [])
      setPhotoPath(cachedProfile.user.profile_photo_path ?? '')
      setCacheReady(true)
    }
  }, [cachedProfile])

  useEffect(() => {
    if (!authUser) return
    setUser((prev) =>
      prev ??
      authToProfileUser(authUser),
    )
    setPhotoPath((prev) => prev || authUser.profile_photo_path || '')
  }, [authUser])

  useEffect(() => {
    if (!token) return
    let active = true
    setError(null)

    void ensureProfile(token, userKey)
      .then((data) => {
        if (!active) return
        if (data) {
          setUser(data.user)
          setReferrals(data.referrals ?? [])
          setPhotoPath((prev) => data.user.profile_photo_path || prev || '')
          setCacheReady(true)
        }
      })
      .catch((err) => {
        if (!active) return
        if (!cacheReady) {
          setError(getApiErrorMessage(err))
        }
      })

    return () => {
      active = false
    }
  }, [token, userKey, ensureProfile, cacheReady])

  const updateLocalProfile = async (patch: Partial<ProfileUser>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      void setProfile(userKey, { user: next, referrals })
      return next
    })
    if (patch.profile_photo_path !== undefined) {
      setPhotoPath(patch.profile_photo_path ?? '')
    }
  }

  const updateLocalInfo = async (payload: { name: string; lastname: string; email: string }) => {
    await updateLocalProfile(payload)
  }

  const updateLocalPhoto = async (newPath: string) => {
    const path = newPath.trim()
    if (!path) return
    await updateLocalProfile({ profile_photo_path: path })
  }

  return {
    token,
    user,
    referrals,
    photoPath,
    error,
    isSyncing,
    hasShell,
    updateLocalInfo,
    updateLocalPhoto,
  }
}
