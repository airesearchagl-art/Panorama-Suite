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
| Review | Archview360 | 公開中 | 建築パノラマの閲覧・レビュー |
| Convert | Panorama Flipper | 公開中 | パノラマ画像の反転補正 |
| QA | Panorama QA | 開発予定 | 解像度、2:1比率、対応形式、命名規則の検査 |
| Manage | Panorama Project Packager | 開発予定 | 案件データのZIP化、引継ぎ、アーカイブ |
| Convert | Panorama Converter | 開発予定 | jpg/png/webp/tif/hdr/exr などの形式変換 |
| Export | SketchUp Panorama Export | 構想中 | レンダラーやSketchUpからの出力整理 |
| Manage | Panorama Metadata Manager | 開発予定 | 案件名、施主名、担当者、用途、備考の管理 |
| Manage | FloorMap Builder | 構想中 | 平面図登録、ピン配置、方位補正 |
| Review | Panorama Diff | 構想中 | A案/B案の差分比較 |
| Documentation | Review Exporter | 開発予定 | レビュー結果のPDF/Excel/PowerPoint/HTML出力 |
| Documentation | Panorama Thumbnail Generator | 構想中 | パノラマ目録の作成 |
| Share | Panorama Share Hub | 構想中 | 共有リンク、更新履歴、配布管理 |
| VR | Panorama VR Launcher | 構想中 | VR端末向けの閲覧導線 |
| Review | Panorama AI Assistant | 構想中 | 画像解析とレビュー支援 |
| Documentation | Panorama Docs | 構想中 | チュートリアル、運用ルール、更新履歴 |

## 優先順位

最優先:

- Panorama QA
- Panorama Project Packager
- Panorama Converter

次点:

- Review Exporter
- Panorama Metadata Manager
- Panorama Thumbnail Generator

将来:

- Panorama Diff
- Panorama VR Launcher
- Panorama AI Assistant

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

## Panorama Project Packager MVP

`/packager` で利用できる、案件単位のZIPパッケージ作成ツールです。
パノラマ画像、平面図、Panorama QA の結果JSON、案件メタデータをまとめ、引継ぎ・バックアップ・アーカイブに使える構成で出力します。

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
  - Panorama QA v0.1 が出力したJSON

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

### 今後追加予定

- 平面図ピン配置
- sceneごとの階・場所・方位設定
- QAとの直接連携
- Review Exporter連携
- Share Hub連携

## Panorama Converter MVP

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
- Panorama QAとの連携
- Project Packagerとの連携

## ローカル起動方法

```bash
npm install
npm run dev
```

通常は `http://localhost:5173/` で表示できます。
Panorama QA は `http://localhost:5173/qa` です。
Panorama Project Packager は `http://localhost:5173/packager` です。
Panorama Converter は `http://localhost:5173/converter` です。

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
