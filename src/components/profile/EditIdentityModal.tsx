import { FormEvent, useCallback, useEffect, useRef, useState } from 'react'
import Cropper, { type Area } from 'react-easy-crop'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'
import { showSuccessToast } from '@/components/ui/SuccessToast'
import { getApiErrorMessage } from '@/lib/auth'
import { cropAndCompressImage, ID_SCAN_ASPECT } from '@/lib/imageCrop'
import {
  updateIdScanBack,
  updateIdScanFront,
  updateIdentityNumber,
  updateWhatsappNumber,
  type UserProfileKyc,
} from '@/lib/user'

type Props = {
  open: boolean
  token: string
  profile: UserProfileKyc
  onClose: () => void
  onUpdated: () => void
}

type ScanSide = 'front' | 'back'

type ScanState = {
  imageSrc: string | null
  crop: { x: number; y: number }
  zoom: number
  croppedArea: Area | null
}

const emptyScan = (): ScanState => ({
  imageSrc: null,
  crop: { x: 0, y: 0 },
  zoom: 1,
  croppedArea: null,
})

export function EditIdentityModal({ open, token, profile, onClose, onUpdated }: Props) {
  const { t } = useTranslation()
  const frontRef = useRef<HTMLInputElement>(null)
  const backRef = useRef<HTMLInputElement>(null)

  const [whatsapp, setWhatsapp] = useState(profile.whatsapp_number ?? '')
  const [identityNumber, setIdentityNumber] = useState(profile.identity_number ?? '')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [frontScan, setFrontScan] = useState<ScanState>(emptyScan)
  const [backScan, setBackScan] = useState<ScanState>(emptyScan)

  useEffect(() => {
    if (!open) return
    setWhatsapp(profile.whatsapp_number ?? '')
    setIdentityNumber(profile.identity_number ?? '')
    setError(null)
    setFrontScan(emptyScan())
    setBackScan(emptyScan())
    if (frontRef.current) frontRef.current.value = ''
    if (backRef.current) backRef.current.value = ''
  }, [open, profile.whatsapp_number, profile.identity_number])

  const run = async (key: string, action: () => Promise<unknown>) => {
    setBusy(key)
    setError(null)
    try {
      await action()
      showSuccessToast(t('desktop.info_upload_success'))
      onUpdated()
    } catch (err) {
      if (err instanceof Error && err.message === 'compress_failed') {
        setError(t('desktop.id_scan_compress_failed'))
      } else {
        setError(getApiErrorMessage(err))
      }
    } finally {
      setBusy(null)
    }
  }

  const onWhatsapp = (event: FormEvent) => {
    event.preventDefault()
    void run('whatsapp', () => updateWhatsappNumber(token, whatsapp))
  }

  const onIdentity = (event: FormEvent) => {
    event.preventDefault()
    void run('identity', () => updateIdentityNumber(token, identityNumber))
  }

  const pickScan = (side: ScanSide, file: File | null) => {
    if (!file) return
    setError(null)
    const reader = new FileReader()
    reader.onload = () => {
      const next: ScanState = {
        imageSrc: String(reader.result ?? ''),
        crop: { x: 0, y: 0 },
        zoom: 1,
        croppedArea: null,
      }
      if (side === 'front') setFrontScan(next)
      else setBackScan(next)
    }
    reader.readAsDataURL(file)
  }

  const onFrontCropComplete = useCallback((_: Area, pixels: Area) => {
    setFrontScan((prev) => ({ ...prev, croppedArea: pixels }))
  }, [])

  const onBackCropComplete = useCallback((_: Area, pixels: Area) => {
    setBackScan((prev) => ({ ...prev, croppedArea: pixels }))
  }, [])

  const submitScan = async (side: ScanSide) => {
    const scan = side === 'front' ? frontScan : backScan
    if (!scan.imageSrc || !scan.croppedArea) {
      setError(t('desktop.no_file_selected'))
      return
    }

    await run(side, async () => {
      const file = await cropAndCompressImage(scan.imageSrc!, scan.croppedArea!, {
        maxBytes: 512 * 1024,
        fileName: side === 'front' ? 'scan_front.jpg' : 'scan_back.jpg',
      })
      if (side === 'front') {
        await updateIdScanFront(token, file)
        setFrontScan(emptyScan())
        if (frontRef.current) frontRef.current.value = ''
      } else {
        await updateIdScanBack(token, file)
        setBackScan(emptyScan())
        if (backRef.current) backRef.current.value = ''
      }
    })
  }

  const renderScanBlock = (side: ScanSide) => {
    const scan = side === 'front' ? frontScan : backScan
    const inputRef = side === 'front' ? frontRef : backRef
    const title = side === 'front' ? t('desktop.id_scan_front') : t('desktop.id_scan_back')
    const zoomId = side === 'front' ? 'id-scan-front-zoom' : 'id-scan-back-zoom'

    return (
      <div className="profile-edit-block">
        <h6>{title}</h6>
        <p className="profile-avatar-crop-hint">{t('desktop.id_scan_crop_hint')}</p>

        {scan.imageSrc ? (
          <>
            <div className="profile-id-scan-crop">
              <Cropper
                image={scan.imageSrc}
                crop={scan.crop}
                zoom={scan.zoom}
                aspect={ID_SCAN_ASPECT}
                cropShape="rect"
                showGrid
                onCropChange={(crop) => {
                  if (side === 'front') setFrontScan((prev) => ({ ...prev, crop }))
                  else setBackScan((prev) => ({ ...prev, crop }))
                }}
                onZoomChange={(zoom) => {
                  if (side === 'front') setFrontScan((prev) => ({ ...prev, zoom }))
                  else setBackScan((prev) => ({ ...prev, zoom }))
                }}
                onCropComplete={side === 'front' ? onFrontCropComplete : onBackCropComplete}
              />
            </div>
            <div className="profile-avatar-zoom">
              <label htmlFor={zoomId}>{t('desktop.zoom')}</label>
              <input
                id={zoomId}
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={scan.zoom}
                onChange={(e) => {
                  const zoom = Number(e.target.value)
                  if (side === 'front') setFrontScan((prev) => ({ ...prev, zoom }))
                  else setBackScan((prev) => ({ ...prev, zoom }))
                }}
              />
            </div>
            <button
              type="button"
              className="profile-photo-drop"
              onClick={() => inputRef.current?.click()}
              disabled={busy === side}
            >
              <i className="fa-regular fa-image" style={{ marginInlineEnd: 8 }} />
              {t('desktop.choose_another_photo')}
            </button>
            <button
              type="button"
              className="btn-primary"
              style={{ marginTop: 10 }}
              disabled={busy === side || !scan.croppedArea}
              onClick={() => void submitScan(side)}
            >
              {busy === side ? t('desktop.processing') : t('desktop.save')}
            </button>
          </>
        ) : (
          <button
            type="button"
            className="profile-photo-drop"
            disabled={busy === side}
            onClick={() => inputRef.current?.click()}
          >
            <i className="fa-regular fa-image" style={{ marginInlineEnd: 8 }} />
            {t('desktop.drag_and_drop_image')}
          </button>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/jpg,image/webp,image/gif"
          hidden
          onChange={(e) => {
            pickScan(side, e.target.files?.[0] ?? null)
          }}
        />
      </div>
    )
  }

  return (
    <Modal open={open} onClose={onClose} title={t('desktop.identity_details')} wide className="hy-party-dialog hy-finance-dialog hy-profile-dialog hy-identity-dialog">
      {error ? <div className="alert-error">{error}</div> : null}

      <form className="profile-edit-block form-grid" onSubmit={onWhatsapp}>
        <div className="form-field">
          <label htmlFor="identity-whatsapp">{t('desktop.whatsapp_number')}</label>
          <input id="identity-whatsapp" type="tel" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} dir="ltr" required />
        </div>
        <button type="submit" className="btn-primary" disabled={busy === 'whatsapp'}>
          {busy === 'whatsapp' ? t('desktop.processing') : t('desktop.save')}
        </button>
      </form>

      <form className="profile-edit-block form-grid" onSubmit={onIdentity}>
        <div className="form-field">
          <label htmlFor="identity-number">{t('desktop.identity_number')}</label>
          <input
            id="identity-number"
            value={identityNumber}
            onChange={(e) => setIdentityNumber(e.target.value)}
            dir="ltr"
            required
          />
        </div>
        <button type="submit" className="btn-primary" disabled={busy === 'identity'}>
          {busy === 'identity' ? t('desktop.processing') : t('desktop.save')}
        </button>
      </form>

      {renderScanBlock('front')}
      {renderScanBlock('back')}

      <div className="profile-card-actions">
        <button type="button" className="btn-ghost" onClick={onClose}>
          {t('desktop.close')}
        </button>
      </div>
    </Modal>
  )
}
