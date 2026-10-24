import { Outlet } from 'react-router-dom'

import { HamyanWhatsappFab } from '@/components/IshanchWhatsappFab'
import { SeoHead } from '@/components/SeoHead'

/** Public pages shell (help, exchange rates, download) — no auth required. */
export function GuestLayout() {
  return (
    <div className="guest-layout">
      <SeoHead />
      <main className="app-content guest-layout__content">
        <Outlet />
      </main>
      <HamyanWhatsappFab />
    </div>
  )
}
