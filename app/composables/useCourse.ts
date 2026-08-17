import type { CourseWithExercises } from '~/types/content'

/** Acceso a los cursos descubiertos desde los JSON de contenido. */
export function useCourses(): CourseWithExercises[] {
  return getAllCourses()
}

export function useCourse(slug: MaybeRefOrGetter<string>) {
  const course = computed(() => getCourse(toValue(slug)))
  return { course }
}
