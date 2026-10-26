import { ReactNode, useEffect, useId } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { m, useDragControls, useReducedMotion } from 'framer-motion'

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
  const reduceMotion = useReducedMotion()
  const dragControls = useDragControls()

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
      <m.div
        className={`profile-modal${wide ? ' profile-modal--wide' : ''} ${className}`}
        initial={sheet && !reduceMotion ? { y: 50, opacity: .6 } : false}
        animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 380, damping: 36 }}
        drag={sheet ? 'y' : false} dragControls={dragControls} dragListener={false} dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: .4 }} dragSnapToOrigin
        onDragEnd={(_, info) => { if (sheet && (info.offset.y > 90 || info.velocity.y > 650)) onClose() }}
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
        {sheet && <div className="hy-sheet-handle" aria-hidden="true" onPointerDown={(event) => dragControls.start(event)}><span /></div>}
        <div className="profile-modal__head">
          {title ? <h3 id={titleId}>{title}</h3> : <span />}
          <button type="button" className="profile-modal__close" onClick={onClose} aria-label={t('desktop.close')}>
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        </div>
        <div className="profile-modal__body">{children}</div>
      </m.div>
    </div>,
    document.body,
  )
}
