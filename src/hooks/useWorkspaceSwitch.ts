import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { resolveCachedAsset } from '@/lib/mediaCache'
import { fetchBusiness } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppCacheStore, userCacheKey } from '@/store/useAppCacheStore'
import { businessPath, useCompanyContextStore } from '@/store/useCompanyContextStore'
import {
  useWorkspaceSwitchStore,
  type WorkspaceSwitchTarget,
} from '@/store/useWorkspaceSwitchStore'

const MIN_SWITCH_MS = 680

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

function nextPaint(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => resolve())
    })
  })
}

export function useWorkspaceSwitch() {
  const navigate = useNavigate()
  const beginSwitch = useWorkspaceSwitchStore((state) => state.begin)
  const endSwitch = useWorkspaceSwitchStore((state) => state.end)
  const isSwitching = useWorkspaceSwitchStore((state) => state.isActive)

  const setUserContext = useCompanyContextStore((state) => state.setUserContext)
  const setCompanyContext = useCompanyContextStore((state) => state.setCompanyContext)

  const { token, user } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      user: state.user,
    })),
  )
  const userKey = userCacheKey(user?.user_id, user?.id)
  const getCompanies = useAppCacheStore((state) => state.getCompanies)
  const ensureCompanies = useAppCacheStore((state) => state.ensureCompanies)
  const ensureProfile = useAppCacheStore((state) => state.ensureProfile)
  const ensurePremium = useAppCacheStore((state) => state.ensurePremium)
  const ensureCompanyValidity = useAppCacheStore((state) => state.ensureCompanyValidity)
  const ensureMeasurementUnits = useAppCacheStore((state) => state.ensureMeasurementUnits)

  const runSwitch = useCallback(
    async (target: WorkspaceSwitchTarget, load: () => Promise<void>) => {
      if (useWorkspaceSwitchStore.getState().isActive) return

      beginSwitch(target)
      await nextPaint()

      const started = Date.now()
      try {
        await Promise.all([load(), delay(MIN_SWITCH_MS)])
      } finally {
        const remaining = MIN_SWITCH_MS - (Date.now() - started)
        if (remaining > 0) {
          await delay(remaining)
        }
        endSwitch()
      }
    },
    [beginSwitch, endSwitch],
  )

  const switchToUser = useCallback(async () => {
    const displayName =
      [user?.name, user?.lastname].filter(Boolean).join(' ') || user?.email || ''
    const imageUrl = await resolveCachedAsset(user?.profile_photo_path)

    await runSwitch(
      {
        kind: 'user',
        name: displayName,
        imageUrl,
      },
      async () => {
        await setUserContext()
        navigate('/dashboard', { replace: false })
        if (!token) return
        await Promise.all([
          ensureProfile(token, userKey),
          ensureCompanies(token, userKey),
          ensurePremium(token, userKey),
        ])
      },
    )
  }, [
    ensureCompanies,
    ensurePremium,
    ensureProfile,
    navigate,
    runSwitch,
    setUserContext,
    token,
    user?.email,
    user?.lastname,
    user?.name,
    user?.profile_photo_path,
    userKey,
  ])

  const switchToCompany = useCallback(
    async (companyId: string | number) => {
      const id = String(companyId).trim()
      if (!id) {
        await switchToUser()
        return
      }

      const cached = getCompanies(userKey)
      const companies = cached ?? (token ? await ensureCompanies(token, userKey) : null)
      const row = companies?.find((company) => String(company.company_id) === id)
      const imageUrl = await resolveCachedAsset(row?.logo)

      await runSwitch(
        {
          kind: 'company',
          name: row?.name ?? id,
          imageUrl,
          companyId: id,
        },
        async () => {
          await setCompanyContext(id)
          navigate(businessPath(id), { replace: false })
          if (!token) return
          await fetchBusiness(token, id)
          await Promise.all([
            ensureCompanyValidity(token, userKey, id),
            ensureMeasurementUnits(token, userKey, id),
          ])
        },
      )
    },
    [
      ensureCompanies,
      ensureCompanyValidity,
      ensureMeasurementUnits,
      getCompanies,
      navigate,
      runSwitch,
      setCompanyContext,
      switchToUser,
      token,
      userKey,
    ],
  )

  return { switchToUser, switchToCompany, isSwitching }
}
