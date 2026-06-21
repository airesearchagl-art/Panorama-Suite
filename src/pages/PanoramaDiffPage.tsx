import { useEffect, useMemo, useRef, useState } from 'react';
import AppFrame from '../components/AppFrame';
import { useToast } from '../components/ToastProvider';

type DiffImage = {
  fileName: string;
  fileType: string;
  width: number;
  height: number;
  dataUrl: string;
};

const supportedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

function getExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? '';
}

function loadImage(file: File): Promise<DiffImage> {
  return new Promise((resolve, reject) => {
    if (!supportedExtensions.includes(getExtension(file.name))) {
      reject(new Error('非対応形式です'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      const image = new Image();
      image.onload = () => resolve({
        fileName: file.name,
        fileType: getExtension(file.name),
        width: image.naturalWidth,
        height: image.naturalHeight,
        dataUrl,
      });
      image.onerror = () => reject(new Error('画像を読み込めませんでした'));
      image.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('ファイルを読み込めませんでした'));
    reader.readAsDataURL(file);
  });
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

function downloadDataUrl(fileName: string, dataUrl: string) {
  const anchor = document.createElement('a');
  anchor.href = dataUrl;
  anchor.download = fileName;
  anchor.click();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function PanoramaDiffPage() {
  const { notify } = useToast();
  const [imageA, setImageA] = useState<DiffImage | null>(null);
  const [imageB, setImageB] = useState<DiffImage | null>(null);
  const [slider, setSlider] = useState(50);
  const [diffDataUrl, setDiffDataUrl] = useState('');
  const [diffScore, setDiffScore] = useState<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const bothLoaded = Boolean(imageA && imageB);
  const sizeWarning = Boolean(imageA && imageB && (imageA.width !== imageB.width || imageA.height !== imageB.height));
  const dashboard = useMemo(() => ({
    imageA: imageA ? '読み込み済み' : '未読込',
    imageB: imageB ? '読み込み済み' : '未読込',
    diff: diffScore === null ? '未作成' : `${diffScore.toFixed(1)}%`,
    warning: sizeWarning ? 'サイズ差あり' : 'なし',
  }), [diffScore, imageA, imageB, sizeWarning]);

  const handleFile = async (file: File, target: 'A' | 'B') => {
    try {
      const loaded = await loadImage(file);
      if (target === 'A') {
        setImageA(loaded);
      } else {
        setImageB(loaded);
      }
      notify('比較画像を読み込みました', 'success');
    } catch {
      notify('ファイルを読み込めませんでした', 'error');
    }
  };

  useEffect(() => {
    if (!imageA || !imageB || !canvasRef.current) {
      setDiffDataUrl('');
      setDiffScore(null);
      return;
    }

    let cancelled = false;
    const renderDiff = async () => {
      const [a, b] = await Promise.all([createImageBitmap(await (await fetch(imageA.dataUrl)).blob()), createImageBitmap(await (await fetch(imageB.dataUrl)).blob())]);
      if (cancelled || !canvasRef.current) return;
      const width = Math.min(900, Math.max(320, imageA.width));
      const height = Math.max(160, Math.round(width * (imageA.height / imageA.width)));
      const canvas = canvasRef.current;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) return;

      const bufferA = document.createElement('canvas');
      const bufferB = document.createElement('canvas');
      bufferA.width = width;
      bufferA.height = height;
      bufferB.width = width;
      bufferB.height = height;
      bufferA.getContext('2d')?.drawImage(a, 0, 0, width, height);
      bufferB.getContext('2d')?.drawImage(b, 0, 0, width, height);

      const ctxA = bufferA.getContext('2d');
      const ctxB = bufferB.getContext('2d');
      if (!ctxA || !ctxB) return;
      const dataA = ctxA.getImageData(0, 0, width, height);
      const dataB = ctxB.getImageData(0, 0, width, height);
      const output = context.createImageData(width, height);
      let changed = 0;
      for (let index = 0; index < dataA.data.length; index += 4) {
        const diffR = Math.abs(dataA.data[index] - dataB.data[index]);
        const diffG = Math.abs(dataA.data[index + 1] - dataB.data[index + 1]);
        const diffB = Math.abs(dataA.data[index + 2] - dataB.data[index + 2]);
        const diff = (diffR + diffG + diffB) / 3;
        if (diff > 24) changed += 1;
        output.data[index] = Math.min(255, diff * 2.2);
        output.data[index + 1] = 40;
        output.data[index + 2] = 40;
        output.data[index + 3] = diff > 12 ? 255 : 70;
      }
      context.putImageData(output, 0, 0);
      setDiffScore((changed / (width * height)) * 100);
      setDiffDataUrl(canvas.toDataURL('image/png'));
      if (sizeWarning) {
        notify('画像サイズが異なるため、表示上のサイズを合わせて比較しています', 'warning');
      }
    };

    void renderDiff();
    return () => {
      cancelled = true;
    };
  }, [imageA, imageB, notify, sizeWarning]);

  const exportHtml = () => {
    if (!imageA || !imageB) {
      notify('比較する2枚の画像を読み込んでください', 'warning');
      return;
    }
    const html = `<!doctype html>
<html lang="ja">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>panorama-diff-report</title>
<style>body{font-family:Inter,"Segoe UI","Noto Sans JP",sans-serif;margin:32px;color:#111827}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}img{max-width:100%;border:1px solid #d1d5db;border-radius:8px}section{margin-bottom:24px}p{color:#4b5563}@media(max-width:760px){.grid{grid-template-columns:1fr}}</style></head>
<body>
  <h1>画像比較レポート</h1>
  <p>作成日時: ${new Date().toLocaleString('ja-JP')}</p>
  <section class="grid">
    <article><h2>A: ${escapeHtml(imageA.fileName)}</h2><p>${imageA.width} × ${imageA.height}px</p><img src="${imageA.dataUrl}" alt="A"></article>
    <article><h2>B: ${escapeHtml(imageB.fileName)}</h2><p>${imageB.width} × ${imageB.height}px</p><img src="${imageB.dataUrl}" alt="B"></article>
  </section>
  <section><h2>簡易差分</h2><p>差分目安: ${diffScore === null ? '未作成' : `${diffScore.toFixed(1)}%`}</p>${diffDataUrl ? `<img src="${diffDataUrl}" alt="diff">` : ''}</section>
</body></html>`;
    downloadText('panorama-diff-report.html', html, 'text/html;charset=utf-8');
    notify('比較結果を書き出しました', 'success');
  };

  const exportDiffImage = () => {
    if (!diffDataUrl) {
      notify('差分画像がまだありません', 'warning');
      return;
    }
    downloadDataUrl('panorama-diff.png', diffDataUrl);
    notify('差分画像を書き出しました', 'success');
  };

  return (
    <AppFrame toolName="画像比較" status="基本機能版">
      <section className="heroSection qaHero" aria-labelledby="diff-title">
        <div>
          <p className="eyebrow">Panorama Diff</p>
          <h1 id="diff-title">画像比較</h1>
          <p className="lead">A案・B案などのパノラマ画像を並べて確認し、簡易差分をブラウザ内で作成します。</p>
        </div>
        <div className="qaActions">
          <button type="button" className="button buttonPrimary" onClick={exportHtml} disabled={!bothLoaded}>HTML書き出し</button>
          <button type="button" className="button buttonSecondary" onClick={exportDiffImage} disabled={!diffDataUrl}>差分PNG書き出し</button>
        </div>
      </section>

      <section className="dashboardGrid" aria-label="画像比較 Dashboard">
        <article className="metricCard"><span>A画像</span><strong>{dashboard.imageA}</strong></article>
        <article className="metricCard"><span>B画像</span><strong>{dashboard.imageB}</strong></article>
        <article className="metricCard"><span>差分</span><strong>{dashboard.diff}</strong></article>
        <article className={`metricCard ${sizeWarning ? 'warningMetric' : ''}`}><span>注意</span><strong>{dashboard.warning}</strong></article>
      </section>

      <section className="sectionBlock diffUploadGrid">
        {(['A', 'B'] as const).map((target) => {
          const image = target === 'A' ? imageA : imageB;
          return (
            <label className="dropZone compactDropZone" key={target}>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void handleFile(file, target);
                  event.target.value = '';
                }}
              />
              <span>{target}</span>
              <strong>{target}画像を読み込む</strong>
              <p>{image ? `${image.fileName} / ${image.width} × ${image.height}px` : 'jpg / jpeg / png / webp'}</p>
            </label>
          );
        })}
      </section>

      {!bothLoaded ? (
        <section className="sectionBlock">
          <div className="emptyState">
            <span>🖼</span>
            <strong>比較する2枚の画像を読み込んでください</strong>
            <p>A画像とB画像を読み込むと、左右比較、スライダー比較、簡易差分を表示します。</p>
          </div>
        </section>
      ) : (
        <>
          <section className="sectionBlock" aria-labelledby="visual-compare-title">
            <div className="sectionHeading">
              <div>
                <p className="sectionKicker">Visual Compare</p>
                <h2 id="visual-compare-title">左右並列表示</h2>
              </div>
              {sizeWarning ? <span className="statusBadge statusDevelopment">サイズ差あり</span> : null}
            </div>
            <div className="diffCompareGrid">
              <article className="diffImagePanel">
                <h3>A: {imageA?.fileName}</h3>
                <img src={imageA?.dataUrl} alt="A画像" />
              </article>
              <article className="diffImagePanel">
                <h3>B: {imageB?.fileName}</h3>
                <img src={imageB?.dataUrl} alt="B画像" />
              </article>
            </div>
          </section>

          <section className="sectionBlock" aria-labelledby="slider-title">
            <div className="sectionHeading">
              <div>
                <p className="sectionKicker">Slider Compare</p>
                <h2 id="slider-title">スライダー比較</h2>
              </div>
              <span className="sectionMeta">B画像表示 {slider}%</span>
            </div>
            <div className="diffSliderBox">
              <img src={imageA?.dataUrl} alt="A画像" />
              <div className="diffSliderOverlay" style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
                <img src={imageB?.dataUrl} alt="B画像" />
              </div>
            </div>
            <input
              className="rangeInput"
              type="range"
              min="0"
              max="100"
              value={slider}
              onChange={(event) => setSlider(Number(event.target.value))}
              aria-label="比較スライダー"
            />
          </section>

          <section className="sectionBlock" aria-labelledby="diff-preview-title">
            <div className="sectionHeading">
              <div>
                <p className="sectionKicker">Simple Difference</p>
                <h2 id="diff-preview-title">簡易差分表示</h2>
              </div>
              <span className="sectionMeta">{diffScore === null ? '計算中' : `差分目安 ${diffScore.toFixed(1)}%`}</span>
            </div>
            <canvas ref={canvasRef} className="diffCanvas" aria-label="簡易差分画像" />
          </section>
        </>
      )}
    </AppFrame>
  );
}

export default PanoramaDiffPage;
