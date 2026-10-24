import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import logoUrl from '@/assets/logo.png'
import { SeoHead } from '@/components/SeoHead'
import { useAuthStore } from '@/store/useAuthStore'

export function ResellerTermsPage() {
  const { t } = useTranslation()
  const token = useAuthStore((s) => s.token)
  const sections = t('desktop.reseller_terms_sections', { returnObjects: true }) as Array<{
    title: string
    items: string[]
  }>

  return (
    <div className="legal-page">
      <SeoHead
        title={t('desktop.reseller_terms_title')}
        description={t('desktop.reseller_terms_intro')}
      />

      <article className="legal-card">
        <Link to={token ? '/dashboard' : '/'} className="legal-card__logo">
          <img src={logoUrl} alt="" />
        </Link>
        <h1>{t('desktop.reseller_terms_heading')}</h1>

        <div className="legal-card__body">
          <p>{t('desktop.reseller_terms_intro')}</p>

          {Array.isArray(sections)
            ? sections.map((section) => (
                <section key={section.title} className="legal-section">
                  <h2>{section.title}</h2>
                  <ul>
                    {(section.items ?? []).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
              ))
            : null}
        </div>
      </article>

      <div className="legal-actions">
        <Link to={token ? '/dashboard' : '/'} className="legal-actions__home">
          <i className="fa-solid fa-house" />
          <span>{token ? t('desktop.nav_dashboard') : t('desktop.back_to_home')}</span>
        </Link>
        <Link to="/terms">{t('desktop.terms')}</Link>
        <Link to="/policies">{t('desktop.policies')}</Link>
        <Link to="/resellers">{t('desktop.reseller_nav')}</Link>
        <Link to="/become-reseller">{t('desktop.reseller_become_nav')}</Link>
      </div>
    </div>
  )
}
