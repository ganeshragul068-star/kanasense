import React, { useState, useEffect, useRef } from 'react';
import {
  PenTool,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  RotateCcw,
  BookOpen,
  Star,
} from 'lucide-react';
import type { RecordedStroke } from '../../types/learning';
import type { GameQuestion, AnswerValidationResult } from '../../game/types';
import {
  AnswerValidator,
  DEFAULT_GAME_WRITING_PASS_THRESHOLD,
} from '../../game/AnswerValidator';
import { PracticeCanvas } from '../practice/PracticeCanvas';
import { AudioButton } from '../common/AudioButton';
import { StrokeOrderPanel } from './StrokeOrderPanel';

interface WritingChallengeProps {
  question: GameQuestion;
  passThreshold?: number;
  onComplete: (result: AnswerValidationResult) => void;
  /** Bonus game-score points awarded for a correct writing answer */
  writingScoreBonus?: number;
}

export const WritingChallenge: React.FC<WritingChallengeProps> = ({
  question,
  passThreshold = DEFAULT_GAME_WRITING_PASS_THRESHOLD,
  onComplete,
  writingScoreBonus = 25,
}) => {
  const [validationResult, setValidationResult] =
    useState<AnswerValidationResult | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isSubmittedRef = useRef(false);
  const [clearTrigger, setClearTrigger] = useState(0);
  const [hasRetried, setHasRetried] = useState(false);
  const [showStrokeOrder, setShowStrokeOrder] = useState(false);

  const isHard = question.difficulty === 'hard';
  const initialTimer = isHard ? question.timerSeconds ?? 25 : null;
  const [secondsLeft, setSecondsLeft] = useState<number | null>(initialTimer);

  useEffect(() => {
    if (secondsLeft === null || isSubmitted) return;

    if (secondsLeft <= 0) {
      if (!isSubmittedRef.current) {
        isSubmittedRef.current = true;
        setIsSubmitted(true);
        const timeoutResult: AnswerValidationResult = {
          isCorrect: false,
          score: 0,
          playerAnswer: '(time expired)',
          feedbackMessage: 'Time expired before submission.',
          correctAnswerDisplay: `${question.targetItem.japanese} (${question.targetItem.romaji})`,
          explanation: question.explanation,
        };
        setValidationResult(timeoutResult);
        setTimeout(() => {
          onComplete(timeoutResult);
        }, 2200);
      }
      return;
    }

    const timerId = window.setTimeout(() => {
      setSecondsLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [secondsLeft, isSubmitted, question, onComplete]);

  const handleCheckStrokes = (
    strokes: RecordedStroke[],
    width: number,
    height: number
  ) => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setIsSubmitted(true);

    const result = AnswerValidator.validateHandwriting(
      question,
      strokes,
      width,
      height,
      passThreshold
    );
    setValidationResult(result);

    setTimeout(() => {
      onComplete(result);
    }, result.isCorrect ? 1500 : 2800);
  };

  const handleManualContinue = () => {
    if (validationResult) {
      onComplete(validationResult);
    }
  };

  /** Clear canvas and let the player try again (not counted as a wrong answer) */
  const handleRetry = () => {
    if (isSubmitted) return;
    setClearTrigger((n) => n + 1);
    setHasRetried(true);
  };

  /** Quality label for score */
  const getScoreLabel = (score: number) => {
    if (score >= 85) return { label: 'Excellent', color: 'text-emerald-600' };
    if (score >= 70) return { label: 'Good', color: 'text-teal-600' };
    if (score >= 50) return { label: 'Keep Practising', color: 'text-amber-600' };
    return { label: 'Try Again', color: 'text-rose-600' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden text-slate-900 my-auto max-h-[96dvh] flex flex-col">
        {/* Top Banner */}
        <div className="px-3 py-2 sm:px-5 sm:py-3.5 bg-gradient-to-r from-indigo-600 via-violet-600 to-rose-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <PenTool className="w-5 h-5 text-amber-200 shrink-0" />
            <div>
              <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest opacity-90">
                {question.difficulty.toUpperCase()} QUESTION •{' '}
                {question.obstacleName}
              </div>
              <div className="text-xs sm:text-sm font-bold">
                {question.categoryLabel}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {secondsLeft !== null && (
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-extrabold ${
                  secondsLeft <= 5
                    ? 'bg-rose-950 text-rose-200 animate-pulse'
                    : 'bg-black/25 text-white'
                }`}
              >
                <Clock size={12} />
                {secondsLeft}s
              </span>
            )}
            <span className="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider">
              {question.level}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3.5">
          {/* Prompt & Audio */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="text-center sm:text-left">
              <h3 className="text-sm sm:text-lg font-extrabold text-slate-900">
                {question.prompt}
              </h3>
              {question.subPrompt && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {question.subPrompt}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {question.displayHighlight && (
                <span className="px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 font-black text-base sm:text-lg font-mono">
                  {question.displayHighlight}
                </span>
              )}
              {question.audioText && (
                <AudioButton
                  text={question.audioText}
                  size="sm"
                  showLabel
                  label="Listen"
                />
              )}
            </div>
          </div>

          {/* Writing Reward Banner */}
          {!isSubmitted && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold">
              <Star size={13} className="text-amber-500" />
              <span>Correct answer earns <strong>+{writingScoreBonus} bonus points</strong>!</span>
            </div>
          )}

          {/* Feedback Result Banner */}
          {validationResult && (
            <div
              className={`p-3.5 rounded-2xl border flex flex-col gap-2.5 animate-in fade-in duration-150 ${
                validationResult.isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  {validationResult.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs sm:text-sm space-y-1">
                    <div className="font-extrabold">
                      {validationResult.feedbackMessage}
                    </div>
                    <div className="text-slate-700 font-semibold">
                      Expected: {validationResult.correctAnswerDisplay}
                    </div>
                    <div className="text-slate-600">
                      {validationResult.explanation}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleManualContinue}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <span>Continue</span>
                  <ArrowRight size={13} />
                </button>
              </div>

              {/* Score display */}
              {validationResult.score !== undefined && (
                <div className="flex items-center gap-3 pt-1 border-t border-current/10">
                  <div className="text-xs font-bold">Handwriting Score:</div>
                  <div className="flex items-center gap-1.5">
                    <div className="relative w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`absolute inset-y-0 left-0 rounded-full transition-all ${
                          validationResult.isCorrect ? 'bg-emerald-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${validationResult.score}%` }}
                      />
                    </div>
                    <span className={`text-xs font-black ${getScoreLabel(validationResult.score).color}`}>
                      {validationResult.score}/100 — {getScoreLabel(validationResult.score).label}
                    </span>
                  </div>
                </div>
              )}

              {/* Writing bonus confirmation */}
              {validationResult.isCorrect && (
                <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <Star size={12} />
                  <span>+{writingScoreBonus} bonus game points awarded!</span>
                </div>
              )}
            </div>
          )}

          {/* Handwriting Canvas */}
          <div className={isSubmitted ? 'pointer-events-none opacity-75' : ''}>
            <PracticeCanvas
              targetCharacter={question.correctAnswer}
              romaji={question.targetItem.romaji}
              currentMode="free"
              allowedModes={['free']}
              level={question.level}
              submitLabel="Submit"
              clearTrigger={clearTrigger}
              onCheck={handleCheckStrokes}
            />
          </div>

          {/* Retry button (before submission only) */}
          {!isSubmitted && (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={handleRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Clear & try again{hasRetried ? ' (no penalty)' : ''}</span>
              </button>
            </div>
          )}

          {/* Stroke order help (shown on wrong answer for kana characters) */}
          {validationResult && !validationResult.isCorrect && question.correctAnswer.length === 1 && (
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowStrokeOrder(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <BookOpen size={13} />
                <span>Learn Stroke Order for "{question.correctAnswer}"</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stroke Order Panel overlay (compact / in-game mode) */}
      {showStrokeOrder && (
        <StrokeOrderPanel
          character={question.correctAnswer}
          compact
          onClose={() => setShowStrokeOrder(false)}
        />
      )}
    </div>
  );
};
