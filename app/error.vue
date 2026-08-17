<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const { t } = useI18n()

const is404 = computed(() => props.error?.statusCode === 404)
const title = computed(() => (is404.value ? t('error.404title') : t('error.genericTitle')))
const message = computed(() => (is404.value ? t('error.404message') : t('error.genericMessage')))

useSeoMeta({ title: () => title.value, description: () => message.value, robots: 'noindex' })
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <AppHeader />
    <main class="mx-auto flex max-w-2xl flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <p class="text-6xl font-black text-brand-600">{{ error?.statusCode ?? 500 }}</p>
      <h1 class="mt-4 text-2xl font-bold text-ink-900 dark:text-white">{{ title }}</h1>
      <p class="mt-2 muted-text">{{ message }}</p>
      <button
        type="button"
        class="mt-8 rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white hover:bg-brand-700"
        @click="clearError({ redirect: '/' })"
      >
        {{ t('error.backHome') }}
      </button>
    </main>
    <AppFooter />
  </div>
</template>
