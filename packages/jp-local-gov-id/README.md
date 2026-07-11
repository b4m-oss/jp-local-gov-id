# @b4moss/jp-local-gov-id

[日本語](./README_ja.md)

JS API for Japan’s nationwide local government codes. Data is **not** bundled — pass `@b4moss/jp-local-gov-id-data` or a versioned index URL.

## Install

```bash
npm install @b4moss/jp-local-gov-id @b4moss/jp-local-gov-id-data
# or API only:
npm install @b4moss/jp-local-gov-id
```

## Usage

`createLocalGov` is async. Either `data` or `url` (a **versioned URL** to **index.json**) is required.

On init it loads only the index and prefectures; municipalities are lazy-loaded per prefecture. Nationwide string search fetches unloaded prefecture JSON with concurrency of 6.

```ts
import { createLocalGov } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGov({ data: dataset });

client.listPrefectures();
client.getPrefectureCode("大阪府"); // "27"
await client.getMunicipalitiesByPrefecture("13");
await client.getByCode("131016");
await client.search("中央", { prefecture: "01", target: "cities" });
await client.getCodeByName("千代田区"); // "131016"
```

Fetch from a versioned index URL:

```ts
const client = await createLocalGov({
  url: "https://example.com/jp-local-gov-id-data/0.2.0/index.json",
});
```

- When `url` is set, fetched files are cached in localStorage (key = file URL, TTL 1 year)
- Exception: municipality JSON loaded by **nationwide** string search is kept in memory only (not written to localStorage)
- Environments without localStorage (e.g. Node) skip caching
- Schema mismatches / invalid JSON raise `LocalGovSchemaError`; network / HTTP failures are normal fetch errors
- Missing or ambiguous query results return `null` / `[]` (they do not throw)

## Code formats

| Target | Format | Accepted input |
|--------|--------|----------------|
| Prefecture | 2-digit half-width digits | With or without zero-padding (`"1"` / `"01"`) |
| Municipality | 6 digits including check digit | 6 digits is the canonical form |

## License

MIT

See the [monorepo README](../../README.md) for data layout, versioning, and development notes.
