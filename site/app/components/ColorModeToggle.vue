<script setup lang="ts">
const { t } = useI18n();
const colorMode = useColorMode();

const preference = computed({
  get: () => colorMode.preference,
  set: (value: string) => {
    colorMode.preference = value;
  },
});
</script>

<template>
  <label class="theme">
    <span class="sr-only">{{ t("theme.label") }}</span>
    <select v-model="preference">
      <option value="system">{{ t("theme.system") }}</option>
      <option value="light">{{ t("theme.light") }}</option>
      <option value="dark">{{ t("theme.dark") }}</option>
    </select>
  </label>
</template>

<style scoped>
.theme select {
  font: inherit;
  font-size: 0.875rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: 0.35rem;
  background: var(--color-surface);
  color: var(--color-ink);
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
}
</style>
