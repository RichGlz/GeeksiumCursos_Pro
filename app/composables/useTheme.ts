import type { ThemePreference } from '~/types/progress'

/** Modo claro/oscuro/sistema, persistido con namespace `geeksium:theme`. */
export function useTheme() {
  const preferences = usePreferencesStore()

  const apply = (theme: ThemePreference) => {
    if (import.meta.server) return
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const dark = theme === 'dark' || (theme === 'system' && prefersDark)
    document.documentElement.classList.toggle('dark', dark)
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
  }

  const theme = computed(() => preferences.theme)

  const isDark = computed(() => {
    if (import.meta.server) return false
    return document.documentElement.classList.contains('dark')
  })

  const setTheme = (value: ThemePreference) => {
    preferences.setTheme(value)
    apply(value)
  }

  const cycleTheme = () => {
    const order: ThemePreference[] = ['system', 'light', 'dark']
    const nextIndex = (order.indexOf(preferences.theme) + 1) % order.length
    setTheme(order[nextIndex] as ThemePreference)
  }

  return { theme, isDark, setTheme, cycleTheme, apply }
}
