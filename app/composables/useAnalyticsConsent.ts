import type { AnalyticsConsent } from '~/types/progress'

/**
 * Consentimiento de analítica (Google Consent Mode).
 * Por defecto TODO está denegado; el usuario decide desde una barra discreta
 * y puede cambiar la decisión más tarde. Rechazar no bloquea el sitio.
 */
export function useAnalyticsConsent() {
  const preferences = usePreferencesStore()
  const { updateConsent, loadAnalytics } = useAnalyticsRuntime()

  const consent = computed<AnalyticsConsent>(() => preferences.analyticsConsent)
  const decided = computed(() => consent.value !== 'unknown')
  const accepted = computed(() => consent.value === 'granted')

  const accept = () => {
    preferences.setAnalyticsConsent('granted')
    updateConsent(true)
    loadAnalytics()
  }

  const decline = () => {
    preferences.setAnalyticsConsent('denied')
    updateConsent(false)
  }

  const reset = () => {
    preferences.setAnalyticsConsent('unknown')
    updateConsent(false)
  }

  return { consent, decided, accepted, accept, decline, reset }
}
