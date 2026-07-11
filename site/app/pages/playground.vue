<script setup lang="ts">
import type { LocalGov, SearchTarget } from "@b4moss/jp-local-gov-id";

const { t } = useI18n();

const ready = ref(false);
const initError = ref<string | null>(null);
const prefectures = ref<LocalGov[]>([]);

const code = ref("131016");
const codeResult = ref<LocalGov | null | undefined>(undefined);
const codeError = ref<string | null>(null);
const codePending = ref(false);

const query = ref("中央");
const prefecture = ref("");
const target = ref<SearchTarget>("cities");
const searchResults = ref<LocalGov[] | null>(null);
const searchError = ref<string | null>(null);
const searchPending = ref(false);

onMounted(async () => {
  try {
    const client = await useLocalGovClient();
    prefectures.value = client.listPrefectures();
    ready.value = true;
  } catch (e) {
    initError.value = e instanceof Error ? e.message : String(e);
  }
});

async function lookupCode() {
  codePending.value = true;
  codeError.value = null;
  try {
    const client = await useLocalGovClient();
    codeResult.value = await client.getByCode(code.value.trim());
  } catch (e) {
    codeError.value = e instanceof Error ? e.message : String(e);
    codeResult.value = undefined;
  } finally {
    codePending.value = false;
  }
}

async function runSearch() {
  searchPending.value = true;
  searchError.value = null;
  try {
    const client = await useLocalGovClient();
    searchResults.value = await client.searchByText(query.value.trim(), {
      prefecture: prefecture.value || undefined,
      target: target.value,
    });
  } catch (e) {
    searchError.value = e instanceof Error ? e.message : String(e);
    searchResults.value = null;
  } finally {
    searchPending.value = false;
  }
}
</script>

<template>
  <div>
    <header class="intro">
      <h1>{{ t("playground.title") }}</h1>
      <p class="muted">{{ t("playground.description") }}</p>
    </header>

    <p v-if="initError" class="error-text">{{ initError }}</p>
    <p v-else-if="!ready" class="muted">{{ t("playground.loading") }}</p>

    <template v-else>
      <section class="panel section">
        <h2>{{ t("playground.codeLookup") }}</h2>
        <p class="muted hint">{{ t("playground.codeLookupHint") }}</p>
        <div class="field">
          <label for="pg-code">{{ t("playground.query") }}</label>
          <div class="row">
            <input
              id="pg-code"
              v-model="code"
              type="text"
              @keyup.enter="lookupCode"
            >
            <button
              class="btn"
              type="button"
              :disabled="codePending"
              @click="lookupCode"
            >
              {{ t("playground.run") }}
            </button>
          </div>
        </div>
        <h3>{{ t("playground.result") }}</h3>
        <p v-if="codeError" class="error-text">{{ codeError }}</p>
        <pre v-else-if="codeResult">{{ JSON.stringify(codeResult, null, 2) }}</pre>
        <p v-else-if="codeResult === null" class="muted">
          {{ t("playground.empty") }}
        </p>
      </section>

      <section class="panel section">
        <h2>{{ t("playground.search") }}</h2>
        <p class="muted hint">{{ t("playground.searchHint") }}</p>
        <div class="field">
          <label for="pg-query">{{ t("playground.query") }}</label>
          <input
            id="pg-query"
            v-model="query"
            type="text"
            @keyup.enter="runSearch"
          >
        </div>
        <div class="grid">
          <div class="field">
            <label for="pg-pref">{{ t("playground.prefecture") }}</label>
            <select id="pg-pref" v-model="prefecture">
              <option value="">
                {{ t("playground.prefectureAll") }}
              </option>
              <option
                v-for="p in prefectures"
                :key="p.code"
                :value="p.code"
              >
                {{ p.code }} — {{ p.name }}
              </option>
            </select>
          </div>
          <div class="field">
            <label for="pg-target">{{ t("playground.target") }}</label>
            <select id="pg-target" v-model="target">
              <option value="all">
                {{ t("playground.targetAll") }}
              </option>
              <option value="prefectures">
                {{ t("playground.targetPrefectures") }}
              </option>
              <option value="cities">
                {{ t("playground.targetCities") }}
              </option>
            </select>
          </div>
        </div>
        <button
          class="btn"
          type="button"
          :disabled="searchPending"
          @click="runSearch"
        >
          {{ t("playground.run") }}
        </button>
        <h3>{{ t("playground.result") }}</h3>
        <p v-if="searchError" class="error-text">{{ searchError }}</p>
        <template v-else-if="searchResults">
          <p v-if="searchResults.length === 0" class="muted">
            {{ t("playground.empty") }}
          </p>
          <div v-else class="table-wrap">
            <table class="result-table">
              <thead>
                <tr>
                  <th>code</th>
                  <th>name</th>
                  <th>nameKana</th>
                  <th>prefecture</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="row in searchResults" :key="row.code">
                  <td><code>{{ row.code }}</code></td>
                  <td>{{ row.name }}</td>
                  <td>{{ row.nameKana }}</td>
                  <td>{{ row.prefectureCode }} {{ row.prefectureName }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </section>
    </template>
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
  margin-bottom: 1.5rem;
}

.section {
  margin-bottom: 1.25rem;
}

.section h2 {
  margin: 0 0 0.35rem;
  font-size: 1.2rem;
}

.section h3 {
  margin: 1rem 0 0.5rem;
  font-size: 1rem;
}

.hint {
  margin: 0 0 1rem;
  font-size: 0.9rem;
}

.row {
  display: flex;
  gap: 0.5rem;
}

.row input {
  flex: 1;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.table-wrap {
  overflow-x: auto;
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
