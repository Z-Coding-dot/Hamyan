import { useEffect, useState } from 'react'

import { DURATION_MS, HOLD_MS } from './logoMath'

/**
 * Drives logo animation progress 0→1 with optional loop + hold pause.
 * Progress stays at 1 during hold, then resets to 0 when looping.
 */
export function useLogoProgress(loop: boolean, holdMs: number = HOLD_MS, durationMs = DURATION_MS) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let cancelled = false
    let cycleStart = performance.now()
    let holding = false
    let holdStart = 0

    const tick = (now: number) => {
      if (cancelled) return

      if (holding) {
        if (now - holdStart >= holdMs) {
          if (!loop) {
            setProgress(1)
            return
          }
          holding = false
          cycleStart = now
          setProgress(0)
        } else {
          setProgress(1)
        }
      } else {
        const elapsed = now - cycleStart
        const p = Math.min(1, elapsed / durationMs)
        setProgress(p)
        if (p >= 1) {
          holding = true
          holdStart = now
        }
      }
    }

    // setInterval works when Electron keeps the window hidden (rAF is paused).
    const interval = window.setInterval(() => tick(performance.now()), 16)
    tick(cycleStart)

    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [durationMs, holdMs, loop])

  return progress
}
