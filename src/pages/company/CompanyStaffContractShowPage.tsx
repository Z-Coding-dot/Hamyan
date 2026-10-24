import { useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import {
  deleteStaffAbsence,
  downloadStaffSalaryPaymentAttachment,
  fetchBusinessStaffContract,
  triggerBrowserDownload,
  type StaffAbsence,
  type StaffContractShowPayload,
  type StaffSalaryPayment,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { formatAfghanDateValue } from '@/lib/datetime'
import type { BusinessShowData } from '@/lib/user'
import { SalaryPaymentModal } from '@/pages/company/staff/SalaryPaymentModal'
import { StaffAbsencesTable } from '@/pages/company/staff/StaffAbsencesTable'
import {
  contractStatusLabel,
  formatDualDate,
  isContractClosed,
  staffFullName,
} from '@/pages/company/staff/staffHelpers'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyStaffContractShowPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '', staffId = '', contractId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [payload, setPayload] = useState<StaffContractShowPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [payOpen, setPayOpen] = useState(false)

  const load = async () => {
    if (!token || !companyId || !staffId || !contractId) return
    setLoading(true)
    setError(null)
    try {
      setPayload(await fetchBusinessStaffContract(token, companyId, staffId, contractId))
    } catch (err) {
      setError(getApiErrorMessage(err))
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId, staffId, contractId])

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!payload?.contract || !payload.staff) {
    return <div className="alert-error">{error || t('desktop.no_staff_contract')}</div>
  }

  const { staff, contract, summary, payments = [], absences = [] } = payload
  const statusLabel = contractStatusLabel(contract, t)
  const closed = isContractClosed(contract)
  const remainingEnd = Number(summary?.remaining_to_end_of_contract ?? 0)
  const isSettled = remainingEnd <= 0
  const hasRemainingPayable = remainingEnd > 0
  const canManage =
    Boolean(payload.permissions?.canManageStaff ?? business.permissions?.canManageStaff) &&
    business.is_active
  const today = payload.today || new Date().toISOString().slice(0, 10)
  const endOfMonth = (() => {
    const d = new Date(today)
    d.setMonth(d.getMonth() + 1, 0)
    return d.toISOString().slice(0, 10)
  })()
  const closingDate = contract.termination_date || contract.end_date || null

  const handleDownload = async (payment: StaffSalaryPayment) => {
    if (!token) return
    try {
      const blob = await downloadStaffSalaryPaymentAttachment(
        token,
        companyId,
        staffId,
        payment.id,
      )
      triggerBrowserDownload(blob, `salary-payment-${payment.id}`)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  const handleDeleteAbsence = async (absence: StaffAbsence) => {
    if (!token) return
    if (!window.confirm(t('desktop.confirm_delete_absence'))) return
    try {
      await deleteStaffAbsence(token, companyId, staffId, absence.id)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId, `staff/${staffId}`)} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
      </div>

      <div className="dash-header dash-header--section mb-3">
        <h5 className="mb-0">
          {t('desktop.contract_details')} - {staffFullName(staff)}
        </h5>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      {isSettled ? (
        <div className="alert-info mb-3">
          <strong>{t('desktop.contract_settled')}</strong>
          <div className="muted">{t('desktop.contract_settled_hint')}</div>
        </div>
      ) : null}

      <div className="party-details mb-3">
        <table className="party-info-table">
          <tbody>
            <tr>
              <th>{t('desktop.start_date')}</th>
              <td>{formatDualDate(contract.start_date, locale, t)}</td>
            </tr>
            <tr>
              <th>{t('desktop.end_date')}</th>
              <td>{formatDualDate(contract.end_date, locale, t)}</td>
            </tr>
            <tr>
              <th>{t('desktop.status')}</th>
              <td>{statusLabel}</td>
            </tr>
            {contract.status === 'terminated' ? (
              <>
                <tr>
                  <th>{t('desktop.termination_date')}</th>
                  <td>{formatDualDate(contract.termination_date, locale, t)}</td>
                </tr>
                <tr>
                  <th>{t('desktop.termination_reason')}</th>
                  <td>{contract.termination_reason || '—'}</td>
                </tr>
              </>
            ) : null}
            <tr>
              <th>{t('desktop.monthly_salary')}</th>
              <td>
                {contract.monthly_salary != null ? formatMoney(contract.monthly_salary) : '—'}
              </td>
            </tr>
            <tr>
              <th>{t('desktop.account')}</th>
              <td>{contract.account?.name || '—'}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <section className="party-section">
        <div className="party-toolbar" style={{ marginBottom: 12 }}>
          <h6 className="mb-0">{t('desktop.this_contract_summary')}</h6>
          <span className="muted">{isSettled ? t('desktop.contract_settled') : statusLabel}</span>
        </div>
        <div className="party-summary__chips">
          <Chip
            label={t('desktop.payable_to_today')}
            value={summary?.payable_to_today}
            meta={formatAfghanDateValue(today, locale)}
          />
          <Chip
            label={t('desktop.payable_to_end_of_month')}
            value={summary?.payable_to_end_of_month}
            meta={formatAfghanDateValue(endOfMonth, locale)}
          />
          <Chip
            label={t('desktop.payable_to_end_of_contract')}
            value={summary?.payable_to_end_of_contract}
            meta={closingDate ? formatAfghanDateValue(closingDate, locale) : undefined}
          />
          <Chip label={t('desktop.paid_amount_staff')} value={summary?.paid} />
          <Chip
            label={t('desktop.remaining_to_today')}
            value={summary?.remaining_to_today}
            meta={formatAfghanDateValue(today, locale)}
          />
          <Chip
            label={t('desktop.remaining_to_end_of_month')}
            value={summary?.remaining_to_end_of_month}
            meta={formatAfghanDateValue(endOfMonth, locale)}
          />
          <Chip
            label={t('desktop.remaining_to_end_of_contract')}
            value={summary?.remaining_to_end_of_contract}
            meta={closingDate ? formatAfghanDateValue(closingDate, locale) : undefined}
          />
          <Chip label={t('desktop.absence_days')} value={summary?.absence_days ?? 0} />
        </div>
      </section>

      <section className="party-section">
        <div className="party-toolbar" style={{ marginBottom: 12 }}>
          <h6 className="mb-0">{t('desktop.absences')}</h6>
        </div>
        <StaffAbsencesTable
          absences={absences}
          canManage={canManage}
          locale={locale}
          showContract={false}
          onDelete={(absence) => void handleDeleteAbsence(absence)}
        />
      </section>

      <section className="party-section">
        <div className="party-toolbar" style={{ marginBottom: 12 }}>
          <h6 className="mb-0">{t('desktop.salary_payments')}</h6>
          {canManage && closed && hasRemainingPayable ? (
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => setPayOpen(true)}
            >
              <i className="fa-solid fa-money-bill-wave" /> {t('desktop.pay_salary')}
            </button>
          ) : null}
        </div>

        {closed && !hasRemainingPayable ? (
          <div className="alert-info mb-2">{t('desktop.closed_contract_paid')}</div>
        ) : null}

        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('desktop.account')}</th>
                <th>{t('desktop.amount')}</th>
                <th>{t('desktop.payment_date')}</th>
                <th>{t('desktop.attachment')}</th>
                <th>{t('desktop.transactions')}</th>
              </tr>
            </thead>
            <tbody>
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={6}>{t('desktop.no_salary_payments')}</td>
                </tr>
              ) : (
                payments.map((payment, index) => (
                  <tr key={payment.id}>
                    <td>{index + 1}</td>
                    <td>{payment.account_name || '—'}</td>
                    <td>{formatMoney(payment.amount)}</td>
                    <td>{payment.payment_date_jalali || payment.payment_date || '—'}</td>
                    <td>
                      {payment.has_attachment ? (
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => void handleDownload(payment)}
                        >
                          <i className="fa-solid fa-download" />
                        </button>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td>
                      {payment.transaction_id ? (
                        <Link
                          to={businessPath(companyId, `transactions/${payment.transaction_id}`)}
                          className="btn-secondary btn-sm"
                        >
                          {t('desktop.view')}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {token && canManage ? (
        <SalaryPaymentModal
          open={payOpen}
          token={token}
          companyId={companyId}
          staffId={staffId}
          contract={contract}
          remainingHint={summary?.remaining_to_end_of_contract ?? null}
          onClose={() => setPayOpen(false)}
          onSaved={load}
        />
      ) : null}
    </div>
  )
}

function Chip({
  label,
  value,
  meta,
}: {
  label: string
  value?: number | null
  meta?: string
}) {
  return (
    <div className="party-amount-chip">
      <span className="muted">{label}</span>
      <strong>{value == null ? '—' : formatMoney(value)}</strong>
      {meta ? <span className="muted">{meta}</span> : null}
    </div>
  )
}
