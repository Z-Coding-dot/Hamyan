import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { HeaderSearch } from '@/components/layout/HeaderSearch'
import { PageRefresh } from '@/components/PageRefresh'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { useIsMobileSidebar } from '@/hooks/useMediaQuery'
import { getPageTitleKey } from '@/lib/routes'
import { fetchNotifications } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { supportedLanguages, useLocaleStore, type SupportedLanguage } from '@/store/useLocaleStore'

const nativeLanguageNames: Record<SupportedLanguage, string> = {
  fa: 'دری',
  ps: 'پښتو',
  en: 'English',
}

function LanguagePicker() {
  const { t } = useTranslation()
  const language = useLocaleStore((s) => s.language)
  const setLanguage = useLocaleStore((s) => s.setLanguage)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!open) return
    rootRef.current?.querySelector<HTMLButtonElement>('[aria-selected="true"]')?.focus()
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !rootRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', dismiss)
    return () => document.removeEventListener('pointerdown', dismiss)
  }, [open])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      setOpen(false)
      triggerRef.current?.focus()
      return
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()
    if (!open) { setOpen(true); return }
    const options = Array.from(rootRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [])
    const current = options.indexOf(document.activeElement as HTMLButtonElement)
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1
      : (current + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length
    options[next]?.focus()
  }

  const selectLanguage = async (code: SupportedLanguage) => {
    if (pending) return
    setPending(true)
    try {
      if (code !== language) await setLanguage(code)
      setOpen(false)
      triggerRef.current?.focus()
    } finally { setPending(false) }
  }

  return (
    <div className="hy-language" ref={rootRef} onKeyDown={onKeyDown}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false) }}>
      <button ref={triggerRef} type="button" className={`hy-language__trigger${open ? ' is-open' : ''}`}
        onClick={() => setOpen((value) => !value)} aria-label={`${t('desktop.language_title')}: ${t(`desktop.language_${language}`)}`}
        title={t('desktop.language_title')} aria-haspopup="listbox" aria-expanded={open} aria-controls="header-language-options">
        <i className="fa-solid fa-globe" aria-hidden="true" />
        <span>{t(`desktop.language_${language}`)}</span>
        <i className="fa-solid fa-chevron-down hy-language__chevron" aria-hidden="true" />
      </button>
      {open && (
        <div className="hy-language__panel">
          <div className="hy-language__heading"><span>{t('desktop.choose_language')}</span><i className="fa-solid fa-language" aria-hidden="true" /></div>
          <div id="header-language-options" role="listbox" aria-label={t('desktop.language_title')} aria-busy={pending}>
            {supportedLanguages.map((code) => (
              <button key={code} type="button" role="option" aria-selected={language === code}
                tabIndex={language === code ? 0 : -1}
                className={`hy-language__option${language === code ? ' is-selected' : ''}`}
                aria-disabled={pending} onClick={() => void selectLanguage(code)}>
                <span className="hy-language__code" aria-hidden="true">{code.toUpperCase()}</span>
                <span className="hy-language__name"><strong lang={code} dir={code === 'en' ? 'ltr' : 'rtl'}>{nativeLanguageNames[code]}</strong>
                  {t(`desktop.language_${code}`) !== nativeLanguageNames[code] && <small>{t(`desktop.language_${code}`)}</small>}
                </span>
                <i className={`fa-solid ${language === code ? 'fa-circle-check' : 'fa-circle'} hy-language__check`} aria-hidden="true" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function AppPageBar() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user } = useAuthStore(useShallow((s) => ({ token: s.token, user: s.user })))
  const isMobile = useIsMobileSidebar()
  const profilePhotoUrl = useCachedAsset(user?.profile_photo_path)
  const displayName = [user?.name, user?.lastname].filter(Boolean).join(' ') || user?.email || t('desktop.nav_profile')
  const [hasUnread, setHasUnread] = useState(false)
  const notesActive = location.pathname === '/notifications'
  const showBack = location.pathname !== '/dashboard'
  const onBack = () => {
    if (typeof window.history.state?.idx === 'number' && window.history.state.idx > 0) navigate(-1)
    else navigate('/dashboard', { replace: true })
  }

  const loadUnread = useCallback(async () => {
    if (!token) return
    try {
      const data = await fetchNotifications(token)
      setHasUnread(Boolean(data.notReadNote))
    } catch {
      /* ignore */
    }
  }, [token])

  useEffect(() => {
    void loadUnread()
  }, [loadUnread, location.pathname])

  return (
    <header className={`hy-top-wrap${showBack ? ' hy-top-wrap--with-back' : ''}`}>
      <div className="hy-top">
        <div className="hy-top__context">
        {showBack && <button type="button" className="hy-top__back" onClick={onBack} aria-label={t('desktop.nav_back')} title={t('desktop.nav_back')}><i className={`fa-solid ${i18n.dir() === 'rtl' ? 'fa-arrow-right' : 'fa-arrow-left'}`} aria-hidden="true" /></button>}
        <div className="hy-top__heading">
          <span>{t('desktop.hy_personal_workspace')}</span>
          <h1 key={location.pathname}>{t(`desktop.${getPageTitleKey(location.pathname)}`)}</h1>
        </div>
        </div>
        <div className="hy-top__tools">
          <HeaderSearch />
          <PageRefresh inline />
          <LanguagePicker />
          <button
            type="button"
            className={`hy-top__btn${notesActive ? ' is-on' : ''}`}
            onClick={() => navigate('/notifications')}
            aria-label={t('desktop.nav_notifications')}
            title={t('desktop.nav_notifications')}
            aria-current={notesActive ? 'page' : undefined}
          >
            <i className="fa-regular fa-bell" aria-hidden="true" />
            {hasUnread ? <span className="hy-top__dot" /> : null}
          </button>
          {!isMobile && (
            <NavLink to="/profile" className={({ isActive }) => `hy-top__profile${isActive ? ' is-active' : ''}`}
              aria-label={`${t('desktop.nav_profile')}: ${displayName}`} title={`${displayName} · ${t('desktop.sidebar_personal_account')}`}>
              <span className="hy-top__profile-avatar" aria-hidden="true">
                {profilePhotoUrl ? <img src={profilePhotoUrl} alt="" /> : Array.from(displayName.trim())[0]}
              </span>
              <span className="hy-top__profile-copy"><strong><bdi>{displayName}</bdi></strong><small>{t('desktop.sidebar_personal_account')}</small></span>
            </NavLink>
          )}
        </div>
      </div>
    </header>
  )
}
