export const sampleProject = {
  projectName: 'Panorama Suite サンプル案件',
  clientName: 'サンプル施主',
  manager: '設計担当A',
  purpose: 'オフィス改修レビュー',
  description: '実画像なしで、Panorama Suite の基本フローを確認するためのサンプル案件です。',
  note: 'レビュー会議前に、品質チェック、平面図ピン、共有ZIPまでの流れを確認します。',
  summary: {
    panoramas: 3,
    floorplans: 1,
    pins: 3,
  },
  panoramas: [
    { id: 'scene01', fileName: 'scene01.jpg', floor: '1F', locationName: 'エントランス', direction: 90 },
    { id: 'scene02', fileName: 'scene02.jpg', floor: '1F', locationName: '執務エリア', direction: 180 },
    { id: 'scene03', fileName: 'scene03.jpg', floor: '1F', locationName: '会議室', direction: 270 },
  ],
  floorplans: [
    { id: 'floorplan-1f', fileName: 'floorplan-1f.jpg', level: '1F' },
  ],
  floorMaps: [
    {
      id: 'floor-map-01',
      name: '1F 平面図',
      imageFileName: 'floorplan-1f.jpg',
      level: '1F',
      pins: [
        { id: 'pin-001', panoramaId: 'scene01', label: 'エントランス', x: 22, y: 58, direction: 90 },
        { id: 'pin-002', panoramaId: 'scene02', label: '執務エリア', x: 54, y: 48, direction: 180 },
        { id: 'pin-003', panoramaId: 'scene03', label: '会議室', x: 72, y: 34, direction: 270 },
      ],
    },
  ],
};
