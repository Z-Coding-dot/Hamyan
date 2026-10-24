import { apiBaseUrl, assetUrl } from '@/lib/config'

const DB_NAME = 'hamyan_web_media_v1'
const STORE = 'assets'
const META_KEY = 'hamyan_web_media_meta_v1'

type MediaMeta = Record<string, number>

let dbPromise: Promise<IDBDatabase> | null = null
const memory = new Map<string, string>()
const inflight = new Map<string, Promise<string | null>>()

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise
  dbPromise = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('indexedDB unavailable'))
      return
    }
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error || new Error('indexedDB open failed'))
  })
  return dbPromise
}

function idbGet(key: string): Promise<Blob | null> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readonly')
        const req = tx.objectStore(STORE).get(key)
        req.onsuccess = () => resolve((req.result as Blob | undefined) || null)
        req.onerror = () => reject(req.error)
      }),
  )
}

function idbPut(key: string, value: Blob): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).put(value, key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }),
  )
}

function idbDelete(key: string): Promise<void> {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction(STORE, 'readwrite')
        tx.objectStore(STORE).delete(key)
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
      }),
  )
}

function readMeta(): MediaMeta {
  try {
    const raw = localStorage.getItem(META_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as MediaMeta
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeMeta(meta: MediaMeta) {
  try {
    localStorage.setItem(META_KEY, JSON.stringify(meta))
  } catch {
    /* ignore */
  }
}

function markCached(path: string) {
  const meta = readMeta()
  meta[path] = Date.now()
  writeMeta(meta)
}

function unmarkCached(path: string) {
  const meta = readMeta()
  if (!(path in meta)) return
  delete meta[path]
  writeMeta(meta)
}

function cacheKey(path: string) {
  return String(path || '').trim()
}

async function blobToObjectUrl(blob: Blob): Promise<string> {
  return URL.createObjectURL(blob)
}

function mediaProxyUrl(path: string): string | null {
  const relative = String(path || '')
    .trim()
    .replace(/^\/+/, '')
  if (!relative.startsWith('uploaded/')) return null
  return `${apiBaseUrl.replace(/\/$/, '')}/public/media/${relative}`
}

async function fetchAndStore(path: string, remote: string): Promise<string | null> {
  const candidates = [remote, mediaProxyUrl(path)].filter(Boolean) as string[]

  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { credentials: 'omit', mode: 'cors' })
      if (!response.ok) continue
      const blob = await response.blob()
      if (!blob.type.startsWith('image/') && !blob.type.includes('svg')) continue
      try {
        await idbPut(cacheKey(path), blob)
        markCached(path)
      } catch {
        /* storage full — still return object URL */
      }
      const url = await blobToObjectUrl(blob)
      memory.set(path, url)
      return url
    } catch {
      /* try next candidate */
    }
  }
  return remote
}

/** Web: resolve from memory/IndexedDB local cache, else fetch once and persist. */
export async function resolveCachedAsset(path?: string | null): Promise<string | null> {
  const remote = assetUrl(path)
  if (!path || !remote) return remote

  const key = cacheKey(path)
  const mem = memory.get(key)
  if (mem) return mem

  const pending = inflight.get(key)
  if (pending) return pending

  const task = (async () => {
    try {
      const blob = await idbGet(key)
      if (blob) {
        const url = await blobToObjectUrl(blob)
        memory.set(key, url)
        markCached(path)
        return url
      }
    } catch {
      /* fall through to network */
    }
    return fetchAndStore(path, remote)
  })().finally(() => {
    inflight.delete(key)
  })

  inflight.set(key, task)
  return task
}

export function prefetchCachedAssets(paths: Array<string | null | undefined>): void {
  const unique = Array.from(new Set(paths.map((p) => (p ? String(p).trim() : '')).filter(Boolean)))
  unique.forEach((path) => {
    void resolveCachedAsset(path)
  })
}

export function forgetCachedAsset(path?: string | null): void {
  if (!path) return
  const key = cacheKey(path)
  const mem = memory.get(key)
  if (mem?.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(mem)
    } catch {
      /* ignore */
    }
  }
  memory.delete(key)
  unmarkCached(path)
  void idbDelete(key).catch(() => undefined)
}
