import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { whatsappChatUrl } from '@/lib/whatsapp'

const SUPPORT_NUMBER =
  (import.meta.env.VITE_ISHANCH_WHATSAPP as string | undefined)?.replace(/\D/g, '').trim() ||
  '93703098630'

const NEAR_BOTTOM_PX = 72

function scrollRoots(): Array<HTMLElement | Window> {
  const nodes = [
    document.querySelector('.electron-shell--marketing'),
    document.querySelector('.app-shell-body'),
    document.querySelector('.guest-shell'),
    document.querySelector('.guest-layout'),
  ].filter((el): el is HTMLElement => Boolean(el))

  return [...nodes, window]
}

function isNearBottom(threshold: number): boolean {
  for (const root of scrollRoots()) {
    if (root === window) {
      const doc = document.documentElement
      if (doc.scrollHeight <= window.innerHeight + 4) continue
      const remaining = doc.scrollHeight - window.scrollY - window.innerHeight
      if (remaining <= threshold) return true
      continue
    }

    const el = root
    if (el.scrollHeight <= el.clientHeight + 4) continue
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight
    if (remaining <= threshold) return true
  }
  return false
}

export function HamyanWhatsappFab() {
  const { t } = useTranslation()
  const [raised, setRaised] = useState(false)
  const href = whatsappChatUrl(SUPPORT_NUMBER, t('desktop.ishanch_whatsapp_message'))

  useEffect(() => {
    const update = () => setRaised(isNearBottom(NEAR_BOTTOM_PX))
    update()

    const roots = scrollRoots()
    for (const root of roots) {
      root.addEventListener('scroll', update, { passive: true })
    }
    window.addEventListener('resize', update)

    return () => {
      for (const root of roots) {
        root.removeEventListener('scroll', update)
      }
      window.removeEventListener('resize', update)
    }
  }, [])

  if (!href) return null

  return (
    <a
      className={`ishanch-wa-fab${raised ? ' ishanch-wa-fab--raised' : ''}`}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('desktop.ishanch_whatsapp_label')}
      title={t('desktop.ishanch_whatsapp_label')}
    >
      <i className="fa-brands fa-whatsapp" aria-hidden="true" />
    </a>
  )
}
