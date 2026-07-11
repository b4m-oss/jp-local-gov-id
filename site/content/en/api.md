---
title: API
description: LocalGovClient public methods
---

# API

Overview of the client returned by `createLocalGovClient`.

## `createLocalGovClient(options)`

| Option | Description |
|--------|-------------|
| `data` | npm dataset (or equivalent object) |
| `url` | Versioned URL to `index.json` |
| `cache` | `url` mode only. Enable/disable localStorage cache (default: `true`) |
| `cacheTtlMs` | `url` mode only. Cache TTL in ms (default: 1 year) |

Exactly one of `data` or `url` is required.

## `isValidMunicipalityCode(code)`

Returns `true` when the code is 6 digits with a valid check digit. Useful to reject invalid codes before fetching.

## `LocalGov`

| Field | Type | Description |
|-------|------|-------------|
| `code` | `string` | Entity code |
| `name` | `string` | Name |
| `nameKana` | `string` | Halfwidth kana |
| `prefectureCode` | `string` | Prefecture code (2 digits) |
| `prefectureName` | `string` | Prefecture name |
| `prefectureNameKana` | `string` | Prefecture kana |

## Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `listPrefectures()` | `LocalGov[]` | All prefectures |
| `getPrefectureByCode(code)` | `LocalGov \| null` | Lookup by prefecture code |
| `getPrefectureCodeByName(name)` | `string \| null` | Prefecture code from exact name |
| `listMunicipalitiesByPrefecture(pref)` | `Promise<LocalGov[]>` | Municipalities in a prefecture (lazy) |
| `getMunicipalityByCode(code)` | `Promise<LocalGov \| null>` | Lookup by 6-digit municipality code |
| `getByCode(code)` | `Promise<LocalGov \| null>` | Auto-detect 2-digit / 6-digit |
| `searchByText(text, options?)` | `Promise<LocalGov[]>` | Partial-match search |
| `getLocalGovCodeByName(name, options?)` | `Promise<string \| null>` | Code from exact name |

### `searchByText` options

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `prefecture` | `string` | — | Filter by prefecture |
| `target` | `'all' \| 'prefectures' \| 'cities'` | `'all'` | Search target |
| `matchField` | `'name' \| 'nameKana' \| 'both'` | `'both'` | Fields to match |

String search normalizes hiragana / fullwidth kana to halfwidth kana.

## Errors and empty results

- Schema mismatch / invalid JSON → `LocalGovSchemaError`
- Network / HTTP failures → normal fetch errors
- Missing or ambiguous results → `null` / `[]` (no throw)

## Caching in `url` mode

- Fetched files are cached in localStorage (key = URL, default TTL 1 year)
- Set `cache: false` to disable read/write; set `cacheTtlMs` to change TTL
- Municipality JSON loaded by **nationwide** string search stays in memory only

## Code validation

- 6-digit municipality codes are validated with a check digit
- Invalid codes make `getMunicipalityByCode` / `getByCode` return `null` without fetching
- Use `isValidMunicipalityCode` to check beforehand
