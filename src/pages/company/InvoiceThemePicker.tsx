import { useTranslation } from 'react-i18next'

import { INVOICE_PRINT_THEMES, type InvoicePrintTheme } from '@/lib/invoicePrint'

type Props = {
  value: InvoicePrintTheme
  onChange: (theme: InvoicePrintTheme) => void
  busy?: boolean
  /** Side panel next to the bill (desktop), or stacked (default). */
  variant?: 'stack' | 'side'
}

function themeLabelKey(theme: InvoicePrintTheme): string {
  return `desktop.invoice_theme_${theme}`
}

export function InvoiceThemePicker({
  value,
  onChange,
  busy = false,
  variant = 'stack',
}: Props) {
  const { t } = useTranslation()

  return (
    <div
      className={`invoice-theme-picker invoice-theme-picker--${variant} no-print`}
      role="group"
      aria-label={t('desktop.invoice_theme_picker')}
    >
      <div className="invoice-theme-picker__label">{t('desktop.invoice_theme_picker')}</div>
      <div className="invoice-theme-picker__options">
        {INVOICE_PRINT_THEMES.map((theme) => {
          const active = value === theme
          return (
            <button
              key={theme}
              type="button"
              className={`invoice-theme-swatch invoice-theme-swatch--${theme}${active ? ' is-active' : ''}`}
              disabled={busy}
              aria-pressed={active}
              onClick={() => onChange(theme)}
            >
              <span className="invoice-theme-swatch__preview" aria-hidden />
              <span className="invoice-theme-swatch__name">{t(themeLabelKey(theme))}</span>
            </button>
          )
        })}
      </div>
      <p className="invoice-theme-picker__hint muted">{t('desktop.invoice_theme_a5_hint')}</p>
    </div>
  )
}
