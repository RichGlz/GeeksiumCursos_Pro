<script setup lang="ts">
const { t } = useI18n()
const { store } = useExerciseProgress()
const preferences = usePreferencesStore()
const { setTheme } = useTheme()
const courses = useCourses()
const input = ref<HTMLInputElement | null>(null)
const message = ref('')
const isError = ref(false)

const badges = computed(() => earnedBadgeIds(store.progress.completedExercises, courses))

const exportProgress = () => {
  const backup = createProgressBackup(store.progress, store.favorites, preferences.theme)
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `geeksium-progreso-${backup.exportedAt.slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

const chooseImport = () => input.value?.click()

const importProgress = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = ''
  if (!file) return

  try {
    const backup = parseProgressBackup(JSON.parse(await file.text()))
    if (!backup) throw new Error('invalid-backup')
    if (!window.confirm(t('progressBackup.confirm'))) return
    const historicalBadges = earnedBadgeIds(backup.progress.completedExercises, courses)
    store.replaceLocalState(backup.progress, backup.favorites, historicalBadges)
    setTheme(backup.preferences.theme)
    isError.value = false
    message.value = t('progressBackup.success')
  } catch {
    isError.value = true
    message.value = t('progressBackup.invalid')
  }
}
</script>

<template>
  <section class="surface-card p-5">
    <h2 class="text-sm font-bold uppercase tracking-wide muted-text">
      {{ t('progressBackup.title') }}
    </h2>
    <p class="mt-2 text-sm muted-text">{{ t('progressBackup.description') }}</p>

    <div class="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
      <button type="button" class="course-button rounded-lg px-3 py-2 text-sm font-semibold text-white" @click="exportProgress">
        {{ t('progressBackup.export') }}
      </button>
      <button type="button" class="rounded-lg border border-ink-300 px-3 py-2 text-sm font-semibold text-ink-700 hover:bg-ink-100 dark:border-ink-700 dark:text-ink-200 dark:hover:bg-ink-800" @click="chooseImport">
        {{ t('progressBackup.import') }}
      </button>
      <input ref="input" class="sr-only" type="file" accept=".json,application/json" @change="importProgress">
    </div>

    <p v-if="message" class="mt-3 text-xs" :class="isError ? 'text-red-600 dark:text-red-400' : 'course-link'" role="status">
      {{ message }}
    </p>

    <div class="mt-5 border-t border-ink-200 pt-4 dark:border-ink-800">
      <h3 class="text-xs font-bold uppercase tracking-wide muted-text">{{ t('badges.title') }}</h3>
      <ul v-if="badges.length" class="mt-2 flex flex-wrap gap-2">
        <li v-for="badge in badges" :key="badge" class="course-badge rounded-full border px-2 py-1 text-[11px] font-semibold">
          {{ t(`badges.items.${badge}`) }}
        </li>
      </ul>
      <p v-else class="mt-2 text-xs muted-text">{{ t('badges.empty') }}</p>
    </div>
  </section>
</template>
