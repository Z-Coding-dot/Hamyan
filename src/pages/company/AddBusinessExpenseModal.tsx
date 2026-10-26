import { Select } from '@/components/inputs/SearchableSelect'
import { FormEvent, useEffect, useState } from 'react'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'

import { JalaliDatePicker } from '@/components/inputs/JalaliDatePicker'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import {
  createBusinessExpense,
  fetchBusinessAccountsList,
  fetchBusinessExpenses,
  fetchBusinessStaff,
  type BusinessExpenseFieldRow,
  type BusinessStaffRow,
} from '@/lib/business'
import { localizeCurrency } from '@/lib/currency'
import { todayLocalYmd } from '@/lib/datetime'
import { staffFullName } from '@/pages/company/staff/staffHelpers'
import type { BusinessAccountRow } from '@/lib/user'
import { isBusinessAccountActive } from '@/lib/user'

type Props = {
  open: boolean
  token: string
  companyId: string
  onClose: () => void
  onSaved?: () => Promise<void> | void
}

function fieldErrors(err: unknown): Record<string, string[]> {
  if (!(err instanceof AxiosError) || !err.response?.data || typeof err.response.data !== 'object') {
    return {}
  }
  const errors = (err.response.data as { errors?: Record<string, string[] | string> }).errors
  if (!errors) return {}
  const out: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(errors)) {
    out[key] = Array.isArray(value) ? value.map(String) : [String(value)]
  }
  return out
}

const emptyForm = () => ({
  amount: '',
  date: todayLocalYmd(),
  field_id: '',
  spender: '',
  company_account_id: '',
  bill_number: '',
  remark: '',
})

export function AddBusinessExpenseModal({ open, token, companyId, onClose, onSaved }: Props) {
  const { t } = useTranslation()
  const [fields, setFields] = useState<BusinessExpenseFieldRow[]>([])
  const [staff, setStaff] = useState<BusinessStaffRow[]>([])
  const [accounts, setAccounts] = useState<BusinessAccountRow[]>([])
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string[]>>({})
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(emptyForm())
    setErrors({})
    void fetchBusinessExpenses(token, companyId)
      .then((data) => setFields(data.expenseFields))
      .catch(() => setFields([]))
    void fetchBusinessStaff(token, companyId).then(setStaff).catch(() => setStaff([]))
    void fetchBusinessAccountsList(token, companyId)
      .then((rows) => setAccounts(rows.filter(isBusinessAccountActive)))
      .catch(() => setAccounts([]))
  }, [open, token, companyId])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setBusy(true)
    setErrors({})
    try {
      await createBusinessExpense(token, companyId, {
        amount: form.amount,
        date: form.date,
        field_id: form.field_id,
        spender: form.spender,
        company_account_id: form.company_account_id,
        bill_number: form.bill_number || undefined,
        remark: form.remark || undefined,
      })
      showSuccessToast(t('desktop.saved_success'))
      await onSaved?.()
      onClose()
    } catch (err) {
      const mapped = fieldErrors(err)
      if (Object.keys(mapped).length) setErrors(mapped)
      else setErrors({ general: [getApiErrorMessage(err)] })
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (busy) return
        onClose()
      }}
      title={t('desktop.add_expense')}
      wide
    >
      <form onSubmit={(e) => void submit(e)} className="form-grid">
        {errors.general?.[0] ? <div className="alert-error">{errors.general[0]}</div> : null}

        <label>
          {t('desktop.select_account')}
          <Select
            value={form.company_account_id}
            onChange={(e) => setForm((p) => ({ ...p, company_account_id: e.target.value }))}
            required
          >
            <option value="">{t('desktop.select')}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} — {localizeCurrency(a.currency, t)}
              </option>
            ))}
          </Select>
          {errors.company_account_id?.[0] ? (
            <span className="field-error">{errors.company_account_id[0]}</span>
          ) : null}
        </label>

        <label>
          {t('desktop.amount')}
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
            required
          />
          {errors.amount?.[0] ? <span className="field-error">{errors.amount[0]}</span> : null}
        </label>

        <label>
          {t('desktop.date')}
          <JalaliDatePicker
            value={form.date}
            onChange={(date) => setForm((p) => ({ ...p, date }))}
            disabled={busy}
          />
          {errors.date?.[0] ? <span className="field-error">{errors.date[0]}</span> : null}
        </label>

        <label>
          {t('desktop.account_name')}
          <Select
            value={form.field_id}
            onChange={(e) => setForm((p) => ({ ...p, field_id: e.target.value }))}
            required
          >
            <option value="">{t('desktop.select')}</option>
            {fields.map((field) => (
              <option key={field.id} value={field.id}>
                {field.account_name} ({field.account_code})
              </option>
            ))}
          </Select>
          {errors.field_id?.[0] ? <span className="field-error">{errors.field_id[0]}</span> : null}
        </label>

        <label>
          {t('desktop.spender')}
          <Select
            value={form.spender}
            onChange={(e) => setForm((p) => ({ ...p, spender: e.target.value }))}
            required
          >
            <option value="">{t('desktop.select')}</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>
                {staffFullName(member)}
              </option>
            ))}
          </Select>
          {errors.spender?.[0] ? <span className="field-error">{errors.spender[0]}</span> : null}
        </label>

        <label>
          {t('desktop.bill_number')}
          <input
            value={form.bill_number}
            onChange={(e) => setForm((p) => ({ ...p, bill_number: e.target.value }))}
          />
        </label>

        <label>
          {t('desktop.remark')}
          <input
            value={form.remark}
            onChange={(e) => setForm((p) => ({ ...p, remark: e.target.value }))}
          />
        </label>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
            {t('desktop.cancel')}
          </button>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
