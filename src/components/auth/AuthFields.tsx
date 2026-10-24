import {
  type ClipboardEvent,
  type InputHTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useEffect,
  useRef,
} from 'react'

type AuthTextFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className'> & {
  label: string
  icon: string
  error?: string | null
  ltr?: boolean
  inputClassName?: string
}

export function AuthTextField({
  label,
  icon,
  error,
  ltr = false,
  inputClassName = '',
  ...inputProps
}: AuthTextFieldProps) {
  return (
    <div className="auth-field">
      <div className="auth-field__label">
        <i className={icon} aria-hidden="true" />
        <label htmlFor={inputProps.id}>{label}</label>
      </div>
      <input
        {...inputProps}
        className={`auth-input${ltr ? ' auth-input--ltr' : ''} ${inputClassName}`.trim()}
      />
      {error ? <p className="auth-field__error">{error}</p> : null}
    </div>
  )
}

type AuthPasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & {
  label: string
  icon?: string
  error?: string | null
  visible: boolean
  onToggleVisible: () => void
  toggleLabel: string
}

export function AuthPasswordField({
  label,
  icon = 'fa-solid fa-lock',
  error,
  visible,
  onToggleVisible,
  toggleLabel,
  ...inputProps
}: AuthPasswordFieldProps) {
  return (
    <div className="auth-field">
      <div className="auth-field__label">
        <i className={icon} aria-hidden="true" />
        <label htmlFor={inputProps.id}>{label}</label>
      </div>
      <div className="auth-input-wrap">
        <input
          {...inputProps}
          type={visible ? 'text' : 'password'}
          className="auth-input auth-input--ltr auth-input--password"
        />
        <button
          type="button"
          className="auth-input__toggle"
          onClick={onToggleVisible}
          aria-label={toggleLabel}
          disabled={inputProps.disabled}
        >
          <i className={`fa-regular ${visible ? 'fa-eye-slash' : 'fa-eye'}`} />
        </button>
      </div>
      {error ? <p className="auth-field__error">{error}</p> : null}
    </div>
  )
}

type AuthCheckboxProps = {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export function AuthCheckbox({ id, label, checked, onChange, disabled }: AuthCheckboxProps) {
  return (
    <label className="auth-checkbox" htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>{label}</span>
    </label>
  )
}

type AuthCodeDigitsProps = {
  id: string
  label: string
  icon?: string
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  error?: string | null
  autoFocus?: boolean
}

export function AuthCodeDigits({
  id,
  label,
  icon = 'fa-solid fa-shield-halved',
  value,
  onChange,
  length = 6,
  disabled = false,
  error,
  autoFocus = false,
}: AuthCodeDigitsProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([])
  const digits = Array.from({ length }, (_, index) => value[index] ?? '')

  useEffect(() => {
    if (!autoFocus || disabled) return
    inputsRef.current[0]?.focus()
  }, [autoFocus, disabled])

  const focusAt = (index: number) => {
    const next = Math.max(0, Math.min(length - 1, index))
    inputsRef.current[next]?.focus()
    inputsRef.current[next]?.select()
  }

  const commit = (nextDigits: string[]) => {
    onChange(nextDigits.join('').replace(/\D/g, '').slice(0, length))
  }

  const handleChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '')
    if (!cleaned) {
      const next = [...digits]
      next[index] = ''
      commit(next)
      return
    }

    const next = [...digits]
    const chars = cleaned.split('')
    chars.forEach((char, offset) => {
      const target = index + offset
      if (target < length) next[target] = char
    })
    commit(next)
    focusAt(index + chars.length)
  }

  const handleKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits]
        next[index] = ''
        commit(next)
        return
      }
      if (index > 0) {
        event.preventDefault()
        const next = [...digits]
        next[index - 1] = ''
        commit(next)
        focusAt(index - 1)
      }
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusAt(index - 1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusAt(index + 1)
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = Array.from({ length }, (_, i) => pasted[i] ?? '')
    commit(next)
    focusAt(Math.min(pasted.length, length - 1))
  }

  return (
    <div className="auth-field">
      <div className="auth-field__label">
        <i className={icon} aria-hidden="true" />
        <label htmlFor={`${id}-0`}>{label}</label>
      </div>
      <div className="auth-code-digits" dir="ltr" role="group" aria-label={label}>
        {digits.map((digit, index) => (
          <input
            key={`${id}-${index}`}
            id={`${id}-${index}`}
            ref={(node) => {
              inputsRef.current[index] = node
            }}
            className="auth-code-digits__input"
            type="text"
            inputMode="numeric"
            autoComplete={index === 0 ? 'one-time-code' : 'off'}
            maxLength={1}
            value={digit}
            disabled={disabled}
            aria-label={`${label} ${index + 1}`}
            style={{ textAlign: 'center' }}
            onChange={(event) => handleChange(index, event.target.value)}
            onKeyDown={(event) => handleKeyDown(index, event)}
            onPaste={handlePaste}
            onFocus={(event) => event.target.select()}
          />
        ))}
      </div>
      <input type="hidden" name="email_verification_code" value={value} readOnly />
      {error ? <p className="auth-field__error">{error}</p> : null}
    </div>
  )
}

type AuthButtonProps = {
  children: ReactNode
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
  variant?: 'primary' | 'dark' | 'soft'
  className?: string
}

export function AuthButton({
  children,
  type = 'button',
  disabled,
  onClick,
  variant = 'primary',
  className = '',
}: AuthButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`auth-btn auth-btn--${variant} ${className}`.trim()}
    >
      {children}
    </button>
  )
}
