import { afterEach, describe, expect, it, vi } from "vitest";
import dataset from "@b4moss/jp-local-gov-id-data";
import { createLocalGov } from "./create";
import { CACHE_TTL_MS } from "./cache";
import { MUNICIPALITY_FETCH_CONCURRENCY } from "./pool";
import { LocalGovSchemaError } from "./schema";
import type { LocalGovClient, LocalGovIndexFile } from "./types";

async function client(): Promise<LocalGovClient> {
  return createLocalGov({ data: dataset });
}

const indexUrl =
  "https://cdn.example.com/jp-local-gov-id-data/0.2.0/index.json";

function fileMap(): Map<string, unknown> {
  const map = new Map<string, unknown>();
  map.set(indexUrl, dataset.index);
  map.set(
    "https://cdn.example.com/jp-local-gov-id-data/0.2.0/prefectures.json",
    dataset.prefectures,
  );
  for (const [code, file] of Object.entries(dataset.municipalitiesByCode)) {
    map.set(
      `https://cdn.example.com/jp-local-gov-id-data/0.2.0/prefectures/${code}.json`,
      file,
    );
  }
  return map;
}

describe("createLocalGov", () => {
  it("requires data or url", async () => {
    await expect(
      createLocalGov({} as { data: unknown }),
    ).rejects.toThrow(/data|url/);
  });

  it("rejects both data and url", async () => {
    await expect(
      createLocalGov({ data: dataset, url: indexUrl } as never),
    ).rejects.toThrow(/either/);
  });

  it("throws LocalGovSchemaError for invalid shape", async () => {
    await expect(createLocalGov({ data: { foo: 1 } })).rejects.toBeInstanceOf(
      LocalGovSchemaError,
    );
    await expect(createLocalGov({ data: null })).rejects.toBeInstanceOf(
      LocalGovSchemaError,
    );
    await expect(
      createLocalGov({
        data: {
          index: { schemaVersion: 1 },
          prefectures: { schemaVersion: 1, prefectures: [{ code: 1 }] },
        },
      }),
    ).rejects.toBeInstanceOf(LocalGovSchemaError);
  });

  it("throws LocalGovSchemaError for unsupported schemaVersion", async () => {
    await expect(
      createLocalGov({
        data: {
          index: {
            ...(dataset.index as LocalGovIndexFile),
            schemaVersion: 999,
          },
          prefectures: dataset.prefectures,
        },
      }),
    ).rejects.toBeInstanceOf(LocalGovSchemaError);
  });
});

describe("listPrefectures", () => {
  it("returns all 47 prefectures", async () => {
    const prefs = (await client()).listPrefectures();
    expect(prefs).toHaveLength(47);
    expect(prefs.map((p) => p.code)).toContain("13");
    expect(prefs.find((p) => p.code === "13")?.name).toBe("東京都");
  });
});

describe("getPrefectureCode", () => {
  it("returns 2-digit code for an exact prefecture name", async () => {
    const c = await client();
    expect(c.getPrefectureCode("東京都")).toBe("13");
    expect(c.getPrefectureCode("北海道")).toBe("01");
  });

  it("returns null when not found", async () => {
    const c = await client();
    expect(c.getPrefectureCode("東京")).toBeNull();
    expect(c.getPrefectureCode("存在しない県")).toBeNull();
  });
});

describe("getMunicipalitiesByPrefecture", () => {
  it("accepts name, padded code, and unpadded code", async () => {
    const c = await client();
    const byName = await c.getMunicipalitiesByPrefecture("北海道");
    const byPadded = await c.getMunicipalitiesByPrefecture("01");
    const byUnpadded = await c.getMunicipalitiesByPrefecture("1");

    expect(byName.length).toBeGreaterThan(0);
    expect(byPadded).toEqual(byName);
    expect(byUnpadded).toEqual(byName);
  });

  it("includes designated city body and ward", async () => {
    const munis = await (await client()).getMunicipalitiesByPrefecture("01");
    expect(munis.find((m) => m.code === "011002")?.name).toBe("札幌市");
    expect(munis.find((m) => m.code === "011011")?.name).toBe("札幌市中央区");
  });

  it("returns empty array when prefecture is unknown", async () => {
    const c = await client();
    expect(await c.getMunicipalitiesByPrefecture("99")).toEqual([]);
    expect(await c.getMunicipalitiesByPrefecture("存在しない県")).toEqual([]);
  });
});

describe("getByCode", () => {
  it("resolves prefecture by 2-digit and unpadded code", async () => {
    const c = await client();
    expect((await c.getByCode("13"))?.name).toBe("東京都");
    expect((await c.getByCode("1"))?.name).toBe("北海道");
    expect((await c.getByCode("01"))?.name).toBe("北海道");
  });

  it("resolves municipality by 6-digit code", async () => {
    expect((await (await client()).getByCode("131016"))?.name).toBe("千代田区");
  });

  it("resolves designated city body and ward", async () => {
    const c = await client();
    expect((await c.getByCode("271004"))?.name).toBe("大阪市");
    expect((await c.getByCode("011011"))?.name).toBe("札幌市中央区");
  });

  it("returns null when not found", async () => {
    const c = await client();
    expect(await c.getByCode("999999")).toBeNull();
    expect(await c.getByCode("")).toBeNull();
    expect(await c.getByCode("123")).toBeNull();
  });
});

describe("search", () => {
  it("partial-matches names", async () => {
    const hits = await (await client()).search("千代田");
    expect(hits.some((h) => h.code === "131016" && h.name === "千代田区")).toBe(
      true,
    );
  });

  it("filters by target prefectures", async () => {
    const hits = await (await client()).search("大阪", {
      target: "prefectures",
    });
    expect(hits).toHaveLength(1);
    expect(hits[0]?.name).toBe("大阪府");
  });

  it("filters by target cities", async () => {
    const hits = await (await client()).search("大阪", { target: "cities" });
    expect(hits.every((h) => h.code.length === 6)).toBe(true);
    expect(hits.some((h) => h.name === "大阪市")).toBe(true);
    expect(hits.some((h) => h.name === "大阪府")).toBe(false);
  });

  it("filters by prefecture with unpadded code", async () => {
    const hits = await (await client()).search("中央", {
      prefecture: "1",
      target: "cities",
    });
    expect(hits.some((h) => h.name === "札幌市中央区")).toBe(true);
    expect(hits.every((h) => h.prefectureCode === "01")).toBe(true);
  });

  it("returns empty array when nothing matches", async () => {
    const c = await client();
    expect(await c.search("存在しない自治体名xyz")).toEqual([]);
    expect(await c.search("区", { prefecture: "99" })).toEqual([]);
  });
});

describe("getCodeByName", () => {
  it("returns code for a unique exact match", async () => {
    const c = await client();
    expect(await c.getCodeByName("千代田区")).toBe("131016");
    expect(await c.getCodeByName("札幌市中央区")).toBe("011011");
    expect(await c.getCodeByName("東京都", { target: "prefectures" })).toBe(
      "13",
    );
  });

  it("returns null when multiple exact hits exist", async () => {
    const c = await client();
    expect(await c.getCodeByName("府中市")).toBeNull();
    expect(await c.getCodeByName("伊達市")).toBeNull();
  });

  it("returns code when prefecture filter makes the match unique", async () => {
    const c = await client();
    expect(await c.getCodeByName("府中市", { prefecture: "13" })).toBe(
      "132063",
    );
    expect(await c.getCodeByName("府中市", { prefecture: "34" })).toBe(
      "342084",
    );
  });

  it("returns null for partial names (exact match only)", async () => {
    const c = await client();
    expect(await c.getCodeByName("千代田")).toBeNull();
    expect(await c.getCodeByName("東京")).toBeNull();
  });

  it("returns null when not found", async () => {
    const c = await client();
    expect(await c.getCodeByName("存在しない市")).toBeNull();
    expect(
      await c.getCodeByName("千代田区", { prefecture: "01" }),
    ).toBeNull();
  });
});

describe("createLocalGov url + cache + lazy load", () => {
  const store = new Map<string, string>();

  afterEach(() => {
    vi.unstubAllGlobals();
    store.clear();
  });

  function stubLocalStorage() {
    const localStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    };
    vi.stubGlobal("localStorage", localStorage);
  }

  function stubFetch(files: Map<string, unknown>) {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const body = files.get(url);
      if (body === undefined) {
        return {
          ok: false,
          status: 404,
          statusText: "Not Found",
          json: async () => {
            throw new Error("no body");
          },
        };
      }
      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => body,
      };
    });
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  }

  it("fetches index + prefectures on init, municipalities lazily", async () => {
    stubLocalStorage();
    const files = fileMap();
    const fetchMock = stubFetch(files);

    const c = await createLocalGov({ url: indexUrl });
    expect(c.listPrefectures()).toHaveLength(47);
    // index + prefectures only
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(store.has(indexUrl)).toBe(true);

    const cached = JSON.parse(store.get(indexUrl)!);
    expect(cached.expiresAt).toBeGreaterThan(Date.now());
    expect(cached.expiresAt).toBeLessThanOrEqual(
      Date.now() + CACHE_TTL_MS + 1000,
    );
    expect(cached.data.schemaVersion).toBe(1);

    expect((await c.getByCode("131016"))?.name).toBe("千代田区");
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(
      fetchMock.mock.calls.some((call) =>
        String(call[0]).endsWith("/prefectures/13.json"),
      ),
    ).toBe(true);

    // Second getByCode for same pref should not re-fetch
    expect((await c.getByCode("131024"))?.name).toBe("中央区");
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("nationwide search fetches unloaded prefectures with concurrency 6", async () => {
    stubLocalStorage();
    const files = fileMap();
    let inFlight = 0;
    let maxInFlight = 0;

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);
      const body = files.get(url);
      if (body === undefined) {
        return { ok: false, status: 404, statusText: "Not Found" };
      }

      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await new Promise((r) => setTimeout(r, 5));
      inFlight -= 1;

      return {
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => body,
      };
    });
    vi.stubGlobal("fetch", fetchMock);

    const c = await createLocalGov({ url: indexUrl });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const hits = await c.search("中央", { target: "cities" });
    expect(hits.some((h) => h.name === "札幌市中央区")).toBe(true);
    expect(hits.some((h) => h.name === "中央区")).toBe(true);

    // 2 init + 47 prefecture municipality files
    expect(fetchMock).toHaveBeenCalledTimes(2 + 47);
    expect(maxInFlight).toBe(MUNICIPALITY_FETCH_CONCURRENCY);
    expect(MUNICIPALITY_FETCH_CONCURRENCY).toBe(6);
  });

  it("prefectures-only search does not fetch municipality files", async () => {
    stubLocalStorage();
    const fetchMock = stubFetch(fileMap());

    const c = await createLocalGov({ url: indexUrl });
    const hits = await c.search("東京", { target: "prefectures" });
    expect(hits).toHaveLength(1);
    expect(hits[0]?.name).toBe("東京都");
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("propagates HTTP errors without caching", async () => {
    stubLocalStorage();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 404,
        statusText: "Not Found",
      }),
    );

    await expect(createLocalGov({ url: indexUrl })).rejects.toThrow(/404/);
    expect(store.has(indexUrl)).toBe(false);
  });

  it("treats invalid JSON as schema error", async () => {
    stubLocalStorage();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        statusText: "OK",
        json: async () => {
          throw new SyntaxError("Unexpected token");
        },
      }),
    );

    await expect(createLocalGov({ url: indexUrl })).rejects.toBeInstanceOf(
      LocalGovSchemaError,
    );
  });

  it("skips cache when localStorage is unavailable", async () => {
    vi.stubGlobal("localStorage", undefined);
    const fetchMock = stubFetch(fileMap());

    const c = await createLocalGov({ url: indexUrl });
    expect(c.listPrefectures()).toHaveLength(47);

    await createLocalGov({ url: indexUrl });
    // Each init: index + prefectures
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("reuses cached index on second createLocalGov", async () => {
    stubLocalStorage();
    const fetchMock = stubFetch(fileMap());

    await createLocalGov({ url: indexUrl });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    await createLocalGov({ url: indexUrl });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
