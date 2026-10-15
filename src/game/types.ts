import type { LevelId, LearningItem } from '../types/learning';

// ── Studied-Range Session Configuration ─────────────────────────────────────

export type BeginnerContentType = 'hiragana' | 'katakana' | 'numbers';
export type NumberRangeKey = '1-10' | '1-20' | '1-100';

/**
 * The single source of truth for what material the player has studied.
 * Passed from StudiedRangeModal → GameEngine → QuestionGenerator so that
 * every generated question is drawn strictly from the selected subset.
 */
export interface GameSessionConfig {
  level: LevelId;
  /** Beginner content type */
  beginnerType: BeginnerContentType;
  /** Selected character IDs (hiragana/katakana) */
  selectedCharacterIds: string[];
  /** Number range shortcut for beginner numbers */
  selectedNumberRange: NumberRangeKey;
  /** Selected topic category IDs for intermediate */
  selectedTopicIds: string[];
  /** Fine-grained intermediate item IDs (overrides topic if non-empty) */
  selectedIntermediateItemIds: string[];
  /** Selected vocabulary band IDs for advanced */
  selectedBands: string[];
  /** Fine-grained advanced item IDs (overrides bands if non-empty) */
  selectedAdvancedItemIds: string[];
  avatarId: AvatarId;
}

export function createDefaultSessionConfig(): GameSessionConfig {
  return {
    level: 'beginner',
    beginnerType: 'hiragana',
    selectedCharacterIds: [
      'hiragana-a',
      'hiragana-i',
      'hiragana-u',
      'hiragana-e',
      'hiragana-o',
    ],
    selectedNumberRange: '1-10',
    selectedTopicIds: ['countries'],
    selectedIntermediateItemIds: [],
    selectedBands: ['basic-words'],
    selectedAdvancedItemIds: [],
    avatarId: 'user',
  };
}

export type GameState =
  | 'IDLE'
  | 'AVATAR_SELECT'
  | 'READY'
  | 'RUNNING'
  | 'QUESTION'
  | 'SUCCESS'
  | 'COLLISION'
  | 'PAUSED'
  | 'GAME_OVER'
  | 'COMPLETE';

export type AvatarId = 'user' | 'shinchan' | 'doraemon' | 'naruto';

export interface AvatarOption {
  id: AvatarId;
  name: string;
  japaneseName: string;
  title: string;
  description: string;
  color: string;
  borderColor: string;
  badge: string;
  isCustomAsset: boolean;
  imagePath: string;
  /** Background image for this avatar's game world. Falls back to default environment if missing. */
  backgroundPath: string;
}

export type ObstacleDifficulty = 'easy' | 'medium' | 'hard';

export type ObstacleQuestionType = 'multiple_choice' | 'writing' | 'hard_challenge';

export interface ObstacleDef {
  id: string;
  name: string;
  col?: number;
  row?: number;
  ground: boolean;
  aerial?: boolean;
  rolling?: boolean;
  tall?: boolean;
  difficulty: ObstacleDifficulty;
  questionType: ObstacleQuestionType;
  width: number;
  height: number;
  imagePath: string;
  hitboxPadding?: {
    x: number;
    y: number;
  };
}

export interface ObstacleInstance {
  uid: number;
  def: ObstacleDef;
  x: number;
  y: number;
  width: number;
  height: number;
  speedMultiplier: number;
  rotation: number;
  waveOffset: number;
  cleared: boolean;
  passed: boolean;
  hit: boolean;
  questionTriggered: boolean;
  encounterHandled: boolean;
  /** True for jumpable obstacles in the normal-gameplay sequence */
  isNormalObstacle: boolean;
}

export interface PlayerState {
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
  isGrounded: boolean;
  isJumping: boolean;
  invulnerableTime: number; // seconds remaining
  runAnimTime: number;
  bobOffset: number;
}

/** Per-difficulty statistics accumulated during a session */
export interface DifficultyStats {
  attempted: number;
  correct: number;
  wrong: number;
}

/** A single recorded mistake for the end-of-game report */
export interface MistakeRecord {
  questionId: string;
  japanese: string;
  romaji: string;
  meaning: string;
  playerAnswer: string;
  correctAnswer: string;
  difficulty: ObstacleDifficulty;
  level: LevelId;
  prompt: string;
  explanation: string;
  /** True if this was a writing question */
  isWriting: boolean;
  writingScore?: number;
}

export interface GameHUDStats {
  score: number;
  lives: number;
  streak: number;
  bestStreak: number;
  speedPercent: number;
  xp: number;
  obstaclesCleared: number;
  totalEncountered: number;
  correctAnswers: number;
  incorrectAnswers: number;
  currentDifficulty: ObstacleDifficulty;
  consecutiveCorrect: number;
  consecutiveWrong: number;
  difficultyNotice: string | null;
  highestDifficulty: ObstacleDifficulty;
  totalCollisions: number;
  writingChallengesAttempted: number;
  /** Per-difficulty breakdown for end-of-game report */
  difficultyStats: {
    easy: DifficultyStats;
    medium: DifficultyStats;
    hard: DifficultyStats;
  };
  /** Recorded mistakes (capped at 20 for memory) */
  mistakes: MistakeRecord[];
}

export interface GameConfig {
  baseSpeed: number; // virtual px per sec at 100% speed
  minSpeedPercent: number; // 70%
  maxSpeedPercent: number; // 180%
  speedStepCorrect: number; // +5%
  speedStepCollision: number; // -15%
  gravity: number; // px/s^2
  jumpForce: number; // px/s
  virtualWidth: number;
  virtualHeight: number;
  groundY: number; // baseline Y coordinate for player's feet
  gameWritingPassThreshold: number; // configurable recognition threshold for in-game writing
  consecutiveCorrectToAdvance: number; // 4 consecutive correct answers to advance difficulty
  consecutiveWrongToDowngrade: number; // 2 consecutive wrong answers to downgrade difficulty
  scoreRewards: Record<LevelId, number>; // Beginner: +10, Intermediate: +15, Advanced: +20
  hardQuestionTimerSeconds: number; // configurable timer for HARD questions
  /** Min normal (jumpable) obstacles between question rounds */
  minNormalObstaclesBetweenQuestions: number;
  /** Max normal (jumpable) obstacles between question rounds */
  maxNormalObstaclesBetweenQuestions: number;
  /** Writing answer bonus game-score points */
  writingScoreBonus: number;
}

export interface Hitbox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GameQuestion {
  id: string;
  level: LevelId;
  difficulty: ObstacleDifficulty;
  obstacleName: string;
  obstacleId: string;
  interactionType: 'multiple_choice' | 'writing';
  prompt: string;
  subPrompt?: string;
  displayHighlight?: string;
  audioText?: string;
  options?: string[];
  correctAnswer: string;
  targetItem: LearningItem;
  explanation: string;
  categoryLabel: string;
  timerSeconds?: number;
}

export interface AnswerValidationResult {
  isCorrect: boolean;
  score?: number;
  feedbackMessage: string;
  correctAnswerDisplay: string;
  explanation: string;
  /** The answer the player actually gave (for mistake log) */
  playerAnswer?: string;
}
