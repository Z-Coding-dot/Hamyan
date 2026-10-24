import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { HamyanLogoAnimation } from './IshanchLogoAnimation'
import { TypewriterText } from './TypewriterText'

const MODAL_HOLD_MS = 2000

type Props = {
  visible: boolean
  onClose: () => void
}

/** Full-screen logo showcase with typewriter tagline — enter/exit animation. */
export function LogoFullscreenModal({ visible, onClose }: Props) {
  const { t, i18n } = useTranslation()
  const [mounted, setMounted] = useState(visible)
  const [phase, setPhase] = useState<'enter' | 'shown' | 'exit'>('enter')
  const [typingActive, setTypingActive] = useState(false)
  const isRtl = i18n.dir() === 'rtl'
  const tagline = t('desktop.logo_modal_tagline')
  const [logoSize, setLogoSize] = useState(() =>
    typeof window !== 'undefined' ? Math.min(window.innerWidth, window.innerHeight) * 0.38 : 220,
  )

  useEffect(() => {
    const onResize = () => {
      setLogoSize(Math.min(window.innerWidth, window.innerHeight) * 0.38)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    if (visible) {
      setMounted(true)
      setPhase('enter')
      setTypingActive(false)
      const enterTimer = window.setTimeout(() => {
        setPhase('shown')
        setTypingActive(true)
      }, 40)
      return () => window.clearTimeout(enterTimer)
    }

    if (!mounted) return

    setTypingActive(false)
    setPhase('exit')
    const exitTimer = window.setTimeout(() => setMounted(false), 340)
    return () => window.clearTimeout(exitTimer)
  }, [mounted, visible])

  useEffect(() => {
    if (!mounted) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mounted, onClose])

  if (!mounted) return null

  return (
    <div
      className={`logo-fullscreen-modal logo-fullscreen-modal--${phase}`}
      role="dialog"
      aria-modal="true"
      aria-label={t('desktop.app_name')}
    >
      <div className="logo-fullscreen-modal__backdrop" />

      <div className="logo-fullscreen-modal__stage">
        <HamyanLogoAnimation size={logoSize} loop holdMs={MODAL_HOLD_MS} />
        <div className="logo-fullscreen-modal__tagline">
          <TypewriterText text={tagline} active={typingActive} startDelayMs={180} />
        </div>
      </div>

      <button
        type="button"
        className="logo-fullscreen-modal__close"
        style={isRtl ? { right: 14, left: 'auto' } : { left: 14, right: 'auto' }}
        onClick={onClose}
        aria-label="Close"
      >
        <i className="fa-solid fa-xmark" aria-hidden="true" />
      </button>
    </div>
  )
}
