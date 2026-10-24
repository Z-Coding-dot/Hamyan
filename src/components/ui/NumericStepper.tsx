import type { InputHTMLAttributes, ReactNode } from 'react'

type Props = {
  value: string | number
  onChange: (value: string) => void
  onIncrement: () => void
  onDecrement: () => void
  disabled?: boolean
  inputProps?: Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'disabled'>
  className?: string
  children?: ReactNode
}

/** Number field: − on the left, + on the right. */
export function NumericStepper({
  value,
  onChange,
  onIncrement,
  onDecrement,
  disabled = false,
  inputProps,
  className = '',
}: Props) {
  return (
    <div className={`qty-stepper qty-stepper--input ${className}`.trim()} dir="ltr">
      <button
        type="button"
        className="qty-stepper__btn"
        disabled={disabled}
        onClick={onDecrement}
        aria-label="decrease"
        tabIndex={-1}
      >
        <i className="fa-solid fa-minus" />
      </button>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        {...inputProps}
      />
      <button
        type="button"
        className="qty-stepper__btn"
        disabled={disabled}
        onClick={onIncrement}
        aria-label="increase"
        tabIndex={-1}
      >
        <i className="fa-solid fa-plus" />
      </button>
    </div>
  )
}
