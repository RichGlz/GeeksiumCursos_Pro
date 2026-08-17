<script setup lang="ts">
import type { Model3DConfig } from '~/types/content'

/**
 * Visor 3D ligero (Three.js) cargado sólo en cliente y bajo demanda.
 * Si el modelo no existe o WebGL no está disponible, el resto del ejercicio
 * sigue funcionando con normalidad.
 */
const props = defineProps<{ model: Model3DConfig; exerciseSlug: string }>()

const container = ref<HTMLDivElement | null>(null)
const failed = ref(false)
const { t } = useI18n()
const analytics = useAnalytics()

let dispose: (() => void) | null = null

onMounted(async () => {
  if (!props.model.enabled || !props.model.url || !container.value) return
  try {
    const THREE = await import('three')
    const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js')
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js')

    const el = container.value
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 1000)
    camera.position.set(3, 2, 4)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(el.clientWidth, el.clientHeight)
    el.appendChild(renderer.domElement)

    scene.add(new THREE.AmbientLight(0xffffff, 1.1))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(4, 6, 5)
    scene.add(key)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.autoRotate = props.model.autoRotate !== false

    let interacted = false
    const onInteract = () => {
      if (interacted) return
      interacted = true
      controls.autoRotate = false
      analytics.trackModel3dInteraction(props.exerciseSlug, 'orbit')
    }
    renderer.domElement.addEventListener('pointerdown', onInteract)
    renderer.domElement.addEventListener('wheel', onInteract, { passive: true })

    const loader = new GLTFLoader()
    loader.load(
      props.model.url,
      (gltf) => {
        scene.add(gltf.scene)
        const box = new THREE.Box3().setFromObject(gltf.scene)
        const center = box.getCenter(new THREE.Vector3())
        gltf.scene.position.sub(center)
        const size = box.getSize(new THREE.Vector3()).length() || 1
        camera.position.setLength(size * 1.2)
        controls.update()
        analytics.trackModel3dInteraction(props.exerciseSlug, 'load')
      },
      undefined,
      () => {
        failed.value = true
      },
    )

    let frame = 0
    const render = () => {
      frame = requestAnimationFrame(render)
      controls.update()
      renderer.render(scene, camera)
    }
    render()

    const onResize = () => {
      if (!el.clientWidth) return
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(el.clientWidth, el.clientHeight)
    }
    window.addEventListener('resize', onResize)

    dispose = () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('pointerdown', onInteract)
      controls.dispose()
      renderer.dispose()
      el.innerHTML = ''
    }
  } catch {
    failed.value = true
  }
})

onBeforeUnmount(() => dispose?.())
</script>

<template>
  <section v-if="model.enabled && model.url && !failed" class="surface-card overflow-hidden">
    <h2 class="border-b border-ink-200 px-4 py-3 text-sm font-bold uppercase tracking-wide muted-text dark:border-ink-800">
      {{ t('exercise.model3d') }}
    </h2>
    <div ref="container" class="h-72 w-full bg-ink-50 dark:bg-ink-900" />
    <p class="px-4 py-2 text-xs muted-text">{{ t('exercise.model3dHint') }}</p>
  </section>
</template>
