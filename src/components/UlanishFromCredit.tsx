import { useTranslation } from 'react-i18next'

const ULANISH_LOGO = 'https://ulanish.dev/logo.png'
const ULANISH_URL = 'https://ulanish.dev'

type Props = {
  className?: string
}

/** Compact “از اولنیش” credit with Ulanish logo — home / login / register. */
export function UlanishFromCredit({ className }: Props) {
  const { t } = useTranslation()

  return (
    <a
      href={ULANISH_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={['ulanish-from-credit', className].filter(Boolean).join(' ')}
      aria-label={`${t('desktop.from_ulanish')} — ulanish.dev`}
    >
      <span className="ulanish-from-credit__text">{t('desktop.from_ulanish')}</span>
      <img
        src={ULANISH_LOGO}
        alt="Ulanish"
        className="ulanish-from-credit__logo"
        loading="lazy"
        decoding="async"
      />
    </a>
  )
}
