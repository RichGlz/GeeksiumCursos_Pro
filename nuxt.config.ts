import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { buildContentRoutes } from './build/content-routes'

const contentDir = fileURLToPath(new URL('./content/courses', import.meta.url))

/**
 * Rutas de curso/ejercicio calculadas en build a partir de los JSON de contenido.
 * No dependemos únicamente del crawler de enlaces: cada ruta se declara explícitamente.
 */
const prerenderRoutes = buildContentRoutes(contentDir, ['es', 'en'], 'es')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  future: { compatibilityVersion: 4 },

  modules: [
    '@pinia/nuxt',
    '@nuxt/image',
    '@nuxt/fonts',
    '@nuxt/scripts',
    '@nuxtjs/i18n',
    '@vite-pwa/nuxt',
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  app: {
    head: {
      htmlAttrs: { lang: 'es' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#0f172a' },
      ],
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://cursos.geeksium.com',
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || '',
    },
  },

  // Fuente principal servida desde el propio build (sin request runtime a Google Fonts).
  fonts: {
    families: [{ name: 'Montserrat', provider: 'google', weights: [400, 500, 600, 700] }],
  },

  image: {
    quality: 80,
    format: ['webp'],
  },

  i18n: {
    baseUrl: process.env.NUXT_PUBLIC_SITE_URL || 'https://cursos.geeksium.com',
    locales: [
      { code: 'es', language: 'es-MX', name: 'Español', file: 'es.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'es',
    strategy: 'prefix_except_default',
    lazy: true,
    bundle: { optimizeTranslationDirective: false },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'geeksium_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
    },
  },

  // GA4 se carga en cliente. Sin First-Party Proxy Mode: el sitio final es 100% estático.
  scripts: {
    defaultScriptOptions: {
      trigger: 'manual',
    },
  },

  pwa: {
    registerType: 'autoUpdate',
    strategies: 'generateSW',
    injectRegister: 'auto',
    manifest: {
      name: 'Geeksium Cursos',
      short_name: 'Geeksium',
      description: 'Plataforma de cursos y ejercicios prácticos de Geeksium.',
      lang: 'es',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#0f172a',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/icons/icon-512-maskable.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      // El shell y los assets propios se cachean. Nunca video de YouTube.
      globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2,json}'],
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: ({ url }: { url: URL }) => url.origin === self.location.origin,
          handler: 'NetworkFirst',
          options: { cacheName: 'geeksium-shell' },
        },
      ],
    },
    devOptions: { enabled: false },
    client: { installPrompt: false },
  },

  nitro: {
    preset: 'static',
    prerender: {
      crawlLinks: true,
      failOnError: false,
      routes: prerenderRoutes,
    },
  },

  typescript: {
    strict: true,
  },
})
