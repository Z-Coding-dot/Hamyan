import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import {
  businessWeekday,
  dateToJalaliParts,
  gregorianYmdToJalali,
  jalaliMonthLength,
  jalaliMonthName,
  jalaliToGregorianYmd,
  todayLocalYmd,
  weekdayName,
} from '@/lib/datetime'
import { useLocaleStore } from '@/store/useLocaleStore'

type Props = {
  value: string
  onChange: (ymd: string) => void
  disabled?: boolean
  allowEmpty?: boolean
  id?: string
}

const WEEK_ORDER = [6, 0, 1, 2, 3, 4, 5] as const

function ymdToJalali(ymd: string) {
  return gregorianYmdToJalali(ymd) ?? dateToJalaliParts(new Date())
}

export function JalaliDatePicker({ value, onChange, disabled, allowEmpty, id }: Props) {
  const { t } = useTranslation()
  const locale = useLocaleStore((s) => s.language)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [popPos, setPopPos] = useState<{ top: number; left: number; width: number } | null>(null)
  const selected = value.trim()
  const selectedJalali = selected ? ymdToJalali(selected) : null
  const [viewYear, setViewYear] = useState(() => (selectedJalali ?? dateToJalaliParts(new Date())).year)
  const [viewMonth, setViewMonth] = useState(
    () => (selectedJalali ?? dateToJalaliParts(new Date())).month,
  )

  useEffect(() => {
    if (!open) return
    const current = selectedJalali ?? dateToJalaliParts(new Date())
    setViewYear(current.year)
    setViewMonth(current.month)
  }, [open, selected])

  useLayoutEffect(() => {
    if (!open) {
      setPopPos(null)
      return
    }
    const place = () => {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const width = Math.min(320, window.innerWidth - 16)
      const rtl = document.documentElement.dir === 'rtl'
      let left = rtl ? rect.right - width : rect.left
      left = Math.min(Math.max(8, left), Math.max(8, window.innerWidth - width - 8))
      const height = 360
      let top = rect.bottom + 6
      if (top + height > window.innerHeight - 8 && rect.top > height + 8) {
        top = rect.top - height - 6
      }
      setPopPos({ top, left, width })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || popRef.current?.contains(target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [open])

  const cells = useMemo(() => {
    const length = jalaliMonthLength(viewYear, viewMonth)
    const firstYmd = jalaliToGregorianYmd(viewYear, viewMonth, 1)
    const lead = (businessWeekday(firstYmd) + 1) % 7
    const today = todayLocalYmd()
    const items: Array<{
      key: string
      ymd: string
      day: number
      inMonth: boolean
      isToday: boolean
      isSelected: boolean
    }> = []

    for (let i = 0; i < lead; i += 1) {
      items.push({
        key: `pad-${i}`,
        ymd: '',
        day: 0,
        inMonth: false,
        isToday: false,
        isSelected: false,
      })
    }
    for (let day = 1; day <= length; day += 1) {
      const ymd = jalaliToGregorianYmd(viewYear, viewMonth, day)
      items.push({
        key: ymd,
        ymd,
        day,
        inMonth: true,
        isToday: ymd === today,
        isSelected: ymd === selected,
      })
    }
    return items
  }, [viewYear, viewMonth, selected])

  const shiftMonth = (delta: number) => {
    let month = viewMonth + delta
    let year = viewYear
    if (month < 1) {
      month = 12
      year -= 1
    } else if (month > 12) {
      month = 1
      year += 1
    }
    setViewYear(year)
    setViewMonth(month)
  }

  const display = selected
    ? (() => {
        const j = ymdToJalali(selected)
        return `${j.year}/${j.month}/${j.day}`
      })()
    : ''

  return (
    <div className="jalali-date-picker" ref={rootRef}>
      <button
        ref={triggerRef}
        id={id}
        type="button"
        className="jalali-date-picker__input"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={display ? undefined : 'is-placeholder'}>{display || t('desktop.select')}</span>
        <i className="fa-solid fa-calendar-days" aria-hidden="true" />
      </button>
      {open && popPos
        ? createPortal(
        <div
          ref={popRef}
          className="jalali-date-picker__pop"
          role="dialog"
          style={{ top: popPos.top, left: popPos.left, width: popPos.width }}
        >
          <div className="jalali-date-picker__nav">
            <button type="button" onClick={() => setViewYear((y) => y - 1)} aria-label={t('desktop.hy_date_prev_year')}>
              <i className={`fa-solid ${locale === 'en' ? 'fa-angles-left' : 'fa-angles-right'}`} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => shiftMonth(-1)} aria-label={t('desktop.ea_prev_month')}>
              <i className={`fa-solid ${locale === 'en' ? 'fa-angle-left' : 'fa-angle-right'}`} aria-hidden="true" />
            </button>
            <strong>
              {jalaliMonthName(viewMonth, locale)} {viewYear}
            </strong>
            <button type="button" onClick={() => shiftMonth(1)} aria-label={t('desktop.ea_next_month')}>
              <i className={`fa-solid ${locale === 'en' ? 'fa-angle-right' : 'fa-angle-left'}`} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setViewYear((y) => y + 1)} aria-label={t('desktop.hy_date_next_year')}>
              <i className={`fa-solid ${locale === 'en' ? 'fa-angles-right' : 'fa-angles-left'}`} aria-hidden="true" />
            </button>
          </div>
          <div className="jalali-date-picker__week">
            {WEEK_ORDER.map((day) => (
              <span key={day}>
                {locale === 'en' ? weekdayName(day, locale).slice(0, 2) : weekdayName(day, locale).slice(0, 1)}
              </span>
            ))}
          </div>
          <div className="jalali-date-picker__grid">
            {cells.map((cell) =>
              cell.inMonth ? (
                <button
                  key={cell.key}
                  type="button"
                  className={[
                    cell.isSelected ? 'is-selected' : '',
                    cell.isToday ? 'is-today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={() => {
                    onChange(cell.ymd)
                    setOpen(false)
                  }}
                >
                  {cell.day}
                </button>
              ) : (
                <span key={cell.key} />
              ),
            )}
          </div>
          <div className="jalali-date-picker__foot">
            <button
              type="button"
              onClick={() => {
                onChange(todayLocalYmd())
                setOpen(false)
              }}
            >
              {t('desktop.date_picker_today')}
            </button>
            {allowEmpty ? (
              <button
                type="button"
                onClick={() => {
                  onChange('')
                  setOpen(false)
                }}
              >
                {t('desktop.date_picker_clear')}
              </button>
            ) : null}
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  )
}
