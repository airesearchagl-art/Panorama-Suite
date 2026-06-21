# Panorama Suite

Panorama Suite は、建築設計・施工管理で発生する360度パノラマ業務を統合するためのWebポータルです。
作成、変換、品質確認、案件管理、レビュー、共有、VR確認、ドキュメント化までを、個別ツール群として段階的に整備します。

## 開発方針

- Vercel 公開を前提にした静的Webアプリとして構築する
- 各ツールは単独利用可能なブラウザツールとして設計する
- 外部APIへ画像を送らず、可能な限りブラウザ内で完結させる
- 日本語UIを基本とし、建築系ポートフォリオにも見える落ち着いた業務UIにする
- 将来的にクラウド版、デスクトップ版、BIM/CAD連携へ拡張できる構成にする

## ツール一覧

| カテゴリ | ツール | 状態 | 概要 |
| --- | --- | --- | --- |
| レビュー | Archview360 | 公開中 | 建築パノラマの閲覧・レビュー |
| 変換 | Panorama Flipper | 公開中 | パノラマ画像の反転補正 |
| 品質チェック | パノラマ品質チェック（Panorama QA） | 基本機能版 | 解像度、2:1比率、対応形式、命名規則の検査 |
| 管理 | 案件パッケージ作成（Project Packager） | 基本機能版 | 案件データのZIP化、引継ぎ、アーカイブ |
| 変換 | パノラマ画像変換（Panorama Converter） | 基本機能版 | jpg/png/webp 形式変換、画質調整、リサイズ |
| 書き出し | SketchUp Panorama Export | 構想中 | レンダラーやSketchUpからの出力整理 |
| 管理 | Panorama Metadata Manager | 開発予定 | 案件名、施主名、担当者、用途、備考の管理 |
| 管理 | 平面図ピン配置（FloorMap Builder） | 基本機能版 | 平面図登録、ピン配置、平面図ピン情報の書き出し |
| レビュー | Panorama Diff | 構想中 | A案/B案の差分比較 |
| ドキュメント | Review Exporter | 開発予定 | レビュー結果のPDF/Excel/PowerPoint/HTML出力 |
| ドキュメント | Panorama Thumbnail Generator | 構想中 | パノラマ目録の作成 |
| 共有 | Panorama Share Hub | 構想中 | 共有リンク、更新履歴、配布管理 |
| VR確認 | Panorama VR Launcher | 構想中 | VR端末向けの閲覧導線 |
| レビュー | Panorama AI Assistant | 構想中 | 画像解析とレビュー支援 |
| ドキュメント | Panorama Docs | 構想中 | チュートリアル、運用ルール、更新履歴 |

## 優先順位

最優先:

- パノラマ品質チェック（Panorama QA）
- 案件パッケージ作成（Project Packager）
- パノラマ画像変換（Panorama Converter）

次点:

- Review Exporter
- Panorama Metadata Manager
- Panorama Thumbnail Generator

将来:

- Panorama Diff
- Panorama VR Launcher
- Panorama AI Assistant

## 公開情報

- 現在のバージョン: v0.1.0
- 公開URL: https://panorama-suite.vercel.app/
- Portal: https://panorama-suite.vercel.app/
- パノラマ品質チェック: https://panorama-suite.vercel.app/qa
- 案件パッケージ作成: https://panorama-suite.vercel.app/packager
- パノラマ画像変換: https://panorama-suite.vercel.app/converter
- 平面図ピン配置: https://panorama-suite.vercel.app/floormap
- レビュー書き出し: https://panorama-suite.vercel.app/review-exporter
- サムネイル一覧作成: https://panorama-suite.vercel.app/thumbnail-generator
- 画像比較: https://panorama-suite.vercel.app/panorama-diff
- 共有パッケージ作成: https://panorama-suite.vercel.app/share-hub
- Documentation: https://panorama-suite.vercel.app/docs
- Help: https://panorama-suite.vercel.app/help
- Design System: https://panorama-suite.vercel.app/docs/design-system

### 基本機能版として実装済みの機能

- Portal
- パノラマ品質チェック（Panorama QA）
- 案件パッケージ作成（Project Packager）
- パノラマ画像変換（Panorama Converter）
- 平面図ピン配置（FloorMap Builder）
- レビュー書き出し（Review Exporter）

## 用語方針

画面上では、建築設計者・施工管理者・クライアントに伝わりやすい日本語を優先します。
一方で、既存データとの互換性を保つため、コード内部の識別子、JSONキー、ファイル名は原則として維持します。

| ユーザー向け表示 | 内部名・旧表記 |
| --- | --- |
| 基本機能版 | MVP / `availability: "mvp"` |
| 利用状態 | availability |
| 通知 | Toast |
| 案件パッケージ作成 | Project Packager |
| パノラマ品質チェック | Panorama QA |
| パノラマ画像変換 | Panorama Converter |
| 平面図ピン配置 | FloorMap Builder |
| 案件データファイル | `project.json` |
| 平面図ピン情報 | `floorMaps` |
| 平面図ピン情報ファイル | `floor-map.json` |
| 更新済み案件データ | `updated-project.json` |
| データ形式 | schema |
| 管理情報 / 補足情報 | metadata |
| ローカル処理 | Local Processing |
| 準備中 | Coming Soon |

### カテゴリ表示ルール

画面上のカテゴリ名は日本語で表示します。内部コード上のカテゴリ値は既存データとの互換性のため維持します。

| 画面表示 | 内部カテゴリ |
| --- | --- |
| 書き出し | Export |
| 変換 | Convert |
| 品質チェック | QA |
| 管理 | Manage |
| レビュー | Review |
| 共有 | Share |
| VR確認 | VR |
| ドキュメント | Documentation |

## ツール状態管理

Portal のツールカードは `src/data/tools.ts` の状態定義を正とします。

各ツールは以下の項目で管理します。

- `id`
- `name`
- `category`
- `description`
- `statusLabel`
- `availability`
- `href`
- `isExternal`
- `isEnabled`
- `priority`

### 利用状態（availability）

- `available`: 内部ツールとして利用可能
- `mvp`: 基本機能版
- `external`: 外部ツール
- `development`: 開発中
- `concept`: 構想中
- `future`: 将来予定

### UI方針

- `isEnabled: true` のツールだけクリック可能にする
- 内部ツールは通常遷移する
- 外部ツールは新規タブで開き、`↗` を表示する
- 未実装ツールはグレーアウトし、クリック不可にする
- 未実装ツールは `準備中` または `開発中` を表示する
- Sidebar でも未実装ツールは薄く表示し、リンク化しない

### Portalフィルタ機能

Portal ではツール数が増えても目的のツールへ到達しやすいように、以下の絞り込みを提供します。

- キーワード検索
  - 対象: `name`、`description`、`category`、`statusLabel`、`availability`
- カテゴリフィルタ
  - すべて
  - 書き出し
  - 変換
  - 品質チェック
  - 管理
  - レビュー
  - 共有
  - VR確認
  - ドキュメント
- 状態フィルタ
  - すべて
  - 利用可能
  - 基本機能版
  - 外部ツール
  - 開発中
  - 構想中
  - 将来予定

カテゴリと状態は同時に絞り込めます。
該当ツールがない場合は Empty State を表示し、リセットボタンで全条件を初期化します。

Portal Dashboard では、全ツール数、利用可能ツール数、基本機能版ツール数、開発中/構想中/将来予定ツール数、現在の絞り込み結果数を表示します。

### 通知（Toast）

共通 `ToastProvider` により、主要操作の完了・注意・エラーを右下に通知として表示します。

通知種別:

- `success`: 処理完了
- `warning`: 注意、非対応形式、不足ファイル
- `error`: 読み込み失敗、変換失敗
- `info`: 外部ツール遷移などの案内

対象操作:

- Portal
  - 外部ツールを開く
  - 未実装ツールをクリックしようとした場合
- パノラマ品質チェック
  - 画像読み込み
  - 非対応形式の検出
  - JSON出力
  - CSV出力
  - 画像読み込みエラー
- 案件パッケージ作成
  - パノラマ画像登録
  - 平面図登録
  - QA JSON読み込み
  - 案件データファイル（project.json）読み込み
  - 案件データファイル読み込み失敗
  - ZIP出力
  - 不足ファイルがある状態でのZIP出力
- パノラマ画像変換
  - 画像登録
  - 変換完了
  - 変換エラー
  - 個別ダウンロード
  - ZIP出力

## Design System v1.0

Panorama Suite は、単なるツール集ではなく、360度プロジェクトを操作する Professional Panorama Workspace としてUIを統一します。

### デザインコンセプト

- Information First
- Workspace Style
- Dashboard Driven
- Professional Tool
- Calm UI

### カラーパレット

Design System v1.0 では、以下のCSS変数を基準にします。

```css
:root {
  --color-background: #111827;
  --color-panel: #1f2937;
  --color-card: #374151;
  --color-accent: #4f7cff;
  --color-success: #10b981;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --font-base: Inter, "Segoe UI", "Noto Sans JP", sans-serif;
}
```

追加変数として、本文色、補助テキスト、境界線、カード角丸、カード影、ページ余白、セクション余白を定義しています。

### 共通レイアウト

全ページを以下の構造に統一します。

- Header
  - Panorama Suite 名称
  - 現在のツール名
  - Version
  - Status
  - Toolbar
  - Manual
  - Help
  - ローカル処理
- Sidebar
  - Dashboard
  - Tools
  - Guide
  - Status / Security / Documentation 導線
- Main Workspace
  - 各ツールの主要作業領域
  - Dashboard と操作エリアを優先表示
- Footer
  - Version
  - Security
  - ローカル処理
  - Copyright

### Dashboardルール

各ページに数値と状態を一覧できる Dashboard を置きます。

- Portal: ツール数 / 利用可能 / 基本機能版 / 今後追加予定 / 表示中
- パノラマ品質チェック: 画像数 / 注意 / エラー / 合格率
- 案件パッケージ作成: パノラマ / 平面図 / 不足ファイル / 品質チェック / 場所名入力済み
- パノラマ画像変換: 入力画像 / 変換済み / 失敗 / 出力形式

### Empty Stateルール

データがない状態でも空白にせず、アイコン、状態説明、次の操作を表示します。

- QA: 画像がない状態
- Packager: パノラマ、平面図がない状態
- Converter: 画像がない状態
- Portal: 更新履歴がない状態

### ローカル処理表示

全ページの Header と Footer に `🔒 ローカル処理` を表示します。
画像処理、QA判定、ZIP生成はブラウザ内で完結し、外部APIへの送信やクラウドアップロードは行いません。

### Manual / Help導線

Header 右側に `📖 Manual` と `❔ Help` を設置しています。
Manual は `/docs`、Help は `/help` へ遷移します。

### Documentation / Help

- `/docs`: Panorama Suite の概要、公開URL、ツールガイド、基本フロー、セキュリティ、ロードマップを確認できます。
- `/help`: よくある操作、画像読込、ZIP出力、QA Warning、project.json 読込に関するヘルプを確認できます。
- `/docs/design-system`: 画面設計ルール v1.0 のコンセプト、カラーパレット、レイアウト、ダッシュボード、空状態、ローカル処理ルールを確認できます。

### ドキュメント管理方針

`.docx` はGit管理対象にしません。
Design System の正本は `docs/design-system.md` とし、GitHub上で読みやすいMarkdownを管理します。

### 今後のUI拡張方針

- ツール別サイドバーのフィルタ、リスト、グループ表示
- 共通通知
- 操作履歴と Recent Updates
- Documentation ページ
- Workspace 内のパネル分割と保存可能なビュー設定
- アクセシビリティ確認とキーボード操作整理

## Panorama QA v0.1

`/qa` で利用できる、360度パノラマ画像の初期品質チェックツールです。
画像はブラウザ内で読み込み、外部APIには送信しません。

### 対応形式

- jpg
- jpeg
- png
- webp

### 対応チェック項目

- ファイル形式
- 横幅
- 高さ
- 2:1比率
- 推奨解像度
  - 8192x4096
  - 4096x2048
  - 2048x1024
- ファイル名規則
  - `scene01.jpg`
  - `scene02.jpg`
  - `scene03.jpg`
  - 判定は `scene` + 2桁数字 + 拡張子を基本とする

### 判定ルール

- OK: 2:1で、対応形式で、推奨解像度で、命名規則に合っている
- Warning: 2:1だが推奨解像度ではない、または命名規則のみ不一致
- Error: 非対応形式、画像として読み込めない、または2:1ではない

### エクスポート

検査結果は JSON または CSV で出力できます。
出力項目は `fileName`、`fileType`、`width`、`height`、`ratio`、`status`、`messages` です。

### 今後追加予定のチェック項目

- 継ぎ目チェック
- 左右反転チェック
- 天地反転チェック
- EXIF確認
- AI品質判定

## 案件パッケージ作成 基本機能版

`/packager` で利用できる、案件単位のZIPパッケージ作成ツールです。
パノラマ画像、平面図、パノラマ品質チェックの結果JSON、案件の管理情報をまとめ、引継ぎ・バックアップ・アーカイブに使える構成で出力します。

### 登録できるファイル

- パノラマ画像
  - jpg
  - jpeg
  - png
  - webp
- 平面図画像
  - jpg
  - jpeg
  - png
  - webp
- QA結果
  - パノラマ品質チェック v0.1 が出力したJSON

### ZIP出力構成

```text
project-name.zip
├ project.json
├ panoramas/
│  ├ scene01.jpg
│  ├ scene02.jpg
│  └ scene03.jpg
├ floorplans/
│  └ floorplan.jpg
└ qa/
   └ qa-results.json
```

### project.json の役割

`project.json` は案件メタデータ、登録パノラマ、平面図、QAサマリーをまとめる中心ファイルです。
初期スキーマでは `schemaVersion`、`project`、`panoramas`、`floorplans`、`qa` を保持します。

パノラマ画像については `fileName`、`path`、`width`、`height`、`fileType`、`fileSize`、`qaStatus` を保存します。
QA結果JSONを読み込んだ場合、ファイル名が一致するパノラマへ `qaStatus` を反映し、`qa.summary` に OK / Warning / Error 件数を保存します。

## 案件パッケージ作成 v0.2

`project.json` のインポートに対応しました。
既存のパッケージから `project.json` を読み込むと、案件情報、パノラマ一覧、平面図一覧、QAサマリーをフォームと一覧へ復元できます。

### project.json インポート機能

- JSONとして読み込めることを確認する
- `schemaVersion` が存在することを確認する
- `project` が存在することを確認する
- `panoramas` が配列であることを確認する
- `floorplans` が配列であることを確認する
- 不正な場合は画面上にエラーを表示する

### 再編集時の注意点

`project.json` にはファイル名、パス、解像度、QA状態などのメタ情報は残りますが、画像ファイル本体は含まれません。
そのため `project.json` だけを読み込んだ場合、パノラマ画像や平面図画像は「ファイル未再登録」として表示されます。

同名の画像ファイルを再登録すると、復元済みのメタ情報に実ファイルを紐づけます。

### 再ZIP出力時の仕様

- 未再登録の項目も `project.json` には残す
- 未再登録の実ファイルはZIP内の `panoramas/` または `floorplans/` には含めない
- QA結果JSONの実ファイルが未再登録の場合、`qa.summary` と `qa.resultPath` は残すが、`qa/` にはJSONファイルを含めない
- 不足ファイルがある場合は画面上に警告を表示する

## 案件パッケージ作成 シーンごとの管理情報

案件パッケージ作成では、各パノラマ画像にシーンごとの管理情報を設定できます。
編集内容は保存ボタンなしで内部状態に反映され、ZIP出力時の案件データファイル（project.json）に保存されます。

### 保存される項目

`panoramas[]` には以下を保存します。

- `id`
- `fileName`
- `path`
- `width`
- `height`
- `fileType`
- `fileSize`
- `floor`
- `locationName`
- `direction`
- `sceneType`
- `note`
- `sortOrder`
- `qaStatus`

### direction の扱い

`direction` は 0〜359 の数値として保存します。
UIでは度数入力として扱い、0未満または360以上の値は 0〜359 の範囲に正規化します。
将来の平面図ピン配置でピン方向として利用する想定です。

### sceneType の選択肢

- エントランス
- 執務エリア
- 会議室
- 食堂
- ラウンジ
- 廊下
- 階段
- 外観
- 現場
- その他

### sortOrder の扱い

`sortOrder` は表示順として保存します。
一覧表示は `sortOrder` 昇順で並び替えます。

### 将来連携

- 平面図ピン配置: シーンの階、場所、方位を平面図ピン配置へ利用
- Review Exporter: scene 別コメントやQA状態をレビュー資料へ出力
- Share Hub: scene 情報を共有リンクや案件アーカイブへ反映

## 案件パッケージ作成 v0.3 平面図ピン情報対応

案件パッケージ作成は、平面図ピン配置が出力した平面図ピン情報（floorMaps）を再読み込み、確認、ZIP同梱できるようになりました。

### floorMaps の役割

`floorMaps` は、平面図画像とパノラマsceneの撮影位置ピンを紐づける管理データです。
各FloorMapは平面図ファイル名、階、ピン一覧を持ち、各ピンは `panoramaId`、`label`、`x`、`y`、`direction`、`note` を保持します。

### 読み込み

- `updated-project.json`
  - FloorMap Builderで出力した、元の `project.json` に `floorMaps` を追加したJSONです。
  - Packagerの `project.json読み込み` から読み込めます。
- `floor-map.json`
  - `floorMaps` のみを含むJSONです。
  - Packagerの `floor-map.jsonを読み込む` から読み込めます。
  - 読み込んだ場合、現在の内部状態の `floorMaps` を上書きします。

### ZIP内の floorMaps

floorMaps がある場合、ZIP内に以下を追加します。

```text
project-name.zip
├ project.json
├ panoramas/
├ floorplans/
├ qa/
└ floor-maps/
   └ floor-map.json
```

- `project.json` には常に `floorMaps` を含めます。
- `floor-maps/floor-map.json` は `floorMaps` のみを含みます。
- `floorMaps` が空の場合、`floor-maps/floor-map.json` は省略できます。

### 不足平面図ファイルの扱い

`floorMaps[].imageFileName` と Packagerに登録済みの平面図実ファイル名を照合します。
一致する実ファイルがない場合、floorMapsのメタ情報は `project.json` に残りますが、ZIP内に画像本体は含まれません。

### FloorMap Builderとの連携フロー

1. Panorama QAで画像品質を確認する。
2. Project Packagerで案件ZIPまたは `project.json` を作成する。
3. FloorMap Builderで `project.json` と平面図を読み込み、ピンを配置する。
4. FloorMap Builderから `updated-project.json` または `floor-map.json` を出力する。
5. Project Packagerで再読み込みし、floorMapsを含めて案件ZIPを保存する。

### 画面上の推奨作業フロー

1. パノラマ品質チェックで画像のサイズ、比率、名前を確認する。
2. パノラマ画像変換で画像形式や解像度を整える。
3. 案件パッケージ作成で案件データファイルを作成する。
4. 平面図ピン配置で平面図にパノラマ位置を配置する。
5. 更新済み案件データを書き出す。
6. 案件パッケージ作成で再読み込みする。
7. ZIPとして保存する。

### 今後追加予定

- 平面図ピン配置
- sceneごとの階・場所・方位設定の詳細編集
- QAとの直接連携
- Review Exporter連携
- Share Hub連携

## パノラマ画像変換 基本機能版

`/converter` で利用できる、パノラマ画像の形式変換ツールです。
Canvas を使ってブラウザ内で変換し、外部APIには画像を送信しません。

### 対応入力形式

- jpg
- jpeg
- png
- webp

### 対応出力形式

- jpg
- png
- webp

### 変換設定

- 出力形式の選択
- 画質指定
  - jpg / webp は 10〜100% で指定
  - png は画質指定を使用しない
- リサイズ
  - 元サイズ維持
  - 横幅指定
  - 推奨サイズに変換
    - 8192x4096
    - 4096x2048
    - 2048x1024
- 2:1比率維持
  - 横幅指定時に高さを横幅の1/2で自動計算する

### ダウンロード

- 変換済み画像の個別ダウンロード
- `panorama-converted.zip` として一括ZIP出力
- 変換後ファイル名は元ファイル名をベースに拡張子を変更する
- 同名ファイルは連番を付けて上書きを避ける
- ファイル名に使えない文字は安全な文字へ置換する

### 今後追加予定

- tif対応
- bmp対応
- hdr/exr対応
- 画像メタデータ保持
- パノラマ品質チェックとの連携
- 案件パッケージ作成との連携

## 平面図ピン配置 基本機能版

`/floormap` で利用できる、平面図上への360度パノラマ撮影位置ピン配置ツールです。
案件パッケージ作成が出力した案件データファイル（project.json）を読み込み、パノラマシーンと平面図上のピンを紐づけ、平面図ピン情報（floorMaps）として出力します。

### 対応する平面図画像形式

- jpg
- jpeg
- png
- webp

### project.json 読み込み

読み込み時は以下を確認します。

- JSONとして読み込める
- `project` が存在する
- `panoramas` が配列である

読み込む内容:

- `project`
- `panoramas`
- `floorplans`
- `qa`
- `floorMaps`

既存の `floorMaps` がない場合は空配列として補完します。

### ピン配置

- 平面図上をクリックするとピンを追加する
- 選択中のパノラマがある場合は、そのsceneに紐づけて配置する
- ピンごとに `label`、`panoramaId`、`x`、`y`、`direction`、`note` を編集できる
- 同じパノラマが複数ピンに割り当てられた場合は警告する
- ピン削除に対応する

### ピンドラッグ移動

- 配置済みピンをドラッグして位置を調整できる
- 平面図の空白部分をクリックすると新規ピンを追加する
- ピンを押した場合はドラッグ操作として扱い、新規ピンは追加しない
- 位置はピクセルではなく `x` / `y` の%座標として保存する
- x / y 数値入力でも同じ位置情報を編集できる
- `direction` はドラッグ移動では変更しない
- 移動後の位置は `floor-map.json` と `updated-project.json` に反映される

### x / y %座標

ピン位置は画像ピクセルではなく、画像内の相対位置として保存します。

- `x`: 左端から右方向の割合。0〜100。
- `y`: 上端から下方向の割合。0〜100。

画像サイズに依存しないため、プレビューサイズが変わっても同じ相対位置を再現できます。

### floorMaps スキーマ

```json
{
  "floorMaps": [
    {
      "id": "floor-map-01",
      "name": "1F 平面図",
      "imageFileName": "floorplan-1f.jpg",
      "imagePath": "floorplans/floorplan-1f.jpg",
      "level": "1F",
      "pins": [
        {
          "id": "pin-001",
          "panoramaId": "scene01",
          "label": "エントランス",
          "x": 42.5,
          "y": 63.2,
          "direction": 90,
          "note": ""
        }
      ]
    }
  ]
}
```

### JSON出力

- `floor-map.json`
  - `floorMaps` のみを含む
- `updated-project.json`
  - 元の `project.json` に `floorMaps` を追加または更新したもの
  - 将来のPackager再読み込み、Review Exporter、Share Hub連携を想定

### 今後追加予定

- 複数階管理
- ピンのドラッグ移動強化
- Review Exporter連携

## ツール間の一時受け渡し

案件パッケージ作成から平面図ピン配置へ、また平面図ピン配置から案件パッケージ作成へ、案件データを直接渡せます。

- 保存方式: `sessionStorage`
- 外部送信: なし
- 保存範囲: 同じブラウザタブ内の一時データ

sessionStorageキー:

- `panorama-suite:handoff:project`
  - 案件パッケージ作成 → 平面図ピン配置
- `panorama-suite:handoff:updated-project`
  - 平面図ピン配置 → 案件パッケージ作成

受け渡す内容:

- `project`
- `panoramas`
- `floorplans`
- `qa`
- `floorMaps`
- `createdAt`
- `source`

画像ファイル本体は受け渡しません。画像は容量が大きく、ブラウザ内の一時保存に向かないためです。平面図ピン配置で画像が必要な場合は、平面図画像を再登録します。

往復フロー:

1. 案件パッケージ作成で案件情報、パノラマ、平面図、品質チェック結果を整理する。
2. 「平面図ピン配置へ送る」を押す。
3. 平面図ピン配置で案件データが自動読み込みされる。
4. 必要に応じて平面図画像を再登録する。
5. 平面図にピンを配置する。
6. 「案件パッケージ作成へ戻す」を押す。
7. 案件パッケージ作成で更新済み案件データが自動読み込みされる。
8. ZIPとして保存する。

ZIP化時の注意:

- 受け渡しでは画像ファイル本体を渡さない。
- ZIPに画像を含めるには、必要に応じて同名のパノラマ画像・平面図画像を再登録する。
- 平面図ピン情報は `project.json` と `floor-maps/floor-map.json` に保存される。

## ZIP出力前チェックリスト

案件パッケージ作成では、ZIPを書き出す前に以下を確認できます。

- 案件名が入力されている
- パノラマ画像が1枚以上登録されている
- 平面図画像が登録されている
- 平面図ピン情報がある
- 平面図ピン情報に対応する平面図画像が登録されている
- パノラマの場所名が入力されている
- QA結果にErrorがない
- 実ファイル未登録の項目がない

チェック状態は `OK`、`注意`、`未設定`、`不足` の考え方で表示します。注意項目があってもZIP出力は禁止しません。出力時には注意通知を表示し、ユーザーが内容を確認したうえで保存できるようにします。

### 同名ファイル再登録による紐づき

案件データファイル（project.json）や更新済み案件データ（updated-project.json）から復元した場合、画像ファイル本体は復元されません。

平面図ピン情報の `floorMaps[].imageFileName` と同じ名前の平面図画像を再登録すると、実ファイルとして紐づきます。

- 一致した場合は `紐づき完了` と表示する
- ZIP出力時に `floorplans/` へ画像本体を含められる
- 一致しない場合は不足ファイル一覧にファイル名を表示する
- 不足ファイルがあっても `project.json` と `floor-maps/floor-map.json` には管理情報を残す

## レビュー書き出し 基本機能版

`/review-exporter` で利用できる、案件レビュー用HTMLレポート作成ツールです。

読み込めるデータ:

- 案件データファイル（project.json）
- 更新済み案件データ（updated-project.json）
- Packagerからの一時受け渡しデータ

レポート内容:

- 表紙
- 案件概要
- パノラマ一覧
- 平面図ピン情報
- QA結果
- 注意事項
- データ情報

出力:

- ブラウザ印刷によるPDF保存
- `review-report.html` のHTML書き出し
- `panorama-list.csv` のパノラマ一覧CSV書き出し
- `review-comments.json` のレビューコメント書き出し

Packager連携:

- 案件パッケージ作成の「レビュー書き出しへ送る」から `/review-exporter` へ案件データを渡せます。
- sessionStorageキーは `panorama-suite:handoff:review-project` です。
- 外部API送信は行いません。

### レビューコメント機能

レビュー書き出しでは、会議記録・設計確認・指摘管理用のコメントを入力できます。

コメント対象:

- 案件全体
- パノラマ
- 平面図ピン

保存される主な項目:

- `targetType`
- `targetId`
- `targetLabel`
- `category`
- `priority`
- `status`
- `comment`
- `createdAt`
- `updatedAt`

コメントはレポート、HTML書き出し、印刷 / PDF保存に反映されます。
コメントだけを `review-comments.json` として書き出し、あとから読み込むこともできます。

今後の予定:

- PowerPoint書き出し
- Excel書き出し
- 画像サムネイル付きレポート
- コメント付きレビュー記録
- コメントの案件データファイル統合
- コメント付きPowerPoint書き出し
- コメント一覧Excel書き出し

## サムネイル一覧作成 基本機能版

`/thumbnail-generator` で利用できる、提出・案件管理・レビュー用のサムネイル一覧作成ツールです。

対応入力形式:

- jpg
- jpeg
- png
- webp

基本機能版でできること:

- 複数画像アップロード
- ドラッグ＆ドロップ読み込み
- サムネイル自動生成
- ファイル名と画像サイズの一覧表示
- `thumbnail-index.html` のHTML書き出し
- `thumbnail-list.csv` のCSV書き出し

PDFやPowerPointの直接生成は対象外です。PDF化する場合は、書き出したHTMLをブラウザ印刷で保存します。

## 画像比較 基本機能版

`/panorama-diff` で利用できる、A案・B案などのパノラマ画像を視覚的に比較するツールです。

基本機能版でできること:

- 比較元画像Aの読み込み
- 比較先画像Bの読み込み
- 左右並列表示
- スライダー比較
- ファイル名と画像サイズの表示
- Canvasによる簡易差分表示
- `panorama-diff-report.html` のHTML書き出し
- `panorama-diff.png` の差分画像書き出し

高度なAI差分抽出は対象外です。サイズが違う画像は警告を表示し、表示上のサイズを合わせて比較します。

## 共有パッケージ作成 基本機能版

`/share-hub` で利用できる、案件データファイルを共有用の概要と目録に整理するツールです。

読み込めるデータ:

- 案件データファイル（project.json）
- 更新済み案件データ（updated-project.json）

基本機能版でできること:

- 案件概要表示
- パノラマ数、平面図数、平面図ピン数の表示
- 共有用メモ入力
- 共有対象ファイル一覧表示
- `share-manifest.json` の書き出し
- `share-index.html` の書き出し
- `panorama-share-package.zip` の共有ZIP書き出し

`share-manifest.json` は、案件名、作成日時、共有メモ、件数サマリー、共有対象ファイル一覧を保存するローカル共有用データです。

クラウド共有リンク発行、アップロード、外部サーバー連携は対象外です。

### 共有ZIP出力

共有パッケージ作成では、任意の共有対象ファイルを登録し、共有用ZIPとしてまとめて書き出せます。

ZIP構成:

```text
panorama-share-package.zip
├ share-manifest.json
├ share-index.html
└ files/
   ├ project.json
   ├ updated-project.json
   ├ floor-map.json
   ├ review-report.html
   └ other-files...
```

仕様:

- `share-manifest.json` には案件名、作成日時、共有メモ、件数サマリー、同梱ファイル一覧を保存する
- `share-index.html` は共有内容をブラウザで確認するための簡易HTML
- 登録した共有対象ファイルは `files/` フォルダに入る
- 同名ファイルは連番で回避する
- ファイル名に使えない文字は安全な文字へ置換する
- 案件データファイル未読込、共有メモ未入力、共有対象ファイル0件でもZIP出力は禁止しないが、通知で注意する

今後の予定:

- PDF出力
- PowerPoint出力
- AI差分抽出
- クラウド共有
- NAS連携

## ページ単位の遅延読み込み

ページ数増加に伴う Vite build のJSチャンク警告を軽減するため、各ページコンポーネントを `React.lazy` と `Suspense` で遅延読み込みします。

対象:

- パノラマ品質チェック
- 案件パッケージ作成
- パノラマ画像変換
- 平面図ピン配置
- レビュー書き出し
- サムネイル一覧作成
- 画像比較
- 共有パッケージ作成
- Docs / Help / Design System

Portalと共通フレームは初回表示に必要なため通常読み込みとし、各ツールページはアクセス時に読み込みます。

## ローカル起動方法

```bash
npm install
npm run dev
```

通常は `http://localhost:5173/` で表示できます。
パノラマ品質チェックは `http://localhost:5173/qa` です。
案件パッケージ作成は `http://localhost:5173/packager` です。
パノラマ画像変換は `http://localhost:5173/converter` です。
平面図ピン配置は `http://localhost:5173/floormap` です。
レビュー書き出しは `http://localhost:5173/review-exporter` です。
サムネイル一覧作成は `http://localhost:5173/thumbnail-generator` です。
画像比較は `http://localhost:5173/panorama-diff` です。
共有パッケージ作成は `http://localhost:5173/share-hub` です。
Documentation は `http://localhost:5173/docs` です。
Help は `http://localhost:5173/help` です。
Design System は `http://localhost:5173/docs/design-system` です。

## チェック・ビルド

```bash
npm run check
npm run build
```

`check` は TypeScript の型チェック、`build` は Vercel 公開用の静的ファイル生成を行います。

## デプロイ方針

- GitHub リポジトリ: https://github.com/airesearchagl-art/Panorama-Suite.git
- Vercel の Framework Preset は `Vite` を選択する
- Build Command は `npm run build`
- Output Directory は `dist`
- SPA ルーティングのため、`vercel.json` で全ルートを `index.html` に rewrite する
- 初期段階では環境変数なしで公開可能にする
