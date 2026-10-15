import { useRef, useEffect, useState, useCallback } from 'react';
import { RotateCcw, Trash2, CheckCircle2, AlertCircle, Code, X } from 'lucide-react';
import type {
  PracticeMode,
  LevelId,
  RecordedStroke,
  StrokePoint,
  HandwritingSessionData,
} from '../../types/learning';

interface PracticeCanvasProps {
  targetCharacter: string;
  romaji: string;
  currentMode: PracticeMode;
  onModeChange?: (mode: PracticeMode) => void;
  allowedModes: PracticeMode[];
  level: LevelId;
  onStrokeCapture?: (sessionData: HandwritingSessionData) => void;
  onCheck?: (strokes: RecordedStroke[], width: number, height: number) => void;
  clearTrigger?: number;
  submitLabel?: string;
}

export const PracticeCanvas = ({
  targetCharacter,
  romaji,
  currentMode,
  onModeChange,
  allowedModes,
  level,
  onStrokeCapture,
  onCheck,
  clearTrigger,
  submitLabel = 'Check',
}: PracticeCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [strokes, setStrokes] = useState<RecordedStroke[]>([]);
  const [currentPoints, setCurrentPoints] = useState<StrokePoint[]>([]);
  const [canvasSize, setCanvasSize] = useState<number>(380);
  const [checkFeedback, setCheckFeedback] = useState<{
    type: 'success' | 'warning';
    message: string;
    details?: string;
  } | null>(null);
  const [showStrokeInspector, setShowStrokeInspector] = useState(false);
  /** Cursor position for the brush indicator overlay */
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number } | null>(null);
  const [isCursorOnCanvas, setIsCursorOnCanvas] = useState(false);


  // Resize canvas responsively based on container width and viewport height
  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      // In landscape on mobile where height is constrained (<520px), adapt height limit
      const maxAllowedHeight = window.innerHeight < 520 ? Math.max(window.innerHeight - 200, 200) : 440;
      // Responsive sizing: adapts seamlessly to mobile, tablet, and desktop
      const size = Math.min(Math.max(containerWidth - 32, 220), maxAllowedHeight, 440);
      setCanvasSize(size);
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [updateDimensions]);

  // Redraw canvas with high-DPI scaling, Genkouyoushi grid, faint guide (if trace mode), and smooth strokes
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvasSize * dpr;
    canvas.height = canvasSize * dpr;

    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // 1. Draw Japanese Genkouyoushi (原稿用紙) Guidelines
    ctx.save();
    ctx.strokeStyle = '#e2e8f0'; // light slate grid
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Center vertical guideline
    ctx.beginPath();
    ctx.moveTo(canvasSize / 2, 0);
    ctx.lineTo(canvasSize / 2, canvasSize);
    ctx.stroke();

    // Center horizontal guideline
    ctx.beginPath();
    ctx.moveTo(0, canvasSize / 2);
    ctx.lineTo(canvasSize, canvasSize / 2);
    ctx.stroke();

    // Inner quadrant margins
    ctx.strokeStyle = '#f1f5f9';
    ctx.setLineDash([]);
    ctx.strokeRect(canvasSize * 0.08, canvasSize * 0.08, canvasSize * 0.84, canvasSize * 0.84);
    ctx.restore();

    // 2. Draw Faint Target Character Guide IF in TRACE MODE
    if (currentMode === 'trace') {
      ctx.save();
      // Font size adapts dynamically to character length
      const charLength = targetCharacter.length;
      let fontSize = canvasSize * 0.58;
      if (charLength === 2) fontSize = canvasSize * 0.38;
      else if (charLength === 3) fontSize = canvasSize * 0.28;
      else if (charLength >= 4) fontSize = canvasSize * 0.22;

      ctx.font = `600 ${fontSize}px "Noto Sans JP", sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Visible guide watermark — dark enough to trace, light enough to see user strokes
      ctx.fillStyle = 'rgba(100, 116, 139, 0.38)';
      ctx.fillText(targetCharacter, canvasSize / 2, canvasSize / 2 + 6);

      // Contrasting stroke contour in rose
      ctx.strokeStyle = 'rgba(225, 29, 72, 0.30)';
      ctx.lineWidth = 2;
      ctx.strokeText(targetCharacter, canvasSize / 2, canvasSize / 2 + 6);
      ctx.restore();
    }


    // 3. Draw Student's Strokes with Smooth Quadratic Midpoint Interpolation (Sumi Ink style)
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a'; // Deep Japanese Sumi ink
    ctx.fillStyle = '#0f172a';
    ctx.lineWidth = Math.max(canvasSize * 0.024, 7);

    // Helper to render a series of points smoothly
    const renderPoints = (points: StrokePoint[]) => {
      if (points.length === 0) return;
      if (points.length === 1) {
        // Single tap dot
        ctx.beginPath();
        ctx.arc(points[0].x, points[0].y, ctx.lineWidth / 2, 0, Math.PI * 2);
        ctx.fill();
        return;
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      if (points.length === 2) {
        ctx.lineTo(points[1].x, points[1].y);
      } else {
        // Quadratic Bézier curve interpolation through midpoints for fluid calligraphic curves
        for (let i = 1; i < points.length - 1; i++) {
          const midX = (points[i].x + points[i + 1].x) / 2;
          const midY = (points[i].y + points[i + 1].y) / 2;
          ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
        }
        // Connect to the final point
        const lastIdx = points.length - 1;
        ctx.lineTo(points[lastIdx].x, points[lastIdx].y);
      }
      ctx.stroke();
    };

    // Render committed strokes
    strokes.forEach((stroke) => {
      renderPoints(stroke.points);
    });

    // Render active in-progress stroke
    if (currentPoints.length > 0) {
      renderPoints(currentPoints);
    }

    ctx.restore();
  }, [canvasSize, currentMode, targetCharacter, strokes, currentPoints]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Pointer coordinate calculation — uses CSS bounding rect (works after canvas resize)
  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>): StrokePoint | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    // Scale client coords to canvas logical coords (handles DPR and CSS scaling)
    const scaleX = canvasSize / rect.width;
    const scaleY = canvasSize / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      time: Math.round(performance.now()),
      pressure: e.pressure > 0 ? e.pressure : 0.5,
    };
  };

  /** Get CSS-space position for the brush indicator (no scaling needed here) */
  const getCSSPoint = (e: React.PointerEvent<HTMLCanvasElement>): { x: number; y: number } => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);

    const pt = getCanvasPoint(e);
    if (!pt) return;

    setCursorPos(getCSSPoint(e));
    setIsDrawing(true);
    setCurrentPoints([pt]);
    setCheckFeedback(null);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setCursorPos(getCSSPoint(e));
    if (!isDrawing) return;
    e.preventDefault();

    const pt = getCanvasPoint(e);
    if (!pt) return;

    setCurrentPoints((prev) => [...prev, pt]);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);

    if (currentPoints.length > 0) {
      const startPt = currentPoints[0];
      const endPt = currentPoints[currentPoints.length - 1];

      const newStroke: RecordedStroke = {
        strokeIndex: strokes.length,
        points: currentPoints,
        startPoint: startPt,
        endPoint: endPt,
        startTime: startPt.time,
        endTime: endPt.time,
      };

      setStrokes((prev) => [...prev, newStroke]);
      setCurrentPoints([]);
    }

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
  };


  // Respond to clearTrigger from parent (e.g. Try Again)
  const [prevClearTrigger, setPrevClearTrigger] = useState(clearTrigger);
  if (clearTrigger !== prevClearTrigger) {
    setPrevClearTrigger(clearTrigger);
    setStrokes([]);
    setCurrentPoints([]);
    setCheckFeedback(null);
  }

  // Clear: Removes all student strokes
  const handleClear = () => {
    setStrokes([]);
    setCurrentPoints([]);
    setCheckFeedback(null);
  };

  // Undo: Removes only the latest stroke
  const handleUndo = () => {
    if (strokes.length === 0) return;
    setStrokes((prev) => prev.slice(0, -1));
    setCheckFeedback(null);
  };

  // Build the complete session stroke data payload for Part 5
  const getSessionData = (): HandwritingSessionData => {
    return {
      targetCharacter,
      romaji,
      mode: currentMode,
      level,
      canvasWidth: canvasSize,
      canvasHeight: canvasSize,
      strokes,
      totalStrokeCount: strokes.length,
      recordedAt: Date.now(),
    };
  };

  // Check button: Validates whether the student actually wrote something
  const handleCheck = () => {
    // Anti-cheat validation: No strokes
    if (strokes.length === 0) {
      setCheckFeedback({
        type: 'warning',
        message: 'Please write before checking.',
      });
      return;
    }

    // Anti-cheat validation: Insufficient points or accidental dot
    const totalPoints = strokes.reduce((acc, s) => acc + s.points.length, 0);
    if (totalPoints < 6) {
      setCheckFeedback({
        type: 'warning',
        message: 'Please write before checking.',
      });
      return;
    }

    setCheckFeedback(null);

    const sessionData = getSessionData();
    if (onStrokeCapture) {
      onStrokeCapture(sessionData);
    }

    if (onCheck) {
      onCheck(strokes, canvasSize, canvasSize);
    }
  };

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full max-w-lg mx-auto bg-white rounded-3xl p-5 sm:p-7 shadow-sm border border-slate-200"
    >
      {/* ==================================================
          INTERMEDIATE PROMPT OR LEVEL BADGE
          ================================================== */}
      <div className="w-full mb-5 pb-4 border-b border-slate-100 flex flex-col gap-2.5">
        {allowedModes.length > 1 && onModeChange ? (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs sm:text-sm font-bold text-slate-700">
              How would you like to practice?
            </span>
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => onModeChange('trace')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentMode === 'trace'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>✍️</span>
                <span>Trace Mode</span>
              </button>
              <button
                type="button"
                onClick={() => onModeChange('free')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentMode === 'free'
                    ? 'bg-white text-rose-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🖊️</span>
                <span>Free Style</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Writing Mode:
              </span>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  currentMode === 'trace'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {currentMode === 'trace' ? '✍️ Trace Only Mode' : '🖊️ Free Style Only Mode'}
              </span>
            </div>

            <div className="text-xs text-slate-400 font-semibold">
              {strokes.length} {strokes.length === 1 ? 'stroke' : 'strokes'}
            </div>
          </div>
        )}
      </div>

      {/* ==================================================
          WRITING PRACTICE CANVAS (The main interactive element)
          ================================================== */}
      <div
        className="relative rounded-2xl overflow-hidden border-2 border-slate-300 shadow-inner bg-white cursor-none select-none"
        style={{
          width: canvasSize,
          height: canvasSize,
          touchAction: 'none',
        }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={(e) => {
            handlePointerUp(e);
            setIsCursorOnCanvas(false);
            setCursorPos(null);
          }}
          onPointerEnter={() => setIsCursorOnCanvas(true)}
          className="w-full h-full block"
          style={{
            width: canvasSize,
            height: canvasSize,
            touchAction: 'none',
          }}
        />

        {/* ── Brush Indicator Overlay ─────────────────────────────────────
            Visible dot that tracks the pointer without leaving a mark.
            Works on desktop (mouse/stylus) and touchscreen.
        ────────────────────────────────────────────────────────────────── */}
        {isCursorOnCanvas && cursorPos && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: cursorPos.x - 9,
              top: cursorPos.y - 9,
              width: 18,
              height: 18,
              borderRadius: '50%',
              border: '2.5px solid #e11d48',
              background: isDrawing ? 'rgba(225,29,72,0.22)' : 'rgba(225,29,72,0.08)',
              boxShadow: isDrawing ? '0 0 0 3px rgba(225,29,72,0.15)' : 'none',
              transition: 'background 0.06s, box-shadow 0.06s',
              zIndex: 10,
            }}
          />
        )}

        {/* Trace Mode Hint Watermark */}
        {currentMode === 'trace' && strokes.length === 0 && (
          <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-medium shadow-xs">
            <span>Trace over the faint Japanese outline</span>
          </div>
        )}

        {/* Free Style Mode Hint Watermark */}
        {currentMode === 'free' && strokes.length === 0 && (
          <div className="absolute top-3 left-3 pointer-events-none flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-medium shadow-xs">
            <span>Write "{romaji}" from memory</span>
          </div>
        )}
      </div>


      {/* ==================================================
          CHECK EVALUATION FEEDBACK BANNER
          ================================================== */}
      {checkFeedback && (
        <div
          className={`w-full mt-4 p-3.5 rounded-2xl text-xs sm:text-sm font-medium flex flex-col gap-1 animate-in fade-in duration-150 ${
            checkFeedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-amber-50 text-amber-900 border border-amber-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold">
            {checkFeedback.type === 'success' ? (
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle size={18} className="text-amber-600 shrink-0" />
            )}
            <span>{checkFeedback.message}</span>
          </div>
          {checkFeedback.details && (
            <div className="text-[11px] sm:text-xs opacity-80 pl-6 flex items-center justify-between">
              <span>{checkFeedback.details}</span>
              <button
                type="button"
                onClick={() => setShowStrokeInspector(true)}
                className="inline-flex items-center gap-1 underline font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                <Code size={12} />
                <span>View Stroke Data</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================================================
          CONTROLS: [ Clear ] [ Undo ] [ Check ]
          ================================================== */}
      <div className="w-full grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-slate-100">
        {/* Clear */}
        <button
          type="button"
          onClick={handleClear}
          disabled={strokes.length === 0 && currentPoints.length === 0}
          className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-2xs"
        >
          <Trash2 size={16} />
          <span>Clear</span>
        </button>

        {/* Undo */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={strokes.length === 0}
          className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 shadow-2xs"
        >
          <RotateCcw size={16} />
          <span>Undo</span>
        </button>

        {/* Check / Submit */}
        <button
          type="button"
          onClick={handleCheck}
          className="flex items-center justify-center gap-1.5 py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg shadow-rose-200 hover:shadow-rose-300 transition-all cursor-pointer active:scale-95"
        >
          <CheckCircle2 size={16} />
          <span>{submitLabel}</span>
        </button>
      </div>

      {/* ==================================================
          MODAL: STROKE DATA INSPECTOR (Ready for Part 5)
          ================================================== */}
      {showStrokeInspector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150 max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Code size={18} className="text-rose-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Recorded Stroke Data (Part 5 Format)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowStrokeInspector(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              KanaSense captures each stroke with its index, coordinate array, timestamp, start point, and end point. This clean payload is ready for the Part 5 handwriting evaluation engine.
            </p>

            <pre className="text-xs bg-slate-900 text-emerald-400 p-4 rounded-2xl overflow-x-auto max-h-72 font-mono leading-relaxed">
              {JSON.stringify(getSessionData(), null, 2)}
            </pre>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowStrokeInspector(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
