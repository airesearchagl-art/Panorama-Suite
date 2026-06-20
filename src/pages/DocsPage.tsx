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
        <article className="metricCard"><span>MVP Tools</span><strong>3</strong></article>
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
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Tool Guide</p>
          <h2>実装済みツール</h2>
          <ul className="docList">
            <li>Portal: ツール群とステータスを俯瞰する入口。</li>
            <li>Panorama QA: 解像度、2:1比率、命名規則を検査。</li>
            <li>Project Packager: 画像、平面図、QA結果、メタ情報をZIP化。</li>
            <li>Panorama Converter: 形式変換、画質調整、リサイズ、ZIP出力。</li>
          </ul>
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
            <li>Packagerで案件情報、画像、QA結果をZIP化する。</li>
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
            <li>平面図ピン配置。</li>
            <li>QA、Converter、Packagerの直接連携。</li>
          </ul>
        </article>
      </section>
    </AppFrame>
  );
}

export default DocsPage;
