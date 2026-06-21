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
          <strong>🔒 ローカル処理</strong>
          <span>画像や案件データはブラウザ内で処理します。</span>
        </div>
      </section>

      <section className="docGrid">
        <article className="infoPanel">
          <h2>よくある操作</h2>
          <ul className="docList">
            <li>画像はドラッグ＆ドロップ、またはファイル選択で追加します。</li>
            <li>QA結果はJSON/CSVで出力できます。</li>
            <li>案件パッケージ作成では、案件データファイル（project.json）を読み込んで再編集できます。</li>
            <li>パノラマ画像変換では、変換後画像を個別またはZIPで保存できます。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <h2>画像を読み込めない場合</h2>
          <p>対応形式は jpg、jpeg、png、webp です。破損ファイル、拡張子不一致、ブラウザ非対応画像の場合は読み込めません。</p>
        </article>

        <article className="infoPanel">
          <h2>ZIP出力できない場合</h2>
          <p>案件パッケージ作成では案件名が必須です。未再登録ファイルは案件データファイル（project.json）には残りますが、ZIP内には含まれません。</p>
        </article>

        <article className="infoPanel">
          <h2>QA結果がWarningになる場合</h2>
          <p>2:1比率でも推奨解像度ではない、または `scene01.jpg` 形式の命名規則に合わない場合はWarningになります。</p>
        </article>

        <article className="infoPanel">
          <h2>案件データファイル（project.json）を読み込めない場合</h2>
          <p>データ形式のバージョン（schemaVersion）、案件情報、パノラマ一覧、平面図一覧が含まれているか確認してください。</p>
        </article>

        <article className="infoPanel">
          <h2>平面図が表示されない場合</h2>
          <p>平面図ピン配置の対応形式は jpg、jpeg、png、webp です。読み込み後は中央のキャンバスに表示されます。</p>
        </article>

        <article className="infoPanel">
          <h2>平面図ピン配置で案件データを読み込めない場合</h2>
          <p>JSONとして読めること、案件情報、パノラマ一覧が含まれていることを確認してください。</p>
        </article>

        <article className="infoPanel">
          <h2>ピン位置がずれる場合</h2>
          <p>ピン位置は画像上の x / y %座標で保存します。画像サイズが変わっても相対位置を保ちますが、余白付き画像や別比率の差し替えでは見え方が変わる場合があります。</p>
        </article>

        <article className="infoPanel">
          <h2>ピンをドラッグできない場合</h2>
          <p>平面図画像が読み込まれているか確認してください。ピンの丸い部分を押したまま動かすと移動できます。空白部分をクリックすると新しいピンが追加されます。</p>
        </article>

        <article className="infoPanel">
          <h2>x / y %座標とは何か</h2>
          <p>xは左端から右方向、yは上端から下方向の割合です。左上が 0 / 0、右下が 100 / 100 です。</p>
        </article>

        <article className="infoPanel">
          <h2>タッチ操作時の注意</h2>
          <p>Pointer Events に対応しているためタッチ操作でも移動できますが、端末やブラウザによってはスクロール操作と干渉する場合があります。細かな調整は x / y 数値入力を使ってください。</p>
        </article>

        <article className="infoPanel">
          <h2>更新済み案件データ（updated-project.json）は何に使いますか？</h2>
          <p>元の案件データファイルに平面図ピン情報（floorMaps）を追加したJSONです。案件パッケージ作成で再読み込みし、ZIPに同梱できます。</p>
        </article>

        <article className="infoPanel">
          <h2>平面図ピン情報が表示されない場合</h2>
          <p>読み込んだ案件データファイルに `floorMaps` が含まれているか確認してください。平面図ピン情報ファイルだけを持っている場合は、専用の読み込みボタンから読み込んでください。</p>
        </article>

        <article className="infoPanel">
          <h2>平面図ピン情報ファイル（floor-map.json）が読み込めない場合</h2>
          <p>`floorMaps` 配列を含むJSONか確認してください。平面図ピン配置で書き出したファイルを使うのが基本です。</p>
        </article>

        <article className="infoPanel">
          <h2>平面図画像が未登録と表示される場合</h2>
          <p>平面図ピン情報内の画像ファイル名と、案件パッケージ作成に登録済みの平面図ファイル名が一致していません。同名の平面図画像を再登録してください。</p>
        </article>

        <article className="infoPanel">
          <h2>ZIPに平面図画像が含まれない場合</h2>
          <p>案件データファイルや平面図ピン情報ファイルには、平面図のファイル名とパスだけが保存されます。画像本体は案件パッケージ作成で実ファイルを登録した場合のみZIPに含まれます。</p>
        </article>

        <article className="infoPanel">
          <h2>同名ファイル再登録とは何ですか？</h2>
          <p>案件データに残っているファイル名と同じ名前の画像を、もう一度登録する操作です。同じファイル名で登録すると、平面図ピン情報と画像本体が紐づき、ZIPに含められます。</p>
        </article>

        <article className="infoPanel">
          <h2>注意項目が表示されてもZIP出力してよいですか？</h2>
          <p>ZIP出力は可能です。ただし、画像本体が未登録の項目はZIPに含まれません。提出や共有に使う場合は、ZIP出力前チェックリストの内容を確認してください。</p>
        </article>

        <article className="infoPanel">
          <h2>基本機能版とは何ですか？</h2>
          <p>主要な業務に使える初期版です。細かな自動連携や高度な編集機能は今後追加予定です。</p>
        </article>

        <article className="infoPanel">
          <h2>準備中のツールは使えますか？</h2>
          <p>まだ利用できません。カードはグレーアウトされ、クリック操作も無効です。</p>
        </article>

        <article className="infoPanel">
          <h2>案件データファイル（project.json）とは何ですか？</h2>
          <p>案件名、画像一覧、平面図、品質チェック結果、平面図ピン情報などをまとめて保存する管理用ファイルです。</p>
        </article>

        <article className="infoPanel">
          <h2>平面図ピン情報（floorMaps）とは何ですか？</h2>
          <p>平面図画像と、その上に置いたパノラマ撮影位置のピンをまとめた情報です。</p>
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
          <h2>カテゴリ名の意味</h2>
          <ul className="docList">
            <li>書き出し: 他ツールや提出用にデータを出す機能です。</li>
            <li>変換: 画像形式、サイズ、向きなどを整える機能です。</li>
            <li>品質チェック: パノラマ画像のサイズ、比率、名前を確認する機能です。</li>
            <li>管理: 案件情報、画像、平面図、ピン情報をまとめる機能です。</li>
            <li>レビュー: 設計案や現場状況を確認する機能です。</li>
            <li>共有: 社内外へ配布・共有するための機能です。</li>
            <li>VR確認: VR端末で確認するための機能です。</li>
            <li>ドキュメント: 使い方や出力資料を扱う機能です。</li>
          </ul>
        </article>

        <article className="infoPanel">
          <h2>平面図ピン配置へ進むタイミング</h2>
          <p>案件パッケージ作成でパノラマ画像と案件データファイルを用意した後に進みます。平面図に撮影位置を配置したら、更新済み案件データを書き出し、案件パッケージ作成で再読み込みしてZIP保存します。</p>
        </article>

        <article className="infoPanel">
          <h2>「平面図ピン配置へ送る」を押しても画像が表示されない場合</h2>
          <p>直接受け渡しでは案件情報、パノラマ一覧、平面図名、ピン情報だけを渡します。画像ファイル本体は渡さないため、平面図画像が必要な場合は平面図ピン配置ページで再登録してください。</p>
        </article>

        <article className="infoPanel">
          <h2>受け渡しデータをクリアする方法</h2>
          <p>平面図ピン配置ページに表示される「受け渡しデータをクリア」を押すと、ブラウザタブ内の一時データを削除できます。削除しても、画面に読み込まれている案件データは手動で再読み込みできます。</p>
        </article>

        <article className="infoPanel">
          <h2>平面図ピン配置から戻したのに画像がZIPに入らない場合</h2>
          <p>「案件パッケージ作成へ戻す」で渡るのは案件情報と平面図ピン情報です。画像ファイル本体は渡らないため、ZIPに含めたい画像は案件パッケージ作成で同じファイル名の画像を再登録してください。</p>
        </article>

        <article className="infoPanel">
          <h2>受け取ったデータをクリアする方法</h2>
          <p>案件パッケージ作成に表示される「受け取ったデータをクリア」を押すと、平面図ピン配置から戻した一時データを削除できます。</p>
        </article>

        <article className="infoPanel">
          <h2>手動で updated-project.json を読み込む方法</h2>
          <p>平面図ピン配置で「更新済み案件データ」を書き出し、案件パッケージ作成の「案件データファイルを読み込む」から updated-project.json を選択してください。</p>
        </article>

        <article className="infoPanel">
          <h2>案件データは渡るのに画像本体が渡らない理由</h2>
          <p>画像ファイルは容量が大きく、ブラウザ内の一時保存に向きません。安全性と安定性を優先し、受け渡し対象は管理情報とJSON相当のデータに限定しています。</p>
        </article>

        <article className="infoPanel">
          <h2>手動で案件データファイルを読み込む方法</h2>
          <p>平面図ピン配置ページの「案件データファイルを読み込む」から、案件データファイル（project.json）または更新済み案件データ（updated-project.json）を選択してください。</p>
        </article>

        <article className="infoPanel">
          <h2>レビュー書き出しとは何ですか？</h2>
          <p>案件データファイルを読み込み、案件概要、パノラマ一覧、平面図ピン情報、QA結果、注意事項をまとめたレビュー用HTMLレポートを作る機能です。</p>
        </article>

        <article className="infoPanel">
          <h2>PDF保存する方法</h2>
          <p>レビュー書き出しページで「印刷 / PDF保存」を押し、ブラウザの印刷画面で保存先をPDFにしてください。</p>
        </article>

        <article className="infoPanel">
          <h2>レビュー書き出しで案件データを読み込めない場合</h2>
          <p>project または panoramas が含まれる project.json / updated-project.json か確認してください。JSON形式が壊れている場合は読み込めません。</p>
        </article>

        <article className="infoPanel">
          <h2>QA結果が表示されない場合</h2>
          <p>案件データ内に qa.summary が含まれていない場合は「QA結果は読み込まれていません」と表示されます。先に品質チェック結果を案件パッケージ作成へ読み込んでください。</p>
        </article>

        <article className="infoPanel">
          <h2>レビュー書き出しの注意事項が表示された場合</h2>
          <p>場所名未入力、QA Error、未割当ピン、平面図画像未登録などを示しています。提出前に案件パッケージ作成や平面図ピン配置で修正してください。</p>
        </article>

        <article className="infoPanel">
          <h2>印刷時にレイアウトが崩れる場合</h2>
          <p>ブラウザの印刷設定で用紙をA4、余白を標準または狭い、背景グラフィックを必要に応じて有効にしてください。</p>
        </article>

        <article className="infoPanel">
          <h2>コメントが保存されない場合</h2>
          <p>レビューコメントはブラウザ内の画面状態として保持されます。ページを閉じる前に「レビューコメントを書き出し」で review-comments.json を保存してください。</p>
        </article>

        <article className="infoPanel">
          <h2>コメントを書き出す方法</h2>
          <p>レビュー書き出しページでコメントを入力し、「レビューコメントを書き出し」を押すと review-comments.json として保存できます。</p>
        </article>

        <article className="infoPanel">
          <h2>コメントを読み込む方法</h2>
          <p>「レビューコメントを読み込み」から review-comments.json を選択してください。読み込んだコメントはレポートにも反映されます。</p>
        </article>

        <article className="infoPanel">
          <h2>コメントがPDFに出ない場合</h2>
          <p>コメントを追加したあとに「印刷 / PDF保存」を実行してください。印刷対象にはレポート内のレビューコメントセクションが含まれます。</p>
        </article>

        <article className="infoPanel">
          <h2>コメントの優先度・対応状況の意味</h2>
          <p>優先度は対応の重要度、高・中・低を示します。対応状況は未対応、確認中、対応済み、保留で管理します。</p>
        </article>

        <article className="infoPanel">
          <h2>準備中表示の意味</h2>
          <p>準備中、開発中、構想中、将来予定のツールはまだ利用できません。カードはグレーアウトされ、クリック操作も無効です。</p>
        </article>

        <article className="infoPanel">
          <h2>通知が表示された場合</h2>
          <p>右下の通知は、読み込み成功、ZIP出力完了、非対応形式、JSON読込失敗などの操作結果を示します。赤はエラー、黄は注意、緑は成功、青は案内です。</p>
        </article>

        <article className="infoPanel">
          <h2>ローカル処理とは何ですか？</h2>
          <p>画像や案件データをブラウザ内で処理する方式です。外部APIへ画像を送信しません。</p>
        </article>

        <article className="infoPanel">
          <h2>公開URL</h2>
          <ul className="docList">
            <li>Portal: <a href={publicUrls.portal}>{publicUrls.portal}</a></li>
            <li>QA: <a href={publicUrls.qa}>{publicUrls.qa}</a></li>
            <li>Packager: <a href={publicUrls.packager}>{publicUrls.packager}</a></li>
            <li>Converter: <a href={publicUrls.converter}>{publicUrls.converter}</a></li>
            <li>平面図ピン配置: <a href={publicUrls.floormap}>{publicUrls.floormap}</a></li>
            <li>レビュー書き出し: <a href={publicUrls.reviewExporter}>{publicUrls.reviewExporter}</a></li>
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
