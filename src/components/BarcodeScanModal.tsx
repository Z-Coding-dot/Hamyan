import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

const DETECT_FORMATS = [
  'ean_13',
  'ean_8',
  'upc_a',
  'upc_e',
  'code_128',
  'code_39',
  'code_93',
  'codabar',
  'itf',
  'qr_code',
]

function canUseBarcodeDetector(): boolean {
  return typeof window !== 'undefined' && typeof window.BarcodeDetector === 'function'
}

type Props = {
  open: boolean
  onClose: () => void
  onScan: (code: string) => void
}

export function BarcodeScanModal({ open, onClose, onScan }: Props) {
  const { t } = useTranslation()
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const handledRef = useRef(false)
  const onScanRef = useRef(onScan)
  const onCloseRef = useRef(onClose)
  const [error, setError] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)

  onScanRef.current = onScan
  onCloseRef.current = onClose

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    const video = videoRef.current
    if (video) video.srcObject = null
  }, [])

  useEffect(() => {
    if (!open) {
      handledRef.current = false
      setError(null)
      setStarting(false)
      stopCamera()
      return
    }

    if (!canUseBarcodeDetector()) {
      setError(t('desktop.camera_unavailable'))
      return
    }
    if (!window.isSecureContext) {
      setError(t('desktop.camera_unavailable'))
      return
    }

    let cancelled = false
    let timer: number | null = null
    handledRef.current = false
    setStarting(true)
    setError(null)

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        })
        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          await video.play().catch(() => undefined)
        }
        setStarting(false)

        const supported = await BarcodeDetector.getSupportedFormats().catch(() => DETECT_FORMATS)
        const formats = DETECT_FORMATS.filter((format) => supported.includes(format))
        const detector = new BarcodeDetector({
          formats: formats.length ? formats : DETECT_FORMATS,
        })

        const tick = async () => {
          if (cancelled || handledRef.current) return
          const current = videoRef.current
          if (current && current.readyState >= 2) {
            try {
              const codes = await detector.detect(current)
              const value = codes.map((row) => String(row.rawValue || '').trim()).find(Boolean)
              if (value) {
                handledRef.current = true
                onScanRef.current(value)
                onCloseRef.current()
                return
              }
            } catch {
              /* keep scanning */
            }
          }
          timer = window.setTimeout(() => void tick(), 220)
        }
        timer = window.setTimeout(() => void tick(), 280)
      } catch {
        if (!cancelled) {
          setStarting(false)
          setError(t('desktop.camera_permission_required'))
        }
      }
    }

    void start()
    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
      stopCamera()
    }
  }, [open, stopCamera, t])

  if (!open) return null

  return createPortal(
    <div className="barcode-scan" role="dialog" aria-modal="true" aria-label={t('desktop.scan_barcode')}>
      <div className="barcode-scan__head">
        <strong>{t('desktop.scan_barcode')}</strong>
        <button type="button" className="barcode-scan__close" onClick={onClose} aria-label={t('desktop.cancel')}>
          <i className="fa-solid fa-xmark" />
        </button>
      </div>
      {error ? (
        <div className="barcode-scan__center">
          <p>{error}</p>
          <button type="button" className="btn-secondary" onClick={onClose}>
            {t('desktop.cancel')}
          </button>
        </div>
      ) : (
        <div className="barcode-scan__stage">
          <video ref={videoRef} className="barcode-scan__video" playsInline muted autoPlay />
          <div className="barcode-scan__overlay" aria-hidden="true">
            <div className="barcode-scan__frame" />
            <p>{starting ? t('desktop.processing') : t('desktop.barcode_scan_placeholder')}</p>
          </div>
        </div>
      )}
    </div>,
    document.body,
  )
}

export function BarcodeScanButton({
  disabled,
  onClick,
}: {
  disabled?: boolean
  onClick: () => void
}) {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      className="btn-secondary barcode-scan-btn"
      disabled={disabled}
      onClick={onClick}
      aria-label={t('desktop.scan_barcode')}
      title={t('desktop.scan_barcode')}
    >
      <i className="fa-solid fa-barcode" aria-hidden="true" />
      <span className="barcode-scan-btn__label">{t('desktop.scan_barcode')}</span>
    </button>
  )
}
