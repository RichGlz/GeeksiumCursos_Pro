<script setup lang="ts">
const { t } = useI18n()
const config = useRuntimeConfig()
const analytics = useAnalytics()

const options = computed(() => [
  { amount: 1 as const, url: String(config.public.paypalChocolate1Url || '') },
  { amount: 2 as const, url: String(config.public.paypalChocolate2Url || '') },
].filter((option) => /^https?:\/\//i.test(option.url)))

const openDonation = async () => {
  const { default: Swal } = await import('sweetalert2')
  const first = options.value[0]
  const second = options.value[1]
  if (!first) return
  const result = await Swal.fire({
    title: t('donation.title'),
    icon: 'info',
    showCancelButton: true,
    showDenyButton: Boolean(second),
    confirmButtonText: t(`donation.usd${first.amount}`),
    denyButtonText: second ? t(`donation.usd${second.amount}`) : undefined,
    cancelButtonText: t('common.close'),
  })
  const selected = result.isConfirmed ? first : result.isDenied ? second : undefined
  if (!selected) return
  analytics.trackDonationClick(selected.amount)
  window.open(selected.url, '_blank', 'noopener,noreferrer')
}
</script>

<template>
  <button v-if="options.length" type="button" class="surface-card w-full px-4 py-3 text-left text-sm font-semibold text-brand-600 hover:bg-ink-50 dark:hover:bg-ink-800/60" @click="openDonation">
    {{ t('donation.title') }}
  </button>
</template>
