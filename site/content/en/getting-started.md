---
title: Getting started
description: Install and minimal usage
---

# Getting started

## Install

```bash
# API + official data
npm install @b4moss/jp-local-gov-id @b4moss/jp-local-gov-id-data

# API only (fetch from a versioned index URL)
npm install @b4moss/jp-local-gov-id
```

## Minimal example

`createLocalGovClient` is async. Either `data` or `url` (a **versioned URL** to **index.json**) is required.

On init it loads only the index and prefectures; municipalities are lazy-loaded per prefecture.

```ts
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGovClient({ data: dataset });

client.listPrefectures();
client.getPrefectureByCode("27"); // Osaka
await client.getMunicipalityByCode("131016"); // Chiyoda
await client.searchByText("ちよだ", { prefecture: "13", target: "cities" });
```

## Try it here

::code-lookup-demo
::

Fetch from a versioned URL:

```ts
const client = await createLocalGovClient({
  url: "https://example.com/jp-local-gov-id-data/0.2.0/index.json",
});
```

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
