import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { LazyMotion, MotionConfig } from 'framer-motion'
import App from './App'
import '@/lib/i18n'
import './styles.css'
import './dash-sidebar.css'
import './chrome-shell.css'
import './app-shell.css'
import './company-accounts.css'
import './company-account-show.css'
import './company-parties.css'
import './company-bottom-bar.css'
import './profile.css'
import './auth-guest.css'
import './community-toast.css'
import './user-companies.css'
import './wallet.css'
import './personal-accounts.css'
import './counterparties.css'
import './premium.css'
import './dashboard.css'
import './hesab-pay-card.css'
import './exchange-rates.css'
import './help.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './select-controls.css'
import './company-settings.css'
import './company-profit-report.css'
import './workspace-switch.css'
import './download.css'
import './home.css'
import './legal.css'
import './company-public-website.css'
import './search-field.css'
import './barcode-scan.css'
import './components/logo/logo-splash.css'
import './components/logo/logo-classic.css'
import './hamyan-ui.css'

const loadMotionFeatures = () => import('framer-motion').then((module) => module.domMax)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LazyMotion features={loadMotionFeatures}><MotionConfig reducedMotion="user"><HelmetProvider>
      <App />
    </HelmetProvider></MotionConfig></LazyMotion>
  </StrictMode>,
)
