import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRegisterSW } from 'virtual:pwa-register/react'

import '@/pwa.css'

const DISMISS_KEY = 'hamyan_pwa_install_dismissed'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false
  const nav = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches || nav.standalone === true
}

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1'
  } catch {
    return false
  }
}

export function PwaManager({ showUi }: { showUi: boolean }) {
  const { t } = useTranslation()
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [installHidden, setInstallHidden] = useState(readDismissed)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      if (!registration) return
      window.setInterval(() => {
        void registration.update()
      }, 60 * 60 * 1000)
    },
  })

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    const onInstalled = () => setInstallEvent(null)
    window.addEventListener('beforeinstallprompt', onPrompt)
    window.addEventListener('appinstalled', onInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt)
      window.removeEventListener('appinstalled', onInstalled)
    }
  }, [])

  if (!showUi) return null

  if (needRefresh) {
    return (
      <div className="pwa-bar" role="status">
        <div className="pwa-bar__copy">
          <strong>{t('desktop.pwa_update_title')}</strong>
          <span>{t('desktop.pwa_update_body')}</span>
        </div>
        <div className="pwa-bar__actions">
          <button type="button" className="pwa-bar__ghost" onClick={() => setNeedRefresh(false)}>
            {t('desktop.pwa_install_dismiss')}
          </button>
          <button type="button" className="pwa-bar__primary" onClick={() => void updateServiceWorker(true)}>
            {t('desktop.pwa_update_action')}
          </button>
        </div>
      </div>
    )
  }

  if (!installEvent || installHidden || isStandalone()) return null

  return (
    <div className="pwa-bar" role="dialog" aria-label={t('desktop.pwa_install_title')}>
      <img className="pwa-bar__logo" src="/logo.png" alt="" width={40} height={40} />
      <div className="pwa-bar__copy">
        <strong>{t('desktop.pwa_install_title')}</strong>
        <span>{t('desktop.pwa_install_body')}</span>
      </div>
      <div className="pwa-bar__actions">
        <button
          type="button"
          className="pwa-bar__ghost"
          onClick={() => {
            try {
              localStorage.setItem(DISMISS_KEY, '1')
            } catch {
              /* ignore */
            }
            setInstallHidden(true)
          }}
        >
          {t('desktop.pwa_install_dismiss')}
        </button>
        <button
          type="button"
          className="pwa-bar__primary"
          onClick={() => {
            void installEvent.prompt().then(async () => {
              const choice = await installEvent.userChoice
              if (choice.outcome === 'accepted') setInstallEvent(null)
            })
          }}
        >
          {t('desktop.pwa_install_action')}
        </button>
      </div>
    </div>
  )
}
