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

export type CourseLevel =
  | 'beginner-1'
  | 'beginner-2'
  | 'beginner-3'
  | 'intermediate-1'
  | 'intermediate-2'
  | 'intermediate-3'
  | 'advanced-1'
  | 'advanced-2'
  | 'advanced-3'

export type ExerciseType = 'exercise' | 'challenge'

export interface SeoMeta {
  title?: LocalizedText
  description?: LocalizedText
  image?: string
}

export interface CourseAuthor {
  name: string
  url?: string
}

export interface ThemeModeColors {
  light?: string
  dark?: string
}

export interface CourseTheme {
  primary: string
  secondary: string
  confettiColors?: string[]
  browser?: string
  markdown?: {
    inlineCode?: {
      background?: ThemeModeColors
      text?: ThemeModeColors
    }
    codeBlock?: {
      background?: ThemeModeColors
      text?: ThemeModeColors
    }
    blockquote?: {
      border?: ThemeModeColors
    }
    link?: ThemeModeColors
  }
  badges?: {
    level?: {
      background?: ThemeModeColors
      text?: ThemeModeColors
    }
  }
  tools?: {
    background?: ThemeModeColors
    text?: ThemeModeColors
  }
  video?: {
    playButton?: string
    progress?: string
    volume?: string
  }
  buttons?: {
    solid?: {
      background?: ThemeModeColors
    }
    subtle?: {
      text?: ThemeModeColors
    }
  }
}

export interface Viewer3DSettings {
  viewCube?: boolean
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
  theme?: CourseTheme
  viewer3d?: Viewer3DSettings
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
  rotation?: {
    x?: number
    y?: number
    z?: number
  }
}

export interface ExerciseActions {
  youtubeUrl?: string
  shareEnabled?: boolean
  favoriteEnabled?: boolean
  donationUrl?: string
}

export interface ExerciseTool {
  id: string
  name: {
    es: string
    en: string
  }
}

export interface Exercise {
  id: string
  slug: string
  order: number
  enabled?: boolean
  courseSlug: string
  title: LocalizedText
  shortTitle?: LocalizedText
  summary?: LocalizedText
  difficulty?: Difficulty
  level?: CourseLevel
  type?: ExerciseType
  tags?: string[]
  tools?: ExerciseTool[]
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
