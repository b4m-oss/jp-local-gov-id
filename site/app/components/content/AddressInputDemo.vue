<script setup lang="ts">
import type { DesignatedCityMode, LocalGov } from "@b4moss/jp-local-gov-id";

const { t } = useI18n();

const ready = ref(false);
const initError = ref<string | null>(null);
const prefectures = ref<LocalGov[]>([]);
const municipalities = ref<LocalGov[]>([]);
const prefectureCode = ref("");
const municipalityCode = ref("");
const designatedCity = ref<DesignatedCityMode>("both");
const muniPending = ref(false);
const muniError = ref<string | null>(null);

const selectedMunicipality = computed(
  () => municipalities.value.find((m) => m.code === municipalityCode.value) ?? null,
);

onMounted(async () => {
  try {
    const client = await useLocalGovClient();
    prefectures.value = client.listPrefectures();
    ready.value = true;
  } catch (e) {
    initError.value = e instanceof Error ? e.message : String(e);
  }
});

async function loadMunicipalities() {
  municipalityCode.value = "";
  municipalities.value = [];
  muniError.value = null;

  if (!prefectureCode.value) return;

  muniPending.value = true;
  try {
    const client = await useLocalGovClient();
    municipalities.value = await client.listMunicipalitiesByPrefecture(
      prefectureCode.value,
      { designatedCity: designatedCity.value },
    );
  } catch (e) {
    muniError.value = e instanceof Error ? e.message : String(e);
  } finally {
    muniPending.value = false;
  }
}

async function onPrefectureChange() {
  await loadMunicipalities();
}

async function onDesignatedCityChange() {
  if (!prefectureCode.value) return;
  await loadMunicipalities();
}
</script>

<template>
  <div class="panel demo">
    <p v-if="initError" class="error-text">{{ initError }}</p>
    <p v-else-if="!ready" class="muted">{{ t("addressInputDemo.loading") }}</p>
    <template v-else>
      <div class="field">
        <label for="address-pref">{{ t("addressInputDemo.prefecture") }}</label>
        <select
          id="address-pref"
          v-model="prefectureCode"
          @change="onPrefectureChange"
        >
          <option value="">
            {{ t("addressInputDemo.prefecturePlaceholder") }}
          </option>
          <option
            v-for="pref in prefectures"
            :key="pref.code"
            :value="pref.code"
          >
            {{ pref.name }}
          </option>
        </select>
      </div>
      <div class="field">
        <label for="address-designated-city">
          {{ t("addressInputDemo.designatedCity") }}
        </label>
        <select
          id="address-designated-city"
          v-model="designatedCity"
          @change="onDesignatedCityChange"
        >
          <option value="both">
            {{ t("addressInputDemo.designatedCityBoth") }}
          </option>
          <option value="city">
            {{ t("addressInputDemo.designatedCityCity") }}
          </option>
          <option value="ward">
            {{ t("addressInputDemo.designatedCityWard") }}
          </option>
        </select>
      </div>
      <div class="field">
        <label for="address-muni">{{ t("addressInputDemo.municipality") }}</label>
        <select
          id="address-muni"
          v-model="municipalityCode"
          :disabled="!prefectureCode || muniPending"
        >
          <option value="">
            {{
              muniPending
                ? t("addressInputDemo.loadingMunicipalities")
                : t("addressInputDemo.municipalityPlaceholder")
            }}
          </option>
          <option
            v-for="muni in municipalities"
            :key="muni.code"
            :value="muni.code"
          >
            {{ muni.name }}
          </option>
        </select>
      </div>
      <p v-if="muniError" class="error-text">{{ muniError }}</p>
      <pre v-else-if="selectedMunicipality">{{
        JSON.stringify(selectedMunicipality, null, 2)
      }}</pre>
    </template>
  </div>
</template>

<style scoped>
.demo {
  margin: 1.25rem 0;
}
</style>
