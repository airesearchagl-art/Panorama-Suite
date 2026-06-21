import { useMemo, useState } from 'react';
import AppFrame from '../components/AppFrame';
import { useToast } from '../components/ToastProvider';

type ShareProject = {
  project?: {
    projectName?: string;
    clientName?: string;
    manager?: string;
    purpose?: string;
    description?: string;
  };
  panoramas?: Array<{ id?: string; fileName?: string; path?: string }>;
  floorplans?: Array<{ id?: string; fileName?: string; path?: string }>;
  floorMaps?: Array<{
    id?: string;
    name?: string;
    imageFileName?: string;
    pins?: Array<unknown>;
  }>;
  qa?: {
    resultPath?: string;
    summary?: {
      total?: number;
      ok?: number;
      warning?: number;
      error?: number;
    };
  };
};

type ShareFile = {
  type: string;
  fileName: string;
  path: string;
};

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function downloadText(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildShareFiles(project: ShareProject): ShareFile[] {
  const files: ShareFile[] = [];
  project.panoramas?.forEach((item) => {
    if (item.fileName) files.push({ type: 'パノラマ', fileName: item.fileName, path: item.path ?? `panoramas/${item.fileName}` });
  });
  project.floorplans?.forEach((item) => {
    if (item.fileName) files.push({ type: '平面図', fileName: item.fileName, path: item.path ?? `floorplans/${item.fileName}` });
  });
  if (project.qa?.resultPath) {
    files.push({ type: '品質チェック結果', fileName: project.qa.resultPath.split('/').pop() ?? 'qa-results.json', path: project.qa.resultPath });
  }
  if ((project.floorMaps?.length ?? 0) > 0) {
    files.push({ type: '平面図ピン情報', fileName: 'floor-map.json', path: 'floor-maps/floor-map.json' });
  }
  return files;
}

function ShareHubPage() {
  const { notify } = useToast();
  const [projectData, setProjectData] = useState<ShareProject | null>(null);
  const [note, setNote] = useState('');

  const floorMapPins = useMemo(() => projectData?.floorMaps?.reduce((sum, floorMap) => sum + (floorMap.pins?.length ?? 0), 0) ?? 0, [projectData]);
  const shareFiles = useMemo(() => projectData ? buildShareFiles(projectData) : [], [projectData]);
  const projectName = projectData?.project?.projectName?.trim() || '未設定の案件';

  const readProjectFile = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ShareProject;
      if (!parsed.project || !Array.isArray(parsed.panoramas) || !Array.isArray(parsed.floorplans)) {
        throw new Error('案件データファイルではありません');
      }
      setProjectData({
        ...parsed,
        floorMaps: Array.isArray(parsed.floorMaps) ? parsed.floorMaps : [],
      });
      notify('案件データファイルを読み込みました', 'success');
    } catch {
      notify('ファイルを読み込めませんでした', 'error');
    }
  };

  const createManifest = () => ({
    projectName,
    createdAt: new Date().toISOString(),
    note,
    summary: {
      panoramas: projectData?.panoramas?.length ?? 0,
      floorplans: projectData?.floorplans?.length ?? 0,
      floorMapPins,
    },
    files: shareFiles,
  });

  const exportManifest = () => {
    if (!projectData) {
      notify('案件データファイルを読み込んでください', 'warning');
      return;
    }
    downloadText('share-manifest.json', JSON.stringify(createManifest(), null, 2), 'application/json;charset=utf-8');
    notify('共有用データを書き出しました', 'success');
  };

  const exportHtml = () => {
    if (!projectData) {
      notify('案件データファイルを読み込んでください', 'warning');
      return;
    }
    const manifest = createManifest();
    const fileRows = manifest.files.map((file) => `<tr><td>${escapeHtml(file.type)}</td><td>${escapeHtml(file.fileName)}</td><td>${escapeHtml(file.path)}</td></tr>`).join('');
    const html = `<!doctype html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>share-index</title>
<style>body{font-family:Inter,"Segoe UI","Noto Sans JP",sans-serif;margin:32px;color:#111827}table{width:100%;border-collapse:collapse}td,th{border-bottom:1px solid #d1d5db;padding:8px;text-align:left}p{color:#4b5563}.metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin:20px 0}.metric{border:1px solid #d1d5db;border-radius:8px;padding:12px}.metric strong{display:block;font-size:24px}@media(max-width:760px){.metrics{grid-template-columns:1fr 1fr}}</style></head>
<body>
  <h1>共有パッケージ概要</h1>
  <p>案件名: ${escapeHtml(manifest.projectName)}</p>
  <p>作成日時: ${new Date(manifest.createdAt).toLocaleString('ja-JP')}</p>
  <p>${escapeHtml(manifest.note || '共有メモはありません')}</p>
  <section class="metrics">
    <div class="metric"><span>パノラマ</span><strong>${manifest.summary.panoramas}</strong></div>
    <div class="metric"><span>平面図</span><strong>${manifest.summary.floorplans}</strong></div>
    <div class="metric"><span>ピン</span><strong>${manifest.summary.floorMapPins}</strong></div>
    <div class="metric"><span>共有ファイル</span><strong>${manifest.files.length}</strong></div>
  </section>
  <table><thead><tr><th>種別</th><th>ファイル名</th><th>パス</th></tr></thead><tbody>${fileRows}</tbody></table>
</body></html>`;
    downloadText('share-index.html', html, 'text/html;charset=utf-8');
    notify('共有用HTMLを書き出しました', 'success');
  };

  return (
    <AppFrame toolName="共有パッケージ作成" status="基本機能版">
      <section className="heroSection qaHero" aria-labelledby="share-title">
        <div>
          <p className="eyebrow">Share Hub</p>
          <h1 id="share-title">共有パッケージ作成</h1>
          <p className="lead">案件データファイルの内容を確認し、共有用の目録と概要ファイルを作成します。</p>
        </div>
        <div className="qaActions">
          <button type="button" className="button buttonPrimary" onClick={exportManifest} disabled={!projectData}>共有用データを書き出し</button>
          <button type="button" className="button buttonSecondary" onClick={exportHtml} disabled={!projectData}>共有HTMLを書き出し</button>
        </div>
      </section>

      <section className="dashboardGrid" aria-label="共有パッケージ作成 Dashboard">
        <article className="metricCard"><span>パノラマ</span><strong>{projectData?.panoramas?.length ?? 0}</strong></article>
        <article className="metricCard"><span>平面図</span><strong>{projectData?.floorplans?.length ?? 0}</strong></article>
        <article className="metricCard"><span>ピン</span><strong>{floorMapPins}</strong></article>
        <article className="metricCard"><span>共有ファイル</span><strong>{shareFiles.length}</strong></article>
      </section>

      <section className="sectionBlock shareWorkspace">
        <label className="dropZone compactDropZone">
          <input
            type="file"
            accept=".json,application/json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void readProjectFile(file);
              event.target.value = '';
            }}
          />
          <span>📦</span>
          <strong>案件データファイルを読み込む</strong>
          <p>project.json / updated-project.json を選択してください。</p>
        </label>

        <label className="formField">
          <span>共有用メモ</span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="共有先、確認事項、提出目的などを入力できます。"
          />
        </label>
      </section>

      {!projectData ? (
        <section className="sectionBlock">
          <div className="emptyState">
            <span>📦</span>
            <strong>案件データファイルを読み込んでください</strong>
            <p>案件概要、パノラマ数、平面図数、ピン数、共有対象ファイルを表示します。</p>
          </div>
        </section>
      ) : (
        <section className="sectionBlock" aria-labelledby="share-overview-title">
          <div className="sectionHeading">
            <div>
              <p className="sectionKicker">Share Overview</p>
              <h2 id="share-overview-title">{projectName}</h2>
            </div>
            <span className="sectionMeta">ローカル処理</span>
          </div>
          <div className="docGrid">
            <article className="infoPanel">
              <h3>案件概要</h3>
              <dl className="summaryList">
                <div><dt>施主名</dt><dd>{projectData.project?.clientName || '未設定'}</dd></div>
                <div><dt>担当者</dt><dd>{projectData.project?.manager || '未設定'}</dd></div>
                <div><dt>用途</dt><dd>{projectData.project?.purpose || '未設定'}</dd></div>
              </dl>
            </article>
            <article className="infoPanel">
              <h3>共有対象ファイル</h3>
              {shareFiles.length === 0 ? (
                <p>共有対象ファイルはまだありません。</p>
              ) : (
                <ul className="docList">
                  {shareFiles.map((file) => (
                    <li key={`${file.type}-${file.path}`}>{file.type}: {file.fileName}</li>
                  ))}
                </ul>
              )}
            </article>
          </div>
        </section>
      )}
    </AppFrame>
  );
}

export default ShareHubPage;
