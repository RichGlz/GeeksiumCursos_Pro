<script setup lang="ts">
import videojs from 'video.js'
import 'videojs-youtube'
import 'video.js/dist/video-js.css'
import type Player from 'video.js/dist/types/player'
import type { ExerciseVideo, VideoChapter } from '~/types/content'

const props = defineProps<{
  video: ExerciseVideo
  chapters?: VideoChapter[]
  exerciseSlug: string
  poster?: string
}>()

const emit = defineEmits<{ (event: 'ready', player: Player): void }>()

const videoEl = ref<HTMLVideoElement | null>(null)
let player: Player | null = null

const analytics = useAnalytics()
const milestones = [25, 50, 75]
const reported = new Set<number>()
let started = false
let completed = false

/** Permite a los capítulos saltar dentro del vídeo. */
const seekTo = (seconds: number) => {
  player?.currentTime(seconds)
  player?.play()?.catch(() => {})
}

defineExpose({ seekTo })

onMounted(() => {
  if (!videoEl.value) return
  const source = videoJsSource(props.video)
  if (!source) return

  player = videojs(videoEl.value, {
    controls: true,
    fluid: true,
    responsive: true,
    preload: 'metadata',
    playbackRates: [0.75, 1, 1.25, 1.5, 2],
    poster: props.poster ?? props.video.poster,
    techOrder: props.video.provider === 'youtube' ? ['youtube', 'html5'] : ['html5'],
    sources: [source],
    youtube: { rel: 0, modestbranding: 1, playsinline: 1 },
  })

  player.on('play', () => {
    if (started) return
    started = true
    analytics.trackVideoStart(props.exerciseSlug)
  })

  player.on('timeupdate', () => {
    const duration = player?.duration() ?? 0
    const current = player?.currentTime() ?? 0
    if (!duration) return
    const percent = (current / duration) * 100
    for (const milestone of milestones) {
      if (percent >= milestone && !reported.has(milestone)) {
        reported.add(milestone)
        analytics.trackVideoProgress(props.exerciseSlug, milestone)
      }
    }
  })

  player.on('ended', () => {
    if (completed) return
    completed = true
    analytics.trackVideoComplete(props.exerciseSlug)
  })

  emit('ready', player)
})

onBeforeUnmount(() => {
  player?.dispose()
  player = null
})
</script>

<template>
  <div class="aspect-video overflow-hidden rounded-2xl bg-black">
    <video
      ref="videoEl"
      class="video-js vjs-big-play-centered vjs-geeksium"
      playsinline
      :aria-label="`Video: ${exerciseSlug}`"
    />
  </div>
</template>
