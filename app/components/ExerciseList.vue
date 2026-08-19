<script setup lang="ts">
import type { Exercise } from '~/types/content'

defineProps<{ exercises: Exercise[] }>()
const { t } = useI18n()
</script>

<template>
  <div>
    <ul v-if="exercises.length" class="flex flex-col gap-3">
      <ExerciseCard
        v-for="exercise in exercises"
        :key="exercise.id"
        :exercise="exercise"
      />
    </ul>
    <p v-else class="muted-text">{{ t('course.empty') }}</p>
  </div>
</template>
