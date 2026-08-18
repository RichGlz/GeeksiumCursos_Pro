<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
const open = ref(false)
const route = useRoute()
const shrunk = ref(false)

const onScroll = () => { shrunk.value = window.scrollY > 24 }
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

watch(() => route.fullPath, () => {
  open.value = false
})

const links = computed(() => [
  { to: localePath('/'), label: t('nav.home') },
  { to: localePath('/courses'), label: t('nav.courses') },
])
</script>

<template>
  <header
    class="sticky top-0 z-40 border-b border-ink-200 bg-white/90 backdrop-blur dark:border-ink-800 dark:bg-ink-950/90"
  >
    <div class="mx-auto flex max-w-6xl items-center gap-3 px-4 transition-[padding] duration-200 motion-reduce:transition-none" :class="shrunk ? 'py-1.5' : 'py-3'">
      <NuxtLink
        :to="localePath('/')"
        class="flex items-center gap-2 text-lg font-bold tracking-tight text-ink-900 dark:text-white"
      >
        <span
          class="grid size-8 place-items-center rounded-lg bg-brand-600 text-sm font-black text-white"
          aria-hidden="true"
        >G</span>
        <span>{{ t('site.name') }}</span>
      </NuxtLink>

      <nav class="ml-auto hidden items-center gap-1 md:flex" :aria-label="t('nav.menu')">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900 dark:text-ink-300 dark:hover:bg-ink-800 dark:hover:text-white"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>

      <div class="ml-auto flex items-center gap-1 md:ml-2">
        <LocaleSwitcher />
        <ThemeToggle />
        <button
          type="button"
          class="rounded-lg p-2 text-ink-600 hover:bg-ink-100 md:hidden dark:text-ink-300 dark:hover:bg-ink-800"
          :aria-label="open ? t('nav.close') : t('nav.menu')"
          :aria-expanded="open"
          @click="open = !open"
        >
          <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path v-if="!open" d="M4 6h16M4 12h16M4 18h16" stroke-linecap="round" />
            <path v-else d="M6 6l12 12M18 6L6 18" stroke-linecap="round" />
          </svg>
        </button>
      </div>
    </div>

    <nav
      v-if="open"
      class="border-t border-ink-200 px-4 py-2 md:hidden dark:border-ink-800"
      :aria-label="t('nav.menu')"
    >
      <NuxtLink
        v-for="link in links"
        :key="link.to"
        :to="link.to"
        class="block rounded-lg px-3 py-2 text-sm font-medium text-ink-700 hover:bg-ink-100 dark:text-ink-200 dark:hover:bg-ink-800"
      >
        {{ link.label }}
      </NuxtLink>
    </nav>
  </header>
</template>
