import type { MeasurementUnitRow } from '@/lib/business'

export type MeasurementUnitLocale = 'fa' | 'ps' | 'en' | 'uz'

export function normalizeMeasurementLocale(locale?: string | null): MeasurementUnitLocale {
  const value = String(locale || 'fa')
    .toLowerCase()
    .split(/[-_]/)[0]
  if (value === 'ps' || value === 'en' || value === 'uz') return value
  return 'fa'
}

/**
 * Pick localized unit label from MeasurementUnit fields (server-provided).
 * Mirrors MeasurementUnit::getNameByLocale on the API.
 */
export function measurementUnitDisplayName(
  unit?: MeasurementUnitRow | null,
  locale?: string | null,
): string {
  if (!unit) return '—'
  const lang = normalizeMeasurementLocale(locale)
  const candidates =
    lang === 'ps'
      ? [unit.name_ps, unit.name_fa, unit.name_uz, unit.name_en, unit.name, unit.symbol]
      : lang === 'en'
        ? [unit.name_en, unit.name_fa, unit.name_ps, unit.name_uz, unit.name, unit.symbol]
        : lang === 'uz'
          ? [unit.name_uz, unit.name_fa, unit.name_ps, unit.name_en, unit.name, unit.symbol]
          : [unit.name_fa, unit.name_ps, unit.name_uz, unit.name_en, unit.name, unit.symbol]

  for (const candidate of candidates) {
    const value = typeof candidate === 'string' ? candidate.trim() : ''
    if (value) return value
  }
  return '—'
}

function unitFieldMatches(unit: MeasurementUnitRow, needle: string): boolean {
  return [unit.name, unit.name_fa, unit.name_ps, unit.name_en, unit.name_uz, unit.symbol]
    .map((value) => (typeof value === 'string' ? value.trim().toLowerCase() : ''))
    .filter(Boolean)
    .includes(needle)
}

export function resolveMeasurementUnitName(
  units: MeasurementUnitRow[] | null | undefined,
  unitId: number | string | null | undefined,
  fallbackName?: string | null,
  locale?: string | null,
): string {
  if (units?.length) {
    if (unitId != null) {
      const byId = units.find((unit) => String(unit.id) === String(unitId))
      if (byId) return measurementUnitDisplayName(byId, locale)
    }

    const fallback = typeof fallbackName === 'string' ? fallbackName.trim() : ''
    if (fallback) {
      const needle = fallback.toLowerCase()
      const byName = units.find((unit) => unitFieldMatches(unit, needle))
      if (byName) return measurementUnitDisplayName(byName, locale)
    }
  }

  const fallback = typeof fallbackName === 'string' ? fallbackName.trim() : ''
  return fallback || '—'
}
