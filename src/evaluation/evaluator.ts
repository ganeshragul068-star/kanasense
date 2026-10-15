import type { RecordedStroke } from '../types/learning';
import type {
  CharacterReferenceData,
  CharacterScoreItem,
  EvaluationScoreBreakdown,
  PreprocessedDrawing,
  ScoringWeights,
} from '../types/evaluation';
import { DEFAULT_SCORING_WEIGHTS } from '../types/evaluation';
import {
  preprocessUserStrokes,
  clusterMultiCharacterStrokes,
} from './preprocessor';
import {
  getReferenceDataForCharacter,
  getReferenceDataForWord,
} from './referenceData';

const PASS_SCORE_THRESHOLD = 75;

/**
 * Calculates Euclidean distance between two points.
 */
function distance(p1: { x: number; y: number }, p2: { x: number; y: number }): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Normalizes an angle difference to [0, PI].
 */
function angleDifference(a1: number, a2: number): number {
  let diff = Math.abs(a1 - a2);
  while (diff > Math.PI) diff = Math.abs(2 * Math.PI - diff);
  return diff;
}

/**
 * Evaluates a single character's preprocessed drawing against reference stroke data.
 */
function evaluateSingleCharacter(
  drawing: PreprocessedDrawing,
  ref: CharacterReferenceData,
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS,
  isFreeStyle = false
): EvaluationScoreBreakdown {
  const feedback: string[] = [];

  const userStrokes = drawing.strokes;
  const refStrokes = ref.strokes;
  const uCount = userStrokes.length;
  const rCount = refStrokes.length;

  // 1. ==================== SHAPE SIMILARITY (Weight: 30%) ====================
  let totalShapeDistance = 0;
  let comparedStrokeCount = 0;

  const minStrokes = Math.min(uCount, rCount);

  for (let i = 0; i < minStrokes; i++) {
    const uStroke = userStrokes[i];
    const rStroke = refStrokes[i];
    const pCount = Math.min(uStroke.resampledPoints.length, rStroke.points.length);

    let strokeDist = 0;
    for (let p = 0; p < pCount; p++) {
      strokeDist += distance(uStroke.resampledPoints[p], rStroke.points[p]);
    }
    const avgStrokeDist = strokeDist / Math.max(1, pCount);
    totalShapeDistance += avgStrokeDist;
    comparedStrokeCount++;
  }

  const avgDistance = comparedStrokeCount > 0 ? totalShapeDistance / comparedStrokeCount : 0.4;
  // Increased tolerance for free-style (real-world variability allowed)
  const maxTolerance = isFreeStyle ? 0.45 : 0.32;
  let rawShapeScore = Math.max(0, 100 * (1 - avgDistance / maxTolerance));

  // Stroke count disparity factor — less harsh than before
  if (uCount !== rCount) {
    const ratio = Math.min(uCount, rCount) / Math.max(uCount, rCount);
    rawShapeScore *= Math.max(0.72, ratio); // was 0.65
  }
  const shapeScore = Math.round(Math.min(100, Math.max(0, rawShapeScore)));

  // 2. ==================== STROKE DIRECTION & ORDER (Weight: 20%) ====================
  let totalAngleScore = 0;
  let angleEvaluated = 0;

  for (let i = 0; i < minStrokes; i++) {
    const uAngle = userStrokes[i].directionAngle;
    const rAngle = refStrokes[i].directionAngle;
    const diff = angleDifference(uAngle, rAngle);
    // Wider angular tolerance in free-style
    const tolerance = isFreeStyle ? Math.PI * 0.85 : Math.PI * 0.75;
    const angleScore = Math.max(0, 100 * (1 - diff / tolerance));
    totalAngleScore += angleScore;
    angleEvaluated++;
  }

  const directionScore = angleEvaluated > 0 ? totalAngleScore / angleEvaluated : 55;

  let orderConsistencyScore = 100;
  if (uCount >= 2 && rCount >= 2) {
    const d00 = distance(userStrokes[0].startPoint, refStrokes[0].startPoint);
    const d01 = distance(userStrokes[0].startPoint, refStrokes[1].startPoint);
    if (d01 < d00 * 0.5) {
      orderConsistencyScore = isFreeStyle ? 75 : 60; // less harsh in free-style
      feedback.push('Stroke order appears inverted; check canonical stroke sequence.');
    }
  }

  const strokeScore = Math.round(
    Math.min(100, Math.max(0, 0.7 * directionScore + 0.3 * orderConsistencyScore))
  );

  if (directionScore < 55) {
    feedback.push('Stroke direction needs improvement.');
  }

  // 3. ==================== POSITION (Weight: 15%) ====================
  const deltaX = drawing.centerOfMass.x - ref.centerOfMass.x;
  const deltaY = drawing.centerOfMass.y - ref.centerOfMass.y;
  const posDisplacement = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

  const posTolerance = isFreeStyle ? 0.40 : 0.28;
  const positionScore = Math.round(
    Math.min(100, Math.max(0, 100 * (1 - posDisplacement / posTolerance)))
  );

  if (deltaX > 0.10) feedback.push('Your writing is shifted to the right.');
  else if (deltaX < -0.10) feedback.push('Your writing is shifted to the left.');
  if (deltaY > 0.10) feedback.push('Your writing is positioned slightly too low.');
  else if (deltaY < -0.10) feedback.push('Your writing is positioned slightly too high.');

  // 4. ==================== SIZE / PROPORTION (Weight: 15%) ====================
  const uW = drawing.boundingBox.width;
  const uH = drawing.boundingBox.height;
  const rW = Math.max(0.1, ref.boundingBox.maxX - ref.boundingBox.minX);
  const rH = Math.max(0.1, ref.boundingBox.maxY - ref.boundingBox.minY);

  const widthRatio = Math.min(uW, rW) / Math.max(uW, rW);
  const heightRatio = Math.min(uH, rH) / Math.max(uH, rH);
  const uAspect = uW / Math.max(0.01, uH);
  const rAspect = rW / Math.max(0.01, rH);
  const aspectRatio = Math.min(uAspect, rAspect) / Math.max(uAspect, rAspect);

  const sizeScore = Math.round(
    Math.min(100, Math.max(0, 100 * (0.4 * widthRatio + 0.4 * heightRatio + 0.2 * aspectRatio)))
  );

  if (uW > rW * 1.45 || uH > rH * 1.45) {
    feedback.push('Your character is slightly too large.');
  } else if (uW < rW * 0.55 || uH < rH * 0.55) {
    feedback.push('Your character is slightly too small.');
  }

  // 5. ==================== START / END POINT ACCURACY (Weight: 10%) ====================
  let totalTerminalDist = 0;
  let terminalCount = 0;

  for (let i = 0; i < minStrokes; i++) {
    const dStart = distance(userStrokes[i].startPoint, refStrokes[i].startPoint);
    const dEnd = distance(userStrokes[i].endPoint, refStrokes[i].endPoint);
    totalTerminalDist += (dStart + dEnd) / 2;
    terminalCount++;
  }

  const avgTerminalDist = terminalCount > 0 ? totalTerminalDist / terminalCount : 0.35;
  const terminalTolerance = isFreeStyle ? 0.40 : 0.32;
  const startEndScore = Math.round(
    Math.min(100, Math.max(0, 100 * (1 - avgTerminalDist / terminalTolerance)))
  );

  // 6. ==================== OVERALL STROKE STRUCTURE (Weight: 10%) ====================
  let countScore = 100;
  if (uCount !== rCount) {
    const diff = Math.abs(uCount - rCount);
    // More forgiving count penalty in free-style
    countScore = Math.max(25, 100 - diff * (isFreeStyle ? 25 : 35));
    feedback.push(`Expected ${rCount} stroke${rCount > 1 ? 's' : ''}, but ${uCount} drawn.`);
  }

  let lengthPropScore = 100;
  if (minStrokes >= 2) {
    const uL0 = userStrokes[0].length;
    const uL1 = userStrokes[1].length;
    const rL0 = refStrokes[0].length;
    const rL1 = refStrokes[1].length;

    if (rL1 > rL0 && uL1 < uL0 * 0.8) {
      lengthPropScore = isFreeStyle ? 75 : 65;
      feedback.push('Your second stroke is too short relative to the first.');
    } else if (rL0 > rL1 && uL0 < uL1 * 0.8) {
      lengthPropScore = isFreeStyle ? 75 : 65;
      feedback.push('Your first stroke is too short relative to the second.');
    }
  }

  const structureScore = Math.round(
    Math.min(100, Math.max(0, 0.65 * countScore + 0.35 * lengthPropScore))
  );

  // ==================== FINAL SCORE CALCULATION ====================
  const finalScoreRaw =
    shapeScore * weights.shapeSimilarity +
    strokeScore * weights.strokeDirectionOrder +
    positionScore * weights.position +
    sizeScore * weights.sizeProportion +
    startEndScore * weights.startEndPoint +
    structureScore * weights.strokeStructure;

  // Apply a gentle free-style bonus (+8 pts max) to reward genuine attempts
  const freeStyleBonus = isFreeStyle ? Math.min(8, finalScoreRaw * 0.08) : 0;
  const finalScore = Math.min(100, Math.max(0, Math.round(finalScoreRaw + freeStyleBonus)));
  const passed = finalScore >= PASS_SCORE_THRESHOLD;

  // Feedback messages with quality bands
  if (finalScore >= 85 && feedback.length === 0) {
    feedback.push('Excellent! Beautiful stroke balance and proportions.');
  } else if (finalScore >= 70 && feedback.length === 0) {
    feedback.push('Good — your character is recognizable and well-formed.');
  } else if (finalScore >= 50 && feedback.length === 0) {
    feedback.push('Keep practising — the shape is almost there.');
  } else if (finalScore < 50 && feedback.length === 0) {
    feedback.push('Try again — focus on the stroke direction and position.');
  }

  return {
    finalScore,
    passed,
    shapeScore,
    strokeScore,
    positionScore,
    sizeScore,
    startEndScore,
    structureScore,
    feedback: feedback.slice(0, 3),
    weights,
    evaluatedAt: Date.now(),
  };
}


/**
 * Main handwriting evaluation engine for KanaSense.
 * Supports:
 * - Anti-cheat and empty/insufficient stroke validation
 * - Single characters (Hiragana, Katakana, Numbers, Kanji)
 * - Multi-character Japanese words (e.g. ありがとう, 日本, 食べ物)
 * - Trace Mode and Free Style writing modes
 * - Deterministic, non-random 0–100 score calculation
 */
export function evaluateHandwriting(
  strokes: RecordedStroke[],
  target: string,
  canvasWidth: number,
  canvasHeight: number,
  mode: 'trace' | 'free' = 'trace',
  weights: ScoringWeights = DEFAULT_SCORING_WEIGHTS
): {
  success: boolean;
  validationError?: string;
  result?: EvaluationScoreBreakdown;
} {
  // 1. Initial validation
  const preprocessed = preprocessUserStrokes(strokes, canvasWidth, canvasHeight);
  if (!preprocessed.isValid) {
    return {
      success: false,
      validationError: preprocessed.validationError || 'Please write before checking.',
    };
  }

  const cleanTarget = target.trim();
  const charArray = Array.from(cleanTarget);
  const charCount = charArray.length;
  const isFreeStyle = mode === 'free';

  // Single character evaluation
  if (charCount <= 1) {
    const ref = getReferenceDataForCharacter(cleanTarget);
    const breakdown = evaluateSingleCharacter(preprocessed, ref, weights, isFreeStyle);
    return {
      success: true,
      result: breakdown,
    };
  }

  // Multi-character word evaluation
  const refList = getReferenceDataForWord(cleanTarget);
  const drawingClusters = clusterMultiCharacterStrokes(
    strokes,
    charCount,
    canvasWidth,
    canvasHeight
  );

  const characterScores: CharacterScoreItem[] = [];
  let sumFinal = 0;
  let sumShape = 0;
  let sumStroke = 0;
  let sumPos = 0;
  let sumSize = 0;
  let sumStartEnd = 0;
  let sumStruct = 0;
  const combinedFeedback: string[] = [];

  for (let i = 0; i < charCount; i++) {
    const char = charArray[i];
    const charDrawing = drawingClusters[i] || preprocessed;
    const charRef = refList[i];

    const singleResult = evaluateSingleCharacter(charDrawing, charRef, weights, isFreeStyle);

    characterScores.push({
      character: char,
      score: singleResult.finalScore,
      passed: singleResult.passed,
    });

    sumFinal += singleResult.finalScore;
    sumShape += singleResult.shapeScore;
    sumStroke += singleResult.strokeScore;
    sumPos += singleResult.positionScore;
    sumSize += singleResult.sizeScore;
    sumStartEnd += singleResult.startEndScore;
    sumStruct += singleResult.structureScore;

    if (singleResult.feedback.length > 0 && combinedFeedback.length < 3) {
      combinedFeedback.push(`[${char}]: ${singleResult.feedback[0]}`);
    }
  }

  const finalScore = Math.round(sumFinal / charCount);
  const passed = finalScore >= PASS_SCORE_THRESHOLD;

  if (passed && combinedFeedback.length === 0) {
    combinedFeedback.push('Great overall word composition and balance!');
  }

  const multiResult: EvaluationScoreBreakdown = {
    finalScore,
    passed,
    shapeScore: Math.round(sumShape / charCount),
    strokeScore: Math.round(sumStroke / charCount),
    positionScore: Math.round(sumPos / charCount),
    sizeScore: Math.round(sumSize / charCount),
    startEndScore: Math.round(sumStartEnd / charCount),
    structureScore: Math.round(sumStruct / charCount),
    feedback: combinedFeedback.slice(0, 3),
    characterScores,
    weights,
    evaluatedAt: Date.now(),
  };

  return {
    success: true,
    result: multiResult,
  };
}
