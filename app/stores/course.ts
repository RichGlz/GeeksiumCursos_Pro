import { defineStore } from 'pinia'

/** Curso activo (sólo el identificador; el contenido vive en el motor de contenido). */
export const useCourseStore = defineStore('course', {
  state: (): { activeCourseSlug: string | null; activeExerciseSlug: string | null } => ({
    activeCourseSlug: null,
    activeExerciseSlug: null,
  }),
  actions: {
    setActive(courseSlug: string | null, exerciseSlug: string | null = null) {
      this.activeCourseSlug = courseSlug
      this.activeExerciseSlug = exerciseSlug
    },
  },
})
