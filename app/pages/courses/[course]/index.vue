<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const courseSlug = computed(() => String(route.params.course))
const { course } = useCourse(courseSlug)

// 404 real para cursos inexistentes (también durante el prerender).
if (!course.value) {
  throw createError({ status: 404, statusText: 'Not Found' })
}

const currentCourse = computed(() => course.value!)
const title = computed(() =>
  tContent(currentCourse.value.seo?.title ?? currentCourse.value.title, locale.value),
)
const description = computed(() =>
  tContent(currentCourse.value.seo?.description ?? currentCourse.value.description, locale.value),
)
const canonical = computed(
  () => `${config.public.siteUrl}${localePath(`/courses/${currentCourse.value.slug}`)}`,
)

const { courseProgress, courseCompletedCount } = useExerciseProgress()
const mounted = useMounted()
const percent = computed(() => (mounted.value ? courseProgress(currentCourse.value) : 0))
const done = computed(() => (mounted.value ? courseCompletedCount(currentCourse.value) : 0))

const analytics = useAnalytics()
onMounted(() => analytics.trackCourseView(currentCourse.value.slug, title.value))

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  ogTitle: () => title.value,
  ogDescription: () => description.value,
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useHead({ link: [{ rel: 'canonical', href: canonical.value }] })
useSchemaOrgCourse(currentCourse.value, title.value, description.value, canonical.value)

const firstExercise = computed(() => currentCourse.value.exercises[0])
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <nav class="mb-6 text-sm muted-text" aria-label="breadcrumb">
      <NuxtLink :to="localePath('/courses')" class="hover:text-brand-600">{{ t('courses.title') }}</NuxtLink>
      <span aria-hidden="true"> / </span>
      <span class="text-ink-700 dark:text-ink-200">{{ tContent(currentCourse.title, locale) }}</span>
    </nav>

    <div class="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <div>
        <h1 class="text-3xl font-black tracking-tight text-ink-900 sm:text-4xl dark:text-white">
          {{ tContent(currentCourse.title, locale) }}
        </h1>
        <p class="mt-3 max-w-2xl text-lg muted-text">
          {{ tContent(currentCourse.description, locale) }}
        </p>

        <NuxtLink
          v-if="firstExercise"
          :to="localePath(`/courses/${currentCourse.slug}/${firstExercise.slug}`)"
          class="mt-6 inline-flex rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
        >
          {{ done > 0 ? t('courses.continue') : t('courses.start') }}
        </NuxtLink>

        <h2 class="mb-4 mt-10 text-xl font-bold text-ink-900 dark:text-white">
          {{ t('course.exercisesTitle') }}
        </h2>
        <ExerciseList :exercises="currentCourse.exercises" />
      </div>

      <aside class="flex flex-col gap-4">
        <div class="surface-card p-5">
          <h2 class="mb-3 text-sm font-bold uppercase tracking-wide muted-text">
            {{ t('course.progress') }}
          </h2>
          <CourseProgressBar :percent="percent" :done="done" :total="currentCourse.exercises.length" />
        </div>

        <div v-if="currentCourse.author" class="surface-card p-5">
          <h2 class="mb-2 text-sm font-bold uppercase tracking-wide muted-text">
            {{ t('course.instructor') }}
          </h2>
          <p class="font-semibold text-ink-900 dark:text-white">{{ currentCourse.author.name }}</p>
        </div>
      </aside>
    </div>
  </div>
</template>
