<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()

const courseSlug = computed(() => String(route.params.course))
const exerciseSlug = computed(() => String(route.params.exercise))

const { course } = useCourse(courseSlug)
const { exercise } = useExercise(courseSlug, exerciseSlug)

// 404 real para cursos y ejercicios inexistentes.
if (!course.value || !exercise.value) {
  throw createError({ status: 404, statusText: 'Not Found' })
}

const currentCourse = computed(() => course.value!)
const currentExercise = computed(() => exercise.value!)

const { previous, next } = useExerciseNavigation(courseSlug, exerciseSlug)
const { setLastVisited } = useExerciseProgress()
const analytics = useAnalytics()

const title = computed(() =>
  tContent(currentExercise.value.seo?.title ?? currentExercise.value.title, locale.value),
)
const description = computed(() =>
  tContent(
    currentExercise.value.seo?.description ??
      currentExercise.value.summary ??
      currentCourse.value.description,
    locale.value,
  ),
)
const canonical = computed(
  () =>
    `${config.public.siteUrl}${localePath(
      `/courses/${currentCourse.value.slug}/${currentExercise.value.slug}`,
    )}`,
)

useSeoMeta({
  title: () => title.value,
  description: () => description.value,
  ogTitle: () => title.value,
  ogDescription: () => description.value,
  ogType: 'article',
  twitterCard: 'summary_large_image',
})
useHead({ link: [{ rel: 'canonical', href: canonical.value }] })
useSchemaOrgExercise(currentExercise.value, title.value, description.value, canonical.value)

const player = ref<{ seekTo: (seconds: number) => void } | null>(null)
const onSeek = (seconds: number) => player.value?.seekTo(seconds)

const notes = computed(() => tListContent(currentExercise.value.authorNotes, locale.value))

onMounted(() => {
  setLastVisited(currentCourse.value.slug, currentExercise.value.slug)
  analytics.trackExerciseView(currentCourse.value.slug, currentExercise.value.slug, title.value)
})

watch(
  () => route.fullPath,
  () => {
    if (!exercise.value) return
    setLastVisited(currentCourse.value.slug, currentExercise.value.slug)
    analytics.trackExerciseView(currentCourse.value.slug, currentExercise.value.slug, title.value)
  },
)
</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-10">
    <nav class="mb-6 text-sm muted-text" aria-label="breadcrumb">
      <NuxtLink :to="localePath('/courses')" class="hover:text-brand-600">{{ t('courses.title') }}</NuxtLink>
      <span aria-hidden="true"> / </span>
      <NuxtLink
        :to="localePath(`/courses/${currentCourse.slug}`)"
        class="hover:text-brand-600"
      >
        {{ tContent(currentCourse.title, locale) }}
      </NuxtLink>
    </nav>

    <div class="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <div class="min-w-0">
        <h1 class="text-2xl font-black tracking-tight text-ink-900 sm:text-3xl dark:text-white">
          {{ tContent(currentExercise.title, locale) }}
        </h1>
        <p v-if="currentExercise.summary" class="mt-2 muted-text">
          {{ tContent(currentExercise.summary, locale) }}
        </p>

        <div class="mt-6">
          <ClientOnly>
            <VideoPlayer
              v-if="currentExercise.video"
              ref="player"
              :key="currentExercise.id"
              :video="currentExercise.video"
              :chapters="currentExercise.chapters"
              :exercise-slug="currentExercise.slug"
            />
            <template #fallback>
              <div class="aspect-video w-full animate-pulse rounded-2xl bg-ink-200 dark:bg-ink-800" />
            </template>
          </ClientOnly>
          <p v-if="!currentExercise.video" class="muted-text">{{ t('exercise.noVideo') }}</p>
        </div>

        <div class="mt-6">
          <ExerciseActions :exercise="currentExercise" />
        </div>

        <section v-if="notes.length" class="mt-8">
          <h2 class="mb-3 text-lg font-bold text-ink-900 dark:text-white">{{ t('exercise.tips') }}</h2>
          <ul class="flex list-disc flex-col gap-2 pl-5 text-sm text-ink-700 dark:text-ink-200">
            <li v-for="(note, index) in notes" :key="index">{{ note }}</li>
          </ul>
        </section>

        <ExerciseNavigation
          :previous="previous"
          :next="next"
          :course-slug="currentCourse.slug"
        />
      </div>

      <aside class="flex flex-col gap-4">
        <VideoChapters
          v-if="currentExercise.chapters?.length"
          :chapters="currentExercise.chapters"
          :exercise-slug="currentExercise.slug"
          @seek="onSeek"
        />
        <DownloadList
          v-if="currentExercise.resources?.length"
          :resources="currentExercise.resources"
          :exercise-slug="currentExercise.slug"
        />
        <ClientOnly>
          <Model3DViewer
            v-if="currentExercise.model3d?.enabled"
            :model="currentExercise.model3d"
            :exercise-slug="currentExercise.slug"
          />
        </ClientOnly>
        <NuxtLink
          :to="localePath(`/courses/${currentCourse.slug}`)"
          class="surface-card px-4 py-3 text-center text-sm font-semibold text-brand-600 hover:bg-ink-50 dark:hover:bg-ink-800/60"
        >
          {{ t('exercise.backToCourse') }}
        </NuxtLink>
      </aside>
    </div>
  </div>
</template>
