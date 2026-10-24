import { ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'

import { useIsMobileSidebar } from '@/hooks/useMediaQuery'

type ModalProps = {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  wide?: boolean
}

export function Modal({ open, onClose, children, title, wide }: ModalProps) {
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
        className={`profile-modal${wide ? ' profile-modal--wide' : ''}`}
        role="dialog"
        aria-modal="true"
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
          {title ? <h3>{title}</h3> : <span />}
          <button type="button" className="profile-modal__close" onClick={onClose} aria-label="Close">
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
        <div className="profile-modal__body">{children}</div>
      </div>
    </div>,
    document.body,
  )
}
