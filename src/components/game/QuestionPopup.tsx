import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import type { GameQuestion, AnswerValidationResult } from '../../game/types';
import { AnswerValidator } from '../../game/AnswerValidator';
import { AudioButton } from '../common/AudioButton';

interface QuestionPopupProps {
  question: GameQuestion;
  onComplete: (result: AnswerValidationResult) => void;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export const QuestionPopup: React.FC<QuestionPopupProps> = ({
  question,
  onComplete,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [validationResult, setValidationResult] =
    useState<AnswerValidationResult | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const isSubmittedRef = useRef(false);

  const isHard = question.difficulty === 'hard';
  const initialTimer = isHard ? question.timerSeconds ?? 20 : null;
  const [secondsLeft, setSecondsLeft] = useState<number | null>(initialTimer);

  useEffect(() => {
    if (secondsLeft === null || isSubmitted) return;

    if (secondsLeft <= 0) {
      if (!isSubmittedRef.current) {
        isSubmittedRef.current = true;
        setIsSubmitted(true);
        const timeoutResult: AnswerValidationResult = {
          isCorrect: false,
          playerAnswer: '(time expired)',
          feedbackMessage: `Time's up! Expected "${question.correctAnswer}".`,
          correctAnswerDisplay: `${question.targetItem.japanese} (${question.targetItem.romaji})`,
          explanation: question.explanation,
        };
        setValidationResult(timeoutResult);
        setTimeout(() => {
          onComplete(timeoutResult);
        }, 2000);
      }
      return;
    }

    const timerId = window.setTimeout(() => {
      setSecondsLeft((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [secondsLeft, isSubmitted, question, onComplete]);

  const handleSelectOption = (option: string) => {
    if (isSubmittedRef.current) return;
    isSubmittedRef.current = true;
    setIsSubmitted(true);
    setSelectedOption(option);

    const result = AnswerValidator.validateMultipleChoice(question, option);
    setValidationResult(result);

    setTimeout(() => {
      onComplete(result);
    }, result.isCorrect ? 950 : 2000);
  };

  const handleManualContinue = () => {
    if (validationResult) {
      onComplete(validationResult);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-slate-200 overflow-hidden text-slate-900 max-h-[96dvh] flex flex-col my-auto">
        {/* Top Banner */}
        <div
          className={`px-3 py-2.5 sm:px-5 sm:py-3.5 text-white flex items-center justify-between shrink-0 ${
            isHard
              ? 'bg-gradient-to-r from-rose-700 via-red-600 to-amber-600'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600'
          }`}
        >
          <div className="flex items-center gap-2">
            {isHard ? (
              <ShieldAlert className="w-5 h-5 text-amber-200 shrink-0" />
            ) : (
              <Sparkles className="w-5 h-5 text-emerald-200 shrink-0" />
            )}
            <div>
              <div className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest opacity-90">
                {question.difficulty.toUpperCase()} OBSTACLE •{' '}
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

        {/* Question Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Prompt */}
          <div className="text-center space-y-1">
            <h3 className="text-base sm:text-xl font-extrabold text-slate-900 leading-snug">
              {question.prompt}
            </h3>
            {question.subPrompt && (
              <p className="text-xs text-slate-500 font-medium">
                {question.subPrompt}
              </p>
            )}
          </div>

          {/* Highlight Card + Audio Button */}
          {question.displayHighlight && (
            <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-wide font-serif">
                {question.displayHighlight}
              </div>
              {question.audioText && (
                <AudioButton
                  text={question.audioText}
                  size="sm"
                  showLabel
                  label="Listen"
                />
              )}
            </div>
          )}

          {/* Touch-Friendly Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {(question.options || []).map((option, idx) => {
              const label = OPTION_LABELS[idx] || String(idx + 1);
              const isSelected = selectedOption === option;
              const isCorrectOption = option === question.correctAnswer;

              let btnStyle =
                'border-slate-200 bg-white hover:border-rose-400 hover:bg-rose-50/40 text-slate-800';

              if (isSubmitted) {
                if (isCorrectOption) {
                  btnStyle =
                    'border-emerald-500 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400/50';
                } else if (isSelected && !isCorrectOption) {
                  btnStyle =
                    'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-400/50';
                } else {
                  btnStyle =
                    'border-slate-200 bg-slate-50 text-slate-400 opacity-60';
                }
              }

              return (
                <button
                  key={`${option}_${idx}`}
                  type="button"
                  disabled={isSubmitted}
                  onClick={() => handleSelectOption(option)}
                  className={`flex items-center gap-3 p-3.5 rounded-2xl border-2 text-left font-bold transition-all cursor-pointer disabled:cursor-default ${btnStyle}`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-extrabold shrink-0 ${
                      isSubmitted && isCorrectOption
                        ? 'bg-emerald-600 text-white'
                        : isSubmitted && isSelected && !isCorrectOption
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {label}
                  </span>
                  <span className="text-base sm:text-lg truncate flex-1">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Feedback Banner */}
          {validationResult && (
            <div
              className={`p-3.5 rounded-2xl border flex items-start justify-between gap-3 animate-in fade-in duration-150 ${
                validationResult.isCorrect
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
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
                  <div className="text-slate-700 font-medium">
                    {validationResult.explanation}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleManualContinue}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
