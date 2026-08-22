import { defineStore } from 'pinia'
import type { AnalyticsConsent, StoredAnalyticsConsent, ThemePreference } from '~/types/progress'

export const CONSENT_VERSION = 1

/** Preferencias de usuario: tema y consentimiento de analítica. */
export const usePreferencesStore = defineStore('preferences', {
  state: (): {
    theme: ThemePreference
    analyticsConsent: AnalyticsConsent
    hydrated: boolean
  } => ({
    theme: 'system',
    analyticsConsent: 'unset',
    hydrated: false,
  }),

  actions: {
    hydrate() {
      if (this.hydrated || import.meta.server) return
      const storage = useLocalStorage()
      const theme = storage.read<ThemePreference>('theme', 'system')
      this.theme = ['system', 'light', 'dark'].includes(theme) ? theme : 'system'
      const saved = storage.read<unknown>('analytics-consent', null)
      if (
        saved
        && typeof saved === 'object'
        && (saved as StoredAnalyticsConsent).version === CONSENT_VERSION
        && ['granted', 'denied'].includes((saved as StoredAnalyticsConsent).analytics)
      ) {
        this.analyticsConsent = (saved as StoredAnalyticsConsent).analytics
      } else {
        this.analyticsConsent = 'unset'
      }
      this.hydrated = true
    },

    setTheme(theme: ThemePreference) {
      this.theme = theme
      useLocalStorage().write('theme', theme)
    },

    setAnalyticsConsent(consent: AnalyticsConsent) {
      this.analyticsConsent = consent
      const storage = useLocalStorage()
      if (consent === 'unset') {
        storage.remove('analytics-consent')
        return
      }
      storage.write<StoredAnalyticsConsent>('analytics-consent', {
        analytics: consent,
        version: CONSENT_VERSION,
      })
    },
  },
})
