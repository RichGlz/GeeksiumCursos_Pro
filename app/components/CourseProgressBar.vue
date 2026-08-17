<script setup lang="ts">
const props = withDefaults(
  defineProps<{ percent: number; done?: number; total?: number; showLabel?: boolean }>(),
  { done: 0, total: 0, showLabel: true },
)

const { t } = useI18n()
const value = computed(() => Math.min(100, Math.max(0, props.percent)))
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div
      class="h-2 w-full overflow-hidden rounded-full bg-ink-200 dark:bg-ink-800"
      role="progressbar"
      :aria-valuenow="Math.round(value)"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-label="t('course.progress')"
    >
      <div
        class="h-full rounded-full bg-brand-600 transition-[width] duration-500"
        :style="{ width: `${value}%` }"
      />
    </div>
    <p v-if="showLabel && total > 0" class="text-xs muted-text">
      {{ t('course.completedOf', { done, total }) }} · {{ formatPercent(value) }}
    </p>
  </div>
</template>
