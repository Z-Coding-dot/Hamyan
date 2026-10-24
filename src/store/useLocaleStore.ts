import { create } from 'zustand'

import i18n from '@/lib/i18n'
import { getSessionItem, setSessionItem } from '@/lib/session'

const LANGUAGE_KEY = 'hamyan_web_language'

export const supportedLanguages = ['fa', 'ps', 'en'] as const
export type SupportedLanguage = (typeof supportedLanguages)[number]

type LocaleStore = {
  language: SupportedLanguage
  isReady: boolean
  initialize: () => Promise<void>
  setLanguage: (language: SupportedLanguage) => Promise<void>
}

function resolveLanguage(language: string | null | undefined): SupportedLanguage {
  if (!language) {
    return 'fa'
  }

  const normalized = language.toLowerCase()

  if (normalized.startsWith('ps')) {
    return 'ps'
  }

  if (normalized.startsWith('en')) {
    return 'en'
  }

  return 'fa'
}

function applyDocumentLanguage(language: SupportedLanguage): void {
  const dir = language === 'en' ? 'ltr' : 'rtl'
  document.documentElement.lang = language
  document.documentElement.dir = dir
}

export const useLocaleStore = create<LocaleStore>((set, get) => ({
  language: 'fa',
  isReady: false,
  initialize: async () => {
    if (get().isReady) {
      return
    }

    const storedLanguage = await getSessionItem(LANGUAGE_KEY)
    const urlLang =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('lang') : null
    // A shared ?lang= link wins. Otherwise Persian, unless this browser already chose a language.
    const language = resolveLanguage(urlLang || storedLanguage || 'fa')

    await i18n.changeLanguage(language)
    applyDocumentLanguage(language)
    if (urlLang) await setSessionItem(LANGUAGE_KEY, language)
    set({ language, isReady: true })
  },
  setLanguage: async (language) => {
    await i18n.changeLanguage(language)
    await setSessionItem(LANGUAGE_KEY, language)
    applyDocumentLanguage(language)
    set({ language })
  },
}))
