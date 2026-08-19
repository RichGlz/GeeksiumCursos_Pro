import { defineStore } from 'pinia'
import type { FavoritesState, ProgressState } from '~/types/progress'

const PROGRESS_VERSION = 1

/**
 * Estado global de progreso y favoritos.
 * Hoy persiste en localStorage; mañana podrá sincronizar con un backend
 * sin que los componentes tengan que cambiar (usan `useExerciseProgress`).
 */
export const useProgressStore = defineStore('progress', {
  state: (): { progress: ProgressState; favorites: FavoritesState; hydrated: boolean } => ({
    progress: { version: PROGRESS_VERSION, completedExercises: [], lastVisited: {} },
    favorites: { version: PROGRESS_VERSION, favorites: [] },
    hydrated: false,
  }),

  getters: {
    isCompleted: (state) => (exerciseId: string) =>
      state.progress.completedExercises.includes(exerciseId),
    isFavorite: (state) => (exerciseId: string) => state.favorites.favorites.includes(exerciseId),
    completedCount: (state) => state.progress.completedExercises.length,
  },

  actions: {
    hydrate() {
      if (this.hydrated || import.meta.server) return
      const storage = useLocalStorage()
      this.progress = migrateProgress(
        storage.read<ProgressState>('progress', this.progress),
      )
      this.favorites = migrateFavorites(
        storage.read<FavoritesState>('favorites', this.favorites),
      )
      this.hydrated = true
    },

    persist() {
      const storage = useLocalStorage()
      storage.write('progress', this.progress)
      storage.write('favorites', this.favorites)
    },

    setCompleted(exerciseId: string, completed: boolean) {
      const list = new Set(this.progress.completedExercises)
      if (completed) list.add(exerciseId)
      else list.delete(exerciseId)
      this.progress.completedExercises = [...list]
      this.persist()
    },

    toggleCompleted(exerciseId: string): boolean {
      const next = !this.progress.completedExercises.includes(exerciseId)
      this.setCompleted(exerciseId, next)
      return next
    },

    toggleFavorite(exerciseId: string): boolean {
      const list = new Set(this.favorites.favorites)
      const next = !list.has(exerciseId)
      if (next) list.add(exerciseId)
      else list.delete(exerciseId)
      this.favorites.favorites = [...list]
      this.persist()
      return next
    },

    setLastVisited(courseSlug: string, exerciseSlug: string) {
      this.progress.lastVisited = { ...this.progress.lastVisited, [courseSlug]: exerciseSlug }
      this.persist()
    },

    replaceLocalState(progress: ProgressState, favorites: FavoritesState) {
      this.progress = migrateProgress(progress)
      this.favorites = migrateFavorites(favorites)
      this.hydrated = true
      this.persist()
    },

    resetCourse(exerciseIds: string[]) {
      const ids = new Set(exerciseIds)
      this.progress.completedExercises = this.progress.completedExercises.filter(
        (id) => !ids.has(id),
      )
      this.persist()
    },
  },
})

function migrateProgress(raw: ProgressState): ProgressState {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.completedExercises)) {
    return { version: PROGRESS_VERSION, completedExercises: [], lastVisited: {} }
  }
  return {
    version: PROGRESS_VERSION,
    completedExercises: raw.completedExercises.filter((id) => typeof id === 'string'),
    lastVisited: raw.lastVisited ?? {},
  }
}

function migrateFavorites(raw: FavoritesState): FavoritesState {
  if (!raw || typeof raw !== 'object' || !Array.isArray(raw.favorites)) {
    return { version: PROGRESS_VERSION, favorites: [] }
  }
  return {
    version: PROGRESS_VERSION,
    favorites: raw.favorites.filter((id) => typeof id === 'string'),
  }
}
