<script setup lang="ts">
const { t } = useI18n()
const { reset } = useAnalyticsConsent()
const year = new Date().getFullYear()
</script>

<template>
  <footer class="mt-16 border-t border-ink-200 py-8 dark:border-ink-800">
    <div
      class="mx-auto flex max-w-6xl flex-col gap-3 px-4 text-sm muted-text sm:flex-row sm:items-center sm:justify-between"
    >
      <p>&copy; {{ year }} <span class="font-geeksium-footer text-lg text-brand-600">Geeksium</span> {{ t('footer.courses') }}. {{ t('footer.rights') }}</p>
      <button
        type="button"
        class="self-start rounded-lg px-2 py-1 underline underline-offset-4 hover:text-brand-600 sm:self-auto"
        @click="reset()"
      >
        {{ t('footer.analyticsSettings') }}
      </button>
    </div>
  </footer>
</template>
