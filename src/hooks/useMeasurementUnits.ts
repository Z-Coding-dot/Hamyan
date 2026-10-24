import { useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import type { MeasurementUnitRow } from '@/lib/business'
import {
  measurementUnitDisplayName,
  resolveMeasurementUnitName,
} from '@/lib/measurementUnits'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppCacheStore } from '@/store/useAppCacheStore'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'

export function useMeasurementUnits(companyId?: string | number | null) {
  const { i18n } = useTranslation()
  const userKey = useUserCacheKey()
  const token = useAuthStore(useShallow((state) => state.token))
  const units = useAppCacheStore((state) => state.getMeasurementUnits(userKey))
  const ensureMeasurementUnits = useAppCacheStore((state) => state.ensureMeasurementUnits)

  useEffect(() => {
    if (!token || !companyId) return
    void ensureMeasurementUnits(token, userKey, companyId)
  }, [token, userKey, companyId, ensureMeasurementUnits])

  const locale = i18n.language

  const labeledUnits = useMemo(
    () =>
      (units || []).map((unit) => ({
        ...unit,
        label: measurementUnitDisplayName(unit, locale),
      })),
    [units, locale],
  )

  const resolveName = (unitId?: number | string | null, fallback?: string | null) =>
    resolveMeasurementUnitName(units, unitId, fallback, locale)

  return {
    units: (units || []) as MeasurementUnitRow[],
    labeledUnits,
    resolveName,
    locale,
  }
}
