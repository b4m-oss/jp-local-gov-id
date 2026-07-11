/** Cache TTL for URL-fetched data: 1 year. */
export const CACHE_TTL_MS = 365 * 24 * 60 * 60 * 1000;

type CacheEntry = {
  expiresAt: number;
  data: unknown;
};

function getLocalStorage(): Storage | null {
  try {
    if (typeof globalThis.localStorage === "undefined") return null;
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function isCacheEntry(value: unknown): value is CacheEntry {
  if (value === null || typeof value !== "object") return false;
  const o = value as Record<string, unknown>;
  return typeof o.expiresAt === "number" && "data" in o;
}

/** Read cached JSON for a versioned URL. Returns null on miss / expiry / unavailable. */
export function getCachedData(url: string): unknown | null {
  const storage = getLocalStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(url);
    if (raw == null) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isCacheEntry(parsed)) {
      storage.removeItem(url);
      return null;
    }

    if (Date.now() >= parsed.expiresAt) {
      storage.removeItem(url);
      return null;
    }

    return parsed.data;
  } catch {
    try {
      storage.removeItem(url);
    } catch {
      // ignore
    }
    return null;
  }
}

/** Store fetch result under the versioned URL key. No-op without localStorage. */
export function setCachedData(
  url: string,
  data: unknown,
  ttlMs: number = CACHE_TTL_MS,
): void {
  const storage = getLocalStorage();
  if (!storage) return;

  const entry: CacheEntry = {
    expiresAt: Date.now() + ttlMs,
    data,
  };

  try {
    storage.setItem(url, JSON.stringify(entry));
  } catch {
    // QuotaExceeded or private mode — skip cache
  }
}
