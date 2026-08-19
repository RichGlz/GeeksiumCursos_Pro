export type LocaleCode = 'es' | 'en'

/** Texto multilenguaje. El español es obligatorio; el inglés es opcional en Fase 1. */
export interface LocalizedText {
  es: string
  en?: string
}

/** Lista multilenguaje (por ejemplo, notas del autor). */
export interface LocalizedList {
  es: string[]
  en?: string[]
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface SeoMeta {
  title?: LocalizedText
  description?: LocalizedText
  image?: string
}

export interface CourseAuthor {
  name: string
  url?: string
}

export interface Course {
  id: string
  slug: string
  enabled?: boolean
  title: LocalizedText
  description: LocalizedText
  difficulty?: Difficulty
  cover?: string
  author?: CourseAuthor
  seo?: SeoMeta
  theme?: {
    primary: string
    secondary: string
  }
}

export interface VideoChapter {
  id: string
  timeSeconds: number
  label: LocalizedText
}

export type VideoProvider = 'youtube' | 'file'

export interface ExerciseVideo {
  enabled?: boolean
  provider: VideoProvider
  url: string
  youtubeId?: string
  poster?: string
  durationSeconds?: number
}

export type ResourceType =
  | 'pdf'
  | 'stl'
  | 'zip'
  | 'f3d'
  | 'step'
  | 'xlsx'
  | 'dwg'
  | 'image'
  | 'png'
  | 'jpg'
  | 'jpeg'
  | 'webp'
  | 'link'
  | 'file'

export interface DownloadResource {
  id: string
  type: ResourceType
  title: LocalizedText
  url: string
  download?: boolean
  previewImage?: string
  color?: string
}

export interface Model3DConfig {
  enabled: boolean
  url?: string
  format?: 'glb' | 'gltf' | 'stl'
  autoRotate?: boolean
}

export interface ExerciseActions {
  youtubeUrl?: string
  shareEnabled?: boolean
  favoriteEnabled?: boolean
  donationUrl?: string
}

export interface Exercise {
  id: string
  slug: string
  order: number
  enabled?: boolean
  courseSlug: string
  title: LocalizedText
  summary?: LocalizedText
  difficulty?: Difficulty
  tags?: string[]
  video?: ExerciseVideo
  chapters?: VideoChapter[]
  authorNotes?: LocalizedList
  authorNotesFile?: {
    es: string
    en?: string
  }
  resources?: DownloadResource[]
  model3d?: Model3DConfig
  actions?: ExerciseActions
  seo?: SeoMeta
  publishedAt?: string
  updatedAt?: string
}

/** Curso con sus ejercicios ya ordenados. */
export interface CourseWithExercises extends Course {
  exercises: Exercise[]
}
