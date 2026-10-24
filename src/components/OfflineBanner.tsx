import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

import { useOnlineStatusStore } from '@/store/useOnlineStatusStore'

export function OfflineBanner() {
  const { t } = useTranslation()
  const online = useOnlineStatusStore((state) => state.online)
  const hydrate = useOnlineStatusStore((state) => state.hydrate)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  if (online) return null

  return (
    <div className="offline-banner" role="alert" aria-live="assertive">
      <i className="fa-solid fa-wifi" aria-hidden="true" />
      <span>{t('desktop.offline_banner')}</span>
    </div>
  )
}
