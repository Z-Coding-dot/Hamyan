import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { EditIdentityModal } from '@/components/profile/EditIdentityModal'
import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { getApiErrorMessage } from '@/lib/auth'
import {
  requestProfileReview,
  type UserProfileKyc,
} from '@/lib/user'
import { loadUserCacheBundle, useAppCacheStore } from '@/store/useAppCacheStore'

type Props = {
  token: string
  userKey: string
  initialProfile?: UserProfileKyc | null
}

function statusLabel(
  status: string | null | undefined,
  t: (key: string) => string,
): string {
  if (status === 'approved') return t('desktop.status_approved')
  if (status === 'rejected') return t('desktop.status_rejected')
  if (status === 'requested') return t('desktop.status_requested')
  return t('desktop.status_pending')
}

function statusClass(status: string | null | undefined): string {
  if (status === 'approved') return 'profile-badge profile-badge--success'
  if (status === 'rejected') return 'profile-badge profile-badge--danger'
  return 'profile-badge profile-badge--warning'
}

export function IdentityCard({ token, userKey, initialProfile }: Props) {
  const { t } = useTranslation()
  const cachedKyc = useAppCacheStore((state) => state.getKyc(userKey))
  const refreshKyc = useAppCacheStore((state) => state.refreshKyc)
  const setKyc = useAppCacheStore((state) => state.setKyc)

  const [profile, setProfile] = useState<UserProfileKyc | null>(cachedKyc ?? initialProfile ?? null)
  const [editOpen, setEditOpen] = useState(false)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [reviewBusy, setReviewBusy] = useState(false)
  const [reviewError, setReviewError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    void loadUserCacheBundle(userKey).then((bundle) => {
      if (!active || !bundle?.kyc) return
      setProfile(bundle.kyc)
    })
    return () => {
      active = false
    }
  }, [userKey])

  useEffect(() => {
    if (cachedKyc) {
      setProfile(cachedKyc)
    } else if (initialProfile) {
      setProfile(initialProfile)
    }
  }, [cachedKyc, initialProfile])

  const load = useCallback(async () => {
    const next = await refreshKyc(token, userKey)
    if (next) setProfile(next)
  }, [token, userKey, refreshKyc])

  useEffect(() => {
    void load()
  }, [load])

  const frontUrl = useCachedAsset(profile?.id_scan_front)
  const backUrl = useCachedAsset(profile?.id_scan_back)

  if (!profile) {
    return (
      <div className="content-small">
        <p className="muted" style={{ textAlign: 'center' }}>
          {t('desktop.loading')}
        </p>
      </div>
    )
  }

  const whatsappDone = profile.whatsapp_number ? 1 : 0
  const idNumberDone = profile.identity_number ? 1 : 0
  const scanFrontDone = profile.id_scan_front ? 1 : 0
  const scanBackDone = profile.id_scan_back ? 1 : 0
  const totalDone = whatsappDone + idNumberDone + scanFrontDone + scanBackDone
  const progress = totalDone * 25
  const canEdit = profile.status !== 'approved'
  const canRequestReview = totalDone === 4 && profile.status === 'pending'

  const onRequestReview = async () => {
    setReviewBusy(true)
    setReviewError(null)
    try {
      const next = await requestProfileReview(token)
      await setKyc(userKey, next)
      setProfile(next)
      showSuccessToast(t('desktop.request_sent'))
      setReviewOpen(false)
    } catch (err) {
      setReviewError(getApiErrorMessage(err))
    } finally {
      setReviewBusy(false)
    }
  }

  return (
    <div className="content-small">
      <h5>{t('desktop.identity_details')}</h5>

      <div className="profile-progress">
        <div
          className={`profile-progress__bar ${profile.status === 'approved' ? 'is-success' : 'is-warning'}`}
          style={{ width: `${progress}%` }}
        >
          {progress}%
        </div>
      </div>

      <div className="pdetail">
        {t('desktop.whatsapp_number')}: {profile.whatsapp_number || '---'}
      </div>
      <div className="pdetail">
        {t('desktop.identity_number')}: {profile.identity_number || '---'}
      </div>
      <div className="pdetail">
        {t('desktop.status')}:{' '}
        <span className={statusClass(profile.status)}>{statusLabel(profile.status, t)}</span>
      </div>

      <div className="profile-scan-grid">
        <div className="profile-scan-card">
          <div className="profile-scan-card__label">{t('desktop.id_scan_front')}</div>
          {frontUrl ? (
            <a href={frontUrl} target="_blank" rel="noreferrer">
              <img src={frontUrl} alt={t('desktop.id_scan_front')} />
            </a>
          ) : (
            <div className="profile-scan-card__empty">{t('desktop.no_image')}</div>
          )}
        </div>
        <div className="profile-scan-card">
          <div className="profile-scan-card__label">{t('desktop.id_scan_back')}</div>
          {backUrl ? (
            <a href={backUrl} target="_blank" rel="noreferrer">
              <img src={backUrl} alt={t('desktop.id_scan_back')} />
            </a>
          ) : (
            <div className="profile-scan-card__empty">{t('desktop.no_image')}</div>
          )}
        </div>
      </div>

      {canEdit ? (
        <div className="profile-card-actions">
          <button type="button" className="btn-primary" onClick={() => setEditOpen(true)}>
            {t('desktop.edit')}
          </button>
          {canRequestReview ? (
            <button type="button" className="btn-secondary" onClick={() => setReviewOpen(true)}>
              {t('desktop.request_review')}
            </button>
          ) : null}
        </div>
      ) : null}

      <EditIdentityModal
        open={editOpen}
        token={token}
        profile={profile}
        onClose={() => setEditOpen(false)}
        onUpdated={() => void load()}
      />

      <Modal
        open={reviewOpen}
        onClose={() => setReviewOpen(false)}
        title={t('desktop.confirm_request_review_title')}
      >
        <p>{t('desktop.confirm_request_review_note')}</p>
        {reviewError ? <div className="alert-error">{reviewError}</div> : null}
        <div className="profile-card-actions">
          <button
            type="button"
            className="btn-primary"
            disabled={reviewBusy}
            onClick={() => void onRequestReview()}
          >
            {reviewBusy ? t('desktop.processing') : t('desktop.send_request')}
          </button>
        </div>
      </Modal>
    </div>
  )
}
