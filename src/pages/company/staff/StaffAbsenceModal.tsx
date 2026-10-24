import { FormEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { storeStaffAbsence, type BusinessStaffRow } from '@/lib/business'
import { todayLocalYmd } from '@/lib/datetime'
import { hasActiveStaffContract, staffFullName } from '@/pages/company/staff/staffHelpers'

type Props = {
  open: boolean
  token: string
  companyId: string
  staff: BusinessStaffRow[]
  onClose: () => void
  onSaved: () => Promise<void> | void
}

export function StaffAbsenceModal({ open, token, companyId, staff, onClose, onSaved }: Props) {
  const { t } = useTranslation()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [staffId, setStaffId] = useState('')
  const [date, setDate] = useState(todayLocalYmd())

  const eligible = useMemo(() => staff.filter(hasActiveStaffContract), [staff])

  useEffect(() => {
    if (!open) return
    setError(null)
    setDate(todayLocalYmd())
    setStaffId((current) => {
      if (current && eligible.some((row) => String(row.id) === current)) return current
      return eligible.length === 1 ? String(eligible[0].id) : ''
    })
  }, [open, eligible])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!staffId || !date) return
    setProcessing(true)
    setError(null)
    try {
      await storeStaffAbsence(token, companyId, staffId, { date })
      await onSaved()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={t('desktop.add_staff_absence')}>
      <form onSubmit={(e) => void submit(e)} className="form-grid">
        {error ? <div className="alert-error">{error}</div> : null}
        {eligible.length === 0 ? (
          <div className="alert-info">{t('desktop.no_staff_with_active_contract')}</div>
        ) : (
          <>
            <label>
              {t('desktop.staff')}
              <select value={staffId} onChange={(e) => setStaffId(e.target.value)} required>
                <option value="">{t('desktop.select')}</option>
                {eligible.map((row) => (
                  <option key={row.id} value={row.id}>
                    {staffFullName(row)}
                    {row.position ? ` — ${row.position}` : ''}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t('desktop.absence_date')}
              <JalaliDatePicker value={date} onChange={setDate} disabled={processing} />
            </label>
          </>
        )}
        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('desktop.cancel')}
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={processing || eligible.length === 0 || !staffId || !date}
          >
            {processing ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
