import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { IdentityCard } from '@/components/profile/IdentityCard'
import { UpdateInfoModal } from '@/components/profile/UpdateInfoModal'
import { UpdatePhotoModal } from '@/components/profile/UpdatePhotoModal'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { useCachedProfilePage } from '@/hooks/useCachedProfilePage'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { openExternalUrl } from '@/lib/whatsapp'
import { useAppCacheStore } from '@/store/useAppCacheStore'
import { useAuthStore } from '@/store/useAuthStore'

const AVATAR_PLACEHOLDER = (
  <svg height="120px" viewBox="0 -960 960 960" width="120px" fill="#5f636830" aria-hidden="true">
    <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
  </svg>
)

export function ProfilePage() {
  const { t } = useTranslation()
  const userKey = useUserCacheKey()
  const refreshCurrentUser = useAuthStore(useShallow((state) => state.refreshCurrentUser))
  const {
    token,
    user,
    photoPath,
    error,
    isSyncing,
    hasShell,
    updateLocalInfo,
    updateLocalPhoto,
  } = useCachedProfilePage()

  const [photoModalOpen, setPhotoModalOpen] = useState(false)
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const photoUrl = useCachedAsset(photoPath)

  if (!token) return null

  if (!hasShell || !user) {
    return (
      <div className="profile-page hy-ledger hy-profile-page">
        {error ? <div className="alert-error">{error}</div> : null}
        <p className="muted">{t('desktop.loading')}</p>
      </div>
    )
  }

  return (
    <div className="profile-page hy-ledger hy-profile-page">
      <header className="hy-ledger__head">
        <div>
          <span className="hy-ledger__eyebrow">{t('desktop.hy_account_space')}</span>
          <h2>{t('desktop.nav_profile')}</h2>
          <p>{t('desktop.profile_ulanish_account')}</p>
        </div>
      </header>
      {isSyncing ? (
        <div className="page-sync-indicator">
          <i className="fa-solid fa-rotate-right fa-spin" />
          <span>{t('desktop.syncing')}</span>
        </div>
      ) : null}

      {error ? <div className="alert-error">{error}</div> : null}

      <section className="hy-profile-hero">
        <div className="hy-profile-hero__cover" aria-hidden="true"><span /><span /></div>
        <div className="hy-profile-hero__body">
          <div className="profile-photo">
            {photoUrl ? <img key={photoPath} src={photoUrl} alt={t('desktop.profile_photo')} /> : AVATAR_PLACEHOLDER}
            <button type="button" className="profile-edit-btn" onClick={() => setPhotoModalOpen(true)} aria-label={t('desktop.update_profile_photo')}><i className="fa-solid fa-camera" aria-hidden="true" /></button>
          </div>
          <div className="hy-profile-hero__identity">
            <span className="hy-profile-hero__badge">{t('desktop.sidebar_personal_account')}</span>
            <h3><bdi>{[user.name, user.lastname].filter(Boolean).join(' ') || user.email}</bdi></h3>
            <p><bdi>{user.email}</bdi></p>
          </div>
          <button type="button" className="btn-secondary hy-options-action" onClick={() => setInfoModalOpen(true)}><i className="fa-regular fa-pen-to-square" aria-hidden="true" />{t('desktop.update_profile_info')}</button>
        </div>
        <div className="hy-profile-hero__note"><i className="fa-solid fa-link" aria-hidden="true" /><p>{t('desktop.profile_edit_on_ulanish')} <button type="button" className="auth-link" onClick={() => openExternalUrl('https://ulanish.dev')}>ulanish.dev</button></p></div>
      </section>

      <div className="profile-grid">
        <IdentityCard token={token} userKey={userKey} initialProfile={user.profile} />
      </div>

      <UpdatePhotoModal
        open={photoModalOpen}
        token={token}
        onClose={() => setPhotoModalOpen(false)}
        onUpdated={(newPath) => {
          const path = newPath.trim()
          if (!path) return
          void updateLocalPhoto(path)
          void useAppCacheStore.getState().refreshProfile(token, userKey)
          void refreshCurrentUser()
        }}
      />

      <UpdateInfoModal
        open={infoModalOpen}
        token={token}
        user={user}
        onClose={() => setInfoModalOpen(false)}
        onUpdated={(payload) => {
          void updateLocalInfo(payload)
          void refreshCurrentUser()
        }}
      />
    </div>
  )
}
