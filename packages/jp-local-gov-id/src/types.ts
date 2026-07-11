export type LocalGov = {
  code: string;
  name: string;
  nameKana: string;
  prefectureCode: string;
  prefectureName: string;
  prefectureNameKana: string;
};

export type SearchTarget = "all" | "prefectures" | "cities";

export type SearchOptions = {
  prefecture?: string;
  target?: SearchTarget;
};

/** Index file (`index.json`) */
export type LocalGovIndexFile = {
  schemaVersion: number;
  source?: string;
  asOf?: string;
  generatedAt?: string;
  counts?: {
    prefectures?: number;
    municipalities?: number;
    designatedCityWardsAdded?: number;
  };
  paths: {
    prefectures: string;
    municipalitiesByPrefecture: string;
  };
  prefectureCodes: string[];
};

/** Prefectures-only file (`prefectures.json`) */
export type LocalGovPrefecturesFile = {
  schemaVersion: number;
  asOf?: string;
  prefectures: LocalGov[];
};

/** Per-prefecture municipalities file (`prefectures/{code}.json`) */
export type LocalGovMunicipalitiesFile = {
  schemaVersion: number;
  asOf?: string;
  prefectureCode: string;
  municipalities: LocalGov[];
};

/**
 * In-memory / npm dataset passed to `createLocalGov({ data })`.
 * Municipalities are resolved via `municipalitiesByCode` and/or `loadMunicipalities`.
 */
export type LocalGovDataset = {
  index: LocalGovIndexFile | unknown;
  prefectures: LocalGovPrefecturesFile | unknown;
  municipalitiesByCode?: Record<string, LocalGovMunicipalitiesFile | unknown>;
  loadMunicipalities?: (
    code: string,
  ) =>
    | LocalGovMunicipalitiesFile
    | unknown
    | Promise<LocalGovMunicipalitiesFile | unknown>;
};

export type CreateLocalGovOptions =
  | { data: LocalGovDataset | unknown; url?: never }
  | { url: string; data?: never };

export type LocalGovClient = {
  listPrefectures(): LocalGov[];
  getPrefectureCode(name: string): string | null;
  getMunicipalitiesByPrefecture(pref: string): Promise<LocalGov[]>;
  getByCode(code: string): Promise<LocalGov | null>;
  search(name: string, options?: SearchOptions): Promise<LocalGov[]>;
  getCodeByName(name: string, options?: SearchOptions): Promise<string | null>;
};

/** @deprecated Use LocalGovIndexFile / split file types. Kept for export compatibility. */
export type LocalGovDataFile = LocalGovDataset;
