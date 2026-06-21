export const sampleProjectStorageKey = 'panorama-suite:sample-project';

export const sampleProject = {
  projectName: 'Panorama Suite サンプル案件',
  clientName: 'サンプル施主',
  manager: '設計担当A',
  purpose: 'オフィス改修レビュー',
  description: '実画像なしで、Panorama Suite の基本フローを確認するためのデモデータです。',
  shareNote: 'レビュー会議前に、品質チェック、平面図ピン、レビュー書き出し、共有ZIPまでの流れを確認します。',
  summary: {
    panoramas: 3,
    floorplans: 1,
    pins: 3,
  },
  panoramas: [
    { id: 'scene01', fileName: 'scene01.jpg', floor: '1F', locationName: 'エントランス', direction: 90, sceneType: 'エントランス', note: '受付から執務エリアへ向かう見え方を確認します。' },
    { id: 'scene02', fileName: 'scene02.jpg', floor: '1F', locationName: '執務エリア', direction: 180, sceneType: '執務エリア', note: 'デスク配置、通路幅、照明の見え方を確認します。' },
    { id: 'scene03', fileName: 'scene03.jpg', floor: '1F', locationName: '会議室', direction: 270, sceneType: '会議室', note: '会議室入口とモニター面の見え方を確認します。' },
  ],
  floorplans: [
    { id: 'floorplan-1f', fileName: 'floorplan-1f.jpg', level: '1F', description: '実画像なしのプレースホルダー平面図です。' },
  ],
  pins: [
    { id: 'pin-001', panoramaId: 'scene01', label: 'エントランス', x: 22, y: 58, direction: 90, note: '入口から受付方向を見る' },
    { id: 'pin-002', panoramaId: 'scene02', label: '執務エリア', x: 54, y: 48, direction: 180, note: '執務エリア中央から全体を見る' },
    { id: 'pin-003', panoramaId: 'scene03', label: '会議室', x: 72, y: 34, direction: 270, note: '会議室入口から内部を見る' },
  ],
  floorMaps: [
    {
      id: 'floor-map-01',
      name: '1F 平面図',
      imageFileName: 'floorplan-1f.jpg',
      level: '1F',
      pins: [
        { id: 'pin-001', panoramaId: 'scene01', label: 'エントランス', x: 22, y: 58, direction: 90, note: '入口から受付方向を見る' },
        { id: 'pin-002', panoramaId: 'scene02', label: '執務エリア', x: 54, y: 48, direction: 180, note: '執務エリア中央から全体を見る' },
        { id: 'pin-003', panoramaId: 'scene03', label: '会議室', x: 72, y: 34, direction: 270, note: '会議室入口から内部を見る' },
      ],
    },
  ],
  reviewNotes: [
    { id: 'review-001', target: 'エントランス', priority: '中', status: '確認中', comment: '受付背面のサイン位置を確認する。' },
    { id: 'review-002', target: '執務エリア', priority: '高', status: '未対応', comment: '通路幅と収納位置の干渉を確認する。' },
    { id: 'review-003', target: '会議室', priority: '低', status: '保留', comment: 'モニター面の反射を次回確認する。' },
  ],
};

export type SampleProject = typeof sampleProject;

export function saveSampleProjectState() {
  localStorage.setItem(sampleProjectStorageKey, JSON.stringify({
    loadedAt: new Date().toISOString(),
    project: sampleProject,
  }));
}

export function hasSampleProjectState() {
  return localStorage.getItem(sampleProjectStorageKey) !== null;
}

export function getSampleProjectState() {
  return hasSampleProjectState() ? sampleProject : null;
}

export function createSampleShareProject() {
  return {
    project: {
      projectName: sampleProject.projectName,
      clientName: sampleProject.clientName,
      manager: sampleProject.manager,
      purpose: sampleProject.purpose,
      description: sampleProject.description,
    },
    panoramas: sampleProject.panoramas.map((panorama) => ({
      id: panorama.id,
      fileName: panorama.fileName,
      path: `panoramas/${panorama.fileName}`,
    })),
    floorplans: sampleProject.floorplans.map((floorplan) => ({
      id: floorplan.id,
      fileName: floorplan.fileName,
      path: `floorplans/${floorplan.fileName}`,
    })),
    floorMaps: sampleProject.floorMaps,
    qa: {
      resultPath: 'qa/qa-results.json',
      summary: {
        total: sampleProject.summary.panoramas,
        ok: sampleProject.summary.panoramas,
        warning: 0,
        error: 0,
      },
    },
  };
}
