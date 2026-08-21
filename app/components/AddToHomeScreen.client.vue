<script setup lang="ts">
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type InstallMode = 'chromium' | 'ios'

const storageKey = 'geeksium:a2hs:v1:dismissed'
const mode = ref<InstallMode | null>(null)
const busy = ref(false)
const { t } = useI18n()
const analytics = useAnalytics()
let deferredPrompt: BeforeInstallPromptEvent | null = null

function isStandalone() {
  const navigatorWithStandalone = navigator as Navigator & { standalone?: boolean }
  return window.matchMedia('(display-mode: standalone)').matches
    || navigatorWithStandalone.standalone === true
}

function wasDismissed() {
  try {
    return localStorage.getItem(storageKey) === '1'
  } catch {
    return false
  }
}

function rememberDismissal() {
  try {
    localStorage.setItem(storageKey, '1')
  } catch {
    // La preferencia es opcional si el navegador bloquea localStorage.
  }
}

function isIosOrIpados() {
  return /iPad|iPhone|iPod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function dismiss() {
  rememberDismissal()
  deferredPrompt = null
  mode.value = null
}

async function install() {
  if (!deferredPrompt || busy.value) return
  busy.value = true
  try {
    await deferredPrompt.prompt()
    const choice = await deferredPrompt.userChoice
    if (choice.outcome === 'accepted') analytics.trackPwaInstall()
    rememberDismissal()
    mode.value = null
    deferredPrompt = null
  } finally {
    busy.value = false
  }
}

const onBeforeInstallPrompt = (event: Event) => {
  if (isStandalone() || wasDismissed()) return
  event.preventDefault()
  deferredPrompt = event as BeforeInstallPromptEvent
  mode.value = 'chromium'
}

const onAppInstalled = () => {
  rememberDismissal()
  deferredPrompt = null
  mode.value = null
}

onMounted(() => {
  if (isStandalone() || wasDismissed()) return
  window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.addEventListener('appinstalled', onAppInstalled)
  if (isIosOrIpados()) mode.value = 'ios'
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  window.removeEventListener('appinstalled', onAppInstalled)
})
</script>

<template>
  <aside
    v-if="mode"
    class="fixed bottom-4 left-4 right-4 z-30 max-w-sm rounded-2xl border border-ink-200 bg-white p-4 shadow-xl dark:border-ink-700 dark:bg-ink-900"
    :aria-label="t('pwa.addToHomeScreen')"
  >
    <div class="flex items-start gap-3">
      <div class="min-w-0 flex-1">
        <p class="font-bold text-ink-900 dark:text-white">{{ t('pwa.addToHomeScreen') }}</p>
        <p v-if="mode === 'ios'" class="mt-1 text-sm muted-text">{{ t('pwa.iosInstructions') }}</p>
        <button
          v-else
          type="button"
          class="mt-3 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-wait disabled:opacity-70"
          :disabled="busy"
          @click="install"
        >
          {{ t('pwa.addToHomeScreen') }}
        </button>
      </div>
      <button
        type="button"
        class="shrink-0 rounded-md p-1 text-ink-500 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-ink-800"
        :aria-label="t('common.close')"
        @click="dismiss"
      >
        <svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </aside>
</template>
