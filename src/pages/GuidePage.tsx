import { useTranslation } from 'react-i18next'

const SECTIONS = [
  { title: 'hy_guide_dash_title', icon: 'fa-table-columns', points: ['hy_guide_dash_1', 'hy_guide_dash_2'] },
  { title: 'hy_accounts_title', icon: 'fa-wallet', points: ['personal_accounts_guide_intro', 'guide_create_account', 'hy_guide_fx_1', 'guide_balance_meaning', 'guide_delete_account'] },
  { title: 'hy_incomes_page', icon: 'fa-arrow-down', points: ['hy_guide_income_1'] },
  { title: 'expenses_page', icon: 'fa-receipt', points: ['hy_guide_expense_1'] },
  { title: 'expense_analysis', icon: 'fa-chart-pie', points: ['hy_guide_analysis_1'] },
  { title: 'nav_counterparties', icon: 'fa-user-group', points: ['cp_guide_intro', 'cp_guide_incoming', 'cp_guide_outgoing', 'cp_guide_account', 'cp_guide_balance', 'baqi_talab_meaning'] },
] as const

export function GuidePage() {
  const { t } = useTranslation()
  return (
    <div className="hy-ledger hy-guide-page">
      <header className="hy-ledger__head"><div><span className="hy-ledger__eyebrow">{t('desktop.other_options')}</span><h2>{t('desktop.hy_guide_page')}</h2><p>{t('desktop.hy_guide_intro')}</p></div></header>
      <div className="hy-guide-page__grid">{SECTIONS.map((section, index) => (
        <details key={section.title} className="hy-guide-topic" open={index === 0}>
          <summary><span className="hy-options-icon" aria-hidden="true"><i className={`fa-solid ${section.icon}`} /></span><h3>{t(`desktop.${section.title}`)}</h3><i className="fa-solid fa-chevron-down" aria-hidden="true" /></summary>
          <ul>{section.points.map((key) => <li key={key}>{t(`desktop.${key}`)}</li>)}</ul>
        </details>
      ))}</div>
    </div>
  )
}
