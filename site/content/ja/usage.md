---
title: 使い方
description: クライアントの初期化と基本操作
---

# 使い方

`createLocalGovClient` は async です。`data` または `url`（**index.json** の版付き URL）のいずれかが必須です。

初期化ではインデックスと都道府県のみを読み込み、市区町村は県単位で遅延ロードします。全国対象の文字列検索では、未ロードの県別 JSON を同時 6 件で取得します。

## 最小の例

```ts
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGovClient({ data: dataset });

client.listPrefectures();
client.getPrefectureByCode("27"); // 大阪府
client.getPrefectureCodeByName("大阪府"); // "27"
await client.listMunicipalitiesByPrefecture("13"); // 東京都の市区町村等
await client.getMunicipalityByCode("131016"); // 千代田区
await client.getByCode("131016");
await client.searchByText("中央", { prefecture: "01", target: "cities" });
await client.searchByText("ちよだ", { prefecture: "13", target: "cities" }); // カナ／ひらがな可
await client.getLocalGovCodeByName("千代田区"); // "131016"
```

## その場で試す

::code-lookup-demo
::

## 版付き URL から取得

```ts
const client = await createLocalGovClient({
  url: "https://example.com/jp-local-gov-id-data/0.2.0/index.json",
});
```

- `url` 指定時、取得したファイルを localStorage にキャッシュします（キーは各ファイルの URL、有効期限 1 年）
- 例外: **全国対象**の文字列検索で取得した県別 JSON は localStorage に書かず、メモリのみ保持します
- localStorage が無い環境（Node 等）ではキャッシュをスキップします
- 文字列検索はひらがな／全角カナを半角カナへ正規化します（`matchField` 既定: `"both"`）
- スキーマ不一致・不正 JSON は `LocalGovSchemaError`、ネットワーク / HTTP エラーは通常の fetch エラーです
- クエリで見つからない・同名衝突の場合は `null` / `[]` を返します（throw しません）

## コード形式

| 対象 | 形式 | 入力時の許容 |
|------|------|--------------|
| 都道府県 | 半角数字 2 桁 | 0 埋めの有無どちらも可（`"1"` / `"01"`） |
| 市区町村 | チェックデジット込みの 6 桁 | 6 桁を正式とする |

## データ構成

全市区町村をまとめた単一 JSON は配布しません。

| ファイル | 内容 |
|----------|------|
| `index.json` | パス・`schemaVersion`・`asOf` などの索引 |
| `prefectures.json` | 都道府県のみ |
| `prefectures/{code}.json` | 当該県の市区町村（例: `13.json`） |

より詳しい挙動は [API](/ja/api) と [Playground](/ja/playground) を参照してください。
