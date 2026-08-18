<script setup lang="ts">
import type { Exercise } from '~/types/content'

const props = defineProps<{ exercise: Exercise }>()
const { t } = useI18n()
const { isCompleted, toggleCompleted } = useExerciseProgress()
const analytics = useAnalytics()
const mounted = useMounted()
const completed = computed(() => mounted.value && isCompleted(props.exercise.id))

const toggle = () => {
  const next = toggleCompleted(props.exercise.id)
  if (next) analytics.trackExerciseComplete(props.exercise.courseSlug, props.exercise.slug)
  else analytics.trackExerciseUncomplete(props.exercise.courseSlug, props.exercise.slug)
}
</script>

<template>
  <section class="surface-card p-4">
    <p class="text-xs font-bold uppercase tracking-wide muted-text">{{ t('exercise.difficulty') }}</p>
    <p v-if="exercise.difficulty" class="mt-1 font-semibold text-ink-900 dark:text-white">
      {{ t(`difficulty.${exercise.difficulty}`) }}
    </p>
    <p class="mt-4 text-sm font-semibold" :class="completed ? 'text-brand-600' : 'muted-text'">
      {{ completed ? t('exercise.completed') : t('exercise.pending') }}
    </p>
    <button
      type="button"
      class="mt-3 w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700"
      :aria-pressed="completed"
      @click="toggle"
    >
      {{ completed ? t('exercise.markIncomplete') : t('exercise.markComplete') }}
    </button>
  </section>
</template>
