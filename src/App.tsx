import { Link, Route, Routes } from 'react-router-dom';
import AppFrame from './components/AppFrame';
import { ToastProvider, useToast } from './components/ToastProvider';
import { categories, tools, type Tool, type ToolAvailability } from './data/tools';
import DesignSystemPage from './pages/DesignSystemPage';
import DocsPage from './pages/DocsPage';
import HelpPage from './pages/HelpPage';
import PanoramaConverterPage from './pages/PanoramaConverterPage';
import PanoramaQaPage from './pages/PanoramaQaPage';
import ProjectPackagerPage from './pages/ProjectPackagerPage';

const statusTone: Record<ToolAvailability, string> = {
  available: 'statusAvailable',
  mvp: 'statusMvp',
  external: 'statusExternal',
  development: 'statusDevelopment',
  concept: 'statusConcept',
  future: 'statusFuture',
};

function ToolCard({ tool, featured = false }: { tool: Tool; featured?: boolean }) {
  const { notify } = useToast();
  const disabledReason = tool.availability === 'development' ? 'このツールは現在開発中です。' : 'このツールは現在準備中です。';

  const handleDisabledClick = () => {
    notify(disabledReason);
  };

  return (
    <article
      className={`toolCard ${featured ? 'featuredCard' : ''} ${!tool.isEnabled ? 'toolCardDisabled' : ''}`}
      aria-disabled={!tool.isEnabled}
      title={!tool.isEnabled ? disabledReason : undefined}
      onClick={!tool.isEnabled ? handleDisabledClick : undefined}
    >
      <div className="cardHeader">
        <div>
          <p className="categoryLabel">{tool.category}</p>
          <h3>{tool.name}</h3>
        </div>
        <span className={`statusBadge ${statusTone[tool.availability]}`}>{tool.statusLabel}</span>
      </div>
      <p className="summary">{tool.description}</p>
      <ul className="capabilityList" aria-label={`${tool.name} の主な機能`}>
        {tool.capabilities.map((capability) => (
          <li key={capability}>{capability}</li>
        ))}
      </ul>
      <div className="cardFooter">
        <span className="priority">優先度: {tool.priority}</span>
        {tool.isEnabled && tool.href && !tool.isExternal ? (
          <Link to={tool.href} className="toolLink">
            開く
          </Link>
        ) : tool.isEnabled && tool.href && tool.isExternal ? (
          <a
            href={tool.href}
            target="_blank"
            rel="noreferrer"
            className="toolLink"
            onClick={() => notify('外部ツールを開きます。')}
          >
            開く ↗
          </a>
        ) : (
          <button type="button" className="toolLink toolLinkDisabled" disabled onClick={handleDisabledClick} tabIndex={-1}>
            {tool.availability === 'development' ? '開発中' : 'Coming Soon'}
          </button>
        )}
      </div>
    </article>
  );
}

function PortalPage() {
  const availableCount = tools.filter((tool) => tool.isEnabled).length;
  const mvpCount = tools.filter((tool) => tool.availability === 'mvp').length;
  const developmentCount = tools.filter((tool) => tool.availability === 'development').length;
  const futureCount = tools.filter((tool) => tool.availability === 'future' || tool.availability === 'concept').length;

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
        <article className="metricCard successMetric"><span>Available</span><strong>{availableCount}</strong></article>
        <article className="metricCard"><span>MVP</span><strong>{mvpCount}</strong></article>
        <article className="metricCard warningMetric"><span>Development</span><strong>{developmentCount}</strong></article>
        <article className="metricCard"><span>Future</span><strong>{futureCount}</strong></article>
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
    <ToastProvider>
      <Routes>
        <Route path="/" element={<PortalPage />} />
        <Route path="/qa" element={<PanoramaQaPage />} />
        <Route path="/packager" element={<ProjectPackagerPage />} />
        <Route path="/converter" element={<PanoramaConverterPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/docs/design-system" element={<DesignSystemPage />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
