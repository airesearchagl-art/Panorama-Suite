import { Link, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { enabledTools, tools } from '../data/tools';
import { appVersion } from '../data/publicInfo';

const guideToolIds = new Set(['documentation', 'help', 'design-system']);

type AppFrameProps = {
  toolName: string;
  status: string;
  version?: string;
  children: ReactNode;
  sidebar?: ReactNode;
};

function AppFrame({ toolName, status, version = appVersion, children, sidebar }: AppFrameProps) {
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
          <span className="localPill">🔒 ローカル処理</span>
        </div>
        <div className="suiteToolbar" aria-label="ツールバー">
          <Link to="/tutorial" className="button buttonPrimary">
            はじめての方へ
          </Link>
          <Link to="/docs" className="button buttonSecondary">
            📖 使い方
          </Link>
          <Link to="/help" className="button buttonSecondary">
            ❔ ヘルプ
          </Link>
        </div>
      </header>

      <div className="suiteBody">
        <aside className="suiteSidebar" aria-label="ナビゲーション">
          <nav className="sideNav">
            <span className="sideLabel">ダッシュボード</span>
            <NavLink to="/">Portal</NavLink>
            <span className="sideLabel">ツール</span>
            {enabledTools
              .filter((tool) => !guideToolIds.has(tool.id))
              .map((tool) =>
                tool.isExternal && tool.href ? (
                  <a href={tool.href} target="_blank" rel="noreferrer" key={tool.id}>
                    {tool.displayName} ↗
                  </a>
                ) : (
                  <NavLink to={tool.href ?? '/'} key={tool.id}>{tool.displayName}</NavLink>
                ),
              )}
            <span className="sideLabel">準備中</span>
            {tools
              .filter((tool) => !tool.isEnabled)
              .map((tool) => (
                <span className="sideDisabledLink" aria-disabled="true" title={tool.statusLabel} key={tool.id}>
                  {tool.displayName}
                </span>
              ))}
            <span className="sideLabel">ガイド</span>
            <NavLink to="/tutorial">はじめての使い方</NavLink>
            <NavLink to="/docs">使い方ガイド</NavLink>
            <NavLink to="/help">ヘルプ</NavLink>
            <NavLink to="/docs/design-system">画面設計ルール</NavLink>
          </nav>
          {sidebar ? <div className="sidePanel">{sidebar}</div> : null}
        </aside>

        <main className="suiteWorkspace">{children}</main>
      </div>

      <footer className="suiteFooter" id="security">
        <span>バージョン {version}</span>
        <span>🔒 ローカル処理: 画像や案件データはブラウザ内で処理し、外部APIへ送信しません。</span>
        <span>© Panorama Suite</span>
      </footer>
    </div>
  );
}

export default AppFrame;
