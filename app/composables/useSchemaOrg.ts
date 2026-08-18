import type { CourseWithExercises, Exercise } from '~/types/content'

/** JSON-LD del sitio (WebSite). */
export function useSchemaOrgSite(siteUrl: string, name: string, description: string) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name,
          description,
          url: siteUrl,
        }),
      },
    ],
  })
}

/** JSON-LD de curso. */
export function useSchemaOrgCourse(
  course: CourseWithExercises,
  title: string,
  description: string,
  url: string,
) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Course',
          name: title,
          description,
          url,
          provider: {
            '@type': 'Organization',
            name: course.author?.name ?? 'Geeksium',
            url: course.author?.url,
          },
          hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'online' },
        }),
      },
    ],
  })
}

/** JSON-LD de ejercicio con vídeo. */
export function useSchemaOrgExercise(
  exercise: Exercise,
  title: string,
  description: string,
  url: string,
) {
  const youtubeId = resolveYoutubeId(exercise.video)
  if (!exercise.video || exercise.video.enabled === false || !youtubeId) return
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'VideoObject',
          name: title,
          description,
          uploadDate: isoDate(exercise.publishedAt) || undefined,
          thumbnailUrl: exercise.video.poster ? [exercise.video.poster] : undefined,
          contentUrl: exercise.video.url,
          embedUrl: `https://www.youtube.com/embed/${youtubeId}`,
          url,
        }),
      },
    ],
  })
}

export interface SchemaBreadcrumbItem { name: string; url: string }

/** BreadcrumbList reusable para curso y ejercicio, con URLs absolutas/localizadas. */
export function useSchemaOrgBreadcrumb(items: SchemaBreadcrumbItem[]) {
  useHead({
    script: [{
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
          '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
        })),
      }),
    }],
  })
}
