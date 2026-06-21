import { useEffect, useMemo, useRef, useState } from 'react';
import AppFrame from '../components/AppFrame';
import { useToast } from '../components/ToastProvider';
import { loadReviewProjectHandoff } from '../data/handoff';

type ProjectInfo = {
  projectName?: string;
  clientName?: string;
  manager?: string;
  purpose?: string;
  createdAt?: string;
  updatedAt?: string;
  description?: string;
};

type PanoramaItem = {
  id: string;
  fileName: string;
  floor: string;
  locationName: string;
  sceneType: string;
  direction: number;
  qaStatus: string;
  note: string;
};

type FloorplanItem = {
  id: string;
  fileName: string;
  path: string;
  level: string;
  description: string;
};

type FloorMapPin = {
  id: string;
  panoramaId: string;
  label: string;
  x: number;
  y: number;
  direction: number;
  note: string;
};

type FloorMapItem = {
  id: string;
  name: string;
  imageFileName: string;
  imagePath: string;
  level: string;
  pins: FloorMapPin[];
};

type QaSummary = {
  total: number;
  ok: number;
  warning: number;
  error: number;
};

type ReviewProject = {
  schemaVersion?: string;
  project: ProjectInfo;
  panoramas: PanoramaItem[];
  floorplans: FloorplanItem[];
  floorMaps: FloorMapItem[];
  qa: {
    resultPath?: string;
    summary?: QaSummary;
  };
};

type RawReviewProject = Partial<ReviewProject> & {
  source?: string;
  createdAt?: string;
};

const emptyQaSummary: QaSummary = { total: 0, ok: 0, warning: 0, error: 0 };

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

function normalizeNumber(value: unknown, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function validateReviewProject(value: unknown): ReviewProject {
  const candidate = value as RawReviewProject;
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('案件データファイルの形式が正しくありません。');
  }
  if (!candidate.project || typeof candidate.project !== 'object') {
    throw new Error('project が存在しません。');
  }
  if (!Array.isArray(candidate.panoramas)) {
    throw new Error('panoramas が配列ではありません。');
  }

  return {
    schemaVersion: candidate.schemaVersion ?? '0.1.0',
    project: {
      projectName: String(candidate.project.projectName ?? ''),
      clientName: String(candidate.project.clientName ?? ''),
      manager: String(candidate.project.manager ?? ''),
      purpose: String(candidate.project.purpose ?? ''),
      createdAt: String(candidate.project.createdAt ?? ''),
      updatedAt: String(candidate.project.updatedAt ?? ''),
      description: String(candidate.project.description ?? ''),
    },
    panoramas: candidate.panoramas.map((panorama, index) => ({
      id: String(panorama.id ?? `panorama-${String(index + 1).padStart(3, '0')}`),
      fileName: String(panorama.fileName ?? ''),
      floor: String(panorama.floor ?? ''),
      locationName: String(panorama.locationName ?? ''),
      sceneType: String(panorama.sceneType ?? ''),
      direction: normalizeNumber(panorama.direction),
      qaStatus: String(panorama.qaStatus ?? ''),
      note: String(panorama.note ?? ''),
    })),
    floorplans: (candidate.floorplans ?? []).map((floorplan, index) => ({
      id: String(floorplan.id ?? `floorplan-${String(index + 1).padStart(3, '0')}`),
      fileName: String(floorplan.fileName ?? ''),
      path: String(floorplan.path ?? ''),
      level: String(floorplan.level ?? ''),
      description: String(floorplan.description ?? ''),
    })),
    floorMaps: (candidate.floorMaps ?? []).map((floorMap, index) => ({
      id: String(floorMap.id ?? `floor-map-${String(index + 1).padStart(2, '0')}`),
      name: String(floorMap.name ?? `平面図 ${index + 1}`),
      imageFileName: String(floorMap.imageFileName ?? ''),
      imagePath: String(floorMap.imagePath ?? ''),
      level: String(floorMap.level ?? ''),
      pins: (floorMap.pins ?? []).map((pin, pinIndex) => ({
        id: String(pin.id ?? `pin-${String(pinIndex + 1).padStart(3, '0')}`),
        panoramaId: String(pin.panoramaId ?? ''),
        label: String(pin.label ?? ''),
        x: normalizeNumber(pin.x),
        y: normalizeNumber(pin.y),
        direction: normalizeNumber(pin.direction),
        note: String(pin.note ?? ''),
      })),
    })),
    qa: {
      resultPath: candidate.qa?.resultPath ?? '',
      summary: candidate.qa?.summary
        ? {
            total: normalizeNumber(candidate.qa.summary.total),
            ok: normalizeNumber(candidate.qa.summary.ok),
            warning: normalizeNumber(candidate.qa.summary.warning),
            error: normalizeNumber(candidate.qa.summary.error),
          }
        : undefined,
    },
  };
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

function escapeCsv(value: unknown) {
  return `"${String(value ?? '').replace(/"/g, '""')}"`;
}

function formatDate(value?: string) {
  if (!value) {
    return '-';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('ja-JP');
}

function ReviewExporterPage() {
  const { notify } = useToast();
  const handoffLoadedRef = useRef(false);
  const reportRef = useRef<HTMLElement | null>(null);
  const [projectData, setProjectData] = useState<ReviewProject | null>(null);
  const [loadedFileName, setLoadedFileName] = useState('');
  const [loadedFromHandoff, setLoadedFromHandoff] = useState(false);
  const reportCreatedAt = useMemo(() => new Date().toISOString(), [projectData]);

  const pinCount = projectData?.floorMaps.reduce((total, floorMap) => total + floorMap.pins.length, 0) ?? 0;
  const qaSummary = projectData?.qa.summary;
  const warningItems = useMemo(() => {
    if (!projectData) {
      return [];
    }

    const floorplanNames = new Set(projectData.floorplans.map((floorplan) => floorplan.fileName).filter(Boolean));
    return [
      ...projectData.panoramas
        .filter((panorama) => panorama.locationName.trim().length === 0)
        .map((panorama) => `場所名が未入力です: ${panorama.fileName || panorama.id}`),
      ...(qaSummary && qaSummary.error > 0 ? [`QA Error が ${qaSummary.error} 件あります`] : []),
      ...projectData.floorMaps
        .filter((floorMap) => floorMap.imageFileName && !floorplanNames.has(floorMap.imageFileName))
        .map((floorMap) => `平面図画像が未登録です: ${floorMap.imageFileName}`),
      ...projectData.floorMaps.flatMap((floorMap) =>
        floorMap.pins
          .filter((pin) => pin.panoramaId.trim().length === 0)
          .map((pin) => `ピンにパノラマが未割当です: ${floorMap.name} / ${pin.label || pin.id}`),
      ),
      ...(projectData.panoramas.length === 0 ? ['パノラマが0件です'] : []),
      ...(projectData.floorplans.length === 0 ? ['平面図が0件です'] : []),
    ];
  }, [projectData, qaSummary]);

  const loadProject = (value: unknown, fileName: string, fromHandoff = false) => {
    const parsed = validateReviewProject(value);
    setProjectData(parsed);
    setLoadedFileName(fileName);
    setLoadedFromHandoff(fromHandoff);
  };

  useEffect(() => {
    if (handoffLoadedRef.current) {
      return;
    }

    handoffLoadedRef.current = true;
    try {
      const handoff = loadReviewProjectHandoff<RawReviewProject>();
      if (!handoff) {
        return;
      }
      loadProject(handoff, 'Packagerから受け取った案件データ', true);
      notify('案件データを読み込みました', 'success');
    } catch {
      notify('案件データファイルを読み込めませんでした', 'error');
    }
  }, [notify]);

  const importProjectFile = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    if (getExtension(file.name) !== 'json') {
      notify('案件データファイルを読み込めませんでした', 'error');
      return;
    }

    try {
      loadProject(JSON.parse(await file.text()) as unknown, file.name);
      notify('案件データファイルを読み込みました', 'success');
    } catch {
      notify('案件データファイルを読み込めませんでした', 'error');
    }
  };

  const exportHtml = () => {
    if (!reportRef.current) {
      return;
    }
    const html = `<!doctype html><html lang="ja"><head><meta charset="utf-8"><title>レビュー書き出し</title><style>body{font-family:Inter,"Segoe UI","Noto Sans JP",sans-serif;margin:32px;color:#111827}.reportSection{break-inside:avoid;margin-bottom:28px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #d1d5db;padding:8px;text-align:left}h1,h2{color:#111827}</style></head><body>${reportRef.current.innerHTML}</body></html>`;
    downloadText('review-report.html', html, 'text/html;charset=utf-8');
    notify('HTMLを書き出しました', 'success');
  };

  const exportPanoramaCsv = () => {
    if (!projectData) {
      return;
    }
    const rows = [
      ['fileName', 'floor', 'locationName', 'sceneType', 'direction', 'qaStatus', 'note'],
      ...projectData.panoramas.map((panorama) => [
        panorama.fileName,
        panorama.floor,
        panorama.locationName,
        panorama.sceneType,
        panorama.direction,
        panorama.qaStatus,
        panorama.note,
      ]),
    ];
    downloadText('panorama-list.csv', rows.map((row) => row.map(escapeCsv).join(',')).join('\n'), 'text/csv;charset=utf-8');
    notify('パノラマ一覧CSVを書き出しました', 'success');
  };

  return (
    <AppFrame toolName="レビュー書き出し" status="基本機能版">
      <section className="qaHero workspaceHero noPrint" aria-labelledby="review-exporter-title">
        <div>
          <p className="eyebrow">レビュー書き出し 基本機能版</p>
          <h1 id="review-exporter-title">レビュー書き出し</h1>
          <p className="lead">案件データファイルを読み込み、印刷・PDF保存しやすいHTMLレポートを作成します。</p>
        </div>
        <div className="qaActions">
          <label className="fileUploadButton">
            📁 案件データを読み込む
            <input
              type="file"
              accept=".json,application/json"
              onChange={(event) => {
                void importProjectFile(event.target.files);
                event.currentTarget.value = '';
              }}
            />
          </label>
          <button type="button" className="button buttonPrimary" onClick={() => window.print()} disabled={!projectData}>
            印刷 / PDF保存
          </button>
          <button type="button" className="button buttonSecondary" onClick={exportHtml} disabled={!projectData}>
            HTMLを書き出し
          </button>
          <button type="button" className="button buttonSecondary" onClick={exportPanoramaCsv} disabled={!projectData}>
            パノラマ一覧CSVを書き出し
          </button>
        </div>
      </section>

      <section className="dashboardGrid noPrint" aria-label="レビュー書き出し ダッシュボード">
        <article className="metricCard"><span>パノラマ</span><strong>{projectData?.panoramas.length ?? 0}</strong></article>
        <article className="metricCard"><span>平面図</span><strong>{projectData?.floorplans.length ?? 0}</strong></article>
        <article className="metricCard successMetric"><span>ピン</span><strong>{pinCount}</strong></article>
        <article className={warningItems.length > 0 ? 'metricCard warningMetric' : 'metricCard successMetric'}>
          <span>注意項目</span><strong>{warningItems.length}</strong>
        </article>
      </section>

      {!projectData ? (
        <section className="emptyState">
          <span>📄</span>
          <strong>案件データファイルが読み込まれていません</strong>
          <p>案件パッケージ作成で出力した project.json または updated-project.json を読み込んでください。</p>
        </section>
      ) : (
        <section className="reviewReport" ref={reportRef} aria-label="レビュー書き出しレポート">
          {loadedFromHandoff ? <p className="handoffNotice noPrint">案件パッケージ作成から受け取ったデータです。</p> : null}
          <section className="reportSection reportCover">
            <p>Panorama Suite</p>
            <h1>{projectData.project.projectName || '名称未設定の案件'}</h1>
            <dl>
              <div><dt>施主名</dt><dd>{projectData.project.clientName || '-'}</dd></div>
              <div><dt>担当者</dt><dd>{projectData.project.manager || '-'}</dd></div>
              <div><dt>用途</dt><dd>{projectData.project.purpose || '-'}</dd></div>
              <div><dt>作成日</dt><dd>{formatDate(projectData.project.createdAt)}</dd></div>
              <div><dt>レポート作成日</dt><dd>{formatDate(reportCreatedAt)}</dd></div>
            </dl>
          </section>

          <section className="reportSection">
            <h2>案件概要</h2>
            <div className="reportSummaryGrid">
              <div><span>案件名</span><strong>{projectData.project.projectName || '-'}</strong></div>
              <div><span>施主名</span><strong>{projectData.project.clientName || '-'}</strong></div>
              <div><span>担当者</span><strong>{projectData.project.manager || '-'}</strong></div>
              <div><span>用途</span><strong>{projectData.project.purpose || '-'}</strong></div>
              <div><span>パノラマ数</span><strong>{projectData.panoramas.length}</strong></div>
              <div><span>平面図数</span><strong>{projectData.floorplans.length}</strong></div>
              <div><span>平面図ピン情報数</span><strong>{projectData.floorMaps.length}</strong></div>
            </div>
            <p>{projectData.project.description || '備考はありません。'}</p>
          </section>

          <section className="reportSection">
            <h2>パノラマ一覧</h2>
            <table className="reportTable">
              <thead><tr><th>ファイル名</th><th>階</th><th>場所名</th><th>シーン種別</th><th>方位</th><th>QA状態</th><th>コメント</th></tr></thead>
              <tbody>
                {projectData.panoramas.map((panorama) => (
                  <tr key={panorama.id}>
                    <td>{panorama.fileName || '-'}</td>
                    <td>{panorama.floor || '-'}</td>
                    <td>{panorama.locationName || <span className="inlineWarning">未入力</span>}</td>
                    <td>{panorama.sceneType || '-'}</td>
                    <td>{panorama.direction}°</td>
                    <td>{panorama.qaStatus || '-'}</td>
                    <td>{panorama.note || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="reportSection">
            <h2>平面図ピン情報</h2>
            {projectData.floorMaps.length === 0 ? <p>平面図ピン情報はありません。</p> : projectData.floorMaps.map((floorMap) => (
              <article className="reportSubsection" key={floorMap.id}>
                <h3>{floorMap.name}</h3>
                <p>階: {floorMap.level || '-'} / 平面図画像: {floorMap.imageFileName || '-'} / ピン数: {floorMap.pins.length}</p>
                <table className="reportTable">
                  <thead><tr><th>ラベル</th><th>紐づくパノラマ</th><th>x</th><th>y</th><th>方位</th><th>コメント</th></tr></thead>
                  <tbody>
                    {floorMap.pins.map((pin) => (
                      <tr key={pin.id}>
                        <td>{pin.label || '-'}</td>
                        <td>{projectData.panoramas.find((panorama) => panorama.id === pin.panoramaId)?.locationName || pin.panoramaId || <span className="inlineWarning">未割当</span>}</td>
                        <td>{pin.x}%</td>
                        <td>{pin.y}%</td>
                        <td>{pin.direction}°</td>
                        <td>{pin.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </article>
            ))}
          </section>

          <section className="reportSection">
            <h2>QA結果</h2>
            {qaSummary ? (
              <div className="reportSummaryGrid">
                <div><span>総数</span><strong>{qaSummary.total}</strong></div>
                <div><span>OK</span><strong>{qaSummary.ok}</strong></div>
                <div><span>注意</span><strong>{qaSummary.warning}</strong></div>
                <div><span>エラー</span><strong>{qaSummary.error}</strong></div>
              </div>
            ) : <p>QA結果は読み込まれていません。</p>}
          </section>

          <section className="reportSection">
            <h2>注意事項</h2>
            {warningItems.length === 0 ? <p>大きな注意項目はありません。</p> : (
              <ul className="reportWarningList">{warningItems.map((item) => <li key={item}>{item}</li>)}</ul>
            )}
          </section>

          <section className="reportSection">
            <h2>データ情報</h2>
            <dl className="reportInfoList">
              <div><dt>読み込んだファイル名</dt><dd>{loadedFileName || '-'}</dd></div>
              <div><dt>データ形式</dt><dd>{projectData.schemaVersion || '-'}</dd></div>
              <div><dt>レポート作成日時</dt><dd>{formatDate(reportCreatedAt)}</dd></div>
              <div><dt>処理方式</dt><dd>ローカル処理。外部送信は行っていません。</dd></div>
            </dl>
          </section>
        </section>
      )}
    </AppFrame>
  );
}

export default ReviewExporterPage;
