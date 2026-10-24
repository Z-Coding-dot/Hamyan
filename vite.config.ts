import fs from 'node:fs'
import path from 'node:path'
import { resolve } from 'path'
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

/** Serve `ishanch-web/download/*` at `/download/*` (dev + preview). */
function serveInstallerDownloads(): Plugin {
  const downloadRoot = resolve(__dirname, 'download')

  const middleware = (
    req: { url?: string },
    res: {
      setHeader: (name: string, value: string) => void
      statusCode: number
      end: (body?: string) => void
    },
    next: () => void,
  ) => {
    const rawPath = (req.url || '/').split('?')[0] || '/'
    const relative = decodeURIComponent(rawPath.replace(/^\/+/, ''))
    if (!relative || relative.includes('..')) {
      next()
      return
    }

    const filePath = resolve(downloadRoot, relative)
    const outside =
      path.relative(downloadRoot, filePath).startsWith('..') ||
      path.isAbsolute(path.relative(downloadRoot, filePath))
    if (outside || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      next()
      return
    }

    const filename = path.basename(filePath)
    res.setHeader('Content-Type', 'application/octet-stream')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', String(fs.statSync(filePath).size))
    fs.createReadStream(filePath).pipe(res as unknown as NodeJS.WritableStream)
  }

  return {
    name: 'serve-ishanch-download',
    configureServer(server) {
      server.middlewares.use('/download', middleware)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/download', middleware)
    },
  }
}

export default defineConfig({
  plugins: [
    serveInstallerDownloads(),
    react(),
    VitePWA({
      registerType: 'prompt',
      injectRegister: false,
      includeAssets: [
        'favicon.svg',
        'favicon-32.png',
        'apple-touch-icon.png',
        'logo.png',
        'og-image.png',
        'offline.html',
        'robots.txt',
        'sitemap.xml',
        'sitemap-pages.xml',
        'icons/*.png',
        'screenshots/*.png',
      ],
      manifest: {
        id: 'http://localhost:5177/',
        name: 'همیان | Hamyan',
        short_name: 'همیان',
        description: 'همیان — مصارف و معاملات شخصی با همان حساب اولنیش.',
        lang: 'fa',
        dir: 'rtl',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
        orientation: 'any',
        background_color: '#F3F7FC',
        theme_color: '#0D2B7E',
        categories: ['business', 'finance', 'productivity'],
        prefer_related_applications: false,
        launch_handler: { client_mode: 'navigate-existing' },
        icons: [
          { src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          {
            name: 'ورود',
            short_name: 'ورود',
            url: '/login',
            icons: [{ src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'ثبت‌نام',
            short_name: 'ثبت‌نام',
            url: '/register',
            icons: [{ src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'مصارف',
            short_name: 'مصارف',
            url: '/expenses',
            icons: [{ src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'معاملات',
            short_name: 'معاملات',
            url: '/accounts',
            icons: [{ src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
          {
            name: 'مرکز کمک',
            short_name: 'کمک',
            url: '/help',
            icons: [{ src: '/icons/pwa-192.png', sizes: '192x192', type: 'image/png' }],
          },
        ],
        screenshots: [
          {
            src: '/screenshots/wide.png',
            sizes: '1280x720',
            type: 'image/png',
            form_factor: 'wide',
            label: 'میز کار همیان برای مصارف شخصی',
          },
          {
            src: '/screenshots/mobile.png',
            sizes: '750x1334',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'همیان روی موبایل',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/download\//, /^\/uploaded\//, /^\/sanctum/],
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webmanifest}'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        navigationPreload: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hamyan-google-fonts-styles',
              expiration: { maxEntries: 8, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'hamyan-google-fonts',
              expiration: { maxEntries: 16, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ url, request }) =>
              request.method === 'GET' &&
              (url.pathname.startsWith('/uploaded/') ||
                (url.origin === 'https://app.ishanch.com' && url.pathname.startsWith('/uploaded/'))),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'hamyan-uploads',
              expiration: { maxEntries: 120, maxAgeSeconds: 60 * 60 * 24 * 14 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: ({ request, url }) =>
              request.method === 'GET' && request.destination === 'image' && !url.pathname.startsWith('/api'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'hamyan-images',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@locales': resolve(__dirname, 'locales'),
    },
  },
  server: {
    port: 5177,
    proxy: {
      // Local Laravel API — avoids browser CORS when developing on :5173
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploaded': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/uploaded': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/sanctum': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
