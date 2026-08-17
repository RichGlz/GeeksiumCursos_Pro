import type { ExerciseVideo } from '~/types/content'

/** Extrae el ID de YouTube de una URL (watch, youtu.be o embed). */
export function extractYoutubeId(url: string | undefined): string | undefined {
  if (!url) return undefined
  const patterns = [
    /[?&]v=([\w-]{6,})/,
    /youtu\.be\/([\w-]{6,})/,
    /youtube\.com\/embed\/([\w-]{6,})/,
  ]
  for (const pattern of patterns) {
    const match = pattern.exec(url)
    if (match?.[1]) return match[1]
  }
  return undefined
}

export function youtubeWatchUrl(video: ExerciseVideo | undefined): string | undefined {
  if (!video) return undefined
  const id = video.youtubeId || extractYoutubeId(video.url)
  return id ? `https://www.youtube.com/watch?v=${id}` : video.url
}

/** Configuración de fuente para Video.js. */
export function videoJsSource(video: ExerciseVideo): { src: string; type: string } | undefined {
  if (video.provider === 'youtube') {
    const url = youtubeWatchUrl(video)
    return url ? { src: url, type: 'video/youtube' } : undefined
  }
  return { src: video.url, type: 'video/mp4' }
}
