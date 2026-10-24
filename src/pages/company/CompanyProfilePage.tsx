import { FormEvent, useCallback, useEffect, useState } from 'react'
import { Link, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useDropzone } from 'react-dropzone'
import Cropper, { type Area } from 'react-easy-crop'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { CompanyPublicIdCard } from '@/components/company/CompanyPublicIdCard'
import { getApiErrorMessage } from '@/lib/auth'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import {
  fetchBusinessProfile,
  updateBusinessCompanyProfile,
  updateBusinessLogo,
  updateBusinessName,
  updateBusinessSlug,
  type BusinessCompanyProfile,
  type BusinessShowData,
} from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { useAppCacheStore } from '@/store/useAppCacheStore'
import { useUserCacheKey } from '@/hooks/useUserCacheKey'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = {
  business: BusinessShowData
  setBusiness: (data: BusinessShowData) => void
}

const AVATAR_PLACEHOLDER = (
  <svg height="120" viewBox="0 -960 960 960" width="120" fill="#5f636830" aria-hidden>
    <path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z" />
  </svg>
)

function asProfile(value: unknown): BusinessCompanyProfile {
  return (value && typeof value === 'object' ? value : {}) as BusinessCompanyProfile
}

async function cropImageToBlob(imageSrc: string, crop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = imageSrc
  })
  const canvas = document.createElement('canvas')
  canvas.width = crop.width
  canvas.height = crop.height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('blob'))), 'image/jpeg', 0.92)
  })
}

export function CompanyProfilePage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const { business, setBusiness } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const userKey = useUserCacheKey()
  const patchCompanyCache = useAppCacheStore((state) => state.patchCompany)
  const canEdit = Boolean(business.permissions?.canViewBusinessSettings)

  const [companyName, setCompanyName] = useState(business.company.name)
  const [companySlug, setCompanySlug] = useState(business.company.slug || '')
  const [companyLogo, setCompanyLogo] = useState(business.company.logo || '')
  const [profile, setProfile] = useState<BusinessCompanyProfile>(asProfile(business.profile))
  const [validUpTo, setValidUpTo] = useState(business.valid_up_to || business.company.valid_up_to || null)
  const [copied, setCopied] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [photoOpen, setPhotoOpen] = useState(false)
  const [nameOpen, setNameOpen] = useState(false)
  const [slugOpen, setSlugOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  const logoUrl = useCachedAsset(companyLogo)
  const websiteUrl = companySlug
    ? `${window.location.origin}/c/${companySlug}`
    : ''

  useEffect(() => {
    if (!token || !companyId) return
    void fetchBusinessProfile(token, companyId)
      .then((data) => {
        setCompanyName(data.company.name)
        setCompanySlug(data.company.slug || '')
        setCompanyLogo(data.company.logo || '')
        setProfile(asProfile(data.profile))
        setValidUpTo(data.valid_up_to ?? data.company.valid_up_to ?? null)
        setBusiness({
          ...business,
          ...data,
          company: { ...business.company, ...data.company },
          profile: data.profile,
          is_active: data.is_active,
          valid_up_to: data.valid_up_to,
        })
      })
      .catch((err) => setLoadError(getApiErrorMessage(err)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, companyId])

  const copyLink = async () => {
    if (!websiteUrl) return
    try {
      await navigator.clipboard.writeText(websiteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const patchCompanyLocal = (patch: Partial<BusinessShowData['company']>) => {
    setBusiness({
      ...business,
      company: { ...business.company, ...patch },
      valid_up_to: validUpTo,
    })
    if (patch.logo !== undefined || patch.name !== undefined) {
      void patchCompanyCache(userKey, companyId, {
        ...(patch.logo !== undefined ? { logo: patch.logo } : {}),
        ...(patch.name !== undefined ? { name: patch.name } : {}),
      })
    }
  }

  return (
    <div className="dash-div company-profile-page" dir="rtl">
      <div className="dash-header dash-header--section mb-2">
        <h5 className="mb-0">
          {t('desktop.business_profile')} <span>{companyName}</span>
        </h5>
      </div>

      {loadError ? <div className="alert-error">{loadError}</div> : null}

      <div className="profile">
        <div className="profile-info">
          <div className="profile-photo">
            {logoUrl ? <img src={logoUrl} alt={companyName} /> : AVATAR_PLACEHOLDER}
          </div>
          {canEdit ? (
            <button
              type="button"
              className="profile-edit-btn"
              onClick={() => setPhotoOpen(true)}
              aria-label={t('desktop.update_logo')}
            >
              <i className="fa-regular fa-pen-to-square" />
            </button>
          ) : null}
        </div>
        <div className="profile-details">
          <div className="pdetail company-profile-row">
            <span>
              {t('desktop.name')}: {companyName}
            </span>
            {canEdit ? (
              <button type="button" className="profile-pen" onClick={() => setNameOpen(true)}>
                <i className="fa-regular fa-pen-to-square" />
              </button>
            ) : null}
          </div>
          <div className="pdetail company-profile-row">
            <span>
              <strong>{t('desktop.username')}:</strong>{' '}
              {companySlug?.trim() ? companySlug.trim() : t('desktop.not_assigned')}
            </span>
            {canEdit && !companySlug?.trim() ? (
              <button type="button" className="profile-pen" onClick={() => setSlugOpen(true)}>
                <i className="fa-regular fa-pen-to-square" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <CompanyPublicIdCard companyId={companyId} />

      <div className="content-small company-profile-card">
        <h5>
          {t('desktop.company_info')} {companyName}
        </h5>
        <div className="company-profile-fields">
          {profile.name_dari ? (
            <div className="company-profile-field">
              <strong>{t('desktop.name_dari')}:</strong> {profile.name_dari}
            </div>
          ) : null}
          {profile.name_pashto ? (
            <div className="company-profile-field">
              <strong>{t('desktop.name_pashto')}:</strong> {profile.name_pashto}
            </div>
          ) : null}
          {profile.name_uzbek ? (
            <div className="company-profile-field">
              <strong>{t('desktop.name_uzbek')}:</strong> {profile.name_uzbek}
            </div>
          ) : null}
          {profile.name_english ? (
            <div className="company-profile-field">
              <strong>{t('desktop.name_english')}:</strong> {profile.name_english}
            </div>
          ) : null}
          {profile.slogan ? (
            <div className="company-profile-field">
              <strong>{t('desktop.company_slogan')}:</strong> {profile.slogan}
            </div>
          ) : null}
          {profile.address_dari ? (
            <div className="company-profile-field">
              <strong>{t('desktop.address_dari')}:</strong> {profile.address_dari}
            </div>
          ) : null}
          {profile.address_pashto ? (
            <div className="company-profile-field">
              <strong>{t('desktop.address_pashto')}:</strong> {profile.address_pashto}
            </div>
          ) : null}
          {profile.address_uzbek ? (
            <div className="company-profile-field">
              <strong>{t('desktop.address_uzbek')}:</strong> {profile.address_uzbek}
            </div>
          ) : null}
          {profile.address_english ? (
            <div className="company-profile-field">
              <strong>{t('desktop.address_english')}:</strong> {profile.address_english}
            </div>
          ) : null}
          {profile.phone ? (
            <div className="company-profile-field">
              <strong>
                <i className="fa-solid fa-phone" /> {t('desktop.phone')}:
              </strong>{' '}
              <span dir="ltr">{profile.phone}</span>
            </div>
          ) : null}
          {profile.whatsapp ? (
            <div className="company-profile-field">
              <strong>
                <i className="fa-brands fa-whatsapp" /> {t('desktop.whatsapp')}:
              </strong>{' '}
              <span dir="ltr">{profile.whatsapp}</span>
            </div>
          ) : null}
        </div>

        <div className="company-social-row">
          {profile.facebook ? (
            <a href={profile.facebook} target="_blank" rel="noreferrer" className="social-facebook">
              <i className="fa-brands fa-facebook" />
            </a>
          ) : null}
          {profile.telegram ? (
            <a href={profile.telegram} target="_blank" rel="noreferrer" className="social-telegram">
              <i className="fa-brands fa-telegram" />
            </a>
          ) : null}
          {profile.instagram ? (
            <a href={profile.instagram} target="_blank" rel="noreferrer" className="social-instagram">
              <i className="fa-brands fa-instagram" />
            </a>
          ) : null}
          {profile.youtube ? (
            <a href={profile.youtube} target="_blank" rel="noreferrer" className="social-youtube">
              <i className="fa-brands fa-youtube" />
            </a>
          ) : null}
          {profile.linkedin ? (
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="social-linkedin">
              <i className="fa-brands fa-linkedin" />
            </a>
          ) : null}
          {profile.twitter ? (
            <a href={profile.twitter} target="_blank" rel="noreferrer" className="social-twitter">
              <i className="fa-brands fa-x-twitter" />
            </a>
          ) : null}
        </div>

        {canEdit ? (
          <button type="button" className="profile-pen profile-pen--faint" onClick={() => setProfileOpen(true)}>
            <i className="fa-regular fa-pen-to-square" />
          </button>
        ) : null}
      </div>

      {companySlug ? (
        <div className="content-small company-profile-card">
          <h5>
            {t('desktop.your_website_link')} {companyName}
          </h5>
          <input className="eng-input company-website-input" readOnly dir="ltr" value={websiteUrl} />
          <div className="company-website-actions">
            <button type="button" className="btn-primary" onClick={() => void copyLink()}>
              <i className="fa-regular fa-copy" /> {t('desktop.copy_link')}
            </button>
            <Link className="btn-secondary" to={`/c/${companySlug}`}>
              <i className="fa-regular fa-eye" /> {t('desktop.visit_website')}
            </Link>
          </div>
        </div>
      ) : null}

      {copied ? (
        <div className="link-copied-div">
          <div className="link-copied-div-content">{t('desktop.copied_success')}</div>
        </div>
      ) : null}

      <div className="content-small company-profile-card company-profile-card--actions">
        <Link to={businessPath(companyId, 'subscription')} className="btn-primary">
          <i className="fa-solid fa-calendar-check" aria-hidden />{' '}
          {t('desktop.company_subscription_page_title')}
        </Link>
      </div>

      <LogoModal
        open={photoOpen}
        token={token || ''}
        companyId={companyId}
        onClose={() => setPhotoOpen(false)}
        onUpdated={(path) => {
          setCompanyLogo(path)
          patchCompanyLocal({ logo: path })
        }}
      />
      <NameModal
        open={nameOpen}
        token={token || ''}
        companyId={companyId}
        initialName={companyName}
        onClose={() => setNameOpen(false)}
        onUpdated={(name) => {
          setCompanyName(name)
          patchCompanyLocal({ name })
        }}
      />
      <SlugModal
        open={slugOpen}
        token={token || ''}
        companyId={companyId}
        onClose={() => setSlugOpen(false)}
        onUpdated={(slug) => {
          setCompanySlug(slug)
          patchCompanyLocal({ slug })
        }}
      />
      <DetailsModal
        open={profileOpen}
        token={token || ''}
        companyId={companyId}
        initial={profile}
        onClose={() => setProfileOpen(false)}
        onUpdated={(next) => {
          setProfile(next)
          setBusiness({ ...business, profile: next })
        }}
      />
    </div>
  )
}

function LogoModal({
  open,
  token,
  companyId,
  onClose,
  onUpdated,
}: {
  open: boolean
  token: string
  companyId: string
  onClose: () => void
  onUpdated: (path: string) => void
}) {
  const { t } = useTranslation()
  const [image, setImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback((files: File[]) => {
    const file = files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImage(String(reader.result || ''))
    reader.readAsDataURL(file)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  })

  const reset = () => {
    setImage(null)
    setZoom(1)
    setCrop({ x: 0, y: 0 })
    setCroppedArea(null)
    setError(null)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!image || !croppedArea) return
    setBusy(true)
    setError(null)
    try {
      const blob = await cropImageToBlob(image, croppedArea)
      const result = await updateBusinessLogo(token, companyId, blob)
      onUpdated(result.newPath)
      showSuccessToast(t('desktop.info_upload_success'))
      reset()
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!busy) {
          reset()
          onClose()
        }
      }}
      title={t('desktop.update_logo')}
      wide
    >
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        {error ? <div className="alert-error">{error}</div> : null}
        {!image ? (
          <div {...getRootProps()} className={`company-logo-drop${isDragActive ? ' is-active' : ''}`}>
            <input {...getInputProps()} />
            <p>{t('desktop.drag_and_drop_image')}</p>
          </div>
        ) : (
          <>
            <div className="company-logo-crop">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, area) => setCroppedArea(area)}
              />
            </div>
            <label>
              {t('desktop.zoom')}
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>
          </>
        )}
        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            disabled={busy}
            onClick={() => {
              reset()
              onClose()
            }}
          >
            {t('desktop.cancel')}
          </button>
          <button className="btn-primary" disabled={busy || !image}>
            {busy ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function NameModal({
  open,
  token,
  companyId,
  initialName,
  onClose,
  onUpdated,
}: {
  open: boolean
  token: string
  companyId: string
  initialName: string
  onClose: () => void
  onUpdated: (name: string) => void
}) {
  const { t } = useTranslation()
  const [name, setName] = useState(initialName)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) setName(initialName)
  }, [open, initialName])

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await updateBusinessName(token, companyId, name.trim())
      onUpdated(name.trim())
      showSuccessToast(t('desktop.info_upload_success'))
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title={t('desktop.update_company_name')}>
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        <p className="muted small">{t('desktop.name_update_note')}</p>
        {error ? <div className="alert-error">{error}</div> : null}
        <label>
          {t('desktop.name')}
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>
            {t('desktop.cancel')}
          </button>
          <button className="btn-primary" disabled={busy}>
            {busy ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function SlugModal({
  open,
  token,
  companyId,
  onClose,
  onUpdated,
}: {
  open: boolean
  token: string
  companyId: string
  onClose: () => void
  onUpdated: (slug: string) => void
}) {
  const { t } = useTranslation()
  const [username, setUsername] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const slugRegex = /^[a-z]+(?:-[a-z]+)*$/

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!slugRegex.test(username)) {
      setError(t('desktop.invalid_slug'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      await updateBusinessSlug(token, companyId, username)
      onUpdated(username)
      showSuccessToast(t('desktop.info_upload_success'))
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title={t('desktop.set_username')}>
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        <p className="muted small">{t('desktop.slug_once_note')}</p>
        {error ? <div className="alert-error">{error}</div> : null}
        <label>
          {t('desktop.username')}
          <input
            className="eng-input"
            dir="ltr"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
          />
        </label>
        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>
            {t('desktop.cancel')}
          </button>
          <button className="btn-primary" disabled={busy}>
            {busy ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function DetailsModal({
  open,
  token,
  companyId,
  initial,
  onClose,
  onUpdated,
}: {
  open: boolean
  token: string
  companyId: string
  initial: BusinessCompanyProfile
  onClose: () => void
  onUpdated: (profile: BusinessCompanyProfile) => void
}) {
  const { t } = useTranslation()
  const [form, setForm] = useState<BusinessCompanyProfile>(initial)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) setForm(initial)
  }, [open, initial])

  const setField = (key: keyof BusinessCompanyProfile, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const updated = await updateBusinessCompanyProfile(token, companyId, {
        phone: form.phone,
        address_dari: form.address_dari,
        slogan: form.slogan,
      })
      onUpdated(updated || form)
      showSuccessToast(t('desktop.info_upload_success'))
      onClose()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const fields: Array<{ key: keyof BusinessCompanyProfile; label: string; ltr?: boolean }> = [
    { key: 'phone', label: t('desktop.phone'), ltr: true },
    { key: 'address_dari', label: t('desktop.address') },
    { key: 'slogan', label: t('desktop.company_slogan') },
  ]

  return (
    <Modal open={open} onClose={() => !busy && onClose()} title={t('desktop.update_company_profile')} wide>
      <form className="form-grid" onSubmit={(e) => void submit(e)}>
        {error ? <div className="alert-error">{error}</div> : null}
        {fields.map((field) => (
          <label key={field.key}>
            {field.label}
            <input
              className={field.ltr ? 'eng-input' : undefined}
              dir={field.ltr ? 'ltr' : undefined}
              value={String(form[field.key] || '')}
              onChange={(e) => setField(field.key, e.target.value)}
            />
            {field.key === 'slogan' ? (
              <span className="muted small" style={{ display: 'block', marginTop: 4 }}>
                {t('desktop.company_slogan_hint')}
              </span>
            ) : null}
          </label>
        ))}
        <div className="form-actions">
          <button type="button" className="btn-secondary" disabled={busy} onClick={onClose}>
            {t('desktop.cancel')}
          </button>
          <button className="btn-primary" disabled={busy}>
            {busy ? t('desktop.processing') : t('desktop.save')}
          </button>
        </div>
      </form>
    </Modal>
  )
}
