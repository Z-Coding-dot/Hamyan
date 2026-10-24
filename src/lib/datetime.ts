import type { SupportedLanguage } from '@/store/useLocaleStore'

export type FormattedClock = {
  jalaliDate: string
  jalaliTime: string
  jalaliFull: string
  gregorianFull: string
  gregorianDate: string
  gregorianTime: string
}

// Afghan solar hijri month names (Dari) — same as project StaffShow.jsx
const AFGHAN_SOLAR_MONTHS_FA = [
  'حمل',
  'ثور',
  'جوزا',
  'سرطان',
  'اسد',
  'سنبله',
  'میزان',
  'عقرب',
  'قوس',
  'جدی',
  'دلو',
  'حوت',
] as const

const AFGHAN_SOLAR_MONTHS_PS = [
  'ورى',
  'غويى',
  'غبرگولى',
  'چنګاښ',
  'زمرى',
  'وږى',
  'تله',
  'لړم',
  'ليندۍ',
  'مرغومى',
  'سلواغه',
  'كب',
] as const

const AFGHAN_SOLAR_MONTHS_EN = [
  'Hamal',
  'Saur',
  'Jawza',
  'Saratan',
  'Asad',
  'Sonbola',
  'Mizan',
  'Aqrab',
  'Qaws',
  'Jadi',
  'Dalw',
  'Hut',
] as const

// Weekdays: index 0 = Sunday … 6 = Saturday
const WEEKDAYS_FA = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
] as const

const WEEKDAYS_PS = [
  'يونۍ',
  'درېنۍ',
  'څلرنۍ',
  'پينځنۍ',
  'ادينه',
  'جمعه',
  'شنبه',
] as const

const WEEKDAYS_EN = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const

/** Civil dates for money follow Asia/Kabul (no daylight saving). */
export const BUSINESS_TIMEZONE = 'Asia/Kabul'

function businessNoonUtc(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day, 7, 30, 0))
}

export function toBusinessYmd(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000'
  const month = parts.find((part) => part.type === 'month')?.value ?? '01'
  const day = parts.find((part) => part.type === 'day')?.value ?? '01'
  return `${year}-${month}-${day}`
}

function getSolarParts(date: Date): { year: number; month: number; day: number } {
  const parts = new Intl.DateTimeFormat('en-u-ca-persian', {
    timeZone: BUSINESS_TIMEZONE,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(date)

  return {
    year: Number(parts.find((part) => part.type === 'year')?.value ?? 0),
    month: Number(parts.find((part) => part.type === 'month')?.value ?? 1),
    day: Number(parts.find((part) => part.type === 'day')?.value ?? 1),
  }
}

function monthNames(locale: SupportedLanguage): readonly string[] {
  if (locale === 'ps') return AFGHAN_SOLAR_MONTHS_PS
  if (locale === 'en') return AFGHAN_SOLAR_MONTHS_EN
  return AFGHAN_SOLAR_MONTHS_FA
}

function weekdayNames(locale: SupportedLanguage): readonly string[] {
  if (locale === 'ps') return WEEKDAYS_PS
  if (locale === 'en') return WEEKDAYS_EN
  return WEEKDAYS_FA
}

export function jalaliMonthName(month: number, locale: SupportedLanguage): string {
  return monthNames(locale)[month - 1] ?? ''
}

export function weekdayName(jsWeekday: number, locale: SupportedLanguage): string {
  return weekdayNames(locale)[jsWeekday] ?? ''
}

function formatAfghanSolarDate(date: Date, locale: SupportedLanguage, includeWeekday = true): string {
  const { year, month, day } = getSolarParts(date)
  const months = monthNames(locale)
  const weekdays = weekdayNames(locale)
  const monthLabel = months[month - 1] ?? ''
  const weekdayLabel = weekdays[date.getDay()] ?? ''
  const core = `${day} ${monthLabel} ${year}`

  if (locale === 'en') {
    return includeWeekday ? `${weekdayLabel}, ${core}` : core
  }

  return includeWeekday ? `${weekdayLabel}، ${core}` : core
}

function formatLocalTime(date: Date, _locale: SupportedLanguage = 'fa'): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
}

function gregorianFormatters() {
  return {
    gregorianDate: new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    gregorianTime: new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
    gregorianFull: new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }),
  }
}

export function formatLocalClock(date = new Date(), locale: SupportedLanguage = 'fa'): FormattedClock {
  const jalaliDate = formatAfghanSolarDate(date, locale, true)
  const jalaliTime = formatLocalTime(date, locale)
  const jalaliFull = `${jalaliDate} — ${jalaliTime}`
  const gregorian = gregorianFormatters()

  return {
    jalaliDate,
    jalaliTime,
    jalaliFull,
    gregorianFull: gregorian.gregorianFull.format(date),
    gregorianDate: gregorian.gregorianDate.format(date),
    gregorianTime: gregorian.gregorianTime.format(date),
  }
}

function parseDateLike(value: string): Date | null {
  const trimmed = value.trim()
  if (!trimmed) return null
  const ymd = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed)
  if (ymd) return businessNoonUtc(Number(ymd[1]), Number(ymd[2]), Number(ymd[3]))
  const date = new Date(trimmed)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toLocalYmd(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayLocalYmd(): string {
  return toBusinessYmd(new Date())
}

export function businessWeekday(ymd: string): number {
  const date = parseDateLike(ymd)
  if (!date) return 0
  const name = new Intl.DateTimeFormat('en-US', {
    timeZone: BUSINESS_TIMEZONE,
    weekday: 'short',
  }).format(date)
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
  return map[name] ?? 0
}

export function gregorianYmdToJalali(ymd: string): JalaliParts | null {
  const date = parseDateLike(ymd)
  if (!date) return null
  return getSolarParts(date)
}

export function shiftJalaliMonth(year: number, month: number, delta: number): JalaliParts {
  const index = year * 12 + (month - 1) + delta
  const nextYear = Math.floor(index / 12)
  const nextMonth = ((index % 12) + 12) % 12
  return { year: nextYear, month: nextMonth + 1, day: 1 }
}

export function jalaliMonthBounds(year: number, month: number): { start: string; endExclusive: string } {
  const next = shiftJalaliMonth(year, month, 1)
  return {
    start: jalaliToGregorianYmd(year, month, 1),
    endExclusive: jalaliToGregorianYmd(next.year, next.month, 1),
  }
}

export function addBusinessDays(ymd: string, days: number): string {
  const date = parseDateLike(ymd)
  if (!date) return ymd
  return toBusinessYmd(new Date(date.getTime() + days * 86_400_000))
}

export function businessDaySpan(start: string, endExclusive: string): number {
  const from = parseDateLike(start)
  const to = parseDateLike(endExclusive)
  if (!from || !to) return 0
  return Math.round((to.getTime() - from.getTime()) / 86_400_000)
}

export type JalaliParts = { year: number; month: number; day: number }

export function dateToJalaliParts(date: Date): JalaliParts {
  return getSolarParts(date)
}

/** Convert Jalali Y/M/D to Gregorian YYYY-MM-DD (local civil date). */
export function jalaliToGregorianYmd(year: number, month: number, day: number): string {
  let date = businessNoonUtc(year + 621, Math.max(1, month), Math.min(day, 28))
  const step = (base: Date, days: number) => new Date(base.getTime() + days * 86_400_000)
  for (let i = 0; i < 48; i += 1) {
    const parts = getSolarParts(date)
    const delta = (year - parts.year) * 365 + (month - parts.month) * 30 + (day - parts.day)
    if (delta === 0) break
    date = step(date, delta)
  }
  for (let i = 0; i < 8; i += 1) {
    const parts = getSolarParts(date)
    if (parts.year === year && parts.month === month && parts.day === day) {
      return toBusinessYmd(date)
    }
    const behind =
      parts.year < year ||
      (parts.year === year && (parts.month < month || (parts.month === month && parts.day < day)))
    date = step(date, behind ? 1 : -1)
  }
  return toBusinessYmd(date)
}

export function jalaliMonthLength(year: number, month: number): number {
  const start = parseDateLike(jalaliToGregorianYmd(year, month, 1))
  if (!start) return 30
  let cursor = new Date(start)
  let count = 0
  while (count < 32) {
    const parts = getSolarParts(cursor)
    if (parts.year !== year || parts.month !== month) break
    count += 1
    cursor = new Date(cursor.getTime() + 86_400_000)
  }
  return count || 30
}

export function formatJalaliSlashFromYmd(ymd: string | null | undefined): string {
  if (!ymd) return '—'
  const date = parseDateLike(ymd)
  if (!date) return String(ymd)
  const { year, month, day } = getSolarParts(date)
  return `${year}/${month}/${day}`
}

/** Format an ISO/date string as Afghan solar date (short, no weekday). */
export function formatAfghanDateValue(
  value: string | null | undefined,
  locale: SupportedLanguage = 'fa',
): string {
  if (!value) return '—'
  const date = parseDateLike(value)
  if (!date) return String(value)
  return formatAfghanSolarDate(date, locale, false)
}

/** Format as jYYYY/jM/jD (numeric solar). */
export function formatJalaliSlash(
  value: string | null | undefined,
  _locale: SupportedLanguage = 'fa',
): string {
  if (!value) return '—'
  const date = parseDateLike(value)
  if (!date) return String(value)
  const { year, month, day } = getSolarParts(date)
  return `${year}/${month}/${day}`
}

/** Format as jYYYY/jM/jD HH:mm (numeric solar + Latin time). */
export function formatJalaliDateTime(
  value: string | null | undefined,
  _locale: SupportedLanguage = 'fa',
): string {
  if (!value) return '—'
  const date = parseDateLike(value)
  if (!date) return String(value)
  const { year, month, day } = getSolarParts(date)
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

export function isCompanyValidOnDate(
  validUpTo: string | null | undefined,
  now = new Date(),
): boolean {
  if (!validUpTo) return false
  const end = new Date(validUpTo)
  if (Number.isNaN(end.getTime())) return false
  end.setHours(23, 59, 59, 999)
  return end.getTime() >= now.setHours(0, 0, 0, 0)
}
