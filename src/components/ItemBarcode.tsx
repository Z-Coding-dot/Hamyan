import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import JsBarcode from 'jsbarcode'

type Props = {
  value?: string | null
  width?: number
  height?: number
  fontSize?: number
  className?: string
  downloadName?: string
}

export function ItemBarcode({
  value,
  width = 2,
  height = 60,
  fontSize = 12,
  className = '',
  downloadName,
}: Props) {
  const { t } = useTranslation()
  const svgRef = useRef<SVGSVGElement | null>(null)

  useEffect(() => {
    if (!svgRef.current || !value) return
    try {
      JsBarcode(svgRef.current, String(value), {
        format: 'CODE128',
        lineColor: '#000000',
        width,
        height,
        displayValue: true,
        fontSize,
        margin: 8,
      })
    } catch {
      /* invalid barcode value */
    }
  }, [value, width, height, fontSize])

  const handleDownload = () => {
    if (!svgRef.current || !value) return
    try {
      const svg = svgRef.current
      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svg)
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(svgBlob)
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) return
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        canvas.toBlob((blob) => {
          if (!blob) return
          const pngUrl = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = pngUrl
          a.download = `${downloadName || `ishanch-barcode-${value}`}.png`
          document.body.appendChild(a)
          a.click()
          a.remove()
          URL.revokeObjectURL(pngUrl)
        }, 'image/png')
      }
      img.onerror = () => URL.revokeObjectURL(url)
      img.src = url
    } catch {
      /* ignore */
    }
  }

  if (!value) return null

  return (
    <div
      className={`item-barcode ${className}`.trim()}
      title={t('desktop.double_click_to_download')}
      onDoubleClick={handleDownload}
    >
      <svg ref={svgRef} />
      <small className="item-barcode__hint">{t('desktop.double_click_to_download')}</small>
    </div>
  )
}
