<script setup lang="ts">
import type { LocaleCode } from '~/types/content'

const { t, locale, locales } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const { trackLocaleChange } = useAnalytics()

const available = computed(() =>
  (locales.value as { code: LocaleCode; name?: string }[]).map((item) => ({
    code: item.code as LocaleCode,
    name: item.name ?? item.code.toUpperCase(),
  })),
)
</script>

<template>
  <div class="flex items-center gap-1" role="group" :aria-label="t('locale.switch')">
    <NuxtLink
      v-for="item in available"
      :key="item.code"
      :to="switchLocalePath(item.code)"
      class="rounded-lg px-2 py-1 text-xs font-semibold uppercase transition-colors"
      :class="
        item.code === locale
          ? 'bg-brand-600 text-white'
          : 'text-ink-500 hover:bg-ink-100 dark:text-ink-400 dark:hover:bg-ink-800'
      "
      :aria-current="item.code === locale ? 'true' : undefined"
      @click="trackLocaleChange(item.code)"
    >
      {{ item.code }}
    </NuxtLink>
  </div>
</template>
