import { RotateCcw, ArrowRight, SkipForward, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import type { EvaluationScoreBreakdown, AttemptEntry } from '../../types/evaluation';

interface ResultCardProps {
  result: EvaluationScoreBreakdown;
  target: string;
  attempts: AttemptEntry[];
  onTryAgain: () => void;
  onNext: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export const ResultCard = ({
  result,
  target,
  attempts,
  onTryAgain,
  onNext,
  onSkip,
  onClose,
}: ResultCardProps) => {
  const isPassed = result.passed;

  // Rating descriptor
  const getRatingText = () => {
    if (result.finalScore >= 90) return '⭐ Excellent!';
    if (result.finalScore >= 75) return '👍 Great Job!';
    if (result.finalScore >= 60) return 'Keep Practicing';
    return 'Keep Practicing';
  };

  const metricBars = [
    { label: 'Shape', value: result.shapeScore },
    { label: 'Stroke', value: result.strokeScore },
    { label: 'Position', value: result.positionScore },
    { label: 'Size', value: result.sizeScore },
    { label: 'Structure', value: result.structureScore },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-heading"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
    >
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold tracking-widest text-slate-400 uppercase">
              YOUR RESULT
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
              {target}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close result"
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-5 max-h-[80vh] overflow-y-auto">
          {/* Big Score Display */}
          <div className="text-center flex flex-col items-center">
            <div className="flex items-baseline justify-center gap-1">
              <span
                className={`text-6xl sm:text-7xl font-black tracking-tight font-mono ${
                  isPassed ? 'text-emerald-600' : 'text-amber-600'
                }`}
              >
                {result.finalScore}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-slate-400 font-mono">
                / 100
              </span>
            </div>

            <div
              className={`mt-1 text-base sm:text-lg font-bold ${
                isPassed ? 'text-emerald-700' : 'text-amber-700'
              }`}
            >
              {getRatingText()}
            </div>

            {/* Pass / Fail Status Badge */}
            <div
              className={`mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider ${
                isPassed
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border border-amber-200'
              }`}
            >
              {isPassed ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>PASSED</span>
                </>
              ) : (
                <>
                  <AlertTriangle size={16} className="text-amber-600" />
                  <span>NOT PASSED</span>
                </>
              )}
            </div>

            {/* Guidance Message */}
            <p className="text-xs text-slate-500 mt-2 font-medium">
              {isPassed
                ? 'Great job! You can move to the next item.'
                : 'Keep practicing! Reach 75 points to master this item.'}
            </p>
          </div>

          {/* Metric Breakdown Bars */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 flex flex-col gap-2.5">
            {metricBars.map((item) => (
              <div key={item.label} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span>{item.label}</span>
                  <span className="font-mono text-slate-900">{item.value}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.value >= 75
                        ? 'bg-emerald-500'
                        : item.value >= 60
                        ? 'bg-amber-500'
                        : 'bg-rose-400'
                    }`}
                    style={{ width: `${item.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Multi-Character Scores Breakdown (if applicable) */}
          {result.characterScores && result.characterScores.length > 1 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Character Breakdown:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {result.characterScores.map((c, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 ${
                      c.passed
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-800'
                        : 'bg-amber-50/70 border-amber-200 text-amber-800'
                    }`}
                  >
                    <span className="font-serif font-bold text-sm">{c.character}:</span>
                    <span className="font-mono">{c.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Feedback */}
          {result.feedback && result.feedback.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs text-amber-900 flex flex-col gap-1">
              <span className="font-bold uppercase tracking-wider text-[10px] text-amber-700">
                Evaluation Feedback:
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-amber-900/90 font-medium">
                {result.feedback.map((f, i) => (
                  <li key={i}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Attempts History */}
          {attempts.length > 0 && (
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-1 text-[11px]">
              <span className="font-bold text-slate-400 uppercase tracking-wider">
                Attempt History:
              </span>
              <div className="flex items-center gap-2 flex-wrap">
                {attempts.map((att) => (
                  <span
                    key={att.attemptNumber}
                    className={`px-2.5 py-1 rounded-md font-mono font-medium ${
                      att.passed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Attempt {att.attemptNumber}: {att.score}
                  </span>
                ))}
                <span className="text-slate-400 font-semibold ml-auto">
                  {isPassed ? 'Final: Passed ✅' : 'Final: In Progress ⏳'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          {isPassed ? (
            <>
              <button
                type="button"
                onClick={onTryAgain}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Try Again</span>
              </button>
              <button
                type="button"
                onClick={onNext}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-md shadow-emerald-200 transition-all cursor-pointer"
              >
                <span>Next</span>
                <ArrowRight size={16} />
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onSkip}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <SkipForward size={15} />
                <span>Skip</span>
              </button>
              <button
                type="button"
                onClick={onTryAgain}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 shadow-md shadow-rose-200 transition-all cursor-pointer"
              >
                <RotateCcw size={15} />
                <span>Try Again</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
