<script setup lang="ts">
const { t, locale } = useI18n()
const head = useLocaleHead({ seo: true })
const config = useRuntimeConfig()
const route = useRoute()
const activeCourse = computed(() => {
  const slug = route.params.course
  return typeof slug === 'string' ? getCourse(slug) : undefined
})
const browserThemeColor = computed(() => courseBrowserThemeColor(activeCourse.value))

useHead(() => ({
  htmlAttrs: { lang: head.value.htmlAttrs?.lang ?? locale.value },
  link: head.value.link,
  meta: head.value.meta,
  titleTemplate: (title?: string) =>
    title ? `${title} | ${t('site.name')}` : `${t('site.name')} — ${t('site.tagline')}`,
}))

useHead(() => ({
  meta: [
    { name: 'theme-color', content: browserThemeColor.value },
  ],
}))

useSeoMeta({
  ogSiteName: () => t('site.name'),
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

useSchemaOrgSite(config.public.siteUrl as string, t('site.name'), t('site.description'))
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
