import logoUrl from '@/assets/logo.png'

type BrandLogoProps = {
  variant?: 'icon' | 'logo'
  /** For icon: square size. For logo: height (width follows aspect). */
  size?: number
  width?: number
  height?: number
  className?: string
}

export function BrandLogo({
  variant = 'icon',
  size = 72,
  width,
  height,
  className,
}: BrandLogoProps) {
  const isLogo = variant === 'logo'
  const src = logoUrl
  const resolvedHeight = height ?? (isLogo ? Math.round(size * 0.4) : size)
  const resolvedWidth = width ?? (isLogo ? size : size)

  return (
    <img
      src={src}
      alt="همیان"
      className={className}
      width={resolvedWidth}
      height={resolvedHeight}
      style={{
        width: resolvedWidth,
        height: resolvedHeight,
        objectFit: 'contain',
        display: 'block',
      }}
    />
  )
}
