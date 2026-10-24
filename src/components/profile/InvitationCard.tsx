import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { ProfileUser } from '@/lib/user'

type Props = {
  user: ProfileUser
}

export function InvitationCard({ user }: Props) {
  const { t } = useTranslation()
  const [linkCopied, setLinkCopied] = useState(false)
  const [userIdCopied, setUserIdCopied] = useState(false)

  const userId = user.user_id ? String(user.user_id) : ''
  const publicProfileLink = `https://ishanch.com/community/${userId}`
  const invitationLink = `https://ishanch.com/register?ref=${userId}`
  const invitationMessage = t('desktop.invitation_message').replace(':link', invitationLink)

  const copyUserId = async () => {
    if (!userId) return
    try {
      await navigator.clipboard.writeText(userId)
      setUserIdCopied(true)
      window.setTimeout(() => setUserIdCopied(false), 1800)
    } catch {
      setUserIdCopied(false)
    }
  }

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(invitationMessage)
      setLinkCopied(true)
      window.setTimeout(() => setLinkCopied(false), 2000)
    } catch {
      setLinkCopied(false)
    }
  }

  return (
    <div className="content-small">
      <div className="pdetail" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
        <span>
          {t('desktop.user_id')}: {userId || '-'}
        </span>
        <button
          type="button"
          className="btn-ghost"
          style={{ padding: '6px 10px' }}
          onClick={() => void copyUserId()}
          disabled={!userId}
          title={userIdCopied ? t('desktop.copied') : t('desktop.copy_user_id')}
        >
          <i className={`fa-solid ${userIdCopied ? 'fa-check' : 'fa-copy'}`} />
        </button>
      </div>

      <div className="profile-invite-note">{t('desktop.public_user_id_note')}</div>

      <div className="first-color" style={{ color: '#1463F3' }}>
        <h5 style={{ textAlign: 'start', marginBottom: 8 }}>{t('desktop.your_invite_link')}</h5>
      </div>
      <div className="profile-invite-link">{invitationLink}</div>

      <div className="profile-invite-actions">
        <button type="button" className="btn-primary" onClick={() => void copyInvite()}>
          <i className="fa-regular fa-copy" />
          {t('desktop.copy_invite_link')}
        </button>
        <a
          href={publicProfileLink}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary"
          style={{ textDecoration: 'none' }}
        >
          {t('desktop.visit_public_profile')}
        </a>
      </div>

      {linkCopied ? <div className="profile-copied-toast">{t('desktop.copied_success')}</div> : null}
    </div>
  )
}
