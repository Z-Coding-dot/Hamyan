import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'

import { apiBaseUrl, appOrigin } from '@/lib/config'

export type InvoicePaperSize = 'a5' | '80mm'

/** A5 sale-invoice visual themes (classic + colorful designs). */
export type InvoicePrintTheme = 'classic' | 'ocean' | 'ember' | 'forest' | 'sky'

export const INVOICE_PRINT_THEMES: InvoicePrintTheme[] = [
  'classic',
  'ocean',
  'ember',
  'forest',
  'sky',
]

const A5_MM = { width: 148, height: 210 } as const
const THERMAL_WIDTH_MM = 80
/** Target export DPI so PNG pixel size maps to physical paper size. */
const EXPORT_DPI = 300
const MM_PER_INCH = 25.4

export function printInvoice(paperSize: InvoicePaperSize = 'a5'): void {
  const body = document.body
  const previous = body.getAttribute('data-print-size')
  body.setAttribute('data-print-size', paperSize)

  const cleanup = () => {
    if (previous) body.setAttribute('data-print-size', previous)
    else body.removeAttribute('data-print-size')
    window.removeEventListener('afterprint', cleanup)
  }

  window.addEventListener('afterprint', cleanup)
  window.print()
}

function mmToPx(mm: number, dpi = EXPORT_DPI): number {
  return Math.round((mm / MM_PER_INCH) * dpi)
}

function paperSizeMm(
  paperSize: InvoicePaperSize,
  contentAspect: number,
): { width: number; height: number } {
  if (paperSize === 'a5') {
    return { width: A5_MM.width, height: A5_MM.height }
  }
  const safeAspect = contentAspect > 0 ? contentAspect : 1
  return { width: THERMAL_WIDTH_MM, height: THERMAL_WIDTH_MM / safeAspect }
}

/** Scale canvas to an exact width in px, preserving aspect (height may exceed one page). */
function scaleCanvasToWidth(source: HTMLCanvasElement, targetWidthPx: number): HTMLCanvasElement {
  const width = Math.max(1, Math.round(targetWidthPx))
  const scale = width / Math.max(1, source.width)
  const height = Math.max(1, Math.round(source.height * scale))
  if (source.width === width && source.height === height) return source

  const target = document.createElement('canvas')
  target.width = width
  target.height = height
  const ctx = target.getContext('2d')
  if (!ctx) return source
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(source, 0, 0, width, height)
  return target
}

/**
 * Thermal (80mm): shrink-wrap onto continuous roll width.
 * A5: lock width to A5; if content fits one page, pad onto a single sheet;
 * if taller, keep full height so PDF can slice into multiple A5 pages.
 */
function prepareExportCanvas(
  source: HTMLCanvasElement,
  paperSize: InvoicePaperSize,
): HTMLCanvasElement {
  if (paperSize === '80mm') {
    const aspect = source.width / Math.max(1, source.height)
    const mm = paperSizeMm(paperSize, aspect)
    const target = document.createElement('canvas')
    target.width = mmToPx(mm.width)
    target.height = mmToPx(mm.height)
    const ctx = target.getContext('2d')
    if (!ctx) return source
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, target.width, target.height)
    const scale = Math.min(target.width / source.width, target.height / source.height)
    const drawW = source.width * scale
    const drawH = source.height * scale
    const dx = (target.width - drawW) / 2
    ctx.drawImage(source, dx, 0, drawW, drawH)
    return target
  }

  const pageW = mmToPx(A5_MM.width)
  const pageH = mmToPx(A5_MM.height)
  const scaled = scaleCanvasToWidth(source, pageW)
  if (scaled.height <= pageH + 2) {
    const target = document.createElement('canvas')
    target.width = pageW
    target.height = pageH
    const ctx = target.getContext('2d')
    if (!ctx) return scaled
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, pageW, pageH)
    const dy = Math.round((pageH - scaled.height) / 2)
    ctx.drawImage(scaled, 0, dy)
    return target
  }
  return scaled
}

/** Slice a tall canvas across fixed-size PDF pages (A5 / A4 style). */
function addCanvasPagesToPdf(
  pdf: InstanceType<typeof jsPDF>,
  canvas: HTMLCanvasElement,
  pageWidthMm: number,
  pageHeightMm: number,
): void {
  const imgWidth = pageWidthMm
  const imgHeight = (canvas.height * imgWidth) / Math.max(1, canvas.width)
  const imgData = canvas.toDataURL('image/png', 1.0)

  let heightLeft = imgHeight
  let position = 0
  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
  heightLeft -= pageHeightMm

  while (heightLeft > 0.5) {
    position = heightLeft - imgHeight
    pdf.addPage([pageWidthMm, pageHeightMm])
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight, undefined, 'FAST')
    heightLeft -= pageHeightMm
  }
}

function dataUrlToBase64(dataUrl: string): string {
  const comma = dataUrl.indexOf(',')
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
}

async function saveExportFile(filename: string, dataBase64: string): Promise<string> {
  const binary = atob(dataBase64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i)
  }
  const isPdf = filename.toLowerCase().endsWith('.pdf')
  const blob = new Blob([bytes], { type: isPdf ? 'application/pdf' : 'image/png' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
  return filename
}

type RenderInvoiceCanvasOptions = {
  /** Force solid white paper/page behind themed accents (image export). */
  solidWhitePaper?: boolean
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('read_failed'))
    reader.readAsDataURL(blob)
  })
}

/** Same-origin / CORS-safe candidates for a logo URL used by html2canvas. */
function imageFetchCandidates(src: string): string[] {
  const out: string[] = []
  const push = (value: string) => {
    if (value && !out.includes(value)) out.push(value)
  }
  push(src)

  try {
    const url = new URL(src, typeof window !== 'undefined' ? window.location.href : appOrigin)
    const path = url.pathname.replace(/^\/+/, '')
    if (path.startsWith('uploaded/')) {
      const apiRoot = apiBaseUrl.replace(/\/$/, '')
      push(`${apiRoot}/public/media/${path}`)
      push(`${appOrigin.replace(/\/$/, '')}/${path}`)
    }
  } catch {
    /* ignore */
  }
  return out
}

async function fetchImageAsDataUrl(src: string): Promise<string | null> {
  if (!src || src.startsWith('data:')) return src || null
  if (src.startsWith('blob:')) {
    try {
      const res = await fetch(src)
      if (!res.ok) return null
      return blobToDataUrl(await res.blob())
    } catch {
      return null
    }
  }

  for (const candidate of imageFetchCandidates(src)) {
    try {
      const res = await fetch(candidate, { mode: 'cors', credentials: 'omit' })
      if (!res.ok) continue
      const blob = await res.blob()
      const type = String(blob.type || '').toLowerCase()
      if (type && !type.startsWith('image/') && !type.includes('svg')) continue
      const dataUrl = await blobToDataUrl(blob)
      if (dataUrl.startsWith('data:')) return dataUrl
    } catch {
      /* try next candidate */
    }
  }
  return null
}

/**
 * Inline <img> sources as data URLs so html2canvas can paint cross-origin logos
 * (ishanch.com → app.ishanch.com/uploaded/...).
 */
async function inlineElementImagesAsDataUrls(root: HTMLElement): Promise<() => void> {
  const imgs = Array.from(root.querySelectorAll('img'))
  const restores: Array<() => void> = []

  await Promise.all(
    imgs.map(async (img) => {
      const original = img.getAttribute('src') || img.currentSrc || img.src
      if (!original || original.startsWith('data:')) return
      const dataUrl = await fetchImageAsDataUrl(original)
      if (!dataUrl || dataUrl === original) return
      restores.push(() => {
        img.src = original
      })
      img.removeAttribute('crossorigin')
      img.src = dataUrl
      try {
        await img.decode()
      } catch {
        /* ignore decode errors; src still usable for canvas */
      }
    }),
  )

  return () => {
    restores.forEach((fn) => fn())
  }
}

export async function renderInvoiceCanvas(
  element: HTMLElement,
  paperSize: InvoicePaperSize,
  onPaperSizeChange?: (size: InvoicePaperSize) => void,
  options: RenderInvoiceCanvasOptions = {},
): Promise<HTMLCanvasElement> {
  const body = document.body
  const previousPrintSize = body.getAttribute('data-print-size')
  onPaperSizeChange?.(paperSize)
  body.setAttribute('data-print-size', paperSize)
  body.setAttribute('data-html2canvas', 'true')
  if (options.solidWhitePaper) {
    body.setAttribute('data-invoice-export-white', 'true')
  }

  const restoreImages = await inlineElementImagesAsDataUrls(element)

  try {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const captured = await html2canvas(element, {
      scale: 3,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
      // letterRendering is supported by html2canvas at runtime
      ...({ letterRendering: true } as object),
      allowTaint: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc, clonedEl) => {
        clonedDoc.body.setAttribute('data-html2canvas', 'true')
        clonedDoc.body.setAttribute('data-print-size', paperSize)
        if (options.solidWhitePaper) {
          clonedDoc.body.setAttribute('data-invoice-export-white', 'true')
          clonedDoc.body.style.background = '#ffffff'
          clonedDoc.documentElement.style.background = '#ffffff'
          const root =
            (clonedEl as HTMLElement | null) ||
            (clonedDoc.querySelector('.invoice-container') as HTMLElement | null)
          if (root) {
            root.style.background = '#ffffff'
            root.style.backgroundImage = 'none'
            root.style.boxShadow = 'none'
          }
          clonedDoc.querySelectorAll('.invoice-container').forEach((node) => {
            const el = node as HTMLElement
            el.style.background = '#ffffff'
            el.style.backgroundImage = 'none'
            el.style.boxShadow = 'none'
          })
        }
      },
    })
    return prepareExportCanvas(captured, paperSize)
  } finally {
    restoreImages()
    body.removeAttribute('data-html2canvas')
    body.removeAttribute('data-invoice-export-white')
    if (previousPrintSize) body.setAttribute('data-print-size', previousPrintSize)
    else body.removeAttribute('data-print-size')
  }
}

export async function downloadInvoiceImage(
  element: HTMLElement,
  invoiceNumber: string | number | null | undefined,
  paperSize: InvoicePaperSize,
  onPaperSizeChange?: (size: InvoicePaperSize) => void,
): Promise<string> {
  const canvas = await renderInvoiceCanvas(element, paperSize, onPaperSizeChange, {
    solidWhitePaper: true,
  })
  const image = canvas.toDataURL('image/png', 1.0)
  const filename = `invoice-${invoiceNumber || 'export'}-${paperSize}.png`
  return saveExportFile(filename, dataUrlToBase64(image))
}

export async function downloadInvoicePdf(
  element: HTMLElement,
  invoiceNumber: string | number | null | undefined,
  paperSize: InvoicePaperSize,
  onPaperSizeChange?: (size: InvoicePaperSize) => void,
): Promise<string> {
  const canvas = await renderInvoiceCanvas(element, paperSize, onPaperSizeChange)

  if (paperSize === 'a5') {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [A5_MM.width, A5_MM.height],
      compress: true,
    })
    addCanvasPagesToPdf(pdf, canvas, A5_MM.width, A5_MM.height)
    const filename = `invoice-${invoiceNumber || 'export'}-a5.pdf`
    const dataBase64 = pdf.output('datauristring').split(',')[1] || ''
    return saveExportFile(filename, dataBase64)
  }

  const image = canvas.toDataURL('image/png', 1.0)
  const contentAspect = canvas.width / Math.max(1, canvas.height)
  const mm = paperSizeMm(paperSize, contentAspect)

  const pdf = new jsPDF({
    orientation: mm.height >= mm.width ? 'portrait' : 'landscape',
    unit: 'mm',
    format: [mm.width, mm.height],
    compress: true,
  })

  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  pdf.addImage(image, 'PNG', 0, 0, pageWidth, pageHeight, undefined, 'FAST')

  const filename = `invoice-${invoiceNumber || 'export'}-${paperSize}.pdf`
  const dataBase64 = pdf.output('datauristring').split(',')[1] || ''
  return saveExportFile(filename, dataBase64)
}

function stripHtmlImages(html: string): string {
  return html.replace(/<img\b[^>]*>/gi, '')
}

async function waitForDocumentImages(doc: Document): Promise<void> {
  const images = Array.from(doc.images)
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.onload = () => resolve()
          img.onerror = () => resolve()
        }),
    ),
  )
}

async function renderHtmlDocumentToCanvas(html: string): Promise<HTMLCanvasElement> {
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.cssText =
    'position:fixed;left:-10000px;top:0;width:794px;height:1123px;opacity:0;pointer-events:none;border:0;'
  document.body.appendChild(iframe)

  try {
    const doc = iframe.contentDocument
    if (!doc) throw new Error('pdf_iframe')
    doc.open()
    doc.write(html)
    doc.close()
    await new Promise((resolve) => setTimeout(resolve, 350))
    await waitForDocumentImages(doc)

    const target = doc.body
    return await html2canvas(target, {
      scale: 2,
      logging: false,
      useCORS: true,
      backgroundColor: '#ffffff',
      allowTaint: true,
      windowWidth: 794,
      windowHeight: Math.max(target.scrollHeight, 1123),
    })
  } finally {
    iframe.remove()
  }
}

/** Multi-page A4 PDF from a full HTML document (customer/vendor show). */
export async function downloadHtmlAsA4Pdf(html: string, filename: string): Promise<string> {
  let canvas: HTMLCanvasElement
  try {
    canvas = await renderHtmlDocumentToCanvas(html)
  } catch {
    canvas = await renderHtmlDocumentToCanvas(stripHtmlImages(html))
  }

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })
  addCanvasPagesToPdf(
    pdf,
    canvas,
    pdf.internal.pageSize.getWidth(),
    pdf.internal.pageSize.getHeight(),
  )

  const safeName = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`
  const dataBase64 = pdf.output('datauristring').split(',')[1] || ''
  return saveExportFile(safeName, dataBase64)
}
