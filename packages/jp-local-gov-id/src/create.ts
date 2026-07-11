import { getCachedData, setCachedData } from "./cache";
import { createLocalGovClient } from "./api";
import {
  LocalGovSchemaError,
  normalizeDatasetInput,
  validateIndexFile,
  validateMunicipalitiesFile,
  validatePrefecturesFile,
} from "./schema";
import { createStore } from "./store";
import type {
  CreateLocalGovOptions,
  LocalGovClient,
  LocalGovIndexFile,
} from "./types";

function hasData(
  options: CreateLocalGovOptions,
): options is { data: unknown; url?: never } {
  return "data" in options && options.data !== undefined;
}

function hasUrl(
  options: CreateLocalGovOptions,
): options is { url: string; data?: never } {
  return "url" in options && typeof options.url === "string";
}

function resolveSiblingUrl(indexUrl: string, relativePath: string): string {
  return new URL(relativePath, indexUrl).href;
}

function municipalitiesPath(
  index: LocalGovIndexFile,
  code: string,
): string {
  return index.paths.municipalitiesByPrefecture.replaceAll("{code}", code);
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch local gov data: ${response.status} ${response.statusText}`,
    );
  }

  let parsed: unknown;
  try {
    parsed = await response.json();
  } catch {
    throw new LocalGovSchemaError(
      "Failed to parse local gov data as JSON from URL",
    );
  }

  return parsed;
}

async function fetchAndCache<T>(
  url: string,
  validate: (data: unknown) => T,
  options?: { persist?: boolean },
): Promise<T> {
  const cached = getCachedData(url);
  if (cached !== null) {
    // Re-validate cached payloads so schema changes surface clearly
    return validate(cached);
  }

  const parsed = await fetchJson(url);
  const validated = validate(parsed);
  if (options?.persist !== false) {
    setCachedData(url, parsed);
  }
  return validated;
}

async function createFromUrl(indexUrl: string): Promise<LocalGovClient> {
  const index = await fetchAndCache(indexUrl, validateIndexFile);

  const prefecturesUrl = resolveSiblingUrl(
    indexUrl,
    index.paths.prefectures,
  );
  const prefecturesFile = await fetchAndCache(
    prefecturesUrl,
    validatePrefecturesFile,
  );

  const store = createStore(
    index,
    prefecturesFile.prefectures,
    async (code, loadOptions) => {
      const url = resolveSiblingUrl(
        indexUrl,
        municipalitiesPath(index, code),
      );
      const file = await fetchAndCache(url, validateMunicipalitiesFile, {
        persist: loadOptions?.persist,
      });
      return file.municipalities;
    },
  );

  return createLocalGovClient(store);
}

async function createFromData(data: unknown): Promise<LocalGovClient> {
  const input = normalizeDatasetInput(data);
  const index = validateIndexFile(input.index);
  const prefecturesFile = validatePrefecturesFile(input.prefectures);

  const store = createStore(
    index,
    prefecturesFile.prefectures,
    async (code) => {
      if (input.municipalitiesByCode && code in input.municipalitiesByCode) {
        const file = validateMunicipalitiesFile(
          input.municipalitiesByCode[code],
        );
        return file.municipalities;
      }

      if (input.loadMunicipalities) {
        const raw = await input.loadMunicipalities(code);
        const file = validateMunicipalitiesFile(raw);
        return file.municipalities;
      }

      throw new LocalGovSchemaError(
        `No municipalities data for prefecture ${code}: provide municipalitiesByCode or loadMunicipalities`,
      );
    },
  );

  return createLocalGovClient(store);
}

/**
 * Load index + prefectures, validate schemas, then return a client.
 * Municipality JSON is loaded lazily (concurrency 6 for nationwide search).
 * Pass either `{ data }` (dataset) or `{ url }` (versioned index.json URL).
 */
export async function createLocalGov(
  options: CreateLocalGovOptions,
): Promise<LocalGovClient> {
  if (!options || typeof options !== "object") {
    throw new TypeError(
      "createLocalGov requires options with either `data` or `url`",
    );
  }

  const dataProvided = hasData(options);
  const urlProvided = hasUrl(options);

  if (dataProvided && urlProvided) {
    throw new TypeError(
      "createLocalGov accepts either `data` or `url`, not both",
    );
  }

  if (!dataProvided && !urlProvided) {
    throw new TypeError(
      "createLocalGov requires either `data` or `url`",
    );
  }

  if (urlProvided) {
    return createFromUrl(options.url);
  }

  return createFromData(options.data);
}
