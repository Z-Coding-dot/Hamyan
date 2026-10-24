import { useId, type KeyboardEvent, type Ref } from 'react'
import { useTranslation } from 'react-i18next'

type Props = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label?: string
  clearable?: boolean
  disabled?: boolean
  autoFocus?: boolean
  id?: string
  name?: string
  className?: string
  dir?: 'ltr' | 'rtl'
  onBlur?: () => void
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void
  autoComplete?: string
  spellCheck?: boolean
  inputRef?: Ref<HTMLInputElement>
}

/** Search input with in-field brand search icon — use on every search surface. */
export function SearchField({
  value,
  onChange,
  placeholder,
  label,
  clearable = true,
  disabled = false,
  autoFocus,
  id,
  name,
  className,
  dir,
  onBlur,
  onKeyDown,
  autoComplete = 'off',
  spellCheck = false,
  inputRef,
}: Props) {
  const { t } = useTranslation()
  const generatedId = useId()
  const inputId = id || generatedId
  const showClear = clearable && Boolean(value?.trim()) && !disabled

  return (
    <div className={['search-field', className].filter(Boolean).join(' ')}>
      {label ? (
        <label className="search-field__label" htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className={`search-field__control${disabled ? ' is-disabled' : ''}`}>
        <span className="search-field__icon" aria-hidden="true">
          <i className="fa-solid fa-magnifying-glass" />
        </span>
        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          placeholder={placeholder || t('desktop.search')}
          disabled={disabled}
          autoFocus={autoFocus}
          autoComplete={autoComplete}
          spellCheck={spellCheck}
          dir={dir}
          className="search-field__input"
        />
        {showClear ? (
          <button
            type="button"
            className="search-field__clear"
            onClick={() => onChange('')}
            aria-label={t('desktop.help_clear_search')}
          >
            <i className="fa-solid fa-xmark" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
