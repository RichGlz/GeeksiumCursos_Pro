<script setup lang="ts">
import Plyr from 'plyr'
import 'plyr/dist/plyr.css'
import type { ExerciseVideo, VideoChapter } from '~/types/content'

const props = defineProps<{
  video: ExerciseVideo
  chapters?: VideoChapter[]
  exerciseSlug: string
  poster?: string
}>()

const playerEl = ref<HTMLVideoElement | null>(null)
let player: Plyr | null = null

const analytics = useAnalytics()
const milestones = [25, 50, 75]
const reported = new Set<number>()
let started = false
let completed = false

/** Permite a los capítulos saltar dentro del vídeo sin exponer Plyr a la página. */
const seekTo = (seconds: number) => {
  if (!player) return
  player.currentTime = seconds
  const result = player.play()
  if (result instanceof Promise) void result.catch(() => {})
}

defineExpose({ seekTo })

onMounted(() => {
  if (!playerEl.value || props.video.enabled === false) return
  const source = plyrVideoSource(props.video)
  if (!source) return

  const supportsPlyrCaptions = props.video.provider === 'file'

  player = new Plyr(playerEl.value, {
    controls: [
      'play-large',
      'play',
      'progress',
      'current-time',
      'duration',
      'mute',
      'volume',
      ...(supportsPlyrCaptions ? ['captions'] : []),
      'settings',
      'fullscreen',
    ],
    settings: supportsPlyrCaptions ? ['captions', 'speed'] : ['speed'],
    captions: { active: false, language: 'auto', update: true },
    invertTime: false,
    toggleInvert: false,
    keyboard: { focused: true, global: false },
    tooltips: { controls: true, seek: true },
    ratio: '16:9',
    speed: { selected: 1, options: [0.75, 1, 1.25, 1.5, 2] },
    youtube: {
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      cc_load_policy: 0,
    },
  })
  player.source = { ...source, poster: props.poster ?? source.poster }
  const poster = props.poster ?? source.poster
  if (poster) player.poster = poster

  player.on('playing', () => {
    if (started) return
    started = true
    analytics.trackVideoStart(props.exerciseSlug)
  })

  player.on('timeupdate', () => {
    const duration = player?.duration ?? 0
    const current = player?.currentTime ?? 0
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
})

onBeforeUnmount(() => {
  player?.destroy()
  player = null
})
</script>

<template>
  <div class="aspect-video overflow-hidden rounded-2xl bg-black">
    <video
      ref="playerEl"
      controls
      playsinline
      preload="metadata"
      :aria-label="`Video: ${exerciseSlug}`"
    />
  </div>
</template>
