export type ToolCategory =
  | 'Export'
  | 'Convert'
  | 'QA'
  | 'Manage'
  | 'Review'
  | 'Share'
  | 'VR'
  | 'Documentation';

export type ToolAvailability = 'available' | 'mvp' | 'external' | 'development' | 'concept' | 'future';

export type ToolPriority = '最優先' | '高' | '中' | '将来';

export type Tool = {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  statusLabel: string;
  availability: ToolAvailability;
  href?: string;
  isExternal: boolean;
  isEnabled: boolean;
  priority: ToolPriority;
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

export const availabilityLabels: Record<ToolAvailability, string> = {
  available: '利用可能',
  mvp: 'MVP公開中',
  external: '外部公開中',
  development: '開発中',
  concept: '構想中',
  future: '将来予定',
};

export const tools: Tool[] = [
  {
    id: 'archview360',
    name: 'Archview360',
    category: 'Review',
    description: '建築パノラマの閲覧・レビュー向け公開ツール。',
    statusLabel: '外部公開中',
    availability: 'external',
    href: 'https://arch-view360.vercel.app/',
    isExternal: true,
    isEnabled: true,
    priority: '高',
    capabilities: ['360度ビュー', 'レビュー導線', '外部公開済み'],
  },
  {
    id: 'panorama-flipper',
    name: 'Panorama Flipper',
    category: 'Convert',
    description: 'パノラマ画像の反転補正を行う公開ツール。',
    statusLabel: '外部公開中',
    availability: 'external',
    href: 'https://panorama-flipper.vercel.app/',
    isExternal: true,
    isEnabled: true,
    priority: '高',
    capabilities: ['左右反転', '確認作業', '外部公開済み'],
  },
  {
    id: 'panorama-qa',
    name: 'Panorama QA',
    category: 'QA',
    description: '解像度、2:1比率、対応形式、命名規則を検査する品質確認ツール。',
    statusLabel: 'MVP公開中',
    availability: 'mvp',
    href: '/qa',
    isExternal: false,
    isEnabled: true,
    priority: '最優先',
    capabilities: ['解像度検査', '2:1比率チェック', '命名規則チェック'],
  },
  {
    id: 'project-packager',
    name: 'Panorama Project Packager',
    category: 'Manage',
    description: '案件単位で画像・平面図・メタデータをZIP化する引継ぎ支援ツール。',
    statusLabel: 'MVP公開中',
    availability: 'mvp',
    href: '/packager',
    isExternal: false,
    isEnabled: true,
    priority: '最優先',
    capabilities: ['project.json生成', 'sceneメタ情報', 'ZIP出力'],
  },
  {
    id: 'panorama-converter',
    name: 'Panorama Converter',
    category: 'Convert',
    description: 'パノラマ画像の形式変換、画質調整、リサイズ、一括ZIP出力を行うツール。',
    statusLabel: 'MVP公開中',
    availability: 'mvp',
    href: '/converter',
    isExternal: false,
    isEnabled: true,
    priority: '最優先',
    capabilities: ['Canvas変換', 'リサイズ', '一括ZIP出力'],
  },
  {
    id: 'documentation',
    name: 'Documentation',
    category: 'Documentation',
    description: 'Panorama Suite の概要、利用フロー、セキュリティ方針を確認するマニュアル。',
    statusLabel: '利用可能',
    availability: 'available',
    href: '/docs',
    isExternal: false,
    isEnabled: true,
    priority: '高',
    capabilities: ['Manual', 'Tool Guide', 'Roadmap'],
  },
  {
    id: 'help',
    name: 'Help',
    category: 'Documentation',
    description: 'よくある操作、トラブル対応、公開URLを確認するヘルプ。',
    statusLabel: '利用可能',
    availability: 'available',
    href: '/help',
    isExternal: false,
    isEnabled: true,
    priority: '高',
    capabilities: ['FAQ', 'Troubleshooting', 'Support Guide'],
  },
  {
    id: 'design-system',
    name: 'Design System',
    category: 'Documentation',
    description: 'Design System v1.0 のルールとUI方針を確認するページ。',
    statusLabel: '利用可能',
    availability: 'available',
    href: '/docs/design-system',
    isExternal: false,
    isEnabled: true,
    priority: '中',
    capabilities: ['UI Rules', 'Dashboard', 'Local Processing'],
  },
  {
    id: 'floor-map-builder',
    name: 'FloorMap Builder',
    category: 'Manage',
    description: '平面図登録、ピン配置、方位補正を行うマップ連携支援ツール。',
    statusLabel: '開発中',
    availability: 'development',
    isExternal: false,
    isEnabled: false,
    priority: '中',
    capabilities: ['平面図登録', 'ピン配置', '方位補正'],
  },
  {
    id: 'review-exporter',
    name: 'Review Exporter',
    category: 'Documentation',
    description: 'レビュー結果をPDF、Excel、PowerPoint、HTMLへ出力するツール。',
    statusLabel: '開発中',
    availability: 'development',
    isExternal: false,
    isEnabled: false,
    priority: '高',
    capabilities: ['PDF出力', '会議資料', '設計記録'],
  },
  {
    id: 'thumbnail-generator',
    name: 'Panorama Thumbnail Generator',
    category: 'Documentation',
    description: 'パノラマ一覧をHTML、PDF、Excel、PowerPoint形式で目録化するツール。',
    statusLabel: '構想中',
    availability: 'concept',
    isExternal: false,
    isEnabled: false,
    priority: '中',
    capabilities: ['目録作成', 'サムネイル', '提出資料'],
  },
  {
    id: 'panorama-diff',
    name: 'Panorama Diff',
    category: 'Review',
    description: 'A案/B案の家具、照明、サイン、仕上などの差分を比較するツール。',
    statusLabel: '構想中',
    availability: 'concept',
    isExternal: false,
    isEnabled: false,
    priority: '中',
    capabilities: ['案比較', '変更確認', 'AI差分抽出候補'],
  },
  {
    id: 'vr-launcher',
    name: 'Panorama VR Launcher',
    category: 'VR',
    description: 'Meta Quest、Pico、Apple Vision Proでの確認導線を整えるVRビューア。',
    statusLabel: '将来予定',
    availability: 'future',
    isExternal: false,
    isEnabled: false,
    priority: '中',
    capabilities: ['VR起動', '端末別導線', 'クラウドVR候補'],
  },
  {
    id: 'ai-assistant',
    name: 'Panorama AI Assistant',
    category: 'Review',
    description: '家具、設備、サイン、仕上、空間用途を解析するレビュー支援AI。',
    statusLabel: '将来予定',
    availability: 'future',
    isExternal: false,
    isEnabled: false,
    priority: '将来',
    capabilities: ['画像解析', '自動コメント', 'VE提案候補'],
  },
  {
    id: 'share-hub',
    name: 'Panorama Share Hub',
    category: 'Share',
    description: '社内外への共有、更新履歴、配布リンクを一元管理する共有ハブ。',
    statusLabel: '将来予定',
    availability: 'future',
    isExternal: false,
    isEnabled: false,
    priority: '中',
    capabilities: ['共有リンク', '更新履歴', '配布管理'],
  },
  {
    id: 'sketchup-export',
    name: 'SketchUp Panorama Export',
    category: 'Export',
    description: 'SketchUpやレンダラーからの360度出力を案件ルールに合わせて整理する入口。',
    statusLabel: '構想中',
    availability: 'concept',
    isExternal: false,
    isEnabled: false,
    priority: '高',
    capabilities: ['出力命名', '案件フォルダ生成', 'ビュー管理'],
  },
];

export const enabledTools = tools.filter((tool) => tool.isEnabled);
