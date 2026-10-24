import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { useWorkspaceSwitchStore } from '@/store/useWorkspaceSwitchStore'

export function WorkspaceSwitchOverlay() {
  const { t } = useTranslation()
  const isActive = useWorkspaceSwitchStore((state) => state.isActive)
  const target = useWorkspaceSwitchStore((state) => state.target)

  if (!isActive || !target) return null

  return createPortal(
    <div
      className="workspace-switch-overlay"
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={t('desktop.switching_workspace', { name: target.name })}
    >
      <div className="workspace-switch-stage">
        <div className={`workspace-switch-hero workspace-switch-hero--${target.kind}`}>
          <div className="workspace-switch-ring workspace-switch-ring--outer" aria-hidden="true" />
          <div className="workspace-switch-ring workspace-switch-ring--inner" aria-hidden="true" />
          <div className="workspace-switch-thumb">
            {target.imageUrl ? (
              <img src={target.imageUrl} alt="" />
            ) : target.kind === 'user' ? (
              <i className="fa-solid fa-user" aria-hidden="true" />
            ) : (
              <i className="fa-solid fa-building" aria-hidden="true" />
            )}
          </div>
        </div>
        <p className="workspace-switch-label">{t('desktop.switching_workspace', { name: target.name })}</p>
      </div>
    </div>,
    document.body,
  )
}
