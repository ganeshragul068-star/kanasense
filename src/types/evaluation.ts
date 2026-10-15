import type { PracticeMode } from './learning';

export interface ReferencePoint {
  x: number; // normalized [0, 1] relative to standard character box
  y: number; // normalized [0, 1] relative to standard character box
}

export interface ReferenceStroke {
  strokeIndex: number;
  points: ReferencePoint[];
  startPoint: ReferencePoint;
  endPoint: ReferencePoint;
  directionAngle: number; // radians [-PI, PI]
  length: number; // normalized arc length
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export interface CharacterReferenceData {
  character: string;
  strokeCount: number;
  strokes: ReferenceStroke[];
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
  centerOfMass: ReferencePoint;
}

export interface NormalizedStroke {
  strokeIndex: number;
  rawPointsCount: number;
  resampledPoints: ReferencePoint[]; // Equidistantly sampled normalized points [0, 1]
  startPoint: ReferencePoint;
  endPoint: ReferencePoint;
  directionAngle: number;
  length: number;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export interface PreprocessedDrawing {
  strokes: NormalizedStroke[];
  totalStrokeCount: number;
  totalPointsCount: number;
  boundingBox: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    width: number;
    height: number;
  };
  centerOfMass: ReferencePoint;
  isValid: boolean;
  validationError?: string;
}

export interface ScoringWeights {
  shapeSimilarity: number;      // Suggested: 30%
  strokeDirectionOrder: number; // Suggested: 20%
  position: number;             // Suggested: 15%
  sizeProportion: number;       // Suggested: 15%
  startEndPoint: number;        // Suggested: 10%
  strokeStructure: number;      // Suggested: 10%
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  shapeSimilarity: 0.30,
  strokeDirectionOrder: 0.20,
  position: 0.15,
  sizeProportion: 0.15,
  startEndPoint: 0.10,
  strokeStructure: 0.10,
};

export interface CharacterScoreItem {
  character: string;
  score: number;
  passed: boolean;
}

export interface EvaluationScoreBreakdown {
  finalScore: number;          // 0–100 integer
  passed: boolean;              // finalScore >= 75
  shapeScore: number;           // 0–100
  strokeScore: number;          // 0–100 (direction & order)
  positionScore: number;        // 0–100
  sizeScore: number;            // 0–100
  startEndScore: number;        // 0–100
  structureScore: number;       // 0–100
  feedback: string[];           // Supported diagnostic feedback
  characterScores?: CharacterScoreItem[]; // Per-character scores for multi-character words
  weights: ScoringWeights;
  evaluatedAt: number;
}

export interface AttemptEntry {
  attemptNumber: number;
  score: number;
  passed: boolean;
  timestamp: number;
}

export interface MasteredItemRecord {
  itemId: string;
  character: string;
  score: number;
  completedAt: number;
  attemptsCount: number;
  mode: PracticeMode;
  scoresHistory: number[];
}

export interface SkippedItemRecord {
  itemId: string;
  character: string;
  lastScore: number;
  skippedAt: number;
  attemptsCount: number;
}

export interface ItemAttemptHistory {
  itemId: string;
  attempts: AttemptEntry[];
}
