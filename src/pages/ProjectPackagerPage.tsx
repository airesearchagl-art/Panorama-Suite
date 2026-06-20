import JSZip from 'jszip';
import { useMemo, useState } from 'react';
import AppFrame from '../components/AppFrame';

type ProjectForm = {
  projectName: string;
  clientName: string;
  manager: string;
  purpose: string;
  description: string;
};

type FileState = '実ファイル登録済み' | 'ファイル未再登録';

type PanoramaEntry = {
  id: string;
  file?: File;
  fileName: string;
  path: string;
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
  floor: string;
  locationName: string;
  direction: number;
  sceneType: string;
  note: string;
  sortOrder: number;
  qaStatus: string;
  fileState: FileState;
};

type FloorplanEntry = {
  id: string;
  file?: File;
  fileName: string;
  path: string;
  fileType: string;
  fileSize: number;
  level: string;
  description: string;
  fileState: FileState;
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

type ImportedProject = {
  schemaVersion: string;
  importedAt: string;
  resultPath: string;
};

type ProjectJson = {
  schemaVersion: string;
  project: Partial<ProjectForm> & {
    createdAt?: string;
    updatedAt?: string;
  };
  panoramas: Array<Partial<PanoramaEntry>>;
  floorplans: Array<Partial<FloorplanEntry>>;
  qa?: {
    resultPath?: string;
    summary?: Partial<QaSummary>;
  };
};

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
const emptyQaSummary: QaSummary = { total: 0, ok: 0, warning: 0, error: 0 };
const sceneTypeOptions = ['エントランス', '執務エリア', '会議室', '食堂', 'ラウンジ', '廊下', '階段', '外観', '現場', 'その他'];

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

function createIdFromFile(file: File) {
  return `${file.name}-${file.lastModified}-${file.size}`;
}

function createIdFromName(prefix: string, fileName: string, index: number) {
  return `${prefix}-${String(index + 1).padStart(3, '0')}-${fileName}`;
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

function normalizeQaSummary(summary?: Partial<QaSummary>): QaSummary {
  return {
    total: Number(summary?.total ?? 0),
    ok: Number(summary?.ok ?? 0),
    warning: Number(summary?.warning ?? 0),
    error: Number(summary?.error ?? 0),
  };
}

function normalizeDirection(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return ((Math.round(value) % 360) + 360) % 360;
}

function normalizeSortOrder(value: number, fallback: number) {
  if (!Number.isFinite(value)) {
    return fallback;
  }
  return Math.max(1, Math.round(value));
}

function validateProjectJson(value: unknown): ProjectJson {
  const candidate = value as Partial<ProjectJson>;

  if (!candidate || typeof candidate !== 'object') {
    throw new Error('project.json の形式が不正です。');
  }

  if (typeof candidate.schemaVersion !== 'string' || candidate.schemaVersion.length === 0) {
    throw new Error('schemaVersion が存在しません。');
  }

  if (!candidate.project || typeof candidate.project !== 'object') {
    throw new Error('project が存在しません。');
  }

  if (!Array.isArray(candidate.panoramas)) {
    throw new Error('panoramas が配列ではありません。');
  }

  if (!Array.isArray(candidate.floorplans)) {
    throw new Error('floorplans が配列ではありません。');
  }

  return candidate as ProjectJson;
}

function loadImageMeta(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
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
    emptyQaSummary,
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
  const [panoramas, setPanoramas] = useState<PanoramaEntry[]>([]);
  const [floorplans, setFloorplans] = useState<FloorplanEntry[]>([]);
  const [qaRows, setQaRows] = useState<QaResultRow[]>([]);
  const [qaSummary, setQaSummary] = useState<QaSummary>(emptyQaSummary);
  const [qaFile, setQaFile] = useState<File | null>(null);
  const [qaResultPath, setQaResultPath] = useState('');
  const [importedProject, setImportedProject] = useState<ImportedProject | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isPackaging, setIsPackaging] = useState(false);

  const qaByFileName = useMemo(() => new Map(qaRows.map((row) => [row.fileName, row.status ?? ''])), [qaRows]);
  const missingPanoramas = panoramas.filter((panorama) => !panorama.file);
  const missingFloorplans = floorplans.filter((floorplan) => !floorplan.file);
  const metadataComplete = panoramas.filter((panorama) => panorama.locationName.trim().length > 0).length;
  const sortedPanoramas = useMemo(
    () => [...panoramas].sort((a, b) => a.sortOrder - b.sortOrder || a.fileName.localeCompare(b.fileName)),
    [panoramas],
  );
  const safeProjectName = sanitizeFileName(form.projectName);
  const canExport = form.projectName.trim().length > 0 && !isPackaging;

  const updateForm = (key: keyof ProjectForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updatePanorama = <Key extends keyof PanoramaEntry>(id: string, key: Key, value: PanoramaEntry[Key]) => {
    setPanoramas((current) =>
      current.map((panorama) => (panorama.id === id ? { ...panorama, [key]: value } : panorama)),
    );
  };

  const addPanoramas = async (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);
    const validFiles = files.filter((file) => imageExtensions.has(getExtension(file.name)));
    const invalidFiles = files.filter((file) => !imageExtensions.has(getExtension(file.name)));
    const loaded = await Promise.allSettled(
      validFiles.map(async (file) => ({
        file,
        meta: await loadImageMeta(file),
      })),
    );

    const accepted = loaded
      .filter((result): result is PromiseFulfilledResult<{ file: File; meta: { width: number; height: number } }> => result.status === 'fulfilled')
      .map((result) => result.value);
    const failed = loaded
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => result.reason instanceof Error ? result.reason.message : '画像を読み込めません。');

    setPanoramas((current) => {
      const next = [...current];
      accepted.forEach(({ file, meta }) => {
        const existingIndex = next.findIndex((panorama) => panorama.fileName === file.name);
        const entry: PanoramaEntry = {
          id: existingIndex >= 0 ? next[existingIndex].id : createIdFromFile(file),
          file,
          fileName: file.name,
          path: `panoramas/${file.name}`,
          fileType: getExtension(file.name),
          fileSize: file.size,
          width: meta.width,
          height: meta.height,
          floor: existingIndex >= 0 ? next[existingIndex].floor : '',
          locationName: existingIndex >= 0 ? next[existingIndex].locationName : '',
          direction: existingIndex >= 0 ? next[existingIndex].direction : 0,
          sceneType: existingIndex >= 0 ? next[existingIndex].sceneType : '',
          note: existingIndex >= 0 ? next[existingIndex].note : '',
          sortOrder: existingIndex >= 0 ? next[existingIndex].sortOrder : next.length + 1,
          qaStatus: qaByFileName.get(file.name) ?? (existingIndex >= 0 ? next[existingIndex].qaStatus : ''),
          fileState: '実ファイル登録済み',
        };

        if (existingIndex >= 0) {
          next[existingIndex] = entry;
        } else {
          next.push(entry);
        }
      });
      return next;
    });
    setMessages([
      ...invalidFiles.map((file) => `${file.name}: 非対応形式です。jpg、jpeg、png、webp を使用してください。`),
      ...failed,
    ]);
  };

  const addFloorplans = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);
    const validFiles = files.filter((file) => imageExtensions.has(getExtension(file.name)));
    const invalidFiles = files.filter((file) => !imageExtensions.has(getExtension(file.name)));

    setFloorplans((current) => {
      const next = [...current];
      validFiles.forEach((file) => {
        const existingIndex = next.findIndex((floorplan) => floorplan.fileName === file.name);
        const entry: FloorplanEntry = {
          id: existingIndex >= 0 ? next[existingIndex].id : createIdFromFile(file),
          file,
          fileName: file.name,
          path: `floorplans/${file.name}`,
          fileType: getExtension(file.name),
          fileSize: file.size,
          level: existingIndex >= 0 ? next[existingIndex].level : '',
          description: existingIndex >= 0 ? next[existingIndex].description : '',
          fileState: '実ファイル登録済み',
        };

        if (existingIndex >= 0) {
          next[existingIndex] = entry;
        } else {
          next.push(entry);
        }
      });
      return next;
    });
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
      const summary = summarizeQa(rows);
      setQaRows(rows);
      setQaSummary(summary);
      setQaFile(file);
      setQaResultPath(`qa/${file.name}`);
      setPanoramas((current) =>
        current.map((panorama) => ({
          ...panorama,
          qaStatus: rows.find((row) => row.fileName === panorama.fileName)?.status ?? panorama.qaStatus,
        })),
      );
      setMessages([`${file.name}: QA結果JSONを読み込みました。`]);
    } catch (error) {
      setQaRows([]);
      setQaSummary(emptyQaSummary);
      setQaFile(null);
      setQaResultPath('');
      setMessages([error instanceof Error ? error.message : 'QA結果JSONを読み込めません。']);
    }
  };

  const importProjectJson = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    if (getExtension(file.name) !== 'json') {
      setMessages([`${file.name}: project.json を指定してください。`]);
      return;
    }

    try {
      const parsed = validateProjectJson(JSON.parse(await file.text()) as unknown);
      const importedSummary = normalizeQaSummary(parsed.qa?.summary);
      setForm({
        projectName: parsed.project.projectName ?? '',
        clientName: parsed.project.clientName ?? '',
        manager: parsed.project.manager ?? '',
        purpose: parsed.project.purpose ?? '',
        description: parsed.project.description ?? '',
      });
      setPanoramas(
        parsed.panoramas.map((panorama, index) => ({
          id: String(panorama.id ?? createIdFromName('imported-panorama', panorama.fileName ?? `panorama-${index + 1}`, index)),
          fileName: String(panorama.fileName ?? ''),
          path: String(panorama.path ?? `panoramas/${panorama.fileName ?? ''}`),
          fileType: String(panorama.fileType ?? getExtension(String(panorama.fileName ?? ''))),
          fileSize: Number(panorama.fileSize ?? 0),
          width: Number(panorama.width ?? 0),
          height: Number(panorama.height ?? 0),
          floor: String(panorama.floor ?? ''),
          locationName: String(panorama.locationName ?? ''),
          direction: normalizeDirection(Number(panorama.direction ?? 0)),
          sceneType: String(panorama.sceneType ?? ''),
          note: String(panorama.note ?? ''),
          sortOrder: normalizeSortOrder(Number(panorama.sortOrder ?? index + 1), index + 1),
          qaStatus: String(panorama.qaStatus ?? ''),
          fileState: 'ファイル未再登録',
        })),
      );
      setFloorplans(
        parsed.floorplans.map((floorplan, index) => ({
          id: String(floorplan.id ?? createIdFromName('imported-floorplan', floorplan.fileName ?? `floorplan-${index + 1}`, index)),
          fileName: String(floorplan.fileName ?? ''),
          path: String(floorplan.path ?? `floorplans/${floorplan.fileName ?? ''}`),
          fileType: String(floorplan.fileType ?? getExtension(String(floorplan.fileName ?? ''))),
          fileSize: Number(floorplan.fileSize ?? 0),
          level: String(floorplan.level ?? ''),
          description: String(floorplan.description ?? ''),
          fileState: 'ファイル未再登録',
        })),
      );
      setQaRows([]);
      setQaSummary(importedSummary);
      setQaFile(null);
      setQaResultPath(parsed.qa?.resultPath ?? '');
      setImportedProject({
        schemaVersion: parsed.schemaVersion,
        importedAt: new Date().toISOString(),
        resultPath: parsed.qa?.resultPath ?? '',
      });
      setMessages([
        `${file.name}: project.json を読み込みました。実画像ファイルは復元されないため、同名ファイルを再登録してください。`,
      ]);
    } catch (error) {
      setMessages([error instanceof Error ? error.message : 'project.json を読み込めません。']);
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
        createdAt: importedProject ? importedProject.importedAt : now,
        updatedAt: now,
        description: form.description.trim(),
      },
      panoramas: panoramas.map((panorama, index) => ({
        id: panorama.id || `panorama-${String(index + 1).padStart(3, '0')}`,
        fileName: panorama.fileName,
        path: panorama.path || `panoramas/${panorama.fileName}`,
        width: panorama.width,
        height: panorama.height,
        fileType: panorama.fileType,
        fileSize: panorama.fileSize,
        floor: panorama.floor,
        locationName: panorama.locationName,
        direction: normalizeDirection(panorama.direction),
        sceneType: panorama.sceneType,
        note: panorama.note,
        sortOrder: normalizeSortOrder(panorama.sortOrder, index + 1),
        qaStatus: qaByFileName.get(panorama.fileName) ?? panorama.qaStatus,
      })),
      floorplans: floorplans.map((floorplan, index) => ({
        id: floorplan.id || `floorplan-${String(index + 1).padStart(3, '0')}`,
        fileName: floorplan.fileName,
        path: floorplan.path || `floorplans/${floorplan.fileName}`,
        level: floorplan.level,
        description: floorplan.description,
      })),
      qa: {
        resultPath: qaFile ? `qa/${qaFile.name}` : qaResultPath,
        summary: qaSummary,
      },
    };
  };

  const exportZip = async () => {
    if (!canExport) {
      return;
    }

    setIsPackaging(true);
    const warnings = [
      ...(panoramas.length === 0 ? ['パノラマ画像が0枚です。空のpanoramasフォルダを含めて出力します。'] : []),
      ...(missingPanoramas.length > 0
        ? [`未再登録のパノラマ ${missingPanoramas.length} 件は project.json に残りますが、ZIP内に実ファイルは含まれません。`]
        : []),
      ...(missingFloorplans.length > 0
        ? [`未再登録の平面図 ${missingFloorplans.length} 件は project.json に残りますが、ZIP内に実ファイルは含まれません。`]
        : []),
      ...(!qaFile && qaResultPath ? ['QA結果JSONの実ファイルが未再登録のため、qaフォルダには含まれません。'] : []),
    ];
    const zip = new JSZip();
    zip.file('project.json', JSON.stringify(buildProjectJson(), null, 2));

    const panoramaFolder = zip.folder('panoramas');
    panoramas.forEach((panorama) => {
      if (panorama.file) {
        panoramaFolder?.file(panorama.fileName, panorama.file);
      }
    });

    const floorplanFolder = zip.folder('floorplans');
    floorplans.forEach((floorplan) => {
      if (floorplan.file) {
        floorplanFolder?.file(floorplan.fileName, floorplan.file);
      }
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
    <AppFrame toolName="Project Packager" status="v0.2">
      <section className="qaHero workspaceHero" aria-labelledby="packager-title">
        <div>
          <p className="eyebrow">Panorama Project Packager v0.2</p>
          <h1 id="packager-title">案件単位のZIPパッケージ作成</h1>
          <p className="lead">
            project.json の再読み込み、案件情報の再編集、実ファイルの再登録に対応しました。
          </p>
        </div>
      </section>

      <section className="dashboardGrid" aria-label="Project Packager Dashboard">
        <article className="metricCard"><span>Panoramas</span><strong>{panoramas.length}</strong></article>
        <article className="metricCard"><span>Floorplans</span><strong>{floorplans.length}</strong></article>
        <article className="metricCard warningMetric"><span>Missing Files</span><strong>{missingPanoramas.length + missingFloorplans.length}</strong></article>
        <article className="metricCard"><span>QA Status</span><strong>{qaSummary.total > 0 ? `${qaSummary.ok}/${qaSummary.total}` : '-'}</strong></article>
        <article className="metricCard successMetric"><span>Metadata Complete</span><strong>{metadataComplete}/{panoramas.length}</strong></article>
      </section>

      <section className="importPanel" aria-labelledby="import-title">
        <div>
          <h2 id="import-title">project.json 読み込み</h2>
          <p>既存パッケージの project.json を読み込むと、案件情報・一覧・QAサマリーを復元できます。</p>
          <p>project.json だけでは実画像ファイル本体は復元できません。同名ファイルを再登録すると一覧に紐づきます。</p>
        </div>
        <label className="fileUploadButton secondaryUpload">
          📁 project.jsonを読み込む
          <input
            type="file"
            accept=".json,application/json"
            onChange={(event) => {
              void importProjectJson(event.target.files);
              event.currentTarget.value = '';
            }}
          />
        </label>
      </section>

      {importedProject ? (
        <section className="importedInfo" aria-label="読み込み済みプロジェクト情報">
          <div><span>schemaVersion</span><strong>{importedProject.schemaVersion}</strong></div>
          <div><span>QA結果パス</span><strong>{importedProject.resultPath || '-'}</strong></div>
          <div><span>未再登録ファイル</span><strong>{missingPanoramas.length + missingFloorplans.length}</strong></div>
        </section>
      ) : null}

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
                📁 パノラマ画像を追加
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
                📁 平面図画像を追加
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
                📁 QA結果JSONを読み込む
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

            {(missingPanoramas.length > 0 || missingFloorplans.length > 0) ? (
              <div className="missingNotice">
                <strong>実ファイル再登録が必要です。</strong>
                <span>未再登録の項目は project.json には残りますが、ZIP内に実ファイルは含まれません。</span>
              </div>
            ) : null}

            <div className="fileTables">
              <table className="compactTable">
                <thead>
                  <tr>
                    <th>パノラマ</th>
                    <th>Scene Metadata</th>
                    <th>解像度</th>
                    <th>QA</th>
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {panoramas.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="emptyState smallEmpty">
                          <span>📂</span>
                          <strong>パノラマ画像がありません</strong>
                          <p>画像を追加、または project.json を読み込んでメタ情報を復元してください。</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    sortedPanoramas.map((panorama) => (
                      <tr key={panorama.id}>
                        <td>
                          <div className="sceneIdentity">
                            <strong>{panorama.fileName}</strong>
                            <span>{panorama.path}</span>
                          </div>
                        </td>
                        <td>
                          <div className="sceneMetaGrid">
                            <label>
                              <span>階</span>
                              <input
                                value={panorama.floor}
                                onChange={(event) => updatePanorama(panorama.id, 'floor', event.target.value)}
                                placeholder="例: 3F"
                              />
                            </label>
                            <label>
                              <span>場所名</span>
                              <input
                                value={panorama.locationName}
                                onChange={(event) => updatePanorama(panorama.id, 'locationName', event.target.value)}
                                placeholder="例: エントランス"
                              />
                            </label>
                            <label>
                              <span>方位</span>
                              <div className="degreeInput">
                                <input
                                  type="number"
                                  min="0"
                                  max="359"
                                  value={panorama.direction}
                                  onBlur={() => updatePanorama(panorama.id, 'direction', normalizeDirection(panorama.direction))}
                                  onChange={(event) =>
                                    updatePanorama(panorama.id, 'direction', normalizeDirection(Number(event.target.value || 0)))
                                  }
                                />
                                <b>°</b>
                              </div>
                            </label>
                            <label>
                              <span>シーン種別</span>
                              <select
                                value={panorama.sceneType}
                                onChange={(event) => updatePanorama(panorama.id, 'sceneType', event.target.value)}
                              >
                                <option value="">未設定</option>
                                {sceneTypeOptions.map((option) => (
                                  <option value={option} key={option}>{option}</option>
                                ))}
                              </select>
                            </label>
                            <label>
                              <span>表示順</span>
                              <input
                                type="number"
                                min="1"
                                value={panorama.sortOrder}
                                onChange={(event) =>
                                  updatePanorama(panorama.id, 'sortOrder', normalizeSortOrder(Number(event.target.value), panorama.sortOrder))
                                }
                              />
                            </label>
                            <label className="sceneNoteField">
                              <span>コメント</span>
                              <input
                                value={panorama.note}
                                onChange={(event) => updatePanorama(panorama.id, 'note', event.target.value)}
                                placeholder="レビュー時の補足"
                              />
                            </label>
                          </div>
                        </td>
                        <td>{panorama.width} x {panorama.height}</td>
                        <td>{qaByFileName.get(panorama.fileName) || panorama.qaStatus || '-'}</td>
                        <td><span className={panorama.file ? 'fileStateReady' : 'fileStateMissing'}>{panorama.fileState}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              <table className="compactTable">
                <thead>
                  <tr>
                    <th>平面図</th>
                    <th>パス</th>
                    <th>階</th>
                    <th>状態</th>
                  </tr>
                </thead>
                <tbody>
                  {floorplans.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <div className="emptyState smallEmpty">
                          <span>🗺</span>
                          <strong>平面図は未登録です</strong>
                          <p>必要に応じて平面図画像を追加してください。</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    floorplans.map((floorplan) => (
                      <tr key={floorplan.id}>
                        <td>{floorplan.fileName}</td>
                        <td>{floorplan.path}</td>
                        <td>{floorplan.level || '-'}</td>
                        <td><span className={floorplan.file ? 'fileStateReady' : 'fileStateMissing'}>{floorplan.fileState}</span></td>
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
│  └ ${panoramas.find((panorama) => panorama.file)?.fileName ?? 'scene01.jpg'}
├ floorplans/
│  └ ${floorplans.find((floorplan) => floorplan.file)?.fileName ?? 'floorplan.jpg'}
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
        {(missingPanoramas.length > 0 || missingFloorplans.length > 0) ? <p>警告: 未再登録ファイルはZIPに含まれません。</p> : null}
        <button type="button" onClick={() => void exportZip()} disabled={!canExport}>
          {isPackaging ? '📦 ZIP生成中' : '📦 ZIP出力'}
        </button>
      </section>
    </AppFrame>
  );
}

export default ProjectPackagerPage;
