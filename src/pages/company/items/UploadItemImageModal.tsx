import { FormEvent, useCallback, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { useTranslation } from 'react-i18next'

import { getApiErrorMessage } from '@/lib/auth'
import { uploadItemImage, type BusinessItemShow } from '@/lib/business'
import { cropAndCompressImage } from '@/lib/imageCrop'

type Props = {
  token: string
  companyId: string
  item: BusinessItemShow
  onClose: () => void
  onSaved: (item: BusinessItemShow) => void
}

const ITEM_IMAGE_MAX_BYTES = 256 * 1024

export function UploadItemImageModal({ token, companyId, item, onClose, onSaved }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedArea(pixels)
  }, [])

  const onPick = (file: File | null) => {
    if (!file) return
    setError(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedArea(null)
    const reader = new FileReader()
    reader.onload = () => setImageSrc(String(reader.result ?? ''))
    reader.readAsDataURL(file)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!imageSrc || !croppedArea) {
      setError(t('desktop.image_required'))
      return
    }
    setBusy(true)
    setError(null)
    try {
      const file = await cropAndCompressImage(imageSrc, croppedArea, {
        maxBytes: ITEM_IMAGE_MAX_BYTES,
        maxEdge: 1200,
        fileName: `item-${item.id}-${Date.now()}.jpg`,
      })
      const updated = await uploadItemImage(token, companyId, item.id, file)
      if (updated) onSaved(updated)
      onClose()
    } catch (err) {
      if (err instanceof Error && err.message === 'compress_failed') {
        setError(t('desktop.item_image_compress_failed'))
      } else {
        setError(getApiErrorMessage(err))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form-grid" dir="rtl" onSubmit={(e) => void submit(e)}>
      <h5 className="item-show-modal-title">{t('desktop.upload_image')}</h5>
      {error ? <div className="alert-error">{error}</div> : null}
      <p className="profile-avatar-crop-hint">{t('desktop.item_image_crop_hint')}</p>

      {imageSrc ? (
        <>
          <div className="item-image-crop">
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="profile-avatar-zoom">
            <label htmlFor="item-image-zoom">{t('desktop.zoom')}</label>
            <input
              id="item-image-zoom"
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
          <button
            type="button"
            className="profile-photo-drop"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <i className="fa-regular fa-image" style={{ marginInlineEnd: 8 }} />
            {t('desktop.choose_another_photo')}
          </button>
        </>
      ) : (
        <button
          type="button"
          className="profile-photo-drop"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
        >
          <i className="fa-regular fa-image" style={{ marginInlineEnd: 8 }} />
          {t('desktop.choose_photo')}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        hidden
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
      />

      <div className="form-actions">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={busy}>
          {t('desktop.cancel')}
        </button>
        <button className="btn-primary" disabled={busy || !imageSrc || !croppedArea}>
          {busy ? t('desktop.processing') : t('desktop.save')}
        </button>
      </div>
    </form>
  )
}
