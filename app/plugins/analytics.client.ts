/**
 * Integración GA4 mediante Nuxt Scripts, compatible con hosting 100% estático.
 *
 * - Consent Mode: todo denegado por defecto, antes de cargar cualquier script.
 * - El script sólo se carga si hay Measurement ID y consentimiento aceptado.
 * - Si no hay ID, el usuario rechaza o un bloqueador impide la carga, la
 *   aplicación sigue funcionando con normalidad (todas las llamadas son no-op).
 */
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const measurementId = String(config.public.gaMeasurementId || '')

  const w = window as unknown as {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
  w.dataLayer = w.dataLayer || []
  const gtag = (...args: unknown[]) => {
    w.dataLayer!.push(args)
  }
  w.gtag = w.gtag || gtag

  // Consent Mode por defecto: conservador. La publicidad nunca se habilita aquí.
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })

  let loaded = false
  let loadScript: (() => void) | null = null

  if (measurementId) {
    const instance = useScriptGoogleAnalytics({
      id: measurementId,
      scriptOptions: { trigger: 'manual' },
    }) as unknown as { load?: () => void }

    loadScript = () => {
      if (loaded) return
      loaded = true
      try {
        instance.load?.()
      } catch {
        // La analítica nunca debe romper la aplicación.
      }
    }
  }

  const isEnabled = () => loaded && !!measurementId

  const updateConsent = (granted: boolean) => {
    gtag('consent', 'update', { analytics_storage: granted ? 'granted' : 'denied' })
  }

  const track = (event: string, params: Record<string, unknown> = {}) => {
    if (!isEnabled()) return
    gtag('event', event, params)
  }

  const analytics = {
    measurementId,
    isEnabled,
    updateConsent,
    track,
    loadAnalytics: () => loadScript?.(),
  }

  // Page views en navegación SPA. La carga inicial ya la reporta gtag('config'),
  // por eso se omite la primera navegación y no hay page views duplicados.
  const router = useRouter()
  let firstNavigationHandled = false
  router.afterEach((to) => {
    if (!firstNavigationHandled) {
      firstNavigationHandled = true
      return
    }
    if (!analytics.isEnabled()) return
    gtag('event', 'page_view', {
      page_path: to.fullPath,
      page_location: window.location.href,
      page_title: document.title,
    })
  })

  nuxtApp.provide('geeksiumAnalytics', analytics)
})
