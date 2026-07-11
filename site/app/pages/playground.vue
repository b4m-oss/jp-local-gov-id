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

let abortController: AbortController | null = null;

const PlaygroundEditor = defineAsyncComponent(() =>
  import("~/components/playground/PlaygroundEditor.vue"),
);
const PlaygroundOutput = defineAsyncComponent(() =>
  import("~/components/playground/PlaygroundOutput.vue"),
);

function onTemplateChange() {
  code.value = getTemplateById(templateId.value).code;
}

async function run() {
  if (!import.meta.client || !sandboxHost.value) return;

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
    if (!signal.aborted) running.value = false;
  }
}

onBeforeUnmount(() => {
  abortController?.abort();
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
      <button
        class="btn"
        type="button"
        :disabled="running"
        @click="run"
      >
        {{ t("playground.run") }}
      </button>
    </div>

    <div class="workspace">
      <section class="pane editor-pane">
        <ClientOnly>
          <PlaygroundEditor v-model="code" />
          <template #fallback>
            <pre class="code-fallback">{{ code }}</pre>
          </template>
        </ClientOnly>
      </section>
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
  min-height: 28rem;
}

.pane {
  min-width: 0;
  min-height: 28rem;
}

.editor-pane,
.output-pane {
  display: flex;
  flex-direction: column;
}

.editor-pane > :deep(.editor-root),
.output-pane > :deep(.output) {
  flex: 1;
}

.code-fallback {
  margin: 0;
  min-height: 20rem;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: var(--color-surface);
  color: var(--color-ink);
  white-space: pre-wrap;
}

.sandbox-host {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}
</style>
