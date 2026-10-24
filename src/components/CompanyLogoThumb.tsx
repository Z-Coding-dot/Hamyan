import { useEffect, useState } from 'react'

import { useCachedAsset } from '@/hooks/useCachedAsset'

type CompanyLogoThumbProps = {
  logo?: string | null
  name?: string
  className?: string
  fallbackIcon?: string
}

/**
 * Shows a company logo when available; falls back to a building icon if missing or failed to load.
 */
export function CompanyLogoThumb({
  logo,
  name = '',
  className = 'side-switcher-thumb',
  fallbackIcon = 'fa-building',
}: CompanyLogoThumbProps) {
  const src = useCachedAsset(logo)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return (
      <span className={className} aria-hidden="true">
        <i className={`fa-solid ${fallbackIcon}`} />
      </span>
    )
  }

  return (
    <span className={className}>
      <img src={src} alt={name} onError={() => setFailed(true)} />
    </span>
  )
}
