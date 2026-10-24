const PREFIX = 'hamyan_web_page_'

export function readPageCache<T>(userKey: string, page: string): T | null {
  if (!userKey) return null
  try {
    const raw = localStorage.getItem(`${PREFIX}${userKey}_${page}`)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writePageCache<T>(userKey: string, page: string, value: T): void {
  if (!userKey) return
  try {
    localStorage.setItem(`${PREFIX}${userKey}_${page}`, JSON.stringify(value))
  } catch {
    /* the device may refuse a large write; the page still works from the network */
  }
}
