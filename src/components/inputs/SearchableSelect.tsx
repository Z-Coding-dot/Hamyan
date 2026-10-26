import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type SelectHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, m, useReducedMotion } from 'framer-motion'

type Option = { value: string; label: string; disabled?: boolean }
type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { label?: string; placeholder?: string; searchable?: boolean }
type MenuOption = Option & { selected: boolean; group: string; index: number }
type MenuPosition = { top: number; left: number; width: number; maxHeight: number; above: boolean }

/** Styled presentation of a real select: original values, change events, and form validation stay native. */
export function Select({ children, label, placeholder, searchable, className = '', style, onChange, onInvalid, onFocus, ...props }: SelectProps) {
  const { t, i18n } = useTranslation()
  const generatedId = useId()
  const listId = `${generatedId}-list`
  const fieldId = props.id || `${generatedId}-field`
  const labelId = `${generatedId}-label`
  const nativeRef = useRef<HTMLSelectElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLInputElement>(null)
  const typeahead = useRef({ text: '', time: 0 })
  const [options, setOptions] = useState<MenuOption[]>([])
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(-1)
  const [invalid, setInvalid] = useState(false)
  const [fieldLabel, setFieldLabel] = useState('')
  const [position, setPosition] = useState<MenuPosition | null>(null)
  const menuReady = position !== null
  const reduceMotion = useReducedMotion()
  const hasSearch = searchable ?? options.length > 7
  const visible = options.filter((option) => option.label.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()))
  const selected = options.filter((option) => option.selected)

  const syncOptions = () => {
    const field = nativeRef.current
    if (!field) return
    setOptions(Array.from(field.options).map((option, index) => ({
      value: option.value, label: option.label, selected: option.selected, index,
      group: option.parentElement instanceof HTMLOptGroupElement ? option.parentElement.label : '',
      disabled: option.disabled || (option.parentElement instanceof HTMLOptGroupElement && option.parentElement.disabled),
    })))
    const linkedLabel = field.labels?.[0]
    const directText = linkedLabel ? Array.from(linkedLabel.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE).map((node) => node.textContent).join(' ').trim() : ''
    setFieldLabel(directText)
  }

  useLayoutEffect(syncOptions, [children, props.value, props.defaultValue, props.multiple, props.disabled])
  useEffect(() => { if (props.disabled) setOpen(false) }, [props.disabled])

  const close = (restoreFocus = false) => {
    setOpen(false)
    setQuery('')
    if (restoreFocus) triggerRef.current?.focus()
  }
  const show = () => {
    if (props.disabled) return
    setActive(options.find((option) => option.selected && !option.disabled)?.index ?? options.find((option) => !option.disabled)?.index ?? -1)
    setQuery('')
    setOpen(true)
  }
  const choose = (option: MenuOption) => {
    const field = nativeRef.current
    if (!field || option.disabled) return
    if (props.multiple) field.options[option.index].selected = !field.options[option.index].selected
    else field.selectedIndex = option.index
    field.dispatchEvent(new Event('change', { bubbles: true }))
    syncOptions()
    setInvalid(false)
    if (!props.multiple) close(true)
  }

  useLayoutEffect(() => {
    if (!open) { setPosition(null); return }
    const place = () => {
      const rect = triggerRef.current?.getBoundingClientRect()
      if (!rect) return
      const viewport = window.visualViewport
      const viewportTop = viewport?.offsetTop || 0
      const viewportHeight = viewport?.height || window.innerHeight
      const below = Math.max(0, viewportTop + viewportHeight - rect.bottom - 12)
      const above = Math.max(0, rect.top - viewportTop - 12)
      const expectedHeight = Math.min(330, Math.max(66, visible.length * 44 + (hasSearch ? 57 : 0) + 14))
      const useAbove = below < expectedHeight && above > below
      const maxHeight = Math.min(330, useAbove ? above : below)
      const width = Math.min(Math.max(rect.width, 200), window.innerWidth - 20)
      setPosition({
        top: useAbove ? Math.max(viewportTop + 8, rect.top - Math.min(expectedHeight, maxHeight) - 7) : rect.bottom + 7,
        left: Math.max(10, Math.min(rect.left, window.innerWidth - width - 10)),
        width, maxHeight, above: useAbove,
      })
    }
    place()
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    window.visualViewport?.addEventListener('resize', place)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
      window.visualViewport?.removeEventListener('resize', place)
    }
  }, [open, visible.length, hasSearch])

  useEffect(() => {
    if (!open) return
    const outside = (event: PointerEvent) => {
      if (triggerRef.current?.contains(event.target as Node) || menuRef.current?.contains(event.target as Node)) return
      close()
    }
    document.addEventListener('pointerdown', outside)
    const timer = window.setTimeout(() => { if (hasSearch) searchRef.current?.focus(); else menuRef.current?.focus() }, 0)
    return () => { document.removeEventListener('pointerdown', outside); window.clearTimeout(timer) }
  }, [open, hasSearch])

  useEffect(() => { if (open && active >= 0) menuRef.current?.querySelector<HTMLElement>(`[data-option-index="${active}"]`)?.scrollIntoView({ block: 'nearest' }) }, [active, open, menuReady])
  useEffect(() => {
    const form = nativeRef.current?.form
    const reset = () => requestAnimationFrame(() => { syncOptions(); setInvalid(false); close() })
    form?.addEventListener('reset', reset)
    return () => form?.removeEventListener('reset', reset)
  }, [])

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key === 'Escape' && open) { event.preventDefault(); event.stopPropagation(); close(true); return }
    if (event.key === 'Tab') { if (open) close(); return }
    const enabled = visible.filter((option) => !option.disabled)
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault()
      event.stopPropagation()
      if (!open) { show(); return }
      const current = enabled.findIndex((option) => option.index === active)
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? enabled.length - 1 : (current + (event.key === 'ArrowDown' ? 1 : -1) + enabled.length) % enabled.length
      setActive(enabled[next]?.index ?? -1)
    } else if (event.key === 'Enter' || (event.key === ' ' && !(event.target instanceof HTMLInputElement))) {
      event.preventDefault()
      event.stopPropagation()
      if (!open) show()
      else { const option = visible.find((item) => item.index === active); if (option) choose(option) }
    } else if (event.key.length === 1 && !(event.target instanceof HTMLInputElement) && !event.ctrlKey && !event.metaKey) {
      const now = Date.now()
      typeahead.current.text = now - typeahead.current.time < 700 ? typeahead.current.text + event.key : event.key
      typeahead.current.time = now
      const match = enabled.find((option) => option.label.toLocaleLowerCase().startsWith(typeahead.current.text.toLocaleLowerCase()))
      if (match) { if (!open) show(); setActive(match.index) }
    }
  }

  const accessibleLabel = props['aria-label'] || label || fieldLabel || placeholder || t('desktop.select')
  return (
    <div className={`hy-pick hy-select ${className}`} style={style} data-invalid={invalid || undefined}>
      {label && <span id={labelId} className="hy-pick__label">{label}</span>}
      <select {...props} id={fieldId} ref={nativeRef} className="hy-select__native" tabIndex={-1} aria-hidden="true"
        onChange={(event) => { onChange?.(event); syncOptions(); setInvalid(false) }}
        onInvalid={(event) => { event.preventDefault(); onInvalid?.(event); setInvalid(true); show(); triggerRef.current?.focus() }}
        onFocus={(event) => { onFocus?.(event); triggerRef.current?.focus() }}>{children}</select>
      <button ref={triggerRef} type="button" className="hy-pick__button" role="combobox" aria-haspopup="listbox"
        aria-expanded={open} aria-controls={listId} aria-label={accessibleLabel} aria-labelledby={label ? labelId : props['aria-labelledby']}
        aria-required={props.required || undefined} aria-invalid={invalid || props['aria-invalid']} disabled={props.disabled}
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        onKeyDown={onKeyDown} onClick={() => open ? close() : show()}>
        <span className={selected.length ? undefined : 'is-placeholder'}>{selected.map((option) => option.label).join(', ') || placeholder || t('desktop.select')}</span>
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </button>
      {createPortal(<AnimatePresence>{open && position && <m.div key="options" ref={menuRef} className="hy-pick__menu hy-select__menu" data-placement={position.above ? 'above' : 'below'} tabIndex={-1}
        dir={props.dir || i18n.dir()} style={{ top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight, transformOrigin: position.above ? 'bottom' : 'top' }}
        initial={reduceMotion ? false : { opacity: 0, y: position.above ? 4 : -4, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: reduceMotion ? 0 : .1 } }}
        transition={{ type: 'spring', stiffness: 480, damping: 38 }} onKeyDown={onKeyDown}>
        {hasSearch && <div className="hy-select__search"><i className="fa-solid fa-magnifying-glass" aria-hidden="true" /><input ref={searchRef} className="hy-pick__search" value={query} onChange={(event) => { setQuery(event.target.value); setActive(-1) }} placeholder={t('desktop.search')} aria-label={t('desktop.search')} aria-controls={listId} aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined} /></div>}
        <div id={listId} className="hy-pick__list" role="listbox" aria-label={accessibleLabel} aria-multiselectable={props.multiple || undefined}>
          {!visible.length ? <p className="hy-pick__empty">{t('desktop.no_record_found')}</p> : visible.map((option, index) => <div key={option.index}>
            {option.group && visible[index - 1]?.group !== option.group && <div className="hy-select__group">{option.group}</div>}
            <m.button type="button" role="option" id={`${listId}-${option.index}`} data-option-index={option.index} tabIndex={-1} aria-selected={option.selected} disabled={option.disabled}
              className={`${option.selected ? 'is-on ' : ''}${active === option.index ? 'is-active' : ''}`} whileTap={reduceMotion ? undefined : { scale: .985 }}
              onPointerMove={() => { if (!option.disabled) setActive(option.index) }} onClick={() => choose(option)}>
              <span>{option.label}</span><i className={`fa-solid ${option.selected ? 'fa-check' : 'fa-circle'}`} aria-hidden="true" />
            </m.button>
          </div>)}
        </div>
      </m.div>}</AnimatePresence>, document.body)}
    </div>
  )
}

type Props = { label?: string; value: string; options: Option[]; onChange: (value: string) => void; placeholder?: string; required?: boolean; disabled?: boolean }
export function SearchableSelect({ label, value, options, onChange, placeholder, required, disabled }: Props) {
  return <Select label={label} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={required} disabled={disabled} searchable>
    {placeholder && !options.some((option) => option.value === '') && <option value="" disabled>{placeholder}</option>}
    {options.map((option) => <option key={option.value} value={option.value} disabled={option.disabled}>{option.label}</option>)}
  </Select>
}
