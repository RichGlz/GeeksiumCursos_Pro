import type { CourseWithExercises, LocalizedText } from '~/types/content'

export type AchievementCondition =
  | 'completed-count'
  | 'level-complete'
  | 'challenge-count'
  | 'course-complete'
  | 'courses-complete'

export interface AchievementDefinition {
  id: string
  title: LocalizedText
  description: LocalizedText
  condition: AchievementCondition
  threshold: number
  iconKey: string
  enabled: boolean
}

/** Catálogo extensible: la evaluación vive aquí, nunca en los componentes. */
export const ACHIEVEMENTS = [
  {
    id: 'first-exercise',
    title: { es: 'Primer ejercicio', en: 'First exercise' },
    description: { es: 'Completaste tu primer ejercicio.', en: 'You completed your first exercise.' },
    condition: 'completed-count', threshold: 1, iconKey: 'sparkles', enabled: true,
  },
  {
    id: '10-exercises',
    title: { es: '10 ejercicios', en: '10 exercises' },
    description: { es: 'Completaste 10 ejercicios.', en: 'You completed 10 exercises.' },
    condition: 'completed-count', threshold: 10, iconKey: 'medal', enabled: true,
  },
  {
    id: '25-exercises',
    title: { es: '25 ejercicios', en: '25 exercises' },
    description: { es: 'Completaste 25 ejercicios.', en: 'You completed 25 exercises.' },
    condition: 'completed-count', threshold: 25, iconKey: 'medal', enabled: true,
  },
  {
    id: '50-exercises',
    title: { es: '50 ejercicios', en: '50 exercises' },
    description: { es: 'Completaste 50 ejercicios.', en: 'You completed 50 exercises.' },
    condition: 'completed-count', threshold: 50, iconKey: 'trophy', enabled: true,
  },
  {
    id: '100-exercises',
    title: { es: '100 ejercicios', en: '100 exercises' },
    description: { es: 'Completaste 100 ejercicios.', en: 'You completed 100 exercises.' },
    condition: 'completed-count', threshold: 100, iconKey: 'trophy', enabled: true,
  },
  {
    id: 'level-complete',
    title: { es: 'Nivel completado', en: 'Level complete' },
    description: { es: 'Completaste todos los ejercicios de un nivel.', en: 'You completed every exercise in a level.' },
    condition: 'level-complete', threshold: 1, iconKey: 'layers', enabled: true,
  },
  {
    id: 'challenge-milestone',
    title: { es: '10 retos', en: '10 challenges' },
    description: { es: 'Completaste 10 retos.', en: 'You completed 10 challenges.' },
    condition: 'challenge-count', threshold: 10, iconKey: 'flag', enabled: true,
  },
] as const satisfies readonly AchievementDefinition[]

export type BadgeId = (typeof ACHIEVEMENTS)[number]['id']

export function badgeDefinition(id: BadgeId): AchievementDefinition {
  return ACHIEVEMENTS.find(badge => badge.id === id) as AchievementDefinition
}

export function earnedBadgeIds(
  completedExerciseIds: string[],
  courses: CourseWithExercises[],
): BadgeId[] {
  const completed = new Set(completedExerciseIds)
  const result: BadgeId[] = []
  const levelGroups = new Map<string, string[]>()
  const challenges: string[] = []
  let completedCourses = 0
  for (const course of courses) {
    for (const exercise of course.exercises) {
      if (exercise.level) {
        const key = `${course.id}:${exercise.level}`
        levelGroups.set(key, [...(levelGroups.get(key) ?? []), exercise.id])
      }
      if (exercise.type === 'challenge') challenges.push(exercise.id)
    }
    if (course.exercises.length > 0 && course.exercises.every(exercise => completed.has(exercise.id))) {
      completedCourses++
    }
  }

  const completedLevels = [...levelGroups.values()].filter(
    ids => ids.length > 0 && ids.every(id => completed.has(id)),
  ).length
  const completedChallenges = challenges.filter(id => completed.has(id)).length
  const values: Record<AchievementCondition, number> = {
    'completed-count': completed.size,
    'level-complete': completedLevels,
    'challenge-count': completedChallenges,
    'course-complete': completedCourses,
    'courses-complete': completedCourses,
  }

  for (const achievement of ACHIEVEMENTS as readonly AchievementDefinition[]) {
    if (!achievement.enabled) continue
    if (values[achievement.condition] >= achievement.threshold) {
      result.push(achievement.id as BadgeId)
    }
  }

  return result
}
