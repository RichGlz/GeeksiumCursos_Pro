/** Aplica el tema guardado después de hidratar el markup generado por SSR. */
export default defineNuxtPlugin((nuxtApp) => {
  const preferences = usePreferencesStore()
  const { apply } = useTheme()

  nuxtApp.hook('app:mounted', () => {
    preferences.hydrate()
    apply(preferences.theme)

    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', () => {
      if (preferences.theme === 'system') apply('system')
    })
  })
})
