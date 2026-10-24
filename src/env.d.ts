/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_API_ORIGIN?: string
  readonly VITE_SITE_URL?: string
  readonly VITE_DOWNLOAD_WINDOWS_URL?: string
  readonly VITE_DOWNLOAD_ANDROID_URL?: string
  readonly VITE_DOWNLOAD_IOS_URL?: string
  readonly VITE_ISHANCH_WHATSAPP?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare global {
  interface BarcodeDetectorOptions {
    formats?: string[]
  }

  interface DetectedBarcode {
    rawValue: string
    format: string
  }

  class BarcodeDetector {
    constructor(options?: BarcodeDetectorOptions)
    static getSupportedFormats(): Promise<string[]>
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>
  }

  interface Window {
    BarcodeDetector: typeof BarcodeDetector
  }
}

declare module '*.svg' {
  const src: string
  export default src
}

declare module '*.png' {
  const src: string
  export default src
}

export {}
