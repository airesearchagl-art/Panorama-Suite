export type ToolCategory =
  | 'Export'
  | 'Convert'
  | 'QA'
  | 'Manage'
  | 'Review'
  | 'Share'
  | 'VR'
  | 'Documentation';

export type ToolStatus = '公開中' | 'MVP公開中' | '構想中' | '開発予定';

export type ToolPriority = '最優先' | '高' | '中' | '将来';

export type Tool = {
  name: string;
  category: ToolCategory;
  status: ToolStatus;
  priority: ToolPriority;
  summary: string;
  href?: string;
  path?: string;
  capabilities: string[];
};

export const categories: ToolCategory[] = [
  'Export',
  'Convert',
  'QA',
  'Manage',
  'Review',
  'Share',
  'VR',
  'Documentation',
];

export const tools: Tool[] = [
  {
    name: 'Archview360',
    category: 'Review',
    status: '公開中',
    priority: '高',
    href: 'https://arch-view360.vercel.app/',
    summary: '建築パノラマの閲覧・レビュー向け公開ツール。',
    capabilities: ['360度ビュー', 'レビュー導線', '外部公開済み'],
  },
  {
    name: 'Panorama Flipper',
    category: 'Convert',
    status: '公開中',
    priority: '高',
    href: 'https://panorama-flipper.vercel.app/',
    summary: 'パノラマ画像の反転補正を行う公開ツール。',
    capabilities: ['左右反転', '確認作業', '外部公開済み'],
  },
  {
    name: 'Panorama QA',
    category: 'QA',
    status: '開発予定',
    priority: '最優先',
    path: '/qa',
    summary: '解像度、2:1比率、対応形式、命名規則を検査する品質確認ツール。',
    capabilities: ['解像度検査', '2:1比率チェック', '命名規則チェック'],
  },
  {
    name: 'Panorama Project Packager',
    category: 'Manage',
    status: '開発予定',
    priority: '最優先',
    path: '/packager',
    summary: '案件単位で画像・平面図・メタデータをZIP化する引継ぎ支援ツール。',
    capabilities: ['project.json生成', 'ZIP出力', '案件アーカイブ'],
  },
  {
    name: 'Panorama Converter',
    category: 'Convert',
    status: 'MVP公開中',
    priority: '最優先',
    path: '/converter',
    summary: 'パノラマ画像の形式変換、画質調整、リサイズ、一括ZIP出力を行うツール。',
    capabilities: ['Canvas変換', 'リサイズ', '一括ZIP出力'],
  },
  {
    name: 'SketchUp Panorama Export',
    category: 'Export',
    status: '構想中',
    priority: '高',
    summary: 'SketchUpやレンダラーからの360度出力を案件ルールに合わせて整理する入口。',
    capabilities: ['出力命名', '案件フォルダ生成', 'ビュー管理'],
  },
  {
    name: 'Panorama Metadata Manager',
    category: 'Manage',
    status: '開発予定',
    priority: '高',
    summary: '案件名、施主名、担当者、用途、備考などの管理情報を整備するツール。',
    capabilities: ['案件メタデータ', '担当者管理', '将来連携'],
  },
  {
    name: 'FloorMap Builder',
    category: 'Manage',
    status: '構想中',
    priority: '中',
    summary: '平面図登録、ピン配置、方位補正を行うマップ連携支援ツール。',
    capabilities: ['平面図登録', 'ピン配置', '方位補正'],
  },
  {
    name: 'Panorama Diff',
    category: 'Review',
    status: '構想中',
    priority: '中',
    summary: 'A案/B案の家具、照明、サイン、仕上などの差分を比較するツール。',
    capabilities: ['案比較', '変更確認', 'AI差分抽出候補'],
  },
  {
    name: 'Review Exporter',
    category: 'Documentation',
    status: '開発予定',
    priority: '高',
    summary: 'レビュー結果をPDF、Excel、PowerPoint、HTMLへ出力するツール。',
    capabilities: ['PDF出力', '会議資料', '設計記録'],
  },
  {
    name: 'Panorama Thumbnail Generator',
    category: 'Documentation',
    status: '構想中',
    priority: '中',
    summary: 'パノラマ一覧をHTML、PDF、Excel、PowerPoint形式で目録化するツール。',
    capabilities: ['目録作成', 'サムネイル', '提出資料'],
  },
  {
    name: 'Panorama Share Hub',
    category: 'Share',
    status: '構想中',
    priority: '中',
    summary: '社内外への共有、更新履歴、配布リンクを一元管理する共有ハブ。',
    capabilities: ['共有リンク', '更新履歴', '配布管理'],
  },
  {
    name: 'Panorama VR Launcher',
    category: 'VR',
    status: '構想中',
    priority: '中',
    summary: 'Meta Quest、Pico、Apple Vision Proでの確認導線を整えるVRビューア。',
    capabilities: ['VR起動', '端末別導線', 'クラウドVR候補'],
  },
  {
    name: 'Panorama AI Assistant',
    category: 'Review',
    status: '構想中',
    priority: '将来',
    summary: '家具、設備、サイン、仕上、空間用途を解析するレビュー支援AI。',
    capabilities: ['画像解析', '自動コメント', 'VE提案候補'],
  },
  {
    name: 'Panorama Docs',
    category: 'Documentation',
    status: '構想中',
    priority: '中',
    summary: 'チュートリアル、運用ルール、リリースノートを集約するドキュメント領域。',
    capabilities: ['利用手順', '運用標準', '更新履歴'],
  },
];

export const featuredTools = tools.filter((tool) => tool.priority === '最優先');
