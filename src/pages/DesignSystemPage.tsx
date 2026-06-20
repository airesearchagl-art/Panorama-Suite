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
    <AppFrame toolName="Design System" status="v1.0">
      <section className="qaHero workspaceHero">
        <div>
          <p className="eyebrow">Design System v1.0</p>
          <h1>Professional Panorama Workspace</h1>
          <p className="lead">Panorama Suite を、360°プロジェクトを操作する業務ワークスペースとして統一するためのUIルールです。</p>
        </div>
      </section>

      <section className="docGrid">
        <article className="infoPanel">
          <h2>Design Concept</h2>
          <ul className="docList">
            <li>Information First</li>
            <li>Workspace Style</li>
            <li>Dashboard Driven</li>
            <li>Professional Tool</li>
            <li>Calm UI</li>
          </ul>
        </article>
        <article className="infoPanel">
          <h2>Color Palette</h2>
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
          <h2>Layout</h2>
          <p>全ページを Header / Sidebar / Main Workspace / Footer で統一します。</p>
        </article>
        <article className="infoPanel">
          <h2>Dashboard Rules</h2>
          <p>各ツールに数値・状態・警告を一目で見られるDashboardを設置します。</p>
        </article>
        <article className="infoPanel">
          <h2>Empty State Rules</h2>
          <p>空状態では、アイコン、状態説明、次の操作を必ず表示します。</p>
        </article>
        <article className="infoPanel">
          <h2>Local Processing</h2>
          <p>画像処理はブラウザ内で完結することをHeaderとFooterに常時表示します。</p>
        </article>
        <article className="infoPanel">
          <h2>Manual / Help</h2>
          <p>HeaderからDocumentationとHelpへ直接遷移できるようにします。</p>
        </article>
      </section>
    </AppFrame>
  );
}

export default DesignSystemPage;
