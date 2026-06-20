import { useEffect, useMemo, useRef, useState, type MouseEvent } from 'react';
import AppFrame from '../components/AppFrame';
import { useToast } from '../components/ToastProvider';
import { projectHandoffStorageKey } from '../data/handoff';

type ProjectInfo = Record<string, unknown>;

type PanoramaScene = {
  id: string;
  fileName: string;
  locationName: string;
  floor: string;
  sceneType: string;
  direction: number;
  qaStatus: string;
} & Record<string, unknown>;

type FloorplanInfo = {
  id: string;
  fileName: string;
  path: string;
  level: string;
  description: string;
} & Record<string, unknown>;

type FloorMapPin = {
  id: string;
  panoramaId: string;
  label: string;
  x: number;
  y: number;
  direction: number;
  note: string;
};

type FloorMap = {
  id: string;
  name: string;
  imageFileName: string;
  imagePath: string;
  level: string;
  pins: FloorMapPin[];
};

type SourceProject = {
  schemaVersion?: string;
  project: ProjectInfo;
  panoramas: PanoramaScene[];
  floorplans: FloorplanInfo[];
  qa?: unknown;
  floorMaps: FloorMap[];
  handoffCreatedAt?: string;
  handoffSource?: string;
};

type UploadedFloorMap = {
  id: string;
  name: string;
  fileName: string;
  imagePath: string;
  level: string;
  previewUrl: string;
};

type RawProject = {
  schemaVersion?: string;
  project?: ProjectInfo;
  panoramas?: Array<Partial<PanoramaScene>>;
  floorplans?: Array<Partial<FloorplanInfo>>;
  qa?: unknown;
  floorMaps?: Array<Partial<FloorMap>>;
  createdAt?: string;
  source?: string;
};

const imageExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

function normalizeDirection(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return ((Math.round(value) % 360) + 360) % 360;
}

function clampPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, Math.round(value * 10) / 10));
}

function downloadJson(fileName: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function validateProjectJson(value: unknown): SourceProject {
  const candidate = value as RawProject;
  if (!candidate || typeof candidate !== 'object') {
    throw new Error('案件データファイル（project.json）の形式が正しくありません。');
  }
  if (!candidate.project || typeof candidate.project !== 'object') {
    throw new Error('project が存在しません。');
  }
  if (!Array.isArray(candidate.panoramas)) {
    throw new Error('panoramas が配列ではありません。');
  }

  return {
    schemaVersion: candidate.schemaVersion,
    project: candidate.project,
    panoramas: candidate.panoramas.map((panorama, index) => ({
      ...panorama,
      id: String(panorama.id ?? `panorama-${String(index + 1).padStart(3, '0')}`),
      fileName: String(panorama.fileName ?? ''),
      locationName: String(panorama.locationName ?? ''),
      floor: String(panorama.floor ?? ''),
      sceneType: String(panorama.sceneType ?? ''),
      direction: normalizeDirection(Number(panorama.direction ?? 0)),
      qaStatus: String(panorama.qaStatus ?? ''),
    })),
    floorplans: (candidate.floorplans ?? []).map((floorplan, index) => ({
      ...floorplan,
      id: String(floorplan.id ?? `floorplan-${String(index + 1).padStart(3, '0')}`),
      fileName: String(floorplan.fileName ?? ''),
      path: String(floorplan.path ?? ''),
      level: String(floorplan.level ?? ''),
      description: String(floorplan.description ?? ''),
    })),
    qa: candidate.qa,
    floorMaps: (candidate.floorMaps ?? []).map((floorMap, index) => ({
      id: String(floorMap.id ?? `floor-map-${String(index + 1).padStart(2, '0')}`),
      name: String(floorMap.name ?? `Floor Map ${index + 1}`),
      imageFileName: String(floorMap.imageFileName ?? ''),
      imagePath: String(floorMap.imagePath ?? ''),
      level: String(floorMap.level ?? ''),
      pins: (floorMap.pins ?? []).map((pin, pinIndex) => ({
        id: String(pin.id ?? `pin-${String(pinIndex + 1).padStart(3, '0')}`),
        panoramaId: String(pin.panoramaId ?? ''),
        label: String(pin.label ?? ''),
        x: clampPercent(Number(pin.x ?? 0)),
        y: clampPercent(Number(pin.y ?? 0)),
        direction: normalizeDirection(Number(pin.direction ?? 0)),
        note: String(pin.note ?? ''),
      })),
    })),
  };
}

function createFloorMapFromUpload(file: File, previewUrl: string): UploadedFloorMap {
  return {
    id: `floor-map-${Date.now()}`,
    name: file.name.replace(/\.[^.]+$/, ''),
    fileName: file.name,
    imagePath: `floorplans/${file.name}`,
    level: '',
    previewUrl,
  };
}

function FloorMapBuilderPage() {
  const { notify } = useToast();
  const handoffLoadedRef = useRef(false);
  const [sourceProject, setSourceProject] = useState<SourceProject | null>(null);
  const [floorMap, setFloorMap] = useState<UploadedFloorMap | null>(null);
  const [pins, setPins] = useState<FloorMapPin[]>([]);
  const [selectedPanoramaId, setSelectedPanoramaId] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [handoffMessage, setHandoffMessage] = useState('');

  const panoramas = sourceProject?.panoramas ?? [];
  const assignedPanoramaIds = pins.map((pin) => pin.panoramaId).filter(Boolean);
  const duplicateAssignments = assignedPanoramaIds.filter((id, index) => assignedPanoramaIds.indexOf(id) !== index);
  const unassignedCount = panoramas.filter((panorama) => !pins.some((pin) => pin.panoramaId === panorama.id)).length;
  const hasMissingAssignments = unassignedCount > 0 && panoramas.length > 0;
  const handoffFloorMapCount = sourceProject?.floorMaps.length ?? 0;
  const handoffSourceLabel = sourceProject?.handoffSource === 'packager' ? '案件パッケージ作成' : sourceProject?.handoffSource ?? '';

  const selectedPanorama = panoramas.find((panorama) => panorama.id === selectedPanoramaId);
  const activeFloorMaps = useMemo<FloorMap[]>(() => {
    const restoredMaps = sourceProject?.floorMaps ?? [];
    const currentMap = floorMap
      ? {
          id: floorMap.id,
          name: floorMap.name,
          imageFileName: floorMap.fileName,
          imagePath: floorMap.imagePath,
          level: floorMap.level,
          pins,
        }
      : null;

    if (!currentMap) {
      return restoredMaps;
    }

    return [currentMap, ...restoredMaps.filter((map) => map.id !== currentMap.id)];
  }, [floorMap, pins, sourceProject?.floorMaps]);

  useEffect(() => {
    if (handoffLoadedRef.current) {
      return;
    }

    handoffLoadedRef.current = true;
    const raw = sessionStorage.getItem(projectHandoffStorageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as RawProject;
      const project = validateProjectJson(parsed);
      const restoredProject: SourceProject = {
        ...project,
        handoffCreatedAt: typeof parsed.createdAt === 'string' ? parsed.createdAt : '',
        handoffSource: typeof parsed.source === 'string' ? parsed.source : 'packager',
      };

      setSourceProject(restoredProject);
      setPins(project.floorMaps[0]?.pins ?? []);
      setSelectedPanoramaId(project.panoramas[0]?.id ?? '');
      setMessages(['案件パッケージ作成から受け取ったデータです。']);
      setHandoffMessage('案件パッケージ作成から受け取ったデータです。');
      notify('案件データを読み込みました', 'success');
    } catch (error) {
      setMessages([error instanceof Error ? error.message : '受け渡しデータを読み込めませんでした。']);
      notify('受け渡しデータを読み込めませんでした', 'error');
    }
  }, [notify]);

  const handleFloorMapUpload = (fileList: FileList | null) => {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    if (!imageExtensions.has(getExtension(file.name))) {
      setMessages([`${file.name}: 対応形式は jpg / jpeg / png / webp です。`]);
      notify('平面図の読み込みに失敗しました', 'error');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const nextFloorMap = createFloorMapFromUpload(file, previewUrl);
    setFloorMap(nextFloorMap);
    setPins((current) => (current.length > 0 ? current : sourceProject?.floorMaps[0]?.pins ?? []));
    setMessages([]);
    notify('平面図を読み込みました', 'success');
  };

  const handleProjectImport = async (fileList: FileList | null) => {
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
      setSourceProject(parsed);
      setPins((current) => (current.length > 0 ? current : parsed.floorMaps[0]?.pins ?? []));
      setSelectedPanoramaId(parsed.panoramas[0]?.id ?? '');
      setHandoffMessage('');
      setMessages([`${file.name}: 案件データファイル（project.json）を読み込みました。`]);
      notify('案件データファイルを読み込みました', 'success');
    } catch (error) {
      setSourceProject(null);
      setMessages([error instanceof Error ? error.message : '案件データファイルを読み込めません。']);
      notify('案件データファイルの読み込みに失敗しました', 'error');
    }
  };

  const addPinAt = (x: number, y: number) => {
    const panorama = panoramas.find((item) => item.id === selectedPanoramaId);
    const nextPin: FloorMapPin = {
      id: `pin-${String(pins.length + 1).padStart(3, '0')}-${Date.now()}`,
      panoramaId: panorama?.id ?? '',
      label: panorama?.locationName || panorama?.fileName || `Pin ${pins.length + 1}`,
      x: clampPercent(x),
      y: clampPercent(y),
      direction: normalizeDirection(panorama?.direction ?? 0),
      note: '',
    };
    setPins((current) => [...current, nextPin]);
    notify('ピンを追加しました', 'success');
  };

  const handleCanvasClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!floorMap) {
      notify('先に平面図を読み込んでください', 'warning');
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    addPinAt(((event.clientX - rect.left) / rect.width) * 100, ((event.clientY - rect.top) / rect.height) * 100);
  };

  const updatePin = <Key extends keyof FloorMapPin>(id: string, key: Key, value: FloorMapPin[Key]) => {
    setPins((current) => current.map((pin) => (pin.id === id ? { ...pin, [key]: value } : pin)));
  };

  const deletePin = (id: string) => {
    setPins((current) => current.filter((pin) => pin.id !== id));
    notify('ピンを削除しました', 'success');
  };

  const buildFloorMaps = () => activeFloorMaps;

  const buildUpdatedProject = () => ({
    schemaVersion: sourceProject?.schemaVersion ?? '0.1.0',
    project: sourceProject?.project ?? {},
    panoramas,
    floorplans: sourceProject?.floorplans ?? [],
    qa: sourceProject?.qa ?? { summary: { total: 0, ok: 0, warning: 0, error: 0 } },
    floorMaps: buildFloorMaps(),
  });

  const clearHandoffData = () => {
    sessionStorage.removeItem(projectHandoffStorageKey);
    setHandoffMessage('');
    if (sourceProject?.handoffSource || sourceProject?.handoffCreatedAt) {
      setSourceProject({
        ...sourceProject,
        handoffCreatedAt: '',
        handoffSource: '',
      });
    }
    notify('受け渡しデータをクリアしました', 'success');
  };

  const exportFloorMapJson = () => {
    if (hasMissingAssignments) {
      notify('未割当パノラマがあります', 'warning');
    }
    downloadJson('floor-map.json', { floorMaps: buildFloorMaps() });
    notify('平面図ピン情報ファイルを書き出しました', 'success');
  };

  const exportUpdatedProjectJson = () => {
    if (hasMissingAssignments) {
      notify('未割当パノラマがあります', 'warning');
    }
    downloadJson('updated-project.json', buildUpdatedProject());
    notify('更新済み案件データを書き出しました', 'success');
  };

  return (
    <AppFrame toolName="平面図ピン配置" status="基本機能版">
      <section className="qaHero workspaceHero" aria-labelledby="floormap-title">
        <div>
          <p className="eyebrow">平面図ピン配置 基本機能版</p>
          <h1 id="floormap-title">平面図ピン配置</h1>
          <p className="lead">
            平面図画像の上に360°パノラマの撮影位置を配置し、平面図ピン情報（floorMaps）として保存します。
          </p>
          <p className="lead">
            案件パッケージ作成で出力した案件データファイル（project.json / updated-project.json）を読み込むと、パノラマ一覧を使ってピン配置できます。
          </p>
        </div>
        <div className="qaActions">
          <button type="button" className="button buttonPrimary" onClick={exportFloorMapJson} disabled={activeFloorMaps.length === 0}>
            平面図ピン情報
          </button>
          <button type="button" className="button buttonPrimary" onClick={exportUpdatedProjectJson} disabled={!sourceProject}>
            更新済み案件データ
          </button>
        </div>
      </section>

      <section className="dashboardGrid" aria-label="平面図ピン配置 ダッシュボード">
        <article className="metricCard"><span>平面図</span><strong>{activeFloorMaps.length}</strong></article>
        <article className="metricCard"><span>パノラマ</span><strong>{panoramas.length}</strong></article>
        <article className="metricCard successMetric"><span>ピン</span><strong>{pins.length}</strong></article>
        <article className="metricCard warningMetric"><span>未割当</span><strong>{unassignedCount}</strong></article>
      </section>

      {handoffMessage && sourceProject ? (
        <section className="handoffPanel" aria-label="受け渡し案件データ">
          <div>
            <p className="sectionKicker">受け渡しデータ</p>
            <h2>{handoffMessage}</h2>
            <p>画像ファイル本体は受け渡し対象外です。必要に応じて平面図画像を再登録してください。</p>
          </div>
          <div className="handoffSummary">
            <div><span>案件名</span><strong>{String(sourceProject.project.projectName ?? '-') || '-'}</strong></div>
            <div><span>施主名</span><strong>{String(sourceProject.project.clientName ?? '-') || '-'}</strong></div>
            <div><span>パノラマ数</span><strong>{panoramas.length}</strong></div>
            <div><span>平面図数</span><strong>{sourceProject.floorplans.length}</strong></div>
            <div><span>平面図ピン情報数</span><strong>{handoffFloorMapCount}</strong></div>
            <div><span>データ元</span><strong>{handoffSourceLabel || '案件パッケージ作成'}</strong></div>
          </div>
          <button type="button" className="button buttonSecondary" onClick={clearHandoffData}>
            受け渡しデータをクリア
          </button>
        </section>
      ) : null}

      <section className="floorMapLayout" aria-label="平面図ピン配置 作業エリア">
        <aside className="floorMapControlPanel">
          <h2>読み込み</h2>
          <label className="fileUploadButton">
            平面図を読み込む
            <input
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(event) => {
                handleFloorMapUpload(event.target.files);
                event.currentTarget.value = '';
              }}
            />
          </label>
          <label className="fileUploadButton secondaryUpload">
            案件データファイルを読み込む
            <input
              type="file"
              accept=".json,application/json"
              onChange={(event) => {
                void handleProjectImport(event.target.files);
                event.currentTarget.value = '';
              }}
            />
          </label>
          {messages.length > 0 ? (
            <ul className="packagerMessages">
              {messages.map((message) => <li key={message}>{message}</li>)}
            </ul>
          ) : null}
          {!sourceProject ? (
            <div className="emptyState smallEmpty">
              <span>📄</span>
              <strong>案件データファイルが未読込です</strong>
              <p>案件パッケージ作成で出力した project.json を読み込んでください。</p>
            </div>
          ) : null}
          {!floorMap ? (
            <div className="emptyState smallEmpty">
              <span>🗺</span>
              <strong>平面図が未登録です</strong>
              <p>jpg / jpeg / png / webp の平面図を読み込んでください。</p>
            </div>
          ) : null}
        </aside>

        <main className="floorMapCanvasPanel">
          {floorMap ? (
            <>
              <div className="floorMapMeta">
                <label>
                  <span>FloorMap名</span>
                  <input value={floorMap.name} onChange={(event) => setFloorMap({ ...floorMap, name: event.target.value })} />
                </label>
                <label>
                  <span>階</span>
                  <input value={floorMap.level} onChange={(event) => setFloorMap({ ...floorMap, level: event.target.value })} placeholder="1F" />
                </label>
                <strong>{floorMap.fileName}</strong>
              </div>
              <div className="floorMapCanvas" onClick={handleCanvasClick} role="button" tabIndex={0}>
                <img src={floorMap.previewUrl} alt={floorMap.name} />
                {pins.map((pin, index) => (
                  <button
                    type="button"
                    className="floorMapPin"
                    key={pin.id}
                    style={{ left: `${pin.x}%`, top: `${pin.y}%`, ['--pin-direction' as string]: `${pin.direction}deg` }}
                    title={`${pin.label} / ${pin.direction}°`}
                    onClick={(event) => event.stopPropagation()}
                  >
                    <span>{index + 1}</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="emptyState floorMapEmpty">
              <span>🗺</span>
              <strong>平面図がありません</strong>
              <p>左側から平面図画像を読み込むと、ここにプレビューされます。</p>
            </div>
          )}
        </main>

        <aside className="floorMapSidePanel">
          <section>
            <h2>パノラマ一覧</h2>
            {panoramas.length === 0 ? (
              <div className="emptyState smallEmpty">
                <span>📷</span>
                <strong>パノラマがありません</strong>
                <p>案件データファイル（project.json）を読み込んでください。</p>
              </div>
            ) : (
              <div className="panoramaPickList">
                <label>
                  <span>配置するパノラマ</span>
                  <select value={selectedPanoramaId} onChange={(event) => setSelectedPanoramaId(event.target.value)}>
                    <option value="">未選択</option>
                    {panoramas.map((panorama) => (
                      <option value={panorama.id} key={panorama.id}>
                        {panorama.locationName || panorama.fileName}
                      </option>
                    ))}
                  </select>
                </label>
                <ul>
                  {panoramas.map((panorama) => {
                    const assigned = pins.some((pin) => pin.panoramaId === panorama.id);
                    return (
                      <li key={panorama.id} className={assigned ? 'assignedScene' : 'unassignedScene'}>
                        <strong>{panorama.fileName}</strong>
                        <span>{panorama.locationName || '-'} / {panorama.floor || '-'} / {panorama.sceneType || '-'}</span>
                        <small>{panorama.direction}° / QA: {panorama.qaStatus || '-'}</small>
                        <b>{assigned ? '割当済み' : '未割当'}</b>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </section>

          <section>
            <h2>ピン一覧</h2>
            {duplicateAssignments.length > 0 ? (
              <div className="missingNotice">
                <strong>同じパノラマが複数ピンに割り当てられています。</strong>
                <span>現時点では警告のみです。必要に応じて割当を見直してください。</span>
              </div>
            ) : null}
            {pins.length === 0 ? (
              <div className="emptyState smallEmpty">
                <span>📍</span>
                <strong>ピンがありません</strong>
                <p>{selectedPanorama ? '平面図をクリックして選択中のパノラマを配置してください。' : 'パノラマを選択してから平面図をクリックしてください。'}</p>
              </div>
            ) : (
              <div className="pinEditorList">
                {pins.map((pin) => (
                  <article className="pinEditorCard" key={pin.id}>
                    <div className="panelHeader">
                      <strong>{pin.label || pin.id}</strong>
                      <button type="button" className="tableButton" onClick={() => deletePin(pin.id)}>削除</button>
                    </div>
                    <label>
                      <span>label</span>
                      <input value={pin.label} onChange={(event) => updatePin(pin.id, 'label', event.target.value)} />
                    </label>
                    <label>
                      <span>panoramaId</span>
                      <select value={pin.panoramaId} onChange={(event) => updatePin(pin.id, 'panoramaId', event.target.value)}>
                        <option value="">未割当</option>
                        {panoramas.map((panorama) => (
                          <option value={panorama.id} key={panorama.id}>
                            {panorama.locationName || panorama.fileName}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="pinCoordinateGrid">
                      <label>
                        <span>x %</span>
                        <input type="number" min="0" max="100" value={pin.x} onChange={(event) => updatePin(pin.id, 'x', clampPercent(Number(event.target.value)))} />
                      </label>
                      <label>
                        <span>y %</span>
                        <input type="number" min="0" max="100" value={pin.y} onChange={(event) => updatePin(pin.id, 'y', clampPercent(Number(event.target.value)))} />
                      </label>
                      <label>
                        <span>direction °</span>
                        <input type="number" min="0" max="359" value={pin.direction} onChange={(event) => updatePin(pin.id, 'direction', normalizeDirection(Number(event.target.value)))} />
                      </label>
                    </div>
                    <label>
                      <span>note</span>
                      <input value={pin.note} onChange={(event) => updatePin(pin.id, 'note', event.target.value)} />
                    </label>
                  </article>
                ))}
              </div>
            )}
          </section>
        </aside>
      </section>
    </AppFrame>
  );
}

export default FloorMapBuilderPage;
