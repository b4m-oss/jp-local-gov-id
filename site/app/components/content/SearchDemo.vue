<script setup lang="ts">
import type { LocalGov, SearchTarget } from "@b4moss/jp-local-gov-id";

const { t } = useI18n();

const ready = ref(false);
const initError = ref<string | null>(null);
const prefectures = ref<LocalGov[]>([]);

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
  <div class="panel demo">
    <p v-if="initError" class="error-text">{{ initError }}</p>
    <p v-else-if="!ready" class="muted">{{ t("searchDemo.loading") }}</p>
    <template v-else>
      <p class="muted hint">{{ t("searchDemo.hint") }}</p>
      <div class="field">
        <label for="search-demo-query">{{ t("searchDemo.query") }}</label>
        <input
          id="search-demo-query"
          v-model="query"
          type="text"
          @keyup.enter="runSearch"
        >
      </div>
      <div class="grid">
        <div class="field">
          <label for="search-demo-pref">{{ t("searchDemo.prefecture") }}</label>
          <select id="search-demo-pref" v-model="prefecture">
            <option value="">
              {{ t("searchDemo.prefectureAll") }}
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
          <label for="search-demo-target">{{ t("searchDemo.target") }}</label>
          <select id="search-demo-target" v-model="target">
            <option value="all">
              {{ t("searchDemo.targetAll") }}
            </option>
            <option value="prefectures">
              {{ t("searchDemo.targetPrefectures") }}
            </option>
            <option value="cities">
              {{ t("searchDemo.targetCities") }}
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
        {{ t("searchDemo.run") }}
      </button>
      <h3 class="result-heading">{{ t("searchDemo.result") }}</h3>
      <p v-if="searchError" class="error-text">{{ searchError }}</p>
      <template v-else-if="searchResults">
        <p v-if="searchResults.length === 0" class="muted">
          {{ t("searchDemo.empty") }}
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
    </template>
  </div>
</template>

<style scoped>
.demo {
  margin: 1.25rem 0;
}

.hint {
  margin: 0 0 1rem;
  font-size: 0.9rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.result-heading {
  margin: 1rem 0 0.5rem;
  font-size: 1rem;
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
