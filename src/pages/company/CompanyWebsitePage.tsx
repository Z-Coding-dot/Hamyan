import { useCallback, useEffect, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { useDropzone } from 'react-dropzone'
import { Navigate, useOutletContext, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { useCachedAsset } from '@/hooks/useCachedAsset'
import { getApiErrorMessage } from '@/lib/auth'
import {
  deleteCompanySlider,
  fetchWebsiteSettings,
  uploadCompanySlider,
  type CompanySliderRow,
} from '@/lib/business'
import type { BusinessShowData } from '@/lib/user'
import { useAuthStore } from '@/store/useAuthStore'
import { businessPath } from '@/store/useCompanyContextStore'

type CompanyOutletContext = { business: BusinessShowData }

function SliderImage({ image, alt }: { image?: string | null; alt: string }) {
  const src = useCachedAsset(image)
  if (!src) return null
  return <img src={src} alt={alt} />
}

async function getCroppedCompressedBlob(imageSrc: string, croppedAreaPixels: Area): Promise<Blob> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = reject
    i.src = imageSrc
  })

  const { x, y, width, height } = croppedAreaPixels
  const targetW = 1600
  const targetH = 800
  const canvas = document.createElement('canvas')
  canvas.width = targetW
  canvas.height = targetH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas unavailable')
  ctx.drawImage(img, x, y, width, height, 0, 0, targetW, targetH)

  const MAX = 512 * 1024
  let q = 0.92
  let blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', q))
  while (blob && blob.size > MAX && q > 0.4) {
    q -= 0.06
    blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', q))
  }
  if (blob && blob.size > MAX) {
    const half = document.createElement('canvas')
    half.width = Math.round(targetW * 0.8)
    half.height = Math.round(targetH * 0.8)
    const hctx = half.getContext('2d')
    if (!hctx) throw new Error('Canvas unavailable')
    hctx.drawImage(canvas, 0, 0, half.width, half.height)
    q = 0.8
    blob = await new Promise<Blob | null>((r) => half.toBlob(r, 'image/jpeg', q))
    while (blob && blob.size > MAX && q > 0.4) {
      q -= 0.06
      blob = await new Promise<Blob | null>((r) => half.toBlob(r, 'image/jpeg', q))
    }
  }
  if (!blob) throw new Error('Failed to create blob')
  if (blob.size > MAX) throw new Error('Cannot compress under 512KB')
  return blob
}

export function CompanyWebsitePage() {
  const { t } = useTranslation()
  const { companyId = '' } = useParams()
  const { business } = useOutletContext<CompanyOutletContext>()
  const token = useAuthStore(useShallow((s) => s.token))
  const canManage = Boolean(business.permissions?.canManageWebsiteSettings)

  const [companyName, setCompanyName] = useState(business.company?.name || '')
  const [sliders, setSliders] = useState<CompanySliderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<CompanySliderRow | null>(null)

  const [image, setImage] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  const reload = useCallback(async () => {
    if (!token || !companyId) return
    const data = await fetchWebsiteSettings(token, companyId)
    setCompanyName(data.company?.name || '')
    setSliders(Array.isArray(data.sliders) ? data.sliders : [])
  }, [token, companyId])

  useEffect(() => {
    if (!token || !companyId || !canManage) return
    let active = true
    setLoading(true)
    void reload()
      .catch((err) => {
        if (active) setError(getApiErrorMessage(err))
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token, companyId, canManage, reload])

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles?.[0]
      if (!file) {
        setError(t('desktop.no_file'))
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImage(typeof reader.result === 'string' ? reader.result : null)
        setError(null)
      }
      reader.readAsDataURL(file)
    },
    [t],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    maxFiles: 1,
  })

  if (!canManage) {
    return <Navigate to={businessPath(companyId)} replace />
  }

  const handleUpload = async () => {
    if (!token || !image || !croppedAreaPixels) return
    setProcessing(true)
    setError(null)
    try {
      const blob = await getCroppedCompressedBlob(image, croppedAreaPixels)
      await uploadCompanySlider(token, companyId, blob)
      showSuccessToast(t('desktop.saved_success'))
      setImage(null)
      setZoom(1)
      setCrop({ x: 0, y: 0 })
      setCroppedAreaPixels(null)
      await reload()
    } catch (err) {
      setError(getApiErrorMessage(err) || t('desktop.upload_failed'))
    } finally {
      setProcessing(false)
    }
  }

  const handleDelete = async () => {
    if (!token || !deleteTarget) return
    setProcessing(true)
    setError(null)
    try {
      await deleteCompanySlider(token, companyId, deleteTarget.id)
      showSuccessToast(t('desktop.deleted_success'))
      setDeleteTarget(null)
      await reload()
    } catch (err) {
      setError(getApiErrorMessage(err))
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="dash-div company-website-page" dir="rtl">
      <div className="cw-header">
        <h6>
          {t('desktop.nav_settings')} {t('desktop.website')}
          <span>{companyName}</span>
        </h6>
      </div>

      {loading ? <div className="spinner" /> : null}
      {error ? <div className="alert-error">{error}</div> : null}

      <div className="cw-card">
        <div className="cw-card__head">
          <span>{t('desktop.add_slider_image')}</span>
          <small className="cs-muted">(نسبت ۲:۱ – حداکثر 512KB)</small>
        </div>
        <div className="cw-card__body">
          {!image ? (
            <div {...getRootProps()} className={`cw-dropzone${isDragActive ? ' is-active' : ''}`}>
              <input {...getInputProps()} />
              <p style={{ margin: '0 0 4px' }}>{t('desktop.drag_and_drop')}</p>
              <small className="cs-muted">JPEG/PNG</small>
            </div>
          ) : (
            <>
              <div className="cw-crop">
                <Cropper
                  image={image}
                  crop={crop}
                  zoom={zoom}
                  aspect={2 / 1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_area, pixels) => setCroppedAreaPixels(pixels)}
                  cropShape="rect"
                  showGrid
                />
              </div>
              <div className="cs-field">
                <label>{t('desktop.zoom')}</label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                />
              </div>
              <div className="cs-actions">
                <button type="button" className="btn-primary" disabled={processing} onClick={() => void handleUpload()}>
                  {processing ? t('desktop.processing') : t('desktop.save')}
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  disabled={processing}
                  onClick={() => {
                    setImage(null)
                    setCroppedAreaPixels(null)
                  }}
                >
                  {t('desktop.cancel')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="cw-card">
        <div className="cw-card__head">{t('desktop.existing_slider_images')}</div>
        <div className="cw-card__body">
          {sliders.length === 0 ? <div className="cs-muted">{t('desktop.no_data')}</div> : null}
          <div className="cw-grid">
            {sliders.map((s) => (
                <div className="cw-slide" key={s.id}>
                  <div className="cw-slide__img">
                    <SliderImage image={s.image} alt={s.description || `slider-${s.id}`} />
                  </div>
                  <div className="cw-slide__foot">
                    <small className="cs-muted">{s.description || t('desktop.slider')}</small>
                    <button
                      type="button"
                      className="btn-danger"
                      disabled={processing}
                      onClick={() => setDeleteTarget(s)}
                      title={t('desktop.delete')}
                    >
                      <i className="fa-solid fa-trash" />
                    </button>
                  </div>
                </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={Boolean(deleteTarget)}
        onClose={() => {
          if (!processing) setDeleteTarget(null)
        }}
        title={t('desktop.confirm_delete_title')}
      >
        <div dir="rtl">
          <p>{t('desktop.confirm_delete_slider')}</p>
          {deleteTarget ? (
            <div className="cw-slide" style={{ maxWidth: 280, marginTop: 12 }}>
              <div className="cw-slide__img">
                  <SliderImage
                    image={deleteTarget.image}
                    alt={deleteTarget.description || t('desktop.slider')}
                  />
                </div>
            </div>
          ) : null}
          <div className="form-actions" style={{ marginTop: 16 }}>
            <button
              type="button"
              className="btn-secondary"
              disabled={processing}
              onClick={() => setDeleteTarget(null)}
            >
              {t('desktop.cancel')}
            </button>
            <button
              type="button"
              className="btn-danger"
              disabled={processing}
              onClick={() => void handleDelete()}
            >
              {processing ? t('desktop.processing') : t('desktop.delete')}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
