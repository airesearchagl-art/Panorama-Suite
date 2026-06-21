import { useMemo, useState, type DragEvent } from 'react';
import AppFrame from '../components/AppFrame';
import { useToast } from '../components/ToastProvider';

type ThumbnailItem = {
  id: string;
  fileName: string;
  fileType: string;
  width: number;
  height: number;
  dataUrl: string;
  fileSize: number;
};

const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

function getExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeCsv(value: string | number) {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
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

function readImage(file: File): Promise<ThumbnailItem> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const image = new Image();
      image.onload = () => {
        resolve({
          id: `${file.name}-${file.size}-${file.lastModified}`,
          fileName: file.name,
          fileType: getExtension(file.name),
          width: image.naturalWidth,
          height: image.naturalHeight,
          dataUrl,
          fileSize: file.size,
        });
      };
      image.onerror = () => reject(new Error('画像を読み込めませんでした'));
      image.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('ファイルを読み込めませんでした'));
    reader.readAsDataURL(file);
  });
}

function ThumbnailGeneratorPage() {
  const { notify } = useToast();
  const [items, setItems] = useState<ThumbnailItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const exportReady = items.length > 0;

  const dashboard = useMemo(() => ({
    images: items.length,
    formats: supportedExtensions.join(' / '),
    exports: exportReady ? 'HTML / CSV' : '未作成',
  }), [exportReady, items.length]);

  const addFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const supported = fileArray.filter((file) => supportedExtensions.includes(getExtension(file.name)));
    const unsupported = fileArray.length - supported.length;

    if (unsupported > 0) {
      notify('非対応形式のファイルを除外しました', 'warning');
    }
    if (supported.length === 0) {
      notify('読み込める画像がありませんでした', 'error');
      return;
    }

    try {
      const loaded = await Promise.all(supported.map(readImage));
      setItems((current) => [...current, ...loaded]);
      notify('画像を読み込みました', 'success');
    } catch {
      notify('ファイルを読み込めませんでした', 'error');
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void addFiles(event.dataTransfer.files);
  };

  const exportHtml = () => {
    if (!exportReady) {
      notify('書き出す画像がありません', 'warning');
      return;
    }

    const cards = items.map((item, index) => `
      <article class="thumb">
        <img src="${item.dataUrl}" alt="${escapeHtml(item.fileName)}">
        <h2>${index + 1}. ${escapeHtml(item.fileName)}</h2>
        <p>${item.width} × ${item.height}px / ${escapeHtml(item.fileType.toUpperCase())} / ${formatBytes(item.fileSize)}</p>
      </article>
    `).join('');
    const html = `<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>thumbnail-index</title>
  <style>
    body{font-family:Inter,"Segoe UI","Noto Sans JP",sans-serif;margin:32px;color:#111827}
    header{border-bottom:1px solid #d1d5db;margin-bottom:24px;padding-bottom:16px}
    .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:16px}
    .thumb{border:1px solid #d1d5db;border-radius:8px;padding:12px;break-inside:avoid}
    img{width:100%;aspect-ratio:2/1;object-fit:cover;border-radius:6px;background:#e5e7eb}
    h1{font-size:24px} h2{font-size:14px;margin:10px 0 4px} p{font-size:12px;color:#4b5563}
    @media print{body{margin:16mm}.thumb{page-break-inside:avoid}}
  </style>
</head>
<body>
  <header>
    <h1>サムネイル一覧</h1>
    <p>作成日時: ${new Date().toLocaleString('ja-JP')} / 画像数: ${items.length}</p>
  </header>
  <main class="grid">${cards}</main>
</body>
</html>`;
    downloadText('thumbnail-index.html', html, 'text/html;charset=utf-8');
    notify('サムネイル一覧を書き出しました', 'success');
  };

  const exportCsv = () => {
    if (!exportReady) {
      notify('書き出す画像がありません', 'warning');
      return;
    }
    const rows = [
      ['fileName', 'fileType', 'width', 'height', 'fileSize'],
      ...items.map((item) => [item.fileName, item.fileType, item.width, item.height, item.fileSize]),
    ];
    downloadText('thumbnail-list.csv', rows.map((row) => row.map(escapeCsv).join(',')).join('\n'), 'text/csv;charset=utf-8');
    notify('サムネイル一覧CSVを書き出しました', 'success');
  };

  return (
    <AppFrame toolName="サムネイル一覧作成" status="基本機能版">
      <section className="heroSection qaHero" aria-labelledby="thumbnail-title">
        <div>
          <p className="eyebrow">Thumbnail Index</p>
          <h1 id="thumbnail-title">サムネイル一覧作成</h1>
          <p className="lead">複数のパノラマ画像から、提出・管理・レビュー用のサムネイル一覧を作成します。</p>
        </div>
        <div className="qaActions">
          <button type="button" className="button buttonPrimary" onClick={exportHtml} disabled={!exportReady}>HTML書き出し</button>
          <button type="button" className="button buttonSecondary" onClick={exportCsv} disabled={!exportReady}>CSV書き出し</button>
        </div>
      </section>

      <section className="dashboardGrid" aria-label="サムネイル一覧作成 Dashboard">
        <article className="metricCard"><span>画像数</span><strong>{dashboard.images}</strong></article>
        <article className="metricCard"><span>対応形式</span><strong>{dashboard.formats}</strong></article>
        <article className="metricCard"><span>書き出し</span><strong>{dashboard.exports}</strong></article>
      </section>

      <section className="sectionBlock">
        <label
          className={`dropZone ${isDragging ? 'dropZoneActive' : ''}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
            multiple
            onChange={(event) => {
              if (event.target.files) {
                void addFiles(event.target.files);
                event.target.value = '';
              }
            }}
          />
          <span>📂</span>
          <strong>画像をドラッグ＆ドロップ</strong>
          <p>またはクリックして jpg / jpeg / png / webp を選択してください。</p>
        </label>
      </section>

      <section className="sectionBlock" aria-labelledby="thumbnail-list-title">
        <div className="sectionHeading">
          <div>
            <p className="sectionKicker">Thumbnail List</p>
            <h2 id="thumbnail-list-title">一覧レイアウト</h2>
          </div>
          <span className="sectionMeta">{items.length} 件</span>
        </div>
        {items.length === 0 ? (
          <div className="emptyState">
            <span>📂</span>
            <strong>画像がありません</strong>
            <p>ドラッグ＆ドロップ、またはファイル選択してください。</p>
          </div>
        ) : (
          <div className="thumbnailGrid">
            {items.map((item) => (
              <article className="thumbnailCard" key={item.id}>
                <img src={item.dataUrl} alt={item.fileName} />
                <strong>{item.fileName}</strong>
                <span>{item.width} × {item.height}px</span>
                <span>{item.fileType.toUpperCase()} / {formatBytes(item.fileSize)}</span>
              </article>
            ))}
          </div>
        )}
      </section>
    </AppFrame>
  );
}

export default ThumbnailGeneratorPage;
