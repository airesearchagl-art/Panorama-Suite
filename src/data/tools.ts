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
  displayName: string;
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

export const categoryLabels: Record<ToolCategory, string> = {
  Export: '書き出し',
  Convert: '変換',
  QA: '品質チェック',
  Manage: '管理',
  Review: 'レビュー',
  Share: '共有',
  VR: 'VR確認',
  Documentation: 'ドキュメント',
};

export function getCategoryLabel(category: ToolCategory) {
  return categoryLabels[category];
}

export const availabilityLabels: Record<ToolAvailability, string> = {
  available: '利用可能',
  mvp: '基本機能版',
  external: '外部ツール',
  development: '開発中',
  concept: '構想中',
  future: '将来予定',
};

export const tools: Tool[] = [
  {
    id: 'archview360',
    name: 'Archview360',
    displayName: 'Archview360',
    category: 'Review',
    description: '建築パノラマの閲覧・レビュー向け公開ツール。',
    statusLabel: '外部ツール',
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
    displayName: 'パノラマ反転補正',
    category: 'Convert',
    description: 'パノラマ画像の反転補正を行う公開ツール。',
    statusLabel: '外部ツール',
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
    displayName: 'パノラマ品質チェック',
    category: 'QA',
    description: '画像のサイズ、2:1比率、対応形式、ファイル名を確認します。',
    statusLabel: '基本機能版',
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
    displayName: '案件パッケージ作成',
    category: 'Manage',
    description: '画像、平面図、管理情報を案件単位でまとめてZIP化します。',
    statusLabel: '基本機能版',
    availability: 'mvp',
    href: '/packager',
    isExternal: false,
    isEnabled: true,
    priority: '最優先',
    capabilities: ['案件データ作成', 'シーン管理情報', 'ZIP書き出し'],
  },
  {
    id: 'panorama-converter',
    name: 'Panorama Converter',
    displayName: 'パノラマ画像変換',
    category: 'Convert',
    description: '画像形式、画質、サイズを変換し、まとめて書き出します。',
    statusLabel: '基本機能版',
    availability: 'mvp',
    href: '/converter',
    isExternal: false,
    isEnabled: true,
    priority: '最優先',
    capabilities: ['画像形式変換', 'サイズ変更', '一括ZIP書き出し'],
  },
  {
    id: 'documentation',
    name: 'Documentation',
    displayName: '使い方ガイド',
    category: 'Documentation',
    description: 'Panorama Suite の概要、利用フロー、セキュリティ方針を確認するマニュアル。',
    statusLabel: '利用可能',
    availability: 'available',
    href: '/docs',
    isExternal: false,
    isEnabled: true,
    priority: '高',
    capabilities: ['使い方', 'ツール案内', '今後の予定'],
  },
  {
    id: 'help',
    name: 'Help',
    displayName: 'ヘルプ',
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
    displayName: '画面設計ルール',
    category: 'Documentation',
    description: 'Design System v1.0 のルールとUI方針を確認するページ。',
    statusLabel: '利用可能',
    availability: 'available',
    href: '/docs/design-system',
    isExternal: false,
    isEnabled: true,
    priority: '中',
    capabilities: ['UIルール', 'ダッシュボード', 'ローカル処理'],
  },
  {
    id: 'floor-map-builder',
    name: 'FloorMap Builder',
    displayName: '平面図ピン配置',
    category: 'Manage',
    description: '平面図にパノラマ撮影位置のピンを配置します。',
    statusLabel: '基本機能版',
    availability: 'mvp',
    href: '/floormap',
    isExternal: false,
    isEnabled: true,
    priority: '中',
    capabilities: ['平面図登録', 'ピン配置', '平面図ピン情報'],
  },
  {
    id: 'review-exporter',
    name: 'Review Exporter',
    displayName: 'レビュー書き出し',
    category: 'Review',
    description: '案件データを読み込み、印刷・PDF保存しやすいHTMLレビュー用レポートを作成します。',
    statusLabel: '基本機能版',
    availability: 'mvp',
    href: '/review-exporter',
    isExternal: false,
    isEnabled: true,
    priority: '高',
    capabilities: ['HTMLレポート', '印刷/PDF保存', '注意事項整理'],
  },
  {
    id: 'thumbnail-generator',
    name: 'Panorama Thumbnail Generator',
    displayName: 'サムネイル一覧作成',
    category: 'Documentation',
    description: '複数のパノラマ画像から、提出・管理・レビュー用のサムネイル一覧を作成します。',
    statusLabel: '基本機能版',
    availability: 'mvp',
    href: '/thumbnail-generator',
    isExternal: false,
    isEnabled: true,
    priority: '中',
    capabilities: ['サムネイル生成', 'HTML書き出し', 'CSV書き出し'],
  },
  {
    id: 'panorama-diff',
    name: 'Panorama Diff',
    displayName: '画像比較',
    category: 'Review',
    description: 'A案・B案などのパノラマ画像を並べて確認し、簡易差分を表示します。',
    statusLabel: '基本機能版',
    availability: 'mvp',
    href: '/panorama-diff',
    isExternal: false,
    isEnabled: true,
    priority: '中',
    capabilities: ['左右比較', 'スライダー比較', '簡易差分表示'],
  },
  {
    id: 'vr-launcher',
    name: 'Panorama VR Launcher',
    displayName: 'VR確認起動',
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
    displayName: 'パノラマAI確認支援',
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
    displayName: '共有パッケージ作成',
    category: 'Share',
    description: '案件データファイルや出力ファイルを、共有用の目録として整理します。',
    statusLabel: '基本機能版',
    availability: 'mvp',
    href: '/share-hub',
    isExternal: false,
    isEnabled: true,
    priority: '中',
    capabilities: ['案件概要表示', '共有メモ', '共有用データ書き出し'],
  },
  {
    id: 'sketchup-export',
    name: 'SketchUp Panorama Export',
    displayName: 'SketchUpパノラマ出力整理',
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
