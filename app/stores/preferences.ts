import { defineStore } from 'pinia'
import type { AnalyticsConsent, ThemePreference } from '~/types/progress'

/** Preferencias de usuario: tema y consentimiento de analítica. */
export const usePreferencesStore = defineStore('preferences', {
  state: (): {
    theme: ThemePreference
    analyticsConsent: AnalyticsConsent
    hydrated: boolean
  } => ({
    theme: 'system',
    analyticsConsent: 'unknown',
    hydrated: false,
  }),

  actions: {
    hydrate() {
      if (this.hydrated || import.meta.server) return
      const storage = useLocalStorage()
      const theme = storage.read<ThemePreference>('theme', 'system')
      this.theme = ['system', 'light', 'dark'].includes(theme) ? theme : 'system'
      const consent = storage.read<AnalyticsConsent>('analytics-consent', 'unknown')
      this.analyticsConsent = ['granted', 'denied'].includes(consent) ? consent : 'unknown'
      this.hydrated = true
    },

    setTheme(theme: ThemePreference) {
      this.theme = theme
      useLocalStorage().write('theme', theme)
    },

    setAnalyticsConsent(consent: AnalyticsConsent) {
      this.analyticsConsent = consent
      useLocalStorage().write('analytics-consent', consent)
    },
  },
})
