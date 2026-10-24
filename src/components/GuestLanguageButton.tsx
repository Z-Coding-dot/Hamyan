import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { LanguageModal } from '@/components/LanguageModal'

export function GuestLanguageButton() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="guest-locale-fab">
        <button
          type="button"
          className="guest-locale-fab__btn"
          onClick={() => setOpen(true)}
          aria-label={t('desktop.language_title')}
          title={t('desktop.language_title')}
        >
          <i className="fa-solid fa-language" />
        </button>
      </div>

      <LanguageModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
