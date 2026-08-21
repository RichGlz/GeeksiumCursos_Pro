<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <a
      href="#main"
      class="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-brand-600 focus:px-4 focus:py-2 focus:text-white"
    >
      {{ t('nav.skipToContent') }}
    </a>
    <AppHeader />
    <main id="main" class="flex-1">
      <slot />
    </main>
    <AppFooter />
    <ConsentBanner />
    <BadgeToast />
    <AddToHomeScreen />
  </div>
</template>
