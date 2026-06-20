import { Link, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { enabledTools, tools } from '../data/tools';

type AppFrameProps = {
  toolName: string;
  status: string;
  version?: string;
  children: ReactNode;
  sidebar?: ReactNode;
};

function AppFrame({ toolName, status, version = 'v0.1.0', children, sidebar }: AppFrameProps) {
  return (
    <div className="suiteFrame">
      <header className="suiteHeader">
        <Link to="/" className="suiteBrand" aria-label="Panorama Suite Portal">
          <span className="brandMark">PS</span>
          <span>
            <strong>Panorama Suite</strong>
            <small>Professional Panorama Workspace</small>
          </span>
        </Link>
        <div className="suiteHeaderMeta">
          <span className="currentTool">{toolName}</span>
          <span className="statusPill">{status}</span>
          <span className="versionPill">{version}</span>
          <span className="localPill">🔒 Local Processing</span>
        </div>
        <div className="suiteToolbar" aria-label="ツールバー">
          <Link to="/docs" className="button buttonSecondary">
            📖 Manual
          </Link>
          <Link to="/help" className="button buttonSecondary">
            ❔ Help
          </Link>
        </div>
      </header>

      <div className="suiteBody">
        <aside className="suiteSidebar" aria-label="ナビゲーション">
          <nav className="sideNav">
            <span className="sideLabel">Dashboard</span>
            <NavLink to="/">Portal</NavLink>
            <span className="sideLabel">Tools</span>
            {enabledTools
              .filter((tool) => tool.category !== 'Documentation')
              .map((tool) =>
                tool.isExternal && tool.href ? (
                  <a href={tool.href} target="_blank" rel="noreferrer" key={tool.id}>
                    {tool.name} ↗
                  </a>
                ) : (
                  <NavLink to={tool.href ?? '/'} key={tool.id}>{tool.name}</NavLink>
                ),
              )}
            <span className="sideLabel">Coming Soon</span>
            {tools
              .filter((tool) => !tool.isEnabled)
              .map((tool) => (
                <span className="sideDisabledLink" aria-disabled="true" title={tool.statusLabel} key={tool.id}>
                  {tool.name}
                </span>
              ))}
            <span className="sideLabel">Guide</span>
            <NavLink to="/docs">Documentation</NavLink>
            <NavLink to="/help">Help</NavLink>
            <NavLink to="/docs/design-system">Design System</NavLink>
          </nav>
          {sidebar ? <div className="sidePanel">{sidebar}</div> : null}
        </aside>

        <main className="suiteWorkspace">{children}</main>
      </div>

      <footer className="suiteFooter" id="security">
        <span>Version {version}</span>
        <span>🔒 Local Processing: 画像処理はブラウザ内で完結し、外部APIへ送信しません。</span>
        <span>© Panorama Suite</span>
      </footer>
    </div>
  );
}

export default AppFrame;
