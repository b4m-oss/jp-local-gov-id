export type LocalGov = {
  code: string;
  name: string;
  nameKana: string;
  prefectureCode: string;
  prefectureName: string;
  prefectureNameKana: string;
};

export type LocalGovIndex = {
  schemaVersion: number;
  source: string;
  asOf: string;
  generatedAt: string;
  counts: {
    prefectures: number;
    municipalities: number;
    designatedCityWardsAdded: number;
  };
  paths: {
    prefectures: string;
    municipalitiesByPrefecture: string;
  };
  prefectureCodes: string[];
};

export type LocalGovPrefectures = {
  schemaVersion: number;
  asOf: string;
  prefectures: LocalGov[];
};

export type LocalGovMunicipalities = {
  schemaVersion: number;
  asOf: string;
  prefectureCode: string;
  municipalities: LocalGov[];
};

export declare const index: LocalGovIndex;
export declare const prefectures: LocalGovPrefectures;
export declare const municipalitiesByCode: Record<
  string,
  LocalGovMunicipalities
>;

export declare function loadMunicipalities(
  code: string,
): Promise<LocalGovMunicipalities>;

declare const dataset: {
  index: LocalGovIndex;
  prefectures: LocalGovPrefectures;
  municipalitiesByCode: Record<string, LocalGovMunicipalities>;
  loadMunicipalities: (code: string) => Promise<LocalGovMunicipalities>;
};

export default dataset;
