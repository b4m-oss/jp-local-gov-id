import {
  MUNICIPALITY_FETCH_CONCURRENCY,
  mapWithConcurrency,
} from "./pool";
import type { LocalGov, LocalGovIndexFile } from "./types";

export type LoadMunicipalitiesFn = (
  code: string,
) => Promise<readonly LocalGov[]>;

export type LocalGovStore = {
  index: LocalGovIndexFile;
  prefectures: readonly LocalGov[];
  prefectureByCode: ReadonlyMap<string, LocalGov>;
  prefectureByName: ReadonlyMap<string, LocalGov>;
  ensureMunicipalities: (codes: readonly string[]) => Promise<void>;
  getMunicipalities: (code: string) => readonly LocalGov[] | undefined;
  getMunicipalityByCode: (code: string) => LocalGov | undefined;
  allPrefectureCodes: readonly string[];
};

export function createStore(
  index: LocalGovIndexFile,
  prefectures: readonly LocalGov[],
  loadMunicipalities: LoadMunicipalitiesFn,
): LocalGovStore {
  const prefectureByCode = new Map(
    prefectures.map((p) => [p.code, p] as const),
  );
  const prefectureByName = new Map(
    prefectures.map((p) => [p.name, p] as const),
  );

  const municipalitiesByPrefectureCode = new Map<string, readonly LocalGov[]>();
  const municipalityByCode = new Map<string, LocalGov>();
  const inFlight = new Map<string, Promise<void>>();

  const allPrefectureCodes =
    index.prefectureCodes.length > 0
      ? index.prefectureCodes
      : prefectures.map((p) => p.code);

  async function loadOne(code: string): Promise<void> {
    if (municipalitiesByPrefectureCode.has(code)) return;

    const existing = inFlight.get(code);
    if (existing) {
      await existing;
      return;
    }

    const promise = (async () => {
      const list = await loadMunicipalities(code);
      municipalitiesByPrefectureCode.set(code, list);
      for (const m of list) {
        municipalityByCode.set(m.code, m);
      }
    })().finally(() => {
      inFlight.delete(code);
    });

    inFlight.set(code, promise);
    await promise;
  }

  async function ensureMunicipalities(
    codes: readonly string[],
  ): Promise<void> {
    const needed = codes.filter((c) => !municipalitiesByPrefectureCode.has(c));
    if (needed.length === 0) return;

    await mapWithConcurrency(
      needed,
      MUNICIPALITY_FETCH_CONCURRENCY,
      async (code) => {
        await loadOne(code);
      },
    );
  }

  return {
    index,
    prefectures,
    prefectureByCode,
    prefectureByName,
    ensureMunicipalities,
    getMunicipalities: (code) => municipalitiesByPrefectureCode.get(code),
    getMunicipalityByCode: (code) => municipalityByCode.get(code),
    allPrefectureCodes,
  };
}
