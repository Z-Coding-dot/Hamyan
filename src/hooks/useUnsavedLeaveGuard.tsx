import { useEffect, useRef, useState } from 'react'
import { useBlocker } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import { Modal } from '@/components/ui/Modal'

/**
 * Blocks in-app navigation (and warns on tab close) when `when` is true.
 * Requires a data router (createBrowserRouter / RouterProvider).
 *
 * Call `bypassGuard()` immediately before a deliberate navigate after save
 * so the blocker does not race with React state updates.
 */
export function useUnsavedLeaveGuard(when: boolean) {
  const { t } = useTranslation()
  const whenRef = useRef(when)
  const bypassRef = useRef(false)
  whenRef.current = when

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (bypassRef.current) return false
    if (!whenRef.current) return false
    return (
      currentLocation.pathname !== nextLocation.pathname ||
      currentLocation.search !== nextLocation.search
    )
  })

  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (blocker.state === 'blocked') setOpen(true)
    else setOpen(false)
  }, [blocker.state])

  useEffect(() => {
    if (!when) {
      bypassRef.current = false
      return
    }
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [when])

  const bypassGuard = () => {
    bypassRef.current = true
  }

  const confirmLeave = () => {
    setOpen(false)
    bypassRef.current = true
    if (blocker.state === 'blocked') blocker.proceed()
  }

  const cancelLeave = () => {
    setOpen(false)
    if (blocker.state === 'blocked') blocker.reset()
  }

  const guardModal = (
    <Modal open={open} onClose={cancelLeave} title={t('desktop.unsaved_sale_leave_title')}>
      <p style={{ marginTop: 0 }}>{t('desktop.unsaved_sale_leave_message')}</p>
      <div className="form-actions" style={{ justifyContent: 'flex-end', gap: 8 }}>
        <button type="button" className="btn-secondary" onClick={cancelLeave}>
          {t('desktop.cancel')}
        </button>
        <button type="button" className="btn-danger" onClick={confirmLeave}>
          {t('desktop.unsaved_sale_leave_confirm')}
        </button>
      </div>
    </Modal>
  )

  return { guardModal, bypassGuard, isBlocked: open }
}
