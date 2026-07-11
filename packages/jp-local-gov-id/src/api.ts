import { normalizeLookupCode, normalizePrefectureCode } from "./normalize";
import type { LocalGovStore } from "./store";
import type {
  LocalGov,
  LocalGovClient,
  SearchOptions,
  SearchTarget,
} from "./types";

function resolvePrefectureCode(
  store: LocalGovStore,
  pref: string,
): string | null {
  const asCode = normalizePrefectureCode(pref);
  if (asCode && store.prefectureByCode.has(asCode)) return asCode;

  const byName = store.prefectureByName.get(pref);
  return byName?.code ?? null;
}

function needsMunicipalities(target: SearchTarget): boolean {
  return target === "all" || target === "cities";
}

async function collectByTarget(
  store: LocalGovStore,
  target: SearchTarget,
  prefectureCode?: string,
): Promise<LocalGov[]> {
  const prefs =
    target === "cities"
      ? []
      : prefectureCode
        ? store.prefectures.filter((p) => p.code === prefectureCode)
        : [...store.prefectures];

  let munis: LocalGov[] = [];
  if (needsMunicipalities(target)) {
    if (prefectureCode) {
      await store.ensureMunicipalities([prefectureCode]);
      munis = [...(store.getMunicipalities(prefectureCode) ?? [])];
    } else {
      // Nationwide search: keep in memory only; do not write localStorage
      await store.ensureMunicipalities(store.allPrefectureCodes, {
        persist: false,
      });
      munis = store.allPrefectureCodes.flatMap(
        (code) => store.getMunicipalities(code) ?? [],
      );
    }
  }

  return [...prefs, ...munis];
}

export function createLocalGovClient(store: LocalGovStore): LocalGovClient {
  return {
    listPrefectures(): LocalGov[] {
      return [...store.prefectures];
    },

    getPrefectureCode(name: string): string | null {
      return store.prefectureByName.get(name)?.code ?? null;
    },

    async getMunicipalitiesByPrefecture(pref: string): Promise<LocalGov[]> {
      const code = resolvePrefectureCode(store, pref);
      if (!code) return [];
      await store.ensureMunicipalities([code]);
      return [...(store.getMunicipalities(code) ?? [])];
    },

    async getByCode(code: string): Promise<LocalGov | null> {
      const normalized = normalizeLookupCode(code);
      if (!normalized) return null;

      if (normalized.kind === "prefecture") {
        return store.prefectureByCode.get(normalized.code) ?? null;
      }

      const prefCode = normalized.code.slice(0, 2);
      if (!store.prefectureByCode.has(prefCode)) return null;

      await store.ensureMunicipalities([prefCode]);
      return store.getMunicipalityByCode(normalized.code) ?? null;
    },

    async search(
      name: string,
      options?: SearchOptions,
    ): Promise<LocalGov[]> {
      const target = options?.target ?? "all";
      const prefectureCode = options?.prefecture
        ? resolvePrefectureCode(store, options.prefecture)
        : undefined;

      if (options?.prefecture && !prefectureCode) return [];

      const items = await collectByTarget(
        store,
        target,
        prefectureCode ?? undefined,
      );
      return items.filter((item) => item.name.includes(name));
    },

    async getCodeByName(
      name: string,
      options?: SearchOptions,
    ): Promise<string | null> {
      const target = options?.target ?? "all";
      const prefectureCode = options?.prefecture
        ? resolvePrefectureCode(store, options.prefecture)
        : undefined;

      if (options?.prefecture && !prefectureCode) return null;

      const items = await collectByTarget(
        store,
        target,
        prefectureCode ?? undefined,
      );
      const matches = items.filter((item) => item.name === name);

      if (matches.length !== 1) return null;
      return matches[0]?.code ?? null;
    },
  };
}
