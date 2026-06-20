import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react';
import { Link } from 'react-router-dom';

type QaStatus = 'OK' | 'Warning' | 'Error';

type QaResult = {
  id: string;
  fileName: string;
  fileType: string;
  width: number | null;
  height: number | null;
  ratio: string;
  status: QaStatus;
  messages: string[];
  thumbnailUrl: string | null;
};

const supportedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp']);
const recommendedResolutions = new Set(['8192x4096', '4096x2048', '2048x1024']);
const sceneNamePattern = /^scene\d{2}\.(jpg|jpeg|png|webp)$/i;

function getExtension(fileName: string) {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot >= 0 ? fileName.slice(lastDot + 1).toLowerCase() : '';
}

function isSupportedFile(file: File) {
  return supportedExtensions.has(getExtension(file.name));
}

function loadImageSize(file: File): Promise<{ width: number; height: number; thumbnailUrl: string }> {
  return new Promise((resolve, reject) => {
    const thumbnailUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight,
        thumbnailUrl,
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(thumbnailUrl);
      reject(new Error('画像として読み込めません。'));
    };

    image.src = thumbnailUrl;
  });
}

function evaluateImage(file: File, width: number, height: number, thumbnailUrl: string): QaResult {
  const extension = getExtension(file.name);
  const ratioValue = height > 0 ? width / height : 0;
  const ratio = height > 0 ? `${ratioValue.toFixed(3)}:1` : '-';
  const isTwoToOne = width === height * 2;
  const isRecommendedResolution = recommendedResolutions.has(`${width}x${height}`);
  const hasValidName = sceneNamePattern.test(file.name);
  const messages: string[] = [];

  if (!isTwoToOne) {
    messages.push('2:1比率ではありません。360°パノラマとして破綻する可能性があります。');
  }

  if (isTwoToOne && !isRecommendedResolution) {
    messages.push('推奨解像度ではありません。8192x4096、4096x2048、2048x1024を推奨します。');
  }

  if (!hasValidName) {
    messages.push('ファイル名が推奨形式ではありません。scene01.jpg の形式を推奨します。');
  }

  return {
    id: `${file.name}-${file.lastModified}-${file.size}`,
    fileName: file.name,
    fileType: extension,
    width,
    height,
    ratio,
    status: !isTwoToOne ? 'Error' : messages.length > 0 ? 'Warning' : 'OK',
    messages: messages.length > 0 ? messages : ['初期チェック項目はすべてOKです。'],
    thumbnailUrl,
  };
}

function createErrorResult(file: File, message: string): QaResult {
  const extension = getExtension(file.name) || 'unknown';

  return {
    id: `${file.name}-${file.lastModified}-${file.size}`,
    fileName: file.name,
    fileType: extension,
    width: null,
    height: null,
    ratio: '-',
    status: 'Error',
    messages: [message],
    thumbnailUrl: null,
  };
}

async function analyzeFile(file: File): Promise<QaResult> {
  if (!isSupportedFile(file)) {
    return createErrorResult(file, '非対応形式です。jpg、jpeg、png、webp を使用してください。');
  }

  try {
    const { width, height, thumbnailUrl } = await loadImageSize(file);
    return evaluateImage(file, width, height, thumbnailUrl);
  } catch {
    return createErrorResult(file, '画像として読み込めません。ファイル破損または非対応画像の可能性があります。');
  }
}

function downloadTextFile(fileName: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

function escapeCsvValue(value: string | number | null) {
  const text = value === null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

function PanoramaQaPage() {
  const [results, setResults] = useState<QaResult[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const resultUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => {
      resultUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const summary = useMemo(() => {
    return results.reduce(
      (current, result) => ({
        total: current.total + 1,
        OK: current.OK + (result.status === 'OK' ? 1 : 0),
        Warning: current.Warning + (result.status === 'Warning' ? 1 : 0),
        Error: current.Error + (result.status === 'Error' ? 1 : 0),
      }),
      { total: 0, OK: 0, Warning: 0, Error: 0 },
    );
  }, [results]);

  const addFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) {
      return;
    }

    setIsAnalyzing(true);
    const analyzedResults = await Promise.all(files.map((file) => analyzeFile(file)));
    resultUrlsRef.current.push(
      ...analyzedResults
        .map((result) => result.thumbnailUrl)
        .filter((thumbnailUrl): thumbnailUrl is string => thumbnailUrl !== null),
    );
    setResults((current) => [...current, ...analyzedResults]);
    setIsAnalyzing(false);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void addFiles(event.dataTransfer.files);
  };

  const clearResults = () => {
    resultUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    resultUrlsRef.current = [];
    setResults([]);
  };

  const exportRows = results.map(({ thumbnailUrl: _thumbnailUrl, id: _id, ...result }) => result);

  const exportJson = () => {
    downloadTextFile(
      'panorama-qa-results.json',
      JSON.stringify(exportRows, null, 2),
      'application/json;charset=utf-8',
    );
  };

  const exportCsv = () => {
    const header = ['fileName', 'fileType', 'width', 'height', 'ratio', 'status', 'messages'];
    const rows = exportRows.map((result) =>
      [
        result.fileName,
        result.fileType,
        result.width,
        result.height,
        result.ratio,
        result.status,
        result.messages.join(' / '),
      ]
        .map(escapeCsvValue)
        .join(','),
    );
    downloadTextFile('panorama-qa-results.csv', [header.join(','), ...rows].join('\n'), 'text/csv;charset=utf-8');
  };

  return (
    <main className="appShell qaShell">
      <nav className="subNav" aria-label="ページ移動">
        <Link to="/">Portal</Link>
        <span>/</span>
        <span>Panorama QA</span>
      </nav>

      <section className="qaHero" aria-labelledby="qa-title">
        <div>
          <p className="eyebrow">Panorama QA v0.1</p>
          <h1 id="qa-title">360°パノラマ初期品質チェック</h1>
          <p className="lead">
            jpg、jpeg、png、webp のパノラマ画像をブラウザ内で検査します。外部APIへ画像は送信しません。
          </p>
        </div>
        <div className="qaActions">
          <button type="button" onClick={exportJson} disabled={results.length === 0}>
            JSON出力
          </button>
          <button type="button" onClick={exportCsv} disabled={results.length === 0}>
            CSV出力
          </button>
          <button type="button" className="secondaryButton" onClick={clearResults} disabled={results.length === 0}>
            クリア
          </button>
        </div>
      </section>

      <section className="qaLayout" aria-label="Panorama QA 作業エリア">
        <aside className="qaSummary" aria-label="集計">
          <div>
            <span>読み込み画像数</span>
            <strong>{summary.total}</strong>
          </div>
          <div>
            <span>OK</span>
            <strong>{summary.OK}</strong>
          </div>
          <div>
            <span>Warning</span>
            <strong>{summary.Warning}</strong>
          </div>
          <div>
            <span>Error</span>
            <strong>{summary.Error}</strong>
          </div>
        </aside>

        <div className="qaMain">
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
            <span className="dropTitle">画像をドラッグ＆ドロップ</span>
            <span className="dropText">またはクリックしてファイルを選択。複数ファイルをまとめて追加できます。</span>
            <span className="dropNote">対応形式: jpg / jpeg / png / webp</span>
          </label>

          {isAnalyzing ? <p className="analyzingText">画像を解析中です。</p> : null}

          <div className="resultTableWrap">
            <table className="resultTable">
              <thead>
                <tr>
                  <th>サムネイル</th>
                  <th>ファイル名</th>
                  <th>形式</th>
                  <th>解像度</th>
                  <th>比率</th>
                  <th>判定</th>
                  <th>指摘内容</th>
                </tr>
              </thead>
              <tbody>
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="emptyCell">
                      まだ画像が読み込まれていません。
                    </td>
                  </tr>
                ) : (
                  results.map((result) => (
                    <tr key={result.id}>
                      <td>
                        {result.thumbnailUrl ? (
                          <img src={result.thumbnailUrl} alt="" className="thumbnail" />
                        ) : (
                          <span className="noPreview">なし</span>
                        )}
                      </td>
                      <td className="fileNameCell">{result.fileName}</td>
                      <td>{result.fileType}</td>
                      <td>
                        {result.width && result.height ? `${result.width} x ${result.height}` : '-'}
                      </td>
                      <td>{result.ratio}</td>
                      <td>
                        <span className={`qaStatus qaStatus${result.status}`}>{result.status}</span>
                      </td>
                      <td>
                        <ul className="messageList">
                          {result.messages.map((message) => (
                            <li key={message}>{message}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PanoramaQaPage;
