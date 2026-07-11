# @b4moss/jp-local-gov-id-data

[日本語](./README_ja.md)

Split JSON datasets of Japan’s nationwide local government codes. Use with [`@b4moss/jp-local-gov-id`](../jp-local-gov-id), or host the files yourself behind a versioned index URL.

## Install

```bash
npm install @b4moss/jp-local-gov-id-data
```

## Usage with the API package

```ts
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGovClient({ data: dataset });
```

You can also import individual files:

```ts
import index from "@b4moss/jp-local-gov-id-data/index.json";
import prefectures from "@b4moss/jp-local-gov-id-data/prefectures.json";
```

## Data layout

A single JSON file of all municipalities is **not** distributed.

| File | Contents |
|------|----------|
| `index.json` | Index of paths, `schemaVersion`, `asOf`, etc. |
| `prefectures.json` | Prefectures only |
| `prefectures/{code}.json` | Municipalities for that prefecture (e.g. `13.json`) |

### Dataset exports

| Export | Description |
|--------|-------------|
| `index` | Index metadata |
| `prefectures` | All prefectures |
| `municipalitiesByCode` | Prefetched municipality files keyed by prefecture code |
| `loadMunicipalities(code)` | Load municipalities for a prefecture code |

## Hosting your own data

If you host the JSON yourself, serve it with a **versioned URL** and the same split-file layout. The package maintainers take no responsibility for availability, CORS, correctness, or URL management. Enable CORS on the hosting side.

## About the data

- As of: 1 January 2024 (R6.1.1)
- Source file: `resources/000925835.xlsx`
- Abolished / merged entities are not included (current only)

## License

MIT

See the [monorepo README](../../README.md) for API usage, versioning, and development notes.
