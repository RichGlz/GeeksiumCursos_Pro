# Geeksium Cursos — Fase 1

Aplicación **Nuxt 4 + Vue 3 + TypeScript** para cursos técnicos basados en vídeo y ejercicios.
Este directorio es el proyecto real y es **totalmente independiente** del cascarón React que Lovable
usa para su vista previa: si se elimina todo lo que hay fuera de `nuxt-app/`, la aplicación sigue
funcionando sin cambios.

## Comandos

```bash
cd nuxt-app
npm install
npm run dev        # desarrollo en http://localhost:3000
npm run generate   # sitio estático completo en .output/public
npm run preview    # previsualiza el build estático
npm run typecheck  # nuxi typecheck
```

## Arquitectura

```
nuxt-app/
├── build/content-routes.ts     # descubre cursos/ejercicios y genera las rutas de prerender
├── content/courses/<curso>/    # una carpeta por curso
│   ├── course.json             # metadatos del curso
│   └── exercises/*.json        # un JSON por ejercicio
├── app/
│   ├── components/             # componentes genéricos, sin hardcodear ejercicios
│   ├── composables/            # useCourse, useExercise, useAnalytics, useTheme, …
│   ├── pages/                  # index, courses/, [course]/, [course]/[exercise]
│   ├── stores/                 # Pinia: progress, preferences, course
│   ├── types/                  # tipos de contenido y progreso
│   └── utils/content.ts        # motor de contenido (import.meta.glob sobre los JSON)
├── i18n/locales/{es,en}.json
└── public/                     # iconos, imágenes, descargas, modelos 3D
```

### Motor de contenido

`app/utils/content.ts` carga con `import.meta.glob(..., { eager: true })` todos los
`content/courses/*/course.json` y `content/courses/*/exercises/*.json`, los valida y los ordena.
**Añadir un curso nuevo consiste únicamente en crear su carpeta con JSON válidos**: las rutas, el
listado, la navegación anterior/siguiente, el progreso, el SEO y el prerender se derivan de los
datos. No hay que crear páginas Vue adicionales.

### Prerender determinista

`nuxt.config.ts` no depende del crawler de enlaces: llama a `buildContentRoutes()` en tiempo de
build y añade explícitamente cada ruta (en `es` y `en`) a `nitro.prerender.routes`. Tras
`npm run generate` se puede comprobar en `.output/public` que existe un `index.html` y su payload
para cada curso y cada ejercicio detectado.

### Estado y progreso

Pinia (`stores/progress.ts`) mantiene progreso, ejercicios completados, favoritos y último
ejercicio visitado, persistidos en `localStorage` mediante `composables/useLocalStorage.ts`.
El acceso pasa siempre por `useExerciseProgress()`, de modo que sustituir el backend por Supabase
más adelante no obliga a tocar los componentes. No hay login, pagos ni backend de usuarios en Fase 1.

### Analítica

Google Analytics 4 se carga con **Nuxt Scripts** (`useScriptGoogleAnalytics`) en
`plugins/analytics.client.ts`, sin *first-party proxy* ni endpoints Nitro: el sitio se despliega
como estático puro. Toda la telemetría pasa por `composables/useAnalytics.ts` (vistas de curso y
ejercicio, progreso, capítulos, descargas, interacción 3D, compartir, YouTube…). Ningún componente
llama a `gtag()` directamente, lo que permite añadir después un dashboard privado sin rehacer la UI.

**Consent Mode** se inicializa en `denied` antes de cargar GA4 y se actualiza desde un banner
discreto y no bloqueante (`components/ConsentBanner.vue`). No hay modal bloqueante ni age gate; si
se rechaza la analítica, el sitio funciona con normalidad y `useAnalytics()` se convierte en un
no-op. Sin `NUXT_PUBLIC_GA_MEASUREMENT_ID` tampoco se carga nada.

### Donaciones de chocolates

Las opciones se configuran con Stripe Payment Links públicos HTTPS:

```dotenv
NUXT_PUBLIC_STRIPE_CHOCOLATE_1_URL=
NUXT_PUBLIC_STRIPE_CHOCOLATE_2_URL=
```

Cada variable habilita su opción correspondiente. `ChocolateDonation.vue` descarta valores vacíos
o que no sean URLs HTTPS válidas; si ambas variables están vacías o no son válidas, no renderiza ningún
botón y no deja una acción muerta en la interfaz.

Las vistas de página usan una única estrategia: la medición automática de GA4. En **Enhanced
Measurement** debe permanecer habilitada la opción de cambios de página basados en eventos del
historial del navegador. No existe `router.afterEach` que envíe `page_view` manualmente; no se debe
añadir otro tracker SPA. La métrica administrativa de descargas de Geeksium es exclusivamente el
evento manual `resource_download`, agrupado por `resource_id`; el evento automático
`file_download` no se utiliza como contador del producto.

## Decisiones técnicas

- **Tailwind CSS v4** vía `tailwindcss` + `@tailwindcss/vite` (integración oficial actual). No se
  usa `@nuxtjs/tailwindcss` para no arrastrar configuración heredada de v3. Los tokens viven en
  `assets/css/main.css` con `@theme`.
- **PWA**: `@vite-pwa/nuxt` (v1.x) funciona correctamente con Nuxt 4 y `nuxt generate`; genera
  `sw.js` + manifest sobre el sitio estático. No fue necesario el fallback a `vite-plugin-pwa`
  directo ni a un service worker manual. Las navegaciones usan `NetworkFirst` y los assets
  con hash `CacheFirst`.
- **Fuentes**: `@nuxt/fonts` descarga y sirve Montserrat (400/500/600/700) desde el propio build,
  sin petición runtime a Google Fonts.
- **404**: `error.vue` es la página global; además las páginas dinámicas de curso y ejercicio
  lanzan `createError({ status: 404, statusText: 'Not Found' })` cuando el contenido no existe.
- **i18n**: `@nuxtjs/i18n` con `es` por defecto (sin prefijo) e `en` bajo `/en`, estrategia
  `prefix_except_default`, compatible con generación estática.

## Preparado para el futuro (no implementado en Fase 1)

Autenticación, pagos, comentarios, perfiles y dashboard administrativo. Las capas de progreso,
favoritos y analítica están aisladas tras composables para poder conectarlas a Supabase sin
reescribir componentes.
