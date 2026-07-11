import apiSource from "../../../../packages/jp-local-gov-id/dist/jp-local-gov-id.js?raw";
import dataset from "@b4moss/jp-local-gov-id-data";

export function buildPackageSources(): { api: string; data: string } {
  const { index, prefectures, municipalitiesByCode } = dataset;
  const dataSource = `const index = ${JSON.stringify(index)};
const prefectures = ${JSON.stringify(prefectures)};
const municipalitiesByCode = ${JSON.stringify(municipalitiesByCode)};
export { index, prefectures, municipalitiesByCode };
export function loadMunicipalities(code) {
  const padded = String(code).padStart(2, "0");
  const file = municipalitiesByCode[padded];
  if (!file) {
    return Promise.reject(new Error("Unknown prefecture code: " + padded));
  }
  return Promise.resolve(file);
}
const dataset = { index, prefectures, municipalitiesByCode, loadMunicipalities };
export default dataset;
`;

  return {
    api: apiSource,
    data: dataSource,
  };
}
