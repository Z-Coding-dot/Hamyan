import type { CSSProperties } from 'react'

import './logo-classic.css'

type Props = {
  size?: number
  className?: string
  style?: CSSProperties
  /** Plays once by default; set loop for continuous CSS animation. */
  loop?: boolean
}

/**
 * CSS-accurate Hamyan logo — archived port of project/public/css/logo.css.
 * Kept for later use; primary UI uses HamyanLogoAnimation.
 */
export function HamyanLogoAnimationClassic({
  size = 100,
  className,
  style,
  loop = false,
}: Props) {
  return (
    <div
      className={['ishanch-logo-classic', className].filter(Boolean).join(' ')}
      style={{ width: size, height: size, ...style }}
      aria-hidden="true"
      data-loop={loop ? 'true' : 'false'}
    >
      <div className="ishanch-logo-classic__icon">
        <div className="ishanch-logo-classic__circle">
          <div className="ishanch-logo-classic__first-t" />
          <div className="ishanch-logo-classic__sec-t">
            <div className="ishanch-logo-classic__lineup" />
            <div className="ishanch-logo-classic__lineright" />
            <div className="ishanch-logo-classic__linedown" />
          </div>
          <div className="ishanch-logo-classic__third-t" />
          <div className="ishanch-logo-classic__fourth-t" />
        </div>
      </div>
    </div>
  )
}
