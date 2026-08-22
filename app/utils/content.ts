import type {
  Course,
  CourseWithExercises,
  Exercise,
  LocaleCode,
  LocalizedList,
  LocalizedText,
} from '~/types/content'

export const GLOBAL_BROWSER_THEME_COLOR = '#0f172a'
const hexColor = /^#[0-9a-f]{6}$/i

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

const authorNotesModules = import.meta.glob<string>(
  '../../content/courses/*/exercises/*.md',
  { eager: true, query: '?raw', import: 'default' },
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

function validateOptionalHex(value: unknown, file: string, prop: string): void {
  if (value !== undefined && (typeof value !== 'string' || !hexColor.test(value))) {
    fail(file, `"${prop}" debe ser un color hexadecimal #RRGGBB.`)
  }
}

function validateOptionalObject(value: unknown, file: string, prop: string): void {
  if (value !== undefined && (!value || typeof value !== 'object' || Array.isArray(value))) {
    fail(file, `"${prop}" debe ser un objeto.`)
  }
}

function validateCourse(raw: Course, file: string, slugFromDir: string): Course {
  requireString(raw?.id, file, 'id')
  requireLocalized(raw?.title, file, 'title')
  requireLocalized(raw?.description, file, 'description')
  const slug = typeof raw.slug === 'string' && raw.slug ? raw.slug : slugFromDir
  if (slug !== slugFromDir) {
    fail(file, `el "slug" (${slug}) no coincide con la carpeta (${slugFromDir}).`)
  }
  if (raw.theme) {
    if (!hexColor.test(raw.theme.primary) || !hexColor.test(raw.theme.secondary)) {
      fail(file, '"theme.primary" y "theme.secondary" deben ser colores hexadecimales #RRGGBB.')
    }
    const theme = raw.theme
    const optionalObjects: Array<[unknown, string]> = [
      [theme.markdown, 'theme.markdown'],
      [theme.markdown?.inlineCode, 'theme.markdown.inlineCode'],
      [theme.markdown?.inlineCode?.background, 'theme.markdown.inlineCode.background'],
      [theme.markdown?.inlineCode?.text, 'theme.markdown.inlineCode.text'],
      [theme.markdown?.codeBlock, 'theme.markdown.codeBlock'],
      [theme.markdown?.codeBlock?.background, 'theme.markdown.codeBlock.background'],
      [theme.markdown?.codeBlock?.text, 'theme.markdown.codeBlock.text'],
      [theme.markdown?.blockquote, 'theme.markdown.blockquote'],
      [theme.markdown?.blockquote?.border, 'theme.markdown.blockquote.border'],
      [theme.markdown?.link, 'theme.markdown.link'],
      [theme.badges, 'theme.badges'],
      [theme.badges?.level, 'theme.badges.level'],
      [theme.badges?.level?.background, 'theme.badges.level.background'],
      [theme.badges?.level?.text, 'theme.badges.level.text'],
      [theme.tools, 'theme.tools'],
      [theme.tools?.background, 'theme.tools.background'],
      [theme.tools?.text, 'theme.tools.text'],
      [theme.video, 'theme.video'],
      [theme.buttons, 'theme.buttons'],
      [theme.buttons?.solid, 'theme.buttons.solid'],
      [theme.buttons?.solid?.background, 'theme.buttons.solid.background'],
      [theme.buttons?.subtle, 'theme.buttons.subtle'],
      [theme.buttons?.subtle?.text, 'theme.buttons.subtle.text'],
    ]
    for (const [value, prop] of optionalObjects) validateOptionalObject(value, file, prop)
    const optionalColors: Array<[unknown, string]> = [
      [theme.browser, 'theme.browser'],
      [theme.markdown?.inlineCode?.background?.light, 'theme.markdown.inlineCode.background.light'],
      [theme.markdown?.inlineCode?.background?.dark, 'theme.markdown.inlineCode.background.dark'],
      [theme.markdown?.inlineCode?.text?.light, 'theme.markdown.inlineCode.text.light'],
      [theme.markdown?.inlineCode?.text?.dark, 'theme.markdown.inlineCode.text.dark'],
      [theme.markdown?.codeBlock?.background?.light, 'theme.markdown.codeBlock.background.light'],
      [theme.markdown?.codeBlock?.background?.dark, 'theme.markdown.codeBlock.background.dark'],
      [theme.markdown?.codeBlock?.text?.light, 'theme.markdown.codeBlock.text.light'],
      [theme.markdown?.codeBlock?.text?.dark, 'theme.markdown.codeBlock.text.dark'],
      [theme.markdown?.blockquote?.border?.light, 'theme.markdown.blockquote.border.light'],
      [theme.markdown?.blockquote?.border?.dark, 'theme.markdown.blockquote.border.dark'],
      [theme.markdown?.link?.light, 'theme.markdown.link.light'],
      [theme.markdown?.link?.dark, 'theme.markdown.link.dark'],
      [theme.badges?.level?.background?.light, 'theme.badges.level.background.light'],
      [theme.badges?.level?.background?.dark, 'theme.badges.level.background.dark'],
      [theme.badges?.level?.text?.light, 'theme.badges.level.text.light'],
      [theme.badges?.level?.text?.dark, 'theme.badges.level.text.dark'],
      [theme.tools?.background?.light, 'theme.tools.background.light'],
      [theme.tools?.background?.dark, 'theme.tools.background.dark'],
      [theme.tools?.text?.light, 'theme.tools.text.light'],
      [theme.tools?.text?.dark, 'theme.tools.text.dark'],
      [theme.video?.playButton, 'theme.video.playButton'],
      [theme.video?.progress, 'theme.video.progress'],
      [theme.video?.volume, 'theme.video.volume'],
      [theme.buttons?.solid?.background?.light, 'theme.buttons.solid.background.light'],
      [theme.buttons?.solid?.background?.dark, 'theme.buttons.solid.background.dark'],
      [theme.buttons?.subtle?.text?.light, 'theme.buttons.subtle.text.light'],
      [theme.buttons?.subtle?.text?.dark, 'theme.buttons.subtle.text.dark'],
    ]
    for (const [value, prop] of optionalColors) validateOptionalHex(value, file, prop)
  }
  return { ...raw, slug }
}

function validateExercise(raw: Exercise, file: string, courseSlug: string): Exercise {
  requireString(raw?.id, file, 'id')
  requireString(raw?.slug, file, 'slug')
  requireLocalized(raw?.title, file, 'title')
  if (!/^ejercicio-\d{3}(?:-\d+)?$/.test(raw.slug)) {
    fail(file, '"slug" debe usar la convención "ejercicio-XXX" o "ejercicio-XXX-N".')
  }
  const order = raw?.order
  if (typeof order !== 'number' || !Number.isFinite(order)) {
    fail(file, 'falta la propiedad obligatoria "order" (número).')
  }
  const levels = new Set([
    'beginner-1', 'beginner-2', 'beginner-3',
    'intermediate-1', 'intermediate-2', 'intermediate-3',
    'advanced-1', 'advanced-2', 'advanced-3',
  ])
  if (raw.level !== undefined && !levels.has(raw.level)) {
    fail(file, `el "level" (${raw.level}) no es uno de los nueve niveles soportados.`)
  }
  if (raw.type !== undefined && raw.type !== 'exercise' && raw.type !== 'challenge') {
    fail(file, '"type" debe ser "exercise" o "challenge".')
  }
  if (raw.tools !== undefined) {
    if (!Array.isArray(raw.tools)) fail(file, '"tools" debe ser un array.')
    const ids = new Set<string>()
    for (const tool of raw.tools) {
      if (!tool || typeof tool !== 'object') fail(file, 'cada elemento de "tools" debe ser un objeto.')
      requireString(tool.id, file, 'tools[].id')
      requireString(tool.name?.es, file, 'tools[].name.es')
      requireString(tool.name?.en, file, 'tools[].name.en')
      if (ids.has(tool.id)) fail(file, `el id de herramienta "${tool.id}" está duplicado.`)
      ids.add(tool.id)
    }
  }
  if (raw.model3d) {
    const supportedFormats = new Set(['stl', 'glb', 'gltf'])
    if (raw.model3d.url !== undefined) requireString(raw.model3d.url, file, 'model3d.url')
    if (raw.model3d.enabled && !raw.model3d.url) {
      fail(file, '"model3d.url" es obligatoria cuando "model3d.enabled" es true.')
    }
    if (raw.model3d.format !== undefined && !supportedFormats.has(raw.model3d.format)) {
      fail(file, '"model3d.format" debe ser "stl", "glb" o "gltf".')
    }
    if (raw.model3d.rotation) {
      for (const axis of ['x', 'y', 'z'] as const) {
        const value = raw.model3d.rotation[axis]
        if (value !== undefined && (typeof value !== 'number' || !Number.isFinite(value))) {
          fail(file, `"model3d.rotation.${axis}" debe ser un número finito en grados.`)
        }
      }
    }
  }
  return { ...raw, order, courseSlug }
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

  for (const [path, raw] of Object.entries(exerciseModules)) {
    const courseSlug = courseSlugFromPath(path)
    const fileName = fileNameFromPath(path)
    const file = `content/courses/${courseSlug}/exercises/${fileName}`
    const course = byCourse.get(courseSlug)
    if (!course) continue

    const exercise = validateExercise(raw, file, courseSlug)
    if (exercise.enabled === false) continue

    course.exercises.push(exercise)
  }

  for (const course of byCourse.values()) {
    course.exercises.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order
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

/** Color seguro para la barra del navegador: curso -> primario -> global. */
export function courseBrowserThemeColor(course?: Course): string {
  const color = course?.theme?.browser ?? course?.theme?.primary
  return color && hexColor.test(color) ? color : GLOBAL_BROWSER_THEME_COLOR
}

/** Variables de tema limitadas al árbol visual de un curso. */
export function courseThemeStyle(course: Course): Record<string, string> {
  const theme = course.theme
  const primary = theme?.primary ?? 'var(--color-brand-600)'
  const secondary = theme?.secondary ?? 'var(--color-brand-400)'
  return {
    '--course-primary': primary,
    '--course-secondary': secondary,
    '--course-md-inline-bg-light': theme?.markdown?.inlineCode?.background?.light ?? `color-mix(in srgb, ${primary} 10%, white)`,
    '--course-md-inline-bg-dark': theme?.markdown?.inlineCode?.background?.dark ?? `color-mix(in srgb, ${primary} 20%, var(--color-ink-900))`,
    '--course-md-inline-text-light': theme?.markdown?.inlineCode?.text?.light ?? `color-mix(in srgb, ${primary} 62%, black)`,
    '--course-md-inline-text-dark': theme?.markdown?.inlineCode?.text?.dark ?? 'var(--color-ink-100)',
    '--course-md-block-bg-light': theme?.markdown?.codeBlock?.background?.light ?? `color-mix(in srgb, ${primary} 42%, #080b10)`,
    '--course-md-block-bg-dark': theme?.markdown?.codeBlock?.background?.dark ?? `color-mix(in srgb, ${primary} 42%, #080b10)`,
    '--course-md-block-text-light': theme?.markdown?.codeBlock?.text?.light ?? '#cccccc',
    '--course-md-block-text-dark': theme?.markdown?.codeBlock?.text?.dark ?? '#cccccc',
    '--course-md-quote-border-light': theme?.markdown?.blockquote?.border?.light ?? primary,
    '--course-md-quote-border-dark': theme?.markdown?.blockquote?.border?.dark ?? primary,
    '--course-md-link-light': theme?.markdown?.link?.light ?? primary,
    '--course-md-link-dark': theme?.markdown?.link?.dark ?? primary,
    '--course-level-bg-light': theme?.badges?.level?.background?.light ?? `color-mix(in srgb, ${primary} 10%, transparent)`,
    '--course-level-bg-dark': theme?.badges?.level?.background?.dark ?? `color-mix(in srgb, ${primary} 16%, transparent)`,
    '--course-level-text-light': theme?.badges?.level?.text?.light ?? primary,
    '--course-level-text-dark': theme?.badges?.level?.text?.dark ?? primary,
    '--course-tools-bg-light': theme?.tools?.background?.light ?? 'var(--color-ink-50)',
    '--course-tools-bg-dark': theme?.tools?.background?.dark ?? 'var(--color-ink-900)',
    '--course-tools-text-light': theme?.tools?.text?.light ?? 'var(--color-ink-500)',
    '--course-tools-text-dark': theme?.tools?.text?.dark ?? 'var(--color-ink-400)',
    '--course-video-play': theme?.video?.playButton ?? primary,
    '--course-video-progress': theme?.video?.progress ?? primary,
    '--course-video-volume': theme?.video?.volume ?? primary,
    '--course-solid-bg-light': theme?.buttons?.solid?.background?.light ?? primary,
    '--course-solid-bg-dark': theme?.buttons?.solid?.background?.dark ?? primary,
    '--course-subtle-text-light': theme?.buttons?.subtle?.text?.light ?? primary,
    '--course-subtle-text-dark': theme?.buttons?.subtle?.text?.dark ?? primary,
  }
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

/** Carga Markdown vecino al JSON, sin permitir rutas fuera de la carpeta del ejercicio. */
export function getAuthorNotesMarkdown(exercise: Exercise, locale: string): string | undefined {
  const files = exercise.authorNotesFile
  if (!files) return undefined
  const requested = locale === 'en' ? (files.en || files.es) : files.es
  if (!requested || requested !== requested.split(/[\\/]/).pop()) return undefined
  const key = `../../content/courses/${exercise.courseSlug}/exercises/${requested}`
  const markdown = authorNotesModules[key]
  return typeof markdown === 'string' && markdown.trim() ? markdown : undefined
}
