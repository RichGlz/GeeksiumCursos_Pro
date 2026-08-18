<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const courses = useCourses()

useSeoMeta({
  title: () => t('courses.title'),
  description: () => t('courses.subtitle'),
  ogTitle: () => `${t('courses.title')} | ${t('site.name')}`,
  ogDescription: () => t('courses.subtitle'),
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

</script>

<template>
  <div class="mx-auto max-w-6xl px-4 py-12">
    <h1 class="text-3xl font-black tracking-tight text-ink-900 dark:text-white">
      {{ t('courses.title') }}
    </h1>
    <p class="mt-2 muted-text">{{ t('courses.subtitle') }}</p>

    <div v-if="courses.length" class="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <CourseCard v-for="course in courses" :key="course.id" :course="course" />
    </div>
    <p v-else class="mt-8 muted-text">{{ t('courses.empty') }}</p>
  </div>
</template>
