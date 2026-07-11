---
title: 開発に参加する
description: コントリビューションの概要
---

# 開発に参加する

Issue・Pull Request は歓迎です。[GitHub リポジトリ](https://github.com/b4m-oss/jp-local-gov-id) からご参加ください。

## リポジトリ構成

npm workspaces のモノレポです。

| パス | 内容 |
|------|------|
| `packages/jp-local-gov-id` | JS API |
| `packages/jp-local-gov-id-data` | 分割データ JSON |
| `scripts/` | Excel からのデータ生成など |
| `site/` | このドキュメントサイト |
| `docs/` | 内部仕様書 |

## はじめ方

```bash
npm install
npm test
npm run build
```

データの再生成（総務省の Excel → 分割 JSON）:

```bash
npm run generate
```

ドキュメントサイトのローカル起動:

```bash
npm run dev:site
```

## 方針の目安

- バグ修正・ドキュメント改善・テスト追加は歓迎です
- API の破壊的変更やデータ形式の変更は、Issue で先に相談してください
- 詳細な仕様はリポジトリ内の `docs/` を参照してください

ライセンスは MIT です。
