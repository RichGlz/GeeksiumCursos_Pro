<script setup lang="ts">
import type { DownloadResource } from '~/types/content'

defineProps<{ resources: DownloadResource[]; courseId: string; exerciseId: string }>()

const { t, locale } = useI18n()
const analytics = useAnalytics()

const colors: Record<string, string> = {
  pdf: '#dc2626', zip: '#7c3aed', stl: '#2563eb', glb: '#2563eb', gltf: '#2563eb',
  step: '#0891b2', f3d: '#0891b2', xlsx: '#15803d', image: '#db2777', png: '#db2777',
  jpg: '#db2777', jpeg: '#db2777', webp: '#db2777', link: '#4f46e5', file: '#475569',
}
const accent = (resource: DownloadResource) =>
  /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(resource.color || '')
    ? resource.color!
    : (colors[resource.type] || colors.file)
const isExternal = (url: string) => /^https?:\/\//i.test(url)
const resourceHost = (url: string) => {
  try { return new URL(url, window.location.origin).hostname || undefined } catch { return undefined }
}
const onDownload = (resource: DownloadResource, courseId: string, exerciseId: string) => {
  analytics.trackDownload(courseId, exerciseId, resource.id, resource.type, resourceHost(resource.url))
}
</script>

<template>
  <section v-if="resources.length" class="download-list surface-card min-w-0 p-4">
    <h2 class="mb-3 text-sm font-bold uppercase tracking-wide muted-text">
      {{ t('exercise.downloads') }}
    </h2>
    <ul class="download-grid min-w-0">
      <li v-for="resource in resources" :key="resource.id" class="min-w-0">
        <a
          :href="resource.url"
          :download="resource.download ? '' : undefined"
          :target="isExternal(resource.url) ? '_blank' : undefined"
          :rel="isExternal(resource.url) ? 'noopener noreferrer' : undefined"
          class="resource-card flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden rounded-xl border border-ink-200 bg-white text-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-ink-800 dark:bg-ink-950"
          :style="{ '--resource-accent': accent(resource) }"
          @click="onDownload(resource, courseId, exerciseId)"
        >
          <span class="flex min-w-0 items-start gap-2 p-3">
            <span class="resource-badge shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
              {{ resourceExtension(resource.type) }}
            </span>
            <span class="min-w-0 line-clamp-2 font-semibold text-ink-800 dark:text-ink-100" :title="tContent(resource.title, locale)">
              {{ tContent(resource.title, locale) }}
            </span>
          </span>
          <span class="mt-auto border-t border-ink-200 px-3 py-2 text-center text-xs font-bold dark:border-ink-800" :style="{ color: accent(resource) }">
            {{ t('exercise.download') }}
          </span>
        </a>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.download-list {
  container-name: download-list;
  container-type: inline-size;
}

.download-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 0.75rem;
}

@media (min-width: 40rem) {
  @container download-list (min-width: 18rem) {
    .download-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
}

.resource-card { border-top: 3px solid var(--resource-accent); }
.resource-badge {
  border: 1px solid color-mix(in srgb, var(--resource-accent) 55%, transparent);
  background: color-mix(in srgb, var(--resource-accent) 12%, transparent);
  color: var(--resource-accent);
}
</style>
