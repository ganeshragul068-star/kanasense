import {
  hiraganaList,
  katakanaList,
  numbersList,
  countriesList,
  datesList,
  daysList,
  monthsList,
  yearsList,
  basicVocabularyList,
  commonExpressionsList,
  advancedBasicWordsList,
  advancedIntermediateWordsList,
  advancedChallengingWordsList,
  CATEGORIES,
} from '../data';
import type { LevelId, LearningItem } from '../types/learning';
import type { GameQuestion, ObstacleDef, GameSessionConfig } from './types';

// ────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Picks up to `count` unique distractor strings from the given pool.
 * Falls back gracefully when the pool is too small.
 */
function pickDistractors(
  pool: LearningItem[],
  correctValue: string,
  extractor: (item: LearningItem) => string,
  count = 3
): string[] {
  const candidates = Array.from(
    new Set(
      pool
        .map(extractor)
        .filter((val) => val && val.trim() !== '' && val !== correctValue)
    )
  );
  return shuffleArray(candidates).slice(0, count);
}

/**
 * Builds a list of shuffled MCQ options, guaranteeing at least 2 choices
 * even when the pool is tiny.
 */
function buildOptions(correct: string, distractors: string[]): string[] {
  return shuffleArray([correct, ...distractors]);
}

let questionCounter = 1;

// ────────────────────────────────────────────────────────────────────
// Number-range ID sets
// ────────────────────────────────────────────────────────────────────

const NUMBER_IDS_1_10 = [
  'num-1','num-2','num-3','num-4','num-5',
  'num-6','num-7','num-8','num-9','num-10',
];
const NUMBER_IDS_1_20 = [
  ...NUMBER_IDS_1_10,
  'num-11','num-12','num-13','num-14','num-15',
  'num-16','num-17','num-18','num-19','num-20',
];
const NUMBER_IDS_1_100 = [
  ...NUMBER_IDS_1_20,
  'num-30','num-40','num-50','num-60','num-70','num-80','num-90','num-100',
];

function getNumberIds(range: '1-10' | '1-20' | '1-100'): string[] {
  if (range === '1-10') return NUMBER_IDS_1_10;
  if (range === '1-20') return NUMBER_IDS_1_20;
  return NUMBER_IDS_1_100;
}

// ────────────────────────────────────────────────────────────────────
// Pool resolver — the single place where GameSessionConfig translates
// to an array of LearningItems to draw questions from.
// ────────────────────────────────────────────────────────────────────

const TOPIC_MAP: Record<string, LearningItem[]> = {
  countries: countriesList,
  dates: datesList,
  days: daysList,
  months: monthsList,
  years: yearsList,
  'basic-vocabulary': basicVocabularyList,
  'common-expressions': commonExpressionsList,
};

const BAND_MAP: Record<string, LearningItem[]> = {
  'basic-words': advancedBasicWordsList,
  'intermediate-words': advancedIntermediateWordsList,
  'advanced-words': advancedChallengingWordsList,
};

export class QuestionGenerator {
  // ──────────────────────────────────────────────────────────────────
  // Public: resolve session pool
  // ──────────────────────────────────────────────────────────────────

  public static getFilteredPool(config: GameSessionConfig): LearningItem[] {
    const { level } = config;

    if (level === 'beginner') {
      if (config.beginnerType === 'hiragana') {
        if (config.selectedCharacterIds.length === 0) return hiraganaList;
        const ids = new Set(config.selectedCharacterIds);
        return hiraganaList.filter((i) => ids.has(i.id));
      }
      if (config.beginnerType === 'katakana') {
        if (config.selectedCharacterIds.length === 0) return katakanaList;
        const ids = new Set(config.selectedCharacterIds);
        return katakanaList.filter((i) => ids.has(i.id));
      }
      // numbers
      const numIds = new Set(getNumberIds(config.selectedNumberRange));
      return numbersList.filter((i) => numIds.has(i.id));
    }

    if (level === 'intermediate') {
      // Fine-grained item selection takes priority
      if (config.selectedIntermediateItemIds.length > 0) {
        const ids = new Set(config.selectedIntermediateItemIds);
        const all = Object.values(TOPIC_MAP).flat();
        return all.filter((i) => ids.has(i.id));
      }
      // Otherwise use selected topics
      if (config.selectedTopicIds.length > 0) {
        return config.selectedTopicIds
          .flatMap((tid) => TOPIC_MAP[tid] ?? [])
          .filter((v, i, a) => a.indexOf(v) === i); // unique
      }
      // Fallback: all intermediate
      return Object.values(TOPIC_MAP).flat();
    }

    // advanced
    if (config.selectedAdvancedItemIds.length > 0) {
      const ids = new Set(config.selectedAdvancedItemIds);
      const all = Object.values(BAND_MAP).flat();
      return all.filter((i) => ids.has(i.id));
    }
    if (config.selectedBands.length > 0) {
      return config.selectedBands
        .flatMap((bid) => BAND_MAP[bid] ?? [])
        .filter((v, i, a) => a.indexOf(v) === i);
    }
    return Object.values(BAND_MAP).flat();
  }

  // Legacy helper so other parts of the codebase can still call getLevelPool
  public static getLevelPool(level: LevelId): LearningItem[] {
    switch (level) {
      case 'beginner':
        return [...hiraganaList, ...katakanaList, ...numbersList];
      case 'intermediate':
        return Object.values(TOPIC_MAP).flat();
      case 'advanced':
        return Object.values(BAND_MAP).flat();
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // Main entry point
  // ──────────────────────────────────────────────────────────────────

  public static generateQuestion(
    config: GameSessionConfig,
    obstacle: ObstacleDef
  ): GameQuestion {
    const difficulty = obstacle.difficulty;
    const qId = `q_${Date.now()}_${questionCounter++}`;

    // Resolve the strictly-filtered pool from session config
    const pool = this.getFilteredPool(config);

    // Safety: if pool is somehow empty, fall back to full level pool
    const safePool = pool.length > 0 ? pool : this.getLevelPool(config.level);

    if (difficulty === 'easy') {
      return this.generateEasyQuestion(qId, config, obstacle, safePool);
    } else if (difficulty === 'medium') {
      return this.generateMediumWritingQuestion(qId, config, obstacle, safePool);
    } else {
      return this.generateHardQuestion(qId, config, obstacle, safePool);
    }
  }

  // ──────────────────────────────────────────────────────────────────
  // EASY: Multiple-Choice
  // ──────────────────────────────────────────────────────────────────

  private static generateEasyQuestion(
    qId: string,
    config: GameSessionConfig,
    obstacle: ObstacleDef,
    pool: LearningItem[]
  ): GameQuestion {
    const level = config.level;

    // ── BEGINNER ────────────────────────────────────────────────────
    if (level === 'beginner') {
      if (config.beginnerType === 'numbers') {
        const target = pickRandom(pool);
        const correctMeaning = target.meaning || target.romaji;
        const distractors = pickDistractors(pool, correctMeaning, (i) => i.meaning || i.romaji, 3);
        return {
          id: qId, level, difficulty: 'easy',
          obstacleName: obstacle.name, obstacleId: obstacle.id,
          interactionType: 'multiple_choice',
          prompt: `What does the number ${target.japanese} mean?`,
          displayHighlight: target.japanese,
          audioText: target.japanese,
          options: buildOptions(correctMeaning, distractors),
          correctAnswer: correctMeaning,
          targetItem: target,
          explanation: `${target.japanese} (${target.romaji}) means "${correctMeaning}".`,
          categoryLabel: 'Numbers',
        };
      }

      // Kana: try sequence question only if the next kana is in the pool
      if (pool.length >= 2 && Math.random() < 0.40) {
        const sequenceQuestion = this.trySequenceQuestion(qId, config, obstacle, pool);
        if (sequenceQuestion) return sequenceQuestion;
      }

      // Standard kana recognition
      const target = pickRandom(pool);
      const categoryMeta = CATEGORIES[target.category];
      const askForKana = Math.random() < 0.5;

      if (askForKana) {
        const distractors = pickDistractors(pool, target.japanese, (i) => i.japanese, 3);
        return {
          id: qId, level, difficulty: 'easy',
          obstacleName: obstacle.name, obstacleId: obstacle.id,
          interactionType: 'multiple_choice',
          prompt: `Which ${categoryMeta?.title || 'character'} represents "${target.romaji}"?`,
          displayHighlight: target.romaji,
          audioText: target.japanese,
          options: buildOptions(target.japanese, distractors),
          correctAnswer: target.japanese,
          targetItem: target,
          explanation: `"${target.romaji}" is written as ${target.japanese}.`,
          categoryLabel: categoryMeta?.title || 'Beginner',
        };
      } else {
        const distractors = pickDistractors(pool, target.romaji, (i) => i.romaji, 3);
        return {
          id: qId, level, difficulty: 'easy',
          obstacleName: obstacle.name, obstacleId: obstacle.id,
          interactionType: 'multiple_choice',
          prompt: `What is the Romaji reading for ${target.japanese}?`,
          displayHighlight: target.japanese,
          audioText: target.japanese,
          options: buildOptions(target.romaji, distractors),
          correctAnswer: target.romaji,
          targetItem: target,
          explanation: `${target.japanese} is pronounced "${target.romaji}".`,
          categoryLabel: categoryMeta?.title || 'Beginner',
        };
      }
    }

    // ── INTERMEDIATE ─────────────────────────────────────────────────
    if (level === 'intermediate') {
      const target = pickRandom(pool);
      const categoryMeta = CATEGORIES[target.category];
      const sameCat = pool.filter((i) => i.category === target.category);
      const distPool = sameCat.length >= 4 ? sameCat : pool;
      const correctMeaning = target.meaning || target.romaji;
      const distractors = pickDistractors(distPool, correctMeaning, (i) => i.meaning || i.romaji, 3);
      return {
        id: qId, level, difficulty: 'easy',
        obstacleName: obstacle.name, obstacleId: obstacle.id,
        interactionType: 'multiple_choice',
        prompt: `What does ${target.japanese} mean?`,
        subPrompt: `Category: ${categoryMeta?.title || 'Intermediate'}`,
        displayHighlight: target.japanese,
        audioText: target.japanese,
        options: buildOptions(correctMeaning, distractors),
        correctAnswer: correctMeaning,
        targetItem: target,
        explanation: `${target.japanese} (${target.romaji}) means "${correctMeaning}".`,
        categoryLabel: categoryMeta?.title || 'Intermediate',
      };
    }

    // ── ADVANCED ──────────────────────────────────────────────────────
    const target = pickRandom(pool);
    const categoryMeta = CATEGORIES[target.category];
    const correctMeaning = target.meaning || target.romaji;
    const distractors = pickDistractors(pool, correctMeaning, (i) => i.meaning || i.romaji, 3);
    return {
      id: qId, level, difficulty: 'easy',
      obstacleName: obstacle.name, obstacleId: obstacle.id,
      interactionType: 'multiple_choice',
      prompt: `What does ${target.japanese} mean?`,
      subPrompt: 'Select the English meaning for this Japanese vocabulary word',
      displayHighlight: target.japanese,
      audioText: target.japanese,
      options: buildOptions(correctMeaning, distractors),
      correctAnswer: correctMeaning,
      targetItem: target,
      explanation: `${target.japanese} (${target.romaji}) means "${correctMeaning}".`,
      categoryLabel: categoryMeta?.title || 'Advanced Vocabulary',
    };
  }

  // ──────────────────────────────────────────────────────────────────
  // MEDIUM: Free-Style Writing
  // ──────────────────────────────────────────────────────────────────

  private static generateMediumWritingQuestion(
    qId: string,
    config: GameSessionConfig,
    obstacle: ObstacleDef,
    pool: LearningItem[]
  ): GameQuestion {
    const level = config.level;

    if (level === 'beginner') {
      // Prefer single-character items for clean writing
      const singleChar = pool.filter((i) => Array.from(i.japanese).length === 1);
      const target = pickRandom(singleChar.length > 0 ? singleChar : pool);

      if (target.category === 'numbers') {
        return {
          id: qId, level, difficulty: 'medium',
          obstacleName: obstacle.name, obstacleId: obstacle.id,
          interactionType: 'writing',
          prompt: `Write the Japanese Kanji numeral for "${target.meaning}" (${target.romaji}):`,
          subPrompt: 'Free-style writing challenge • No trace outline',
          displayHighlight: `${target.meaning} (${target.romaji})`,
          audioText: target.japanese,
          correctAnswer: target.japanese,
          targetItem: target,
          explanation: `The Kanji numeral for "${target.meaning}" is ${target.japanese}.`,
          categoryLabel: 'Numbers (Free Write)',
        };
      }

      const scriptLabel = target.category === 'hiragana' ? 'Hiragana' : 'Katakana';
      return {
        id: qId, level, difficulty: 'medium',
        obstacleName: obstacle.name, obstacleId: obstacle.id,
        interactionType: 'writing',
        prompt: `Write the ${scriptLabel} character for "${target.romaji}":`,
        subPrompt: `Draw the ${scriptLabel} character on the blank canvas`,
        displayHighlight: target.romaji,
        audioText: target.japanese,
        correctAnswer: target.japanese,
        targetItem: target,
        explanation: `The ${scriptLabel} for "${target.romaji}" is ${target.japanese}.`,
        categoryLabel: `${scriptLabel} (Free Write)`,
      };
    }

    if (level === 'intermediate') {
      const writePool = pool.filter((i) => Array.from(i.japanese).length <= 4);
      const target = pickRandom(writePool.length > 0 ? writePool : pool);
      const categoryMeta = CATEGORIES[target.category];
      return {
        id: qId, level, difficulty: 'medium',
        obstacleName: obstacle.name, obstacleId: obstacle.id,
        interactionType: 'writing',
        prompt: `Write the Japanese ${categoryMeta?.title.toLowerCase() || 'word'} for "${target.meaning}":`,
        subPrompt: `Romaji hint: ${target.romaji} • Write from memory`,
        displayHighlight: `${target.meaning}`,
        audioText: target.japanese,
        correctAnswer: target.japanese,
        targetItem: target,
        explanation: `"${target.meaning}" is written as ${target.japanese} (${target.romaji}).`,
        categoryLabel: `${categoryMeta?.title || 'Intermediate'} (Free Write)`,
      };
    }

    // Advanced
    const writePool = pool.filter((i) => Array.from(i.japanese).length <= 4);
    const target = pickRandom(writePool.length > 0 ? writePool : pool);
    const categoryMeta = CATEGORIES[target.category];
    return {
      id: qId, level, difficulty: 'medium',
      obstacleName: obstacle.name, obstacleId: obstacle.id,
      interactionType: 'writing',
      prompt: `Write the Japanese vocabulary word for "${target.meaning}":`,
      subPrompt: `Romaji: ${target.romaji} • Recall and write the characters`,
      displayHighlight: `${target.meaning} (${target.romaji})`,
      audioText: target.japanese,
      correctAnswer: target.japanese,
      targetItem: target,
      explanation: `"${target.meaning}" (${target.romaji}) is written as ${target.japanese}.`,
      categoryLabel: `${categoryMeta?.title || 'Advanced'} (Free Write)`,
    };
  }

  // ──────────────────────────────────────────────────────────────────
  // HARD: Higher-Difficulty Challenge
  // ──────────────────────────────────────────────────────────────────

  private static generateHardQuestion(
    qId: string,
    config: GameSessionConfig,
    obstacle: ObstacleDef,
    pool: LearningItem[]
  ): GameQuestion {
    const level = config.level;

    if (level === 'beginner') {
      const target = pickRandom(pool);
      const categoryMeta = CATEGORIES[target.category];

      // Hard writing if single char
      if (Math.random() < 0.35 && Array.from(target.japanese).length === 1) {
        const scriptName = target.category === 'hiragana' ? 'Hiragana' : target.category === 'katakana' ? 'Katakana' : 'Kanji';
        return {
          id: qId, level, difficulty: 'hard',
          obstacleName: obstacle.name, obstacleId: obstacle.id,
          interactionType: 'writing',
          prompt: `HARD CHALLENGE: Write the ${scriptName} for "${target.romaji}":`,
          subPrompt: 'Recall and draw the character accurately!',
          displayHighlight: target.romaji,
          audioText: target.japanese,
          correctAnswer: target.japanese,
          targetItem: target,
          explanation: `The ${scriptName} for "${target.romaji}" is ${target.japanese}.`,
          categoryLabel: `${scriptName} Challenge`,
        };
      }

      const distractors = pickDistractors(pool, target.romaji, (i) => i.romaji, 3);
      return {
        id: qId, level, difficulty: 'hard',
        obstacleName: obstacle.name, obstacleId: obstacle.id,
        interactionType: 'multiple_choice',
        prompt: `HARD CHALLENGE: Identify the exact Romaji sound for this ${categoryMeta?.title || 'Kana'}:`,
        subPrompt: 'Distinguish voiced, unvoiced, and contracted sounds carefully',
        displayHighlight: target.japanese,
        audioText: target.japanese,
        options: buildOptions(target.romaji, distractors),
        correctAnswer: target.romaji,
        targetItem: target,
        explanation: `${target.japanese} is read as "${target.romaji}".`,
        categoryLabel: `${categoryMeta?.title || 'Kana'} Mastery`,
      };
    }

    if (level === 'intermediate') {
      // Prefer dates pool if dates topic is selected, otherwise all pool
      const datesInPool = pool.filter((i) => i.category === 'dates');
      const useDates = datesInPool.length >= 2 && Math.random() < 0.45;
      const questionPool = useDates ? datesInPool : pool;
      const target = pickRandom(questionPool);
      const categoryMeta = CATEGORIES[target.category];

      if (useDates) {
        const distractors = pickDistractors(questionPool, target.romaji, (i) => i.romaji, 3);
        return {
          id: qId, level, difficulty: 'hard',
          obstacleName: obstacle.name, obstacleId: obstacle.id,
          interactionType: 'multiple_choice',
          prompt: `HARD CHALLENGE: What is the irregular Japanese reading for ${target.japanese} (${target.meaning})?`,
          subPrompt: 'Japanese calendar dates have traditional readings',
          displayHighlight: `${target.japanese}`,
          audioText: target.japanese,
          options: buildOptions(target.romaji, distractors),
          correctAnswer: target.romaji,
          targetItem: target,
          explanation: `${target.japanese} (${target.meaning}) is pronounced "${target.romaji}".`,
          categoryLabel: 'Irregular Dates',
        };
      }

      const distractors = pickDistractors(pool, target.japanese, (i) => i.japanese, 3);
      return {
        id: qId, level, difficulty: 'hard',
        obstacleName: obstacle.name, obstacleId: obstacle.id,
        interactionType: 'multiple_choice',
        prompt: `HARD CHALLENGE: Which Japanese expression or word means "${target.meaning}"?`,
        subPrompt: 'Select the accurate Japanese term',
        displayHighlight: `"${target.meaning}"`,
        audioText: target.japanese,
        options: buildOptions(target.japanese, distractors),
        correctAnswer: target.japanese,
        targetItem: target,
        explanation: `"${target.meaning}" in Japanese is ${target.japanese} (${target.romaji}).`,
        categoryLabel: categoryMeta?.title || 'Intermediate Challenge',
      };
    }

    // Advanced
    const target = pickRandom(pool);
    const categoryMeta = CATEGORIES[target.category];

    if (Math.random() < 0.35 && Array.from(target.japanese).length <= 3) {
      return {
        id: qId, level, difficulty: 'hard',
        obstacleName: obstacle.name, obstacleId: obstacle.id,
        interactionType: 'writing',
        prompt: `HARD WRITING CHALLENGE: Write the Japanese word for "${target.meaning}" from memory:`,
        subPrompt: 'Advanced recall — write the characters on the blank canvas',
        displayHighlight: `"${target.meaning}"`,
        audioText: target.japanese,
        correctAnswer: target.japanese,
        targetItem: target,
        explanation: `"${target.meaning}" is written ${target.japanese} (${target.romaji}).`,
        categoryLabel: `${categoryMeta?.title || 'Advanced'} Recall`,
      };
    }

    const askRomaji = Math.random() < 0.5;
    if (askRomaji) {
      const distractors = pickDistractors(pool, target.romaji, (i) => i.romaji, 3);
      return {
        id: qId, level, difficulty: 'hard',
        obstacleName: obstacle.name, obstacleId: obstacle.id,
        interactionType: 'multiple_choice',
        prompt: `HARD CHALLENGE: Identify the correct Romaji reading for ${target.japanese} (${target.meaning}):`,
        subPrompt: 'Advanced vocabulary pronunciation check',
        displayHighlight: target.japanese,
        audioText: target.japanese,
        options: buildOptions(target.romaji, distractors),
        correctAnswer: target.romaji,
        targetItem: target,
        explanation: `${target.japanese} ("${target.meaning}") is read "${target.romaji}".`,
        categoryLabel: categoryMeta?.title || 'Advanced Vocabulary',
      };
    }

    const distractors = pickDistractors(pool, target.japanese, (i) => i.japanese, 3);
    return {
      id: qId, level, difficulty: 'hard',
      obstacleName: obstacle.name, obstacleId: obstacle.id,
      interactionType: 'multiple_choice',
      prompt: `HARD CHALLENGE: Which advanced Japanese word means "${target.meaning}"?`,
      subPrompt: 'Select the matching Kanji compound',
      displayHighlight: `"${target.meaning}"`,
      audioText: target.japanese,
      options: buildOptions(target.japanese, distractors),
      correctAnswer: target.japanese,
      targetItem: target,
      explanation: `"${target.meaning}" is ${target.japanese} (${target.romaji}).`,
      categoryLabel: categoryMeta?.title || 'Advanced Vocabulary',
    };
  }

  // ──────────────────────────────────────────────────────────────────
  // Sequence question (safe: only if successor is in the selected pool)
  // ──────────────────────────────────────────────────────────────────

  private static trySequenceQuestion(
    qId: string,
    config: GameSessionConfig,
    obstacle: ObstacleDef,
    pool: LearningItem[]
  ): GameQuestion | null {
    const level = config.level;
    // Build a lookup of pool IDs for fast membership check
    const poolIdSet = new Set(pool.map((i) => i.id));

    // Get the ordered source list (same type as pool)
    const sourceList =
      config.beginnerType === 'katakana' ? katakanaList : hiraganaList;

    // Find pool items that have a successor also in the pool
    const validPairs: Array<[LearningItem, LearningItem]> = [];
    for (let i = 0; i < sourceList.length - 1; i++) {
      const current = sourceList[i];
      const next = sourceList[i + 1];
      if (poolIdSet.has(current.id) && poolIdSet.has(next.id)) {
        validPairs.push([current, next]);
      }
    }

    if (validPairs.length === 0) return null;

    const [currentKana, nextKana] = pickRandom(validPairs);
    const distractors = pickDistractors(
      pool.filter((i) => i.id !== currentKana.id),
      nextKana.japanese,
      (i) => i.japanese,
      3
    );

    return {
      id: qId, level, difficulty: 'easy',
      obstacleName: obstacle.name, obstacleId: obstacle.id,
      interactionType: 'multiple_choice',
      prompt: `Which ${config.beginnerType === 'katakana' ? 'Katakana' : 'Hiragana'} comes after ${currentKana.japanese} (${currentKana.romaji})?`,
      subPrompt: 'Select the next character in kana order',
      displayHighlight: `${currentKana.japanese} → ？`,
      audioText: nextKana.japanese,
      options: buildOptions(nextKana.japanese, distractors),
      correctAnswer: nextKana.japanese,
      targetItem: nextKana,
      explanation: `After ${currentKana.japanese} (${currentKana.romaji}) comes ${nextKana.japanese} (${nextKana.romaji}).`,
      categoryLabel: `${config.beginnerType === 'katakana' ? 'Katakana' : 'Hiragana'} Order`,
    };
  }
}
