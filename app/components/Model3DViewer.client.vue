<script setup lang="ts">
import type { Material, Object3D, PerspectiveCamera, Scene, Texture, WebGLRenderer } from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { ViewportGizmo } from 'three-viewport-gizmo'
import type { Model3DConfig } from '~/types/content'

const props = defineProps<{ model: Model3DConfig; exerciseSlug: string }>()
const viewer = ref<HTMLElement | null>(null)
const container = ref<HTMLDivElement | null>(null)
const requested = ref(false)
const loading = ref(false)
const loaded = ref(false)
const failed = ref(false)
const fullscreen = ref(false)
const fullscreenSupported = ref(false)
const { t } = useI18n()
const analytics = useAnalytics()

let renderer: WebGLRenderer | null = null
let scene: Scene | null = null
let camera: PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let gizmo: ViewportGizmo | null = null
let modelRoot: Object3D | null = null
let frame = 0
let disposed = false
let onInteract: (() => void) | null = null
let onGizmoInteract: (() => void) | null = null

function disposeObject(root: Object3D | null) {
  root?.traverse((object) => {
    const mesh = object as Object3D & { geometry?: { dispose: () => void }; material?: Material | Material[] }
    mesh.geometry?.dispose()
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : []
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if ((value as Texture | undefined)?.isTexture) (value as Texture).dispose()
      }
      material.dispose()
    }
  })
}

const inferredFormat = computed<'stl' | 'glb' | 'gltf'>(() => {
  if (props.model.format) return props.model.format
  const pathname = (props.model.url || '').split(/[?#]/)[0]?.toLowerCase() || ''
  if (pathname.endsWith('.stl')) return 'stl'
  if (pathname.endsWith('.gltf')) return 'gltf'
  return 'glb'
})

const resize = () => {
  const el = container.value
  if (!el || !renderer || !camera || !el.clientWidth || !el.clientHeight) return
  camera.aspect = el.clientWidth / el.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(el.clientWidth, el.clientHeight)
  gizmo?.update()
}

const onFullscreenChange = () => {
  fullscreen.value = document.fullscreenElement === viewer.value
  requestAnimationFrame(resize)
}

const toggleFullscreen = async () => {
  if (!viewer.value || !fullscreenSupported.value) return
  try {
    if (document.fullscreenElement === viewer.value) await document.exitFullscreen()
    else await viewer.value.requestFullscreen()
  } catch {
    // El visor sigue disponible embebido si el navegador rechaza fullscreen.
  }
}

const loadModel = async () => {
  if (!props.model.enabled || !props.model.url || requested.value || disposed) return
  requested.value = true
  loading.value = true
  failed.value = false
  await nextTick()

  if (!container.value) {
    loading.value = false
    failed.value = true
    return
  }

  try {
    const [THREE, { OrbitControls: OrbitControlsClass }, { ViewportGizmo: ViewportGizmoClass }] = await Promise.all([
      import('three'),
      import('three/examples/jsm/controls/OrbitControls.js'),
      import('three-viewport-gizmo'),
    ])
    if (disposed || !container.value) return

    const el = container.value
    scene = new THREE.Scene()
    camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.01, 10000)
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    el.appendChild(renderer.domElement)

    scene.add(new THREE.HemisphereLight(0xffffff, 0x334155, 1.5))
    const key = new THREE.DirectionalLight(0xffffff, 2)
    key.position.set(4, 6, 5)
    scene.add(key)

    controls = new OrbitControlsClass(camera, renderer.domElement)
    controls.enableDamping = true
    controls.autoRotate = props.model.autoRotate === true

    gizmo = new ViewportGizmoClass(camera, renderer, {
      container: el,
      type: 'cube',
      size: 112,
      placement: 'top-right',
      offset: { top: 16, right: 16 },
      animated: true,
      speed: 1.25,
      className: 'geeksium-view-gizmo',
      background: { color: 0xf8fafc, opacity: 0.92 },
      corners: { enabled: true, color: 0x94a3b8, opacity: 0.9 },
      edges: { enabled: true, color: 0xcbd5e1, opacity: 0.9 },
      right: { label: t('viewCube.right') },
      left: { label: t('viewCube.left') },
      top: { label: t('viewCube.top') },
      bottom: { label: t('viewCube.bottom') },
      front: { label: t('viewCube.front') },
      back: { label: t('viewCube.back') },
    })
    gizmo.attachControls(controls)
    const gizmoElement = el.querySelector<HTMLElement>('.geeksium-view-gizmo')
    gizmoElement?.setAttribute('role', 'group')
    gizmoElement?.setAttribute('aria-label', t('viewCube.label'))
    gizmoElement?.setAttribute('title', t('viewCube.label'))

    onGizmoInteract = () => {
      if (!controls) return
      controls.autoRotate = false
      analytics.trackModel3dInteraction(props.exerciseSlug, 'orientation_gizmo')
    }
    gizmo.addEventListener('start', onGizmoInteract)

    let interacted = false
    onInteract = () => {
      if (interacted || !controls) return
      interacted = true
      controls.autoRotate = false
      analytics.trackModel3dInteraction(props.exerciseSlug, 'orbit')
    }
    renderer.domElement.addEventListener('pointerdown', onInteract)
    renderer.domElement.addEventListener('wheel', onInteract, { passive: true })

    const attachModel = (object: Object3D) => {
      if (disposed || !scene || !camera || !controls) {
        disposeObject(object)
        return
      }

      const rotation = props.model.rotation
      object.rotation.set(
        THREE.MathUtils.degToRad(rotation?.x ?? 0),
        THREE.MathUtils.degToRad(rotation?.y ?? 0),
        THREE.MathUtils.degToRad(rotation?.z ?? 0),
      )
      object.updateMatrixWorld(true)

      modelRoot = object
      scene.add(object)
      const box = new THREE.Box3().setFromObject(object)
      const center = box.getCenter(new THREE.Vector3())
      const dimensions = box.getSize(new THREE.Vector3())
      object.position.sub(center)
      const size = Math.max(dimensions.x, dimensions.y, dimensions.z, 0.1)
      const distance = (size / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) * 1.5
      camera.position.set(distance, distance * 0.65, distance)
      camera.near = Math.max(distance / 1000, 0.001)
      camera.far = distance * 100
      camera.updateProjectionMatrix()
      controls.target.set(0, 0, 0)
      controls.update()
      loading.value = false
      loaded.value = true
      analytics.trackModel3dInteraction(props.exerciseSlug, 'load')
    }

    const failLoad = () => {
      if (disposed) return
      loading.value = false
      failed.value = true
    }

    if (inferredFormat.value === 'stl') {
      const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js')
      if (disposed) return
      new STLLoader().load(
        props.model.url,
        (geometry) => {
          geometry.computeVertexNormals()
          attachModel(new THREE.Mesh(
            geometry,
            new THREE.MeshStandardMaterial({ color: 0x4f86f7, roughness: 0.65, metalness: 0.1 }),
          ))
        },
        undefined,
        failLoad,
      )
    } else {
      const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')
      if (disposed) return
      new GLTFLoader().load(props.model.url, (gltf) => attachModel(gltf.scene), undefined, failLoad)
    }

    const render = () => {
      if (disposed || !renderer || !scene || !camera || !controls) return
      frame = requestAnimationFrame(render)
      controls.update()
      renderer.render(scene, camera)
      gizmo?.render()
    }
    render()
  } catch {
    if (!disposed) {
      loading.value = false
      failed.value = true
    }
  }
}

onMounted(() => {
  if (!props.model.enabled || !props.model.url) return
  fullscreenSupported.value = Boolean(document.fullscreenEnabled && viewer.value?.requestFullscreen)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  window.addEventListener('resize', resize, { passive: true })
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(frame)
  window.removeEventListener('resize', resize)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
  if (renderer?.domElement && onInteract) {
    renderer.domElement.removeEventListener('pointerdown', onInteract)
    renderer.domElement.removeEventListener('wheel', onInteract)
  }
  if (gizmo && onGizmoInteract) gizmo.removeEventListener('start', onGizmoInteract)
  gizmo?.detachControls()
  gizmo?.dispose()
  controls?.dispose()
  disposeObject(modelRoot)
  renderer?.dispose()
  renderer?.domElement.remove()
  renderer = null
  scene = null
  camera = null
  controls = null
  gizmo = null
  modelRoot = null
})
</script>

<template>
  <section v-if="model.enabled && model.url" ref="viewer" class="viewer surface-card relative overflow-hidden dark:bg-ink-950">
    <div class="flex items-center justify-between border-b border-ink-200 px-4 py-3 dark:border-ink-800">
      <h2 class="text-sm font-bold uppercase tracking-wide muted-text">{{ t('exercise.model3d') }}</h2>
      <button v-if="fullscreenSupported && loaded && !failed" type="button" class="rounded-md p-1.5 text-ink-600 hover:bg-ink-100 focus-visible:outline dark:text-ink-300 dark:hover:bg-ink-800" :aria-label="fullscreen ? t('exercise.exitFullscreen') : t('exercise.fullscreen')" @click="toggleFullscreen">
        <span aria-hidden="true">{{ fullscreen ? '×' : '⛶' }}</span>
      </button>
    </div>

    <div v-if="!requested" class="grid h-48 place-items-center bg-ink-50 p-4 dark:bg-ink-900">
      <button type="button" class="course-button rounded-lg px-4 py-2 text-sm font-semibold text-white" @click="loadModel">
        {{ t('exercise.loadModel3d') }}
      </button>
    </div>
    <div v-else>
      <div v-show="!failed" ref="container" class="viewer-canvas relative h-72 w-full bg-ink-50 dark:bg-ink-900" />
      <p v-if="loading" class="p-4 text-center text-sm muted-text" role="status">{{ t('exercise.loadingModel3d') }}</p>
      <p v-if="failed" class="p-6 text-center text-sm text-red-600 dark:text-red-400" role="alert">{{ t('exercise.model3dError') }}</p>
      <p v-if="loaded" class="px-4 py-2 text-xs muted-text">{{ t('exercise.model3dHint') }}</p>
    </div>
  </section>
</template>

<style scoped>
.viewer:fullscreen { width: 100vw; height: 100vh; border-radius: 0; }
.viewer:fullscreen .viewer-canvas { height: calc(100vh - 5.25rem); }
</style>
