import AppFrame from '../components/AppFrame';

const palette = [
  ['Background', '#111827'],
  ['Panel', '#1f2937'],
  ['Card', '#374151'],
  ['Accent', '#4f7cff'],
  ['Success', '#10b981'],
  ['Warning', '#f59e0b'],
  ['Error', '#ef4444'],
];

function DesignSystemPage() {
  return (
    <AppFrame toolName="画面設計ルール" status="v1.0">
      <section className="qaHero workspaceHero">
        <div>
          <p className="eyebrow">画面設計ルール v1.0</p>
          <h1>業務で使いやすい作業画面</h1>
          <p className="lead">Panorama Suite を、360°プロジェクトを扱う人が迷わず使える業務ワークスペースとして統一するためのUIルールです。</p>
        </div>
      </section>

      <section className="docGrid">
        <article className="infoPanel">
          <h2>画面コンセプト</h2>
          <ul className="docList">
            <li>Information First</li>
            <li>Workspace Style</li>
            <li>Dashboard Driven</li>
            <li>Professional Tool</li>
            <li>Calm UI</li>
          </ul>
        </article>
        <article className="infoPanel">
          <h2>色のルール</h2>
          <div className="paletteGrid">
            {palette.map(([name, color]) => (
              <div className="paletteItem" key={name}>
                <span style={{ background: color }} />
                <strong>{name}</strong>
                <code>{color}</code>
              </div>
            ))}
          </div>
        </article>
        <article className="infoPanel">
          <h2>レイアウト</h2>
          <p>全ページをヘッダー、左メニュー、作業エリア、フッターで統一します。</p>
        </article>
        <article className="infoPanel">
          <h2>ダッシュボード</h2>
          <p>各ツールに数値・状態・警告を一目で見られる表示エリアを設置します。</p>
        </article>
        <article className="infoPanel">
          <h2>空の状態</h2>
          <p>空状態では、アイコン、状態説明、次の操作を必ず表示します。</p>
        </article>
        <article className="infoPanel">
          <h2>ローカル処理</h2>
          <p>画像や案件データはブラウザ内で処理することをヘッダーとフッターに常時表示します。</p>
        </article>
        <article className="infoPanel">
          <h2>使い方 / ヘルプ</h2>
          <p>ヘッダーから使い方ガイドとヘルプへ直接移動できるようにします。</p>
        </article>
      </section>
    </AppFrame>
  );
}

export default DesignSystemPage;
