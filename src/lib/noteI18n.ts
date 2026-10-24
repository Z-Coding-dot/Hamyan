import type { UserNote } from '@/lib/user'

/** Maps stored note.type values (English) to i18n keys (project lang notes.php). */
const NOTE_TYPE_KEYS: Record<string, string> = {
  'Referral Bonus': 'referralBonus',
  'Network Building': 'networkBuilding',
  'Marketing Bonus': 'marketingBonus',
  'Marketing Bonus Approved': 'marketingBonusApproved',
  BonusApproved: 'BonusApproved',
  DepositApproved: 'DepositApproved',
  depositSuccess: 'depositSuccess',
  depositRejected: 'depositRejected',
  paymentSuccess: 'paymentSuccess',
  paymentFailed: 'paymentFailed',
  completeYourKyc: 'completeYourKyc',
  kycCompletionAsked: 'kycCompletionAsked',
  kycAccepted: 'kycAccepted',
  kycRejected: 'kycRejected',
  KycAccepted: 'kycAccepted',
  KycRejected: 'kycRejected',
  KYCAccepted: 'kycAccepted',
  KYCRejected: 'kycRejected',
  DepositRejected: 'depositRejected',
  DepositSuccess: 'depositSuccess',
  PaymentSuccess: 'paymentSuccess',
  PaymentFailed: 'paymentFailed',
}

function toNoteKeyCandidate(type: string): string {
  const mapped = NOTE_TYPE_KEYS[type]
  if (mapped) return mapped

  // "Some Type Name" → someTypeName / Soft fallbacks for free-form types
  const compact = type.replace(/[^a-zA-Z0-9]+/g, ' ').trim()
  if (!compact) return type

  const camel = compact
    .split(/\s+/)
    .map((part, index) => {
      const lower = part.toLowerCase()
      if (index === 0) return lower
      return lower.charAt(0).toUpperCase() + lower.slice(1)
    })
    .join('')

  return NOTE_TYPE_KEYS[camel] || camel
}

/** Localize a notification/note type the same way project Note.jsx + notes.php do. */
export function translateNoteType(
  type: string | null | undefined,
  t: (key: string) => string,
): string {
  const raw = String(type || '').trim()
  if (!raw) return t('desktop.notification')

  const candidate = toNoteKeyCandidate(raw)
  const key = `desktop.note_${candidate}`
  const translated = t(key)
  if (translated && translated !== key) return translated

  // Last resort: try exact type as key suffix
  const exactKey = `desktop.note_${raw}`
  const exact = t(exactKey)
  if (exact && exact !== exactKey) return exact

  return raw
}

export function translateNote(note: Pick<UserNote, 'type' | 'title' | 'body'>, t: (key: string) => string): {
  title: string
  body: string | null
} {
  const title = translateNoteType(note.type || note.title, t)
  const body = note.body?.trim() ? note.body : null
  return { title, body }
}
