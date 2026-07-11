<script setup lang="ts">
import type { ConsoleEntry } from "./runPlaygroundCode";

defineProps<{
  entries: ConsoleEntry[];
  running?: boolean;
}>();

const { t } = useI18n();

function formatArgs(args: unknown[]): string {
  return args
    .map((arg) => {
      if (typeof arg === "string") return arg;
      try {
        return JSON.stringify(arg, null, 2);
      } catch {
        return String(arg);
      }
    })
    .join(" ");
}
</script>

<template>
  <div class="output">
    <div class="output-header">
      <span>{{ t("playground.output") }}</span>
      <span v-if="running" class="muted running">{{ t("playground.running") }}</span>
    </div>
    <div class="output-body" role="log" aria-live="polite">
      <p v-if="entries.length === 0 && !running" class="muted empty">
        {{ t("playground.outputEmpty") }}
      </p>
      <div
        v-for="entry in entries"
        :key="entry.id"
        class="entry"
        :class="`level-${entry.level}`"
      >
        <span class="level">{{ entry.level }}</span>
        <pre class="message">{{ formatArgs(entry.args) }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.output {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 20rem;
  border: 1px solid var(--color-border);
  border-radius: 0.4rem;
  background: #0d1117;
  color: #e6edf3;
  overflow: hidden;
}

.output-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.55rem 0.85rem;
  border-bottom: 1px solid #30363d;
  font-size: 0.8rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  text-transform: uppercase;
  color: #9aa8b5;
}

.running {
  text-transform: none;
  font-weight: 500;
}

.output-body {
  flex: 1;
  overflow: auto;
  padding: 0.65rem 0.85rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.5;
}

.empty {
  margin: 0;
}

.entry {
  display: grid;
  grid-template-columns: 4.5rem 1fr;
  gap: 0.5rem;
  padding: 0.25rem 0;
  border-bottom: 1px solid #21262d;
}

.level {
  color: #8b949e;
  font-size: 0.75rem;
  text-transform: uppercase;
  padding-top: 0.15rem;
}

.message {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  background: transparent;
  color: inherit;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
}

.level-warn .level,
.level-warn .message {
  color: #d4a72c;
}

.level-error .level,
.level-error .message,
.level-system .message {
  color: #f07178;
}

.level-info .level {
  color: #58a6ff;
}
</style>
