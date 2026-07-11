<script setup lang="ts">
import type { ConsoleEntry } from "~/components/playground/runPlaygroundCode";
import type { PlaygroundTemplateId } from "~/components/playground/templates";
import {
  PLAYGROUND_TEMPLATES,
  getTemplateById,
} from "~/components/playground/templates";

const { t } = useI18n();

useSeoMeta({
  title: () => t("playground.title"),
  description: () => t("playground.description"),
});

const templateId = ref<PlaygroundTemplateId>("getByCode");
const code = ref(getTemplateById("getByCode").code);
const entries = ref<ConsoleEntry[]>([]);
const running = ref(false);
const sandboxHost = ref<HTMLElement | null>(null);
const isMac = ref(false);

let abortController: AbortController | null = null;
let runInflight = false;

const PlaygroundEditor = defineAsyncComponent(() =>
  import("~/components/playground/PlaygroundEditor.vue"),
);
const PlaygroundOutput = defineAsyncComponent(() =>
  import("~/components/playground/PlaygroundOutput.vue"),
);

const runShortcutLabel = computed(() =>
  isMac.value
    ? t("playground.runShortcutMac")
    : t("playground.runShortcutOther"),
);

function onTemplateChange() {
  code.value = getTemplateById(templateId.value).code;
}

function onGlobalKeydown(event: KeyboardEvent) {
  if (event.key !== "Enter") return;
  if (!(event.metaKey || event.ctrlKey)) return;
  event.preventDefault();
  void run();
}

onMounted(() => {
  isMac.value =
    /Mac|iPhone|iPad|iPod/.test(navigator.platform) ||
    navigator.userAgent.includes("Mac");
  window.addEventListener("keydown", onGlobalKeydown);
});

async function run() {
  if (!import.meta.client || !sandboxHost.value || runInflight) return;

  runInflight = true;
  abortController?.abort();
  abortController = new AbortController();
  const signal = abortController.signal;

  entries.value = [];
  running.value = true;

  const { runPlaygroundCode, createConsoleEntry } = await import(
    "~/components/playground/runPlaygroundCode"
  );

  try {
    await runPlaygroundCode({
      code: code.value,
      host: sandboxHost.value,
      signal,
      onEvent(event) {
        if (signal.aborted) return;
        if (event.type === "console") {
          entries.value = [
            ...entries.value,
            createConsoleEntry(event.level, event.args),
          ];
        } else if (event.type === "error") {
          entries.value = [
            ...entries.value,
            createConsoleEntry("error", [event.message]),
          ];
        }
      },
    });
  } catch (e) {
    if (signal.aborted) return;
    const message = e instanceof Error ? e.message : String(e);
    let display = message;
    if (message.startsWith("Illegal import:")) {
      const m = message.match(/Illegal import:\s*"([^"]+)"/);
      display = t("playground.illegalImport", {
        source: m?.[1] ?? "?",
      });
    }
    entries.value = [
      ...entries.value,
      createConsoleEntry("error", [display]),
    ];
  } finally {
    runInflight = false;
    if (!signal.aborted) running.value = false;
  }
}

onBeforeUnmount(() => {
  abortController?.abort();
  window.removeEventListener("keydown", onGlobalKeydown);
});
</script>

<template>
  <div class="playground-page">
    <header class="intro">
      <h1>{{ t("playground.title") }}</h1>
      <p class="muted">{{ t("playground.description") }}</p>
    </header>

    <div class="toolbar panel">
      <div class="field template-field">
        <label for="pg-template">{{ t("playground.template") }}</label>
        <select
          id="pg-template"
          v-model="templateId"
          @change="onTemplateChange"
        >
          <option
            v-for="tmpl in PLAYGROUND_TEMPLATES"
            :key="tmpl.id"
            :value="tmpl.id"
          >
            {{ t(`playground.templates.${tmpl.labelKey}`) }}
          </option>
        </select>
      </div>
    </div>

    <div class="workspace">
      <section class="pane editor-pane">
        <ClientOnly>
          <PlaygroundEditor v-model="code" @run="run" />
          <template #fallback>
            <pre class="code-fallback">{{ code }}</pre>
          </template>
        </ClientOnly>
      </section>
      <div class="run-bar">
        <button
          class="btn"
          type="button"
          :disabled="running"
          :aria-keyshortcuts="isMac ? 'Meta+Enter' : 'Control+Enter'"
          @click="run"
        >
          {{ t("playground.run") }}
          <kbd class="shortcut">{{ runShortcutLabel }}</kbd>
        </button>
      </div>
      <section class="pane output-pane">
        <PlaygroundOutput :entries="entries" :running="running" />
      </section>
    </div>

    <div ref="sandboxHost" class="sandbox-host" aria-hidden="true" />

    <DocsPager />
  </div>
</template>

<style scoped>
.intro h1 {
  margin: 0 0 0.4rem;
  font-size: 2rem;
  letter-spacing: -0.02em;
}

.intro {
  margin-bottom: 1.25rem;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem 1rem;
  margin-bottom: 1rem;
  padding: 0.85rem 1rem;
}

.template-field {
  flex: 1;
  min-width: 12rem;
  margin-bottom: 0;
}

.workspace {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.pane {
  min-width: 0;
}

.editor-pane {
  display: flex;
  flex-direction: column;
  min-height: 22rem;
}

.editor-pane > :deep(.editor-root) {
  flex: 1;
  min-height: 22rem;
}

.run-bar {
  display: flex;
  justify-content: center;
}

.run-bar .btn {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
}

.shortcut {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.1rem 0.4rem;
  border: 1px solid color-mix(in srgb, currentColor 35%, transparent);
  border-radius: 0.25rem;
  background: color-mix(in srgb, currentColor 8%, transparent);
}

.code-fallback {
  margin: 0;
  min-height: 20rem;
  padding: 1rem 1.15rem;
  border-radius: 0.5rem;
  background: #0d1117;
  color: #e6edf3;
  white-space: pre-wrap;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.55;
}

.sandbox-host {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
