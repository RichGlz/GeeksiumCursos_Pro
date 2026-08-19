import type { CourseWithExercises } from '~/types/content'

export type BadgeId =
  | 'first-exercise'
  | '10-exercises'
  | '25-exercises'
  | '50-exercises'
  | '100-exercises'
  | 'level-complete'
  | 'challenge-milestone'

export function earnedBadgeIds(
  completedExerciseIds: string[],
  courses: CourseWithExercises[],
): BadgeId[] {
  const completed = new Set(completedExerciseIds)
  const result: BadgeId[] = []
  const countMilestones: Array<[number, BadgeId]> = [
    [1, 'first-exercise'],
    [10, '10-exercises'],
    [25, '25-exercises'],
    [50, '50-exercises'],
    [100, '100-exercises'],
  ]

  for (const [count, id] of countMilestones) {
    if (completed.size >= count) result.push(id)
  }

  const levelGroups = new Map<string, string[]>()
  const challenges: string[] = []
  for (const course of courses) {
    for (const exercise of course.exercises) {
      if (exercise.level) {
        const key = `${course.id}:${exercise.level}`
        levelGroups.set(key, [...(levelGroups.get(key) ?? []), exercise.id])
      }
      if (exercise.type === 'challenge') challenges.push(exercise.id)
    }
  }

  if ([...levelGroups.values()].some((ids) => ids.length > 0 && ids.every((id) => completed.has(id)))) {
    result.push('level-complete')
  }
  if (challenges.filter((id) => completed.has(id)).length >= 10) {
    result.push('challenge-milestone')
  }

  return result
}
