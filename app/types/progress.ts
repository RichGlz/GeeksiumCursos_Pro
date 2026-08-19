/** Esquema versionado del progreso local (preparado para migraciones futuras). */
export interface ProgressState {
  version: number
  completedExercises: string[]
  lastVisited?: Record<string, string>
}

export interface FavoritesState {
  version: number
  favorites: string[]
}

export type ThemePreference = 'system' | 'light' | 'dark'

export type AnalyticsConsent = 'granted' | 'denied' | 'unknown'

export interface ProgressBackup {
  version: 1
  exportedAt: string
  progress: ProgressState
  favorites: FavoritesState
  preferences: {
    theme: ThemePreference
  }
}

export interface BadgeNotificationState {
  version: number
  notified: string[]
}
