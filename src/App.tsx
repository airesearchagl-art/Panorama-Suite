import { Link, Route, Routes } from 'react-router-dom';
import AppFrame from './components/AppFrame';
import { categories, tools, type Tool, type ToolStatus } from './data/tools';
import PanoramaConverterPage from './pages/PanoramaConverterPage';
import PanoramaQaPage from './pages/PanoramaQaPage';
import ProjectPackagerPage from './pages/ProjectPackagerPage';

const statusTone: Record<ToolStatus, string> = {
  公開中: 'statusLive',
  MVP公開中: 'statusLive',
  構想中: 'statusConcept',
  開発予定: 'statusPlanned',
};

function ToolCard({ tool, featured = false }: { tool: Tool; featured?: boolean }) {
  return (
    <article className={`toolCard ${featured ? 'featuredCard' : ''}`}>
      <div className="cardHeader">
        <div>
          <p className="categoryLabel">{tool.category}</p>
          <h3>{tool.name}</h3>
        </div>
        <span className={`statusBadge ${statusTone[tool.status]}`}>{tool.status}</span>
      </div>
      <p className="summary">{tool.summary}</p>
      <ul className="capabilityList" aria-label={`${tool.name} の主な機能`}>
        {tool.capabilities.map((capability) => (
          <li key={capability}>{capability}</li>
        ))}
      </ul>
      <div className="cardFooter">
        <span className="priority">優先度: {tool.priority}</span>
        {tool.path ? (
          <Link to={tool.path} className="toolLink">
            開く
          </Link>
        ) : tool.href ? (
          <a href={tool.href} target="_blank" rel="noreferrer" className="toolLink">
            開く
          </a>
        ) : (
          <span className="pendingText">ロードマップ対象</span>
        )}
      </div>
    </article>
  );
}

function PortalPage() {
  const liveCount = tools.filter((tool) => tool.status === '公開中' || tool.status === 'MVP公開中').length;
  const mvpCount = tools.filter((tool) => tool.status === 'MVP公開中').length;
  const plannedCount = tools.filter((tool) => tool.status !== '公開中' && tool.status !== 'MVP公開中').length;

  return (
    <AppFrame toolName="Portal" status="Workspace">
      <section className="heroSection workspaceHero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Information First / Workspace Style</p>
          <h1 id="page-title">Panorama Suite Portal</h1>
          <p className="lead">360°パノラマ業務を、品質確認、変換、案件管理、共有、レビューへつなぐ作業空間です。</p>
        </div>
        <div className="securityPanel">
          <strong>🔒 Local Processing</strong>
          <span>画像処理はブラウザ内で完結。外部API送信、クラウドアップロードは行いません。</span>
        </div>
      </section>

      <section className="dashboardGrid" aria-label="Portal Dashboard">
        <article className="metricCard"><span>Tools</span><strong>{tools.length}</strong></article>
        <article className="metricCard"><span>Released</span><strong>{liveCount}</strong></article>
        <article className="metricCard"><span>MVP</span><strong>{mvpCount}</strong></article>
        <article className="metricCard"><span>Planned</span><strong>{plannedCount}</strong></article>
      </section>

      <section className="sectionBlock" aria-labelledby="categories-title">
        <div className="sectionHeading">
          <div>
            <p className="sectionKicker">Tool Grid</p>
            <h2 id="categories-title">ツール一覧</h2>
          </div>
          <span className="sectionMeta">Dashboard Driven Workspace</span>
        </div>
        <div className="categoryStack">
          {categories.map((category) => {
            const categoryTools = tools.filter((tool) => tool.category === category);
            return (
              <section className="categoryBand" key={category} aria-labelledby={`${category}-title`}>
                <div className="categoryTitle">
                  <h3 id={`${category}-title`}>{category}</h3>
                  <span>{categoryTools.length} tools</span>
                </div>
                <div className="toolGrid">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.name} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      </section>

      <section className="sectionBlock splitSections" id="documentation">
        <article className="infoPanel">
          <p className="sectionKicker">Recent Updates</p>
          <div className="emptyState smallEmpty">
            <span>📋</span>
            <strong>更新履歴はまだありません</strong>
            <p>リリースノートと変更履歴を次フェーズで整理します。</p>
          </div>
        </article>
        <article className="infoPanel">
          <p className="sectionKicker">Documentation</p>
          <h2>Manual / Help</h2>
          <p>READMEを基点に、各ツールの操作ガイドとFAQを整備します。</p>
        </article>
        <article className="infoPanel">
          <p className="sectionKicker">Security</p>
          <h2>Local Processing</h2>
          <p>画像処理、ZIP生成、QA判定はブラウザ内で完結します。</p>
        </article>
      </section>
    </AppFrame>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<PortalPage />} />
      <Route path="/qa" element={<PanoramaQaPage />} />
      <Route path="/packager" element={<ProjectPackagerPage />} />
      <Route path="/converter" element={<PanoramaConverterPage />} />
    </Routes>
  );
}

export default App;
