import { useState, useEffect, useCallback } from 'react';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from 'lucide-react';
import type {
  LearningItem,
  PracticeMode,
  CategoryMetadata,
  RecordedStroke,
} from '../../types/learning';
import type {
  EvaluationScoreBreakdown,
  AttemptEntry,
} from '../../types/evaluation';
import { PracticeCanvas } from './PracticeCanvas';
import { VocabularyPanel } from './VocabularyPanel';
import { ResultCard } from './ResultCard';
import { AudioButton } from '../common/AudioButton';
import { VoiceAlertToast } from '../common/VoiceAlertToast';
import { LevelBadge, ModeBadge } from '../common/LevelBadge';
import { StrokeOrderPanel } from '../game/StrokeOrderPanel';
import { evaluateHandwriting } from '../../evaluation/evaluator';
import {
  recordAttempt,
  getItemAttempts,
  markItemMastered,
  markItemSkipped,
  getMasteredItems,
  getSkippedItems,
  onProgressionUpdated,
} from '../../utils/progression';

interface PracticeScreenProps {
  items: LearningItem[];
  initialItemId?: string;
  categoryMeta: CategoryMetadata;
  onBack?: () => void;
  backLabel?: string;
}

export const PracticeScreen = ({
  items,
  initialItemId,
  categoryMeta,
  onBack,
  backLabel = 'Back to Dashboard',
}: PracticeScreenProps) => {
  // Progression status maps initialized lazily from storage
  const [masteredMap, setMasteredMap] = useState<Record<string, boolean>>(() => {
    const mastered = getMasteredItems();
    const mMap: Record<string, boolean> = {};
    Object.keys(mastered).forEach((id) => {
      mMap[id] = true;
    });
    return mMap;
  });

  const [skippedMap, setSkippedMap] = useState<Record<string, boolean>>(() => {
    const skipped = getSkippedItems();
    const sMap: Record<string, boolean> = {};
    Object.keys(skipped).forEach((id) => {
      sMap[id] = true;
    });
    return sMap;
  });

  const [showSkippedOnly, setShowSkippedOnly] = useState(false);

  // Sync progression state from localStorage
  const refreshProgression = useCallback(() => {
    const mastered = getMasteredItems();
    const skipped = getSkippedItems();
    const mMap: Record<string, boolean> = {};
    const sMap: Record<string, boolean> = {};

    Object.keys(mastered).forEach((id) => {
      mMap[id] = true;
    });
    Object.keys(skipped).forEach((id) => {
      sMap[id] = true;
    });

    setMasteredMap(mMap);
    setSkippedMap(sMap);
  }, []);

  useEffect(() => {
    const unsubscribe = onProgressionUpdated(refreshProgression);
    return unsubscribe;
  }, [refreshProgression]);

  // Calculate skipped count in this specific item collection
  const skippedInThisCategory = items.filter((it) => Boolean(skippedMap[it.id]));
  const masteredInThisCategory = items.filter((it) => Boolean(masteredMap[it.id]));

  // Active items list: either all items or filtered to skipped only
  const activeItems =
    showSkippedOnly && skippedInThisCategory.length > 0
      ? skippedInThisCategory
      : items;

  const initialIndex = initialItemId
    ? Math.max(0, activeItems.findIndex((i) => i.id === initialItemId))
    : 0;

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [prevInitialItemId, setPrevInitialItemId] = useState(initialItemId);
  const [intermediateMode, setIntermediateMode] = useState<PracticeMode>('trace');

  // Evaluation & Results state
  const [evaluationResult, setEvaluationResult] = useState<EvaluationScoreBreakdown | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [clearTrigger, setClearTrigger] = useState(0);

  if (prevInitialItemId !== initialItemId) {
    setPrevInitialItemId(initialItemId);
    setSelectedIndex(null);
  }

  const currentIndex = selectedIndex !== null ? selectedIndex : initialIndex;
  const setCurrentIndex = (idxOrFn: number | ((prev: number) => number)) => {
    setSelectedIndex((current) => {
      const active = current !== null ? current : initialIndex;
      return typeof idxOrFn === 'function' ? idxOrFn(active) : idxOrFn;
    });
  };

  const currentItem = activeItems[currentIndex] || activeItems[0];

  // Load current item attempts history
  const currentAttempts: AttemptEntry[] = currentItem
    ? getItemAttempts(currentItem.id)
    : [];

  // Derived effective mode based on strict level constraints:
  // Beginner is Trace Only, Advanced is Free Style Only, Intermediate is user-selectable
  const effectiveMode: PracticeMode =
    categoryMeta.level === 'beginner'
      ? 'trace'
      : categoryMeta.level === 'advanced'
      ? 'free'
      : intermediateMode;

  if (!currentItem) {
    return (
      <div className="p-8 text-center text-slate-500">
        No learning items found for this section.
      </div>
    );
  }

  const handlePrev = () => {
    setEvaluationResult(null);
    setShowResultModal(false);
    setClearTrigger((prev) => prev + 1);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activeItems.length - 1));
  };

  const handleNext = () => {
    setEvaluationResult(null);
    setShowResultModal(false);
    setClearTrigger((prev) => prev + 1);
    setCurrentIndex((prev) => (prev < activeItems.length - 1 ? prev + 1 : 0));
  };

  // Evaluation Check Handler
  const handleEvaluate = (
    strokes: RecordedStroke[],
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const res = evaluateHandwriting(
      strokes,
      currentItem.japanese,
      canvasWidth,
      canvasHeight,
      effectiveMode
    );

    if (res.success && res.result) {
      // 1. Record attempt history
      recordAttempt(currentItem.id, res.result.finalScore, res.result.passed);

      // 2. If passed (score >= 75), mark item as mastered
      if (res.result.passed) {
        markItemMastered(
          currentItem.id,
          currentItem.japanese,
          res.result.finalScore,
          effectiveMode
        );
      }

      setEvaluationResult(res.result);
      setShowResultModal(true);
      refreshProgression();
    }
  };

  // Try Again: Closes modal and clears canvas
  const handleTryAgain = () => {
    setShowResultModal(false);
    setClearTrigger((prev) => prev + 1);
  };

  // Skip: Marks item as skipped and advances to next
  const handleSkip = () => {
    if (evaluationResult) {
      markItemSkipped(
        currentItem.id,
        currentItem.japanese,
        evaluationResult.finalScore
      );
    }
    setShowResultModal(false);
    setClearTrigger((prev) => prev + 1);
    refreshProgression();
    handleNext();
  };

  const isCurrentMastered = Boolean(masteredMap[currentItem.id]);
  const isCurrentSkipped = Boolean(skippedMap[currentItem.id]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      {/* Voice availability toast notification if device lacks Japanese TTS */}
      <VoiceAlertToast />

      {/* Evaluation Result Modal */}
      {showResultModal && evaluationResult && (
        <ResultCard
          result={evaluationResult}
          target={currentItem.japanese}
          attempts={getItemAttempts(currentItem.id)}
          onTryAgain={handleTryAgain}
          onNext={handleNext}
          onSkip={handleSkip}
          onClose={() => setShowResultModal(false)}
        />
      )}

      {/* Top Navigation & Breadcrumb */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
            <span>{backLabel}</span>
          </button>
        ) : (
          <div className="text-sm font-semibold text-slate-500">
            {categoryMeta.title} ({categoryMeta.japaneseTitle})
          </div>
        )}

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* "Practice Skipped Items" Filter Button */}
          {skippedInThisCategory.length > 0 && (
            <button
              type="button"
              onClick={() => {
                setShowSkippedOnly((prev) => !prev);
                setSelectedIndex(0);
                setClearTrigger((prev) => prev + 1);
              }}
              className={`text-xs font-bold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 transition-all cursor-pointer ${
                showSkippedOnly
                  ? 'bg-amber-500 text-white shadow-xs ring-2 ring-amber-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Bookmark size={13} />
              <span>
                {showSkippedOnly ? 'Showing Skipped Items' : 'Practice Skipped Items'} (
                {skippedInThisCategory.length})
              </span>
            </button>
          )}

          {/* Mastered Counter */}
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Mastered: {masteredInThisCategory.length}</span>
          </span>

          <LevelBadge level={categoryMeta.level} size="sm" />
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {currentIndex + 1} / {activeItems.length}
          </span>
        </div>
      </div>

      {/* ==================================================
          TOP: Japanese target, Romaji, English meaning, 🔊 Listen
          ================================================== */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200 text-center relative overflow-hidden">
        {/* Subtle decorative kanji watermark */}
        <div
          className="absolute right-4 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.04] text-8xl font-black font-serif"
          aria-hidden="true"
        >
          {currentItem.japanese}
        </div>

        <div className="flex flex-col items-center justify-center max-w-xl mx-auto">
          {/* Item status flags */}
          <div className="flex items-center gap-2 mb-2">
            {isCurrentMastered && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                <CheckCircle2 size={13} />
                <span>Mastered (75+)</span>
              </span>
            )}
            {isCurrentSkipped && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold">
                <Bookmark size={13} />
                <span>Skipped Item</span>
              </span>
            )}
            {currentAttempts.length > 0 && (
              <span className="text-[11px] font-medium text-slate-500 font-mono">
                {currentAttempts.length} attempt{currentAttempts.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Japanese Target Display & 🔊 Listen Button */}
          <div className="flex items-center justify-center gap-4 mb-3">
            <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 font-serif">
              {currentItem.japanese}
            </h1>
            <AudioButton
              text={currentItem.japanese}
              size="lg"
              showLabel
              label="Listen"
            />
          </div>

          {/* Romaji (explicitly labeled under the Japanese text) */}
          <div className="flex flex-col items-center gap-0.5 mt-1">
            <span className="text-xs uppercase tracking-widest font-semibold text-slate-400">
              Romaji
            </span>
            <span className="text-xl sm:text-2xl font-bold text-rose-600 tracking-wide font-mono">
              {currentItem.romaji}
            </span>
          </div>

          {/* English Meaning */}
          {currentItem.meaning && (
            <div className="mt-3 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-slate-100/90 text-slate-700 text-sm font-medium">
              <span className="text-xs uppercase font-semibold text-slate-400">Meaning:</span>
              <span className="font-semibold text-slate-800">{currentItem.meaning}</span>
            </div>
          )}
        </div>
      </div>

      {/* ==================================================
          MAIN INTERACTION AREA:
          CENTER: Writing practice canvas (Evaluated on Check)
          RIGHT SIDE ON DESKTOP: Vocabulary Panel (Stacked on mobile)
          ================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* CENTER: Practice Canvas (Spans 7 cols on desktop - primary focus) */}
        <div className="lg:col-span-7 flex flex-col items-center w-full gap-5">
          <PracticeCanvas
            key={`${currentItem.id}-${effectiveMode}`}
            targetCharacter={currentItem.japanese}
            romaji={currentItem.romaji}
            currentMode={effectiveMode}
            onModeChange={categoryMeta.allowedModes.length > 1 ? setIntermediateMode : undefined}
            allowedModes={categoryMeta.allowedModes}
            level={categoryMeta.level}
            onCheck={handleEvaluate}
            clearTrigger={clearTrigger}
          />

          {/* Stroke Order section — only for single kana characters */}
          {currentItem.japanese.length === 1 && (
            <div className="w-full">
              <StrokeOrderPanel character={currentItem.japanese} compact={false} />
            </div>
          )}
        </div>

        {/* RIGHT SIDE ON DESKTOP: Vocabulary Panel & Protocol Guidelines */}
        <div className="lg:col-span-5 flex flex-col gap-4 w-full">
          {/* Vocabulary Card */}
          <VocabularyPanel item={currentItem} />

          {/* Card: Writing Mode Guidelines & Evaluation Protocol */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-sm flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300">
                Level Protocol
              </span>
              <ModeBadge mode={effectiveMode} className="bg-slate-800 text-slate-200 border-slate-700" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {categoryMeta.level === 'beginner' && (
                <>
                  <strong className="text-white">Beginner Level:</strong> Trace-Only practice. Follow the faint outline to establish proper muscular memory and stroke proportions.
                </>
              )}
              {categoryMeta.level === 'intermediate' && (
                <>
                  <strong className="text-white">Intermediate Level:</strong> Practice either with faint guidance in <span className="text-rose-300 font-semibold">Trace Mode</span> or test your recall in <span className="text-rose-300 font-semibold">Free Style</span>.
                </>
              )}
              {categoryMeta.level === 'advanced' && (
                <>
                  <strong className="text-white">Advanced Level:</strong> Free Style only. Recall and balance kanji compounds directly onto the Genkouyoushi grid from memory.
                </>
              )}
            </p>

            <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-amber-400" />
                <span>Target Pass Score: <strong className="text-white">75 / 100</strong></span>
              </span>
              <span>Shape • Stroke • Position • Size</span>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================
          BOTTOM/FOOTER: Related Characters & Navigation Grid
          ================================================== */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-200 mt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm sm:text-base text-slate-900">
              Related Characters ({categoryMeta.title})
            </h4>
            <span className="text-xs text-slate-500">
              Click any character to switch
            </span>
          </div>

          {/* Previous / Next buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              aria-label="Previous character"
              title="Previous character"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
              aria-label="Next character"
              title="Next character"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Character Grid Strip with Mastered & Skipped status indicators */}
        <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-2 max-h-48 overflow-y-auto p-1">
          {activeItems.map((item, idx) => {
            const isActive = idx === currentIndex;
            const isMastered = Boolean(masteredMap[item.id]);
            const isSkipped = Boolean(skippedMap[item.id]);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setEvaluationResult(null);
                  setShowResultModal(false);
                  setClearTrigger((prev) => prev + 1);
                  setCurrentIndex(idx);
                }}
                className={`relative flex flex-col items-center justify-center p-2 rounded-xl transition-all cursor-pointer ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-300 scale-105'
                    : 'bg-slate-50 hover:bg-rose-50 text-slate-800 border border-slate-200/80 hover:border-rose-200'
                }`}
              >
                {/* Mastered Checkmark Badge */}
                {isMastered && (
                  <span
                    className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
                      isActive ? 'bg-white text-emerald-700' : 'bg-emerald-600 text-white'
                    }`}
                    title="Mastered"
                  >
                    ✓
                  </span>
                )}

                {/* Skipped Bookmark Badge */}
                {!isMastered && isSkipped && (
                  <span
                    className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      isActive ? 'bg-white text-amber-700' : 'bg-amber-500 text-white'
                    }`}
                    title="Skipped"
                  >
                    ★
                  </span>
                )}

                <span className="text-lg font-bold font-serif leading-none">
                  {item.japanese}
                </span>
                <span
                  className={`text-[10px] mt-1 font-mono leading-none ${
                    isActive ? 'text-rose-100' : 'text-slate-500'
                  }`}
                >
                  {item.romaji.length > 5 ? item.romaji.slice(0, 4) + '…' : item.romaji}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
