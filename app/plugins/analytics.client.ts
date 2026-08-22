/** GA4 con Nuxt Scripts, consentimiento persistido y carga manual para SSG puro. */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const measurementId = String(config.public.gaMeasurementId || '')
  const preferences = usePreferencesStore()
  preferences.hydrate()

  const instance = measurementId
    ? useScriptGoogleAnalytics({
        id: measurementId,
        defaultConsent: {
          analytics_storage: 'denied',
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
        },
        // GA debe ir directo a Google: no hay endpoint Nitro en el hosting estático.
        scriptOptions: { trigger: 'manual', proxy: false, bundle: false },
      })
    : null

  let enabled = false
  let consentGranted = preferences.analyticsConsent === 'granted'
  const consentState = (granted: boolean) => ({
    analytics_storage: granted ? 'granted' as const : 'denied' as const,
    ad_storage: 'denied' as const,
    ad_user_data: 'denied' as const,
    ad_personalization: 'denied' as const,
  })
  const updateConsent = (granted: boolean) => {
    consentGranted = granted
    instance?.consent?.update(consentState(granted))
  }
  const loadAnalytics = () => {
    if (!instance || enabled) return
    enabled = true
    void instance.load().catch(() => { enabled = false })
  }
  const track = (event: string, params: Record<string, unknown> = {}) => {
    if (!enabled || !consentGranted || !instance) return
    instance.proxy.gtag('event', event, params)
  }

  if (preferences.analyticsConsent === 'granted') {
    updateConsent(true)
    loadAnalytics()
  } else updateConsent(false)

  nuxtApp.provide('geeksiumAnalytics', {
    measurementId,
    isEnabled: () => enabled && consentGranted && Boolean(measurementId),
    updateConsent,
    track,
    loadAnalytics,
  })
})
