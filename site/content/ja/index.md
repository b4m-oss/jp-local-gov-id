---
title: jp-local-gov-id
description: 日本の全国地方公共団体コードを扱う npm パッケージ
---

# jp-local-gov-id

日本の全国地方公共団体コードを、分割 JSON と遅延ロードで扱う JavaScript API です。

| パッケージ | 説明 |
|------------|------|
| `@b4moss/jp-local-gov-id` | JS API（データ非同梱） |
| `@b4moss/jp-local-gov-id-data` | 分割データ JSON |

```bash
npm install @b4moss/jp-local-gov-id @b4moss/jp-local-gov-id-data
```

```ts
import { createLocalGovClient } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGovClient({ data: dataset });
await client.getByCode("131016"); // 千代田区
```

- [はじめに](/ja/getting-started) — 概要と次のステップ
- [インストール](/ja/installation) — パッケージの入れ方
- [使い方](/ja/usage) — クライアントの初期化と基本操作
- [API](/ja/api) — 公開メソッド一覧
- [サンプル](/ja/examples) — 利用例
- [Playground](/ja/playground) — ブラウザで試す
