import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { buildContentRoutes } from './build/content-routes'

const contentDir = fileURLToPath(new URL('./content/courses', import.meta.url))
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://cursos.geeksium.com'
const siteOriginPattern = new RegExp(`^${siteUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`)

/**
 * Rutas de curso/ejercicio calculadas en build a partir de los JSON de contenido.
 * No dependemos únicamente del crawler de enlaces: cada ruta se declara explícitamente.
 */
const prerenderRoutes = buildContentRoutes(contentDir, ['es', 'en'], 'es')

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: process.env.NODE_ENV !== 'production' },
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
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'manifest', href: '/manifest.webmanifest' },
      ],
    },
  },

  runtimeConfig: {
    public: {
      siteUrl,
      gaMeasurementId: process.env.NUXT_PUBLIC_GA_MEASUREMENT_ID || '',
      stripeChocolate1Url: process.env.NUXT_PUBLIC_STRIPE_CHOCOLATE_1_URL || '',
      stripeChocolate2Url: process.env.NUXT_PUBLIC_STRIPE_CHOCOLATE_2_URL || '',
    },
  },

  // Fuente principal servida desde el propio build (sin request runtime a Google Fonts).
  fonts: {
    families: [
      { name: 'Montserrat', provider: 'google', weights: [400, 500, 600, 700] },
      { name: 'Bebas Neue', provider: 'google', weights: [400] },
    ],
  },

  image: {
    quality: 80,
    format: ['webp'],
  },

  i18n: {
    baseUrl: siteUrl,
    locales: [
      { code: 'es', language: 'es-MX', name: 'Español', file: 'es.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    defaultLocale: 'es',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'geeksium_locale',
      redirectOn: 'root',
      alwaysRedirect: false,
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
        { src: '/icons/pwa/geeksium-icon-v1-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icons/pwa/geeksium-icon-v1-512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/icons/pwa/geeksium-icon-maskable-v1-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      // Solo shell/assets propios. files.geeksium.com y archivos grandes externos no coinciden.
      globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff2,json}'],
      navigateFallback: '/',
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: siteOriginPattern,
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
      failOnError: true,
      routes: prerenderRoutes,
    },
  },

  hooks: {
    'build:manifest': (manifest) => {
      const onDemand3dModules = [
        '/three/build/three.module.js',
        '/three/examples/jsm/controls/OrbitControls.js',
        '/three/examples/jsm/loaders/GLTFLoader.js',
        '/three/examples/jsm/loaders/STLLoader.js',
        '/three-viewport-gizmo/',
      ]
      for (const [key, chunk] of Object.entries(manifest)) {
        const source = `${key} ${chunk.src ?? ''}`
        if (!onDemand3dModules.some((modulePath) => source.includes(modulePath))) continue
        chunk.prefetch = false
        chunk.preload = false
      }
    },
    'pwa:beforeBuildServiceWorker': (options) => {
      const entries = options.workbox.additionalManifestEntries
      if (!entries) return
      options.workbox.additionalManifestEntries = entries.filter((entry) =>
        (typeof entry === 'string' ? entry : entry.url) !== options.manifestFilename,
      )
    },
  },

  typescript: {
    strict: true,
  },
})
