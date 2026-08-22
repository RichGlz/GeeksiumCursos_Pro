interface ExerciseCelebrationOptions {
  event?: MouseEvent
  target?: HTMLElement | null
  colors?: string[]
}

const EXERCISE_COOLDOWN_MS = 1600
const SAFE_CONFETTI_COLORS = ['#2563eb']

let exerciseCooldownUntil = 0
let pending = false
let generation = 0
let lifecycleInstalled = false
let confettiModule: Promise<typeof import('@hiseb/confetti')> | undefined

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function interactionPosition(event?: MouseEvent, target?: HTMLElement | null): { x: number; y: number } {
  const hasPointerCoordinates = event
    && Number.isFinite(event.clientX)
    && Number.isFinite(event.clientY)
    && event.clientX >= 0
    && event.clientY >= 0
    && (event.detail > 0 || event.clientX !== 0 || event.clientY !== 0)

  if (hasPointerCoordinates) {
    return { x: event.clientX, y: event.clientY }
  }

  if (target) {
    const rect = target.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    if (Number.isFinite(x) && Number.isFinite(y)) return { x, y }
  }

  return {
    x: Math.max(window.innerWidth, 1) / 2,
    y: Math.max(window.innerHeight, 1) / 2,
  }
}

function loadConfetti(): Promise<typeof import('@hiseb/confetti')> {
  if (!confettiModule) {
    confettiModule = import('@hiseb/confetti').catch((error: unknown) => {
      confettiModule = undefined
      throw error
    })
  }
  return confettiModule
}

function invalidatePending(): void {
  generation++
  pending = false
}

async function celebrateExercise(options: ExerciseCelebrationOptions = {}): Promise<boolean> {
  if (import.meta.server || prefersReducedMotion()) return false

  const now = Date.now()
  if (pending || now < exerciseCooldownUntil) return false

  pending = true
  exerciseCooldownUntil = now + EXERCISE_COOLDOWN_MS
  const currentGeneration = generation
  const position = interactionPosition(options.event, options.target)
  const color = options.colors?.length ? options.colors : SAFE_CONFETTI_COLORS

  try {
    const { default: confetti } = await loadConfetti()
    if (currentGeneration !== generation || prefersReducedMotion()) return false
    confetti({ position, color })
    return true
  } catch {
    return false
  } finally {
    if (currentGeneration === generation) pending = false
  }
}

function installLifecycleCleanup(): void {
  if (import.meta.server || lifecycleInstalled) return
  lifecycleInstalled = true
  useNuxtApp().hook('page:start', invalidatePending)
  window.addEventListener('pagehide', invalidatePending)
}

/** Capa única de celebración visual de la aplicación. */
export function useCelebration() {
  installLifecycleCleanup()
  return { celebrateExercise }
}
