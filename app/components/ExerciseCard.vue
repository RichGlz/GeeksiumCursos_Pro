<script setup lang="ts">
import type { Exercise } from '~/types/content'

const props = defineProps<{ exercise: Exercise; index: number }>()

const { t, locale } = useI18n()
const localePath = useLocalePath()
const { isCompleted } = useExerciseProgress()
const mounted = useMounted()

const title = computed(() => tContent(props.exercise.title, locale.value))
const summary = computed(() => tContent(props.exercise.summary, locale.value))
const completed = computed(() => mounted.value && isCompleted(props.exercise.id))
const duration = computed(() =>
  props.exercise.video?.durationSeconds
    ? formatTimestamp(props.exercise.video.durationSeconds)
    : '',
)
</script>

<template>
  <li class="surface-card">
    <NuxtLink
      :to="localePath(`/courses/${exercise.courseSlug}/${exercise.slug}`)"
      class="flex items-start gap-4 p-4 transition-colors hover:bg-ink-50 dark:hover:bg-ink-800/60"
    >
      <span
        class="grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold"
        :class="
          completed
            ? 'course-selected'
            : 'bg-ink-100 text-ink-600 dark:bg-ink-800 dark:text-ink-300'
        "
        aria-hidden="true"
      >
        <svg v-if="completed" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <template v-else>{{ index + 1 }}</template>
      </span>

      <span class="min-w-0 flex-1">
        <span class="block font-semibold text-ink-900 dark:text-white">{{ title }}</span>
        <span v-if="summary" class="mt-1 line-clamp-2 block text-sm muted-text">{{ summary }}</span>
        <span class="mt-2 flex flex-wrap items-center gap-3 text-xs muted-text">
          <span v-if="exercise.difficulty">{{ t(`difficulty.${exercise.difficulty}`) }}</span>
          <span v-if="duration">{{ duration }}</span>
          <span v-if="completed" class="course-link font-semibold">{{ t('exercise.completed') }}</span>
        </span>
      </span>
    </NuxtLink>
  </li>
</template>
