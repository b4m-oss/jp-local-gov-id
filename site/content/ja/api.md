---
title: API
description: LocalGovClient の公開メソッド
---

# API

`createLocalGovClient` が返すクライアントの概要です。

## `createLocalGovClient(options)`

| オプション | 説明 |
|------------|------|
| `data` | npm データセット（または同等オブジェクト） |
| `url` | `index.json` の版付き URL |
| `cache` | `url` モードのみ。localStorage キャッシュの ON/OFF（既定: `true`） |
| `cacheTtlMs` | `url` モードのみ。キャッシュ TTL（ミリ秒、既定: 1 年） |

`data` と `url` のどちらか一方が必須。両方指定は不可。

## `isValidMunicipalityCode(code)`

6 桁かつチェックデジットが正しければ `true`。不正ならデータ取得前に弾く用途向け。

## `LocalGov`

| フィールド | 型 | 説明 |
|------------|-----|------|
| `code` | `string` | 団体コード |
| `name` | `string` | 名称 |
| `nameKana` | `string` | 半角カナ |
| `prefectureCode` | `string` | 都道府県コード（2 桁） |
| `prefectureName` | `string` | 都道府県名 |
| `prefectureNameKana` | `string` | 都道府県カナ |

## メソッド

| メソッド | 戻り値 | 説明 |
|----------|--------|------|
| `listPrefectures()` | `LocalGov[]` | 全都道府県 |
| `getPrefectureByCode(code)` | `LocalGov \| null` | 都道府県コードで取得 |
| `getPrefectureCodeByName(name)` | `string \| null` | 正式名称から都道府県コード |
| `listMunicipalitiesByPrefecture(pref)` | `Promise<LocalGov[]>` | 県内の市区町村（遅延ロード） |
| `getMunicipalityByCode(code)` | `Promise<LocalGov \| null>` | 市区町村 6 桁で取得 |
| `getByCode(code)` | `Promise<LocalGov \| null>` | 2 桁 / 6 桁を自動判定 |
| `searchByText(text, options?)` | `Promise<LocalGov[]>` | 部分一致検索 |
| `getLocalGovCodeByName(name, options?)` | `Promise<string \| null>` | 正式名称からコード |

### `searchByText` の options

| キー | 型 | 既定 | 説明 |
|------|-----|------|------|
| `prefecture` | `string` | — | 都道府県で絞り込み |
| `target` | `'all' \| 'prefectures' \| 'cities'` | `'all'` | 検索対象 |
| `matchField` | `'name' \| 'nameKana' \| 'both'` | `'both'` | 照合フィールド |

文字列検索はひらがな／全角カナを半角カナへ正規化します。

## エラーと空結果

- スキーマ不一致・不正 JSON → `LocalGovSchemaError`
- ネットワーク / HTTP 失敗 → 通常の fetch エラー
- 見つからない・同名衝突 → `null` / `[]`（throw しない）

## `url` モードのキャッシュ

- 取得ファイルを localStorage にキャッシュ（キーは URL、TTL 既定 1 年）
- `cache: false` で読み書きとも無効化、`cacheTtlMs` で TTL を変更可能
- **全国対象**の文字列検索で読み込んだ県別 JSON はメモリのみ（localStorage に書かない）

## コード検証

- 市区町村 6 桁はチェックデジットを検証する
- 不正な場合は `getMunicipalityByCode` / `getByCode` は `null` を返し、県別 JSON を fetch しない
- `isValidMunicipalityCode` で事前に判定できる
