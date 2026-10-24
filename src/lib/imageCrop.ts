import type { Area } from 'react-easy-crop'

/** Afghan national ID card aspect (~85.6 × 53.98 mm). Matches project EditScanFront/Back. */
export const ID_SCAN_ASPECT = 1.585

const DEFAULT_MAX_BYTES = 512 * 1024
const DEFAULT_MAX_EDGE = 1600

async function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = reject
    image.src = src
  })
}

async function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob((result) => resolve(result), 'image/jpeg', quality)
  })
  if (!blob) throw new Error('blob')
  return blob
}

/**
 * Crop to the selected area and compress so the JPEG is at most `maxBytes`.
 * Source file size is unrestricted; only the uploaded result is capped.
 */
export async function cropAndCompressImage(
  imageSrc: string,
  crop: Area,
  options?: {
    maxBytes?: number
    maxEdge?: number
    fileName?: string
  },
): Promise<File> {
  const maxBytes = options?.maxBytes ?? DEFAULT_MAX_BYTES
  const maxEdge = options?.maxEdge ?? DEFAULT_MAX_EDGE
  const fileName = options?.fileName ?? `image-${Date.now()}.jpg`

  const image = await loadImage(imageSrc)
  const scale = Math.min(1, maxEdge / Math.max(crop.width, crop.height))
  let outW = Math.max(1, Math.round(crop.width * scale))
  let outH = Math.max(1, Math.round(crop.height * scale))
  let quality = 0.9
  let blob: Blob | null = null

  while (outW >= 240 && outH >= 150) {
    const canvas = document.createElement('canvas')
    canvas.width = outW
    canvas.height = outH
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas')
    ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, outW, outH)

    quality = 0.9
    blob = await canvasToJpegBlob(canvas, quality)
    while (blob.size > maxBytes && quality > 0.4) {
      quality -= 0.07
      blob = await canvasToJpegBlob(canvas, quality)
    }

    if (blob.size <= maxBytes) break
    outW = Math.round(outW * 0.8)
    outH = Math.round(outH * 0.8)
    blob = null
  }

  if (!blob || blob.size > maxBytes) {
    throw new Error('compress_failed')
  }

  return new File([blob], fileName, { type: 'image/jpeg' })
}
