import { useTranslation } from 'react-i18next'

import { CompanyLogoThumb } from '@/components/CompanyLogoThumb'
import type { CompanyItem } from '@/lib/auth'

type CompanyListItem = Pick<
  CompanyItem,
  'company_id' | 'name' | 'logo' | 'parent_id' | 'parent_company_name' | 'access_role_title'
>

type Props = {
  companies: CompanyListItem[]
  loading?: boolean
  showIntro?: boolean
  onSelect: (companyId: number | string) => void
  limit?: number
}

export function UserCompanyList({
  companies,
  loading = false,
  showIntro = true,
  onSelect,
  limit,
}: Props) {
  const { t } = useTranslation()
  const rows = typeof limit === 'number' ? companies.slice(0, limit) : companies

  return (
    <div className="list-comps">
      <div className="list-comps__header">
        <h5>{t('desktop.companies_list')}</h5>
      </div>

      {showIntro ? (
        <div className="list-comps__intro">
          <h6>{t('desktop.companies_dash_title')}</h6>
          <p>{t('desktop.companies_dash_desc')}</p>
        </div>
      ) : null}

      <div className="list-comps__body">
        {loading ? (
          <p className="muted list-comps__status">
            <i className="fa-solid fa-spinner fa-spin" /> {t('desktop.loading')}
          </p>
        ) : rows.length === 0 ? (
          <div className="list-comps__empty">
            <h6>{t('desktop.no_companies')}</h6>
          </div>
        ) : (
          rows.map((company) => {
            const isSubsidiary = Boolean(company.parent_id && company.parent_company_name)
            return (
              <div className="list-comps__tab" key={company.company_id}>
                <button
                  type="button"
                  className="list-comps__row"
                  onClick={() => onSelect(company.company_id)}
                >
                  {isSubsidiary ? (
                    <span className="list-comps__parent-badge" title={company.parent_company_name || ''}>
                      <i className="fa-solid fa-diagram-project" aria-hidden="true" />
                      <span>{company.parent_company_name}</span>
                    </span>
                  ) : null}

                  <CompanyLogoThumb
                    logo={company.logo}
                    name={company.name}
                    className="list-comps__logo"
                  />

                  <span className="list-comps__text">
                    <strong>{company.name}</strong>
                    {company.access_role_title ? (
                      <small className="list-comps__role">{company.access_role_title}</small>
                    ) : null}
                  </span>

                  <i className="fa-solid fa-chevron-left list-comps__chevron" aria-hidden="true" />
                </button>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
