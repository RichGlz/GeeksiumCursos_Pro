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

La vista del curso permite **exportar** un respaldo JSON versionado con progreso, favoritos y tema,
y **restaurarlo** después de validar su estructura y confirmar el reemplazo. El archivo no incluye
cookies, identificadores de Analytics ni datos personales. Las insignias V1 se derivan del progreso
local (primer ejercicio, hitos 10/25/50/100, nivel completo y 10 retos), sin XP, ranking ni estado
duplicado.

### Vídeo con Plyr

`VideoPlayer.client.vue` encapsula Plyr y solo se carga en páginas con un vídeo activo. Acepta el
objeto `video` del JSON, reproduce YouTube o archivos directos, conserva capítulos, controles,
velocidad, fullscreen y eventos de Analytics. `video.youtubeId` es un override opcional; si falta o
está vacío, `app/utils/video.ts` deriva el ID desde URLs `watch`, `youtu.be`, `embed`, `shorts` y
`youtube-nocookie`. `video.poster` acepta una URL propia, incluida R2.

Con `video.enabled: false` no se inicializa Plyr ni se muestran capítulos, enlace a YouTube,
eventos de vídeo o `VideoObject`; se muestra el poster o un fallback 16:9 localizado.

### Campos de ejercicio V1

- `tools`: lista independiente de los tags, con `id` estable y nombre `{ es, en }`.
- `level`: uno de `beginner-1..3`, `intermediate-1..3` o `advanced-1..3`.
- `type`: opcional; `challenge` usa el mismo motor y `undefined` equivale a `exercise`.
- `order`: número, incluidos decimales como `3.5`; listado y anterior/siguiente se ordenan por ese
  valor sin redondearlo.

Los slugs publicados siguen `ejercicio-XXX` y admiten el caso decimal `ejercicio-003-5`. Los
archivos usan la misma convención (`003-5-ejercicio-003-5.json`) sin convertir `order` a entero.

### Visor 3D

El visor acepta exclusivamente `stl`, `glb` y `gltf`. El archivo no se solicita al abrir la página:
el usuario debe pulsar **Cargar modelo 3D**, momento en que se importan Three.js y el loader
correspondiente. `model3d.rotation.{x,y,z}` permite rotación en grados y se convierte internamente
a radianes; por ejemplo, `{ "x": 180, "y": 0, "z": 0 }` corrige un STL invertido. Fullscreen,
OrbitControls, autorrotación configurable y errores visibles se mantienen. IGES directo queda fuera
de alcance para V1.

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

Se usan Stripe Payment Links directamente, sin SDK. Cada opción abre una pestaña nueva con
`noopener,noreferrer` y emite una sola vez `donation_click` con proveedor, importe y moneda.

### Recursos y Cloudflare R2

Los JSON mantienen la URL completa y los recursos públicos nuevos se sirven desde
`https://files.geeksium.com/`, por ejemplo `fusion360/001/plano-001.pdf`. El frontend no usa SDK,
credenciales ni `fetch`/`HEAD` previo: `DownloadList.vue` usa enlaces `<a>` normales y emite un único
`resource_download` por click con IDs, tipo y host, nunca la URL completa. El grid usa una columna
en móvil y dos desde tablet, siempre con `min-width: 0`, `width: 100%` y `max-width: 100%`.

El service worker solo tiene runtime cache para el origen del sitio y su precache excluye PDF, STL,
ZIP y otros archivos grandes; `files.geeksium.com` no se precachea ni se añade a runtime cache.
En Cloudflare se recomienda cache/CDN público para estos objetos con políticas adecuadas al tipo y
versionado del archivo. El cliente no usa SDK ni credenciales R2. **Cache Reserve** queda fuera de
alcance para esta V1.

### Legacy redirects

Los mapeos actuales están en `public/_redirects` con estado 301 para despliegues compatibles:

```text
/courses/fusion-360/interfaz-y-primer-boceto -> /courses/fusion-360/ejercicio-001
/courses/fusion-360/extrusiones-y-revoluciones -> /courses/fusion-360/ejercicio-002
/courses/fusion-360/ensamblaje-y-planos -> /courses/fusion-360/ejercicio-003
```

Incluyen sus equivalentes bajo `/en`. Si el hosting no consume `_redirects`, importar el mismo
mapeo en **Cloudflare Redirect Rules** o **Bulk Redirects**. No se usa ningún endpoint Nitro.

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

Autenticación, comentarios, perfiles remotos y dashboard administrativo. Las capas de progreso,
favoritos y analítica están aisladas tras composables para poder conectarlas a Supabase sin
reescribir componentes.

```
nuxt-app
├─ app
│  ├─ app.vue
│  ├─ assets
│  │  └─ css
│  │     └─ main.css
│  ├─ components
│  │  ├─ AdSlot.vue
│  │  ├─ AppFooter.vue
│  │  ├─ AppHeader.vue
│  │  ├─ AuthorNotesMarkdown.vue
│  │  ├─ BadgeToast.client.vue
│  │  ├─ ChocolateDonation.vue
│  │  ├─ ConsentBanner.vue
│  │  ├─ CourseCard.vue
│  │  ├─ CourseProgressBar.vue
│  │  ├─ DownloadList.vue
│  │  ├─ ExerciseActions.vue
│  │  ├─ ExerciseCard.vue
│  │  ├─ ExerciseList.vue
│  │  ├─ ExerciseNavigation.vue
│  │  ├─ ExerciseStatus.vue
│  │  ├─ LocaleSwitcher.vue
│  │  ├─ Model3DViewer.client.vue
│  │  ├─ ProgressBackup.vue
│  │  ├─ SupportInfo.vue
│  │  ├─ ThemeToggle.vue
│  │  ├─ VideoChapters.vue
│  │  ├─ VideoPlayer.client.vue
│  │  └─ VideoUnavailable.vue
│  ├─ composables
│  │  ├─ useAnalytics.ts
│  │  ├─ useAnalyticsConsent.ts
│  │  ├─ useCourse.ts
│  │  ├─ useExercise.ts
│  │  ├─ useExerciseNavigation.ts
│  │  ├─ useExerciseProgress.ts
│  │  ├─ useLocalStorage.ts
│  │  ├─ useMounted.ts
│  │  ├─ useSchemaOrg.ts
│  │  └─ useTheme.ts
│  ├─ error.vue
│  ├─ layouts
│  │  └─ default.vue
│  ├─ pages
│  │  ├─ courses
│  │  │  ├─ index.vue
│  │  │  └─ [course]
│  │  │     ├─ index.vue
│  │  │     └─ [exercise].vue
│  │  └─ index.vue
│  ├─ plugins
│  │  ├─ analytics.client.ts
│  │  └─ theme.client.ts
│  ├─ stores
│  │  ├─ course.ts
│  │  ├─ preferences.ts
│  │  └─ progress.ts
│  ├─ types
│  │  ├─ content.ts
│  │  └─ progress.ts
│  └─ utils
│     ├─ badges.ts
│     ├─ content.ts
│     ├─ dates.ts
│     ├─ format.ts
│     ├─ progress-backup.ts
│     └─ video.ts
├─ build
│  └─ content-routes.ts
├─ content
│  └─ courses
│     └─ fusion-360
│        ├─ course.json
│        └─ exercises
│           ├─ 001-ejercicio-001-notas.es.md
│           ├─ 001-ejercicio-001.json
│           ├─ 002-ejercicio-002.json
│           └─ 003-ejercicio-003.json
├─ i18n
│  └─ locales
│     ├─ en.json
│     └─ es.json
├─ nuxt.config.ts
├─ package-lock.json
├─ package.json
├─ public
│  ├─ downloads
│  │  └─ fusion-360
│  │     ├─ 001-plano.pdf
│  │     ├─ 002-modelo.step
│  │     ├─ 002-plano.pdf
│  │     └─ 003-componentes.zip
│  ├─ favicon.svg
│  ├─ icons
│  │  ├─ icon-192.png
│  │  ├─ icon-512-maskable.png
│  │  └─ icon-512.png
│  ├─ images
│  │  └─ courses
│  │     └─ fusion-360.svg
│  ├─ models
│  │  └─ demo-cube.glb
│  └─ _redirects
├─ README.md
└─ tsconfig.json

```