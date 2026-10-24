import { useTranslation } from 'react-i18next'
import { useShallow } from 'zustand/react/shallow'

import { useIsMobileSidebar } from '@/hooks/useMediaQuery'
import { useSidebarStore } from '@/store/useSidebarStore'

export function SidebarEdgeToggle() {
  const { t } = useTranslation()
  const isMobile = useIsMobileSidebar()
  const { isOpen, toggle } = useSidebarStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      toggle: state.toggle,
    })),
  )

  return (
    <button
      type="button"
      className={`sidebar-edge-toggle${isOpen ? ' is-open' : ''}${isMobile ? ' sidebar-edge-toggle--mobile' : ''}`}
      onClick={toggle}
      aria-label={isOpen ? t('desktop.sidebar_close') : t('desktop.sidebar_open')}
      title={isOpen ? t('desktop.sidebar_close') : t('desktop.sidebar_open')}
    >
      <svg
        className="sidebar-edge-toggle__icon"
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M14.5 6.5 9.5 12l5 5.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
