export { EmitterShapeBase } from '@tsparticles/plugin-emitters/plugin'

interface EmittersEngine {
  pluginManager: {
    addEmitterShapeGenerator?: unknown
  }
}

/**
 * @tsparticles/plugin-emitters 4.3.2 exports this guard from its full entry,
 * which also imports an absent optional interactivity peer. Ribbons only needs
 * the simple emitter plugin, so keep the official guard without that branch.
 */
export function ensureEmittersPluginLoaded(engine: EmittersEngine): void {
  if (!engine.pluginManager.addEmitterShapeGenerator) {
    throw new Error('tsParticles Emitters Plugin is not loaded')
  }
}
