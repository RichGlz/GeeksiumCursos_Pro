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

### Convención de ejercicios y notas

Los archivos físicos de ejercicio usan la convención definitiva `NNN-ejercicio.json`, por ejemplo
`001-ejercicio.json` o `004-ejercicio.json`. El filename **no define la ruta pública**: el listado,
la navegación y el prerender usan los campos `id`, `slug`, `order` y `enabled` del JSON. Por eso un
archivo `004-ejercicio.json` con `"slug": "ejercicio-004"` publica
`/courses/<curso>/ejercicio-004` y `/en/courses/<curso>/ejercicio-004`.

Las notas Markdown vecinas usan `NNN-ejercicio-notas.<locale>.md`, por ejemplo
`001-ejercicio-notas.es.md` y `001-ejercicio-notas.en.md`. `authorNotesFile` referencia el nombre
completo; si el Markdown no existe o está vacío, la interfaz conserva el fallback al campo JSON
`authorNotes`.

### Tema del curso y navegador

Cada `course.json` puede declarar un color del navegador dentro del tema:

```json
"theme": {
  "primary": "#d85b12",
  "secondary": "#f28c28",
  "browser": "#d85b12"
}
```

Los campos específicos son opcionales y se organizan semánticamente dentro del mismo `theme`:

```json
{
  "markdown": {
    "inlineCode": { "background": { "light": "#RRGGBB", "dark": "#RRGGBB" }, "text": { "light": "#RRGGBB", "dark": "#RRGGBB" } },
    "codeBlock": { "background": { "light": "#RRGGBB", "dark": "#RRGGBB" }, "text": { "light": "#RRGGBB", "dark": "#RRGGBB" } },
    "blockquote": { "border": { "light": "#RRGGBB", "dark": "#RRGGBB" } },
    "link": { "light": "#RRGGBB", "dark": "#RRGGBB" }
  },
  "badges": { "level": { "background": { "light": "#RRGGBB", "dark": "#RRGGBB" }, "text": { "light": "#RRGGBB", "dark": "#RRGGBB" } } },
  "tools": { "background": { "light": "#RRGGBB", "dark": "#RRGGBB" }, "text": { "light": "#RRGGBB", "dark": "#RRGGBB" } },
  "video": { "playButton": "#RRGGBB", "progress": "#RRGGBB", "volume": "#RRGGBB" },
  "buttons": {
    "solid": { "background": { "light": "#RRGGBB", "dark": "#RRGGBB" } },
    "subtle": { "text": { "light": "#RRGGBB", "dark": "#RRGGBB" } }
  }
}
```

La capa de contenido resuelve una sola vez los fallbacks hacia `primary`, `secondary` o los
neutros actuales y los expone como CSS custom properties en la ruta del curso. Los botones
`solid` derivan hover/active automáticamente con CSS; `subtle` conserva fondos neutros. Fuera de
`/courses/:course/...` siguen vigentes los colores globales Geeksium. El modal de donación es una
excepción deliberada: sus opciones de 1/2 USD permanecen verdes y `Cerrar` gris.

Solo se aceptan colores hexadecimales `#RRGGBB`. El `<meta name="theme-color">` se actualiza al
navegar y aplica el fallback `theme.browser` → `theme.primary` → color global `#0f172a`. Fuera de
una página de curso se usa siempre el color global.

### Campos de ejercicio V1

- `tools`: lista independiente de los tags, con `id` estable y nombre `{ es, en }`.
- `shortTitle`: título localizado opcional para anterior/siguiente; si falta, la navegación usa
  `title` como fallback sin modificar el encabezado principal del ejercicio.
- `level`: uno de `beginner-1..3`, `intermediate-1..3` o `advanced-1..3`.
- `type`: opcional; `challenge` usa el mismo motor y `undefined` equivale a `exercise`.
- `order`: número, incluidos decimales como `3.5`; listado y anterior/siguiente se ordenan por ese
  valor sin redondearlo.

Los slugs publicados siguen `ejercicio-XXX` y admiten el caso decimal `ejercicio-003-5`. El slug y
`order` siguen siendo datos internos independientes del filename; `order` no se redondea.

### Visor 3D

Cada curso puede controlar su ViewCube sin repetir configuración por ejercicio:

```json
"viewer3d": {
  "viewCube": true
}
```

`viewer3d.viewCube` es opcional y su fallback es `true`. Con `false`, OrbitControls y fullscreen
siguen disponibles, pero `three-viewport-gizmo` no se importa ni se crea al cargar el modelo.

El visor acepta exclusivamente `stl`, `glb` y `gltf`. El archivo no se solicita al abrir la página:
el usuario debe pulsar **Cargar modelo 3D**, momento en que se importan Three.js, OrbitControls y
el loader correspondiente; `three-viewport-gizmo` sólo se importa si está habilitado. El gizmo
comparte la cámara y OrbitControls del
visor, ofrece caras, aristas y esquinas, y se mantiene en fullscreen. `model3d.rotation.{x,y,z}`
permite rotación en grados y se convierte internamente a radianes; por ejemplo,
`{ "x": 180, "y": 0, "z": 0 }` corrige un STL invertido. Zoom, pan, órbita, autorrotación
configurable y errores visibles se mantienen. IGES directo queda fuera de alcance para V1.

Parámetros completos de un model3D dentro del json.

Cuando hay un archivo 3D:
```json
"model3d": {
  "enabled": true,
  "url": "https://files.geeksium.com/fusion360/006/modelo-006.stl",
  "format": "stl",
  "rotation": {
    "x": 0,
    "y": 0,
    "z": 0
  }
}
```

Cuando *NO* hay un archivo 3D:
```json
"model3d": {
  "enabled": false
}
```

### Imágenes raster locales

Las imágenes `.png`, `.jpg` y `.jpeg` renderizadas dentro de la app usan `NuxtImg` con salida WebP
cuando corresponde; los originales permanecen como fuente. No pasan por esta optimización los SVG,
iconos PWA, descargables ni URLs externas (incluido `files.geeksium.com`).

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
El modal usa una superficie azul marino con overlay y la imagen opcional
`/images/modals/donationGcModal.png`; si el archivo aún no existe, el color y gradiente conservan
el contraste sin impedir el build.

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
  con hash `CacheFirst`. Los iconos de la versión actual viven en `public/icons/pwa/` como
  `geeksium-icon-v1-192.png`, `geeksium-icon-v1-512.png` y
  `geeksium-icon-maskable-v1-512.png`; también se conserva la fuente 1024 bajo
  `geeksium-icon-v1-1024.png`. Un cambio futuro de branding debe crear los equivalentes `v2` y
  actualizar las URLs del manifest, sin sobrescribir `v1`. `manifest.webmanifest` no forma parte
  del patrón de precache y queda bajo la estrategia de red del origen para poder revalidarse.
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

Quiero que en el cuando estoy en el sitio "[https://cursos.geeksium.com/courses/fusion-360](https://cursos.geeksium.com/courses/fusion-360)", veo que sólo me aparecen las insignias completadas, pero quiero que me aparezcan también las insignias
