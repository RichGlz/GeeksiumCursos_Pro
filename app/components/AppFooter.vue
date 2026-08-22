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
      <p>&copy; {{ year }} <span class="font-geeksium-footer text-lg text-brand-600">Geeksium Cursos</span>. {{ t('footer.rights') }}</p>
      <div class="flex flex-wrap items-center gap-x-4 gap-y-2">
        <a href="mailto:contactoCursos@geeksium.com" class="rounded-lg px-2 py-1 underline underline-offset-4 hover:text-brand-600">
          {{ t('footer.suggestions') }}
        </a>
        <button
          type="button"
          class="rounded-lg px-2 py-1 underline underline-offset-4 hover:text-brand-600"
          @click="reset()"
        >
          {{ t('footer.analyticsSettings') }}
        </button>
      </div>
    </div>
  </footer>
</template>
