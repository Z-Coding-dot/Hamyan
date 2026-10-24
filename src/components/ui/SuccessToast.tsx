import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useShallow } from 'zustand/react/shallow'

import { useToastStore } from '@/store/useToastStore'

const DEFAULT_DURATION_MS = 3200

export function showSuccessToast(message: string, durationMs = DEFAULT_DURATION_MS) {
  useToastStore.getState().showSuccess(message, durationMs)
}

export function showErrorToast(message: string, durationMs?: number) {
  useToastStore.getState().showError(message, durationMs)
}

export function SuccessToastHost() {
  const { show, message, durationMs, tone, hideToast } = useToastStore(
    useShallow((state) => ({
      show: state.show,
      message: state.message,
      durationMs: state.durationMs,
      tone: state.tone,
      hideToast: state.hideToast,
    })),
  )

  useEffect(() => {
    if (!show || !message) return undefined
    const timer = window.setTimeout(hideToast, durationMs)
    return () => window.clearTimeout(timer)
  }, [show, message, durationMs, hideToast])

  if (!show || !message || typeof document === 'undefined') return null

  return createPortal(
    <div
      className={`community-success-toast${tone === 'error' ? ' is-error' : ''}`}
      role={tone === 'error' ? 'alert' : 'status'}
      aria-live={tone === 'error' ? 'assertive' : 'polite'}
    >
      <p className="community-success-toast__text">{message}</p>
    </div>,
    document.body,
  )
}
