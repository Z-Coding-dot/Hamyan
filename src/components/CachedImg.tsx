import { type ImgHTMLAttributes } from 'react'

import { useCachedAsset } from '@/hooks/useCachedAsset'

type CachedImgProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  path?: string | null
  /** Optional remote/absolute override; path is preferred for API asset paths. */
  remoteUrl?: string | null
}

/**
 * Image that loads from the local Electron media cache when possible.
 */
export function CachedImg({ path, remoteUrl, alt = '', ...imgProps }: CachedImgProps) {
  const cached = useCachedAsset(path ?? remoteUrl)
  if (!cached) return null
  return <img src={cached} alt={alt} {...imgProps} />
}
