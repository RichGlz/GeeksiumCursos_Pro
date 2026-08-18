<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const courses = useCourses()

useSeoMeta({
  title: () => `${t('site.name')} — ${t('site.tagline')}`,
  description: () => t('site.description'),
  ogTitle: () => `${t('site.name')} — ${t('site.tagline')}`,
  ogDescription: () => t('site.description'),
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

const features = computed(() => [
  { title: t('home.features.videoTitle'), text: t('home.features.videoText') },
  { title: t('home.features.filesTitle'), text: t('home.features.filesText') },
  { title: t('home.features.progressTitle'), text: t('home.features.progressText') },
])
</script>

<template>
  <div>
    <section class="border-b border-ink-200 bg-linear-to-b from-brand-50 to-transparent dark:border-ink-800 dark:from-ink-900">
      <div class="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <p class="mb-3 text-sm font-semibold uppercase tracking-widest text-brand-600">
          {{ t('site.name') }}
        </p>
        <h1 class="max-w-3xl text-4xl font-black tracking-tight text-ink-900 sm:text-5xl dark:text-white">
          {{ t('home.heroTitle') }}
        </h1>
        <p class="mt-4 max-w-2xl text-lg muted-text">{{ t('home.heroSubtitle') }}</p>
        <NuxtLink
          :to="localePath('/courses')"
          class="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {{ t('home.cta') }}
        </NuxtLink>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 py-12">
      <h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-white">{{ t('home.featuresTitle') }}</h2>
      <div class="grid gap-4 sm:grid-cols-3">
        <div v-for="feature in features" :key="feature.title" class="surface-card p-5">
          <h3 class="font-bold text-ink-900 dark:text-white">{{ feature.title }}</h3>
          <p class="mt-2 text-sm muted-text">{{ feature.text }}</p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-4 pb-16">
      <h2 class="mb-6 text-2xl font-bold text-ink-900 dark:text-white">{{ t('home.featuredCourses') }}</h2>
      <div v-if="courses.length" class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CourseCard v-for="course in courses" :key="course.id" :course="course" />
      </div>
      <p v-else class="muted-text">{{ t('courses.empty') }}</p>
      <span class="sr-only">{{ locale }}</span>
    </section>
  </div>
</template>
