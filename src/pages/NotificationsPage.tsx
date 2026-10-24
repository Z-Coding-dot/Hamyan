import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import { formatAfghanDateValue } from '@/lib/datetime'
import { translateNote } from '@/lib/noteI18n'
import { fetchNotifications, markNotificationsRead, type UserNote } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'

export function NotificationsPage() {
  const { t, i18n } = useTranslation()
  const { token } = useAuthStore(useShallow((state) => ({ token: state.token })))
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [notes, setNotes] = useState<UserNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchNotifications(token)
      setNotes(data.notes ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token])

  const onMarkAll = async () => {
    if (!token) return
    await markNotificationsRead(token)
    await load()
  }

  return (
    <div>
      <section className="page-header">
        <button type="button" className="btn-secondary" onClick={() => void onMarkAll()}>
          {t('desktop.mark_all_read')}
        </button>
      </section>

      {error ? <div className="alert-error">{error}</div> : null}

      <section className="page-card">
        {loading ? (
          <p className="muted">{t('desktop.loading')}</p>
        ) : notes.length === 0 ? (
          <p className="empty-state">{t('desktop.no_notifications')}</p>
        ) : (
          <ul className="company-list">
            {notes.map((note) => {
              const localized = translateNote(note, t)
              return (
                <li key={note.id} className={note.unread || note.created_at === note.updated_at ? 'is-unread' : ''}>
                  <div>
                    <strong>{localized.title}</strong>
                    {localized.body ? <p className="muted">{localized.body}</p> : null}
                  </div>
                  <span className="muted" dir="ltr">
                    {formatAfghanDateValue(note.created_at, locale)}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
