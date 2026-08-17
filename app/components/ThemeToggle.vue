<script setup lang="ts">
const { t } = useI18n()
const { theme, cycleTheme } = useTheme()
const { trackThemeChange } = useAnalytics()

const onClick = () => {
  cycleTheme()
  trackThemeChange(theme.value)
}
</script>

<template>
  <button
    type="button"
    class="rounded-lg p-2 text-ink-600 transition-colors hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
    :aria-label="`${t('theme.toggle')}: ${t(`theme.${theme}`)}`"
    :title="t(`theme.${theme}`)"
    @click="onClick"
  >
    <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <template v-if="theme === 'dark'">
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" stroke-linejoin="round" />
      </template>
      <template v-else-if="theme === 'light'">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" stroke-linecap="round" />
      </template>
      <template v-else>
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 20h8" stroke-linecap="round" />
      </template>
    </svg>
  </button>
</template>
