import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import logoUrl from '@/assets/logo.png'
import { LanguageModal } from '@/components/LanguageModal'
import { ProductMarquee } from '@/components/ProductMarquee'
import { HamyanWhatsappFab } from '@/components/IshanchWhatsappFab'
import { SeoHead } from '@/components/SeoHead'
import { UlanishFromCredit } from '@/components/UlanishFromCredit'
import { useAuthStore } from '@/store/useAuthStore'
import '@/hamyan-home.css'

type Leaf = 'all' | 'expense' | 'deal' | 'save'

const LEAVES: { id: Leaf; icon: string; title: string; desc: string }[] = [
  { id: 'expense', icon: 'fa-solid fa-receipt', title: 'hy_mode_expense', desc: 'hy_mode_expense_desc' },
  { id: 'deal', icon: 'fa-solid fa-handshake', title: 'hy_mode_deals', desc: 'hy_mode_deals_desc' },
  { id: 'save', icon: 'fa-solid fa-coins', title: 'hy_chip_save', desc: 'hy_save_desc' },
]

const ROWS: { id: string; leaf: Exclude<Leaf, 'all'>; icon: string; name: string; meta: string; amount: string }[] = [
  { id: 'rent', leaf: 'expense', icon: 'fa-solid fa-house', name: 'hy_row_rent', meta: 'hy_mode_expense', amount: '-150' },
  { id: 'cash', leaf: 'deal', icon: 'fa-solid fa-arrow-down', name: 'hy_row_cash', meta: 'hy_chip_in', amount: '+3,000' },
  { id: 'person', leaf: 'deal', icon: 'fa-solid fa-user', name: 'hy_row_person', meta: 'hy_mode_deals', amount: '-800' },
  { id: 'bread', leaf: 'expense', icon: 'fa-solid fa-basket-shopping', name: 'hy_row_bread', meta: 'hy_mode_expense', amount: '-120' },
  { id: 'save', leaf: 'save', icon: 'fa-solid fa-coins', name: 'hy_row_save', meta: 'hy_chip_save', amount: '+500' },
]

const POCKETS = [
  { icon: 'fa-solid fa-receipt', tone: 'out', title: 'hy_cap_expense_title', desc: 'hy_cap_expense_desc' },
  { icon: 'fa-solid fa-wallet', tone: 'move', title: 'hy_cap_accounts_title', desc: 'hy_cap_accounts_desc' },
  { icon: 'fa-solid fa-users', tone: 'move', title: 'hy_cap_people_title', desc: 'hy_cap_people_desc' },
  { icon: 'fa-solid fa-chart-pie', tone: 'save', title: 'hy_cap_analysis_title', desc: 'hy_cap_analysis_desc' },
] as const

const STEPS = [
  { n: '01', title: 'hy_step1_title', desc: 'hy_step1_desc' },
  { n: '02', title: 'hy_step2_title', desc: 'hy_step2_desc' },
  { n: '03', title: 'hy_step3_title', desc: 'hy_step3_desc' },
] as const

export function HomePage() {
  const { t } = useTranslation()
  const { token, isHydrated } = useAuthStore(
    useShallow((s) => ({ token: s.token, isHydrated: s.isHydrated })),
  )
  const [langOpen, setLangOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [leaf, setLeaf] = useState<Leaf>('all')

  useEffect(() => {
    document.documentElement.classList.add('hy-no-scrollbar')
    return () => document.documentElement.classList.remove('hy-no-scrollbar')
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!navOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setNavOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [navOpen])

  if (!isHydrated) {
    return (
      <div className="center-screen">
        <div className="spinner" />
      </div>
    )
  }

  if (token) return <Navigate to="/dashboard" replace />

  return (
    <div className="hy">
      <SeoHead title={t('desktop.hy_hero_title')} description={t('desktop.hy_hero_lead')} />

      <header className={`hy-bar${scrolled ? ' is-scrolled' : ''}`}>
        <div className="hy-frame hy-bar__inner">
          <Link to="/" className="hy-brand">
            <img src={logoUrl} alt="" width={42} height={42} />
            <span>
              <strong>{t('desktop.app_name')}</strong>
              <small>{t('desktop.brand_slogan')}</small>
            </span>
          </Link>
          <nav className="hy-bar__links" aria-label={t('desktop.home_page_title')}>
            <a href="#ledger">{t('desktop.hy_nav_ledger')}</a>
            <a href="#pockets">{t('desktop.hy_nav_tools')}</a>
            <a href="#start">{t('desktop.hy_nav_flow')}</a>
          </nav>
          <div className="hy-bar__actions">
            <button type="button" className="hy-icon" onClick={() => setLangOpen(true)} aria-label={t('desktop.language_title')}>
              <i className="fa-solid fa-language" />
            </button>
            <Link to="/login" className="hy-ghost">
              {t('desktop.hy_hero_login')}
            </Link>
            <Link to="/register" className="hy-solid hy-solid--sm">
              {t('desktop.hy_hero_start')}
            </Link>
            <button
              type="button"
              className="hy-icon hy-bar__menu"
              onClick={() => setNavOpen(true)}
              aria-label={t('desktop.menu')}
            >
              <i className="fa-solid fa-bars" />
            </button>
          </div>
        </div>
      </header>

      {navOpen ? (
        <button type="button" className="hy-backdrop" aria-label={t('desktop.sidebar_close')} onClick={() => setNavOpen(false)} />
      ) : null}
      <nav className={`hy-drawer${navOpen ? ' is-open' : ''}`}>
        <div className="hy-drawer__head">
          <strong>{t('desktop.menu')}</strong>
          <button type="button" className="hy-icon" onClick={() => setNavOpen(false)} aria-label={t('desktop.sidebar_close')}>
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <a href="#ledger" onClick={() => setNavOpen(false)}>{t('desktop.hy_nav_ledger')}</a>
        <a href="#pockets" onClick={() => setNavOpen(false)}>{t('desktop.hy_nav_tools')}</a>
        <a href="#start" onClick={() => setNavOpen(false)}>{t('desktop.hy_nav_flow')}</a>
        <button
          type="button"
          className="hy-drawer__lang"
          onClick={() => {
            setNavOpen(false)
            setLangOpen(true)
          }}
        >
          <i className="fa-solid fa-language" /> {t('desktop.language_title')}
        </button>
        <Link to="/login" className="hy-solid" onClick={() => setNavOpen(false)}>
          {t('desktop.hy_hero_login')}
        </Link>
      </nav>

      <section className="hy-hero">
        <div className="hy-hero__glow hy-hero__glow--blue" aria-hidden />
        <div className="hy-hero__glow hy-hero__glow--gold" aria-hidden />
        <div className="hy-frame hy-hero__grid">
          <div className="hy-hero__copy">
            <p className="hy-kicker">
              <span className="hy-kicker__coin" aria-hidden />
              {t('desktop.hy_hero_kicker')}
            </p>
            <h1>{t('desktop.hy_hero_title')}</h1>
            <p className="hy-lead">{t('desktop.hy_hero_lead')}</p>
            <div className="hy-hero__actions">
              <Link to="/register" className="hy-solid">
                {t('desktop.hy_hero_start')}
                <i className="fa-solid fa-arrow-left" aria-hidden />
              </Link>
              <Link to="/login" className="hy-ghost hy-ghost--light">
                {t('auth.login_button')}
              </Link>
            </div>
            <p className="hy-note">{t('desktop.hy_hero_note')}</p>
          </div>

          <article className="hy-purse" aria-label={t('desktop.hy_purse_label')}>
            <header className="hy-purse__top">
              <img src={logoUrl} alt="" width={36} height={36} />
              <div>
                <strong>{t('desktop.hy_purse_label')}</strong>
                <small>{t('desktop.hy_row_note')}</small>
              </div>
              <em>{t('desktop.hy_currency')}</em>
            </header>
            <p className="hy-purse__balance">
              <span>{t('desktop.hy_balance_label')}</span>
              <b>{t('desktop.hy_balance_value')}</b>
            </p>
            <ul className="hy-chips">
              <li className="is-in">
                <i className="fa-solid fa-arrow-down" />
                <span>{t('desktop.hy_chip_in')}</span>
                <b>+3,000</b>
              </li>
              <li className="is-out">
                <i className="fa-solid fa-arrow-up" />
                <span>{t('desktop.hy_chip_out')}</span>
                <b>-270</b>
              </li>
              <li className="is-save">
                <i className="fa-solid fa-coins" />
                <span>{t('desktop.hy_chip_save')}</span>
                <b>+500</b>
              </li>
            </ul>
            <div className="hy-rows-window">
              <ul className="hy-rows hy-rows--flow">
                {[0, 1].map((copy) =>
                  ROWS.map((row, index) => (
                    <li
                      key={`${row.id}-${copy}`}
                      className={`is-${row.leaf}${leaf !== 'all' && leaf !== row.leaf ? ' is-dim' : ''}`}
                      style={{ animationDelay: `${index * 0.12}s` }}
                    >
                      <i className={row.icon} />
                      <span>
                        <strong>{t(`desktop.${row.name}`)}</strong>
                        <small>{t(`desktop.${row.meta}`)}</small>
                      </span>
                      <b>{row.amount}</b>
                    </li>
                  )),
                )}
              </ul>
            </div>
          </article>
        </div>
      </section>

      <ProductMarquee variant="home" />

      <section className="hy-section" id="ledger">
        <div className="hy-frame">
          <div className="hy-section__head">
            <p className="hy-kicker hy-kicker--ink">{t('desktop.hy_scene_kicker')}</p>
            <h2>{t('desktop.hy_scene_title')}</h2>
          </div>
          <div className="hy-leaves" role="list">
            <button
              type="button"
              className={`hy-leaf is-all${leaf === 'all' ? ' is-on' : ''}`}
              onClick={() => setLeaf('all')}
              aria-pressed={leaf === 'all'}
            >
              <i className="fa-solid fa-book-open" />
              <strong>{t('desktop.hy_mode_both')}</strong>
              <p>{t('desktop.hy_mode_both_desc')}</p>
            </button>
            {LEAVES.map((item) => (
              <button
                key={item.id}
                type="button"
                role="listitem"
                className={`hy-leaf is-${item.id}${leaf === item.id ? ' is-on' : ''}`}
                onClick={() => setLeaf(item.id)}
                aria-pressed={leaf === item.id}
              >
                <i className={item.icon} />
                <strong>{t(`desktop.${item.title}`)}</strong>
                <p>{t(`desktop.${item.desc}`)}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="hy-section hy-section--ink" id="pockets">
        <div className="hy-frame">
          <div className="hy-section__head">
            <p className="hy-kicker">{t('desktop.hy_cap_kicker')}</p>
            <h2>{t('desktop.hy_cap_title')}</h2>
          </div>
          <div className="hy-pockets">
            {POCKETS.map((item, index) => (
              <article key={item.title} className={`is-${item.tone}`}>
                <span>0{index + 1}</span>
                <i className={item.icon} />
                <h3>{t(`desktop.${item.title}`)}</h3>
                <p>{t(`desktop.${item.desc}`)}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="hy-section" id="start">
        <div className="hy-frame">
          <div className="hy-section__head">
            <p className="hy-kicker hy-kicker--ink">{t('desktop.hy_flow_kicker')}</p>
            <h2>{t('desktop.hy_flow_title')}</h2>
          </div>
          <ol className="hy-steps">
            {STEPS.map((step) => (
              <li key={step.title}>
                <span>{step.n}</span>
                <h3>{t(`desktop.${step.title}`)}</h3>
                <p>{t(`desktop.${step.desc}`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="hy-close">
        <div className="hy-frame hy-close__inner">
          <div>
            <p className="hy-kicker">{t('desktop.hy_free_kicker')}</p>
            <h2>{t('desktop.hy_free_title')}</h2>
            <p>{t('desktop.hy_free_desc')}</p>
          </div>
          <Link to="/register" className="hy-solid">
            {t('desktop.hy_hero_start')}
            <i className="fa-solid fa-arrow-left" aria-hidden />
          </Link>
        </div>
      </section>

      <footer className="hy-foot">
        <div className="hy-frame hy-foot__inner">
          <div className="hy-foot__brand">
            <img src={logoUrl} alt="" width={36} height={36} />
            <div>
              <strong>{t('desktop.app_name')}</strong>
              <p>{t('desktop.brand_slogan')}</p>
            </div>
          </div>
          <nav>
            <a href="https://ulanish.dev/terms" target="_blank" rel="noopener noreferrer">
              {t('desktop.terms')}
            </a>
            <a href="https://ulanish.dev/privacy" target="_blank" rel="noopener noreferrer">
              {t('desktop.policies')}
            </a>
          </nav>
          <UlanishFromCredit className="ulanish-from-credit--home" />
        </div>
      </footer>

      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} />
      <HamyanWhatsappFab />
    </div>
  )
}
