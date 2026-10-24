import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { Modal } from '@/components/ui/Modal'
import { useLocalClock } from '@/hooks/useLocalClock'
import { formatAfghanDateValue } from '@/lib/datetime'
import { useCompanyContextStore } from '@/store/useCompanyContextStore'

export function ToolbarDateTime() {
  const { t, i18n } = useTranslation()
  const locale = (i18n.language?.startsWith('ps')
    ? 'ps'
    : i18n.language?.startsWith('en')
      ? 'en'
      : 'fa') as 'fa' | 'ps' | 'en'
  const clock = useLocalClock(locale)
  const [open, setOpen] = useState(false)

  const activeBusiness = useCompanyContextStore(useShallow((state) => state.activeBusiness))
  const validityJalali = activeBusiness
    ? formatAfghanDateValue(activeBusiness.validUpTo, locale)
    : null

  return (
    <>
      <button
        type="button"
        className={`chrome-toolbar__datetime${activeBusiness ? ' has-validity' : ''}`}
        onClick={() => setOpen(true)}
        title={t('desktop.click_for_gregorian')}
        aria-label={t('desktop.click_for_gregorian')}
      >
        <span className="chrome-toolbar__datetime-main">
          <span className="chrome-toolbar__datetime-day">{clock.jalaliDate}</span>
          <span className="chrome-toolbar__datetime-time" dir="ltr">
            {clock.jalaliTime}
          </span>
        </span>

        {activeBusiness ? (
          <>
            <span className="chrome-toolbar__datetime-sep" aria-hidden="true" />
            <span
              className={`chrome-toolbar__validity${activeBusiness.isActive ? ' is-active' : ' is-inactive'}`}
            >
              <i
                className={`fa-solid ${activeBusiness.isActive ? 'fa-circle-check' : 'fa-triangle-exclamation'}`}
              />
              <span>
                {t('desktop.valid_date')}: {validityJalali}
              </span>
            </span>
          </>
        ) : null}
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={t('desktop.gregorian_equivalent')}>
        <div className="chrome-datetime-modal">
          <div className="chrome-datetime-modal__block">
            <span className="chrome-datetime-modal__label">{t('desktop.jalali_date')}</span>
            <strong>{clock.jalaliFull}</strong>
          </div>
          <div className="chrome-datetime-modal__block chrome-datetime-modal__block--gregorian">
            <span className="chrome-datetime-modal__label">{t('desktop.gregorian_date')}</span>
            <strong dir="ltr">{clock.gregorianDate}</strong>
            <span className="chrome-datetime-modal__time" dir="ltr">
              {clock.gregorianTime}
            </span>
          </div>
          {activeBusiness ? (
            <div className="chrome-datetime-modal__block">
              <span className="chrome-datetime-modal__label">{t('desktop.company_validity')}</span>
              <strong>
                {activeBusiness.name} —{' '}
                {activeBusiness.isActive ? t('desktop.active') : t('desktop.inactive')}
              </strong>
              <span className="chrome-datetime-modal__time">
                {t('desktop.valid_date')}: {validityJalali}
              </span>
            </div>
          ) : null}
          <p className="muted chrome-datetime-modal__note">{t('desktop.local_timezone_note')}</p>
        </div>
      </Modal>
    </>
  )
}
