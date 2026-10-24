import { useEffect, useState } from 'react'

import { assetUrl } from '@/lib/config'
import { resolveCachedAsset } from '@/lib/mediaCache'

/**
 * Returns a local-cached image URL when Electron media cache is available;
 * otherwise falls back to the remote asset URL.
 */
export function useCachedAsset(path?: string | null): string | null {
  const remote = assetUrl(path)
  const [src, setSrc] = useState<string | null>(remote)

  useEffect(() => {
    let active = true
    setSrc(remote)
    if (!remote) return

    void resolveCachedAsset(path).then((resolved) => {
      if (active && resolved) setSrc(resolved)
    })

    return () => {
      active = false
    }
  }, [path, remote])

  return src
}
