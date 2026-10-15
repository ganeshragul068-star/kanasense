export type LevelId = 'beginner' | 'intermediate' | 'advanced';

export type PracticeMode = 'trace' | 'free';

export type BeginnerCategory = 'hiragana' | 'katakana' | 'numbers';

export type IntermediateCategory =
  | 'countries'
  | 'dates'
  | 'days'
  | 'months'
  | 'years'
  | 'basic-vocabulary'
  | 'common-expressions';

export type AdvancedCategory =
  | 'basic-words'
  | 'intermediate-words'
  | 'advanced-words';

export type CategoryId = BeginnerCategory | IntermediateCategory | AdvancedCategory;

export interface StrokePoint {
  x: number;
  y: number;
  time: number;
  pressure?: number;
}

export interface RecordedStroke {
  strokeIndex: number;
  points: StrokePoint[];
  startPoint: StrokePoint;
  endPoint: StrokePoint;
  startTime?: number;
  endTime?: number;
}

export interface HandwritingSessionData {
  targetCharacter: string;
  romaji: string;
  mode: PracticeMode;
  level: LevelId;
  canvasWidth: number;
  canvasHeight: number;
  strokes: RecordedStroke[];
  totalStrokeCount: number;
  recordedAt: number;
}

export interface ExampleSentence {
  japanese: string;
  romaji: string;
  english: string;
}

export interface LearningItem {
  id: string;
  japanese: string;
  romaji: string;
  meaning?: string;
  category: CategoryId;
  level: LevelId;
  practiceModes: PracticeMode[];
  strokeCount?: number;
  strokeData?: string[]; // reserved for stroke reference coordinates/paths in Part 2
  audioUrl?: string; // reserved for custom audio asset URLs
  vocabularyImage?: string; // optional image reference
  difficulty?: 'easy' | 'medium' | 'hard';
  scoreHistory?: number[]; // reserved for score tracking in Part 2
  examples?: ExampleSentence[];
  notes?: string;
}

export interface CategoryMetadata {
  id: CategoryId;
  title: string;
  japaneseTitle: string;
  description: string;
  level: LevelId;
  allowedModes: PracticeMode[];
  iconName: string;
  itemCount: number;
  progressPercent: number;
}

export interface LevelMetadata {
  id: LevelId;
  title: string;
  subtitle: string;
  japaneseTitle: string;
  description: string;
  buttonText: string;
  path: string;
  writingModeRule: 'trace-only' | 'trace-or-free' | 'free-only';
  writingModeLabel: string;
  categories: CategoryMetadata[];
}
