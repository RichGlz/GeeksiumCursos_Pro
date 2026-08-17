<script setup lang="ts">
import type { VideoChapter } from '~/types/content'

const props = defineProps<{ chapters: VideoChapter[]; exerciseSlug: string; activeTime?: number }>()
const emit = defineEmits<{ (event: 'seek', seconds: number): void }>()

const { t, locale } = useI18n()
const analytics = useAnalytics()

const onSelect = (chapter: VideoChapter) => {
  emit('seek', chapter.timeSeconds)
  analytics.trackVideoChapterClick(
    props.exerciseSlug,
    tContent(chapter.label, locale.value),
    chapter.timeSeconds,
  )
}
</script>

<template>
  <section v-if="chapters.length" class="surface-card p-4">
    <h2 class="mb-3 text-sm font-bold uppercase tracking-wide muted-text">
      {{ t('exercise.chapters') }}
    </h2>
    <ol class="flex flex-col gap-1">
      <li v-for="chapter in chapters" :key="chapter.id">
        <button
          type="button"
          class="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-ink-100 dark:hover:bg-ink-800"
          @click="onSelect(chapter)"
        >
          <span class="font-mono text-xs font-semibold text-brand-600">
            {{ formatTimestamp(chapter.timeSeconds) }}
          </span>
          <span class="text-ink-700 dark:text-ink-200">{{ tContent(chapter.label, locale) }}</span>
        </button>
      </li>
    </ol>
  </section>
</template>
