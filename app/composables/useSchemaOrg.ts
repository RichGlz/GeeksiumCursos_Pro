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
          hasCourseInstance: {
            '@type': 'CourseInstance',
            courseMode: 'online',
            courseWorkload: `PT${Math.max(1, course.exercises.length)}H`,
          },
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
  if (!exercise.video) return
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
          embedUrl: exercise.video.youtubeId
            ? `https://www.youtube.com/embed/${exercise.video.youtubeId}`
            : undefined,
          url,
        }),
      },
    ],
  })
}
