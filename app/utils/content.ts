import type {
  Course,
  CourseWithExercises,
  Exercise,
  LocaleCode,
  LocalizedList,
  LocalizedText,
} from '~/types/content'

/**
 * Motor de contenido.
 *
 * Los cursos y ejercicios se descubren en build mediante `import.meta.glob`.
 * Agregar una carpeta de curso o un JSON de ejercicio es suficiente: no hace
 * falta crear páginas Vue ni registrar nada manualmente.
 */
const courseModules = import.meta.glob<Course>('../../content/courses/*/course.json', {
  eager: true,
  import: 'default',
})

const exerciseModules = import.meta.glob<Exercise>(
  '../../content/courses/*/exercises/*.json',
  { eager: true, import: 'default' },
)

function courseSlugFromPath(path: string): string {
  return path.split('/content/courses/')[1]?.split('/')[0] ?? ''
}

function fileNameFromPath(path: string): string {
  return path.split('/').pop() ?? path
}

function fail(file: string, message: string): never {
  throw new Error(`[geeksium:content] ${file}: ${message}`)
}

function requireString(value: unknown, file: string, prop: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    fail(file, `falta la propiedad obligatoria "${prop}" (string).`)
  }
  return value
}

function requireLocalized(value: unknown, file: string, prop: string): LocalizedText {
  if (!value || typeof value !== 'object' || typeof (value as LocalizedText).es !== 'string') {
    fail(file, `la propiedad "${prop}" debe ser un objeto con al menos { "es": "..." }.`)
  }
  return value as LocalizedText
}

function validateCourse(raw: Course, file: string, slugFromDir: string): Course {
  requireString(raw?.id, file, 'id')
  requireLocalized(raw?.title, file, 'title')
  requireLocalized(raw?.description, file, 'description')
  const slug = typeof raw.slug === 'string' && raw.slug ? raw.slug : slugFromDir
  if (slug !== slugFromDir) {
    fail(file, `el "slug" (${slug}) no coincide con la carpeta (${slugFromDir}).`)
  }
  return { ...raw, slug }
}

function validateExercise(raw: Exercise, file: string, courseSlug: string): Exercise {
  requireString(raw?.id, file, 'id')
  requireString(raw?.slug, file, 'slug')
  requireLocalized(raw?.title, file, 'title')
  const order = Number(raw?.order)
  if (!Number.isFinite(order)) {
    fail(file, 'falta la propiedad obligatoria "order" (número).')
  }
  return { ...raw, order, courseSlug }
}

/** Respaldo de orden: prefijo numérico del nombre de archivo (001-, 002-, ...). */
function orderFromFileName(fileName: string): number {
  const match = /^(\d+)/.exec(fileName)
  return match?.[1] ? Number(match[1]) : Number.MAX_SAFE_INTEGER
}

function buildRegistry(): CourseWithExercises[] {
  const byCourse = new Map<string, CourseWithExercises>()

  for (const [path, raw] of Object.entries(courseModules)) {
    const slugFromDir = courseSlugFromPath(path)
    const file = `content/courses/${slugFromDir}/course.json`
    const course = validateCourse(raw, file, slugFromDir)
    if (course.enabled === false) continue
    byCourse.set(course.slug, { ...course, exercises: [] })
  }

  const fallbackOrders = new Map<string, number>()

  for (const [path, raw] of Object.entries(exerciseModules)) {
    const courseSlug = courseSlugFromPath(path)
    const fileName = fileNameFromPath(path)
    const file = `content/courses/${courseSlug}/exercises/${fileName}`
    const course = byCourse.get(courseSlug)
    if (!course) continue

    const exercise = validateExercise(raw, file, courseSlug)
    if (exercise.enabled === false) continue

    fallbackOrders.set(exercise.id, orderFromFileName(fileName))
    course.exercises.push(exercise)
  }

  for (const course of byCourse.values()) {
    course.exercises.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
      const fa = fallbackOrders.get(a.id) ?? 0
      const fb = fallbackOrders.get(b.id) ?? 0
      if (fa !== fb) return fa - fb
      return a.slug.localeCompare(b.slug)
    })
  }

  return [...byCourse.values()].sort((a, b) => a.slug.localeCompare(b.slug))
}

const registry = buildRegistry()

export function getAllCourses(): CourseWithExercises[] {
  return registry
}

export function getCourse(slug: string): CourseWithExercises | undefined {
  return registry.find((course) => course.slug === slug)
}

export function getExercise(courseSlug: string, exerciseSlug: string): Exercise | undefined {
  return getCourse(courseSlug)?.exercises.find((exercise) => exercise.slug === exerciseSlug)
}

/** Devuelve el texto en el idioma pedido, con español como respaldo. */
export function tContent(text: LocalizedText | undefined, locale: string): string {
  if (!text) return ''
  const value = text[locale as LocaleCode]
  return typeof value === 'string' && value.length > 0 ? value : text.es
}

export function tListContent(list: LocalizedList | undefined, locale: string): string[] {
  if (!list) return []
  const value = list[locale as LocaleCode]
  return Array.isArray(value) && value.length > 0 ? value : (list.es ?? [])
}
