<script setup lang="ts">
const props = defineProps<{ poster?: string }>()
const failed = ref(false)
const source = computed(() => props.poster || '/images/video-coming-soon.webp')
</script>

<template>
  <div class="relative grid aspect-video w-full place-items-center overflow-hidden rounded-2xl bg-linear-to-br from-ink-800 to-ink-950 text-white">
    <img v-if="!failed" :src="source" alt="" class="absolute inset-0 size-full object-cover opacity-60" @error="failed = true">
    <p class="relative z-10 rounded-lg bg-ink-950/70 px-4 py-2 text-sm font-semibold">{{ $t('exercise.videoComingSoon') }}</p>
  </div>
</template>
