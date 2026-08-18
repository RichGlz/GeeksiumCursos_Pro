import type { ExerciseVideo } from '~/types/content'

const SAFE_YOUTUBE_ID = /^[A-Za-z0-9_-]{1,128}$/

function safeYoutubeId(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  const id = value.trim()
  return SAFE_YOUTUBE_ID.test(id) ? id : undefined
}

/** Extrae de forma flexible el ID de URLs watch, cortas, embed, shorts y nocookie. */
export function extractYoutubeId(url: string | undefined): string | undefined {
  if (typeof url !== 'string' || !url.trim()) return undefined
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '')
    if (host === 'youtu.be') return safeYoutubeId(parsed.pathname.split('/').filter(Boolean)[0])
    if (host !== 'youtube.com' && host !== 'm.youtube.com' && host !== 'youtube-nocookie.com') {
      return undefined
    }
    if (parsed.pathname === '/watch') return safeYoutubeId(parsed.searchParams.get('v'))
    const match = /^\/(?:embed|shorts)\/([^/?#]+)/.exec(parsed.pathname)
    return safeYoutubeId(match?.[1])
  } catch {
    return undefined
  }
}

/** El override manual gana; una cadena vacía permite derivar el ID desde la URL. */
export function resolveYoutubeId(video: ExerciseVideo | undefined): string | undefined {
  if (!video || video.enabled === false || video.provider !== 'youtube') return undefined
  return safeYoutubeId(video.youtubeId) ?? extractYoutubeId(video.url)
}

export function youtubeWatchUrl(video: ExerciseVideo | undefined): string | undefined {
  const id = resolveYoutubeId(video)
  return id ? `https://www.youtube.com/watch?v=${id}` : undefined
}

/** Configuración de fuente para Video.js. */
export function videoJsSource(video: ExerciseVideo): { src: string; type: string } | undefined {
  if (video.enabled === false) return undefined
  if (video.provider === 'youtube') {
    const url = youtubeWatchUrl(video)
    return url ? { src: url, type: 'video/youtube' } : undefined
  }
  return video.url.trim() ? { src: video.url, type: 'video/mp4' } : undefined
}
