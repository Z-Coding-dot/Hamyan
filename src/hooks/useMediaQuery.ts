import { useEffect, useState } from 'react'

/** Match CSS mobile sidebar breakpoint. */
export const SIDEBAR_MOBILE_MQ = '(max-width: 900px)'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.matchMedia(query).matches
  })

  useEffect(() => {
    const media = window.matchMedia(query)
    const onChange = () => setMatches(media.matches)
    onChange()
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export function useIsMobileSidebar(): boolean {
  return useMediaQuery(SIDEBAR_MOBILE_MQ)
}
