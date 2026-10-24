import type { StaffContract } from '@/lib/business'
import { formatAfghanDateValue } from '@/lib/datetime'
import type { TFunction } from 'i18next'

export function staffFullName(staff: {
  first_name?: string | null
  last_name?: string | null
  name?: string | null
}): string {
  const combined = `${staff.first_name || ''} ${staff.last_name || ''}`.trim()
  return combined || staff.name || '—'
}

export function contractStatusLabel(
  contract: StaffContract | null | undefined,
  t: TFunction,
): string {
  if (!contract) return '—'
  const computed = contract.computed_status || contract.status
  if (computed === 'terminated' || contract.status === 'terminated') {
    return t('desktop.contract_status_terminated')
  }
  if (computed === 'ended') {
    return t('desktop.contract_status_ended')
  }
  if (contract.end_date) {
    const end = new Date(contract.end_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    if (!Number.isNaN(end.getTime()) && end.getTime() < today.getTime()) {
      return t('desktop.contract_status_ended')
    }
  }
  return t('desktop.contract_status_active')
}

export function isContractClosed(contract: StaffContract | null | undefined): boolean {
  if (!contract) return false
  const computed = contract.computed_status || contract.status
  if (computed === 'terminated' || contract.status === 'terminated') return true
  if (computed === 'ended') return true
  if (contract.end_date) {
    const end = new Date(contract.end_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    end.setHours(0, 0, 0, 0)
    return !Number.isNaN(end.getTime()) && end.getTime() < today.getTime()
  }
  return false
}

export function formatDualDate(
  value: string | null | undefined,
  locale: 'fa' | 'ps' | 'en',
  t: TFunction,
): string {
  if (!value) return '—'
  const jalali = formatAfghanDateValue(value, locale)
  return `${String(value).slice(0, 10)} (${t('desktop.jalali_equivalent')}: ${jalali})`
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10)
}

export function hasActiveStaffContract(row: {
  active_contract_id?: number | null
  active_contract?: { id?: number } | null
  active_contract_start_date?: string | null
}): boolean {
  return Boolean(
    row.active_contract_id || row.active_contract?.id || row.active_contract_start_date,
  )
}
