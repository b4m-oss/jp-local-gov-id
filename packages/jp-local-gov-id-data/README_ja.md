# @b4moss/jp-local-gov-id-data

[English](./README.md)

日本の全国地方公共団体コードの分割 JSON データです。[`@b4moss/jp-local-gov-id`](../jp-local-gov-id) と組み合わせて使うか、版付きインデックス URL で自前配信できます。

## インストール

```bash
npm install @b4moss/jp-local-gov-id-data
```

## API パッケージとの併用

```ts
import { createLocalGov } from "@b4moss/jp-local-gov-id";
import dataset from "@b4moss/jp-local-gov-id-data";

const client = await createLocalGov({ data: dataset });
```

個別ファイルの import も可能です:

```ts
import index from "@b4moss/jp-local-gov-id-data/index.json";
import prefectures from "@b4moss/jp-local-gov-id-data/prefectures.json";
```

## データ構成

全市区町村をまとめた単一 JSON は**配布しません**。

| ファイル | 内容 |
|----------|------|
| `index.json` | パス・`schemaVersion`・`asOf` などの索引 |
| `prefectures.json` | 都道府県のみ |
| `prefectures/{code}.json` | 当該県の市区町村（例: `13.json`） |

### データセットの export

| Export | 説明 |
|--------|------|
| `index` | インデックスメタデータ |
| `prefectures` | 全都道府県 |
| `municipalitiesByCode` | 都道府県コードをキーにした市区町村ファイル |
| `loadMunicipalities(code)` | 都道府県コードで市区町村を読み込む |

## 自前データ配信について

自前で JSON を配信する場合も、公式と同様に**バージョン付き URL**と同等の分割ファイル構成で提供してください。可用性・CORS・内容の正しさ・URL 運用などについて、当パッケージ開発者は一切の責任を負いません。CORS は配信側で許可してください。

## データについて

- 時点: 令和 6 年 1 月 1 日（R6.1.1）
- ソースファイル: `resources/000925835.xlsx`
- 廃止・合併済みの団体は含みません（現行のみ）

## ライセンス

MIT

API の使い方・バージョン方針・開発手順は [モノレポ README](../../README_ja.md) を参照してください。
