<script setup lang="ts">
import type { Exercise } from '~/types/content'

const props = defineProps<{ exercise: Exercise }>()

const { t } = useI18n()
const { isCompleted, isFavorite, toggleCompleted, toggleFavorite } = useExerciseProgress()
const analytics = useAnalytics()
const mounted = useMounted()

const completed = computed(() => mounted.value && isCompleted(props.exercise.id))
const favorite = computed(() => mounted.value && isFavorite(props.exercise.id))
const youtubeUrl = computed(
  () => props.exercise.actions?.youtubeUrl ?? youtubeWatchUrl(props.exercise.video),
)

const onToggleComplete = () => {
  const next = toggleCompleted(props.exercise.id)
  if (next) analytics.trackExerciseComplete(props.exercise.courseSlug, props.exercise.slug)
  else analytics.trackExerciseUncomplete(props.exercise.courseSlug, props.exercise.slug)
}

const onToggleFavorite = () => {
  const next = toggleFavorite(props.exercise.id)
  analytics.trackFavoriteToggle(props.exercise.slug, next)
}

const shareFeedback = ref('')

const onShare = async () => {
  const url = window.location.href
  const title = props.exercise.title.es
  try {
    if (navigator.share) {
      await navigator.share({ title, url })
      analytics.trackShare('exercise', props.exercise.slug, 'web_share')
      return
    }
    await navigator.clipboard.writeText(url)
    shareFeedback.value = t('exercise.shareCopied')
    analytics.trackShare('exercise', props.exercise.slug, 'clipboard')
    setTimeout(() => (shareFeedback.value = ''), 2500)
  } catch {
    // El usuario canceló el diálogo de compartir: no es un error.
  }
}

const onYoutube = () => {
  if (youtubeUrl.value) analytics.trackYoutubeOpen(props.exercise.slug, youtubeUrl.value)
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2">
    <button
      type="button"
      class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors"
      :class="
        completed
          ? 'bg-brand-600 text-white hover:bg-brand-700'
          : 'border border-ink-300 text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800'
      "
      :aria-pressed="completed"
      @click="onToggleComplete"
    >
      <svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
        <path d="m5 13 4 4L19 7" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
      {{ completed ? t('exercise.markIncomplete') : t('exercise.markComplete') }}
    </button>

    <button
      v-if="exercise.actions?.favoriteEnabled !== false"
      type="button"
      class="inline-flex items-center gap-2 rounded-lg border border-ink-300 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
      :aria-pressed="favorite"
      :aria-label="favorite ? t('exercise.removeFavorite') : t('exercise.addFavorite')"
      @click="onToggleFavorite"
    >
      <svg
        class="size-4"
        viewBox="0 0 24 24"
        :fill="favorite ? 'currentColor' : 'none'"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="m12 17.3-6.2 3.6 1.6-7L2 9.2l7.1-.6L12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7z" stroke-linejoin="round" />
      </svg>
      <span class="hidden sm:inline">{{ favorite ? t('exercise.removeFavorite') : t('exercise.addFavorite') }}</span>
    </button>

    <button
      v-if="exercise.actions?.shareEnabled !== false"
      type="button"
      class="inline-flex items-center gap-2 rounded-lg border border-ink-300 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
      @click="onShare"
    >
      {{ t('exercise.share') }}
    </button>

    <a
      v-if="youtubeUrl"
      :href="youtubeUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex items-center gap-2 rounded-lg border border-ink-300 px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800"
      @click="onYoutube"
    >
      {{ t('exercise.watchOnYoutube') }}
    </a>

    <p v-if="shareFeedback" class="text-sm text-brand-600" role="status">{{ shareFeedback }}</p>
  </div>
</template>
