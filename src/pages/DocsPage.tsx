import AppFrame from '../components/AppFrame';
import { publicUrls } from '../data/publicInfo';

function DocsPage() {
  return (
    <AppFrame toolName="Documentation" status="Manual">
      <section className="qaHero workspaceHero">
        <div>
          <p className="eyebrow">Manual / Documentation</p>
          <h1>Panorama Suite Manual</h1>
          <p className="lead">Panorama Suite の概要、公開URL、ツールの役割、基本フロー、セキュリティ方針をまとめます。</p>
        </div>
        <div className="securityPanel">
          <strong>公開URL</strong>
          <a href={publicUrls.portal} target="_blank" rel="noreferrer">{publicUrls.portal}</a>
        </div>
      </section>

      <section className="dashboardGrid">
        <article className="metricCard"><span>Version</span><strong>v0.1.0</strong></article>
        <article className="metricCard"><span>MVP Tools</span><strong>4</strong></article>
        <article className="metricCard successMetric"><span>Processing</span><strong>Local</strong></article>
        <article className="metricCard"><span>Release</span><strong>Vercel</strong></article>
      </section>

      <section className="docGrid">
        <article className="infoPanel">
          <p className="sectionKicker">Overview</p>
          <h2>Panorama Suite 概要</h2>
          <p>建築設計・施工管理で扱う360度パノラマ画像の品質確認、変換、案件パッケージ化を一つのワークスペースに統合します。</p>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Public URL</p>
          <h2>公開URL</h2>
          <ul className="docList">
            <li>Portal: <a href={publicUrls.portal}>{publicUrls.portal}</a></li>
            <li>Panorama QA: <a href={publicUrls.qa}>{publicUrls.qa}</a></li>
            <li>Project Packager: <a href={publicUrls.packager}>{publicUrls.packager}</a></li>
            <li>Panorama Converter: <a href={publicUrls.converter}>{publicUrls.converter}</a></li>
            <li>FloorMap Builder: <a href={publicUrls.floormap}>{publicUrls.floormap}</a></li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Tool Guide</p>
          <h2>実装済みツール</h2>
          <ul className="docList">
            <li>Portal: ツール群とステータスを俯瞰する入口。</li>
            <li>Panorama QA: 解像度、2:1比率、命名規則を検査。</li>
            <li>Project Packager: 画像、平面図、QA結果、scene別メタ情報をZIP化。</li>
            <li>Panorama Converter: 形式変換、画質調整、リサイズ、ZIP出力。</li>
            <li>FloorMap Builder: 平面図上にパノラマsceneの撮影位置ピンを配置。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Availability</p>
          <h2>ツールカードの状態表示</h2>
          <ul className="docList">
            <li>MVP公開中: 内部ツールとして利用可能な初期公開版です。</li>
            <li>外部公開中: 別URLで公開されている既存ツールです。`↗` 付きで新規タブを開きます。</li>
            <li>開発中: 実装中のためクリックできません。</li>
            <li>構想中 / 将来予定: ロードマップ対象です。Coming Soonとして表示します。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Portal Filter</p>
          <h2>検索・絞り込み</h2>
          <ul className="docList">
            <li>キーワード検索はツール名、説明、カテゴリ、状態ラベル、availabilityを対象にします。</li>
            <li>カテゴリは Export / Convert / QA / Manage / Review / Share / VR / Documentation で絞り込めます。</li>
            <li>状態は Available / MVP / External / Development / Concept / Future で絞り込めます。</li>
            <li>カテゴリと状態は同時に指定できます。0件の場合はEmpty Stateを表示します。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Notification</p>
          <h2>Toast通知</h2>
          <ul className="docList">
            <li>success: 読み込み、変換、ZIP出力、ダウンロードなどが完了した状態です。</li>
            <li>warning: 非対応形式、不足ファイル、未実装ツールなど注意が必要な状態です。</li>
            <li>error: JSON読み込み失敗、画像変換失敗など操作が完了できなかった状態です。</li>
            <li>info: 外部ツール遷移など、補足情報を表示します。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Packager Guide</p>
          <h2>scene別メタ情報編集</h2>
          <ol className="docList">
            <li>パノラマ画像を登録する。</li>
            <li>各sceneに階、場所名、方位、シーン種別、コメント、表示順を設定する。</li>
            <li>Panorama QAで出力したQA結果JSONを読み込む。</li>
            <li>project.json付きZIPを出力する。</li>
            <li>後からproject.jsonを読み込んで再編集する。</li>
          </ol>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">FloorMap Builder Guide</p>
          <h2>平面図ピン配置</h2>
          <ol className="docList">
            <li>平面図画像を読み込む。</li>
            <li>Project Packagerで出力したproject.jsonを読み込む。</li>
            <li>配置するパノラマを選ぶ。</li>
            <li>平面図をクリックしてピンを置く。</li>
            <li>x / y %座標、方位、ラベル、コメントを調整する。</li>
            <li>floor-map.jsonを書き出す。</li>
            <li>updated-project.jsonを書き出す。</li>
          </ol>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">External Tools</p>
          <h2>既存外部ツール</h2>
          <ul className="docList">
            <li><a href="https://arch-view360.vercel.app/">Archview360</a>: 建築パノラマ閲覧・レビュー。</li>
            <li><a href="https://panorama-flipper.vercel.app/">Panorama Flipper</a>: パノラマ画像の反転補正。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Workflow</p>
          <h2>基本的な利用フロー</h2>
          <ol className="docList">
            <li>Converterで形式と解像度を整える。</li>
            <li>QAで初期品質を確認する。</li>
            <li>Packagerで案件情報、scene別メタ情報、画像、QA結果をZIP化する。</li>
            <li>FloorMap Builderで平面図に撮影位置ピンを配置する。</li>
            <li>レビュー・共有・アーカイブへ展開する。</li>
          </ol>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Security</p>
          <h2>Local Processing</h2>
          <p>画像処理、QA判定、ZIP生成はブラウザ内で完結します。外部API送信やクラウドアップロードは行いません。</p>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Roadmap</p>
          <h2>今後のロードマップ</h2>
          <ul className="docList">
            <li>DocumentationとHelpの拡張。</li>
            <li>Packagerのscene別メタ情報編集。</li>
            <li>FloorMap BuilderとPackagerの直接連携。</li>
            <li>QA、Converter、Packagerの直接連携。</li>
          </ul>
        </article>
      </section>
    </AppFrame>
  );
}

export default DocsPage;
