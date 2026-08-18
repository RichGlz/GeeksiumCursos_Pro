<script setup lang="ts">
import type { Material, Object3D, PerspectiveCamera, Scene, Texture, WebGLRenderer } from 'three'
import type { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import type { Model3DConfig } from '~/types/content'

const props = defineProps<{ model: Model3DConfig; exerciseSlug: string }>()
const viewer = ref<HTMLElement | null>(null)
const container = ref<HTMLDivElement | null>(null)
const failed = ref(false)
const fullscreen = ref(false)
const fullscreenSupported = ref(false)
const { t } = useI18n()
const analytics = useAnalytics()

let renderer: WebGLRenderer | null = null
let scene: Scene | null = null
let camera: PerspectiveCamera | null = null
let controls: OrbitControls | null = null
let modelRoot: Object3D | null = null
let frame = 0
let disposed = false
let onInteract: (() => void) | null = null

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

const inferredFormat = computed(() => {
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
    // El visor continúa usable embebido cuando el navegador rechaza fullscreen.
  }
}

onMounted(async () => {
  if (!props.model.enabled || !props.model.url) return
  await nextTick()
  if (!container.value) {
    failed.value = true
    return
  }
  fullscreenSupported.value = Boolean(document.fullscreenEnabled && viewer.value?.requestFullscreen)
  document.addEventListener('fullscreenchange', onFullscreenChange)
  window.addEventListener('resize', resize, { passive: true })

  try {
    const THREE = await import('three')
    const { OrbitControls: OrbitControlsClass } = await import('three/examples/jsm/controls/OrbitControls.js')
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
      analytics.trackModel3dInteraction(props.exerciseSlug, 'load')
    }

    const failLoad = () => { if (!disposed) failed.value = true }
    if (inferredFormat.value === 'stl') {
      const { STLLoader } = await import('three/examples/jsm/loaders/STLLoader.js')
      if (disposed) return
      new STLLoader().load(props.model.url, (geometry) => {
        geometry.computeVertexNormals()
        geometry.center()
        attachModel(new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x4f86f7, roughness: 0.65, metalness: 0.1 })))
      }, undefined, failLoad)
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
    }
    render()
  } catch {
    if (!disposed) failed.value = true
  }
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
  controls?.dispose()
  disposeObject(modelRoot)
  renderer?.dispose()
  renderer?.domElement.remove()
  renderer = null
  scene = null
  camera = null
  controls = null
  modelRoot = null
})
</script>

<template>
  <section v-if="model.enabled && model.url" ref="viewer" class="viewer surface-card relative overflow-hidden dark:bg-ink-950">
    <div class="flex items-center justify-between border-b border-ink-200 px-4 py-3 dark:border-ink-800">
      <h2 class="text-sm font-bold uppercase tracking-wide muted-text">{{ t('exercise.model3d') }}</h2>
      <button v-if="fullscreenSupported && !failed" type="button" class="rounded-md p-1.5 text-ink-600 hover:bg-ink-100 focus-visible:outline dark:text-ink-300 dark:hover:bg-ink-800" :aria-label="fullscreen ? t('exercise.exitFullscreen') : t('exercise.fullscreen')" @click="toggleFullscreen">
        <span aria-hidden="true">{{ fullscreen ? '×' : '⛶' }}</span>
      </button>
    </div>
    <div v-show="!failed" ref="container" class="viewer-canvas h-72 w-full bg-ink-50 dark:bg-ink-900" />
    <p v-if="failed" class="p-6 text-center text-sm text-red-600 dark:text-red-400">{{ t('exercise.model3dError') }}</p>
    <p v-else class="px-4 py-2 text-xs muted-text">{{ t('exercise.model3dHint') }}</p>
  </section>
</template>

<style scoped>
.viewer:fullscreen { width: 100vw; height: 100vh; border-radius: 0; }
.viewer:fullscreen .viewer-canvas { height: calc(100vh - 5.25rem); }
</style>
