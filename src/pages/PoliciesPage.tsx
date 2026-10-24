import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import logoUrl from '@/assets/logo.png'
import { SeoHead } from '@/components/SeoHead'
import { getWebsiteContentFallback } from '@/lib/websiteContentFallback'
import { useLocaleStore } from '@/store/useLocaleStore'

export function PoliciesPage() {
  const { t } = useTranslation()
  const language = useLocaleStore((s) => s.language)
  const content = getWebsiteContentFallback(language)

  return (
    <div className="legal-page">
      <SeoHead title={content.policies_page_title} description={content.policies_page_intro} />

      <article className="legal-card">
        <Link to="/" className="legal-card__logo">
          <img src={logoUrl} alt="" />
        </Link>
        <h1>{content.policies_page_heading}</h1>

        <div className="legal-card__body">
          <p>{content.policies_page_intro}</p>

          <section className="legal-section">
            <h2>{content.privacy_policy_title}</h2>
            <p>{content.privacy_policy_intro}</p>
            <ul>
              {content.privacy_policy_items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section className="legal-section">
            <h2>{content.privacy_user_rights_title}</h2>
            <ul>
              {content.privacy_user_rights_items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
            <p className="legal-section__note">{content.privacy_contact_note}</p>
            <p className="legal-section__note">
              <a href="https://ulanish.dev/privacy" target="_blank" rel="noreferrer">
                ulanish.dev/privacy
              </a>
              {' · '}
              <a href="https://ulanish.dev/account-deletion?app=ishanch" target="_blank" rel="noreferrer">
                ulanish.dev/account-deletion
              </a>
            </p>
          </section>
        </div>
      </article>

      <div className="legal-actions">
        <Link to="/" className="legal-actions__home">
          <i className="fa-solid fa-house" />
          <span>{content.home_label}</span>
        </Link>
        <Link to="/terms">{content.terms_page_title}</Link>
        <Link to="/reseller-terms">{t('desktop.reseller_terms_link')}</Link>
      </div>
    </div>
  )
}
