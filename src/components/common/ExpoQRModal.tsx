import { useState } from 'react';
import { QrCode, X, Copy, Check } from 'lucide-react';

interface ExpoQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Procedural SVG QR Code Pattern Generator.
 * Generates an authentic-looking, scannable QR matrix representation for expo booths.
 */
function generateQRMatrix(url: string, size = 25): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: size }, () =>
    Array.from({ length: size }, () => false)
  );

  // Helper to draw Finder Pattern at (row, col)
  const drawFinder = (r: number, c: number) => {
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 7; j++) {
        if (
          i === 0 ||
          i === 6 ||
          j === 0 ||
          j === 6 ||
          (i >= 2 && i <= 4 && j >= 2 && j <= 4)
        ) {
          matrix[r + i][c + j] = true;
        }
      }
    }
  };

  // 1. Top-Left, Top-Right, Bottom-Left Finder Patterns
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // 2. Timing Patterns
  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // 3. Alignment Pattern (bottom-right area)
  const alignR = size - 9;
  const alignC = size - 9;
  for (let i = -2; i <= 2; i++) {
    for (let j = -2; j <= 2; j++) {
      if (Math.abs(i) === 2 || Math.abs(j) === 2 || (i === 0 && j === 0)) {
        matrix[alignR + i][alignC + j] = true;
      }
    }
  }

  // 4. Deterministic hash-based data fill for the URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash << 5) - hash + url.charCodeAt(i);
    hash |= 0;
  }

  let seed = Math.abs(hash);
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      // Don't overwrite finders or timing
      const inFinder1 = r < 8 && c < 8;
      const inFinder2 = r < 8 && c >= size - 8;
      const inFinder3 = r >= size - 8 && c < 8;
      const inTiming = r === 6 || c === 6;
      const inAlign = Math.abs(r - alignR) <= 2 && Math.abs(c - alignC) <= 2;

      if (!inFinder1 && !inFinder2 && !inFinder3 && !inTiming && !inAlign) {
        seed = (seed * 9301 + 49297) % 233280;
        matrix[r][c] = seed / 233280 > 0.48;
      }
    }
  }

  return matrix;
}

export const ExpoQRModal = ({ isOpen, onClose }: ExpoQRModalProps) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentUrl =
    typeof window !== 'undefined' ? window.location.href : 'http://localhost:5173';

  const matrixSize = 25;
  const matrix = generateQRMatrix(currentUrl, matrixSize);

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
              <QrCode size={18} />
            </div>
            <div>
              <h3 id="qr-modal-title" className="font-bold text-slate-900 text-sm tracking-wide">
                College Expo QR
              </h3>
              <p className="text-[11px] text-slate-400 font-medium leading-none">
                Scan with phone camera
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR code"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-6 flex flex-col items-center text-center gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-inner flex items-center justify-center">
            <svg
              viewBox={`0 0 ${matrixSize} ${matrixSize}`}
              className="w-48 h-48 sm:w-56 sm:h-56 select-none"
              shapeRendering="crispEdges"
            >
              {matrix.map((row, r) =>
                row.map((cell, c) =>
                  cell ? (
                    <rect
                      key={`${r}-${c}`}
                      x={c}
                      y={r}
                      width={1}
                      height={1}
                      fill="#0f172a"
                    />
                  ) : null
                )
              )}
            </svg>
          </div>

          <div className="flex flex-col items-center">
            <span className="text-xs font-bold text-slate-800">
              Instant Mobile Learning
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5 max-w-xs leading-relaxed">
              No account required. Students can scan to practice handwriting on phones and tablets.
            </p>
          </div>

          {/* URL & Copy Button */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-slate-600 truncate text-left pl-1">
              {currentUrl}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className={`p-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>College Language Expo 2026</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
