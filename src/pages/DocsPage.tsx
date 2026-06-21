import AppFrame from '../components/AppFrame';
import { appVersion, publicUrls } from '../data/publicInfo';

function DocsPage() {
  return (
    <AppFrame toolName="使い方ガイド" status="ガイド">
      <section className="qaHero workspaceHero">
        <div>
          <p className="eyebrow">仕様・構成を確認する</p>
          <h1>Panorama Suite Manual</h1>
          <p className="lead">Panorama Suite の仕様、構成、公開URL、ローカル処理の考え方を確認するページです。</p>
        </div>
        <div className="securityPanel">
          <strong>公開URL</strong>
          <a href={publicUrls.portal} target="_blank" rel="noreferrer">{publicUrls.portal}</a>
        </div>
      </section>

      <section className="dashboardGrid">
        <article className="metricCard"><span>バージョン</span><strong>{appVersion}</strong></article>
        <article className="metricCard"><span>基本機能版</span><strong>8</strong></article>
        <article className="metricCard successMetric"><span>処理方式</span><strong>ローカル</strong></article>
        <article className="metricCard"><span>公開先</span><strong>Vercel</strong></article>
      </section>

      <section className="docGrid">
        <article className="infoPanel">
          <p className="sectionKicker">Overview</p>
          <h2>Panorama Suite 概要</h2>
          <p>建築設計・施工管理で扱う360度パノラマ画像の品質確認、変換、案件パッケージ化を一つのワークスペースに統合します。</p>
          <p>更新内容はリポジトリの RELEASE_NOTES.md にまとめています。</p>
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
            <li>レビュー書き出し: <a href={publicUrls.reviewExporter}>{publicUrls.reviewExporter}</a></li>
            <li>サムネイル一覧作成: <a href={publicUrls.thumbnailGenerator}>{publicUrls.thumbnailGenerator}</a></li>
            <li>画像比較: <a href={publicUrls.panoramaDiff}>{publicUrls.panoramaDiff}</a></li>
            <li>共有パッケージ作成: <a href={publicUrls.shareHub}>{publicUrls.shareHub}</a></li>
            <li>はじめての使い方: <a href={publicUrls.tutorial}>{publicUrls.tutorial}</a></li>
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
            <li>レビュー書き出し: 案件データを読み込み、印刷・PDF保存しやすいHTMLレポートを作成します。</li>
            <li>サムネイル一覧作成: 複数画像からサムネイル一覧HTMLとCSVを作成します。</li>
            <li>画像比較: A案・B案などの画像を並べて、スライダーと簡易差分で確認します。</li>
            <li>共有パッケージ作成: 案件データファイルの概要と共有用目録を作成します。</li>
            <li>はじめての使い方: 初回利用者向けに、操作順とサンプル案件を案内します。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Tutorial</p>
          <h2>まず試す</h2>
          <ol className="docList">
            <li>Portalの「はじめての方へ」から `/tutorial` を開く。</li>
            <li>品質チェック、画像変換、案件パッケージ作成、平面図ピン配置、レビュー書き出し、共有ZIP作成の順番を確認する。</li>
            <li>サンプル案件のパノラマ数、平面図数、ピン数を見て、どの情報がツール間で使われるか理解する。</li>
            <li>実画像を試す場合は、各ツールページで手元の jpg / png / webp を読み込む。</li>
          </ol>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Sample Run</p>
          <h2>サンプル案件を完走する</h2>
          <ol className="docList">
            <li>PortalまたはTutorialで「サンプル案件を読み込む」を押す。</li>
            <li>各ページに表示されるサンプル案件カードで、パノラマ、平面図、ピン、レビュー項目を確認する。</li>
            <li>Share Hubでは共有メモ例が自動入力され、実ファイル0件でもデモ用のmanifest / index / ZIPを書き出せます。</li>
            <li>実運用では、各ページで手元の画像や案件データファイルを登録してください。</li>
          </ol>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">公開前チェック</p>
          <h2>v2.0 公開版チェック</h2>
          <ul className="docList">
            <li>トップページが開ける。</li>
            <li>チュートリアルに行ける。</li>
            <li>サンプル案件を読み込める。</li>
            <li>各ページに移動できる。</li>
            <li>パノラマ画像が開ける。</li>
            <li>変換結果を確認できる。</li>
            <li>案件情報が整理されている。</li>
            <li>平面図ピンが確認できる。</li>
            <li>レビュー書き出しでレビュー情報を確認できる。</li>
            <li>Share HubでZIPを書き出せる。</li>
            <li>share-index.htmlをブラウザで開ける。</li>
            <li>share-manifest.jsonに案件情報が入っている。</li>
            <li>buildが成功する。</li>
            <li>Viteの500kB超過警告が出ない。</li>
            <li>外部送信しないローカル共有であることを確認する。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">Local Data</p>
          <h2>初回表示とサンプル案件のリセット</h2>
          <p>初回バナーの「あとで見る」とサンプル案件の読込状態は、ブラウザのlocalStorageに保存されます。</p>
          <ul className="docList">
            <li>`panorama-suite:tutorial-dismissed`: 初回バナーの非表示状態。</li>
            <li>`panorama-suite:sample-project`: サンプル案件の読込状態。</li>
            <li>再確認したい場合は、ブラウザの開発者ツールで上記キーを削除してください。</li>
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
          <p className="sectionKicker">ピン位置調整</p>
          <h2>ピンをドラッグして移動する</h2>
          <ul className="docList">
            <li>配置済みのピンを押したまま動かすと、平面図上で位置を調整できます。</li>
            <li>ピン位置は画像内の x / y % 座標として保存されます。</li>
            <li>x / y の数値入力でも位置を調整できます。</li>
            <li>ドラッグ後の位置は floor-map.json と updated-project.json に反映されます。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">レビュー書き出し</p>
          <h2>レビュー用レポートを作成する</h2>
          <ol className="docList">
            <li>案件データファイル（project.json / updated-project.json）を読み込む。</li>
            <li>案件概要、パノラマ一覧、平面図ピン情報、QA結果、注意事項を確認する。</li>
            <li>「印刷 / PDF保存」からブラウザ印刷を開き、PDFとして保存する。</li>
            <li>必要に応じて HTML またはパノラマ一覧CSVを書き出す。</li>
            <li>案件パッケージ作成の「レビュー書き出しへ送る」から直接開くこともできます。</li>
          </ol>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">レビューコメント</p>
          <h2>コメントを入力して記録する</h2>
          <ul className="docList">
            <li>案件全体、パノラマ、平面図ピンを対象にコメントを追加できます。</li>
            <li>種別、優先度、対応状況、コメント本文を入力します。</li>
            <li>入力したコメントはレポート、HTML書き出し、印刷 / PDF保存に反映されます。</li>
            <li>「レビューコメントを書き出し」から review-comments.json を保存できます。</li>
            <li>保存済みの review-comments.json は「レビューコメントを読み込み」から再利用できます。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">サムネイル一覧作成</p>
          <h2>画像一覧を提出用にまとめる</h2>
          <ol className="docList">
            <li>jpg / jpeg / png / webp のパノラマ画像を複数読み込む。</li>
            <li>ファイル名、画像サイズ、サムネイルを一覧で確認する。</li>
            <li>「HTML書き出し」でブラウザ印刷しやすい thumbnail-index.html を保存する。</li>
            <li>「CSV書き出し」で thumbnail-list.csv を保存する。</li>
          </ol>
          <p>基本機能版ではPDFやPowerPointの直接生成は対象外です。PDF化は書き出したHTMLをブラウザ印刷してください。</p>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">画像比較</p>
          <h2>A案・B案を視覚的に比べる</h2>
          <ol className="docList">
            <li>A画像とB画像を読み込む。</li>
            <li>左右並列表示で全体を確認する。</li>
            <li>スライダー比較で同じ位置の違いを確認する。</li>
            <li>簡易差分表示で色の違いが大きい範囲を確認する。</li>
            <li>必要に応じて比較結果HTMLや差分PNGを書き出す。</li>
          </ol>
          <p>基本機能版ではAI差分抽出や高度な画像解析は対象外です。サイズが違う画像は表示上のサイズを合わせて比較します。</p>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">共有パッケージ作成</p>
          <h2>共有用の概要と目録を作る</h2>
          <ol className="docList">
            <li>案件データファイル（project.json / updated-project.json）を読み込む。</li>
            <li>案件概要、パノラマ数、平面図数、平面図ピン数を確認する。</li>
            <li>共有用メモを入力する。</li>
            <li>共有対象ファイルを追加する。</li>
            <li>share-manifest.json、share-index.html、または共有ZIPを書き出す。</li>
          </ol>
          <p>基本機能版ではクラウド共有リンク発行、アップロード、外部サーバー連携は行いません。</p>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">共有ZIP</p>
          <h2>共有ZIPを作る</h2>
          <ol className="docList">
            <li>共有対象ファイル登録エリアへ、project.json、updated-project.json、review-report.html、画像、CSVなどを追加する。</li>
            <li>「共有ZIPを書き出し」を押す。</li>
            <li>ZIP内には share-manifest.json、share-index.html、files/ 配下の登録ファイルが入ります。</li>
            <li>share-manifest.json は案件名、作成日時、共有メモ、件数サマリー、同梱ファイル一覧を記録します。</li>
            <li>share-index.html は共有内容をブラウザで確認するための簡易HTMLです。</li>
          </ol>
          <p>共有ZIPはローカルで作成されます。外部送信やクラウドアップロードは行いません。</p>
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
          <p className="sectionKicker">ZIP出力前</p>
          <h2>ZIP出力前チェックリスト</h2>
          <ul className="docList">
            <li>案件名、パノラマ画像、平面図画像、平面図ピン情報、QA結果を出力前に確認できます。</li>
            <li>平面図ピン情報に記録された画像名と、登録済み平面図画像のファイル名が一致しているか確認します。</li>
            <li>不足している平面図画像がある場合は、同じファイル名の画像を平面図画像として再登録してください。</li>
            <li>注意項目があってもZIP出力は可能です。提出・共有前に内容を確認してください。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">直接連携</p>
          <h2>案件データを平面図ピン配置へ送る</h2>
          <ol className="docList">
            <li>案件パッケージ作成で、案件情報、パノラマ、平面図、品質チェック結果を整理する。</li>
            <li>「平面図ピン配置へ送る」を押すと、案件データがブラウザタブ内の一時データとして保存される。</li>
            <li>平面図ピン配置ページへ移動すると、案件名、パノラマ一覧、平面図一覧、平面図ピン情報が自動で読み込まれる。</li>
            <li>この受け渡しは sessionStorage を使います。外部送信は行いません。</li>
            <li>画像ファイル本体は受け渡し対象外です。必要に応じて平面図画像を再登録してください。</li>
            <li>従来どおり、案件データファイル（project.json / updated-project.json）を手動で読み込む方法も利用できます。</li>
          </ol>
        </article>

        <article className="infoPanel">
          <p className="sectionKicker">戻し連携</p>
          <h2>平面図ピン配置から案件パッケージ作成へ戻す</h2>
          <ol className="docList">
            <li>平面図ピン配置でピンを配置・編集する。</li>
            <li>「案件パッケージ作成へ戻す」を押す。</li>
            <li>更新済み案件データがブラウザ内の一時データとして保存され、案件パッケージ作成へ移動する。</li>
            <li>案件パッケージ作成では、平面図ピン配置から受け取ったデータとして自動読み込みされる。</li>
            <li>画像ファイル本体は受け渡し対象外です。ZIPに含めるには、同名のパノラマ画像・平面図画像を必要に応じて再登録してください。</li>
            <li>手動で進める場合は、平面図ピン配置で更新済み案件データ（updated-project.json）を書き出し、案件パッケージ作成で読み込めます。</li>
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
            <li>はじめての使い方で、全体の流れと用語を確認する。</li>
            <li>パノラマ品質チェックで画像のサイズ、比率、名前を確認する。</li>
            <li>パノラマ画像変換で形式と解像度を整える。</li>
            <li>案件パッケージ作成で案件情報、シーンごとの管理情報、画像、品質チェック結果をZIP化する。</li>
            <li>平面図ピン配置で平面図に撮影位置ピンを配置する。</li>
            <li>更新済み案件データを書き出す。</li>
            <li>案件パッケージ作成で再読み込みする。</li>
            <li>ZIPとして保存する。</li>
            <li>レビュー書き出しでレポートを確認し、印刷 / PDF保存する。</li>
            <li>サムネイル一覧作成で提出・案件管理用の画像一覧を作る。</li>
            <li>画像比較でA案・B案などの差分を確認する。</li>
            <li>共有パッケージ作成で共有用の概要とファイル目録を整理する。</li>
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
