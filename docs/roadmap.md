# jp-local-gov-id 開発ロードマップ

仕様書（[main.md](./main.md)）に基づく開発ステップ。

## ~v0.4.2

リリース済み

## v0.5.0

### トップページ

- 現行 Playground にあったコード解決・文字列検索デモをトップへ埋め込み移動する

### Playground

- CodeMirror 6 エディタ（左）と console 出力（右）の左右分割 UI
- TypeScript を Sucrase（`transforms: ["typescript"]`、型チェックなし）で変換し、sandbox iframe で実行
- top-level await 対応（`type="module"`）
- import 許可は次のみ:
  - `@b4moss/jp-local-gov-id`
  - `@b4moss/jp-local-gov-id-data`
- テンプレート 3 本（コード解決 / 文字列検索 / 都道府県・市区町村一覧）
- URL 共有なし、モバイル最適化は対象外

### リリース

- 識別子: `app-v0.5.0`
- npm publish は別途（今回のサイト更新では GitHub Release を作らない）

----

以上
