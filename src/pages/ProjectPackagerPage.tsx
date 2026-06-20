import JSZip from 'jszip';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

type ProjectForm = {
  projectName: string;
  clientName: string;
  manager: string;
  purpose: string;
  description: string;
};

type RegisteredImage = {
  id: string;
  file: File;
  fileName: string;
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
};

type FloorplanFile = {
  id: string;
  file: File;
  fileName: string;
  fileType: string;
  fileSize: number;
};

type QaStatus = 'OK' | 'Warning' | 'Error' | '';

type QaResultRow = {
  fileName: string;
  fileType?: string;
  width?: number | null;
  height?: number | null;
  ratio?: string;
  status?: QaStatus;
  messages?: string[];
};

type QaSummary = {
  total: number;
  ok: number;
  warning: number;
  error: number;
};

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

function createId(file: File) {
  return `${file.name}-${file.lastModified}-${file.size}`;
}

function sanitizeFileName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

function loadImageMeta(file: File): Promise<RegisteredImage> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        id: createId(file),
        file,
        fileName: file.name,
        fileType: getExtension(file.name),
        fileSize: file.size,
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name} は画像として読み込めません。`));
    };

    image.src = url;
  });
}

async function readQaJson(file: File): Promise<QaResultRow[]> {
  const text = await file.text();
  const parsed = JSON.parse(text) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('QA結果JSONは配列形式である必要があります。');
  }

  return parsed.map((row) => {
    const candidate = row as Partial<QaResultRow>;
    if (typeof candidate.fileName !== 'string') {
      throw new Error('QA結果JSONに fileName がない行があります。');
    }
    return {
      fileName: candidate.fileName,
      fileType: candidate.fileType,
      width: candidate.width,
      height: candidate.height,
      ratio: candidate.ratio,
      status: candidate.status ?? '',
      messages: candidate.messages ?? [],
    };
  });
}

function summarizeQa(rows: QaResultRow[]): QaSummary {
  return rows.reduce(
    (summary, row) => ({
      total: summary.total + 1,
      ok: summary.ok + (row.status === 'OK' ? 1 : 0),
      warning: summary.warning + (row.status === 'Warning' ? 1 : 0),
      error: summary.error + (row.status === 'Error' ? 1 : 0),
    }),
    { total: 0, ok: 0, warning: 0, error: 0 },
  );
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function ProjectPackagerPage() {
  const [form, setForm] = useState<ProjectForm>({
    projectName: '',
    clientName: '',
    manager: '',
    purpose: '',
    description: '',
  });
  const [panoramas, setPanoramas] = useState<RegisteredImage[]>([]);
  const [floorplans, setFloorplans] = useState<FloorplanFile[]>([]);
  const [qaRows, setQaRows] = useState<QaResultRow[]>([]);
  const [qaFile, setQaFile] = useState<File | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isPackaging, setIsPackaging] = useState(false);

  const qaSummary = useMemo(() => summarizeQa(qaRows), [qaRows]);
  const qaByFileName = useMemo(() => new Map(qaRows.map((row) => [row.fileName, row.status ?? ''])), [qaRows]);
  const safeProjectName = sanitizeFileName(form.projectName);
  const canExport = form.projectName.trim().length > 0 && !isPackaging;

  const updateForm = (key: keyof ProjectForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const addPanoramas = async (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);
    const validFiles = files.filter((file) => imageExtensions.has(getExtension(file.name)));
    const invalidFiles = files.filter((file) => !imageExtensions.has(getExtension(file.name)));
    const nextMessages = invalidFiles.map((file) => `${file.name}: 非対応形式です。jpg、jpeg、png、webp を使用してください。`);

    const loaded = await Promise.allSettled(validFiles.map((file) => loadImageMeta(file)));
    const accepted = loaded
      .filter((result): result is PromiseFulfilledResult<RegisteredImage> => result.status === 'fulfilled')
      .map((result) => result.value);
    const failed = loaded
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => result.reason instanceof Error ? result.reason.message : '画像を読み込めません。');

    setPanoramas((current) => [...current, ...accepted]);
    setMessages([...nextMessages, ...failed]);
  };

  const addFloorplans = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);
    const validFiles = files.filter((file) => imageExtensions.has(getExtension(file.name)));
    const invalidFiles = files.filter((file) => !imageExtensions.has(getExtension(file.name)));

    setFloorplans((current) => [
      ...current,
      ...validFiles.map((file) => ({
        id: createId(file),
        file,
        fileName: file.name,
        fileType: getExtension(file.name),
        fileSize: file.size,
      })),
    ]);
    setMessages(invalidFiles.map((file) => `${file.name}: 非対応形式です。jpg、jpeg、png、webp を使用してください。`));
  };

  const addQaJson = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    if (getExtension(file.name) !== 'json') {
      setMessages([`${file.name}: QA結果はJSONファイルを指定してください。`]);
      return;
    }

    try {
      const rows = await readQaJson(file);
      setQaRows(rows);
      setQaFile(file);
      setMessages([`${file.name}: QA結果JSONを読み込みました。`]);
    } catch (error) {
      setQaRows([]);
      setQaFile(null);
      setMessages([error instanceof Error ? error.message : 'QA結果JSONを読み込めません。']);
    }
  };

  const buildProjectJson = () => {
    const now = new Date().toISOString();
    return {
      schemaVersion: '0.1.0',
      project: {
        projectName: form.projectName.trim(),
        clientName: form.clientName.trim(),
        manager: form.manager.trim(),
        purpose: form.purpose.trim(),
        createdAt: now,
        updatedAt: now,
        description: form.description.trim(),
      },
      panoramas: panoramas.map((panorama, index) => ({
        id: `panorama-${String(index + 1).padStart(3, '0')}`,
        fileName: panorama.fileName,
        path: `panoramas/${panorama.fileName}`,
        width: panorama.width,
        height: panorama.height,
        fileType: panorama.fileType,
        fileSize: panorama.fileSize,
        floor: '',
        locationName: '',
        direction: 0,
        qaStatus: qaByFileName.get(panorama.fileName) ?? '',
      })),
      floorplans: floorplans.map((floorplan, index) => ({
        id: `floorplan-${String(index + 1).padStart(3, '0')}`,
        fileName: floorplan.fileName,
        path: `floorplans/${floorplan.fileName}`,
        level: '',
        description: '',
      })),
      qa: {
        resultPath: qaFile ? `qa/${qaFile.name}` : '',
        summary: qaSummary,
      },
    };
  };

  const exportZip = async () => {
    if (!canExport) {
      return;
    }

    setIsPackaging(true);
    const warnings = panoramas.length === 0 ? ['パノラマ画像が0枚です。空のpanoramasフォルダを含めて出力します。'] : [];
    const zip = new JSZip();
    zip.file('project.json', JSON.stringify(buildProjectJson(), null, 2));

    const panoramaFolder = zip.folder('panoramas');
    panoramas.forEach((panorama) => {
      panoramaFolder?.file(panorama.fileName, panorama.file);
    });

    const floorplanFolder = zip.folder('floorplans');
    floorplans.forEach((floorplan) => {
      floorplanFolder?.file(floorplan.fileName, floorplan.file);
    });

    const qaFolder = zip.folder('qa');
    if (qaFile) {
      qaFolder?.file(qaFile.name, qaFile);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${safeProjectName || 'panorama-project'}.zip`);
    setMessages(warnings.length > 0 ? warnings : ['ZIPを書き出しました。']);
    setIsPackaging(false);
  };

  return (
    <main className="appShell packagerShell">
      <nav className="subNav" aria-label="ページ移動">
        <Link to="/">Portal</Link>
        <span>/</span>
        <span>Project Packager</span>
      </nav>

      <section className="qaHero" aria-labelledby="packager-title">
        <div>
          <p className="eyebrow">Panorama Project Packager MVP</p>
          <h1 id="packager-title">案件単位のZIPパッケージ作成</h1>
          <p className="lead">
            パノラマ画像、平面図、QA結果、案件メタデータをまとめ、引継ぎ・バックアップ用のZIPをブラウザ内で生成します。
          </p>
        </div>
      </section>

      <section className="packagerLayout" aria-label="Project Packager 作業エリア">
        <form className="projectForm">
          <h2>案件情報</h2>
          <label>
            <span>案件名 *</span>
            <input
              value={form.projectName}
              onChange={(event) => updateForm('projectName', event.target.value)}
              placeholder="例: 青山オフィス改修"
              required
            />
          </label>
          <label>
            <span>施主名</span>
            <input value={form.clientName} onChange={(event) => updateForm('clientName', event.target.value)} />
          </label>
          <label>
            <span>担当者</span>
            <input value={form.manager} onChange={(event) => updateForm('manager', event.target.value)} />
          </label>
          <label>
            <span>用途</span>
            <input value={form.purpose} onChange={(event) => updateForm('purpose', event.target.value)} />
          </label>
          <label>
            <span>備考</span>
            <textarea value={form.description} onChange={(event) => updateForm('description', event.target.value)} />
          </label>
        </form>

        <div className="fileRegistration">
          <section className="filePanel">
            <div className="panelHeader">
              <h2>登録ファイル</h2>
              <span>{panoramas.length} panoramas / {floorplans.length} floorplans</span>
            </div>
            <div className="uploadGrid">
              <label className="fileUploadButton">
                パノラマ画像を追加
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(event) => {
                    void addPanoramas(event.target.files);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
              <label className="fileUploadButton">
                平面図画像を追加
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(event) => {
                    addFloorplans(event.target.files);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
              <label className="fileUploadButton secondaryUpload">
                QA結果JSONを読み込む
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(event) => {
                    void addQaJson(event.target.files);
                    event.currentTarget.value = '';
                  }}
                />
              </label>
            </div>

            {messages.length > 0 ? (
              <ul className="packagerMessages">
                {messages.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            ) : null}

            <div className="fileTables">
              <table className="compactTable">
                <thead>
                  <tr>
                    <th>パノラマ</th>
                    <th>解像度</th>
                    <th>QA</th>
                  </tr>
                </thead>
                <tbody>
                  {panoramas.length === 0 ? (
                    <tr>
                      <td colSpan={3}>パノラマ画像が未登録です。</td>
                    </tr>
                  ) : (
                    panoramas.map((panorama) => (
                      <tr key={panorama.id}>
                        <td>{panorama.fileName}</td>
                        <td>{panorama.width} x {panorama.height}</td>
                        <td>{qaByFileName.get(panorama.fileName) || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <table className="compactTable">
                <thead>
                  <tr>
                    <th>平面図</th>
                    <th>形式</th>
                    <th>サイズ</th>
                  </tr>
                </thead>
                <tbody>
                  {floorplans.length === 0 ? (
                    <tr>
                      <td colSpan={3}>平面図は任意です。</td>
                    </tr>
                  ) : (
                    floorplans.map((floorplan) => (
                      <tr key={floorplan.id}>
                        <td>{floorplan.fileName}</td>
                        <td>{floorplan.fileType}</td>
                        <td>{Math.round(floorplan.fileSize / 1024)} KB</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="zipPreview">
            <div>
              <h2>ZIP構成</h2>
              <pre>{`${safeProjectName || 'project-name'}.zip
├ project.json
├ panoramas/
│  └ ${panoramas.length > 0 ? panoramas[0].fileName : 'scene01.jpg'}
├ floorplans/
│  └ ${floorplans.length > 0 ? floorplans[0].fileName : 'floorplan.jpg'}
└ qa/
   └ ${qaFile ? qaFile.name : 'qa-results.json'}`}</pre>
            </div>
            <div className="qaSummaryInline">
              <h3>QAサマリー</h3>
              <dl>
                <div><dt>Total</dt><dd>{qaSummary.total}</dd></div>
                <div><dt>OK</dt><dd>{qaSummary.ok}</dd></div>
                <div><dt>Warning</dt><dd>{qaSummary.warning}</dd></div>
                <div><dt>Error</dt><dd>{qaSummary.error}</dd></div>
              </dl>
            </div>
          </section>
        </div>
      </section>

      <section className="packagerFooter">
        {form.projectName.trim().length === 0 ? <p>案件名を入力するとZIP出力できます。</p> : null}
        {panoramas.length === 0 ? <p>警告: パノラマ画像が0枚です。必要に応じて追加してください。</p> : null}
        <button type="button" onClick={() => void exportZip()} disabled={!canExport}>
          {isPackaging ? 'ZIP生成中' : 'ZIP出力'}
        </button>
      </section>
    </main>
  );
}

export default ProjectPackagerPage;
