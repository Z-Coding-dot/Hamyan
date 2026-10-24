import { useEffect, useRef, useState } from 'react'

const BRAND = '#1463F3'

type Props = {
  text: string
  active?: boolean
  /** Delay before typing starts (ms). */
  startDelayMs?: number
  className?: string
  onComplete?: () => void
}

function charDelay(char: string, baseMs: number): number {
  if (char === '،' || char === ',' || char === '؛' || char === ';') return baseMs * 4.2
  if (char === ' ') return baseMs * 0.55
  return baseMs
}

/** Reveals `text` character-by-character with a blinking cursor. */
export function TypewriterText({
  text,
  active = true,
  startDelayMs = 420,
  className,
  onComplete,
}: Props) {
  const [visibleCount, setVisibleCount] = useState(0)
  const [cursorOn, setCursorOn] = useState(true)
  const doneRef = useRef(false)

  useEffect(() => {
    if (!active) {
      setVisibleCount(0)
      doneRef.current = false
      return
    }

    setVisibleCount(0)
    doneRef.current = false
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let index = 0

    const tick = () => {
      if (cancelled) return
      index += 1
      setVisibleCount(index)
      if (index >= text.length) {
        if (!doneRef.current) {
          doneRef.current = true
          onComplete?.()
        }
        return
      }
      timer = setTimeout(tick, charDelay(text[index - 1] ?? '', 52))
    }

    timer = setTimeout(tick, startDelayMs)

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [active, onComplete, startDelayMs, text])

  useEffect(() => {
    if (!active) {
      setCursorOn(false)
      return
    }
    setCursorOn(true)
    const id = window.setInterval(() => setCursorOn((v) => !v), 460)
    return () => window.clearInterval(id)
  }, [active])

  const shown = text.slice(0, visibleCount)

  return (
    <span className={['typewriter-text', className].filter(Boolean).join(' ')}>
      <span className="typewriter-text__content">{shown}</span>
      <span
        className="typewriter-text__cursor"
        style={{
          backgroundColor: BRAND,
          opacity: active && cursorOn ? 1 : active ? 0.15 : 0,
        }}
        aria-hidden="true"
      />
    </span>
  )
}
