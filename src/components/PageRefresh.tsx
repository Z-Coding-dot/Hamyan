import { useTranslation } from 'react-i18next'

import { usePageRefreshStore } from '@/store/usePageRefreshStore'

/** Floating page reload under the header (start side: right in fa/ps, left in en). */
export function PageRefresh({ inline = false }: { inline?: boolean }) {
  const { t } = useTranslation()
  const onRefresh = usePageRefreshStore((s) => s.onRefresh)
  const busy = usePageRefreshStore((s) => s.busy)

  if (!onRefresh) return null

  return (
    <button
      type="button"
      className={inline ? 'hy-top__btn hy-top__refresh' : 'hy-refresh hy-refresh--float'}
      onClick={onRefresh}
      disabled={busy}
      aria-label={t('desktop.refresh')}
      title={t('desktop.refresh')}
      aria-busy={busy}
    >
      <i className={`fa-solid fa-rotate${busy ? ' fa-spin' : ''}`} aria-hidden="true" />
    </button>
  )
}
