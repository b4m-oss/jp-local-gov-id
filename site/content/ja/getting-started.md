---
title: はじめに
description: インストールと最小の使い方
---

# はじめに

## インストール

```bash
# API + 公式データ
npm install @b4moss/jp-local-gov-id @b4moss/jp-local-gov-id-data

# API のみ（版付きインデックス URL から取得）
npm install @b4moss/jp-local-gov-id
```

## 最小の例

`createLocalGovClient` は async です。`data` または `url`（**index.json** の版付き URL）のいずれかが必須です。

初期化ではインデックスと都道府県のみを読み込み、市区町村は県単位で遅延ロードします。

```ts
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGovClient({ data: dataset });

client.listPrefectures();
client.getPrefectureByCode("27"); // 大阪府
await client.getMunicipalityByCode("131016"); // 千代田区
await client.searchByText("ちよだ", { prefecture: "13", target: "cities" });
```

## その場で試す

::code-lookup-demo
::

版付き URL から取得する場合:

```ts
const client = await createLocalGovClient({
  url: "https://example.com/jp-local-gov-id-data/0.2.0/index.json",
});
```

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
