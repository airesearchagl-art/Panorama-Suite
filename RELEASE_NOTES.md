# Release Notes

## v2.0.0

- v1.9リリース候補を正式な公開版として確定。
- Vercel本番URL、主要ルート、Tutorial、サンプル案件、Share Hubの共有ZIP導線を公開前QA対象として整理。
- READMEを利用者向けの入口、サンプル案件、共有ZIP、ローカル処理、開発者向け手順の順に最終化。
- 主要画面スクリーンショットを `public/screenshots/` に追加し、GitHub上で画面イメージを確認できるようにした。
- v2.0.0タグとGitHub Release用の本文を準備。
- 新機能追加ではなく、GitHub / Vercelで共有できる公開版リリースとして区切った。

## v1.9

- v2.0公開前のリリース候補として、主要ルート、Tutorial、サンプル案件、Share Hub、Docs、Help、READMEの導線をQA。
- サンプル案件からShare Hubの共有ZIPまで進む流れを再確認。
- 公開前チェック、localStorageリセット案内、空状態・注意表示の文言を強化。
- Vite buildで500kB超過警告が出ない状態を確認。

## v1.8

- GitHub / Vercel公開向けにREADME、Docs、Help、Tutorial、画面内文言を整理。
- `index.html` のtitle、description、OGP相当meta、theme colorを更新。
- 画面内バージョンを `v1.8` に統一。
- 公開前チェックリストを強化。

## v1.7

- サンプル案件を読み込んで、Converter、Packager、FloorMap、Review Exporter、Share Hubまで確認できる導線を追加。
- Share Hubでサンプルメタ情報からデモ用の共有ZIPを作成可能にした。
- 公開前QAの基本項目をDocs / Help / READMEへ追加。

## v1.6

- `/tutorial` を追加。
- 初回ユーザー向けの「はじめての使い方」とサンプル案件を追加。
- 主要ページに「このページでできること」説明を追加。

## v1.5

- Share Hubに共有ZIP出力を追加。
- `share-manifest.json`、`share-index.html`、`files/` 構成を整備。
- React.lazy / Suspense によるページ単位の遅延読み込みを導入。

## v1.4

- サムネイル一覧作成、画像比較、共有パッケージ作成を基本機能版として追加。

## v1.3

- レビュー書き出しを追加し、レビューコメント入力・読み込み・書き出しに対応。

## v1.2

- 平面図ピン配置を追加。
- Packagerとの往復受け渡し、ピンドラッグ移動、FloorMap情報のZIP同梱に対応。

## v1.1

- Panorama QA、Panorama Converter、Project Packagerを基本機能版として整備。
- 案件データファイル、ZIP出力、品質チェック結果連携を追加。

## v1.0

- Panorama Suite Portalを作成。
- ツールカード、カテゴリ、利用状態、外部ツール導線を整備。
