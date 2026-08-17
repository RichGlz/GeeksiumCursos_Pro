<script setup lang="ts">
import type { CourseWithExercises } from '~/types/content'

const props = defineProps<{ course: CourseWithExercises }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { courseProgress, courseCompletedCount } = useExerciseProgress()
const mounted = useMounted()

const title = computed(() => tContent(props.course.title, locale.value))
const description = computed(() => tContent(props.course.description, locale.value))
const percent = computed(() => (mounted.value ? courseProgress(props.course) : 0))
const done = computed(() => (mounted.value ? courseCompletedCount(props.course) : 0))
</script>

<template>
  <article class="surface-card group flex h-full flex-col overflow-hidden">
    <NuxtLink :to="localePath(`/courses/${course.slug}`)" class="block">
      <div class="aspect-video w-full overflow-hidden bg-ink-100 dark:bg-ink-800">
        <NuxtImg
          v-if="course.cover"
          :src="course.cover"
          :alt="title"
          width="640"
          height="360"
          loading="lazy"
          class="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>
    </NuxtLink>

    <div class="flex flex-1 flex-col gap-3 p-5">
      <div class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide">
        <span v-if="course.difficulty" class="rounded-full bg-brand-50 px-2 py-1 text-brand-700 dark:bg-brand-900/40 dark:text-brand-200">
          {{ t(`difficulty.${course.difficulty}`) }}
        </span>
        <span class="muted-text">{{ course.exercises.length }} {{ t('courses.exercises') }}</span>
      </div>

      <h3 class="text-lg font-bold text-ink-900 dark:text-white">
        <NuxtLink :to="localePath(`/courses/${course.slug}`)" class="hover:text-brand-600">
          {{ title }}
        </NuxtLink>
      </h3>
      <p class="line-clamp-3 text-sm muted-text">{{ description }}</p>

      <CourseProgressBar
        class="mt-auto"
        :percent="percent"
        :done="done"
        :total="course.exercises.length"
      />
    </div>
  </article>
</template>
