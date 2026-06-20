import AppFrame from '../components/AppFrame';
import { publicUrls } from '../data/publicInfo';

function HelpPage() {
  return (
    <AppFrame toolName="Help" status="Guide">
      <section className="qaHero workspaceHero">
        <div>
          <p className="eyebrow">Help / FAQ</p>
          <h1>操作ヘルプ</h1>
          <p className="lead">よくある操作、エラー時の確認ポイント、公開URLをまとめます。</p>
        </div>
        <div className="securityPanel">
          <strong>🔒 Local Processing</strong>
          <span>画像は外部APIへ送信されません。</span>
        </div>
      </section>

      <section className="docGrid">
        <article className="infoPanel">
          <h2>よくある操作</h2>
          <ul className="docList">
            <li>画像はドラッグ＆ドロップ、またはファイル選択で追加します。</li>
            <li>QA結果はJSON/CSVで出力できます。</li>
            <li>Packagerではproject.jsonを読み込んで再編集できます。</li>
            <li>Converterでは変換後画像を個別またはZIPで保存できます。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <h2>画像を読み込めない場合</h2>
          <p>対応形式は jpg、jpeg、png、webp です。破損ファイル、拡張子不一致、ブラウザ非対応画像の場合は読み込めません。</p>
        </article>

        <article className="infoPanel">
          <h2>ZIP出力できない場合</h2>
          <p>Packagerでは案件名が必須です。未再登録ファイルはproject.jsonには残りますが、ZIP内には含まれません。</p>
        </article>

        <article className="infoPanel">
          <h2>QA結果がWarningになる場合</h2>
          <p>2:1比率でも推奨解像度ではない、または `scene01.jpg` 形式の命名規則に合わない場合はWarningになります。</p>
        </article>

        <article className="infoPanel">
          <h2>project.jsonを読み込めない場合</h2>
          <p>`schemaVersion`、`project`、`panoramas`、`floorplans` が含まれているか確認してください。</p>
        </article>

        <article className="infoPanel">
          <h2>公開URL</h2>
          <ul className="docList">
            <li>Portal: <a href={publicUrls.portal}>{publicUrls.portal}</a></li>
            <li>QA: <a href={publicUrls.qa}>{publicUrls.qa}</a></li>
            <li>Packager: <a href={publicUrls.packager}>{publicUrls.packager}</a></li>
            <li>Converter: <a href={publicUrls.converter}>{publicUrls.converter}</a></li>
          </ul>
        </article>

        <article className="infoPanel">
          <h2>問い合わせ・今後の改善</h2>
          <p>現段階では問い合わせフォームは未実装です。今後、ツール別ヘルプ、操作ガイド、FAQ、通知機能を追加予定です。</p>
        </article>
      </section>
    </AppFrame>
  );
}

export default HelpPage;
