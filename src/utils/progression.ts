import type { PracticeMode, LearningItem, CategoryId } from '../types/learning';
import type {
  AttemptEntry,
  MasteredItemRecord,
  SkippedItemRecord,
} from '../types/evaluation';

const STORAGE_KEY = 'kanasense_progress_v1';
const GAME_STATS_STORAGE_KEY = 'kanasense_game_stats_v1';

export interface GameStats {
  gamesPlayed: number;
  bestScore: number;
  totalXp: number;
  bestCombo: number;
}

export interface ItemAttemptSummary {
  itemId: string;
  character: string;
  romaji: string;
  meaning?: string;
  category: CategoryId;
  bestScore: number;
  latestScore: number;
  attemptsCount: number;
  status: 'mastered' | 'skipped' | 'in_progress';
  history: AttemptEntry[];
}

export interface OverallProgressionStats {
  masteredCount: number;
  skippedCount: number;
  totalCurriculumCount: number;
  overallPercentage: number;
  averageScore: number;
  bestScore: number;
  totalAttemptsCount: number;
}

export interface CategoryProgressionStats {
  categoryId: CategoryId;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

interface ProgressionStorageSchema {
  mastered: Record<string, MasteredItemRecord>;
  skipped: Record<string, SkippedItemRecord>;
  attempts: Record<string, AttemptEntry[]>;
}

function loadStorage(): ProgressionStorageSchema {
  if (typeof window === 'undefined') {
    return { mastered: {}, skipped: {}, attempts: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { mastered: {}, skipped: {}, attempts: {} };
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to load KanaSense progression:', e);
    return { mastered: {}, skipped: {}, attempts: {} };
  }
}

function saveStorage(data: ProgressionStorageSchema): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Dispatch custom event so UI components can update synchronously
    window.dispatchEvent(new CustomEvent('kanasense:progression-updated'));
  } catch (e) {
    console.warn('Failed to save KanaSense progression:', e);
  }
}

/**
 * Records an evaluation attempt for an item.
 * Tracks Attempt 1, Attempt 2, Attempt 3, etc.
 */
export function recordAttempt(
  itemId: string,
  score: number,
  passed: boolean
): AttemptEntry[] {
  const data = loadStorage();
  const currentAttempts = data.attempts[itemId] || [];
  const newAttempt: AttemptEntry = {
    attemptNumber: currentAttempts.length + 1,
    score,
    passed,
    timestamp: Date.now(),
  };

  data.attempts[itemId] = [...currentAttempts, newAttempt];
  saveStorage(data);
  return data.attempts[itemId];
}

/**
 * Retrieves all recorded attempts for a specific item.
 */
export function getItemAttempts(itemId: string): AttemptEntry[] {
  const data = loadStorage();
  return data.attempts[itemId] || [];
}

/**
 * Marks an item as passed and mastered (score >= 75).
 * Stores Item ID, score, date/time, number of attempts, and practice mode.
 * Removes the item from skipped list if it was previously skipped.
 */
export function markItemMastered(
  itemId: string,
  character: string,
  score: number,
  mode: PracticeMode
): MasteredItemRecord {
  const data = loadStorage();
  const attempts = data.attempts[itemId] || [];
  const scoresHistory = attempts.map((a) => a.score);
  if (!scoresHistory.includes(score)) scoresHistory.push(score);

  const record: MasteredItemRecord = {
    itemId,
    character,
    score,
    completedAt: Date.now(),
    attemptsCount: Math.max(1, attempts.length),
    mode,
    scoresHistory,
  };

  data.mastered[itemId] = record;
  // If previously skipped, remove from skipped
  if (data.skipped[itemId]) {
    delete data.skipped[itemId];
  }

  saveStorage(data);
  return record;
}

/**
 * Saves an item as skipped when score < 75.
 * Does NOT mark it as mastered.
 */
export function markItemSkipped(
  itemId: string,
  character: string,
  lastScore: number
): SkippedItemRecord {
  const data = loadStorage();
  const attempts = data.attempts[itemId] || [];

  const record: SkippedItemRecord = {
    itemId,
    character,
    lastScore,
    skippedAt: Date.now(),
    attemptsCount: attempts.length,
  };

  data.skipped[itemId] = record;
  saveStorage(data);
  return record;
}

/**
 * Checks whether an item is mastered.
 */
export function isItemMastered(itemId: string): boolean {
  const data = loadStorage();
  return Boolean(data.mastered[itemId]);
}

/**
 * Checks whether an item is currently skipped.
 */
export function isItemSkipped(itemId: string): boolean {
  const data = loadStorage();
  return Boolean(data.skipped[itemId]);
}

/**
 * Returns all mastered items.
 */
export function getMasteredItems(): Record<string, MasteredItemRecord> {
  const data = loadStorage();
  return data.mastered;
}

/**
 * Returns all skipped items.
 */
export function getSkippedItems(): Record<string, SkippedItemRecord> {
  const data = loadStorage();
  return data.skipped;
}

/**
 * Subscribes to progression updates.
 */
export function onProgressionUpdated(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('kanasense:progression-updated', callback);
  return () => {
    window.removeEventListener('kanasense:progression-updated', callback);
  };
}

/**
 * Returns summary statistics across the whole curriculum.
 */
export function getOverallStats(allItems: LearningItem[]): OverallProgressionStats {
  const data = loadStorage();
  const masteredList = Object.values(data.mastered);
  const skippedList = Object.values(data.skipped);
  const allAttempts = Object.values(data.attempts).flat();

  const masteredCount = masteredList.length;
  const skippedCount = skippedList.length;
  const totalCurriculumCount = allItems.length;
  const overallPercentage =
    totalCurriculumCount > 0
      ? Math.round((masteredCount / totalCurriculumCount) * 100)
      : 0;

  let bestScore = 0;
  let scoreSum = 0;

  if (masteredList.length > 0) {
    masteredList.forEach((m) => {
      scoreSum += m.score;
      if (m.score > bestScore) bestScore = m.score;
    });
  }

  // Also check all attempts for bestScore if unmastered had a high attempt
  allAttempts.forEach((a) => {
    if (a.score > bestScore) bestScore = a.score;
  });

  const averageScore =
    masteredList.length > 0 ? Math.round(scoreSum / masteredList.length) : 0;

  return {
    masteredCount,
    skippedCount,
    totalCurriculumCount,
    overallPercentage,
    averageScore,
    bestScore,
    totalAttemptsCount: allAttempts.length,
  };
}

/**
 * Calculates category-specific completion stats.
 */
export function getCategoryProgressionStats(
  categoryId: CategoryId,
  categoryItems: LearningItem[]
): CategoryProgressionStats {
  const data = loadStorage();
  const totalCount = categoryItems.length;
  let completedCount = 0;

  categoryItems.forEach((item) => {
    if (data.mastered[item.id]) {
      completedCount++;
    }
  });

  const percentage =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    categoryId,
    completedCount,
    totalCount,
    percentage,
  };
}

/**
 * Returns the array of LearningItems currently marked as skipped.
 */
export function getSkippedLearningItems(allItems: LearningItem[]): LearningItem[] {
  const data = loadStorage();
  return allItems.filter((item) => Boolean(data.skipped[item.id]));
}

/**
 * Returns attempt summaries for all items that have been attempted.
 */
export function getAllAttemptSummaries(allItems: LearningItem[]): ItemAttemptSummary[] {
  const data = loadStorage();
  const itemsMap = new Map<string, LearningItem>();
  allItems.forEach((i) => itemsMap.set(i.id, i));

  const summaries: ItemAttemptSummary[] = [];

  Object.entries(data.attempts).forEach(([itemId, attemptsList]) => {
    const item = itemsMap.get(itemId);
    if (!item || attemptsList.length === 0) return;

    let bestScore = 0;
    let latestScore = 0;
    attemptsList.forEach((a, idx) => {
      if (a.score > bestScore) bestScore = a.score;
      if (idx === attemptsList.length - 1) latestScore = a.score;
    });

    const isMastered = Boolean(data.mastered[itemId]);
    const isSkipped = Boolean(data.skipped[itemId]);
    const status: ItemAttemptSummary['status'] = isMastered
      ? 'mastered'
      : isSkipped
      ? 'skipped'
      : 'in_progress';

    summaries.push({
      itemId,
      character: item.japanese,
      romaji: item.romaji,
      meaning: item.meaning,
      category: item.category,
      bestScore,
      latestScore,
      attemptsCount: attemptsList.length,
      status,
      history: attemptsList,
    });
  });

  // Sort summaries: latest attempts first
  summaries.sort((a, b) => {
    const aTime = a.history[a.history.length - 1]?.timestamp || 0;
    const bTime = b.history[b.history.length - 1]?.timestamp || 0;
    return bTime - aTime;
  });

  return summaries;
}

/**
 * Returns persistent runner game statistics, defaulting to 0 for new visitors.
 */
export function getGameStats(): GameStats {
  if (typeof window === 'undefined') {
    return { gamesPlayed: 0, bestScore: 0, totalXp: 0, bestCombo: 0 };
  }
  try {
    const raw = localStorage.getItem(GAME_STATS_STORAGE_KEY);
    if (!raw) return { gamesPlayed: 0, bestScore: 0, totalXp: 0, bestCombo: 0 };
    const parsed = JSON.parse(raw);
    return {
      gamesPlayed: Number(parsed.gamesPlayed) || 0,
      bestScore: Number(parsed.bestScore) || 0,
      totalXp: Number(parsed.totalXp) || 0,
      bestCombo: Number(parsed.bestCombo) || 0,
    };
  } catch (e) {
    console.warn('Failed to load KanaSense game stats:', e);
    return { gamesPlayed: 0, bestScore: 0, totalXp: 0, bestCombo: 0 };
  }
}

/**
 * Records the completion of a game runner session.
 */
export function recordGameSession(score: number, xp: number, streak: number): GameStats {
  const current = getGameStats();
  const updated: GameStats = {
    gamesPlayed: current.gamesPlayed + 1,
    bestScore: Math.max(current.bestScore, Math.floor(score)),
    totalXp: current.totalXp + Math.max(0, Math.floor(xp)),
    bestCombo: Math.max(current.bestCombo, Math.floor(streak)),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(GAME_STATS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('kanasense:progression-updated'));
    } catch (e) {
      console.warn('Failed to save KanaSense game stats:', e);
    }
  }

  return updated;
}

/**
 * Resets all KanaSense learning progression and game stats back to 0.
 * Does NOT erase any unrelated browser storage keys.
 */
export function resetProgression(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(GAME_STATS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('kanasense:progression-updated'));
  } catch (e) {
    console.warn('Failed to reset KanaSense progression:', e);
  }
}

