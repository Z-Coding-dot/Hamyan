import { FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import { getApiErrorMessage } from '@/lib/auth'
import { localizeCurrency } from '@/lib/currency'
import {
  deleteStaffSalaryPayment,
  downloadStaffSalaryPaymentAttachment,
  fetchStaffSalaryPayments,
  triggerBrowserDownload,
  uploadStaffSalaryPaymentAttachment,
  type StaffSalaryPayment,
} from '@/lib/business'
import { formatMoney } from '@/lib/companyDashboard'
import { businessPath } from '@/store/useCompanyContextStore'

type Props = {
  token: string
  companyId: string
  staffId: string | number
  canManage: boolean
  canDeleteRecords?: boolean
  refreshKey?: number
  onChanged?: () => void
}

export function StaffSalaryPaymentsTable({
  token,
  companyId,
  staffId,
  canManage,
  canDeleteRecords = false,
  refreshKey = 0,
  onChanged,
}: Props) {
  const { t } = useTranslation()
  const [payments, setPayments] = useState<StaffSalaryPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<StaffSalaryPayment | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [attachTarget, setAttachTarget] = useState<StaffSalaryPayment | null>(null)
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [fileKey, setFileKey] = useState(0)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      setPayments(await fetchStaffSalaryPayments(token, companyId, staffId))
    } catch (err) {
      setError(getApiErrorMessage(err))
      setPayments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId, staffId, refreshKey])

  const handleDownload = async (payment: StaffSalaryPayment) => {
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

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    setError(null)
    try {
      await deleteStaffSalaryPayment(token, companyId, staffId, deleteTarget.id)
      setDeleteTarget(null)
      await load()
      onChanged?.()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setDeleting(false)
    }
  }

  const handleUploadAttachment = async (event: FormEvent) => {
    event.preventDefault()
    if (!attachTarget || !attachmentFile) return
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('attachment', attachmentFile)
      await uploadStaffSalaryPaymentAttachment(
        token,
        companyId,
        staffId,
        attachTarget.id,
        formData,
      )
      setAttachTarget(null)
      setAttachmentFile(null)
      setFileKey((k) => k + 1)
      await load()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setUploading(false)
    }
  }

  if (loading) return <p className="muted">{t('desktop.loading')}</p>
  if (error && payments.length === 0) return <div className="alert-error">{error}</div>

  return (
    <div>
      {error ? <div className="alert-error mb-2">{error}</div> : null}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>{t('desktop.related_contract')}</th>
              <th>{t('desktop.account')}</th>
              <th>{t('desktop.currency')}</th>
              <th>{t('desktop.amount')}</th>
              <th>{t('desktop.payment_date')}</th>
              <th>{t('desktop.salary_month')}</th>
              <th>{t('desktop.attachment')}</th>
              {canDeleteRecords ? <th>{t('desktop.action')}</th> : null}
            </tr>
          </thead>
          <tbody>
            {payments.length === 0 ? (
              <tr>
                <td colSpan={canDeleteRecords ? 9 : 8}>{t('desktop.no_salary_payments')}</td>
              </tr>
            ) : (
              payments.map((payment, index) => (
                <tr key={payment.id}>
                  <td>{index + 1}</td>
                  <td>
                    {payment.staff_contract_id ? (
                      <Link
                        to={businessPath(
                          companyId,
                          `staff/${staffId}/contracts/${payment.staff_contract_id}`,
                        )}
                      >
                        {payment.contract_number || `#${payment.staff_contract_id}`}
                      </Link>
                    ) : (
                      payment.contract_number || '—'
                    )}
                  </td>
                  <td>{payment.account_name || '—'}</td>
                  <td>{localizeCurrency(payment.currency, t)}</td>
                  <td>{formatMoney(payment.amount)}</td>
                  <td>{payment.payment_date_jalali || payment.payment_date || '—'}</td>
                  <td>{payment.salary_month_jalali || '—'}</td>
                  <td>
                    <div className="party-actions" style={{ margin: 0, gap: 6 }}>
                      {payment.has_attachment ? (
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => void handleDownload(payment)}
                        >
                          <i className="fa-solid fa-download" />
                        </button>
                      ) : null}
                      {canManage ? (
                        <button
                          type="button"
                          className="btn-secondary btn-sm"
                          onClick={() => {
                            setAttachTarget(payment)
                            setAttachmentFile(null)
                            setFileKey((k) => k + 1)
                          }}
                        >
                          <i className="fa-solid fa-paperclip" />
                        </button>
                      ) : null}
                    </div>
                  </td>
                  {canDeleteRecords ? (
                    <td>
                      <button
                        type="button"
                        className="btn-secondary btn-sm"
                        onClick={() => setDeleteTarget(payment)}
                      >
                        <i className="fa-solid fa-trash" />
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        title={t('desktop.confirm_delete')}
      >
        <p>{t('desktop.confirm_delete_salary_payment')}</p>
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setDeleteTarget(null)}
            disabled={deleting}
          >
            {t('desktop.cancel')}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => void handleDelete()}
            disabled={deleting}
          >
            {deleting ? t('desktop.processing') : t('desktop.delete')}
          </button>
        </div>
      </Modal>

      <Modal
        open={Boolean(attachTarget)}
        onClose={() => !uploading && setAttachTarget(null)}
        title={
          attachTarget?.has_attachment
            ? t('desktop.replace_payment_document')
            : t('desktop.add_payment_document')
        }
      >
        <form onSubmit={(e) => void handleUploadAttachment(e)} className="form-grid">
          <label>
            {t('desktop.attachment')}
            <input
              key={fileKey}
              type="file"
              onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
              required
            />
          </label>
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setAttachTarget(null)}
              disabled={uploading}
            >
              {t('desktop.cancel')}
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={uploading || !attachmentFile}
            >
              {uploading ? t('desktop.processing') : t('desktop.save')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
