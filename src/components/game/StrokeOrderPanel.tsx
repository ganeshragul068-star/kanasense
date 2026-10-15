/**
 * StrokeOrderPanel
 *
 * Two tabs:
 *   1. "Watch" — Animated stroke-by-stroke playback with Play/Next/Prev/Reset.
 *   2. "Guided Trace" — Guided writing practice: stroke guide shown in amber,
 *      player draws over it. Simple pass/fail feedback per stroke.
 *
 * Two layout modes:
 *   - compact=true  → floating overlay (in-game popup) with "Return to Game" button
 *   - compact=false → inline panel for practice screen (no close button)
 *
 * All coordinates stored as 0–100 units, scaled to canvas at render time.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  X,
  Play,
  SkipForward,
  SkipBack,
  RotateCcw,
  ChevronRight,
  PenTool,
  Eye,
} from 'lucide-react';
import { getStrokeData, type StrokeData, type StrokePoint } from '../../data/strokeOrderData';
import type { StrokePoint as CanvasPoint } from '../../types/learning';

interface StrokeOrderPanelProps {
  /** The Japanese character whose stroke order to display */
  character: string;
  /** If true, renders as a floating overlay with a close/return button */
  compact?: boolean;
  /** Called when the user clicks "Return to Game" in compact mode */
  onClose?: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CANVAS_SIZE = 240;
const GUIDE_COLOR = '#e2e8f0';
const STROKE_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444',
];
const PREV_STROKE_COLOR = '#94a3b8';
const ANIMATION_SPEED = 2.5;

type PanelTab = 'watch' | 'guided';

// ─── Drawing helpers ──────────────────────────────────────────────────────────

function toCanvas(v: number, size: number) {
  return (v / 100) * size;
}

function drawGuides(ctx: CanvasRenderingContext2D, size: number, character: string) {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = GUIDE_COLOR;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(2, 2, size - 4, size - 4);
  ctx.setLineDash([4, 4]);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(size / 2, 0);
  ctx.lineTo(size / 2, size);
  ctx.moveTo(0, size / 2);
  ctx.lineTo(size, size / 2);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font = `bold ${size * 0.72}px serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(100, 116, 139, 0.07)';
  ctx.fillText(character, size / 2, size / 2 + size * 0.04);
}

function drawStrokePartial(
  ctx: CanvasRenderingContext2D,
  points: StrokePoint[],
  progress: number,
  color: string,
  size: number,
  lineWidth = 5
) {
  if (points.length < 2) return;
  const segs: number[] = [];
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = toCanvas(points[i + 1].x - points[i].x, size);
    const dy = toCanvas(points[i + 1].y - points[i].y, size);
    segs.push(Math.hypot(dx, dy));
    total += segs[i];
  }
  let remaining = total * Math.min(progress, 1);
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = color;
  ctx.shadowBlur = 3;
  ctx.beginPath();
  ctx.moveTo(toCanvas(points[0].x, size), toCanvas(points[0].y, size));
  for (let i = 0; i < points.length - 1; i++) {
    if (remaining <= 0) break;
    if (remaining >= segs[i]) {
      ctx.lineTo(toCanvas(points[i + 1].x, size), toCanvas(points[i + 1].y, size));
      remaining -= segs[i];
    } else {
      const t = remaining / segs[i];
      ctx.lineTo(
        toCanvas(points[i].x + (points[i + 1].x - points[i].x) * t, size),
        toCanvas(points[i].y + (points[i + 1].y - points[i].y) * t, size)
      );
      break;
    }
  }
  ctx.stroke();
  ctx.restore();
}

function drawStrokeFull(
  ctx: CanvasRenderingContext2D,
  points: StrokePoint[],
  color: string,
  size: number,
  lineWidth = 5
) {
  drawStrokePartial(ctx, points, 1, color, size, lineWidth);
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(toCanvas(points[0].x, size), toCanvas(points[0].y, size), lineWidth * 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function strokeLength(points: StrokePoint[], size: number) {
  let len = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const dx = toCanvas(points[i + 1].x - points[i].x, size);
    const dy = toCanvas(points[i + 1].y - points[i].y, size);
    len += Math.hypot(dx, dy);
  }
  return len;
}

/** Draw amber dashed guide for the current stroke to trace */
function drawGuideStroke(
  ctx: CanvasRenderingContext2D,
  points: StrokePoint[],
  size: number
) {
  if (points.length < 2) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.setLineDash([8, 10]);
  ctx.beginPath();
  ctx.moveTo(toCanvas(points[0].x, size), toCanvas(points[0].y, size));
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(toCanvas(points[i].x, size), toCanvas(points[i].y, size));
  }
  ctx.stroke();
  ctx.setLineDash([]);
  // Start dot
  ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
  ctx.beginPath();
  ctx.arc(toCanvas(points[0].x, size), toCanvas(points[0].y, size), 7, 0, Math.PI * 2);
  ctx.fill();
  // End dot (hollow)
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.8)';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  const last = points[points.length - 1];
  ctx.arc(toCanvas(last.x, size), toCanvas(last.y, size), 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

/** Draw user-drawn points on top of guide (sumi ink style) */
function drawUserStrokes(
  ctx: CanvasRenderingContext2D,
  strokes: CanvasPoint[][]
) {
  ctx.save();
  ctx.strokeStyle = '#0f172a';
  ctx.fillStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  for (const pts of strokes) {
    if (pts.length === 0) continue;
    if (pts.length === 1) {
      ctx.beginPath();
      ctx.arc(pts[0].x, pts[0].y, 3, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const mx = (pts[i].x + pts[i + 1].x) / 2;
      const my = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
    }
    ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
    ctx.stroke();
  }
  ctx.restore();
}

/** Simple coverage check: did the user draw near the guide stroke? */
function computeStrokeCoverage(
  userPts: CanvasPoint[],
  guidePts: StrokePoint[],
  size: number,
  hitRadius = 20
): number {
  if (guidePts.length === 0 || userPts.length === 0) return 0;
  let covered = 0;
  for (const gp of guidePts) {
    const gx = toCanvas(gp.x, size);
    const gy = toCanvas(gp.y, size);
    const hit = userPts.some((up) => Math.hypot(up.x - gx, up.y - gy) <= hitRadius);
    if (hit) covered++;
  }
  return covered / guidePts.length;
}

// ─── Component ───────────────────────────────────────────────────────────────

export const StrokeOrderPanel: React.FC<StrokeOrderPanelProps> = ({
  character,
  compact = false,
  onClose,
}) => {
  const strokeData: StrokeData | null = getStrokeData(character);

  // ── Shared state ─────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<PanelTab>('watch');

  // ── Watch tab state ──────────────────────────────────────────────────────
  const watchCanvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [drawnUpTo, setDrawnUpTo] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const progressRef = useRef(0);

  // ── Guided tab state ─────────────────────────────────────────────────────
  const guideCanvasRef = useRef<HTMLCanvasElement>(null);
  const [guidedStroke, setGuidedStroke] = useState(0);
  const [guidedUserStrokes, setGuidedUserStrokes] = useState<CanvasPoint[][]>([]);
  const [guidedCurrentPts, setGuidedCurrentPts] = useState<CanvasPoint[]>([]);
  const [isGuidedDrawing, setIsGuidedDrawing] = useState(false);
  const [strokeFeedback, setStrokeFeedback] = useState<{
    ok: boolean;
    msg: string;
  } | null>(null);
  const [allDone, setAllDone] = useState(false);
  const guidedUserStrokesRef = useRef<CanvasPoint[][]>([]);

  // ─── WATCH: redraw ────────────────────────────────────────────────────────

  const watchRedraw = useCallback(
    (currentIdx: number, currentProgress: number, finishedUpTo: number) => {
      const canvas = watchCanvasRef.current;
      if (!canvas || !strokeData) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const size = canvas.width;
      drawGuides(ctx, size, character);
      const strokes = strokeData.strokes;
      for (let i = 0; i < currentIdx; i++) {
        drawStrokeFull(ctx, strokes[i].points, PREV_STROKE_COLOR, size);
      }
      for (let i = 0; i < currentIdx; i++) {
        const p = strokes[i].points[0];
        ctx.save();
        ctx.fillStyle = PREV_STROKE_COLOR;
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(i + 1), toCanvas(p.x, size), toCanvas(p.y, size) - 8);
        ctx.restore();
      }
      if (currentIdx < strokes.length && currentProgress > 0) {
        const color = STROKE_COLORS[currentIdx % STROKE_COLORS.length];
        drawStrokePartial(ctx, strokes[currentIdx].points, currentProgress, color, size);
        const p = strokes[currentIdx].points[0];
        ctx.save();
        ctx.fillStyle = color;
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(currentIdx + 1), toCanvas(p.x, size), toCanvas(p.y, size) - 8);
        ctx.restore();
      }
      void finishedUpTo; // used for future use
    },
    [character, strokeData]
  );

  // Reset watch tab when character changes
  useEffect(() => {
    setCurrentStroke(0);
    setDrawnUpTo(-1);
    setIsPlaying(false);
    progressRef.current = 0;
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    // Also reset guided tab
    setGuidedStroke(0);
    setGuidedUserStrokes([]);
    guidedUserStrokesRef.current = [];
    setGuidedCurrentPts([]);
    setStrokeFeedback(null);
    setAllDone(false);
  }, [character]);

  useEffect(() => {
    watchRedraw(0, 0, -1);
  }, [watchRedraw]);

  // Watch animation loop
  useEffect(() => {
    if (!isPlaying || !strokeData) return;
    if (currentStroke >= strokeData.strokes.length) {
      setIsPlaying(false);
      return;
    }
    const strokes = strokeData.strokes;
    const size = CANVAS_SIZE;
    const totalLen = strokeLength(strokes[currentStroke].points, size);
    const framesNeeded = Math.max(8, totalLen / ANIMATION_SPEED);
    const increment = 1 / framesNeeded;
    const animate = () => {
      progressRef.current += increment;
      if (progressRef.current >= 1) {
        progressRef.current = 1;
        watchRedraw(currentStroke, 1, drawnUpTo);
        const next = currentStroke + 1;
        setTimeout(() => {
          setDrawnUpTo(currentStroke);
          setCurrentStroke(next);
          progressRef.current = 0;
          if (next >= strokes.length) setIsPlaying(false);
        }, 320);
        return;
      }
      watchRedraw(currentStroke, progressRef.current, drawnUpTo);
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, currentStroke, strokeData, drawnUpTo, watchRedraw]);

  useEffect(() => {
    if (!isPlaying) watchRedraw(currentStroke, 0, drawnUpTo);
  }, [currentStroke, drawnUpTo, isPlaying, watchRedraw]);

  // Watch controls
  const handlePlayAll = () => {
    if (!strokeData) return;
    setCurrentStroke(0);
    setDrawnUpTo(-1);
    progressRef.current = 0;
    setIsPlaying(true);
  };
  const handleReset = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;
    setIsPlaying(false);
    setCurrentStroke(0);
    setDrawnUpTo(-1);
    progressRef.current = 0;
    watchRedraw(0, 0, -1);
  };
  const handleNextStroke = () => {
    if (!strokeData) return;
    if (isPlaying) setIsPlaying(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;
    const next = currentStroke + 1;
    if (next > strokeData.strokes.length) return;
    setDrawnUpTo(currentStroke - 1 < drawnUpTo ? drawnUpTo : currentStroke - 1);
    watchRedraw(currentStroke, 1, drawnUpTo);
    setDrawnUpTo(currentStroke);
    setCurrentStroke(next);
    progressRef.current = 0;
  };
  const handlePrevStroke = () => {
    if (!strokeData) return;
    if (isPlaying) setIsPlaying(false);
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = null;
    const prev = Math.max(0, currentStroke - 1);
    setCurrentStroke(prev);
    setDrawnUpTo(prev - 1);
    progressRef.current = 0;
  };

  // ─── GUIDED TAB: redraw ───────────────────────────────────────────────────

  const guidedRedraw = useCallback(() => {
    const canvas = guideCanvasRef.current;
    if (!canvas || !strokeData) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const size = canvas.width;
    drawGuides(ctx, size, character);
    const strokes = strokeData.strokes;

    // Draw all completed strokes in grey
    for (let i = 0; i < guidedStroke && i < strokes.length; i++) {
      drawStrokeFull(ctx, strokes[i].points, PREV_STROKE_COLOR, size, 5);
    }

    // Draw guide for current stroke
    if (!allDone && guidedStroke < strokes.length) {
      drawGuideStroke(ctx, strokes[guidedStroke].points, size);
    }

    // Draw user's strokes for completed guided strokes
    for (const pts of guidedUserStrokesRef.current) {
      drawUserStrokes(ctx, [pts]);
    }

    // Draw current in-progress stroke
    if (guidedCurrentPts.length > 0) {
      drawUserStrokes(ctx, [guidedCurrentPts]);
    }
  }, [strokeData, character, guidedStroke, guidedCurrentPts, allDone, guidedUserStrokes]);

  useEffect(() => {
    guidedRedraw();
  }, [guidedRedraw]);

  // Pointer event helpers for guided canvas
  const getGuidedPoint = (e: React.PointerEvent<HTMLCanvasElement>): CanvasPoint => {
    const canvas = guideCanvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    return {
      x: (e.clientX - rect.left) * scale,
      y: (e.clientY - rect.top) * scale,
      pressure: e.pressure ?? 1,
      time: e.timeStamp,
    };
  };

  const handleGuidedPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (allDone || !strokeData || guidedStroke >= strokeData.strokes.length) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsGuidedDrawing(true);
    setGuidedCurrentPts([getGuidedPoint(e)]);
    setStrokeFeedback(null);
  };

  const handleGuidedPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isGuidedDrawing) return;
    setGuidedCurrentPts((prev) => [...prev, getGuidedPoint(e)]);
  };

  const handleGuidedPointerUp = () => {
    if (!isGuidedDrawing || !strokeData) return;
    setIsGuidedDrawing(false);

    const currentPts = guidedCurrentPts;
    if (currentPts.length === 0) return;

    // Save user stroke
    const newUserStrokes = [...guidedUserStrokesRef.current, currentPts];
    guidedUserStrokesRef.current = newUserStrokes;
    setGuidedUserStrokes(newUserStrokes);

    // Evaluate coverage
    const guide = strokeData.strokes[guidedStroke];
    const coverage = computeStrokeCoverage(currentPts, guide.points, CANVAS_SIZE);
    const passed = coverage >= 0.4;

    setGuidedCurrentPts([]);

    if (passed) {
      const nextStroke = guidedStroke + 1;
      const done = nextStroke >= strokeData.strokes.length;
      setStrokeFeedback({
        ok: true,
        msg: done
          ? `✓ All ${strokeData.totalStrokes} strokes complete! 🎉`
          : `✓ Stroke ${guidedStroke + 1} correct! Next: stroke ${nextStroke + 1}`,
      });
      setTimeout(() => {
        if (done) {
          setAllDone(true);
        } else {
          setGuidedStroke(nextStroke);
        }
        setStrokeFeedback(null);
      }, 900);
    } else {
      setStrokeFeedback({
        ok: false,
        msg: `✗ Try again — follow the amber guide for stroke ${guidedStroke + 1}`,
      });
      // Clear only current stroke attempt
      const prevStrokes = guidedUserStrokesRef.current.slice(0, -1);
      guidedUserStrokesRef.current = prevStrokes;
      setGuidedUserStrokes(prevStrokes);
    }
  };

  const handleGuidedReset = () => {
    setGuidedStroke(0);
    guidedUserStrokesRef.current = [];
    setGuidedUserStrokes([]);
    setGuidedCurrentPts([]);
    setStrokeFeedback(null);
    setAllDone(false);
  };

  const handleGuidedSkipStroke = () => {
    if (!strokeData || allDone) return;
    const next = guidedStroke + 1;
    if (next >= strokeData.strokes.length) {
      setAllDone(true);
    } else {
      setGuidedStroke(next);
    }
    setStrokeFeedback(null);
  };

  // ─── No data fallback ─────────────────────────────────────────────────────

  if (!strokeData) {
    const msg = (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="text-5xl font-bold text-slate-300 select-none">{character}</div>
        <p className="text-sm text-slate-500 max-w-xs">
          Stroke order data is not yet available for "{character}".
        </p>
        {compact && onClose && (
          <button type="button" onClick={onClose}
            className="mt-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer">
            <ChevronRight size={13} /> Return to Game
          </button>
        )}
      </div>
    );
    return compact ? (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 w-full max-w-xs">{msg}</div>
      </div>
    ) : (
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">{msg}</div>
    );
  }

  const totalStrokes = strokeData.totalStrokes;
  const isWatchFinished = currentStroke >= totalStrokes;

  // ─── Tab Switcher ─────────────────────────────────────────────────────────

  const tabBar = (
    <div className="flex border-b border-slate-200 mb-3">
      <button
        type="button"
        onClick={() => setActiveTab('watch')}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
          activeTab === 'watch'
            ? 'border-indigo-500 text-indigo-700 bg-indigo-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
      >
        <Eye size={13} /> Watch
      </button>
      <button
        type="button"
        onClick={() => setActiveTab('guided')}
        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
          activeTab === 'guided'
            ? 'border-amber-500 text-amber-700 bg-amber-50/50'
            : 'border-transparent text-slate-500 hover:text-slate-700'
        }`}
      >
        <PenTool size={13} /> Guided Trace
      </button>
    </div>
  );

  // ─── WATCH TAB content ────────────────────────────────────────────────────

  const watchContent = (
    <div className="flex flex-col gap-3">
      <div className="flex justify-center">
        <div className="relative">
          <canvas
            ref={watchCanvasRef}
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="rounded-2xl border-2 border-slate-200 shadow-sm"
            style={{ width: CANVAS_SIZE, height: CANVAS_SIZE }}
          />
          {isWatchFinished && (
            <div className="absolute inset-0 flex items-end justify-center pb-3 pointer-events-none">
              <span className="px-3 py-1 rounded-full bg-emerald-500/90 text-white text-xs font-bold">✓ Complete</span>
            </div>
          )}
        </div>
      </div>

      <div className="text-center text-xs font-semibold text-slate-500">
        {isWatchFinished ? `All ${totalStrokes} strokes drawn ✓` : `Stroke ${currentStroke + 1} of ${totalStrokes}`}
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: totalStrokes }).map((_, i) => {
          const done = i < currentStroke;
          const active = i === currentStroke && !isWatchFinished;
          return (
            <button key={i} type="button"
              onClick={() => {
                if (isPlaying) setIsPlaying(false);
                if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
                animFrameRef.current = null;
                setCurrentStroke(i);
                setDrawnUpTo(i - 1);
                progressRef.current = 0;
              }}
              title={`Stroke ${i + 1}`}
              className={`w-5 h-5 rounded-full text-[9px] font-bold transition-all cursor-pointer
                ${done ? 'bg-slate-400 text-white' : active ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : 'bg-slate-200 text-slate-400'}`}
            >{i + 1}</button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-2">
        <button type="button" onClick={handlePrevStroke} disabled={currentStroke === 0}
          title="Previous" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 transition-colors cursor-pointer">
          <SkipBack size={15} />
        </button>
        <button type="button"
          onClick={isPlaying ? () => setIsPlaying(false) : handlePlayAll}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer">
          <Play size={13} />{isPlaying ? 'Pause' : isWatchFinished ? 'Replay' : 'Play All'}
        </button>
        <button type="button" onClick={handleNextStroke} disabled={isWatchFinished}
          title="Next" className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 disabled:opacity-30 transition-colors cursor-pointer">
          <SkipForward size={15} />
        </button>
        <button type="button" onClick={handleReset} title="Reset"
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Direction hint */}
      {!isWatchFinished && strokeData.strokes[currentStroke]?.direction && (
        <div className="text-center text-[11px] text-slate-400">
          Direction: <span className="font-semibold text-slate-600">{strokeData.strokes[currentStroke].direction}</span>
        </div>
      )}
    </div>
  );

  // ─── GUIDED TAB content ───────────────────────────────────────────────────

  const guidedContent = (
    <div className="flex flex-col gap-3">
      {/* Instructions */}
      <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
        {allDone
          ? '🎉 All strokes complete! Great job!'
          : `Draw stroke ${guidedStroke + 1} of ${totalStrokes} — follow the amber guide`}
      </div>

      {/* Guided canvas */}
      <div className="flex justify-center">
        <canvas
          ref={guideCanvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className={`rounded-2xl border-2 shadow-sm touch-none select-none ${
            allDone ? 'border-emerald-400' : 'border-amber-300'
          }`}
          style={{ width: CANVAS_SIZE, height: CANVAS_SIZE, cursor: 'crosshair' }}
          onPointerDown={handleGuidedPointerDown}
          onPointerMove={handleGuidedPointerMove}
          onPointerUp={handleGuidedPointerUp}
          onPointerCancel={handleGuidedPointerUp}
        />
      </div>

      {/* Feedback */}
      {strokeFeedback && (
        <div className={`text-xs font-bold text-center px-3 py-2 rounded-xl border ${
          strokeFeedback.ok
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {strokeFeedback.msg}
        </div>
      )}

      {/* Guided progress dots */}
      <div className="flex justify-center gap-1.5">
        {Array.from({ length: totalStrokes }).map((_, i) => {
          const done = i < guidedStroke || allDone;
          const active = i === guidedStroke && !allDone;
          return (
            <div key={i}
              className={`w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center
                ${done ? 'bg-emerald-500 text-white' : active ? 'bg-amber-500 text-white ring-2 ring-amber-300' : 'bg-slate-200 text-slate-400'}`}
            >{done ? '✓' : i + 1}</div>
          );
        })}
      </div>

      {/* Guided controls */}
      <div className="flex items-center justify-center gap-2">
        <button type="button" onClick={handleGuidedReset}
          className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold transition-colors cursor-pointer">
          <RotateCcw size={12} /> Start Over
        </button>
        {!allDone && (
          <button type="button" onClick={handleGuidedSkipStroke}
            className="flex items-center gap-1 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold transition-colors cursor-pointer">
            <SkipForward size={12} /> Skip Stroke
          </button>
        )}
      </div>
    </div>
  );

  // ─── Full panel layout ────────────────────────────────────────────────────

  const panel = (
    <div className={`flex flex-col gap-3 ${compact ? '' : 'bg-white border border-slate-200 rounded-2xl p-5 shadow-sm'}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Stroke Order</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-2xl font-bold text-slate-900 font-serif">{character}</span>
            <span className="text-sm text-slate-500">({strokeData.reading})</span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
              {totalStrokes} stroke{totalStrokes !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        {compact && onClose && (
          <button type="button" onClick={onClose} aria-label="Close"
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Tab bar */}
      {tabBar}

      {/* Tab content */}
      {activeTab === 'watch' ? watchContent : guidedContent}

      {/* Return to Game button (compact only) */}
      {compact && onClose && (
        <div className="flex justify-center pt-1">
          <button type="button" onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold transition-colors cursor-pointer">
            <ChevronRight size={15} /> Return to Game
          </button>
        </div>
      )}
    </div>
  );

  if (compact) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-150">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-5 w-full max-w-sm overflow-y-auto max-h-[95vh]">
          {panel}
        </div>
      </div>
    );
  }

  return panel;
};
