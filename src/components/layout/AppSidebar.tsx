import { useEffect, useRef, useState } from 'react'
import { m, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { NavLink, useLocation } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { BrandLogo } from '@/components/BrandLogo'
import { LanguageModal } from '@/components/LanguageModal'
import { HeaderSearch } from '@/components/layout/HeaderSearch'
import { PageRefresh } from '@/components/PageRefresh'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { useIsMobileSidebar } from '@/hooks/useMediaQuery'
import { prefetchCachedAssets } from '@/lib/mediaCache'
import { useAuthStore } from '@/store/useAuthStore'
import { useSidebarStore } from '@/store/useSidebarStore'
import { useLocaleStore } from '@/store/useLocaleStore'

type SidebarTabProps = { to: string; icon: string; label: string; end?: boolean }

function SidebarTab({ to, icon, label, end }: SidebarTabProps) {
  return (
    <NavLink to={to} end={end} title={label} className={({ isActive }) => `hy-side-link${isActive ? ' is-active' : ''}`}>
      <i className={`fa-solid ${icon}`} aria-hidden="true" />
      <span className="hy-side-label">{label}</span>
      <span className="hy-side-link__dot" aria-hidden="true" />
    </NavLink>
  )
}

export function AppSidebar() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const isMobile = useIsMobileSidebar()
  const reduceMotion = useReducedMotion()
  const [languageOpen, setLanguageOpen] = useState(false)
  const language = useLocaleStore((s) => s.language)
  const isOpen = useSidebarStore((s) => s.isOpen)
  const toggle = useSidebarStore((s) => s.toggle)
  const close = useSidebarStore((s) => s.close)
  const sidebarRef = useRef<HTMLElement>(null)
  const { user, logout, isLoading } = useAuthStore(
    useShallow((state) => ({ user: state.user, logout: state.logout, isLoading: state.isLoading })),
  )
  const displayName = [user?.name, user?.lastname].filter(Boolean).join(' ') || user?.email || t('desktop.nav_profile')
  const profilePhotoUrl = useCachedAsset(user?.profile_photo_path)
  const collapsed = !isMobile && !isOpen
  const toggleLabel = isMobile
    ? t('desktop.sidebar_close')
    : collapsed ? t('desktop.hy_sidebar_expand') : t('desktop.hy_sidebar_collapse')
  const toggleIcon = isMobile
    ? 'fa-xmark'
    : (i18n.dir() === 'rtl') !== collapsed ? 'fa-angles-right' : 'fa-angles-left'

  useEffect(() => {
    prefetchCachedAssets([user?.profile_photo_path])
  }, [user?.profile_photo_path])

  // The mobile drawer traps focus, closes on Escape, and returns focus to its opener.
  useEffect(() => {
    if (!isMobile || !isOpen) return
    const previousFocus = document.activeElement as HTMLElement | null
    const sidebar = sidebarRef.current
    sidebar?.querySelector<HTMLButtonElement>('button')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof Node && !sidebar?.contains(event.target)) return
      if (event.target instanceof Element && event.target.closest('.hy-search')) return
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
      if (event.key !== 'Tab' || !sidebar) return
      const focusable = Array.from(sidebar.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [isMobile, isOpen, close])

  return (
    <m.aside ref={sidebarRef} id="app-sidebar" className={`sidebar sidebar--desktop hy-sidebar${isMobile ? ' hy-profile-hub' : ''}`}
      initial={false} animate={{ y: isMobile && !isOpen ? '105%' : 0 }} transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 340, damping: 36 }}
      aria-label={t('desktop.hy_primary_navigation')} role={isMobile ? 'dialog' : undefined}
      aria-modal={isMobile && isOpen ? true : undefined} inert={isMobile && !isOpen}>
      <div className="hy-sidebar__head">
        {isMobile ? <h2>{t('desktop.hy_mobile_account_menu')}</h2> : !collapsed && (
          <div className="hy-sidebar__brand">
            <span aria-hidden="true"><BrandLogo size={36} /></span>
            <span><strong>{t('desktop.app_name')}</strong><small>{t('desktop.hy_personal_workspace')}</small></span>
          </div>
        )}
        <button type="button" className={collapsed ? 'hy-sidebar__logo-toggle' : 'hy-sidebar__toggle'} onClick={toggle} aria-label={toggleLabel} title={toggleLabel} aria-expanded={isOpen} aria-controls="sidebar-navigation">
          {collapsed && <span className="hy-sidebar__logo-rest" aria-hidden="true"><BrandLogo size={36} /></span>}
          <i className={`fa-solid ${toggleIcon}`} aria-hidden="true" />
        </button>
      </div>
      <nav id="sidebar-navigation" className="hy-sidebar__nav" aria-label={t('desktop.hy_primary_navigation')} onClick={(event) => { if (isMobile && (event.target as HTMLElement).closest('a[href]')) close() }}>
        {isMobile && <>
          <NavLink to="/profile" className="hy-profile-hub__identity">
            <span className="hy-sidebar__avatar" aria-hidden="true">{profilePhotoUrl ? <img src={profilePhotoUrl} alt="" /> : Array.from(displayName.trim())[0]}</span>
            <span><strong><bdi>{displayName}</bdi></strong><small>{t('desktop.sidebar_personal_account')}</small></span>
            <i className={`fa-solid ${i18n.dir() === 'rtl' ? 'fa-chevron-left' : 'fa-chevron-right'}`} aria-hidden="true" />
          </NavLink>
          <div className="hy-sidebar__group hy-profile-hub__preferences">
            <p className="hy-sidebar__caption">{t('desktop.hy_account_space')}</p>
            <SidebarTab to="/notifications" icon="fa-bell" label={t('desktop.nav_notifications')} />
            <button type="button" className="hy-side-link" onClick={() => setLanguageOpen(true)}><i className="fa-solid fa-language" aria-hidden="true" /><span>{t('desktop.language_title')}</span><small>{t(`desktop.language_${language}`)}</small></button>
            <div className="hy-profile-hub__tool"><HeaderSearch /><PageRefresh inline showLabel /></div>
          </div>
        </>}
        <div className="hy-sidebar__group">
          <p className="hy-sidebar__caption"><span>{t('desktop.hy_overview')}</span></p>
          {!isMobile && <SidebarTab to="/dashboard" icon="fa-table-columns" label={t('desktop.nav_dashboard')} end />}
          {!isMobile && <SidebarTab to="/counterparties" icon="fa-user-group" label={t('desktop.nav_counterparties')} end={location.pathname === '/counterparties/transactions'} />}
          <SidebarTab to="/counterparties/transactions" icon="fa-right-left" label={t('desktop.counterparty_transactions')} />
        </div>
        <div className="hy-sidebar__group">
          <p className="hy-sidebar__caption"><span>{t('desktop.hy_finances')}</span></p>
          <SidebarTab to="/accounts" icon="fa-wallet" label={t('desktop.hy_accounts_title')} />
          {!isMobile && <SidebarTab to="/incomes" icon="fa-arrow-down" label={t('desktop.hy_incomes_page')} />}
          {!isMobile && <SidebarTab to="/expenses" icon="fa-receipt" label={t('desktop.expenses_page')} />}
          <SidebarTab to="/expense-analysis" icon="fa-chart-pie" label={t('desktop.expense_analysis')} />
        </div>
        <div className="hy-sidebar__group">
          <p className="hy-sidebar__caption"><span>{t('desktop.other_options')}</span></p>
          <SidebarTab to="/premium" icon="fa-crown" label={t('desktop.nav_premium')} />
          <SidebarTab to="/settings" icon="fa-gear" label={t('desktop.nav_settings')} />
          <SidebarTab to="/guide" icon="fa-book-open" label={t('desktop.hy_guide_page')} />
          <SidebarTab to="/help" icon="fa-circle-question" label={t('desktop.help_center')} />
        </div>
      </nav>
      <div className="hy-sidebar__footer">
        <button type="button" className="hy-side-link hy-sidebar__logout" onClick={() => void logout()} disabled={isLoading} title={t('desktop.logout')}>
          <i className="fa-solid fa-arrow-right-from-bracket" aria-hidden="true" /><span className="hy-side-label">{t('desktop.logout')}</span>
        </button>
      </div>
      <LanguageModal open={languageOpen} onClose={() => setLanguageOpen(false)} />
    </m.aside>
  )
}
