import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/** Official Hamyan HesabPay account number (shared across charge flows). */
export const ISHANCH_HESABPAY_ACCOUNT = '0790240808'

const LOGO_SRC = '/hesabpay.jpg'
const QR_SRC = '/ishanch-hesab-qr.jpeg'

type HesabPayAccountCardProps = {
  /** Override account number; defaults to Hamyan Pay. */
  accountNumber?: string
  className?: string
}

export function HesabPayAccountCard({
  accountNumber = ISHANCH_HESABPAY_ACCOUNT,
  className,
}: HesabPayAccountCardProps) {
  const { t } = useTranslation()
  const [qrOpen, setQrOpen] = useState(false)
  const label = t('desktop.reseller_pay_label')

  useEffect(() => {
    if (!qrOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQrOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      window.removeEventListener('keydown', onKey)
    }
  }, [qrOpen])

  const rootClass = ['hesab-pay-card', className].filter(Boolean).join(' ')

  return (
    <>
      <div className={rootClass} dir="ltr" aria-label={label}>
        <div className="hesab-pay-card__glow" aria-hidden />
        <div className="hesab-pay-card__main">
          <div className="hesab-pay-card__brand">
            <img
              src={LOGO_SRC}
              alt="HesabPay"
              className="hesab-pay-card__logo"
              width={72}
              height={72}
            />
            <div className="hesab-pay-card__meta">
              <span className="hesab-pay-card__label">{label}</span>
              <strong className="hesab-pay-card__number">{accountNumber}</strong>
            </div>
          </div>
          <div className="hesab-pay-card__qr-wrap">
            <button
              type="button"
              className="hesab-pay-card__qr-btn"
              onClick={() => setQrOpen(true)}
              aria-label={label}
            >
              <img
                src={QR_SRC}
                alt=""
                className="hesab-pay-card__qr"
                width={180}
                height={180}
              />
            </button>
          </div>
        </div>
      </div>

      {qrOpen ? (
        <div className="hesab-pay-qr-lightbox" role="dialog" aria-modal="true" aria-label={label}>
          <button
            type="button"
            className="hesab-pay-qr-lightbox__backdrop"
            aria-label={t('desktop.close')}
            onClick={() => setQrOpen(false)}
          />
          <div className="hesab-pay-qr-lightbox__panel">
            <button
              type="button"
              className="hesab-pay-qr-lightbox__close"
              onClick={() => setQrOpen(false)}
              aria-label={t('desktop.close')}
            >
              <i className="fa-solid fa-xmark" aria-hidden />
            </button>
            <img src={QR_SRC} alt={label} className="hesab-pay-qr-lightbox__img" />
            <strong className="hesab-pay-qr-lightbox__number" dir="ltr">
              {accountNumber}
            </strong>
          </div>
        </div>
      ) : null}
    </>
  )
}
