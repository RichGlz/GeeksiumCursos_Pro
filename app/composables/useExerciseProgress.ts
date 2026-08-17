import type { CourseWithExercises } from '~/types/content'

/**
 * Abstracción de progreso y favoritos.
 *
 * Los componentes NUNCA tocan localStorage: usan este composable. En una fase
 * futura este mismo API podrá sincronizar contra un backend sin cambiar la UI.
 */
export function useExerciseProgress() {
  const store = useProgressStore()

  onMounted(() => store.hydrate())

  const isCompleted = (exerciseId: string) => store.isCompleted(exerciseId)
  const isFavorite = (exerciseId: string) => store.isFavorite(exerciseId)

  const toggleCompleted = (exerciseId: string) => store.toggleCompleted(exerciseId)
  const setCompleted = (exerciseId: string, value: boolean) =>
    store.setCompleted(exerciseId, value)
  const toggleFavorite = (exerciseId: string) => store.toggleFavorite(exerciseId)
  const setLastVisited = (courseSlug: string, exerciseSlug: string) =>
    store.setLastVisited(courseSlug, exerciseSlug)

  /** Progreso 0-100 de un curso completo. */
  const courseProgress = (course: CourseWithExercises | undefined): number => {
    if (!course || course.exercises.length === 0) return 0
    const done = course.exercises.filter((exercise) => store.isCompleted(exercise.id)).length
    return (done / course.exercises.length) * 100
  }

  const courseCompletedCount = (course: CourseWithExercises | undefined): number =>
    course ? course.exercises.filter((exercise) => store.isCompleted(exercise.id)).length : 0

  return {
    store,
    isCompleted,
    isFavorite,
    toggleCompleted,
    setCompleted,
    toggleFavorite,
    setLastVisited,
    courseProgress,
    courseCompletedCount,
  }
}
