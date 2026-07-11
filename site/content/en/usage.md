---
title: Usage
description: Client setup and basic operations
---

# Usage

`createLocalGovClient` is async. Either `data` or `url` (a **versioned URL** to **index.json**) is required.

On init it loads only the index and prefectures; municipalities are lazy-loaded per prefecture. Nationwide string search fetches unloaded prefecture JSON with concurrency 6.

## Minimal example

```ts
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGovClient({ data: dataset });

client.listPrefectures();
client.getPrefectureByCode("27"); // Osaka
client.getPrefectureCodeByName("大阪府"); // "27"
await client.listMunicipalitiesByPrefecture("13"); // Tokyo municipalities, etc.
await client.getMunicipalityByCode("131016"); // Chiyoda
await client.getByCode("131016");
await client.searchByText("中央", { prefecture: "01", target: "cities" });
await client.searchByText("ちよだ", { prefecture: "13", target: "cities" }); // kana / hiragana OK
await client.getLocalGovCodeByName("千代田区"); // "131016"
```

## Try it here

::code-lookup-demo
::

## Fetch from a versioned URL

```ts
const client = await createLocalGovClient({
  url: "https://example.com/jp-local-gov-id-data/0.2.0/index.json",
});
```

- With `url`, fetched files are cached in localStorage (key = each file URL, TTL 1 year)
- Exception: municipality JSON loaded by **nationwide** string search stays in memory only
- Environments without localStorage (e.g. Node) skip caching
- String search normalizes hiragana / fullwidth kana to halfwidth kana (`matchField` default: `"both"`)
- Schema mismatch / invalid JSON → `LocalGovSchemaError`; network / HTTP failures → normal fetch errors
- Missing or ambiguous results → `null` / `[]` (no throw)

## Code formats

| Target | Format | Accepted input |
|--------|--------|----------------|
| Prefecture | 2-digit half-width digits | With or without zero-padding (`"1"` / `"01"`) |
| Municipality | 6 digits including check digit | 6 digits is the canonical form |

## Data layout

A single JSON file of all municipalities is not distributed.

| File | Contents |
|------|----------|
| `index.json` | Index of paths, `schemaVersion`, `asOf`, etc. |
| `prefectures.json` | Prefectures only |
| `prefectures/{code}.json` | Municipalities for that prefecture (e.g. `13.json`) |

See [API](/en/api) and [Playground](/en/playground) for more.
