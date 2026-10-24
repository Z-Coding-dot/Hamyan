import { useEffect, useState } from 'react'

import type { PublicSlider } from '@/lib/publicCompanyWebsite'
import { useCachedAsset } from '@/hooks/useCachedAsset'

type Props = {
  slides: PublicSlider[]
  interval?: number
}

export function PublicWebsiteCarousel({ slides, interval = 3500 }: Props) {
  const list = slides.filter((s) => s.image)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (list.length <= 1) return
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % list.length)
    }, interval)
    return () => window.clearInterval(timer)
  }, [list.length, interval])

  if (!list.length) return null

  const current = list[index]

  return (
    <div className="cw-carousel">
      <div className="cw-carousel__frame">
        <SlideImage key={current.id} path={current.image} />
      </div>
      {list.length > 1 ? (
        <div className="cw-carousel__dots">
          {list.map((slide, i) => (
            <button
              key={slide.id}
              type="button"
              className={i === index ? 'is-active' : ''}
              aria-label={`slide ${i + 1}`}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}

function SlideImage({ path }: { path?: string | null }) {
  const src = useCachedAsset(path)
  if (!src) return null
  return <img src={src} alt="" className="cw-carousel__img" />
}
