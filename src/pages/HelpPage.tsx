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
          <h2>平面図が表示されない場合</h2>
          <p>FloorMap Builderの対応形式は jpg、jpeg、png、webp です。読み込み後は中央のキャンバスに表示されます。</p>
        </article>

        <article className="infoPanel">
          <h2>FloorMapでproject.jsonを読み込めない場合</h2>
          <p>JSONとして読めること、`project` が存在すること、`panoramas` が配列であることを確認してください。</p>
        </article>

        <article className="infoPanel">
          <h2>ピン位置がずれる場合</h2>
          <p>ピン位置は画像上の x / y %座標で保存します。画像サイズが変わっても相対位置を保ちますが、余白付き画像や別比率の差し替えでは見え方が変わる場合があります。</p>
        </article>

        <article className="infoPanel">
          <h2>x / y %座標とは何か</h2>
          <p>xは左端から右方向、yは上端から下方向の割合です。左上が 0 / 0、右下が 100 / 100 です。</p>
        </article>

        <article className="infoPanel">
          <h2>updated-project.jsonの使い方</h2>
          <p>元のproject.jsonに floorMaps を追加したJSONです。将来のPackager再読み込み、Review Exporter、Share Hub連携に使う想定です。</p>
        </article>

        <article className="infoPanel">
          <h2>ツールが表示されない場合</h2>
          <p>Portalのキーワード、カテゴリ、状態フィルタが有効になっている可能性があります。表示中件数を確認し、必要に応じてリセットしてください。</p>
        </article>

        <article className="infoPanel">
          <h2>フィルタを解除する方法</h2>
          <p>Portalの「リセット」ボタンを押すと、キーワード検索、カテゴリ、状態フィルタをすべて初期状態に戻します。</p>
        </article>

        <article className="infoPanel">
          <h2>Coming Soon表示の意味</h2>
          <p>Coming Soon、開発中、構想中、将来予定のツールはまだ利用できません。カードはグレーアウトされ、クリック操作も無効です。</p>
        </article>

        <article className="infoPanel">
          <h2>Toastが表示された場合</h2>
          <p>右下の通知は、読み込み成功、ZIP出力完了、非対応形式、JSON読込失敗などの操作結果を示します。赤はエラー、黄は注意、緑は成功、青は案内です。</p>
        </article>

        <article className="infoPanel">
          <h2>公開URL</h2>
          <ul className="docList">
            <li>Portal: <a href={publicUrls.portal}>{publicUrls.portal}</a></li>
            <li>QA: <a href={publicUrls.qa}>{publicUrls.qa}</a></li>
            <li>Packager: <a href={publicUrls.packager}>{publicUrls.packager}</a></li>
            <li>Converter: <a href={publicUrls.converter}>{publicUrls.converter}</a></li>
            <li>FloorMap Builder: <a href={publicUrls.floormap}>{publicUrls.floormap}</a></li>
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
