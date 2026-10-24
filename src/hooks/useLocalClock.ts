import { useEffect, useState } from 'react'

import { formatLocalClock, type FormattedClock } from '@/lib/datetime'
import type { SupportedLanguage } from '@/store/useLocaleStore'

export function useLocalClock(locale: SupportedLanguage, tickMs = 1000): FormattedClock {
  const [clock, setClock] = useState(() => formatLocalClock(new Date(), locale))

  useEffect(() => {
    const update = () => setClock(formatLocalClock(new Date(), locale))
    update()
    const id = window.setInterval(update, tickMs)
    return () => window.clearInterval(id)
  }, [locale, tickMs])

  return clock
}
