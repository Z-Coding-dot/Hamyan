/** Normalize WhatsApp numbers for wa.me: last 9 digits + Afghanistan code 93. */
export function normalizeWhatsappNumber(raw?: string | null): string | null {
  if (!raw) return null
  const digits = String(raw).replace(/\D/g, '')
  if (!digits) return null
  const local9 = digits.slice(-9)
  if (!local9) return null
  return `93${local9}`
}

export function formatWhatsappDisplay(raw?: string | null): string | null {
  const normalized = normalizeWhatsappNumber(raw)
  if (!normalized) return null
  return `+${normalized}`
}

export function whatsappChatUrl(raw?: string | null, text?: string): string | null {
  const number = normalizeWhatsappNumber(raw)
  if (!number) return null
  if (text && text.trim()) {
    return `https://wa.me/${number}?text=${encodeURIComponent(text)}`
  }
  return `https://wa.me/${number}`
}

/** Open an external URL in a new browser tab. */
export function openExternalUrl(url: string): void {
  window.open(url, '_blank', 'noopener,noreferrer')
}

export const ILGAR_MESSAGES_URL = 'https://ilgar.ten.af'

/** Official Ulanish WhatsApp channel. */
export const ULANISH_WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029VbD4UIaKgsNloO2WSj3z'
