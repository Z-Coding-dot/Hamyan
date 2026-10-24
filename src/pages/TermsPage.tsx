import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import logoUrl from '@/assets/logo.png'
import { SeoHead } from '@/components/SeoHead'
import { getWebsiteContentFallback } from '@/lib/websiteContentFallback'
import { useLocaleStore } from '@/store/useLocaleStore'

export function TermsPage() {
  const { t } = useTranslation()
  const language = useLocaleStore((s) => s.language)
  const content = getWebsiteContentFallback(language)

  return (
    <div className="legal-page">
      <SeoHead title={content.terms_page_title} description={content.terms_intro} />

      <article className="legal-card">
        <Link to="/" className="legal-card__logo">
          <img src={logoUrl} alt="" />
        </Link>
        <h1>{content.terms_page_heading}</h1>

        <div className="legal-card__body">
          <p>{content.terms_intro}</p>

          {content.terms_sections.map((section) => (
            <section key={section.title} className="legal-section">
              <h2>{section.title}</h2>
              <ul>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}

          <section className="legal-section">
            <h2>{content.terms_common_title}</h2>
            <ul>
              {content.terms_common_items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </article>

      <div className="legal-actions">
        <Link to="/" className="legal-actions__home">
          <i className="fa-solid fa-house" />
          <span>{content.home_label}</span>
        </Link>
        <Link to="/policies">{content.policies_page_title}</Link>
        <Link to="/reseller-terms">{t('desktop.reseller_terms_link')}</Link>
      </div>
    </div>
  )
}
