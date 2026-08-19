<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faCube, faFile, faFileImage, faFilePdf, faFileZipper, faLink, faTable } from '@fortawesome/free-solid-svg-icons'
import type { DownloadResource } from '~/types/content'

defineProps<{ resources: DownloadResource[]; courseId: string; exerciseId: string }>()

const { t, locale } = useI18n()
const analytics = useAnalytics()

const colors: Record<string, string> = {
  pdf: '#dc2626', zip: '#7c3aed', stl: '#2563eb', glb: '#2563eb', gltf: '#2563eb',
  step: '#0891b2', f3d: '#0891b2', xlsx: '#15803d', image: '#db2777', png: '#db2777',
  jpg: '#db2777', jpeg: '#db2777', webp: '#db2777', link: '#4f46e5', file: '#475569',
}
const icons: Record<string, typeof faFile> = {
  pdf: faFilePdf, zip: faFileZipper, stl: faCube, glb: faCube, gltf: faCube, step: faCube,
  f3d: faCube, xlsx: faTable, image: faFileImage, png: faFileImage, jpg: faFileImage,
  jpeg: faFileImage, webp: faFileImage, link: faLink,
}
const accent = (resource: DownloadResource) =>
  /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(resource.color || '')
    ? resource.color!
    : (colors[resource.type] || colors.file)
const icon = (resource: DownloadResource) => icons[resource.type] || faFile
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
          :target="resource.type === 'link' ? '_blank' : undefined"
          :rel="resource.type === 'link' ? 'noopener noreferrer' : undefined"
          class="flex aspect-square min-h-0 w-full max-w-full flex-col overflow-hidden rounded-xl border border-ink-200 bg-white text-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-ink-800 dark:bg-ink-950"
          :style="{ '--resource-accent': accent(resource) }"
          @click="onDownload(resource, courseId, exerciseId)"
        >
          <NuxtImg v-if="resource.previewImage" :src="resource.previewImage" :alt="tContent(resource.title, locale)" width="320" height="180" class="aspect-video w-full object-cover" loading="lazy" />
          <span v-else class="grid flex-1 place-items-center bg-ink-50 text-4xl dark:bg-ink-900" :style="{ color: accent(resource) }" aria-hidden="true">
            <FontAwesomeIcon :icon="icon(resource)" />
          </span>
          <span class="border-t-4 p-3" :style="{ borderColor: accent(resource) }">
            <span class="block font-mono text-[10px] font-bold uppercase" :style="{ color: accent(resource) }">{{ resourceExtension(resource.type) }}</span>
            <span class="mt-1 line-clamp-2 block font-semibold text-ink-800 dark:text-ink-100">{{ tContent(resource.title, locale) }}</span>
            <span class="mt-2 block text-xs font-semibold text-brand-600">{{ t('exercise.download') }}</span>
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
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

@container download-list (max-width: 18rem) {
  .download-grid { grid-template-columns: minmax(0, 1fr); }
}
</style>
