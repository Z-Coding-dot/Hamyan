import { useTranslation } from 'react-i18next'

import logoUrl from '@/assets/logo.png'

type Props = {
  subtitle?: string | null
}

/** Centered splash — fixed overlay so packaged Electron cannot offset it. */
export function AppLoadingSplash({ subtitle }: Props) {
  const { t } = useTranslation()
  const tagline = subtitle ?? t('desktop.brand_slogan')

  return (
    <div className="ishanch-splash" role="status" aria-live="polite">
      <div className="ishanch-splash__box">
        <img src={logoUrl} alt="" width={100} height={100} className="hy-splash-logo" />
        <p className="ishanch-splash__name">{t('desktop.app_name')}</p>
        {tagline ? <p className="ishanch-splash__sub">{tagline}</p> : null}
        <div className="hy-pass" aria-hidden="true">
          <i className="fa-solid fa-arrow-up hy-pass__glyph" />
        </div>
      </div>
    </div>
  )
}
