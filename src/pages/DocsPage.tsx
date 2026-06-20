import AppFrame from '../components/AppFrame';
import { publicUrls } from '../data/publicInfo';

function DocsPage() {
  return (
    <AppFrame toolName="使い方ガイド" status="ガイド">
      <section className="qaHero workspaceHero">
        <div>
          <p className="eyebrow">使い方ガイド / ドキュメント</p>
          <h1>Panorama Suite Manual</h1>
          <p className="lead">Panorama Suite の概要、公開URL、ツールの役割、基本フロー、セキュリティ方針をまとめます。</p>
        </div>
        <div className="securityPanel">
          <strong>公開URL</strong>
          <a href={publicUrls.portal} target="_blank" rel="noreferrer">{publicUrls.portal}</a>
        </div>
      </section>

      <section className="dashboardGrid">
        <article className="metricCard"><span>バージョン</span><strong>v0.1.0</strong></article>
        <article className="metricCard"><span>基本機能版</span><strong>4</strong></article>
        <article className="metricCard successMetric"><span>処理方式</span><strong>ローカル</strong></article>
        <article className="metricCard"><span>公開先</span><strong>Vercel</strong></article>
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
            <li>パノラマ品質チェック: <a href={publicUrls.qa}>{publicUrls.qa}</a></li>
            <li>案件パッケージ作成: <a href={publicUrls.packager}>{publicUrls.packager}</a></li>
            <li>パノラマ画像変換: <a href={publicUrls.converter}>{publicUrls.converter}</a></li>
            <li>平面図ピン配置: <a href={publicUrls.floormap}>{publicUrls.floormap}</a></li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Tool Guide</p>
          <h2>実装済みツール</h2>
          <ul className="docList">
            <li>Portal: ツール群とステータスを俯瞰する入口。</li>
            <li>パノラマ品質チェック: 画像のサイズ、比率、名前を確認します。</li>
            <li>案件パッケージ作成: 画像、平面図、管理情報をZIPにまとめます。</li>
            <li>パノラマ画像変換: 画像形式、画質、サイズを変換します。</li>
            <li>平面図ピン配置: 平面図上にパノラマ撮影位置を配置します。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Availability</p>
          <h2>ツールカードの状態表示</h2>
          <ul className="docList">
            <li>基本機能版: 主要な機能を使える初期版です。</li>
            <li>外部公開中: 別URLで公開されている既存ツールです。`↗` 付きで新規タブを開きます。</li>
            <li>開発中: 実装中のためクリックできません。</li>
            <li>構想中 / 将来予定: 今後追加予定のツールです。準備中として表示します。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Portal Filter</p>
          <h2>検索・絞り込み</h2>
          <ul className="docList">
            <li>キーワード検索はツール名、説明、カテゴリ、状態ラベルを対象にします。</li>
            <li>カテゴリは 書き出し / 変換 / 品質チェック / 管理 / レビュー / 共有 / VR確認 / ドキュメント で絞り込めます。</li>
            <li>状態は 利用可能 / 基本機能版 / 外部ツール / 開発中 / 構想中 / 将来予定 で絞り込めます。</li>
            <li>カテゴリと状態は同時に指定できます。0件の場合はEmpty Stateを表示します。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Notification</p>
          <h2>通知</h2>
          <ul className="docList">
            <li>success: 読み込み、変換、ZIP出力、ダウンロードなどが完了した状態です。</li>
            <li>warning: 非対応形式、不足ファイル、未実装ツールなど注意が必要な状態です。</li>
            <li>error: JSON読み込み失敗、画像変換失敗など操作が完了できなかった状態です。</li>
            <li>info: 外部ツール遷移など、補足情報を表示します。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Packager Guide</p>
          <h2>シーンごとの管理情報編集</h2>
          <ol className="docList">
            <li>パノラマ画像を登録する。</li>
            <li>各sceneに階、場所名、方位、シーン種別、コメント、表示順を設定する。</li>
            <li>パノラマ品質チェックで出力した結果JSONを読み込む。</li>
            <li>案件データファイル（project.json）付きZIPを書き出す。</li>
            <li>後から案件データファイルを読み込んで再編集する。</li>
          </ol>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">平面図ピン配置ガイド</p>
          <h2>平面図ピン配置</h2>
          <ol className="docList">
            <li>平面図画像を読み込む。</li>
            <li>案件パッケージ作成で出力した案件データファイル（project.json）を読み込む。</li>
            <li>配置するパノラマを選ぶ。</li>
            <li>平面図をクリックしてピンを置く。</li>
            <li>x / y %座標、方位、ラベル、コメントを調整する。</li>
            <li>平面図ピン情報ファイル（floor-map.json）を書き出す。</li>
            <li>更新済み案件データ（updated-project.json）を書き出す。</li>
          </ol>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Packager v0.3</p>
          <h2>平面図ピン情報をZIPに同梱する</h2>
          <ol className="docList">
            <li>平面図ピン配置で更新済み案件データ（updated-project.json）を書き出す。</li>
            <li>案件パッケージ作成の案件データファイル読み込みから、更新済み案件データを読み込む。</li>
            <li>平面図ピン情報ファイル（floor-map.json）だけを反映したい場合は、専用の読み込みボタンを使う。</li>
            <li>平面図ピン情報一覧で平面図名、階、ピン数、平面図ファイル状態を確認する。</li>
            <li>不足平面図画像がある場合は、同名の平面図実ファイルを再登録する。</li>
            <li>ZIP出力すると案件データファイルと `floor-maps/floor-map.json` に平面図ピン情報が保存される。</li>
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
          <p className="sectionKicker">作業フロー</p>
          <h2>基本的な利用フロー</h2>
          <ol className="docList">
            <li>パノラマ品質チェックで画像のサイズ、比率、名前を確認する。</li>
            <li>パノラマ画像変換で形式と解像度を整える。</li>
            <li>案件パッケージ作成で案件情報、シーンごとの管理情報、画像、品質チェック結果をZIP化する。</li>
            <li>平面図ピン配置で平面図に撮影位置ピンを配置する。</li>
            <li>更新済み案件データを書き出す。</li>
            <li>案件パッケージ作成で再読み込みする。</li>
            <li>ZIPとして保存する。</li>
            <li>レビュー・共有・アーカイブへ展開する。</li>
          </ol>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">安全性</p>
          <h2>ローカル処理</h2>
          <p>画像処理、QA判定、ZIP生成はブラウザ内で完結します。外部API送信やクラウドアップロードは行いません。</p>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">今後の予定</p>
          <h2>今後のロードマップ</h2>
          <ul className="docList">
            <li>ドキュメントとヘルプの拡張。</li>
            <li>案件パッケージ作成のシーンごとの管理情報編集。</li>
            <li>平面図ピン配置と案件パッケージ作成の直接連携。</li>
            <li>品質チェック、画像変換、案件パッケージ作成の直接連携。</li>
          </ul>
        </article>
      </section>
    </AppFrame>
  );
}

export default DocsPage;
