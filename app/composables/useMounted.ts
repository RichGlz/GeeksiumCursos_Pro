/** true sólo tras la hidratación; evita desajustes SSR con estado del navegador. */
export function useMounted() {
  const mounted = ref(false)
  onMounted(() => {
    mounted.value = true
  })
  return mounted
}
