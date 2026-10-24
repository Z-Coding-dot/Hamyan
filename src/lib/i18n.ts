import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from '@locales/en.json'
import fa from '@locales/fa.json'
import ps from '@locales/ps.json'
import desktopResources from '@/lib/desktop-i18n'
import recentDesktopStrings from '@/lib/desktop-i18n-recent'
import type { SupportedLanguage } from '@/store/useLocaleStore'

function buildTranslation(base: Record<string, unknown>, language: SupportedLanguage) {
  return {
    ...base,
    ...desktopResources[language],
    desktop: {
      ...desktopResources[language].desktop,
      ...recentDesktopStrings[language],
    },
  }
}

void i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'fa',
  fallbackLng: 'fa',
  interpolation: {
    escapeValue: false,
  },
  resources: {
    fa: {
      translation: buildTranslation(fa as Record<string, unknown>, 'fa'),
    },
    ps: {
      translation: buildTranslation(ps as Record<string, unknown>, 'ps'),
    },
    en: {
      translation: buildTranslation(en as Record<string, unknown>, 'en'),
    },
  },
})

export default i18n
