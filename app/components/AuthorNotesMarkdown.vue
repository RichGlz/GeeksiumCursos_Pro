<script setup lang="ts">
import MarkdownIt from 'markdown-it'

const props = defineProps<{ markdown?: string; fallback?: string[] }>()

const parser = new MarkdownIt({ html: false, linkify: true, typographer: false })
parser.renderer.rules.link_open = (tokens, index, options, _env, renderer) => {
  const token = tokens[index]
  token?.attrSet('target', '_blank')
  token?.attrSet('rel', 'noopener noreferrer')
  return renderer.renderToken(tokens, index, options)
}
const rendered = computed(() => (props.markdown ? parser.render(props.markdown) : ''))
</script>

<template>
  <section v-if="rendered || fallback?.length" class="author-notes mt-8">
    <h2 class="mb-4 text-xl font-bold text-ink-900 dark:text-white">
      {{ $t('exercise.authorNotes') }}
    </h2>
    <!-- MarkdownIt genera únicamente HTML desde Markdown; la entrada HTML está deshabilitada. -->
    <div v-if="rendered" class="author-notes__content" v-html="rendered" />
    <ul v-else class="list-disc space-y-2 pl-5 text-ink-700 dark:text-ink-200">
      <li v-for="(note, index) in fallback" :key="`${index}-${note}`">{{ note }}</li>
    </ul>
  </section>
</template>

<style scoped>
.author-notes__content :deep(h2),
.author-notes__content :deep(h3),
.author-notes__content :deep(h4) { margin: 1.75rem 0 0.75rem; font-weight: 700; color: var(--color-ink-900); }
.author-notes__content :deep(h2) { font-size: 1.25rem; }
.author-notes__content :deep(h3) { font-size: 1.125rem; }
.author-notes__content :deep(h4) { font-size: 1rem; }
.author-notes__content :deep(p) { margin: 0.75rem 0; line-height: 1.75; }
.author-notes__content :deep(ul), .author-notes__content :deep(ol) { margin: 0.75rem 0; padding-left: 1.5rem; }
.author-notes__content :deep(ul) { list-style: disc; }
.author-notes__content :deep(ol) { list-style: decimal; }
.author-notes__content :deep(li + li) { margin-top: 0.25rem; }
.author-notes__content :deep(a) { color: var(--course-md-link, var(--color-brand-600)); font-weight: 500; text-decoration: underline; text-underline-offset: 2px; }
.author-notes__content :deep(img) { display: block; max-width: 100%; height: auto; margin: 1.25rem 0; border-radius: 0.75rem; }
.author-notes__content :deep(blockquote) { margin: 1rem 0; padding-left: 1rem; border-left: 4px solid var(--course-md-quote-border, var(--color-brand-300)); font-style: italic; }
.author-notes__content :deep(code) { border-radius: 0.25rem; background: var(--course-md-inline-bg, color-mix(in srgb, var(--color-brand-600) 10%, white)); padding: 0.125rem 0.375rem; color: var(--course-md-inline-text, var(--color-brand-700)); font-family: monospace; font-size: 0.875rem; }
.author-notes__content :deep(pre) { margin: 1rem 0; overflow-x: auto; border-radius: 0.75rem; background: var(--course-md-block-bg, #080b10); padding: 1rem; color: var(--course-md-block-text, #ccc); }
.author-notes__content :deep(pre code) { background: transparent; padding: 0; color: inherit; }
.author-notes__content :deep(hr) { margin: 2rem 0; border-color: var(--color-ink-200); }
:global(.dark) .author-notes__content :deep(h2),
:global(.dark) .author-notes__content :deep(h3),
:global(.dark) .author-notes__content :deep(h4) { color: white; }
:global(.dark) .author-notes__content :deep(pre code) { background: transparent; color: inherit; }
:global(.dark) .author-notes__content :deep(hr) { border-color: var(--color-ink-700); }
</style>
