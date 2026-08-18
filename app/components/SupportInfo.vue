<script setup lang="ts">
const { t } = useI18n()
const analytics = useAnalytics()

const showInfo = async () => {
  analytics.trackSupportInfoOpen()
  const { default: Swal } = await import('sweetalert2')
  await Swal.fire({
    toast: true,
    position: 'top-end',
    title: t('support.title'),
    html: `<p>${t('support.message')}</p><p class="swal-support-secondary">${t('support.adBlocker')}</p>`,
    icon: 'info',
    backdrop: false,
    timer: undefined,
    showCloseButton: true,
    confirmButtonText: t('common.close'),
  })
}
</script>

<template>
  <button type="button" class="surface-card w-full px-4 py-3 text-left text-sm font-semibold text-brand-600 hover:bg-ink-50 dark:hover:bg-ink-800/60" @click="showInfo">
    {{ t('support.title') }}
  </button>
</template>
