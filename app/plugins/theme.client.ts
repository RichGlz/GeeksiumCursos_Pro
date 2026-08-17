/** Aplica el tema guardado lo antes posible en cliente. */
export default defineNuxtPlugin(() => {
  const preferences = usePreferencesStore()
  preferences.hydrate()

  const { apply } = useTheme()
  apply(preferences.theme)

  const media = window.matchMedia('(prefers-color-scheme: dark)')
  media.addEventListener('change', () => {
    if (preferences.theme === 'system') apply('system')
  })
})
