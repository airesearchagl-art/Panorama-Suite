import { Link, NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';

type AppFrameProps = {
  toolName: string;
  status: string;
  version?: string;
  children: ReactNode;
  sidebar?: ReactNode;
};

function AppFrame({ toolName, status, version = 'v0.1.0', children, sidebar }: AppFrameProps) {
  const showManual = () => {
    window.alert('Manual は README / Documentation への導線として整備予定です。');
  };

  const showHelp = () => {
    window.alert('Help は今後、各ツールの操作ガイドとして実装予定です。画像処理はすべてブラウザ内で完結します。');
  };

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
          <button type="button" className="button buttonSecondary" onClick={showManual}>
            📖 Manual
          </button>
          <button type="button" className="button buttonSecondary" onClick={showHelp}>
            ❔ Help
          </button>
        </div>
      </header>

      <div className="suiteBody">
        <aside className="suiteSidebar" aria-label="ナビゲーション">
          <nav className="sideNav">
            <span className="sideLabel">Dashboard</span>
            <NavLink to="/">Portal</NavLink>
            <span className="sideLabel">Tools</span>
            <NavLink to="/qa">Panorama QA</NavLink>
            <NavLink to="/packager">Project Packager</NavLink>
            <NavLink to="/converter">Panorama Converter</NavLink>
            <span className="sideLabel">Guide</span>
            <a href="#security">Security</a>
            <a href="#documentation">Documentation</a>
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
