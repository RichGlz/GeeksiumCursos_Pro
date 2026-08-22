<script setup lang="ts">
/**
 * Barra de consentimiento discreta y NO bloqueante.
 * No es un modal, no bloquea la navegación y no existe age gate.
 */
const { t } = useI18n()
const { decided, accept, decline } = useAnalyticsConsent()
const { trackConsentDecision } = useAnalytics()
const mounted = useMounted()

const onAccept = () => {
  accept()
  nextTick(() => trackConsentDecision(true))
}

const onDecline = () => {
  decline()
}
</script>

<template>
  <div
    v-if="mounted && !decided"
    class="fixed inset-x-3 bottom-3 z-30 mx-auto max-w-2xl surface-card p-4 sm:inset-x-auto sm:right-4"
    role="region"
    :aria-label="t('consent.title')"
  >
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center">
      <p class="text-sm muted-text">
        <strong class="font-bold">{{ t('consent.lead') }}</strong>{{ t('consent.middle') }}<strong class="font-bold">{{ t('consent.improve') }}</strong>{{ t('consent.end') }}
      </p>
      <div class="flex shrink-0 gap-2 sm:ml-auto">
        <button
          type="button"
          class="course-subtle rounded-lg px-3 py-2 text-sm font-medium hover:bg-ink-100 dark:hover:bg-ink-800"
          @click="onDecline"
        >
          {{ t('consent.decline') }}
        </button>
        <button
          type="button"
          class="course-button rounded-lg px-3 py-2 text-sm font-semibold text-white"
          @click="onAccept"
        >
          {{ t('consent.accept') }}
        </button>
      </div>
    </div>
  </div>
</template>
