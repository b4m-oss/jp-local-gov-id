<script setup lang="ts">
import type { LocalGov } from "@b4moss/jp-local-gov-id";

const { t } = useI18n();
const code = ref("131016");
const result = ref<LocalGov | null | undefined>(undefined);
const error = ref<string | null>(null);
const pending = ref(false);

async function resolve() {
  pending.value = true;
  error.value = null;
  try {
    const client = await useLocalGovClient();
    result.value = await client.getByCode(code.value.trim());
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e);
    result.value = undefined;
  } finally {
    pending.value = false;
  }
}
</script>

<template>
  <div class="panel demo">
    <div class="field">
      <label for="demo-code">{{ t("codeLookupDemo.label") }}</label>
      <div class="row">
        <input
          id="demo-code"
          v-model="code"
          type="text"
          :placeholder="t('codeLookupDemo.placeholder')"
          @keyup.enter="resolve"
        >
        <button class="btn" type="button" :disabled="pending" @click="resolve">
          {{ t("codeLookupDemo.run") }}
        </button>
      </div>
    </div>
    <p v-if="error" class="error-text">{{ error }}</p>
    <pre v-else-if="result">{{ JSON.stringify(result, null, 2) }}</pre>
    <p v-else-if="result === null" class="muted">
      {{ t("codeLookupDemo.empty") }}
    </p>
  </div>
</template>

<style scoped>
.demo {
  margin: 1.25rem 0;
}

.row {
  display: flex;
  gap: 0.5rem;
}

.row input {
  flex: 1;
}
</style>
