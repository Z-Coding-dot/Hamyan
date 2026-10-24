import { FormEvent, useCallback, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { updateProfilePhoto } from '@/lib/user'

type Props = {
  open: boolean
  token: string
  onClose: () => void
  onUpdated: (newPath: string) => void
}

const MAX_BYTES = 150 * 1024
const OUTPUT_SIZE = 512

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

async function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/jpeg', quality)
  })
  if (!blob) throw new Error('blob')
  return blob
}

/** Crop to 1:1 and compress so the JPEG is at most 150KB. */
async function cropAndCompressAvatar(imageSrc: string, crop: Area): Promise<File> {
  const image = await loadImage(imageSrc)
  let size = OUTPUT_SIZE
  let quality = 0.9
  let blob: Blob | null = null

  while (size >= 160) {
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, size, size)

    quality = 0.9
    blob = await canvasToJpegBlob(canvas, quality)
    while (blob.size > MAX_BYTES && quality > 0.45) {
      quality -= 0.07
      blob = await canvasToJpegBlob(canvas, quality)
    }

    if (blob.size <= MAX_BYTES) break
    size = Math.round(size * 0.8)
    blob = null
  }

  if (!blob || blob.size > MAX_BYTES) {
    throw new Error('compress_failed')
  }

  return new File([blob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' })
}

export function UpdatePhotoModal({ open, token, onClose, onUpdated }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedArea, setCroppedArea] = useState<Area | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setImageSrc(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedArea(null)
    setError(null)
    setSaving(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedArea(croppedAreaPixels)
  }, [])

  const onPick = (picked: File | null) => {
    if (!picked) return
    setError(null)
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setCroppedArea(null)
    const reader = new FileReader()
    reader.onload = () => setImageSrc(String(reader.result ?? ''))
    reader.readAsDataURL(picked)
  }

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!imageSrc || !croppedArea) {
      setError(t('desktop.no_file_selected'))
      return
    }
    setSaving(true)
    setError(null)
    try {
      const file = await cropAndCompressAvatar(imageSrc, croppedArea)
      const result = await updateProfilePhoto(token, file)
      const path = result.newPath?.trim() || result.user?.profile_photo_path?.trim() || ''
      if (!path) {
        throw new Error('missing_path')
      }
      onUpdated(path)
      showSuccessToast(t('desktop.info_upload_success'))
      handleClose()
    } catch (err) {
      if (err instanceof Error && err.message === 'compress_failed') {
        setError(t('desktop.avatar_compress_failed'))
      } else if (err instanceof Error && err.message === 'missing_path') {
        setError(t('desktop.generic_request_error'))
      } else {
        setError(getApiErrorMessage(err))
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title={t('desktop.update_profile_photo')}>
      <form className="form-grid" onSubmit={(e) => void onSubmit(e)}>
        {error ? <div className="alert-error">{error}</div> : null}

        {imageSrc ? (
          <>
            <p className="profile-avatar-crop-hint">{t('desktop.avatar_crop_hint')}</p>
            <div className="profile-avatar-crop">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="profile-avatar-zoom">
              <label htmlFor="avatar-zoom">{t('desktop.zoom')}</label>
              <input
                id="avatar-zoom"
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

        <button type="submit" className="btn-primary" disabled={saving || !imageSrc || !croppedArea}>
          {saving ? t('desktop.processing') : t('desktop.save')}
        </button>
      </form>
    </Modal>
  )
}
