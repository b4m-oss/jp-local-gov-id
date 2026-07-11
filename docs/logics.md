# API ロジック仕様

実装の正はコード。議論・変更はまずここに書く。

関連: [main.md](./main.md)

---

## 共通ルール

- 見つからない・一意に決まらない → `null` または `[]`（throw しない）
- スキーマ不正 → `LocalGovSchemaError`
- ネットワーク / HTTP 失敗 → 通常の fetch エラー
- 都道府県コード: 2 桁（入力は `"1"` / `"01"` どちらも可）
- 市区町村コード: 6 桁（チェックデジット込み）。検査数字が不正なら正規化失敗 → `null`（fetch しない）
- 市区町村が必要な操作は async（遅延ロード）
- 検査数字: 先頭 5 桁 × 重み `6,5,4,3,2` の和を 11 で割った余り `r` について `(11 - r) % 10`

### `LocalGov`

| フィールド | 内容 |
|------------|------|
| `code` | 都道府県 2 桁 / 市区町村 6 桁 |
| `name` | 名称（例: `千代田区` / `東京都` / `札幌市中央区`） |
| `nameKana` | 半角カナ |
| `prefectureCode` | 所属都道府県コード（都道府県自身の場合は自身） |
| `prefectureName` | 所属都道府県名 |
| `prefectureNameKana` | 所属都道府県カナ |

### `SearchOptions`

| フィールド | 既定 | 内容 |
|------------|------|------|
| `prefecture` | なし | 都道府県コードまたは名称で絞り込み |
| `target` | `"all"` | `"all"` \| `"prefectures"` \| `"cities"` |
| `matchField` | `"both"` | `"name"` \| `"nameKana"` \| `"both"` |

文字列比較前にクエリ・データ双方へ正規化を適用する:

- ひらがな → カタカナ
- 全角カナ → 半角カナ

`both` では正規化後の `name` / `nameKana` のどちらかに一致すればヒット。

### キャッシュ（`url` 経路のみ）

| 経路 | localStorage 書き込み | メモリ |
|------|----------------------|--------|
| 初期化（index / prefectures） | する（`cache: false` ならしない） | する |
| `getByCode` / `listMunicipalitiesByPrefecture` / `getMunicipalityByCode` | する（同上） | する |
| 都道府県指定の `searchByText` / `getLocalGovCodeByName` | する（同上） | する |
| **全国**の `searchByText` / `getLocalGovCodeByName`（市区町村対象） | **しない** | する |

- `cache` 既定: `true`（読み書きとも有効）
- `cacheTtlMs` 既定: 1 年（ミリ秒）
- 全国検索の並列度: 同時 6（`MUNICIPALITY_FETCH_CONCURRENCY`）

---

## 公開 API

### パッケージ: `@b4moss/jp-local-gov-id`

#### `createLocalGovClient(options)` → `Promise<LocalGovClient>`

- `options`: `{ data }` または `{ url, cache?, cacheTtlMs? }`（`data` / `url` どちらか必須、両方不可）
- `cache`（`url` のみ、既定 `true`）: localStorage キャッシュの ON/OFF
- `cacheTtlMs`（`url` のみ、既定 1 年）: キャッシュ有効期限（ミリ秒）
- index + 都道府県を読み込み、スキーマ検証してクライアントを返す
- 市区町村はまだ読まない

公開ヘルパー: `isValidMunicipalityCode(code)` → 6 桁かつ検査数字が正しければ `true`

#### クライアントメソッド

##### `listPrefectures()` → `LocalGov[]`

- 全都道府県（同期・初期化済み）

##### `getPrefectureByCode(code)` → `LocalGov | null`

- 都道府県コード → エンティティ（同期）
- `"1"` / `"01"` 同一視
- 見つからなければ `null`

##### `getPrefectureCodeByName(name)` → `string | null`

- 都道府県名の完全一致 → 2 桁コード
- 見つからなければ `null`

##### `listMunicipalitiesByPrefecture(pref)` → `Promise<LocalGov[]>`

- `pref`: コードまたは名称
- 配下の市区町村（市本体・区を含む）
- 未ロードなら当該県 JSON を取得（キャッシュ可）
- 不正な `pref` → `[]`

##### `getMunicipalityByCode(code)` → `Promise<LocalGov | null>`

- 6 桁かつ検査数字が正しいもののみ（それ以外は `null`、fetch しない）
- 先頭 2 桁で県を特定してロード
- 不正・不明 → `null`

##### `getByCode(code)` → `Promise<LocalGov | null>`

- 2 桁 → `getPrefectureByCode`（同期相当を async で返す）
- 6 桁 → `getMunicipalityByCode`（検査数字不正なら fetch せず `null`）
- 不正・不明 → `null`

##### `searchByText(text, options?)` → `Promise<LocalGov[]>`

- **部分一致**（正規化後 `includes`）
- `target` / `prefecture` / `matchField` で対象を絞る
- 全国かつ市区町村対象 → 未ロード県を 6 並列で取得（メモリのみ）
- 都道府県のみ対象 → 追加 fetch なし
- 不正な `prefecture` → `[]`

##### `getLocalGovCodeByName(name, options?)` → `Promise<string | null>`

- **完全一致**（正規化後）
- ヒットがちょうど 1 件のときだけその `code` を返す
- 0 件・複数件 → `null`
- ロード／キャッシュ方針は `searchByText` と同じ

#### その他の export

| 名前 | 種別 | 内容 |
|------|------|------|
| `LocalGovSchemaError` | class | スキーマ／不正 JSON |
| `LOCAL_GOV_SCHEMA_VERSION` | const | 現行スキーマ版（`1`） |
| `MUNICIPALITY_FETCH_CONCURRENCY` | const | 全国検索の並列度（`6`） |

型: `LocalGov`, `LocalGovClient`, `CreateLocalGovOptions`, `SearchOptions`, `SearchTarget`, `LocalGovDataset`, `LocalGovIndexFile`, `LocalGovPrefecturesFile`, `LocalGovMunicipalitiesFile`, `LocalGovDataFile`（deprecated）

旧名（`createLocalGov`, `getPrefectureCode`, `getMunicipalitiesByPrefecture`, `search`, `getCodeByName`）に互換エイリアスは置かない。

---

### パッケージ: `@b4moss/jp-local-gov-id-data`

| 名前 | 内容 |
|------|------|
| default `dataset` | `{ index, prefectures, municipalitiesByCode, loadMunicipalities }` |
| `index` | インデックス JSON |
| `prefectures` | 都道府県 JSON |
| `municipalitiesByCode` | 県コード → 市区町村 JSON |
| `loadMunicipalities(code)` | 県コードで市区町村ファイルを返す |

---

## 変更ログ（このファイル）

| 日付 | 内容 |
|------|------|
| 2026-07-11 | 現状 API を書き出し |
| 2026-07-11 | 整理案を確定（改名 + カナ検索 `matchField`） |
