import { FormEvent, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  deleteStaffAbsence,
  deleteStaffDocument,
  downloadStaffDocument,
  fetchBusinessStaffShow,
  storeStaffDocument,
  triggerBrowserDownload,
  type StaffAbsence,
  type StaffDocument,
  type StaffShowPayload,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { formatAfghanDateValue } from '@/lib/datetime'
import type { BusinessShowData } from '@/lib/user'
import { SalaryPaymentModal } from '@/pages/company/staff/SalaryPaymentModal'
import { StaffAbsencesTable } from '@/pages/company/staff/StaffAbsencesTable'
import { StaffContractModal } from '@/pages/company/staff/StaffContractModal'
import { StaffSalaryPaymentsTable } from '@/pages/company/staff/StaffSalaryPaymentsTable'
import {
  contractStatusLabel,
  formatDualDate,
  staffFullName,
} from '@/pages/company/staff/staffHelpers'
import { TerminateContractModal } from '@/pages/company/staff/TerminateContractModal'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

export function CompanyStaffShowPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '', staffId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((state) => state.token))
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [payload, setPayload] = useState<StaffShowPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [paymentsKey, setPaymentsKey] = useState(0)

  const [contractOpen, setContractOpen] = useState(false)
  const [terminateOpen, setTerminateOpen] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)
  const [docTitle, setDocTitle] = useState('')
  const [docFile, setDocFile] = useState<File | null>(null)
  const [docProcessing, setDocProcessing] = useState(false)
  const [docError, setDocError] = useState<string | null>(null)
  const [fileKey, setFileKey] = useState(0)

  const load = async () => {
    if (!token || !companyId || !staffId) return
    setLoading(true)
    setError(null)
    try {
      setPayload(await fetchBusinessStaffShow(token, companyId, staffId))
      setPaymentsKey((k) => k + 1)
    } catch (err) {
      setError(getApiErrorMessage(err))
      setPayload(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId, staffId])

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (!payload?.staff) {
    return <div className="alert-error">{error || t('desktop.no_staff')}</div>
  }

  const staff = payload.staff
  const activeContract = payload.activeContract || null
  const latestContract = payload.contract || null
  const payableContract = payload.payableContract || null
  const summary = payload.activeContractSummary || null
  const documents = payload.documents || []
  const historyContracts = (payload.contracts || []).filter(
    (row) => (row.computed_status || row.status) !== 'active',
  )
  const canManage =
    Boolean(payload.permissions?.canManageStaff ?? business.permissions?.canManageStaff) &&
    business.is_active
  const canDelete =
    Boolean(payload.permissions?.canDeleteRecords ?? business.permissions?.canDeleteRecords) &&
    business.is_active
  const today = payload.today || new Date().toISOString().slice(0, 10)
  const endOfMonth = (() => {
    const d = new Date(today)
    d.setMonth(d.getMonth() + 1, 0)
    return d.toISOString().slice(0, 10)
  })()
  const closingDate = activeContract?.termination_date || activeContract?.end_date || null

  const handleUploadDocument = async (event: FormEvent) => {
    event.preventDefault()
    if (!token || !docTitle.trim() || !docFile) {
      setDocError(t('desktop.document_title_file_required'))
      return
    }
    setDocProcessing(true)
    setDocError(null)
    try {
      const formData = new FormData()
      formData.append('title', docTitle.trim())
      formData.append('file', docFile)
      await storeStaffDocument(token, companyId, staffId, formData)
      setDocOpen(false)
      setDocTitle('')
      setDocFile(null)
      setFileKey((k) => k + 1)
      await load()
    } catch (err) {
      setDocError(getApiErrorMessage(err))
    } finally {
      setDocProcessing(false)
    }
  }

  const handleDeleteDocument = async (documentId: number) => {
    if (!token) return
    if (!window.confirm(t('desktop.confirm_delete_document'))) return
    try {
      await deleteStaffDocument(token, companyId, staffId, documentId)
      await load()
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

  const handleDownloadDocument = async (doc: StaffDocument) => {
    if (!token) return
    try {
      const blob = await downloadStaffDocument(token, companyId, staffId, doc.id)
      const name = doc.title || `staff-document-${doc.id}`
      triggerBrowserDownload(blob, name)
    } catch (err) {
      setError(getApiErrorMessage(err))
    }
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId, 'staff')} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
      </div>

      <div className="dash-header dash-header--section mb-3">
        <h5 className="mb-0">
          {t('desktop.view')} {t('desktop.staff')} - {staffFullName(staff)}
        </h5>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      <div className="party-details">
        <table className="party-info-table">
          <tbody>
            <tr>
              <th>{t('desktop.first_name')}</th>
              <td>{staff.first_name || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.last_name')}</th>
              <td>{staff.last_name || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.position')}</th>
              <td>{staff.position || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.phone')}</th>
              <td>{staff.phone || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.email')}</th>
              <td>{staff.email || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.address')}</th>
              <td>{staff.address || '—'}</td>
            </tr>
            <tr>
              <th>{t('desktop.hire_date')}</th>
              <td>{formatDualDate(activeContract?.start_date, locale, t)}</td>
            </tr>
            <tr>
              <th>{t('desktop.end_date')}</th>
              <td>{formatDualDate(activeContract?.end_date, locale, t)}</td>
            </tr>
            <tr>
              <th>{t('desktop.monthly_salary')}</th>
              <td>
                {activeContract?.monthly_salary != null
                  ? formatMoney(activeContract.monthly_salary)
                  : '—'}
              </td>
            </tr>
            <tr>
              <th>{t('desktop.created_at')}</th>
              <td>{formatAfghanDateValue(staff.created_at, locale)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {activeContract && summary ? (
        <section className="party-section">
          <h6>{t('desktop.active_contract_summary')}</h6>
          <div className="party-summary__chips">
            <SummaryChip
              label={t('desktop.payable_to_today')}
              value={summary.payable_to_today}
              meta={formatAfghanDateValue(today, locale)}
            />
            <SummaryChip
              label={t('desktop.payable_to_end_of_month')}
              value={summary.payable_to_end_of_month}
              meta={formatAfghanDateValue(endOfMonth, locale)}
            />
            <SummaryChip
              label={t('desktop.payable_to_end_of_contract')}
              value={summary.payable_to_end_of_contract}
              meta={closingDate ? formatAfghanDateValue(closingDate, locale) : undefined}
            />
            <SummaryChip label={t('desktop.paid_amount_staff')} value={summary.paid} />
            <SummaryChip
              label={t('desktop.remaining_to_today')}
              value={summary.remaining_to_today}
              meta={formatAfghanDateValue(today, locale)}
            />
            <SummaryChip
              label={t('desktop.remaining_to_end_of_month')}
              value={summary.remaining_to_end_of_month}
              meta={formatAfghanDateValue(endOfMonth, locale)}
            />
            <SummaryChip
              label={t('desktop.remaining_to_end_of_contract')}
              value={summary.remaining_to_end_of_contract}
              meta={closingDate ? formatAfghanDateValue(closingDate, locale) : undefined}
            />
            <SummaryChip label={t('desktop.absence_days')} value={summary.absence_days ?? 0} />
          </div>
        </section>
      ) : null}

      <section className="party-section">
        <div className="party-toolbar" style={{ marginBottom: 12 }}>
          <h6 className="mb-0">{t('desktop.staff_contract')}</h6>
          <div className="party-actions" style={{ margin: 0 }}>
            {activeContract?.id ? (
              <Link
                to={businessPath(companyId, `staff/${staffId}/contracts/${activeContract.id}`)}
                className="btn-secondary btn-sm"
              >
                <i className="fa-solid fa-eye" /> {t('desktop.show_active_contract')}
              </Link>
            ) : null}
            {canManage ? (
              <>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setContractOpen(true)}
                >
                  <i className="fa-solid fa-file-signature" />{' '}
                  {activeContract
                    ? t('desktop.edit_staff_contract')
                    : t('desktop.add_staff_contract')}
                </button>
                {activeContract ? (
                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={() => setTerminateOpen(true)}
                  >
                    <i className="fa-solid fa-ban" /> {t('desktop.terminate_contract')}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </div>

        {!latestContract ? (
          <p className="muted">{t('desktop.no_staff_contract')}</p>
        ) : (
          <div className="party-details">
            <table className="party-info-table">
              <tbody>
                <tr>
                  <th>{t('desktop.start_date')}</th>
                  <td>{formatDualDate(latestContract.start_date, locale, t)}</td>
                </tr>
                <tr>
                  <th>{t('desktop.end_date')}</th>
                  <td>{formatDualDate(latestContract.end_date, locale, t)}</td>
                </tr>
                <tr>
                  <th>{t('desktop.status')}</th>
                  <td>{contractStatusLabel(latestContract, t)}</td>
                </tr>
                {latestContract.status === 'terminated' ? (
                  <>
                    <tr>
                      <th>{t('desktop.termination_date')}</th>
                      <td>{formatDualDate(latestContract.termination_date, locale, t)}</td>
                    </tr>
                    <tr>
                      <th>{t('desktop.termination_reason')}</th>
                      <td>{latestContract.termination_reason || '—'}</td>
                    </tr>
                  </>
                ) : null}
                <tr>
                  <th>{t('desktop.monthly_salary')}</th>
                  <td>
                    {latestContract.monthly_salary != null
                      ? formatMoney(latestContract.monthly_salary)
                      : '—'}
                  </td>
                </tr>
                <tr>
                  <th>{t('desktop.account')}</th>
                  <td>
                    {latestContract.account?.name || '—'}
                    {latestContract.account?.currency
                      ? ` (${localizeCurrency(latestContract.account.currency, t)})`
                      : ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="party-section">
        <h6>{t('desktop.contract_history')}</h6>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('desktop.start_date')}</th>
                <th>{t('desktop.end_date')}</th>
                <th>{t('desktop.status')}</th>
                <th>{t('desktop.monthly_salary')}</th>
                <th>{t('desktop.action')}</th>
              </tr>
            </thead>
            <tbody>
              {historyContracts.length === 0 ? (
                <tr>
                  <td colSpan={6}>{t('desktop.no_contract_history')}</td>
                </tr>
              ) : (
                historyContracts.map((row, index) => (
                  <tr key={row.id}>
                    <td>{index + 1}</td>
                    <td>{formatDualDate(row.start_date, locale, t)}</td>
                    <td>{formatDualDate(row.end_date, locale, t)}</td>
                    <td>{contractStatusLabel(row, t)}</td>
                    <td>
                      {row.monthly_salary != null ? formatMoney(row.monthly_salary) : '—'}
                    </td>
                    <td>
                      <Link
                        to={businessPath(companyId, `staff/${staffId}/contracts/${row.id}`)}
                        className="btn-secondary btn-sm"
                      >
                        {t('desktop.view')}
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="party-section">
        <div className="party-toolbar" style={{ marginBottom: 12 }}>
          <h6 className="mb-0">{t('desktop.absences')}</h6>
        </div>
        <StaffAbsencesTable
          absences={payload.absences || []}
          canManage={canManage}
          locale={locale}
          onDelete={(absence) => void handleDeleteAbsence(absence)}
        />
      </section>

      <section className="party-section">
        <div className="party-toolbar" style={{ marginBottom: 12 }}>
          <h6 className="mb-0">{t('desktop.salary_payments')}</h6>
          {canManage ? (
            <button
              type="button"
              className="btn-primary btn-sm"
              disabled={!payableContract}
              onClick={() => setPayOpen(true)}
            >
              <i className="fa-solid fa-money-bill-wave" /> {t('desktop.pay_salary')}
            </button>
          ) : null}
        </div>
        {!payableContract ? (
          <div className="alert-info">{t('desktop.no_active_contract')}</div>
        ) : null}
        {token ? (
          <StaffSalaryPaymentsTable
            token={token}
            companyId={companyId}
            staffId={staffId}
            canManage={canManage}
            canDeleteRecords={canDelete}
            refreshKey={paymentsKey}
            onChanged={() => void load()}
          />
        ) : null}
      </section>

      <section className="party-section">
        <div className="party-toolbar" style={{ marginBottom: 12 }}>
          <h6 className="mb-0">{t('desktop.documents')}</h6>
          {canManage ? (
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => {
                setDocError(null)
                setDocOpen(true)
              }}
            >
              <i className="fa-solid fa-file-circle-plus" /> {t('desktop.add_staff_document')}
            </button>
          ) : null}
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>{t('desktop.document_title')}</th>
                <th>{t('desktop.file')}</th>
                <th>{t('desktop.creator')}</th>
                <th>{t('desktop.date')}</th>
                <th>{t('desktop.action')}</th>
              </tr>
            </thead>
            <tbody>
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={6}>{t('desktop.no_staff_documents')}</td>
                </tr>
              ) : (
                documents.map((doc, index) => (
                  <tr key={doc.id}>
                    <td>{index + 1}</td>
                    <td>{doc.title || '—'}</td>
                    <td>{doc.file?.split('/').pop() || '—'}</td>
                    <td>{doc.creator?.name || '—'}</td>
                    <td>{formatAfghanDateValue(doc.created_at, locale)}</td>
                    <td>
                      <div className="party-actions" style={{ margin: 0, gap: 6 }}>
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => void handleDownloadDocument(doc)}
                        >
                          <i className="fa-solid fa-download" /> {t('desktop.download')}
                        </button>
                        {canDelete ? (
                          <button
                            type="button"
                            className="btn-secondary btn-sm"
                            onClick={() => void handleDeleteDocument(doc.id)}
                          >
                            <i className="fa-solid fa-trash" /> {t('desktop.delete')}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {token && canManage ? (
        <>
          <StaffContractModal
            open={contractOpen}
            token={token}
            companyId={companyId}
            staffId={staffId}
            initialContract={activeContract}
            latestContract={latestContract}
            onClose={() => setContractOpen(false)}
            onSaved={load}
          />
          <TerminateContractModal
            open={terminateOpen}
            token={token}
            companyId={companyId}
            staffId={staffId}
            contract={activeContract}
            onClose={() => setTerminateOpen(false)}
            onSaved={load}
          />
          <SalaryPaymentModal
            open={payOpen}
            token={token}
            companyId={companyId}
            staffId={staffId}
            contract={payableContract}
            remainingHint={summary?.remaining_to_today ?? null}
            onClose={() => setPayOpen(false)}
            onSaved={load}
          />
        </>
      ) : null}

      <Modal
        open={docOpen}
        onClose={() => !docProcessing && setDocOpen(false)}
        title={t('desktop.add_staff_document')}
      >
        <form onSubmit={(e) => void handleUploadDocument(e)} className="form-grid">
          {docError ? <div className="alert-error">{docError}</div> : null}
          <label>
            {t('desktop.document_title')}
            <input value={docTitle} onChange={(e) => setDocTitle(e.target.value)} required />
          </label>
          <label>
            {t('desktop.file')}
            <input
              key={fileKey}
              type="file"
              onChange={(e) => setDocFile(e.target.files?.[0] || null)}
              required
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setDocOpen(false)}
              disabled={docProcessing}
            >
              {t('desktop.cancel')}
            </button>
            <button type="submit" className="btn-primary" disabled={docProcessing}>
              {docProcessing ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

function SummaryChip({
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
