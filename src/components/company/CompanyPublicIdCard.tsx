import { useState } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  companyId: string | number | null | undefined
}

export function CompanyPublicIdCard({ companyId }: Props) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const id = companyId != null && companyId !== '' ? String(companyId) : ''

  const copy = async () => {
    if (!id) return
    try {
      await navigator.clipboard.writeText(id)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="content-small company-profile-card">
      <div className="pdetail company-profile-row">
        <span>
          {t('desktop.company_id')}: <strong dir="ltr">{id || '—'}</strong>
        </span>
        <button
          type="button"
          className="btn-ghost"
          style={{ padding: '6px 10px' }}
          onClick={() => void copy()}
          disabled={!id}
          title={copied ? t('desktop.copied') : t('desktop.copy_company_id')}
        >
          <i className={`fa-solid ${copied ? 'fa-check' : 'fa-copy'}`} />
        </button>
      </div>
      <div className="profile-invite-note">{t('desktop.public_company_id_note')}</div>
      {copied ? <div className="profile-copied-toast">{t('desktop.copied_success')}</div> : null}
    </div>
  )
}
