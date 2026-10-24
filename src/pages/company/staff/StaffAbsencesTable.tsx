import { useTranslation } from 'react-i18next'

import type { StaffAbsence } from '@/lib/business'
import { formatAfghanDateValue } from '@/lib/datetime'

type Props = {
  absences: StaffAbsence[]
  canManage: boolean
  locale: 'fa' | 'ps' | 'en'
  showContract?: boolean
  onDelete?: (absence: StaffAbsence) => void
}

export function StaffAbsencesTable({
  absences,
  canManage,
  locale,
  showContract = true,
  onDelete,
}: Props) {
  const { t } = useTranslation()

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>{t('desktop.absence_date')}</th>
            {showContract ? <th>{t('desktop.related_contract')}</th> : null}
            {canManage ? <th>{t('desktop.action')}</th> : null}
          </tr>
        </thead>
        <tbody>
          {absences.length === 0 ? (
            <tr>
              <td colSpan={showContract ? (canManage ? 4 : 3) : canManage ? 3 : 2}>
                {t('desktop.no_absences')}
              </td>
            </tr>
          ) : (
            absences.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>
                  {row.absent_on_jalali ||
                    (row.absent_on ? formatAfghanDateValue(row.absent_on, locale) : '—')}
                </td>
                {showContract ? (
                  <td>{row.staff_contract_id ? `#${row.staff_contract_id}` : '—'}</td>
                ) : null}
                {canManage ? (
                  <td>
                    <button
                      type="button"
                      className="btn-secondary btn-sm"
                      onClick={() => onDelete?.(row)}
                    >
                      {t('desktop.delete')}
                    </button>
                  </td>
                ) : null}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
