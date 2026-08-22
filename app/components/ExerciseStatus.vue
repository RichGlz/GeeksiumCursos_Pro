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
    <p v-if="exercise.difficulty" class="course-level-badge mt-2 inline-flex rounded-full px-2.5 py-1 text-sm font-semibold">
      {{ t(`difficulty.${exercise.difficulty}`) }}
    </p>
    <p v-if="exercise.level" class="course-level-badge ml-1 mt-2 inline-flex rounded-full px-2.5 py-1 text-sm font-semibold">{{ t(`levels.${exercise.level}`) }}</p>
    <p v-if="exercise.type === 'challenge'" class="mt-2 text-sm font-semibold course-link">{{ t('exercise.challenge') }}</p>
    <p class="mt-4 text-sm font-semibold" :class="completed ? 'course-link' : 'muted-text'">
      {{ completed ? t('exercise.completed') : t('exercise.pending') }}
    </p>
    <button
      type="button"
      class="course-button mt-3 w-full rounded-lg px-3 py-2 text-sm font-semibold text-white"
      :aria-pressed="completed"
      @click="toggle"
    >
      {{ completed ? t('exercise.markIncomplete') : t('exercise.markComplete') }}
    </button>
  </section>
</template>
