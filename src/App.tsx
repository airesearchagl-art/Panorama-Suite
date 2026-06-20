import { Link, Route, Routes } from 'react-router-dom';
import { categories, featuredTools, tools, type Tool, type ToolStatus } from './data/tools';
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
  const plannedCount = tools.filter((tool) => tool.status !== '公開中' && tool.status !== 'MVP公開中').length;

  return (
    <main className="appShell">
      <section className="heroSection" aria-labelledby="page-title">
        <div className="heroCopy">
          <p className="eyebrow">建築設計・施工管理向け 360° Panorama Operations</p>
          <h1 id="page-title">Panorama Suite Portal</h1>
          <p className="lead">
            作成、変換、品質確認、案件管理、レビュー、共有、VR確認までをつなぐ統合ポータル。
            既存公開ツールと今後の開発予定を同じ業務導線上に整理します。
          </p>
        </div>
        <dl className="metricsPanel" aria-label="ポータル概要">
          <div>
            <dt>カテゴリ</dt>
            <dd>{categories.length}</dd>
          </div>
          <div>
            <dt>公開中</dt>
            <dd>{liveCount}</dd>
          </div>
          <div>
            <dt>計画中</dt>
            <dd>{plannedCount}</dd>
          </div>
        </dl>
      </section>

      <section className="sectionBlock" aria-labelledby="featured-title">
        <div className="sectionHeading">
          <p className="sectionKicker">Priority</p>
          <h2 id="featured-title">最優先ツール</h2>
        </div>
        <div className="featuredGrid">
          {featuredTools.map((tool) => (
            <ToolCard key={tool.name} tool={tool} featured />
          ))}
        </div>
      </section>

      <section className="sectionBlock" aria-labelledby="categories-title">
        <div className="sectionHeading">
          <p className="sectionKicker">Tool Map</p>
          <h2 id="categories-title">カテゴリ別ツール一覧</h2>
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
    </main>
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
