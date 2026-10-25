import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import { formatAfghanDateValue } from '@/lib/datetime'
import { translateNote } from '@/lib/noteI18n'
import { fetchNotifications, markNotificationsRead, type UserNote } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'

function isUnread(note: UserNote) {
  return Boolean(note.unread || (note.created_at && note.updated_at && note.created_at === note.updated_at))
}

export function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const token = useAuthStore(useShallow((state) => state.token))
  const locale = (i18n.language?.startsWith('ps') ? 'ps' : i18n.language?.startsWith('en') ? 'en' : 'fa') as 'fa' | 'ps' | 'en'
  const [notes, setNotes] = useState<UserNote[]>([])
  const [loading, setLoading] = useState(true)
  const [marking, setMarking] = useState(false)
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const unreadCount = notes.filter(isUnread).length
  const visibleNotes = unreadOnly ? notes.filter(isUnread) : notes

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchNotifications(token)
      setNotes(data.notes ?? [])
    } catch (err) { setError(getApiErrorMessage(err)) }
    finally { setLoading(false) }
  }
  useEffect(() => { void load() }, [token])

  const onMarkAll = async () => {
    if (!token || marking) return
    setMarking(true)
    setError(null)
    try { await markNotificationsRead(token); await load() }
    catch (err) { setError(getApiErrorMessage(err)) }
    finally { setMarking(false) }
  }

  return (
    <div className="hy-ledger hy-notifications">
      <header className="hy-ledger__head">
        <div><span className="hy-ledger__eyebrow">{t('desktop.hy_account_space')}</span><h2>{t('desktop.user_notifications')}</h2><p>{t('desktop.hy_notifications_desc')}</p></div>
        <button type="button" className="btn-secondary hy-options-action" onClick={() => void onMarkAll()} disabled={marking || loading || unreadCount === 0}><i className={`fa-solid ${marking ? 'fa-circle-notch fa-spin' : 'fa-check-double'}`} aria-hidden="true" />{t('desktop.mark_all_read')}</button>
      </header>
      {error && <div className="alert-error" role="alert">{error}</div>}
      <section className="hy-options-panel">
        <div className="hy-notifications__toolbar" role="group" aria-label={t('desktop.user_notifications')}>
          <button type="button" aria-pressed={!unreadOnly} className={!unreadOnly ? 'is-active' : ''} onClick={() => setUnreadOnly(false)}>{t('desktop.all')}<span>{notes.length}</span></button>
          <button type="button" aria-pressed={unreadOnly} className={unreadOnly ? 'is-active' : ''} onClick={() => setUnreadOnly(true)}>{t('desktop.hy_unread')}<span>{unreadCount}</span></button>
        </div>
        {loading ? <div className="hy-ledger__empty" role="status"><i className="fa-solid fa-circle-notch fa-spin" aria-hidden="true" /><p>{t('desktop.loading')}</p></div>
          : visibleNotes.length === 0 ? <div className="hy-ledger__empty"><i className="fa-regular fa-bell-slash" aria-hidden="true" /><p>{t(unreadOnly ? 'desktop.hy_no_unread' : 'desktop.no_notifications')}</p></div>
          : <ul className="hy-notifications__list">{visibleNotes.map((note) => {
            const localized = translateNote(note, t)
            const unread = isUnread(note)
            return <li key={note.id} className={unread ? 'is-unread' : ''}>
              <span className="hy-notifications__icon" aria-hidden="true"><i className="fa-regular fa-bell" /></span>
              <div><div className="hy-notifications__title"><strong>{localized.title}</strong>{unread && <span className="hy-notifications__dot" role="img" aria-label={t('desktop.hy_unread')} />}</div>{localized.body && <p>{localized.body}</p>}<time dateTime={note.created_at || undefined}>{formatAfghanDateValue(note.created_at, locale)}</time></div>
            </li>
          })}</ul>}
      </section>
    </div>
  )
}
