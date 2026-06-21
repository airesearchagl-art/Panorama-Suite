import { Link } from 'react-router-dom';
import AppFrame from '../components/AppFrame';
import { useToast } from '../components/ToastProvider';
import { sampleProject, saveSampleProjectState } from '../data/sampleProject';

const tutorialSteps = [
  {
    title: '1. パノラマ画像を確認する',
    description: 'Viewerで見え方を確認し、パノラマ品質チェックで画像形式、サイズ、2:1比率、ファイル名を確認します。',
    href: '/qa',
    action: '品質チェックを開く',
    externalHref: 'https://arch-view360.vercel.app/',
    externalAction: 'Viewerを開く ↗',
  },
  {
    title: '2. 画像を変換・補正する',
    description: 'パノラマ画像変換で、提出や管理に合わせて形式・画質・解像度を整えます。',
    href: '/converter',
    action: '画像変換を開く',
  },
  {
    title: '3. 案件パッケージを作る',
    description: '案件パッケージ作成で、画像、平面図、品質チェック結果、案件情報をまとめます。',
    href: '/packager',
    action: '案件パッケージ作成を開く',
  },
  {
    title: '4. 平面図とピンを整理する',
    description: '平面図ピン配置で、どの場所で撮影したパノラマかを平面図上に配置します。',
    href: '/floormap',
    action: '平面図ピン配置を開く',
  },
  {
    title: '5. レビュー用に書き出す',
    description: 'レビュー書き出しで、会議や確認用のHTMLレポート、印刷用PDF、コメントを整理します。',
    href: '/review-exporter',
    action: 'レビュー書き出しを開く',
  },
  {
    title: '6. Share Hubで共有ZIPを作る',
    description: '共有パッケージ作成で、共有メモ、目録、関連ファイルをZIPにまとめます。',
    href: '/share-hub',
    action: '共有パッケージ作成を開く',
  },
];

const glossaryItems = [
  ['パノラマ / 360画像', '周囲を360度見渡せる画像です。建築レビューでは現地確認や設計確認に使います。'],
  ['FloorMap', '平面図とパノラマ位置を結びつける情報です。画面上では「平面図ピン情報」と説明します。'],
  ['Pin', '平面図上に置く撮影位置の印です。どのパノラマがどこで撮られたかを示します。'],
  ['Review Export', '案件データを確認用レポートとして書き出す機能です。会議記録や施主確認に使います。'],
  ['Share ZIP', '共有用のHTML、目録データ、関連ファイルをまとめたZIPです。外部送信せずローカルで作成します。'],
  ['share-manifest.json', '共有ZIPに含まれる目録データです。案件名、メモ、同梱ファイル一覧を記録します。'],
];

function TutorialPage() {
  const { notify } = useToast();
  const loadSampleProject = () => {
    saveSampleProjectState();
    notify('サンプル案件を読み込みました', 'success');
  };

  return (
    <AppFrame toolName="はじめての使い方" status="v1.8">
      <section className="heroSection workspaceHero" aria-labelledby="tutorial-title">
        <div>
          <p className="eyebrow">まず試す / Sample Workflow</p>
          <h1 id="tutorial-title">はじめての使い方</h1>
          <p className="lead">
            Panorama Suiteを公開URLで初めて開いたら、まずこのページで目的、使う順番、サンプル案件、共有ZIP作成までの流れを確認してください。
          </p>
        </div>
        <div className="securityPanel">
          <strong>🔒 ローカル処理</strong>
          <span>チュートリアルで扱う案件データや画像はブラウザ内で処理します。外部APIへ送信しません。</span>
          <button type="button" className="button buttonPrimary" onClick={loadSampleProject}>
            サンプル案件を読み込む
          </button>
        </div>
      </section>

      <section className="sectionBlock">
        <div className="sectionHeading">
          <div>
            <p className="sectionKicker">Recommended Flow</p>
            <h2>基本フロー</h2>
          </div>
          <span className="sectionMeta">6 steps</span>
        </div>
        <div className="tutorialStepGrid">
          {tutorialSteps.map((step, index) => (
            <article className="tutorialStepCard" key={step.href}>
              <span className="statusBadge statusMvp">Step {index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
              <p className="stepNextText">
                {index < tutorialSteps.length - 1 ? `次: ${tutorialSteps[index + 1].title}` : '完走: Share Hubで共有ZIPを書き出します'}
              </p>
              <div className="tutorialStepActions">
                <Link to={step.href} className="button buttonPrimary">このステップを開く</Link>
                {'externalHref' in step ? (
                  <a href={step.externalHref} target="_blank" rel="noreferrer" className="button buttonSecondary">
                    {step.externalAction}
                  </a>
                ) : null}
                {index < tutorialSteps.length - 1 ? (
                  <Link to={tutorialSteps[index + 1].href} className="button buttonSecondary">次に進む</Link>
                ) : (
                  <Link to="/share-hub" className="button buttonSecondary">Share Hubへ進む</Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="sectionBlock">
        <div className="sectionHeading">
          <div>
            <p className="sectionKicker">Sample Project</p>
            <h2>サンプル案件で流れを確認</h2>
          </div>
          <span className="sectionMeta">実画像なしで確認できます</span>
        </div>
        <div className="sampleProjectPanel">
          <article className="infoPanel">
            <h3>{sampleProject.projectName}</h3>
            <p>{sampleProject.description}</p>
            <p>{sampleProject.shareNote}</p>
            <button type="button" className="button buttonPrimary" onClick={loadSampleProject}>
              サンプル案件を読み込む
            </button>
          </article>
          <div className="dashboardGrid compactDashboard">
            <article className="metricCard"><span>パノラマ</span><strong>{sampleProject.summary.panoramas}</strong></article>
            <article className="metricCard"><span>平面図</span><strong>{sampleProject.summary.floorplans}</strong></article>
            <article className="metricCard"><span>ピン</span><strong>{sampleProject.summary.pins}</strong></article>
          </div>
        </div>
        <p className="sectionNote">サンプル案件はメタ情報のみです。実画像ファイルは含まれないため、画像処理を試す場合は手元の jpg / png / webp を読み込んでください。</p>
        <div className="sampleListGrid">
          <article className="infoPanel">
            <h3>サンプルパノラマ</h3>
            <ul className="docList">
              {sampleProject.panoramas.map((panorama) => (
                <li key={panorama.id}>{panorama.fileName}: {panorama.floor} / {panorama.locationName}</li>
              ))}
            </ul>
          </article>
          <article className="infoPanel">
            <h3>サンプルレビュー項目</h3>
            <ul className="docList">
              {sampleProject.reviewNotes.map((note) => (
                <li key={note.id}>{note.target}: {note.comment}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="sectionBlock">
        <div className="sectionHeading">
          <div>
            <p className="sectionKicker">Glossary</p>
            <h2>重要用語</h2>
          </div>
        </div>
        <div className="glossaryGrid">
          {glossaryItems.map(([term, description]) => (
            <article className="infoPanel" key={term}>
              <h3>{term}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>
    </AppFrame>
  );
}

export default TutorialPage;
