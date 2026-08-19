<script setup lang="ts">
const route = useRoute()
const { t, locale } = useI18n()
const localePath = useLocalePath()
const config = useRuntimeConfig()
const courseSlug = computed(() => String(route.params.course))
const exerciseSlug = computed(() => String(route.params.exercise))
const { course } = useCourse(courseSlug)
const { exercise } = useExercise(courseSlug, exerciseSlug)
if (!course.value || !exercise.value) throw createError({ status: 404, statusText: 'Not Found' })

const currentCourse = computed(() => course.value!)
const currentExercise = computed(() => exercise.value!)
const { previous, next } = useExerciseNavigation(courseSlug, exerciseSlug)
const { setLastVisited } = useExerciseProgress()
const analytics = useAnalytics()
const title = computed(() => tContent(currentExercise.value.seo?.title ?? currentExercise.value.title, locale.value))
const description = computed(() => tContent(currentExercise.value.seo?.description ?? currentExercise.value.summary ?? currentCourse.value.description, locale.value))
const absoluteUrl = computed(() => `${config.public.siteUrl}${localePath(`/courses/${currentCourse.value.slug}/${currentExercise.value.slug}`)}`)
const videoEnabled = computed(() => Boolean(currentExercise.value.video) && currentExercise.value.video?.enabled !== false)
const youtubeUrl = computed(() => videoEnabled.value ? youtubeWatchUrl(currentExercise.value.video) : undefined)
const notesMarkdown = computed(() => getAuthorNotesMarkdown(currentExercise.value, locale.value))
const fallbackNotes = computed(() => tListContent(currentExercise.value.authorNotes, locale.value))

useSeoMeta({ title: () => title.value, description: () => description.value, ogTitle: () => title.value, ogDescription: () => description.value, ogType: 'article', twitterCard: 'summary_large_image' })
useSchemaOrgExercise(currentExercise.value, title.value, description.value, absoluteUrl.value)
useSchemaOrgBreadcrumb([
  { name: t('nav.home'), url: `${config.public.siteUrl}${localePath('/')}` },
  { name: t('courses.title'), url: `${config.public.siteUrl}${localePath('/courses')}` },
  { name: tContent(currentCourse.value.title, locale.value), url: `${config.public.siteUrl}${localePath(`/courses/${currentCourse.value.slug}`)}` },
  { name: title.value, url: absoluteUrl.value },
])

const player = ref<{ seekTo: (seconds: number) => void } | null>(null)
const onSeek = (seconds: number) => player.value?.seekTo(seconds)
const onYoutube = () => analytics.trackYoutubeOpen(currentExercise.value.slug)

onMounted(() => {
  setLastVisited(currentCourse.value.slug, currentExercise.value.slug)
  analytics.trackExerciseView(currentCourse.value.slug, currentExercise.value.slug, title.value)
})
</script>

<template>
  <div class="course-theme mx-auto max-w-6xl px-4 py-10" :style="courseThemeStyle(currentCourse)">
    <div class="grid gap-8 lg:grid-cols-[1fr_20rem]">
      <main class="min-w-0">
        <h1 class="text-2xl font-black tracking-tight text-ink-900 sm:text-3xl dark:text-white">{{ tContent(currentExercise.title, locale) }}</h1>

        <nav class="mt-4 text-sm muted-text" aria-label="breadcrumb">
          <NuxtLink :to="localePath('/')" class="course-link">{{ t('nav.home') }}</NuxtLink><span aria-hidden="true"> / </span>
          <NuxtLink :to="localePath('/courses')" class="course-link">{{ t('courses.title') }}</NuxtLink><span aria-hidden="true"> / </span>
          <NuxtLink :to="localePath(`/courses/${currentCourse.slug}`)" class="course-link">{{ tContent(currentCourse.title, locale) }}</NuxtLink>
        </nav>

        <ul v-if="currentExercise.tags?.length" class="mt-4 flex flex-wrap gap-2" :aria-label="t('exercise.tags')">
          <li v-for="tag in currentExercise.tags" :key="tag" class="course-badge rounded-full border px-2.5 py-1 text-xs font-medium">{{ tag }}</li>
        </ul>

        <section v-if="currentExercise.tools?.length" class="mt-3" :aria-label="t('exercise.toolsUsed')">
          <h2 class="text-xs font-semibold uppercase tracking-wide muted-text">{{ t('exercise.toolsUsed') }}</h2>
          <ul class="mt-2 flex flex-wrap gap-1.5">
            <li v-for="tool in currentExercise.tools" :key="tool.id" class="rounded-full border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] text-ink-500 dark:border-ink-700 dark:bg-ink-900 dark:text-ink-400">
              {{ tContent(tool.name, locale) }}
            </li>
          </ul>
        </section>

        <div class="mt-6">
          <ClientOnly v-if="videoEnabled">
            <LazyVideoPlayer ref="player" :key="currentExercise.id" :video="currentExercise.video!" :chapters="currentExercise.chapters" :exercise-slug="currentExercise.slug" />
            <template #fallback><div class="aspect-video w-full animate-pulse rounded-2xl bg-ink-200 dark:bg-ink-800" /></template>
          </ClientOnly>
          <VideoUnavailable v-else-if="currentExercise.video" :poster="currentExercise.video.poster" />
          <p v-else class="rounded-2xl bg-ink-50 p-6 muted-text dark:bg-ink-900">{{ t('exercise.noVideo') }}</p>
        </div>

        <div class="mt-6"><ExerciseActions :exercise="currentExercise" /></div>
        <ExerciseNavigation :previous="previous" :next="next" :course-slug="currentCourse.slug" />
        <AuthorNotesMarkdown :markdown="notesMarkdown" :fallback="fallbackNotes" />
      </main>

      <aside class="flex flex-col gap-4">
        <ExerciseStatus :exercise="currentExercise" />
        <SupportInfo />
        <ChocolateDonation />
        <AdSlot />
        <VideoChapters v-if="videoEnabled && currentExercise.chapters?.length" :chapters="currentExercise.chapters" :exercise-slug="currentExercise.slug" @seek="onSeek" />
        <a v-if="youtubeUrl" :href="youtubeUrl" target="_blank" rel="noopener noreferrer" class="course-link surface-card px-4 py-3 text-center text-sm font-semibold hover:bg-ink-50 dark:hover:bg-ink-800/60" @click="onYoutube">{{ t('exercise.watchOnYoutube') }}</a>
        <ClientOnly><Model3DViewer v-if="currentExercise.model3d?.enabled" :model="currentExercise.model3d" :exercise-slug="currentExercise.slug" /></ClientOnly>
        <AdSlot />
        <DownloadList v-if="currentExercise.resources?.length" :resources="currentExercise.resources" :course-id="currentCourse.id" :exercise-id="currentExercise.id" />
        <NuxtLink :to="localePath(`/courses/${currentCourse.slug}`)" class="course-link surface-card px-4 py-3 text-center text-sm font-semibold hover:bg-ink-50 dark:hover:bg-ink-800/60">{{ t('exercise.backToCourse') }}</NuxtLink>
      </aside>
    </div>
  </div>
</template>
