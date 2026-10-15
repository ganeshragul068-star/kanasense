import { evaluateHandwriting } from '../evaluation/evaluator';
import type { RecordedStroke } from '../types/learning';
import type { GameQuestion, AnswerValidationResult } from './types';

/**
 * Configurable gameplay recognition threshold for free-style handwriting challenges.
 * Separate from the strict 75% learning mastery threshold.
 */
export const DEFAULT_GAME_WRITING_PASS_THRESHOLD = 50;

/** Feedback message based on handwriting score */
function getWritingFeedback(score: number, passThreshold: number): string {
  if (score >= 85) return `Excellent! Score: ${score}/100 — Beautiful stroke form!`;
  if (score >= 70) return `Good! Score: ${score}/100 — Character is well-formed.`;
  if (score >= passThreshold) return `Keep practising! Score: ${score}/100 — Recognizable but needs work.`;
  if (score >= 30) return `Try again! Score: ${score}/100 — Focus on stroke direction and position.`;
  return `Score: ${score}/100 — The drawing was too different from the expected character.`;
}

export class AnswerValidator {
  /**
   * Validates a multiple-choice selection against the stored correctAnswer
   */
  public static validateMultipleChoice(
    question: GameQuestion,
    selectedOption: string
  ): AnswerValidationResult {
    const isCorrect = selectedOption.trim() === question.correctAnswer.trim();

    return {
      isCorrect,
      playerAnswer: selectedOption,
      feedbackMessage: isCorrect
        ? 'Correct! Obstacle cleared!'
        : `Incorrect! Expected "${question.correctAnswer}".`,
      correctAnswerDisplay: `${question.targetItem.japanese} (${question.targetItem.romaji}${
        question.targetItem.meaning ? ` — ${question.targetItem.meaning}` : ''
      })`,
      explanation: question.explanation,
    };
  }

  /**
   * Validates a free-style handwriting submission using the deterministic stroke evaluator
   */
  public static validateHandwriting(
    question: GameQuestion,
    strokes: RecordedStroke[],
    canvasWidth: number,
    canvasHeight: number,
    passThreshold: number = DEFAULT_GAME_WRITING_PASS_THRESHOLD
  ): AnswerValidationResult {
    const evalResponse = evaluateHandwriting(
      strokes,
      question.correctAnswer,
      canvasWidth,
      canvasHeight,
      'free'
    );

    if (!evalResponse.success || !evalResponse.result) {
      return {
        isCorrect: false,
        score: 0,
        playerAnswer: '(drawing too incomplete)',
        feedbackMessage:
          evalResponse.validationError ||
          'Drawing was too incomplete to recognize.',
        correctAnswerDisplay: `${question.targetItem.japanese} (${question.targetItem.romaji}${
          question.targetItem.meaning ? ` — ${question.targetItem.meaning}` : ''
        })`,
        explanation: question.explanation,
      };
    }

    const score = evalResponse.result.finalScore;
    const isCorrect = score >= passThreshold;

    return {
      isCorrect,
      score,
      playerAnswer: `(handwriting, score: ${score}%)`,
      feedbackMessage: getWritingFeedback(score, passThreshold),
      correctAnswerDisplay: `${question.targetItem.japanese} (${question.targetItem.romaji}${
        question.targetItem.meaning ? ` — ${question.targetItem.meaning}` : ''
      })`,
      explanation: question.explanation,
    };
  }
}
