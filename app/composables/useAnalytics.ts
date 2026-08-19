/**
 * useAnalytics(): ÚNICA capa de acceso a la telemetría del sitio.
 *
 * Ningún componente debe llamar a gtag() ni tocar dataLayer directamente.
 * Esto permite cambiar de proveedor, o duplicar eventos hacia un dashboard
 * privado de administradores en el futuro, sin tocar la interfaz.
 */
type AnalyticsRuntime = {
  measurementId: string
  isEnabled: () => boolean
  updateConsent: (granted: boolean) => void
  track: (event: string, params?: Record<string, unknown>) => void
  loadAnalytics: () => void
}

const noopRuntime: AnalyticsRuntime = {
  measurementId: '',
  isEnabled: () => false,
  updateConsent: () => {},
  track: () => {},
  loadAnalytics: () => {},
}

export function useAnalyticsRuntime(): AnalyticsRuntime {
  if (import.meta.server) return noopRuntime
  const nuxtApp = useNuxtApp()
  return (nuxtApp.$geeksiumAnalytics as AnalyticsRuntime | undefined) ?? noopRuntime
}

export function useAnalytics() {
  const runtime = useAnalyticsRuntime()

  /** Envío genérico; toda la telemetría pasa por aquí. */
  const track = (event: string, params: Record<string, unknown> = {}) => {
    runtime.track(event, params)
  }

  return {
    isEnabled: () => runtime.isEnabled(),
    track,

    // Navegación y descubrimiento
    trackCourseView: (courseSlug: string, courseTitle: string) =>
      track('course_view', { course_slug: courseSlug, course_title: courseTitle }),
    trackExerciseView: (courseSlug: string, exerciseSlug: string, exerciseTitle: string) =>
      track('exercise_view', {
        course_slug: courseSlug,
        exercise_slug: exerciseSlug,
        exercise_title: exerciseTitle,
      }),
    trackSearch: (term: string, results: number) =>
      track('content_search', { search_term: term, results }),
    trackFilter: (filterType: string, value: string) =>
      track('content_filter', { filter_type: filterType, filter_value: value }),

    // Progreso
    trackExerciseComplete: (courseSlug: string, exerciseSlug: string) =>
      track('exercise_complete', { course_slug: courseSlug, exercise_slug: exerciseSlug }),
    trackExerciseUncomplete: (courseSlug: string, exerciseSlug: string) =>
      track('exercise_uncomplete', { course_slug: courseSlug, exercise_slug: exerciseSlug }),
    trackCourseProgress: (courseSlug: string, percent: number) =>
      track('course_progress', { course_slug: courseSlug, percent: Math.round(percent) }),
    trackCourseComplete: (courseSlug: string) => track('course_complete', { course_slug: courseSlug }),
    trackFavoriteToggle: (exerciseSlug: string, favorite: boolean) =>
      track('favorite_toggle', { exercise_slug: exerciseSlug, favorite }),

    // Vídeo
    trackVideoStart: (exerciseSlug: string) => track('video_start', { exercise_slug: exerciseSlug }),
    trackVideoProgress: (exerciseSlug: string, percent: number) =>
      track('video_progress', { exercise_slug: exerciseSlug, percent }),
    trackVideoComplete: (exerciseSlug: string) =>
      track('video_complete', { exercise_slug: exerciseSlug }),
    trackVideoChapterClick: (exerciseSlug: string, chapterTitle: string, startTime: number) =>
      track('video_chapter_click', {
        exercise_slug: exerciseSlug,
        chapter_title: chapterTitle,
        start_time: startTime,
      }),
    trackYoutubeOpen: (exerciseSlug: string) => track('youtube_open', { exercise_slug: exerciseSlug }),

    // Recursos e interacción
    trackDownload: (courseId: string, exerciseId: string, resourceId: string, resourceType: string, resourceHost?: string) =>
      track('resource_download', {
        course_id: courseId,
        exercise_id: exerciseId,
        resource_id: resourceId,
        resource_type: resourceType,
        resource_host: resourceHost,
      }),
    trackModel3dInteraction: (exerciseSlug: string, action: string) =>
      track('model_3d_interaction', { exercise_slug: exerciseSlug, action }),
    trackShare: (contentType: string, slug: string, method: string) =>
      track('share', { content_type: contentType, item_slug: slug, method }),
    trackOutboundClick: (url: string, label?: string) =>
      track('outbound_click', { url, label }),

    // Preferencias
    trackThemeChange: (theme: string) => track('theme_change', { theme }),
    trackLocaleChange: (locale: string) => track('locale_change', { locale }),
    trackConsentDecision: (granted: boolean) =>
      track('analytics_consent', { granted }),
    trackPwaInstall: () => track('pwa_install'),
    trackSupportInfoOpen: () => track('support_info_open'),
    trackDonationClick: (amount: 1 | 2) =>
      track('donation_click', { provider: 'stripe', amount, currency: 'USD' }),
  }
}
