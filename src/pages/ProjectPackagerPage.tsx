import JSZip from 'jszip';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppFrame from '../components/AppFrame';
import { useToast } from '../components/ToastProvider';
import {
  clearUpdatedProjectHandoff,
  loadUpdatedProjectHandoff,
  projectHandoffStorageKey,
  saveReviewProjectHandoff,
} from '../data/handoff';

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

type FloorMapPin = {
  id: string;
  panoramaId: string;
  label: string;
  x: number;
  y: number;
  direction: number;
  note: string;
};

type FloorMapEntry = {
  id: string;
  name: string;
  imageFileName: string;
  imagePath: string;
  level: string;
  pins: FloorMapPin[];
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
  floorMaps?: Array<Partial<FloorMapEntry>>;
  qa?: {
    resultPath?: string;
    summary?: Partial<QaSummary>;
  };
};

type ReadinessStatus = 'OK' | '注意' | '未設定' | '不足';

type ReadinessItem = {
  id: string;
  label: string;
  status: ReadinessStatus;
  message: string;
  detail?: string;
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

function normalizePercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(value * 10) / 10));
}

function normalizeFloorMaps(floorMaps?: Array<Partial<FloorMapEntry>>): FloorMapEntry[] {
  return (floorMaps ?? []).map((floorMap, index) => ({
    id: String(floorMap.id ?? `floor-map-${String(index + 1).padStart(2, '0')}`),
    name: String(floorMap.name ?? `Floor Map ${index + 1}`),
    imageFileName: String(floorMap.imageFileName ?? ''),
    imagePath: String(floorMap.imagePath ?? (floorMap.imageFileName ? `floorplans/${floorMap.imageFileName}` : '')),
    level: String(floorMap.level ?? ''),
    pins: (floorMap.pins ?? []).map((pin, pinIndex) => ({
      id: String(pin.id ?? `pin-${String(pinIndex + 1).padStart(3, '0')}`),
      panoramaId: String(pin.panoramaId ?? ''),
      label: String(pin.label ?? ''),
      x: normalizePercent(Number(pin.x ?? 0)),
      y: normalizePercent(Number(pin.y ?? 0)),
      direction: normalizeDirection(Number(pin.direction ?? 0)),
      note: String(pin.note ?? ''),
    })),
  }));
}

function validateProjectJson(value: unknown): ProjectJson {
  const candidate = value as Partial<ProjectJson>;

  if (!candidate || typeof candidate !== 'object') {
    throw new Error('案件データファイル（project.json）の形式が不正です。');
  }

  if (typeof candidate.schemaVersion !== 'string' || candidate.schemaVersion.length === 0) {
    throw new Error('データ形式のバージョン（schemaVersion）が存在しません。');
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

function validateFloorMapJson(value: unknown): FloorMapEntry[] {
  const candidate = value as { floorMaps?: Array<Partial<FloorMapEntry>> };

  if (!candidate || typeof candidate !== 'object' || !Array.isArray(candidate.floorMaps)) {
    throw new Error('平面図ピン情報ファイル（floor-map.json）は floorMaps 配列を含む必要があります。');
  }

  return normalizeFloorMaps(candidate.floorMaps);
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

function getReadinessIcon(status: ReadinessStatus) {
  if (status === 'OK') {
    return '✅';
  }
  if (status === '不足') {
    return '⛔';
  }
  return '⚠️';
}

function ProjectPackagerPage() {
  const { notify } = useToast();
  const navigate = useNavigate();
  const updatedProjectHandoffLoadedRef = useRef(false);
  const [form, setForm] = useState<ProjectForm>({
    projectName: '',
    clientName: '',
    manager: '',
    purpose: '',
    description: '',
  });
  const [panoramas, setPanoramas] = useState<PanoramaEntry[]>([]);
  const [floorplans, setFloorplans] = useState<FloorplanEntry[]>([]);
  const [floorMaps, setFloorMaps] = useState<FloorMapEntry[]>([]);
  const [qaRows, setQaRows] = useState<QaResultRow[]>([]);
  const [qaSummary, setQaSummary] = useState<QaSummary>(emptyQaSummary);
  const [qaFile, setQaFile] = useState<File | null>(null);
  const [qaResultPath, setQaResultPath] = useState('');
  const [importedProject, setImportedProject] = useState<ImportedProject | null>(null);
  const [receivedUpdatedProject, setReceivedUpdatedProject] = useState<{ createdAt: string; source: string } | null>(null);
  const [messages, setMessages] = useState<string[]>([]);
  const [isPackaging, setIsPackaging] = useState(false);

  const qaByFileName = useMemo(() => new Map(qaRows.map((row) => [row.fileName, row.status ?? ''])), [qaRows]);
  const missingPanoramas = panoramas.filter((panorama) => !panorama.file);
  const missingFloorplans = floorplans.filter((floorplan) => !floorplan.file);
  const floorMapPinCount = floorMaps.reduce((total, floorMap) => total + floorMap.pins.length, 0);
  const missingFloorMapImages = floorMaps.filter(
    (floorMap) => floorMap.imageFileName && !floorplans.some((floorplan) => floorplan.fileName === floorMap.imageFileName && floorplan.file),
  );
  const missingFloorMapImageNames = useMemo(
    () => [...new Set(missingFloorMapImages.map((floorMap) => floorMap.imageFileName).filter(Boolean))],
    [missingFloorMapImages],
  );
  const metadataComplete = panoramas.filter((panorama) => panorama.locationName.trim().length > 0).length;
  const readinessItems = useMemo<ReadinessItem[]>(() => {
    const unregisteredFiles = missingPanoramas.length + missingFloorplans.length;
    const locationMissing = Math.max(0, panoramas.length - metadataComplete);
    return [
      {
        id: 'project-name',
        label: '案件名',
        status: form.projectName.trim().length > 0 ? 'OK' : '注意',
        message: form.projectName.trim().length > 0 ? '入力済み' : '案件名が未入力です',
      },
      {
        id: 'panoramas',
        label: 'パノラマ画像',
        status: panoramas.length > 0 ? 'OK' : '不足',
        message: panoramas.length > 0 ? `${panoramas.length}件登録済み` : '1枚以上登録してください',
      },
      {
        id: 'floorplans',
        label: '平面図画像',
        status: floorplans.length > 0 ? 'OK' : '注意',
        message: floorplans.length > 0 ? `${floorplans.length}件登録済み` : '未登録です',
      },
      {
        id: 'floor-maps',
        label: '平面図ピン情報',
        status: floorMaps.length > 0 ? 'OK' : '注意',
        message: floorMaps.length > 0 ? `${floorMaps.length}件あります` : '未作成です',
      },
      {
        id: 'floor-map-images',
        label: 'ピン情報に対応する平面図画像',
        status: floorMaps.length === 0 ? '注意' : missingFloorMapImageNames.length === 0 ? 'OK' : '注意',
        message: floorMaps.length === 0
          ? '平面図ピン情報が未作成です'
          : missingFloorMapImageNames.length === 0
            ? '対応画像があります'
            : '対応する画像が未登録です',
        detail: missingFloorMapImageNames.length > 0 ? missingFloorMapImageNames.join('、') : undefined,
      },
      {
        id: 'locations',
        label: 'パノラマの場所名',
        status: locationMissing === 0 ? 'OK' : '注意',
        message: panoramas.length > 0 ? `${metadataComplete}件 / ${panoramas.length}件 入力済み` : 'パノラマ未登録です',
        detail: locationMissing > 0 ? `${locationMissing}件が未入力です` : undefined,
      },
      {
        id: 'qa',
        label: 'QA結果',
        status: qaSummary.total === 0 ? '注意' : qaSummary.error > 0 ? '不足' : 'OK',
        message: qaSummary.total === 0 ? 'QA結果が未読み込みです' : qaSummary.error > 0 ? `Error ${qaSummary.error}件` : 'Errorなし',
      },
      {
        id: 'real-files',
        label: '実ファイル未登録',
        status: unregisteredFiles === 0 ? 'OK' : '注意',
        message: unregisteredFiles === 0 ? '未登録項目なし' : `${unregisteredFiles}件あります`,
      },
    ];
  }, [
    floorMaps.length,
    floorplans.length,
    form.projectName,
    metadataComplete,
    missingFloorMapImageNames,
    missingFloorplans.length,
    missingPanoramas.length,
    panoramas.length,
    qaSummary.error,
    qaSummary.total,
  ]);
  const readinessWarningCount = readinessItems.filter((item) => item.status !== 'OK').length;
  const isPackageReady = readinessItems.every((item) => item.status !== '不足');
  const sortedPanoramas = useMemo(
    () => [...panoramas].sort((a, b) => a.sortOrder - b.sortOrder || a.fileName.localeCompare(b.fileName)),
    [panoramas],
  );
  const safeProjectName = sanitizeFileName(form.projectName);
  const canExport = form.projectName.trim().length > 0 && !isPackaging;
  const nextFloorMapMessage = floorMaps.length > 0
    ? '登録済みの平面図ピン情報を確認・編集できます。'
    : panoramas.length > 0
      ? '登録したパノラマを平面図に配置できます。'
      : '先に案件データファイルを作成または読み込んでください。';

  const updateForm = (key: keyof ProjectForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const updatePanorama = <Key extends keyof PanoramaEntry>(id: string, key: Key, value: PanoramaEntry[Key]) => {
    setPanoramas((current) =>
      current.map((panorama) => (panorama.id === id ? { ...panorama, [key]: value } : panorama)),
    );
  };

  const applyProjectJson = (parsed: ProjectJson, message: string) => {
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
    setFloorMaps(normalizeFloorMaps(parsed.floorMaps));
    setQaRows([]);
    setQaSummary(importedSummary);
    setQaFile(null);
    setQaResultPath(parsed.qa?.resultPath ?? '');
    setImportedProject({
      schemaVersion: parsed.schemaVersion,
      importedAt: new Date().toISOString(),
      resultPath: parsed.qa?.resultPath ?? '',
    });
    setMessages([message]);
  };

  useEffect(() => {
    if (updatedProjectHandoffLoadedRef.current) {
      return;
    }

    updatedProjectHandoffLoadedRef.current = true;
    try {
      const handoff = loadUpdatedProjectHandoff<ProjectJson & { createdAt?: string; source?: string }>();
      if (!handoff) {
        return;
      }

      const parsed = validateProjectJson(handoff);
      const normalizedFloorMaps = normalizeFloorMaps(parsed.floorMaps);
      applyProjectJson(parsed, '平面図ピン配置から受け取ったデータです。画像ファイル本体は受け渡し対象外です。ZIPに含めるには、必要に応じて同名ファイルを再登録してください。');
      setReceivedUpdatedProject({
        createdAt: handoff.createdAt ?? new Date().toISOString(),
        source: handoff.source ?? 'floormap',
      });
      notify('更新済み案件データを読み込みました', 'success');
      if (normalizedFloorMaps.some((floorMap) => floorMap.imageFileName)) {
        notify('平面図画像の再登録が必要です', 'warning');
      }
    } catch (error) {
      setMessages([error instanceof Error ? error.message : '更新済み案件データを読み込めませんでした。']);
      notify('更新済み案件データを読み込めませんでした', 'error');
    }
  }, [notify]);

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
    if (accepted.length > 0) {
      notify('パノラマ画像を登録しました', 'success');
    }
    if (invalidFiles.length > 0) {
      notify('非対応形式のファイルを除外しました', 'warning');
    }
    if (failed.length > 0) {
      notify('パノラマ画像の読み込みに失敗しました', 'error');
    }
  };

  const addFloorplans = (fileList: FileList | null) => {
    if (!fileList) {
      return;
    }

    const files = Array.from(fileList);
    const validFiles = files.filter((file) => imageExtensions.has(getExtension(file.name)));
    const invalidFiles = files.filter((file) => !imageExtensions.has(getExtension(file.name)));
    const linkedFloorMapFileNames = [
      ...new Set(
        validFiles
          .map((file) => file.name)
          .filter((fileName) => floorMaps.some((floorMap) => floorMap.imageFileName === fileName)),
      ),
    ];

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
    if (validFiles.length > 0) {
      notify('平面図を登録しました', 'success');
    }
    if (linkedFloorMapFileNames.length === 1) {
      notify(`${linkedFloorMapFileNames[0]} を平面図ピン情報に紐づけました`, 'success');
    } else if (linkedFloorMapFileNames.length > 1) {
      notify(`${linkedFloorMapFileNames.length}件の平面図画像を平面図ピン情報に紐づけました`, 'success');
    }
    if (invalidFiles.length > 0) {
      notify('非対応形式のファイルを除外しました', 'warning');
    }
  };

  const addQaJson = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    if (getExtension(file.name) !== 'json') {
      setMessages([`${file.name}: QA結果はJSONファイルを指定してください。`]);
      notify('QA結果JSONの読み込みに失敗しました', 'error');
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
      notify('QA JSONを読み込みました', 'success');
    } catch (error) {
      setQaRows([]);
      setQaSummary(emptyQaSummary);
      setQaFile(null);
      setQaResultPath('');
      setMessages([error instanceof Error ? error.message : 'QA結果JSONを読み込めません。']);
      notify('QA結果JSONの読み込みに失敗しました', 'error');
    }
  };

  const importProjectJson = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    if (getExtension(file.name) !== 'json') {
      setMessages([`${file.name}: 案件データファイル（project.json）を指定してください。`]);
      notify('案件データファイルの読み込みに失敗しました', 'error');
      return;
    }

    try {
      const parsed = validateProjectJson(JSON.parse(await file.text()) as unknown);
      applyProjectJson(parsed, `${file.name}: 案件データファイル（project.json）を読み込みました。実画像ファイルは復元されないため、同名ファイルを再登録してください。`);
      setReceivedUpdatedProject(null);
      notify('案件データファイルを読み込みました', 'success');
    } catch (error) {
      setMessages([error instanceof Error ? error.message : '案件データファイルを読み込めません。']);
      notify('案件データファイルの読み込みに失敗しました', 'error');
    }
  };

  const importFloorMapJson = async (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }

    if (getExtension(file.name) !== 'json') {
      setMessages([`${file.name}: 平面図ピン情報ファイル（floor-map.json）を指定してください。`]);
      notify('平面図ピン情報ファイルの読み込みに失敗しました', 'error');
      return;
    }

    try {
      const nextFloorMaps = validateFloorMapJson(JSON.parse(await file.text()) as unknown);
      setFloorMaps(nextFloorMaps);
      setMessages([`${file.name}: 平面図ピン情報（floorMaps）を読み込みました。既存の平面図ピン情報は上書きされました。`]);
      notify('平面図ピン情報ファイルを読み込みました', 'success');
    } catch (error) {
      setMessages([error instanceof Error ? error.message : '平面図ピン情報ファイルを読み込めません。']);
      notify('平面図ピン情報ファイルの読み込みに失敗しました', 'error');
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
      floorMaps,
    };
  };

  const exportZip = async () => {
    if (!canExport) {
      return;
    }

    if (readinessWarningCount > 0) {
      notify('ZIP出力前チェックを確認してください', 'info');
    }

    setIsPackaging(true);
    const warnings = [
      ...(panoramas.length === 0 ? ['パノラマ画像が0枚です。空のpanoramasフォルダを含めて出力します。'] : []),
      ...(missingPanoramas.length > 0
        ? [`未再登録のパノラマ ${missingPanoramas.length} 件は案件データファイル（project.json）に残りますが、ZIP内に実ファイルは含まれません。`]
        : []),
      ...(missingFloorplans.length > 0
        ? [`未再登録の平面図 ${missingFloorplans.length} 件は案件データファイル（project.json）に残りますが、ZIP内に実ファイルは含まれません。`]
        : []),
      ...(!qaFile && qaResultPath ? ['QA結果JSONの実ファイルが未再登録のため、qaフォルダには含まれません。'] : []),
      ...(missingFloorMapImages.length > 0
        ? [`平面図ピン情報（floorMaps）に紐づく平面図画像 ${missingFloorMapImages.length} 件の実ファイルが未登録です。ZIPに画像本体が含まれない可能性があります。`]
        : []),
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

    if (floorMaps.length > 0) {
      zip.folder('floor-maps')?.file('floor-map.json', JSON.stringify({ floorMaps }, null, 2));
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, `${safeProjectName || 'panorama-project'}.zip`);
    setMessages(warnings.length > 0 ? warnings : ['ZIPを書き出しました。']);
    setIsPackaging(false);
    if (readinessWarningCount > 0) {
      notify('注意項目がありますがZIPを書き出しました', 'warning');
    } else {
      notify('平面図ピン情報を含めてZIPを書き出しました', 'success');
    }
  };

  const handOffToFloorMap = () => {
    const projectData = buildProjectJson();
    const payload = {
      project: projectData.project,
      panoramas: projectData.panoramas,
      floorplans: projectData.floorplans,
      qa: projectData.qa,
      floorMaps: projectData.floorMaps,
      createdAt: new Date().toISOString(),
      source: 'packager',
    };

    sessionStorage.setItem(projectHandoffStorageKey, JSON.stringify(payload));

    if (panoramas.length === 0) {
      notify('パノラマが未登録です。必要に応じて案件パッケージ作成で追加してください。', 'warning');
    } else if (form.projectName.trim().length === 0) {
      notify('案件名が未入力です。必要に応じて案件情報を入力してください。', 'warning');
    } else {
      notify('案件データを平面図ピン配置へ渡しました', 'success');
    }

    navigate('/floormap');
  };

  const handOffToReviewExporter = () => {
    const projectData = buildProjectJson();
    saveReviewProjectHandoff({
      ...projectData,
      createdAt: new Date().toISOString(),
      source: 'packager',
    });
    notify('案件データをレビュー書き出しへ渡しました', 'success');
    navigate('/review-exporter');
  };

  const clearReceivedUpdatedProject = () => {
    clearUpdatedProjectHandoff();
    setReceivedUpdatedProject(null);
    notify('受け取ったデータをクリアしました', 'success');
  };

  return (
    <AppFrame toolName="案件パッケージ作成" status="基本機能版 v0.3">
      <section className="qaHero workspaceHero" aria-labelledby="packager-title">
        <div>
          <p className="eyebrow">案件パッケージ作成 v0.3</p>
          <h1 id="packager-title">案件単位のZIPパッケージ作成</h1>
          <p className="lead">
            案件データファイル（project.json）の再読み込み、案件情報の再編集、実ファイルの再登録に対応しました。
          </p>
        </div>
      </section>

      <section className="dashboardGrid" aria-label="案件パッケージ作成 ダッシュボード">
        <article className="metricCard"><span>パノラマ</span><strong>{panoramas.length}</strong></article>
        <article className="metricCard"><span>平面図</span><strong>{floorplans.length}</strong></article>
        <article className="metricCard warningMetric"><span>不足ファイル</span><strong>{missingPanoramas.length + missingFloorplans.length}</strong></article>
        <article className="metricCard"><span>品質チェック</span><strong>{qaSummary.total > 0 ? `${qaSummary.ok}/${qaSummary.total}` : '-'}</strong></article>
        <article className="metricCard successMetric"><span>場所名入力済み</span><strong>{metadataComplete}/{panoramas.length}</strong></article>
        <article className="metricCard"><span>平面図ピン情報</span><strong>{floorMaps.length}</strong></article>
        <article className="metricCard"><span>ピン</span><strong>{floorMapPinCount}</strong></article>
        <article className={isPackageReady ? 'metricCard successMetric' : 'metricCard warningMetric'}><span>Ready</span><strong>{isPackageReady ? 'OK' : '不足'}</strong></article>
        <article className={readinessWarningCount > 0 ? 'metricCard warningMetric' : 'metricCard successMetric'}><span>Warnings</span><strong>{readinessWarningCount}</strong></article>
      </section>

      <section className="importPanel" aria-labelledby="import-title">
        <div>
          <h2 id="import-title">案件データファイル（project.json）読み込み</h2>
          <p>既存パッケージの案件データファイルを読み込むと、案件情報・一覧・品質チェック結果を復元できます。</p>
          <p>案件データファイルだけでは実画像ファイル本体は復元できません。同名ファイルを再登録すると一覧に紐づきます。</p>
        </div>
        <label className="fileUploadButton secondaryUpload">
          📁 案件データファイルを読み込む
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
          <div><span>データ形式</span><strong>{importedProject.schemaVersion}</strong></div>
          <div><span>QA結果パス</span><strong>{importedProject.resultPath || '-'}</strong></div>
          <div><span>未再登録ファイル</span><strong>{missingPanoramas.length + missingFloorplans.length}</strong></div>
        </section>
      ) : null}

      {receivedUpdatedProject ? (
        <section className="handoffPanel" aria-label="平面図ピン配置から受け取ったデータ">
          <div>
            <p className="sectionKicker">受け取りデータ</p>
            <h2>平面図ピン配置から受け取ったデータです</h2>
            <p>画像ファイル本体は受け渡し対象外です。ZIPに含めるには、必要に応じて同名ファイルを再登録してください。</p>
          </div>
          <div className="handoffSummary">
            <div><span>データ元</span><strong>{receivedUpdatedProject.source === 'floormap' ? '平面図ピン配置' : receivedUpdatedProject.source}</strong></div>
            <div><span>平面図ピン情報</span><strong>{floorMaps.length}</strong></div>
            <div><span>ピン</span><strong>{floorMapPinCount}</strong></div>
          </div>
          <button type="button" className="button buttonSecondary" onClick={clearReceivedUpdatedProject}>
            受け取ったデータをクリア
          </button>
        </section>
      ) : null}

      <section className="packagerLayout" aria-label="案件パッケージ作成 作業エリア">
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
              <label className="fileUploadButton secondaryUpload">
                📁 平面図ピン情報を読み込む
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={(event) => {
                    void importFloorMapJson(event.target.files);
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

            {(missingPanoramas.length > 0 || missingFloorplans.length > 0 || missingFloorMapImages.length > 0) ? (
              <div className="missingNotice">
                <strong>実ファイル再登録が必要です。</strong>
                <span>未再登録の項目は案件データファイル / 平面図ピン情報には残りますが、ZIP内に実ファイルは含まれません。</span>
                {missingFloorMapImages.length > 0 ? (
                  <span>
                    平面図画像が未登録です: {missingFloorMapImages.map((floorMap) => floorMap.imageFileName).join('、')} を再登録してください。同じファイル名の画像を登録すると、ZIPに含められます。
                  </span>
                ) : null}
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
                          <p>画像を追加、または案件データファイル（project.json）を読み込んで管理情報を復元してください。</p>
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

              <table className="compactTable">
                <thead>
                  <tr>
                    <th>平面図ピン情報</th>
                    <th>階</th>
                    <th>imageFileName</th>
                    <th>ピン数</th>
                    <th>平面図ファイル状態</th>
                  </tr>
                </thead>
                <tbody>
                  {floorMaps.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="emptyState smallEmpty">
                          <span>📍</span>
                          <strong>平面図ピン情報がありません</strong>
                          <p>平面図ピン配置でピンを作成し、更新済み案件データまたは平面図ピン情報ファイルを読み込んでください。</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    floorMaps.map((floorMap) => {
                      const matchedFloorplan = floorplans.find((floorplan) => floorplan.fileName === floorMap.imageFileName);
                      const hasRealFile = Boolean(matchedFloorplan?.file);
                      return (
                        <tr key={floorMap.id}>
                          <td>
                            <div className="sceneIdentity">
                              <strong>{floorMap.name}</strong>
                              <span>{floorMap.id}</span>
                            </div>
                          </td>
                          <td>{floorMap.level || '-'}</td>
                          <td>{floorMap.imageFileName || '-'}</td>
                        <td>{floorMap.pins.length}</td>
                        <td>
                          <span className={hasRealFile ? 'fileStateReady' : 'fileStateMissing'}>
                            {hasRealFile ? '紐づき完了' : '実ファイル未登録'}
                          </span>
                        </td>
                      </tr>
                      );
                    })
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
├ qa/
│  └ ${qaFile ? qaFile.name : 'qa-results.json'}
└ floor-maps/
   └ ${floorMaps.length > 0 ? 'floor-map.json' : '(平面図ピン情報なしの場合は省略)'}`}</pre>
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
            <div className="readinessChecklist">
              <div className="panelHeader">
                <h2>ZIP出力前チェックリスト</h2>
                <span>{readinessWarningCount > 0 ? `注意 ${readinessWarningCount}件` : '出力準備OK'}</span>
              </div>
              <ul>
                {readinessItems.map((item) => (
                  <li className={`readinessItem readiness${item.status}`} key={item.id}>
                    <span aria-hidden="true">{getReadinessIcon(item.status)}</span>
                    <div>
                      <strong>{item.label}: {item.message}</strong>
                      {item.detail ? <small>{item.detail}</small> : null}
                    </div>
                    <b>{item.status}</b>
                  </li>
                ))}
              </ul>
              {missingFloorMapImageNames.length > 0 ? (
                <div className="missingFileList">
                  <strong>不足している平面図画像</strong>
                  <ul>
                    {missingFloorMapImageNames.map((fileName) => <li key={fileName}>{fileName}</li>)}
                  </ul>
                  <p>同じファイル名の画像を平面図画像として登録すると、ZIPに含められます。</p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </section>

      <section className="packagerFooter">
        <div className="nextActionPanel">
          <div>
            <p className="sectionKicker">次の作業</p>
            <h2>平面図にパノラマ位置を配置する</h2>
            <p>{nextFloorMapMessage}</p>
          </div>
          <button type="button" className="button buttonPrimary" onClick={handOffToFloorMap}>
            平面図ピン配置へ送る
          </button>
        </div>
        <div className="nextActionPanel">
          <div>
            <p className="sectionKicker">レビュー</p>
            <h2>レビュー用レポートを作成する</h2>
            <p>現在の案件データをレビュー書き出しへ送り、印刷・PDF保存しやすいHTMLレポートを作成できます。</p>
          </div>
          <button type="button" className="button buttonSecondary" onClick={handOffToReviewExporter}>
            レビュー書き出しへ送る
          </button>
        </div>
        {form.projectName.trim().length === 0 ? <p>案件名を入力するとZIP出力できます。</p> : null}
        {panoramas.length === 0 ? <p>警告: パノラマ画像が0枚です。必要に応じて追加してください。</p> : null}
        {(missingPanoramas.length > 0 || missingFloorplans.length > 0) ? <p>警告: 未再登録ファイルはZIPに含まれません。</p> : null}
        {missingFloorMapImages.length > 0 ? <p>警告: 平面図ピン情報に紐づく平面図画像の実ファイルが未登録です。</p> : null}
        <button type="button" onClick={() => void exportZip()} disabled={!canExport}>
          {isPackaging ? '📦 ZIP生成中' : '📦 ZIP出力'}
        </button>
      </section>
    </AppFrame>
  );
}

export default ProjectPackagerPage;
