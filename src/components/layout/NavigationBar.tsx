import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'

import { ToolbarDateTime } from '@/components/layout/ToolbarDateTime'
import { BrandLogo } from '@/components/BrandLogo'
import { useAppNavigation } from '@/hooks/useAppNavigation'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { localizeCompanyRoleTitle } from '@/lib/companyRoles'
import { translateNote } from '@/lib/noteI18n'
import { getPageTitleKey } from '@/lib/routes'
import {
  fetchBusinessNotifications,
  fetchNotifications,
  markBusinessNotificationsRead,
  markNotificationsRead,
  type UserNote,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useCompanyContextStore } from '@/store/useCompanyContextStore'
import { useRouteRefreshStore } from '@/store/useRouteRefreshStore'

const HEADER_LOGO_SIZE = 36

function ChromeHeaderLogo() {
  return (
    <span className="chrome-toolbar__header-logo" aria-hidden="true">
      <BrandLogo size={HEADER_LOGO_SIZE} className="hy-header-logo" />
    </span>
  )
}

export function NavigationBar() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { canBack, canForward, back, forward, refresh } = useAppNavigation()
  const isRtl = i18n.dir() === 'rtl'
  const isRefreshing = useRouteRefreshStore((state) => state.isRefreshing)

  const { token, user } = useAuthStore(
    useShallow((state) => ({
      token: state.token,
      user: state.user,
    })),
  )
  const activeBusiness = useCompanyContextStore((state) => state.activeBusiness)
  const isBusinessRoute = location.pathname.startsWith('/business/')
  const businessCompanyId = activeBusiness?.companyId || ''
  const businessLogoUrl = useCachedAsset(isBusinessRoute ? activeBusiness?.logo : null)
  const userAvatarUrl = useCachedAsset(!isBusinessRoute ? user?.profile_photo_path : null)

  const [notesOpen, setNotesOpen] = useState(false)
  const [notes, setNotes] = useState<UserNote[]>([])
  const [hasUnread, setHasUnread] = useState(false)
  const isAuthRoute = ['/login', '/register', '/forgot-password', '/reset-password'].some(
    (path) => location.pathname === path || location.pathname.startsWith(`${path}/`),
  )
  const isPublicGuestPath =
    location.pathname === '/help' ||
    location.pathname.startsWith('/help/')
  const isAuthenticated = Boolean(token) && !isAuthRoute
  const pageTitleKey = getPageTitleKey(location.pathname)
  const pageTitle = t(`desktop.${pageTitleKey}`)
  const omniboxBrand =
    isBusinessRoute && activeBusiness?.name ? activeBusiness.name : t('desktop.app_name')

  const loadNotes = useCallback(async () => {
    if (!token || isAuthRoute || isPublicGuestPath) return
    try {
      const data =
        isBusinessRoute && businessCompanyId
          ? await fetchBusinessNotifications(token, businessCompanyId)
          : await fetchNotifications(token)
      setNotes(data.notes ?? [])
      setHasUnread(Boolean(data.notReadNote))
    } catch {
      setNotes([])
      setHasUnread(false)
    }
  }, [token, isAuthRoute, isPublicGuestPath, isBusinessRoute, businessCompanyId])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes])

  const unreadCount = useMemo(
    () =>
      notes.filter(
        (note) =>
          note.unread ||
          (note.created_at && note.updated_at && note.created_at === note.updated_at),
      ).length,
    [notes],
  )

  const onRefresh = () => {
    if (isRefreshing) return
    refresh()
  }

  const onToggleNotes = async () => {
    const next = !notesOpen
    setNotesOpen(next)
    if (next) await loadNotes()
  }

  const onMarkAllRead = async () => {
    if (!token) return
    if (isBusinessRoute && businessCompanyId) {
      await markBusinessNotificationsRead(token, businessCompanyId)
    } else {
      await markNotificationsRead(token)
    }
    setHasUnread(false)
    await loadNotes()
  }

  const notificationsAllPath =
    isBusinessRoute && businessCompanyId
      ? `/business/${businessCompanyId}/notifications`
      : '/notifications'

  const notificationsTitle = isBusinessRoute
    ? t('desktop.business_notifications')
    : t('desktop.user_notifications')

  // User chrome only (not company workspace) — matches mobile #44.
  const showHeaderLogo = isAuthenticated && !isBusinessRoute

  return (
    <nav className="chrome-toolbar" aria-label={t('desktop.toolbar_aria')}>
      {showHeaderLogo && !isRtl ? (
        <ChromeHeaderLogo />
      ) : null}
      <div className="chrome-toolbar__nav">
        <button
          type="button"
          className="chrome-toolbar__nav-btn chrome-toolbar__nav-btn--history"
          onClick={back}
          disabled={!canBack}
          aria-label={t('desktop.nav_back')}
          title={t('desktop.nav_back')}
        >
          <i className={`fa-solid ${isRtl ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
        </button>
        <button
          type="button"
          className="chrome-toolbar__nav-btn chrome-toolbar__nav-btn--history"
          onClick={forward}
          disabled={!canForward}
          aria-label={t('desktop.nav_forward')}
          title={t('desktop.nav_forward')}
        >
          <i className={`fa-solid ${isRtl ? 'fa-chevron-left' : 'fa-chevron-right'}`} />
        </button>
        <button
          type="button"
          className={`chrome-toolbar__nav-btn${isRefreshing ? ' is-spinning' : ''}`}
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-busy={isRefreshing}
          aria-label={t('desktop.refresh')}
          title={t('desktop.refresh')}
        >
          <i className={`fa-solid fa-rotate-right${isRefreshing ? ' fa-spin' : ''}`} />
        </button>
      </div>

      <div className="chrome-toolbar__omnibox" title={`${pageTitle} — ${omniboxBrand}`}>
        <span
          className={`chrome-toolbar__omnibox-icon${
            businessLogoUrl || userAvatarUrl ? ' chrome-toolbar__omnibox-icon--image' : ''
          }`}
          aria-hidden="true"
        >
          {businessLogoUrl ? (
            <img src={businessLogoUrl} alt="" />
          ) : userAvatarUrl ? (
            <img src={userAvatarUrl} alt="" />
          ) : (
            <i className={`fa-solid ${isBusinessRoute ? 'fa-building' : 'fa-shield-halved'}`} />
          )}
        </span>
        <span className="chrome-toolbar__page-title">{pageTitle}</span>
        <span className="chrome-toolbar__page-sep" aria-hidden="true">
          —
        </span>
        <span className="chrome-toolbar__app-name">{omniboxBrand}</span>
      </div>

      <div className="chrome-toolbar__actions">
        {isBusinessRoute && activeBusiness ? (
          (() => {
            const roleLabel =
              localizeCompanyRoleTitle(activeBusiness.roleCode, t, activeBusiness.roleTitle) ||
              activeBusiness.roleTitle
            return roleLabel ? (
              <span className="chrome-toolbar__role" title={roleLabel}>
                <i className="fa-solid fa-user-shield" aria-hidden="true" />
                <span className="chrome-toolbar__role-text">{roleLabel}</span>
              </span>
            ) : null
          })()
        ) : null}
        <ToolbarDateTime />
        {isAuthenticated ? (
          <div className="chrome-toolbar__notifications">
            <button
              type="button"
              className={`chrome-toolbar__action-btn${hasUnread ? ' has-badge' : ''}`}
              onClick={() => void onToggleNotes()}
              aria-label={t('desktop.nav_notifications')}
              title={t('desktop.nav_notifications')}
            >
              <i className="fa-regular fa-bell" />
              {hasUnread ? (
                <span className="chrome-toolbar__badge">{unreadCount || ''}</span>
              ) : null}
            </button>

            {notesOpen ? (
              <div className="chrome-toolbar__notes-panel">
                <div className="chrome-toolbar__notes-head">
                  <strong>{notificationsTitle}</strong>
                  <button type="button" className="btn-link" onClick={() => void onMarkAllRead()}>
                    {t('desktop.mark_all_read')}
                  </button>
                </div>
                {notes.length === 0 ? (
                  <p className="muted">{t('desktop.no_notifications')}</p>
                ) : (
                  <ul className="chrome-toolbar__notes-list">
                    {notes.map((note) => {
                      const localized = translateNote(note, t)
                      return (
                        <li key={note.id}>
                          <strong>{localized.title}</strong>
                          {localized.body ? <p>{localized.body}</p> : null}
                        </li>
                      )
                    })}
                  </ul>
                )}
                <button
                  type="button"
                  className="btn-link"
                  onClick={() => {
                    setNotesOpen(false)
                    navigate(notificationsAllPath)
                  }}
                >
                  {t('desktop.view_all_notifications')}
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      {showHeaderLogo && isRtl ? (
        <ChromeHeaderLogo />
      ) : null}
    </nav>
  )
}
