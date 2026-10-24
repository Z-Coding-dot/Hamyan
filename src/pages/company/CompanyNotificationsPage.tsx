import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { getApiErrorMessage } from '@/lib/auth'
import { formatAfghanDateValue } from '@/lib/datetime'
import { translateNote } from '@/lib/noteI18n'
import {
  fetchBusinessNotifications,
  markBusinessNotificationsRead,
  type UserNote,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

export function CompanyNotificationsPage() {
  const { t, i18n } = useTranslation()
  const { companyId = '' } = useParams()
  const token = useAuthStore(useShallow((s) => s.token))
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'

  const [notes, setNotes] = useState<UserNote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    if (!token || !companyId) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchBusinessNotifications(token, companyId)
      setNotes(data.notes ?? [])
    } catch (err) {
      setError(getApiErrorMessage(err))
      setNotes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [token, companyId])

  const onMarkAll = async () => {
    if (!token || !companyId) return
    await markBusinessNotificationsRead(token, companyId)
    await load()
  }

  return (
    <div className="dash-div party-page" dir="rtl">
      <div className="party-toolbar">
        <Link to={businessPath(companyId)} className="btn-secondary btn-sm">
          <i className="fa-solid fa-reply" /> {t('desktop.back')}
        </Link>
        <button type="button" className="btn-secondary btn-sm" onClick={() => void onMarkAll()}>
          {t('desktop.mark_all_read')}
        </button>
      </div>

      {error ? <div className="alert-error">{error}</div> : null}

      {loading ? (
        <p className="muted">{t('desktop.loading')}</p>
      ) : notes.length === 0 ? (
        <div className="party-empty">{t('desktop.no_notifications')}</div>
      ) : (
        <div className="activity-log-list">
          {notes.map((note) => {
            const localized = translateNote(note, t)
            return (
              <article
                key={note.id}
                className={`activity-log-card${note.unread || note.created_at === note.updated_at ? ' is-unread' : ''}`}
              >
                <div className="activity-log-summary">{localized.title}</div>
                {localized.body ? <div className="muted">{localized.body}</div> : null}
                <div className="activity-log-meta muted">
                  {formatAfghanDateValue(note.created_at, locale)}
                </div>
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
