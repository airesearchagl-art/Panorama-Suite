import { useMemo, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import AppFrame from './components/AppFrame';
import { ToastProvider, useToast } from './components/ToastProvider';
import { availabilityLabels, categories, getCategoryLabel, tools, type Tool, type ToolAvailability, type ToolCategory } from './data/tools';
import DesignSystemPage from './pages/DesignSystemPage';
import DocsPage from './pages/DocsPage';
import FloorMapBuilderPage from './pages/FloorMapBuilderPage';
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
  const disabledReason = tool.availability === 'development'
    ? 'このツールは現在開発中です。'
    : 'このツールは現在準備中です。今後の更新で追加予定です。';

  const handleDisabledClick = () => {
    notify(disabledReason, tool.availability === 'development' ? 'warning' : 'info');
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
          <p className="categoryLabel">{getCategoryLabel(tool.category)}</p>
          <h3>{tool.displayName}</h3>
          {tool.displayName !== tool.name ? <small className="toolEnglishName">{tool.name}</small> : null}
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
            onClick={() => notify('外部ツールを開きます。', 'info')}
          >
            開く ↗
          </a>
        ) : (
          <button type="button" className="toolLink toolLinkDisabled" disabled onClick={handleDisabledClick} tabIndex={-1}>
            {tool.availability === 'development' ? '開発中' : '準備中'}
          </button>
        )}
      </div>
    </article>
  );
}

function PortalPage() {
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ToolCategory | 'All'>('All');
  const [availabilityFilter, setAvailabilityFilter] = useState<ToolAvailability | 'All'>('All');
  const availableCount = tools.filter((tool) => tool.isEnabled).length;
  const mvpCount = tools.filter((tool) => tool.availability === 'mvp').length;
  const roadmapCount = tools.filter((tool) => ['development', 'concept', 'future'].includes(tool.availability)).length;
  const availabilityOptions = Object.keys(availabilityLabels) as ToolAvailability[];
  const filteredTools = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return tools.filter((tool) => {
      const matchesKeyword =
        normalizedKeyword.length === 0 ||
        [tool.name, tool.displayName, tool.description, tool.category, getCategoryLabel(tool.category), tool.statusLabel, tool.availability]
          .join(' ')
          .toLowerCase()
          .includes(normalizedKeyword);
      const matchesCategory = categoryFilter === 'All' || tool.category === categoryFilter;
      const matchesAvailability = availabilityFilter === 'All' || tool.availability === availabilityFilter;
      return matchesKeyword && matchesCategory && matchesAvailability;
    });
  }, [availabilityFilter, categoryFilter, keyword]);
  const hasActiveFilters = keyword.trim().length > 0 || categoryFilter !== 'All' || availabilityFilter !== 'All';

  const resetFilters = () => {
    setKeyword('');
    setCategoryFilter('All');
    setAvailabilityFilter('All');
  };

  return (
    <AppFrame toolName="Portal" status="Workspace">
      <section className="heroSection workspaceHero" aria-labelledby="page-title">
        <div>
          <p className="eyebrow">Information First / Workspace Style</p>
          <h1 id="page-title">Panorama Suite Portal</h1>
          <p className="lead">360°パノラマ業務を、品質確認、変換、案件管理、共有、レビューへつなぐ作業空間です。</p>
        </div>
        <div className="securityPanel">
          <strong>🔒 ローカル処理</strong>
          <span>画像や案件データはブラウザ内で処理します。外部API送信、クラウドアップロードは行いません。</span>
        </div>
      </section>

      <section className="dashboardGrid" aria-label="Portal Dashboard">
        <article className="metricCard"><span>ツール数</span><strong>{tools.length}</strong></article>
        <article className="metricCard successMetric"><span>利用可能</span><strong>{availableCount}</strong></article>
        <article className="metricCard"><span>基本機能版</span><strong>{mvpCount}</strong></article>
        <article className="metricCard warningMetric"><span>今後追加予定</span><strong>{roadmapCount}</strong></article>
        <article className="metricCard"><span>表示中</span><strong>{filteredTools.length}</strong></article>
      </section>

      <section className="sectionBlock" aria-labelledby="categories-title">
        <div className="sectionHeading">
          <div>
            <p className="sectionKicker">Tool Grid</p>
            <h2 id="categories-title">ツール一覧</h2>
          </div>
          <span className="sectionMeta">Dashboard Driven Workspace</span>
        </div>
        <div className="filterPanel" aria-label="Portal filter">
          <label>
            <span>キーワード検索</span>
            <input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="ツール名 / カテゴリ / 状態"
              type="search"
            />
          </label>
          <label>
            <span>カテゴリ</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value as ToolCategory | 'All')}>
              <option value="All">すべて</option>
              {categories.map((category) => (
                <option value={category} key={category}>{getCategoryLabel(category)}</option>
              ))}
            </select>
          </label>
          <label>
            <span>状態</span>
            <select
              value={availabilityFilter}
              onChange={(event) => setAvailabilityFilter(event.target.value as ToolAvailability | 'All')}
            >
              <option value="All">すべて</option>
              {availabilityOptions.map((availability) => (
                <option value={availability} key={availability}>{availabilityLabels[availability]}</option>
              ))}
            </select>
          </label>
          <button type="button" className="button buttonSecondary" onClick={resetFilters} disabled={!hasActiveFilters}>
            リセット
          </button>
          <div className="filterState" aria-live="polite">
            <strong>表示中: {filteredTools.length} / {tools.length} 件</strong>
            <span>カテゴリ: {categoryFilter === 'All' ? 'すべて' : getCategoryLabel(categoryFilter)}</span>
            <span>状態: {availabilityFilter === 'All' ? 'すべて' : availabilityLabels[availabilityFilter]}</span>
          </div>
        </div>
        <div className="categoryStack">
          {categories.map((category) => {
            const categoryTools = filteredTools.filter((tool) => tool.category === category);
            if (categoryTools.length === 0) {
              return null;
            }
            return (
              <section className="categoryBand" key={category} aria-labelledby={`${category}-title`}>
                <div className="categoryTitle">
                  <h3 id={`${category}-title`}>{getCategoryLabel(category)}</h3>
                  <span>{categoryTools.length} 件</span>
                </div>
                <div className="toolGrid">
                  {categoryTools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              </section>
            );
          })}
          {filteredTools.length === 0 ? (
            <div className="emptyState filterEmpty">
              <span>🔍</span>
              <strong>該当するツールがありません</strong>
              <p>フィルタ条件を変更してください。</p>
              <button type="button" className="button buttonSecondary" onClick={resetFilters}>
                フィルタをリセット
              </button>
            </div>
          ) : null}
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
          <h2>ローカル処理</h2>
          <p>画像処理、ZIP生成、品質判定はブラウザ内で完結します。</p>
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
        <Route path="/floormap" element={<FloorMapBuilderPage />} />
        <Route path="/docs" element={<DocsPage />} />
        <Route path="/help" element={<HelpPage />} />
        <Route path="/docs/design-system" element={<DesignSystemPage />} />
      </Routes>
    </ToastProvider>
  );
}

export default App;
