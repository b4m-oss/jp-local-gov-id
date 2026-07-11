<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  run: [];
}>();

const root = ref<HTMLElement | null>(null);
let view: import("@codemirror/view").EditorView | null = null;

onMounted(async () => {
  const [
    { EditorView, basicSetup },
    { EditorState },
    { javascript },
    { keymap },
    { HighlightStyle, syntaxHighlighting },
    { tags: t },
  ] = await Promise.all([
    import("codemirror"),
    import("@codemirror/state"),
    import("@codemirror/lang-javascript"),
    import("@codemirror/view"),
    import("@codemirror/language"),
    import("@lezer/highlight"),
  ]);

  // Match site `pre` / Shiki github-dark code fences
  const darkHighlight = HighlightStyle.define([
    { tag: t.comment, color: "#8b949e" },
    { tag: t.keyword, color: "#ff7b72" },
    { tag: [t.string, t.special(t.string)], color: "#a5d6ff" },
    { tag: t.number, color: "#79c0ff" },
    { tag: [t.bool, t.null], color: "#79c0ff" },
    { tag: t.operator, color: "#ff7b72" },
    { tag: t.className, color: "#f0883e" },
    { tag: [t.definition(t.variableName), t.function(t.variableName)], color: "#d2a8ff" },
    { tag: t.variableName, color: "#e6edf3" },
    { tag: t.propertyName, color: "#79c0ff" },
    { tag: t.typeName, color: "#f0883e" },
    { tag: t.punctuation, color: "#e6edf3" },
    { tag: t.meta, color: "#8b949e" },
  ]);

  const extensions = [
    basicSetup,
    javascript({ typescript: true }),
    syntaxHighlighting(darkHighlight),
    keymap.of([
      {
        key: "Mod-Enter",
        run: () => {
          emit("run");
          return true;
        },
      },
    ]),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        emit("update:modelValue", update.state.doc.toString());
      }
    }),
    EditorView.theme(
      {
        "&": {
          height: "100%",
          fontSize: "0.875rem",
          fontFamily: "var(--font-mono)",
          backgroundColor: "#0d1117",
          color: "#e6edf3",
        },
        ".cm-scroller": {
          fontFamily: "var(--font-mono)",
          overflow: "auto",
          lineHeight: "1.55",
        },
        ".cm-content": {
          caretColor: "#e6edf3",
        },
        "&.cm-focused": {
          outline: "none",
        },
        ".cm-gutters": {
          backgroundColor: "#0d1117",
          color: "#8b949e",
          border: "none",
          borderRight: "1px solid #21262d",
        },
        ".cm-activeLine": {
          backgroundColor: "#161b22",
        },
        ".cm-activeLineGutter": {
          backgroundColor: "#161b22",
          color: "#e6edf3",
        },
        ".cm-selectionBackground, &.cm-focused .cm-selectionBackground": {
          backgroundColor: "#264f78 !important",
        },
        ".cm-cursor": {
          borderLeftColor: "#e6edf3",
        },
      },
      { dark: true },
    ),
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
  border-radius: 0.5rem;
  background: #0d1117;
  color: #e6edf3;
}

.editor-root :deep(.cm-editor) {
  height: 100%;
}
</style>
