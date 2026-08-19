import type {
  FavoritesState,
  ProgressBackup,
  ProgressState,
  ThemePreference,
} from '~/types/progress'

const BACKUP_VERSION = 1 as const
const themes: ThemePreference[] = ['system', 'light', 'dark']

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.some((item) => typeof item !== 'string')) return undefined
  return [...new Set(value)]
}

function lastVisited(value: unknown): Record<string, string> | undefined {
  if (value === undefined) return {}
  if (!isRecord(value) || Object.values(value).some((item) => typeof item !== 'string')) {
    return undefined
  }
  return Object.fromEntries(Object.entries(value) as Array<[string, string]>)
}

export function createProgressBackup(
  progress: ProgressState,
  favorites: FavoritesState,
  theme: ThemePreference,
): ProgressBackup {
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    progress: {
      version: BACKUP_VERSION,
      completedExercises: [...progress.completedExercises],
      lastVisited: { ...(progress.lastVisited ?? {}) },
    },
    favorites: { version: BACKUP_VERSION, favorites: [...favorites.favorites] },
    preferences: { theme },
  }
}

/** Valida y normaliza únicamente el esquema portable de Geeksium V1. */
export function parseProgressBackup(value: unknown): ProgressBackup | undefined {
  if (!isRecord(value) || value.version !== BACKUP_VERSION) return undefined
  if (typeof value.exportedAt !== 'string' || Number.isNaN(Date.parse(value.exportedAt))) return undefined
  if (!isRecord(value.progress) || value.progress.version !== BACKUP_VERSION) return undefined
  if (!isRecord(value.favorites) || value.favorites.version !== BACKUP_VERSION) return undefined
  if (!isRecord(value.preferences)) return undefined

  const completedExercises = stringArray(value.progress.completedExercises)
  const visited = lastVisited(value.progress.lastVisited)
  const favorites = stringArray(value.favorites.favorites)
  const theme = value.preferences.theme
  if (!completedExercises || !visited || !favorites || !themes.includes(theme as ThemePreference)) {
    return undefined
  }

  return {
    version: BACKUP_VERSION,
    exportedAt: value.exportedAt,
    progress: { version: BACKUP_VERSION, completedExercises, lastVisited: visited },
    favorites: { version: BACKUP_VERSION, favorites },
    preferences: { theme: theme as ThemePreference },
  }
}
