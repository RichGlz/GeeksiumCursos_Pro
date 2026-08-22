<script setup lang="ts">
import type { BadgeId } from '~/utils/badges'

const { t } = useI18n()
const store = useProgressStore()
const courses = useCourses()
const { celebrateBadge, cleanup: cleanupCelebration } = useCelebration()
const active = ref<BadgeId>()
const queue: BadgeId[] = []
const queued = new Set<BadgeId>()
let timer: ReturnType<typeof setTimeout> | undefined
let initialized = false

const earned = computed(() => earnedBadgeIds(store.progress.completedExercises, courses))
const title = computed(() => active.value === 'first-exercise'
  ? t('badges.firstToastTitle')
  : t('badges.unlockedTitle'))
const message = computed(() => active.value === 'first-exercise'
  ? t('badges.firstToastMessage')
  : t('badges.unlocked', { badge: t(`badges.items.${active.value}`) }))

const showNext = () => {
  if (active.value || queue.length === 0) return
  const next = queue.shift()
  if (!next) return
  queued.delete(next)
  active.value = next
  store.markBadgeNotified(next)
  void celebrateBadge()
  timer = setTimeout(() => {
    active.value = undefined
    nextTick(showNext)
  }, 4000)
}

watch(
  [() => store.hydrated, earned],
  ([hydrated, badges]) => {
    if (!hydrated) return

    // La primera hidratación establece la línea base: no muestra insignias
    // históricas de usuarios que ya tenían progreso antes de este toast.
    if (!initialized) {
      initialized = true
      for (const badge of badges) store.markBadgeNotified(badge)
      return
    }

    const fresh = badges.filter((badge) => !store.isBadgeNotified(badge))
    for (const badge of fresh) {
      if (badge === active.value || queued.has(badge)) continue
      queue.push(badge)
      queued.add(badge)
    }
    showNext()
  },
  { immediate: true },
)

onMounted(() => store.hydrate())
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer)
  cleanupCelebration()
})
</script>

<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200" enter-from-class="translate-y-2 opacity-0" leave-active-class="transition duration-150" leave-to-class="translate-y-2 opacity-0">
      <div v-if="active" class="fixed right-4 top-20 z-50 max-w-sm rounded-xl border border-brand-200 bg-white p-4 shadow-lg dark:border-brand-800 dark:bg-ink-900" role="status" aria-live="polite">
        <p class="text-xs font-bold uppercase tracking-wide text-brand-600">{{ title }}</p>
        <p class="mt-1 text-sm font-semibold text-ink-900 dark:text-white">
          {{ message }}
        </p>
      </div>
    </Transition>
  </Teleport>
</template>
