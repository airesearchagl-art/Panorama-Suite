import JSZip from 'jszip';
import { useMemo, useRef, useState, type DragEvent } from 'react';
import AppFrame from '../components/AppFrame';
import { useToast } from '../components/ToastProvider';

type OutputFormat = 'jpg' | 'png' | 'webp';
type ResizeMode = 'original' | 'width' | 'preset';
type ConvertStatus = '未変換' | '変換中' | '完了' | 'エラー';

type ConverterSettings = {
  outputFormat: OutputFormat;
  quality: number;
  resizeMode: ResizeMode;
  targetWidth: number;
  presetSize: '8192x4096' | '4096x2048' | '2048x1024';
  keepPanoramaRatio: boolean;
};

type SourceImage = {
  id: string;
  file: File;
  fileName: string;
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
  status: ConvertStatus;
  error: string;
  outputFileName: string;
  outputWidth: number | null;
  outputHeight: number | null;
  outputBlob: Blob | null;
};

const supportedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
const mimeByFormat: Record<OutputFormat, string> = {
  jpg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

function getBaseName(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(0, lastDot) : fileName;
}

function createId(file: File) {
  return `${file.name}-${file.lastModified}-${file.size}`;
}

function sanitizeBaseName(value: string) {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'panorama';
}

function makeUniqueName(fileName: string, usedNames: Set<string>) {
  const extension = getExtension(fileName);
  const baseName = getBaseName(fileName);
  let candidate = fileName;
  let index = 2;

  while (usedNames.has(candidate.toLowerCase())) {
    candidate = `${baseName}-${index}.${extension}`;
    index += 1;
  }

  usedNames.add(candidate.toLowerCase());
  return candidate;
}

function replaceExtension(fileName: string, outputFormat: OutputFormat) {
  const normalizedFormat = outputFormat === 'jpg' ? 'jpg' : outputFormat;
  return `${sanitizeBaseName(getBaseName(fileName))}.${normalizedFormat}`;
}

function loadImageMeta(file: File): Promise<Omit<SourceImage, 'status' | 'error' | 'outputFileName' | 'outputWidth' | 'outputHeight' | 'outputBlob'>> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({
        id: createId(file),
        file,
        fileName: file.name,
        fileType: getExtension(file.name),
        fileSize: file.size,
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

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('画像をCanvasに読み込めません。'));
    };

    image.src = url;
  });
}

function calculateOutputSize(image: SourceImage, settings: ConverterSettings) {
  if (settings.resizeMode === 'preset') {
    const [width, height] = settings.presetSize.split('x').map(Number);
    return { width, height };
  }

  if (settings.resizeMode === 'width') {
    const width = Math.max(1, Math.round(settings.targetWidth));
    const height = settings.keepPanoramaRatio
      ? Math.max(1, Math.round(width / 2))
      : Math.max(1, Math.round((image.height / image.width) * width));
    return { width, height };
  }

  return { width: image.width, height: image.height };
}

function canvasToBlob(canvas: HTMLCanvasElement, settings: ConverterSettings): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const quality = settings.outputFormat === 'png' ? undefined : settings.quality / 100;
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
          return;
        }
        reject(new Error('画像変換に失敗しました。'));
      },
      mimeByFormat[settings.outputFormat],
      quality,
    );
  });
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function PanoramaConverterPage() {
  const { notify } = useToast();
  const [settings, setSettings] = useState<ConverterSettings>({
    outputFormat: 'webp',
    quality: 85,
    resizeMode: 'original',
    targetWidth: 4096,
    presetSize: '4096x2048',
    keepPanoramaRatio: true,
  });
  const [images, setImages] = useState<SourceImage[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const usedSourceNamesRef = useRef(new Set<string>());

  const convertedImages = useMemo(() => images.filter((image) => image.outputBlob), [images]);
  const failedImages = useMemo(() => images.filter((image) => image.status === 'エラー'), [images]);
  const hasImages = images.length > 0;
  const hasConvertedImages = convertedImages.length > 0;

  const updateSetting = <Key extends keyof ConverterSettings>(key: Key, value: ConverterSettings[Key]) => {
    setSettings((current) => ({ ...current, [key]: value }));
  };

  const addFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) {
      return;
    }

    const invalidFiles = files.filter((file) => !supportedExtensions.has(getExtension(file.name)));
    const validFiles = files.filter((file) => supportedExtensions.has(getExtension(file.name)));
    const loaded = await Promise.allSettled(validFiles.map((file) => loadImageMeta(file)));
    const accepted = loaded
      .filter((result): result is PromiseFulfilledResult<Awaited<ReturnType<typeof loadImageMeta>>> => result.status === 'fulfilled')
      .map((result) => {
        const sourceName = makeUniqueName(result.value.fileName, usedSourceNamesRef.current);
        return {
          ...result.value,
          fileName: sourceName,
          status: '未変換' as ConvertStatus,
          error: '',
          outputFileName: '',
          outputWidth: null,
          outputHeight: null,
          outputBlob: null,
        };
      });
    const failedMessages = loaded
      .filter((result): result is PromiseRejectedResult => result.status === 'rejected')
      .map((result) => result.reason instanceof Error ? result.reason.message : '画像を読み込めません。');

    setImages((current) => [...current, ...accepted]);
    setMessages([
      ...invalidFiles.map((file) => `${file.name}: 非対応形式です。jpg、jpeg、png、webp を使用してください。`),
      ...failedMessages,
    ]);
    if (accepted.length > 0) {
      notify('画像を登録しました', 'success');
    }
    if (invalidFiles.length > 0) {
      notify('非対応形式のファイルを除外しました', 'warning');
    }
    if (failedMessages.length > 0) {
      notify('画像登録中にエラーが発生しました', 'error');
    }
  };

  const convertOne = async (image: SourceImage) => {
    const outputSize = calculateOutputSize(image, settings);
    const imageElement = await loadImageElement(image.file);
    const canvas = document.createElement('canvas');
    canvas.width = outputSize.width;
    canvas.height = outputSize.height;
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Canvasコンテキストを作成できません。');
    }

    context.drawImage(imageElement, 0, 0, outputSize.width, outputSize.height);
    const blob = await canvasToBlob(canvas, settings);
    return {
      outputBlob: blob,
      outputWidth: outputSize.width,
      outputHeight: outputSize.height,
    };
  };

  const convertAll = async () => {
    if (!hasImages) {
      setMessages(['変換対象の画像を追加してください。']);
      notify('変換対象の画像を追加してください', 'warning');
      return;
    }

    setMessages([]);
    setImages((current) => current.map((image) => ({ ...image, status: '変換中', error: '' })));
    const usedOutputNames = new Set<string>();
    let failedCount = 0;

    for (const image of images) {
      try {
        const converted = await convertOne(image);
        const outputFileName = makeUniqueName(replaceExtension(image.fileName, settings.outputFormat), usedOutputNames);
        setImages((current) =>
          current.map((currentImage) =>
            currentImage.id === image.id
              ? {
                  ...currentImage,
                  status: '完了',
                  error: '',
                  outputFileName,
                  outputWidth: converted.outputWidth,
                  outputHeight: converted.outputHeight,
                  outputBlob: converted.outputBlob,
                }
              : currentImage,
          ),
        );
      } catch (error) {
        failedCount += 1;
        setImages((current) =>
          current.map((currentImage) =>
            currentImage.id === image.id
              ? {
                  ...currentImage,
                  status: 'エラー',
                  error: error instanceof Error ? error.message : '変換に失敗しました。',
                  outputBlob: null,
                }
              : currentImage,
          ),
        );
      }
    }

    if (failedCount > 0) {
      notify('変換エラーが発生しました', 'error');
    } else {
      notify('変換が完了しました', 'success');
    }
  };

  const downloadZip = async () => {
    if (!hasConvertedImages) {
      return;
    }

    const zip = new JSZip();
    convertedImages.forEach((image) => {
      if (image.outputBlob) {
        zip.file(image.outputFileName, image.outputBlob);
      }
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(blob, 'panorama-converted.zip');
    notify('変換済みZIPを書き出しました', 'success');
  };

  const clearImages = () => {
    usedSourceNamesRef.current.clear();
    setImages([]);
    setMessages([]);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void addFiles(event.dataTransfer.files);
  };

  return (
    <AppFrame toolName="パノラマ画像変換" status="基本機能版">
      <section className="qaHero workspaceHero" aria-labelledby="converter-title">
        <div>
          <p className="eyebrow">パノラマ画像変換 基本機能版</p>
          <h1 id="converter-title">パノラマ画像の一括変換</h1>
          <p className="lead">
            jpg、jpeg、png、webp をブラウザ内のCanvasで変換します。画質調整、リサイズ、2:1比率維持、一括ZIP出力に対応します。
          </p>
        </div>
        <div className="qaActions">
          <button type="button" className="button buttonPrimary" onClick={() => void convertAll()} disabled={!hasImages}>
            🖼 画像変換
          </button>
          <button type="button" className="button buttonPrimary" onClick={() => void downloadZip()} disabled={!hasConvertedImages}>
            📦 ZIP出力
          </button>
          <button type="button" className="button buttonSecondary" onClick={clearImages} disabled={!hasImages}>
            🔄 クリア
          </button>
        </div>
      </section>

      <section className="sectionBlock helpHintPanel" aria-label="このページでできること">
        <div>
          <p className="sectionKicker">このページでできること</p>
          <h2>画像を提出・管理しやすい形式に整えます</h2>
        </div>
        <ol className="inlineStepList">
          <li>画像を読み込む</li>
          <li>出力形式・サイズを選ぶ</li>
          <li>変換して個別またはZIPで保存する</li>
        </ol>
      </section>

      <section className="dashboardGrid" aria-label="パノラマ画像変換 ダッシュボード">
        <article className="metricCard"><span>入力画像</span><strong>{images.length}</strong></article>
        <article className="metricCard successMetric"><span>変換済み</span><strong>{convertedImages.length}</strong></article>
        <article className="metricCard errorMetric"><span>失敗</span><strong>{failedImages.length}</strong></article>
        <article className="metricCard"><span>出力形式</span><strong>{settings.outputFormat}</strong></article>
      </section>

      <section className="converterLayout" aria-label="パノラマ画像変換 作業エリア">
        <aside className="converterSettings">
          <h2>変換設定</h2>
          <label>
            <span>出力形式</span>
            <select
              value={settings.outputFormat}
              onChange={(event) => updateSetting('outputFormat', event.target.value as OutputFormat)}
            >
              <option value="jpg">jpg</option>
              <option value="png">png</option>
              <option value="webp">webp</option>
            </select>
          </label>
          <label>
            <span>画質 {settings.outputFormat === 'png' ? '(pngでは無効)' : `${settings.quality}%`}</span>
            <input
              type="range"
              min="10"
              max="100"
              value={settings.quality}
              disabled={settings.outputFormat === 'png'}
              onChange={(event) => updateSetting('quality', Number(event.target.value))}
            />
          </label>
          <label>
            <span>リサイズ</span>
            <select
              value={settings.resizeMode}
              onChange={(event) => updateSetting('resizeMode', event.target.value as ResizeMode)}
            >
              <option value="original">元サイズ維持</option>
              <option value="width">横幅指定</option>
              <option value="preset">推奨サイズに変換</option>
            </select>
          </label>
          {settings.resizeMode === 'width' ? (
            <label>
              <span>横幅</span>
              <input
                type="number"
                min="1"
                step="1"
                value={settings.targetWidth}
                onChange={(event) => updateSetting('targetWidth', Number(event.target.value))}
              />
            </label>
          ) : null}
          {settings.resizeMode === 'preset' ? (
            <label>
              <span>推奨サイズ</span>
              <select
                value={settings.presetSize}
                onChange={(event) => updateSetting('presetSize', event.target.value as ConverterSettings['presetSize'])}
              >
                <option value="8192x4096">8192 x 4096</option>
                <option value="4096x2048">4096 x 2048</option>
                <option value="2048x1024">2048 x 1024</option>
              </select>
            </label>
          ) : null}
          <label className="checkRow">
            <input
              type="checkbox"
              checked={settings.keepPanoramaRatio}
              disabled={settings.resizeMode !== 'width'}
              onChange={(event) => updateSetting('keepPanoramaRatio', event.target.checked)}
            />
            <span>横幅指定時に2:1比率を維持</span>
          </label>
        </aside>

        <div className="converterMain">
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
                }
                event.currentTarget.value = '';
              }}
            />
            <span className="dropTitle">変換する画像をドラッグ＆ドロップ</span>
            <span className="dropText">またはクリックしてファイルを選択。複数ファイルをまとめて追加できます。</span>
            <span className="dropNote">対応入力形式: jpg / jpeg / png / webp</span>
          </label>

          {messages.length > 0 ? (
            <ul className="packagerMessages">
              {messages.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          ) : null}

          <div className="resultTableWrap">
            <table className="resultTable converterTable">
              <thead>
                <tr>
                  <th>元ファイル名</th>
                  <th>元形式</th>
                  <th>元解像度</th>
                  <th>変換後形式</th>
                  <th>変換後解像度</th>
                  <th>ステータス</th>
                  <th>エラー内容</th>
                  <th>DL</th>
                </tr>
              </thead>
              <tbody>
                {images.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="emptyCell">
                      <div className="emptyState">
                        <span>📂</span>
                        <strong>画像がありません</strong>
                        <p>変換する画像をドラッグ＆ドロップ、またはファイル選択してください。</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  images.map((image) => (
                    <tr key={image.id}>
                      <td className="fileNameCell">{image.fileName}</td>
                      <td>{image.fileType}</td>
                      <td>{image.width} x {image.height}</td>
                      <td>{settings.outputFormat}</td>
                      <td>{image.outputWidth && image.outputHeight ? `${image.outputWidth} x ${image.outputHeight}` : '-'}</td>
                      <td>
                        <span className={`convertStatus convertStatus${image.status}`}>{image.status}</span>
                      </td>
                      <td>{image.error || '-'}</td>
                      <td>
                        <button
                          type="button"
                          className="tableButton"
                          disabled={!image.outputBlob}
                          onClick={() => {
                            if (image.outputBlob) {
                              downloadBlob(image.outputBlob, image.outputFileName);
                              notify('変換済み画像をダウンロードしました', 'success');
                            }
                          }}
                        >
                          💾 保存
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </AppFrame>
  );
}

export default PanoramaConverterPage;
