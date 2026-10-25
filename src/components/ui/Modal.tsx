import { ReactNode, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { useIsMobileSidebar } from '@/hooks/useMediaQuery'

type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  wide?: boolean
  className?: string
}

export function Modal({ open, onClose, children, title, wide, className = '' }: ModalProps) {
  const { t } = useTranslation()
  const titleId = useId()
  const sheet = useIsMobileSidebar()

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.body.classList.add('hy-modal-open')
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.classList.remove('hy-modal-open')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="profile-modal-backdrop"
      role="presentation"
      onClick={onClose}
      style={
        sheet
          ? { position: 'fixed', inset: 0, zIndex: 6000, padding: 0, margin: 0, overflow: 'hidden' }
          : undefined
      }
    >
      <div
        className={`profile-modal${wide ? ' profile-modal--wide' : ''} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        onClick={(event) => event.stopPropagation()}
        style={
          sheet
            ? {
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 0,
                top: 'auto',
                width: '100%',
                maxWidth: '100%',
                margin: 0,
                borderRadius: '22px 22px 0 0',
                zIndex: 6001,
              }
            : undefined
        }
      >
        <div className="profile-modal__head">
          {title ? <h3 id={titleId}>{title}</h3> : <span />}
          <button type="button" className="profile-modal__close" onClick={onClose} aria-label={t('desktop.close')}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <div className="profile-modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
