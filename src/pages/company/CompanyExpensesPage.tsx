import { FormEvent, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { AxiosError } from 'axios'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  createBusinessExpense,
  createExpenseField,
  deleteBusinessExpense,
  deleteExpenseField,
  fetchBusinessAccountsList,
  fetchBusinessExpenses,
  fetchBusinessStaff,
  updateBusinessExpense,
  updateExpenseField,
  type BusinessExpenseFieldRow,
  type BusinessExpenseRow,
  type BusinessStaffRow,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { formatAfghanDateValue } from '@/lib/datetime'
import type { BusinessAccountRow, BusinessShowData } from '@/lib/user'
import { isBusinessAccountActive } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { businessPath } from '@/store/useCompanyContextStore'
import { scheduleBusinessDashboardRefresh } from '@/store/useListsCacheStore'

type CompanyOutletContext = { business: BusinessShowData }

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

function spenderName(row?: BusinessExpenseRow['spender'] | null) {
  if (!row) return '—'
  return `${row.first_name || ''} ${row.last_name || ''}`.trim() || '—'
}

export function CompanyExpensesPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const canManage =
    Boolean(business.permissions?.canManageExpenses) && business.is_active
  const canDelete =
    Boolean(business.permissions?.canDeleteRecords) && business.is_active

  const [expenses, setExpenses] = useState<BusinessExpenseRow[]>([])
  const [fields, setFields] = useState<BusinessExpenseFieldRow[]>([])
  const [staff, setStaff] = useState<BusinessStaffRow[]>([])
  const [accounts, setAccounts] = useState<BusinessAccountRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [fieldsOpen, setFieldsOpen] = useState(false)
  const [expenseOpen, setExpenseOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState<BusinessExpenseRow | null>(null)

  const [fieldForm, setFieldForm] = useState({ account_code: '', account_name: '' })
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null)
  const [fieldErrorsMap, setFieldErrorsMap] = useState<Record<string, string[]>>({})
  const [fieldBusy, setFieldBusy] = useState(false)

  const [expenseForm, setExpenseForm] = useState({
    amount: '',
    date: '',
    field_id: '',
    spender: '',
    company_account_id: '',
    bill_number: '',
    remark: '',
  })
  const [expenseErrors, setExpenseErrors] = useState<Record<string, string[]>>({})
  const [expenseBusy, setExpenseBusy] = useState(false)

  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<BusinessExpenseRow | null>(null)
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const load = async () => {
    if (!token || !companyId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBusinessExpenses(token, companyId)
      setExpenses(data.expenses)
      setFields(data.expenseFields)
      if (Array.isArray(data.staff) && data.staff.length) {
        setStaff(data.staff)
      }
    } catch (err) {
      setError(getApiErrorMessage(err))
      setExpenses([])
      setFields([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId])

  useEffect(() => {
    if (!token || !companyId || !canManage) return
    if (!staff.length) {
      void fetchBusinessStaff(token, companyId).then(setStaff).catch(() => setStaff([]))
    }
    void fetchBusinessAccountsList(token, companyId)
      .then((rows) => setAccounts(rows.filter(isBusinessAccountActive)))
      .catch(() => setAccounts([]))
  }, [token, companyId, canManage, staff.length])

  const openAddExpense = () => {
    setSelectedExpense(null)
    setExpenseForm({
      amount: '',
      date: '',
      field_id: '',
      spender: '',
      company_account_id: '',
      bill_number: '',
      remark: '',
    })
    setExpenseErrors({})
    setExpenseOpen(true)
  }

  const openEditExpense = (expense: BusinessExpenseRow) => {
    setSelectedExpense(expense)
    setExpenseForm({
      amount: String(expense.amount ?? ''),
      date: String(expense.date || '').slice(0, 10),
      field_id: String(expense.field_id ?? expense.field?.id ?? ''),
      spender: String(expense.spender_id ?? expense.spender?.id ?? ''),
      company_account_id: String(expense.company_account_id ?? ''),
      bill_number: expense.bill_number || '',
      remark: expense.remark || '',
    })
    setExpenseErrors({})
    setExpenseOpen(true)
  }

  const submitField = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !canManage) return
    setFieldBusy(true)
    setFieldErrorsMap({})
    try {
      if (editingFieldId) {
        const updated = await updateExpenseField(token, companyId, editingFieldId, fieldForm)
        setFields((prev) => prev.map((row) => (row.id === editingFieldId ? updated : row)))
      } else {
        const created = await createExpenseField(token, companyId, fieldForm)
        setFields((prev) => [...prev, created])
      }
      setFieldForm({ account_code: '', account_name: '' })
      setEditingFieldId(null)
      showSuccessToast(t('desktop.saved_success'))
    } catch (err) {
      const mapped = fieldErrors(err)
      if (Object.keys(mapped).length) setFieldErrorsMap(mapped)
      else setFieldErrorsMap({ general: [getApiErrorMessage(err)] })
    } finally {
      setFieldBusy(false)
    }
  }

  const removeField = async (id: number) => {
    if (!token || !canManage) return
    if (!window.confirm(t('desktop.confirm_delete_expense'))) return
    setFieldBusy(true)
    try {
      await deleteExpenseField(token, companyId, id)
      setFields((prev) => prev.filter((row) => row.id !== id))
      if (editingFieldId === id) {
        setEditingFieldId(null)
        setFieldForm({ account_code: '', account_name: '' })
      }
      showSuccessToast(t('desktop.saved_success'))
    } catch (err) {
      setFieldErrorsMap({ general: [getApiErrorMessage(err)] })
    } finally {
      setFieldBusy(false)
    }
  }

  const submitExpense = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !canManage) return
    setExpenseBusy(true)
    setExpenseErrors({})
    try {
      const payload = {
        amount: expenseForm.amount,
        date: expenseForm.date,
        field_id: expenseForm.field_id,
        spender: expenseForm.spender,
        company_account_id: expenseForm.company_account_id,
        bill_number: expenseForm.bill_number || undefined,
        remark: expenseForm.remark || undefined,
      }
      if (selectedExpense?.id) {
        await updateBusinessExpense(token, companyId, selectedExpense.id, payload)
      } else {
        await createBusinessExpense(token, companyId, payload)
      }
      setExpenseOpen(false)
      showSuccessToast(t('desktop.saved_success'))
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      await load()
    } catch (err) {
      const mapped = fieldErrors(err)
      if (Object.keys(mapped).length) setExpenseErrors(mapped)
      else setExpenseErrors({ general: [getApiErrorMessage(err)] })
    } finally {
      setExpenseBusy(false)
    }
  }

  const confirmDelete = async () => {
    if (!token || !deleteTarget?.id) return
    setDeleteBusy(true)
    setDeleteError(null)
    try {
      await deleteBusinessExpense(token, companyId, deleteTarget.id)
      setDeleteOpen(false)
      setDeleteTarget(null)
      showSuccessToast(t('desktop.saved_success'))
      scheduleBusinessDashboardRefresh(token, userKey, companyId)
      await load()
    } catch (err) {
      setDeleteError(getApiErrorMessage(err))
    } finally {
      setDeleteBusy(false)
    }
  }

  return (
    <div className="dash-div party-page expenses-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId)} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
      </div>

      {canManage ? (
        <div className="expenses-actions mb-3">
          <button type="button" className="btn-primary" onClick={() => setFieldsOpen(true)}>
            {t('desktop.expense_fields_list')}
          </button>
          <button type="button" className="btn-secondary" onClick={openAddExpense}>
            <i className="fa-solid fa-circle-plus" /> {t('desktop.add_expense')}
          </button>
        </div>
      ) : null}

      <div className="dash-header dash-header--section mb-2">
        <h5 className="mb-0">{t('desktop.expense_list')}</h5>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : expenses.length === 0 ? (
        <div className="party-empty">{t('desktop.no_expenses')}</div>
      ) : (
        <div className="table-wrap party-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>{t('desktop.date')}</th>
                <th>{t('desktop.amount')}</th>
                <th>{t('desktop.account_name')}</th>
                <th>{t('desktop.account_code')}</th>
                <th>{t('desktop.bill_number')}</th>
                <th>{t('desktop.spender')}</th>
                <th>{t('desktop.creator')}</th>
                <th>{t('desktop.action')}</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{formatAfghanDateValue(expense.date, locale)}</td>
                  <td>
                    {formatMoney(expense.amount)} {localizeCurrency(expense.currency, t)}
                  </td>
                  <td>{expense.field?.account_name || '—'}</td>
                  <td>{expense.field?.account_code || '—'}</td>
                  <td>{expense.bill_number || '—'}</td>
                  <td>{spenderName(expense.spender)}</td>
                  <td>{expense.user?.name || t('desktop.unknown')}</td>
                  <td>
                    {canManage || canDelete ? (
                      <div className="expenses-row-actions">
                        {canManage ? (
                          <button
                            type="button"
                            className="btn-icon btn-icon--success"
                            title={t('desktop.edit')}
                            onClick={() => openEditExpense(expense)}
                          >
                            <i className="fa-regular fa-pen-to-square" />
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            className="btn-icon btn-icon--danger"
                            title={t('desktop.delete')}
                            onClick={() => {
                              setDeleteTarget(expense)
                              setDeleteError(null)
                              setDeleteOpen(true)
                            }}
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        ) : null}
                      </div>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={canManage && fieldsOpen}
        onClose={() => {
          if (fieldBusy) return
          setFieldsOpen(false)
          setEditingFieldId(null)
          setFieldForm({ account_code: '', account_name: '' })
          setFieldErrorsMap({})
        }}
        title={t('desktop.manage_expense_fields')}
        wide
      >
        <form onSubmit={(e) => void submitField(e)} className="form-grid">
          {fieldErrorsMap.general?.[0] ? <div className="alert-error">{fieldErrorsMap.general[0]}</div> : null}
          <label>
            {t('desktop.account_code')}
            <input
              value={fieldForm.account_code}
              onChange={(e) => setFieldForm((p) => ({ ...p, account_code: e.target.value }))}
              required
            />
            {fieldErrorsMap.account_code?.[0] ? (
              <span className="field-error">{fieldErrorsMap.account_code[0]}</span>
            ) : null}
          </label>
          <label>
            {t('desktop.account_name')}
            <input
              value={fieldForm.account_name}
              onChange={(e) => setFieldForm((p) => ({ ...p, account_name: e.target.value }))}
              required
            />
            {fieldErrorsMap.account_name?.[0] ? (
              <span className="field-error">{fieldErrorsMap.account_name[0]}</span>
            ) : null}
          </label>
          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={fieldBusy}>
              {fieldBusy
                ? t('desktop.processing')
                : editingFieldId
                  ? t('desktop.edit')
                  : t('desktop.save')}
            </button>
          </div>
        </form>

        <div className="mt-3">
          <h6>{t('desktop.expense_fields_list')}</h6>
          {fields.length === 0 ? (
            <p className="muted">{t('desktop.no_expense_fields')}</p>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('desktop.account_code')}</th>
                    <th>{t('desktop.account_name')}</th>
                    <th>{t('desktop.action')}</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field) => (
                    <tr key={field.id}>
                      <td>{field.account_code}</td>
                      <td>{field.account_name}</td>
                      <td>
                        <div className="expenses-row-actions">
                          <button
                            type="button"
                            className="btn-icon btn-icon--success"
                            title={t('desktop.edit')}
                            disabled={fieldBusy}
                            onClick={() => {
                              setEditingFieldId(field.id)
                              setFieldForm({
                                account_code: field.account_code || '',
                                account_name: field.account_name || '',
                              })
                            }}
                          >
                            <i className="fa-regular fa-pen-to-square" />
                          </button>
                          <button
                            type="button"
                            className="btn-icon btn-icon--danger"
                            title={t('desktop.delete')}
                            disabled={fieldBusy}
                            onClick={() => void removeField(field.id)}
                          >
                            <i className="fa-solid fa-trash" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>

      <Modal
        open={canManage && expenseOpen}
        onClose={() => {
          if (expenseBusy) return
          setExpenseOpen(false)
        }}
        title={selectedExpense ? t('desktop.edit_expense') : t('desktop.add_expense')}
        wide
      >
        <form onSubmit={(e) => void submitExpense(e)} className="form-grid">
          {expenseErrors.general?.[0] ? <div className="alert-error">{expenseErrors.general[0]}</div> : null}

          <label>
            {t('desktop.select_account')}
            <select
              value={expenseForm.company_account_id}
              onChange={(e) => setExpenseForm((p) => ({ ...p, company_account_id: e.target.value }))}
              required
            >
              <option value="">{t('desktop.select')}</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {localizeCurrency(a.currency, t)}
                </option>
              ))}
            </select>
            {expenseErrors.company_account_id?.[0] ? (
              <span className="field-error">{expenseErrors.company_account_id[0]}</span>
            ) : null}
          </label>

          <label>
            {t('desktop.amount')}
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm((p) => ({ ...p, amount: e.target.value }))}
              required
            />
            {expenseErrors.amount?.[0] ? <span className="field-error">{expenseErrors.amount[0]}</span> : null}
          </label>

          <label>
            {t('desktop.date')}
            <input
              type="date"
              value={expenseForm.date}
              onChange={(e) => setExpenseForm((p) => ({ ...p, date: e.target.value }))}
              required
            />
            {expenseForm.date ? (
              <span className="muted">{formatAfghanDateValue(expenseForm.date, locale)}</span>
            ) : null}
            {expenseErrors.date?.[0] ? <span className="field-error">{expenseErrors.date[0]}</span> : null}
          </label>

          <label>
            {t('desktop.account_name')}
            <select
              value={expenseForm.field_id}
              onChange={(e) => setExpenseForm((p) => ({ ...p, field_id: e.target.value }))}
              required
            >
              <option value="">{t('desktop.select')}</option>
              {fields.map((field) => (
                <option key={field.id} value={field.id}>
                  {field.account_name} ({field.account_code})
                </option>
              ))}
            </select>
            {expenseErrors.field_id?.[0] ? <span className="field-error">{expenseErrors.field_id[0]}</span> : null}
          </label>

          <label>
            {t('desktop.spender')}
            <select
              value={expenseForm.spender}
              onChange={(e) => setExpenseForm((p) => ({ ...p, spender: e.target.value }))}
              required
            >
              <option value="">{t('desktop.select')}</option>
              {staff.map((member) => (
                <option key={member.id} value={member.id}>
                  {`${member.first_name || ''} ${member.last_name || ''}`.trim() ||
                    member.name ||
                    `#${member.id}`}
                </option>
              ))}
            </select>
            {expenseErrors.spender?.[0] ? <span className="field-error">{expenseErrors.spender[0]}</span> : null}
          </label>

          <label>
            {t('desktop.bill_number')}
            <input
              value={expenseForm.bill_number}
              onChange={(e) => setExpenseForm((p) => ({ ...p, bill_number: e.target.value }))}
            />
          </label>

          <label>
            {t('desktop.remark')}
            <input
              value={expenseForm.remark}
              onChange={(e) => setExpenseForm((p) => ({ ...p, remark: e.target.value }))}
            />
          </label>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setExpenseOpen(false)} disabled={expenseBusy}>
              {t('desktop.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={expenseBusy}>
              {expenseBusy ? t('desktop.processing') : selectedExpense ? t('desktop.edit') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        open={canDelete && deleteOpen}
        onClose={() => {
          if (deleteBusy) return
          setDeleteOpen(false)
          setDeleteTarget(null)
          setDeleteError(null)
        }}
        title={t('desktop.confirm_delete_expense')}
      >
        <p>{t('desktop.delete_expense_confirm')}</p>
        {deleteTarget ? (
          <div className="party-summary mb-3">
            <div className="d-flex-between">
              <span>{t('desktop.date')}</span>
              <strong>{formatAfghanDateValue(deleteTarget.date, locale)}</strong>
            </div>
            <div className="d-flex-between">
              <span>{t('desktop.amount')}</span>
              <strong>
                {formatMoney(deleteTarget.amount)} {localizeCurrency(deleteTarget.currency, t)}
              </strong>
            </div>
            <div className="d-flex-between">
              <span>{t('desktop.account_name')}</span>
              <strong>{deleteTarget.field?.account_name || '—'}</strong>
            </div>
          </div>
        ) : null}
        {deleteError ? <div className="alert-error">{deleteError}</div> : null}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setDeleteOpen(false)}
            disabled={deleteBusy}
          >
            {t('desktop.cancel')}
          </button>
          <button type="button" className="btn-danger" onClick={() => void confirmDelete()} disabled={deleteBusy}>
            {deleteBusy ? t('desktop.processing') : t('desktop.delete')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
