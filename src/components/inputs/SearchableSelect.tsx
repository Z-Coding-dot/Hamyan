import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

type Option = {
  value: string
  label: string
}

type Props = {
  label?: string
  value: string
  options: Option[]
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

type MenuPos = { top: number; left: number; width: number }

export function SearchableSelect({
  label,
  value,
  options,
  onChange,
  placeholder,
  required,
  disabled,
}: Props) {
  const { t } = useTranslation()
  const listId = useId()
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [pos, setPos] = useState<MenuPos | null>(null)

  const selected = options.find((item) => item.value === value)
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return options
    return options.filter((item) => item.label.toLowerCase().includes(needle))
  }, [options, query])

  const placeMenu = () => {
    const button = buttonRef.current
    if (!button) return
    const rect = button.getBoundingClientRect()
    const width = Math.max(rect.width, 220)
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - width - 8)
    const spaceBelow = window.innerHeight - rect.bottom - 12
    const preferBelow = spaceBelow >= 220 || spaceBelow >= rect.top
    const top = preferBelow ? rect.bottom + 6 : Math.max(8, rect.top - 6 - Math.min(280, spaceBelow + rect.height))
    setPos({ top, left, width })
  }

  useLayoutEffect(() => {
    if (!open) {
      setPos(null)
      return
    }
    placeMenu()
  }, [open])

  useEffect(() => {
    if (!open) return
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) return
      setOpen(false)
      setQuery('')
    }
    const onReposition = () => placeMenu()
    document.addEventListener('mousedown', onPointer)
    window.addEventListener('resize', onReposition)
    window.addEventListener('scroll', onReposition, true)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      window.removeEventListener('resize', onReposition)
      window.removeEventListener('scroll', onReposition, true)
    }
  }, [open])

  return (
    <div className="hy-pick" ref={rootRef}>
      {label ? <span className="hy-pick__label">{label}</span> : null}
      <button
        ref={buttonRef}
        type="button"
        className="hy-pick__button"
        aria-expanded={open}
        aria-controls={listId}
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className={selected ? undefined : 'is-placeholder'}>
          {selected?.label || placeholder || t('desktop.select')}
        </span>
        <i className={`fa-solid ${open ? 'fa-chevron-up' : 'fa-chevron-down'}`} />
      </button>
      {open && pos
        ? createPortal(
            <div
              ref={menuRef}
              className="hy-pick__menu"
              id={listId}
              role="listbox"
              style={{ top: pos.top, left: pos.left, width: pos.width }}
            >
              <input
                className="hy-pick__search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t('desktop.search')}
                autoFocus
              />
              <div className="hy-pick__list">
                {visible.length === 0 ? (
                  <p className="hy-pick__empty">{t('desktop.no_record_found')}</p>
                ) : (
                  visible.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      role="option"
                      aria-selected={item.value === value}
                      className={item.value === value ? 'is-on' : undefined}
                      onClick={() => {
                        onChange(item.value)
                        setQuery('')
                        setOpen(false)
                      }}
                    >
                      {item.label}
                    </button>
                  ))
                )}
              </div>
            </div>,
            document.body,
          )
        : null}
      {required ? (
        <input className="hy-pick__required" tabIndex={-1} value={value} required onChange={() => undefined} />
      ) : null}
    </div>
  )
}
