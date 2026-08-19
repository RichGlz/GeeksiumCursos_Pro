<script setup lang="ts">
const { t } = useI18n()
const analytics = useAnalytics()
const trigger = ref<HTMLButtonElement | null>(null)

const showInfo = async () => {
  analytics.trackSupportInfoOpen()
  const { default: Swal } = await import('sweetalert2')
  const accent = trigger.value
    ? getComputedStyle(trigger.value).getPropertyValue('--course-primary').trim()
    : ''
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
    buttonsStyling: false,
    customClass: {
      popup: 'swal-support-popup',
      title: 'swal-support-title',
      htmlContainer: 'swal-support-content',
      confirmButton: 'swal-support-confirm',
      closeButton: 'swal-support-close',
    },
    didOpen: (popup) => {
      popup.style.setProperty('--swal-support-accent', accent || '#2563eb')
    },
  })
}
</script>

<template>
  <button ref="trigger" type="button" class="surface-card w-full px-4 py-3 text-left text-sm font-semibold text-brand-600 hover:bg-ink-50 dark:hover:bg-ink-800/60" @click="showInfo">
    {{ t('support.title') }}
  </button>
</template>
