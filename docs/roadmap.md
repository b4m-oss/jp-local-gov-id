# jp-local-gov-id 開発ロードマップ

仕様書（[main.md](./main.md)）に基づく開発ステップ。

## ~v0.2.0

リリース済み

## v0.3.0

### ドキュメントサイトの作成・公開

npm パッケージへの機能追加はなし。サイト公開をマイルストーンとする（パッケージ版は 0.2.x のまま）。

| 項目 | 方針 |
|------|------|
| 配置 | `site/`（ルート workspaces に追加） |
| スタック | Nuxt v4 + Nuxt Content + `@nuxtjs/i18n` |
| デプロイ | Netlify（SSG） |

#### i18n

- URL: `/ja/...` ↔ `/en/...`（`strategy: 'prefix'`）
- デフォルトロケール: `ja`
- 初回訪問: ブラウザロケールで判定（`/` → cookie / `navigator.languages` で `/ja` または `/en`）
- 手動切替: cookie（`i18n_redirected`）に保存、ヘッダーのドロップダウンで切替
- 静的ホスト向けに `site/public/index.html` でルート振り分け

#### 公開ページ

| パス | 内容 |
|------|------|
| `/` | cookie / ブラウザロケールで `/ja` または `/en` へ |
| `/{locale}/` | トップ |
| `/{locale}/getting-started` | インストールと最小コード |
| `/{locale}/api` | 公開 API 概要 |
| `/{locale}/playground` | インタラクティブデモ |

#### Playground

- `createLocalGovClient({ data })` のみ（`url` デモはしない）
- `getByCode`（コード解決）と `searchByText`（文字列検索）

#### `docs/` と `site/content` の役割

- `docs/` — 内部仕様書（`main.md` / `logics.md`）。サイトへ全文コピーしない
- `site/content` — 公開向け利用ドキュメント（README 由来）

----

以上
