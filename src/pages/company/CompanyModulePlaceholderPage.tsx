import { useOutletContext } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import type { BusinessShowData } from '@/lib/user'

type CompanyOutletContext = {
  business: BusinessShowData
}

export function CompanyModulePlaceholderPage() {
  const { t } = useTranslation()
  const { business } = useOutletContext<CompanyOutletContext>()

  return (
    <div>
      <section className="page-header">
        <p className="muted">{business.company.name}</p>
      </section>
      <section className="page-card empty-state">
        <i className="fa-solid fa-clock-rotate-left" style={{ fontSize: '1.6rem', color: '#1463F3' }} />
        <p style={{ marginTop: 12 }}>{t('desktop.module_coming_soon')}</p>
      </section>
    </div>
  )
}
