import type { Exercise } from '~/types/content'

export function useExercise(
  courseSlug: MaybeRefOrGetter<string>,
  exerciseSlug: MaybeRefOrGetter<string>,
) {
  const exercise = computed<Exercise | undefined>(() =>
    getExercise(toValue(courseSlug), toValue(exerciseSlug)),
  )
  return { exercise }
}
