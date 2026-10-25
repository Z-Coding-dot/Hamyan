import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { createPortal } from 'react-dom'

import { useIsMobileSidebar } from '@/hooks/useMediaQuery'
import { useLocaleStore, type SupportedLanguage } from '@/store/useLocaleStore'

const languages: SupportedLanguage[] = ['fa', 'ps', 'en']

type LanguageModalProps = {
  open: boolean
  onClose: () => void
  onSelect?: (language: SupportedLanguage) => void | Promise<void>
  pending?: boolean
}

export function LanguageModal({ open, onClose, onSelect, pending = false }: LanguageModalProps) {
  const { t } = useTranslation()
  const language = useLocaleStore((state) => state.language)
  const setLanguage = useLocaleStore((state) => state.setLanguage)
  const sheet = useIsMobileSidebar()
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  const pendingRef = useRef(pending)
  closeRef.current = onClose
  pendingRef.current = pending

  useEffect(() => {
    if (!open) return
    const previousFocus = document.activeElement as HTMLElement | null
    document.body.classList.add('hy-modal-open')
    panelRef.current?.querySelector<HTMLButtonElement>('.modal-panel__close')?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pendingRef.current) {
        event.preventDefault()
        closeRef.current()
      }
      if (event.key !== 'Tab') return
      const buttons = panelRef.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')
      if (!buttons?.length) return
      const first = buttons[0]
      const last = buttons[buttons.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.classList.remove('hy-modal-open')
      document.removeEventListener('keydown', onKeyDown)
      previousFocus?.focus()
    }
  }, [open])

  if (!open) {
    return null
  }

  const labels: Record<SupportedLanguage, string> = {
    fa: t('desktop.language_fa'),
    ps: t('desktop.language_ps'),
    en: t('desktop.language_en'),
  }

  const handleSelect = async (code: SupportedLanguage) => {
    if (pending || code === language) {
      onClose()
      return
    }

    if (onSelect) {
      await onSelect(code)
      return
    }

    await setLanguage(code)
    onClose()
  }

  return createPortal(
    <div
      className="modal-backdrop"
      role="presentation"
      onClick={() => (pending ? null : onClose())}
      style={
        sheet
          ? { position: 'fixed', inset: 0, zIndex: 6000, padding: 0, margin: 0, overflow: 'hidden' }
          : undefined
      }
    >
      <div
        ref={panelRef}
        className="modal-panel hy-language-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="language-modal-title"
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
        <div className="modal-panel__head">
          <div>
            <h3 id="language-modal-title">{t('desktop.language_title')}</h3>
            <p className="muted">{t('desktop.choose_language')}</p>
          </div>
          <button
            type="button"
            className="modal-panel__close"
            onClick={onClose}
            disabled={pending}
            aria-label={t('desktop.close')}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <div className="language-modal__list">
          {languages.map((code) => {
            const isActive = code === language

            return (
              <button
                key={code}
                type="button"
                className={`language-modal__option${isActive ? ' is-active' : ''}`}
                onClick={() => void handleSelect(code)}
                disabled={pending}
                aria-pressed={isActive}
              >
                <span>
                  <strong>{labels[code]}</strong>
                  <small>{code.toUpperCase()}</small>
                </span>
                <i className={`fa-${isActive ? 'solid fa-circle-check' : 'regular fa-circle'}`} />
              </button>
            )
          })}
        </div>

        {pending ? (
          <div className="language-modal__pending">
            <span className="spinner spinner--sm" />
            <span>{t('desktop.changing_language')}</span>
          </div>
        ) : null}
      </div>
    </div>,
    document.body,
  )
}
