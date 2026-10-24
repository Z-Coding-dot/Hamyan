import { useTranslation } from 'react-i18next'

const SECTIONS = [
  {
    title: 'hy_guide_dash_title',
    points: ['hy_guide_dash_1', 'hy_guide_dash_2'],
  },
  {
    title: 'hy_accounts_title',
    points: ['personal_accounts_guide_intro', 'guide_create_account', 'hy_guide_fx_1', 'guide_balance_meaning', 'guide_delete_account'],
  },
  {
    title: 'hy_incomes_page',
    points: ['hy_guide_income_1'],
  },
  {
    title: 'expenses_page',
    points: ['hy_guide_expense_1'],
  },
  {
    title: 'expense_analysis',
    points: ['hy_guide_analysis_1'],
  },
  {
    title: 'nav_counterparties',
    points: ['cp_guide_intro', 'cp_guide_incoming', 'cp_guide_outgoing', 'cp_guide_account', 'cp_guide_balance', 'baqi_talab_meaning'],
  },
] as const

export function GuidePage() {
  const { t } = useTranslation()

  return (
    <div className="hy-guide" dir="rtl">
      <div className="ea-head">
        <div>
          <h2>{t('desktop.hy_guide_page')}</h2>
          <p>{t('desktop.hy_guide_intro')}</p>
        </div>
      </div>
      {SECTIONS.map((section) => (
        <section key={section.title} className="hy-guide__card">
          <h3>{t(`desktop.${section.title}`)}</h3>
          <ul>
            {section.points.map((key) => (
              <li key={key}>{t(`desktop.${key}`)}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
