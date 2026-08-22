export type CelebrationType = 'exercise-complete' | 'badge-unlocked'

interface CelebrationContainer {
  destroyed: boolean
  destroy: (remove?: boolean) => void
  canvas?: { domElement?: HTMLCanvasElement }
}

interface ExerciseCelebrationOptions {
  event?: MouseEvent
  target?: HTMLElement | null
  primary?: string
  secondary?: string
}

const EXERCISE_COOLDOWN_MS = 1600
const EXERCISE_DURATION_MS = 1800
const BADGE_DURATION_MS = 3400
const CONFETTI_ID = 'geeksium-celebration-confetti'
const RIBBONS_ID = 'geeksium-celebration-ribbons'
const NEUTRAL_COLOR = '#CCCCCC'
const BRAND_FALLBACK = '#2563EB'
const HEX_COLOR = /^#[0-9a-f]{6}$/i

const activeType = ref<CelebrationType>()
const isCelebrating = computed(() => activeType.value !== undefined)
const containers = new Set<CelebrationContainer>()
const timers = new Set<ReturnType<typeof setTimeout>>()

let runId = 0
let exerciseCooldownUntil = 0
let badgeCooldownUntil = 0
let lifecycleInstalled = false
let confettiModule: Promise<typeof import('@tsparticles/confetti')> | undefined
let ribbonsModule: Promise<typeof import('@tsparticles/ribbons')> | undefined

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function schedule(callback: () => void, delay: number): void {
  const timer = setTimeout(() => {
    timers.delete(timer)
    callback()
  }, delay)
  timers.add(timer)
}

function prepareContainer(container: CelebrationContainer | undefined): void {
  if (!container || container.destroyed) return
  containers.add(container)
  const canvas = container.canvas?.domElement
  if (!canvas) return
  canvas.dataset.geeksiumCelebration = 'true'
  canvas.setAttribute('aria-hidden', 'true')
  canvas.setAttribute('role', 'presentation')
  canvas.tabIndex = -1
  canvas.style.pointerEvents = 'none'
}

function destroyContainer(container: CelebrationContainer | undefined): void {
  if (!container) return
  const canvas = container.canvas?.domElement
  if (!container.destroyed) container.destroy(true)
  canvas?.remove()
}

function clearActive(): void {
  runId++
  for (const timer of timers) clearTimeout(timer)
  timers.clear()
  for (const container of containers) destroyContainer(container)
  containers.clear()
  activeType.value = undefined
}

function finish(expectedRunId: number): void {
  if (runId !== expectedRunId) return
  clearActive()
}

function begin(type: CelebrationType): number {
  clearActive()
  activeType.value = type
  return runId
}

function isCurrent(expectedRunId: number, type: CelebrationType): boolean {
  return runId === expectedRunId && activeType.value === type
}

function interactionOrigin(event?: MouseEvent, target?: HTMLElement | null): { x: number; y: number } {
  const viewportWidth = Math.max(window.innerWidth, 1)
  const viewportHeight = Math.max(window.innerHeight, 1)
  let x: number | undefined
  let y: number | undefined

  if (event && Number.isFinite(event.clientX) && Number.isFinite(event.clientY)
    && (event.clientX !== 0 || event.clientY !== 0)) {
    x = event.clientX
    y = event.clientY
  } else if (target) {
    const rect = target.getBoundingClientRect()
    x = rect.left + rect.width / 2
    y = rect.top + rect.height / 2
  }

  return {
    x: Math.min(100, Math.max(0, ((x ?? viewportWidth * 0.5) / viewportWidth) * 100)),
    y: Math.min(100, Math.max(0, ((y ?? viewportHeight * 0.72) / viewportHeight) * 100)),
  }
}

function exerciseColors(primary?: string, secondary?: string): string[] {
  const safePrimary = primary && HEX_COLOR.test(primary) ? primary : NEUTRAL_COLOR
  const safeSecondary = secondary && HEX_COLOR.test(secondary) ? secondary : safePrimary
  return [NEUTRAL_COLOR, safePrimary, safeSecondary]
}

function resolveBrandColor(): string {
  const token = getComputedStyle(document.documentElement).getPropertyValue('--color-brand-600').trim()
  if (!token || (typeof CSS !== 'undefined' && !CSS.supports('color', token))) return BRAND_FALLBACK

  try {
    const canvas = document.createElement('canvas')
    canvas.width = 1
    canvas.height = 1
    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return BRAND_FALLBACK
    context.fillStyle = token
    context.fillRect(0, 0, 1, 1)
    const data = context.getImageData(0, 0, 1, 1).data
    const red = data[0] ?? 0
    const green = data[1] ?? 0
    const blue = data[2] ?? 0
    const alpha = data[3] ?? 0
    if (!alpha) return BRAND_FALLBACK
    return `#${[red, green, blue].map(value => value.toString(16).padStart(2, '0')).join('')}`
  } catch {
    return BRAND_FALLBACK
  }
}

function loadConfetti() {
  confettiModule ??= import('@tsparticles/confetti')
  return confettiModule
}

function loadRibbons() {
  ribbonsModule ??= import('@tsparticles/ribbons')
  return ribbonsModule
}

async function celebrateExercise(options: ExerciseCelebrationOptions = {}): Promise<boolean> {
  if (import.meta.server || prefersReducedMotion()) return false
  const now = Date.now()
  if (activeType.value || now < exerciseCooldownUntil) return false

  exerciseCooldownUntil = now + EXERCISE_COOLDOWN_MS
  const origin = interactionOrigin(options.event, options.target)
  const colors = exerciseColors(options.primary, options.secondary)
  const currentRunId = begin('exercise-complete')

  try {
    const { confetti } = await loadConfetti()
    if (!isCurrent(currentRunId, 'exercise-complete')) return false

    const count = window.innerWidth < 640 ? 38 : 54
    const main = await confetti(CONFETTI_ID, {
      count,
      spread: 62,
      startVelocity: 34,
      decay: 0.91,
      gravity: 1.05,
      drift: 0.4,
      ticks: 105,
      scalar: window.innerWidth < 640 ? 0.82 : 0.95,
      position: origin,
      colors,
      disableForReducedMotion: true,
      zIndex: 70,
    })
    if (!isCurrent(currentRunId, 'exercise-complete')) {
      destroyContainer(main)
      return false
    }
    prepareContainer(main)

    schedule(() => {
      if (!isCurrent(currentRunId, 'exercise-complete')) return
      void confetti(CONFETTI_ID, {
        count: window.innerWidth < 640 ? 14 : 20,
        spread: 48,
        startVelocity: 25,
        decay: 0.92,
        gravity: 1.1,
        ticks: 82,
        scalar: 0.78,
        position: {
          x: Math.min(96, Math.max(4, origin.x + (Math.random() * 12 - 6))),
          y: Math.min(92, origin.y + 3),
        },
        colors,
        disableForReducedMotion: true,
        zIndex: 70,
      }).then((container) => {
        if (isCurrent(currentRunId, 'exercise-complete')) prepareContainer(container)
        else destroyContainer(container)
      })
    }, 180)
    schedule(() => finish(currentRunId), EXERCISE_DURATION_MS)
    return true
  } catch {
    finish(currentRunId)
    return false
  }
}

async function celebrateBadge(): Promise<boolean> {
  if (import.meta.server || prefersReducedMotion()) return false
  const now = Date.now()
  if (activeType.value === 'badge-unlocked' || now < badgeCooldownUntil) return false

  badgeCooldownUntil = now + BADGE_DURATION_MS
  const currentRunId = begin('badge-unlocked')

  try {
    const [{ confetti }, { ribbons }] = await Promise.all([loadConfetti(), loadRibbons()])
    if (!isCurrent(currentRunId, 'badge-unlocked')) return false

    const brand = resolveBrandColor()
    const [confettiContainer, ribbonsContainer] = await Promise.all([
      confetti(CONFETTI_ID, {
        count: window.innerWidth < 640 ? 62 : 88,
        spread: 92,
        startVelocity: 38,
        decay: 0.92,
        gravity: 0.9,
        ticks: 165,
        scalar: window.innerWidth < 640 ? 0.82 : 0.95,
        position: { x: 50, y: 42 },
        colors: [brand, NEUTRAL_COLOR],
        disableForReducedMotion: true,
        zIndex: 70,
      }),
      ribbons(RIBBONS_ID, {
        count: window.innerWidth < 640 ? 7 : 11,
        positionX: 50,
        emitterSize: { width: 92, height: 0 },
        scalar: window.innerWidth < 640 ? 0.75 : 0.9,
        colors: [brand, NEUTRAL_COLOR],
        disableForReducedMotion: true,
        zIndex: 69,
      }),
    ])

    if (!isCurrent(currentRunId, 'badge-unlocked')) {
      destroyContainer(confettiContainer)
      destroyContainer(ribbonsContainer)
      return false
    }
    prepareContainer(confettiContainer)
    prepareContainer(ribbonsContainer)
    schedule(() => finish(currentRunId), BADGE_DURATION_MS)
    return true
  } catch {
    finish(currentRunId)
    return false
  }
}

function installLifecycleCleanup(): void {
  if (import.meta.server || lifecycleInstalled) return
  lifecycleInstalled = true
  useNuxtApp().hook('page:start', clearActive)
  window.addEventListener('pagehide', clearActive)
}

/** Gestor efímero y único para todas las celebraciones de la aplicación. */
export function useCelebration() {
  installLifecycleCleanup()
  return {
    activeType: readonly(activeType),
    isCelebrating: readonly(isCelebrating),
    celebrateExercise,
    celebrateBadge,
    cleanup: clearActive,
  }
}
