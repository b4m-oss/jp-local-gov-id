# @b4moss/jp-local-gov-id

[English](./README.md)

日本の全国地方公共団体コードを扱う JS API です。データは**同梱しません**。`@b4moss/jp-local-gov-id-data` または版付きインデックス URL を渡してください。

## インストール

```bash
npm install @b4moss/jp-local-gov-id @b4moss/jp-local-gov-id-data
# または API のみ:
npm install @b4moss/jp-local-gov-id
```

## 使い方

`createLocalGov` は async です。`data` または `url`（**index.json** の版付き URL）のいずれかが必須です。

初期化ではインデックスと都道府県のみを読み込み、市区町村は県単位で遅延ロードします。全国対象の文字列検索では、未ロードの県別 JSON を同時 6 件で取得します。

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

版付きインデックス URL から取得する場合:

```ts
const client = await createLocalGov({
  url: "https://example.com/jp-local-gov-id-data/0.2.0/index.json",
});
```

- `url` 指定時、取得したファイルを localStorage にキャッシュします（キーは各ファイルの URL、有効期限 1 年）
- 例外: **全国対象**の文字列検索で取得した県別 JSON は localStorage に書かず、メモリのみ保持します
- localStorage が無い環境（Node 等）ではキャッシュをスキップします
- スキーマ不一致・不正 JSON は `LocalGovSchemaError`、ネットワーク / HTTP エラーは通常の fetch エラーです
- クエリで見つからない・同名衝突の場合は `null` / `[]` を返します（throw しません）

## コード形式

| 対象 | 形式 | 入力時の許容 |
|------|------|--------------|
| 都道府県 | 半角数字 2 桁 | 0 埋めの有無どちらも可（`"1"` / `"01"`） |
| 市区町村 | チェックデジット込みの 6 桁 | 6 桁を正式とする |

## ライセンス

MIT

データ構成・バージョン方針・開発手順は [モノレポ README](../../README_ja.md) を参照してください。
