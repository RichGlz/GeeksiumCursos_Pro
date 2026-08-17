import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Lee el directorio de contenido en build y devuelve la lista completa de rutas
 * a prerenderizar (home, cursos y ejercicios) para cada idioma configurado.
 *
 * Se ejecuta en `nuxt.config.ts`, por lo que sólo usa Node y no depende de Nuxt.
 */
export function buildContentRoutes(
  coursesDir: string,
  locales: string[],
  defaultLocale: string,
): string[] {
  const paths: string[] = ['/', '/courses']

  if (existsSync(coursesDir)) {
    const courseDirs = readdirSync(coursesDir).filter((entry) =>
      statSync(join(coursesDir, entry)).isDirectory(),
    )

    for (const courseSlug of courseDirs) {
      const courseFile = join(coursesDir, courseSlug, 'course.json')
      if (!existsSync(courseFile)) continue

      try {
        const course = JSON.parse(readFileSync(courseFile, 'utf-8')) as {
          slug?: string
          enabled?: boolean
        }
        if (course.enabled === false) continue
      } catch {
        continue
      }

      paths.push(`/courses/${courseSlug}`)

      const exercisesDir = join(coursesDir, courseSlug, 'exercises')
      if (!existsSync(exercisesDir)) continue

      const exerciseFiles = readdirSync(exercisesDir).filter((file) => file.endsWith('.json'))
      for (const file of exerciseFiles) {
        try {
          const exercise = JSON.parse(readFileSync(join(exercisesDir, file), 'utf-8')) as {
            slug?: string
            enabled?: boolean
          }
          if (!exercise.slug || exercise.enabled === false) continue
          paths.push(`/courses/${courseSlug}/${exercise.slug}`)
        } catch {
          // Un JSON inválido se reporta en el motor de contenido, no aquí.
        }
      }
    }
  }

  const routes = new Set<string>()
  for (const locale of locales) {
    for (const path of paths) {
      if (locale === defaultLocale) {
        routes.add(path)
      } else {
        routes.add(path === '/' ? `/${locale}` : `/${locale}${path}`)
      }
    }
  }

  return [...routes]
}
