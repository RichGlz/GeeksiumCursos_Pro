/**
 * Acceso seguro a localStorage con namespace `geeksium:` y esquema versionado.
 * Es la única capa que toca el navegador; los componentes usan stores/composables.
 * Nunca se ejecuta durante SSR/prerender.
 */
export function useLocalStorage() {
  const prefix = 'geeksium:'

  const isAvailable = (): boolean => {
    if (import.meta.server) return false
    try {
      return typeof window !== 'undefined' && !!window.localStorage
    } catch {
      return false
    }
  }

  function read<T>(key: string, fallback: T): T {
    if (!isAvailable()) return fallback
    try {
      const raw = window.localStorage.getItem(prefix + key)
      if (!raw) return fallback
      return JSON.parse(raw) as T
    } catch {
      return fallback
    }
  }

  function write<T>(key: string, value: T): void {
    if (!isAvailable()) return
    try {
      window.localStorage.setItem(prefix + key, JSON.stringify(value))
    } catch {
      // Cuota llena o almacenamiento bloqueado: no debe romper la aplicación.
    }
  }

  function remove(key: string): void {
    if (!isAvailable()) return
    try {
      window.localStorage.removeItem(prefix + key)
    } catch {
      /* noop */
    }
  }

  return { isAvailable, read, write, remove }
}
