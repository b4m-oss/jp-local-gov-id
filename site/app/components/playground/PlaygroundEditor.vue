<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const root = ref<HTMLElement | null>(null);
let view: import("@codemirror/view").EditorView | null = null;

onMounted(async () => {
  const [{ EditorView, basicSetup }, { EditorState }, { javascript }] =
    await Promise.all([
      import("codemirror"),
      import("@codemirror/state"),
      import("@codemirror/lang-javascript"),
    ]);

  const extensions = [
    basicSetup,
    javascript({ typescript: true }),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        emit("update:modelValue", update.state.doc.toString());
      }
    }),
    EditorView.theme({
      "&": {
        height: "100%",
        fontSize: "0.875rem",
        fontFamily: "var(--font-mono)",
      },
      ".cm-scroller": {
        fontFamily: "var(--font-mono)",
        overflow: "auto",
      },
      "&.cm-focused": {
        outline: "none",
      },
    }),
  ];

  const state = EditorState.create({
    doc: props.modelValue,
    extensions,
  });

  view = new EditorView({
    state,
    parent: root.value!,
  });
});

watch(
  () => props.modelValue,
  (next) => {
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === next) return;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: next },
    });
  },
);

onBeforeUnmount(() => {
  view?.destroy();
  view = null;
});
</script>

<template>
  <div ref="root" class="editor-root" />
</template>

<style scoped>
.editor-root {
  height: 100%;
  min-height: 20rem;
  overflow: hidden;
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-surface);
}

.editor-root :deep(.cm-editor) {
  height: 100%;
}

.editor-root :deep(.cm-gutters) {
  background: color-mix(in srgb, var(--color-surface) 85%, var(--color-border));
  border-right: 1px solid var(--color-border);
  color: var(--color-muted);
}

.editor-root :deep(.cm-activeLineGutter),
.editor-root :deep(.cm-activeLine) {
  background: color-mix(in srgb, var(--color-accent-soft) 70%, transparent);
}
</style>
