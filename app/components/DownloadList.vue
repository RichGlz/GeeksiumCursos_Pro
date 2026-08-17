<script setup lang="ts">
import type { DownloadResource } from '~/types/content'

defineProps<{ resources: DownloadResource[]; exerciseSlug: string }>()

const { t, locale } = useI18n()
const analytics = useAnalytics()

const onDownload = (resource: DownloadResource, exerciseSlug: string) => {
  analytics.trackDownload(exerciseSlug, tContent(resource.title, locale.value), resource.type)
}
</script>

<template>
  <section v-if="resources.length" class="surface-card p-4">
    <h2 class="mb-3 text-sm font-bold uppercase tracking-wide muted-text">
      {{ t('exercise.downloads') }}
    </h2>
    <ul class="flex flex-col gap-2">
      <li v-for="resource in resources" :key="resource.id">
        <a
          :href="resource.url"
          :download="resource.download ? '' : undefined"
          :target="resource.type === 'link' ? '_blank' : undefined"
          :rel="resource.type === 'link' ? 'noopener noreferrer' : undefined"
          class="flex items-center gap-3 rounded-lg border border-ink-200 px-3 py-2 text-sm transition-colors hover:border-brand-400 hover:bg-ink-50 dark:border-ink-800 dark:hover:bg-ink-800/60"
          @click="onDownload(resource, exerciseSlug)"
        >
          <span
            class="rounded-md bg-ink-100 px-2 py-1 font-mono text-[10px] font-bold uppercase text-ink-600 dark:bg-ink-800 dark:text-ink-300"
            aria-hidden="true"
          >
            {{ resourceExtension(resource.type) }}
          </span>
          <span class="flex-1 text-ink-700 dark:text-ink-200">{{ tContent(resource.title, locale) }}</span>
          <span class="text-xs font-semibold text-brand-600">{{ t('exercise.download') }}</span>
        </a>
      </li>
    </ul>
  </section>
</template>
