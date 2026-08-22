<script setup lang="ts">
import type { Exercise } from '~/types/content'

defineProps<{ previous?: Exercise; next?: Exercise; courseSlug: string }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const navigationTitle = (exercise: Exercise) => tContent(exercise.shortTitle ?? exercise.title, locale.value)
const navigationLabel = (direction: 'previous' | 'next', exercise: Exercise) =>
  `${t(`exercise.${direction}`)}: ${navigationTitle(exercise)}`
</script>

<template>
  <nav class="mt-10 grid gap-3 sm:grid-cols-2" :aria-label="t('course.exercisesTitle')">
    <NuxtLink
      v-if="previous"
      :to="localePath(`/courses/${courseSlug}/${previous.slug}`)"
      class="course-border surface-card flex flex-col gap-1 p-4 transition-colors"
      rel="prev"
      :aria-label="navigationLabel('previous', previous)"
    >
      <span class="text-xs font-semibold uppercase tracking-wide muted-text">&larr; {{ t('exercise.previous') }}</span>
      <span class="font-semibold text-ink-900 dark:text-white">{{ navigationTitle(previous) }}</span>
    </NuxtLink>
    <span v-else class="hidden sm:block" />

    <NuxtLink
      v-if="next"
      :to="localePath(`/courses/${courseSlug}/${next.slug}`)"
      class="course-border surface-card flex flex-col gap-1 p-4 text-right transition-colors sm:col-start-2"
      rel="next"
      :aria-label="navigationLabel('next', next)"
    >
      <span class="text-xs font-semibold uppercase tracking-wide muted-text">{{ t('exercise.next') }} &rarr;</span>
      <span class="font-semibold text-ink-900 dark:text-white">{{ navigationTitle(next) }}</span>
    </NuxtLink>
  </nav>
</template>
