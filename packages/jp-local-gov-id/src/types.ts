export type LocalGov = {
  code: string;
  name: string;
  nameKana: string;
  prefectureCode: string;
  prefectureName: string;
  prefectureNameKana: string;
};

export type SearchTarget = "all" | "prefectures" | "cities";

export type MatchField = "name" | "nameKana" | "both";

export type SearchOptions = {
  prefecture?: string;
  target?: SearchTarget;
  /** Default: "both" */
  matchField?: MatchField;
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
 * In-memory / npm dataset passed to `createLocalGovClient({ data })`.
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
  | {
      url: string;
      data?: never;
      /** Default: true. Only applies to `url` mode. */
      cache?: boolean;
      /** Default: 1 year in ms. Only applies when cache is enabled. */
      cacheTtlMs?: number;
    };

export type LocalGovClient = {
  listPrefectures(): LocalGov[];
  getPrefectureByCode(code: string): LocalGov | null;
  getPrefectureCodeByName(name: string): string | null;
  listMunicipalitiesByPrefecture(pref: string): Promise<LocalGov[]>;
  getMunicipalityByCode(code: string): Promise<LocalGov | null>;
  getByCode(code: string): Promise<LocalGov | null>;
  searchByText(text: string, options?: SearchOptions): Promise<LocalGov[]>;
  getLocalGovCodeByName(
    name: string,
    options?: SearchOptions,
  ): Promise<string | null>;
};

/** @deprecated Use LocalGovIndexFile / split file types. Kept for export compatibility. */
export type LocalGovDataFile = LocalGovDataset;
