import type { Exercise } from '~/types/content'

/**
 * Anterior/siguiente derivados automáticamente del listado ordenado del curso.
 * Los JSON nunca declaran URLs de navegación.
 */
export function useExerciseNavigation(
  courseSlug: MaybeRefOrGetter<string>,
  exerciseSlug: MaybeRefOrGetter<string>,
) {
  const list = computed<Exercise[]>(() => getCourse(toValue(courseSlug))?.exercises ?? [])
  const index = computed(() => list.value.findIndex((item) => item.slug === toValue(exerciseSlug)))

  const previous = computed<Exercise | undefined>(() =>
    index.value > 0 ? list.value[index.value - 1] : undefined,
  )
  const next = computed<Exercise | undefined>(() =>
    index.value >= 0 && index.value < list.value.length - 1
      ? list.value[index.value + 1]
      : undefined,
  )

  return { list, index, previous, next }
}
