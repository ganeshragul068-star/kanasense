import {
  hiraganaList,
  katakanaList,
  numbersList,
} from './beginner';
import {
  countriesList,
  datesList,
  daysList,
  monthsList,
  yearsList,
  basicVocabularyList,
  commonExpressionsList,
} from './intermediate';
import {
  advancedBasicWordsList,
  advancedIntermediateWordsList,
  advancedChallengingWordsList,
} from './advanced';
import type {
  CategoryId,
  CategoryMetadata,
  LearningItem,
  LevelId,
  LevelMetadata,
} from '../types/learning';

export * from './beginner';
export * from './intermediate';
export * from './advanced';

export const allLearningItems: LearningItem[] = [
  ...hiraganaList,
  ...katakanaList,
  ...numbersList,
  ...countriesList,
  ...datesList,
  ...daysList,
  ...monthsList,
  ...yearsList,
  ...basicVocabularyList,
  ...commonExpressionsList,
  ...advancedBasicWordsList,
  ...advancedIntermediateWordsList,
  ...advancedChallengingWordsList,
];

export const CATEGORIES: Record<CategoryId, CategoryMetadata> = {
  // Beginner
  hiragana: {
    id: 'hiragana',
    title: 'Hiragana',
    japaneseTitle: 'ひらがな',
    description: 'Master the 46 fundamental phonetic characters forming the base of Japanese.',
    level: 'beginner',
    allowedModes: ['trace'],
    iconName: 'Sparkles',
    itemCount: hiraganaList.length,
    progressPercent: 0,
  },
  katakana: {
    id: 'katakana',
    title: 'Katakana',
    japaneseTitle: 'カタカナ',
    description: 'Learn the phonetic alphabet used for foreign loanwords, emphasis, and names.',
    level: 'beginner',
    allowedModes: ['trace'],
    iconName: 'Globe',
    itemCount: katakanaList.length,
    progressPercent: 0,
  },
  numbers: {
    id: 'numbers',
    title: 'Numbers',
    japaneseTitle: '数字',
    description: 'Count and write kanji numerals from zero up to ten thousand.',
    level: 'beginner',
    allowedModes: ['trace'],
    iconName: 'Hash',
    itemCount: numbersList.length,
    progressPercent: 0,
  },

  // Intermediate
  countries: {
    id: 'countries',
    title: 'Countries',
    japaneseTitle: '国名',
    description: 'Country names written in katakana and kanji commonly used in conversations.',
    level: 'intermediate',
    allowedModes: ['trace', 'free'],
    iconName: 'Compass',
    itemCount: countriesList.length,
    progressPercent: 0,
  },
  dates: {
    id: 'dates',
    title: 'Dates',
    japaneseTitle: '日付',
    description: 'Unique irregular calendar days of the month (1st through 20th).',
    level: 'intermediate',
    allowedModes: ['trace', 'free'],
    iconName: 'Calendar',
    itemCount: datesList.length,
    progressPercent: 0,
  },
  days: {
    id: 'days',
    title: 'Days of the Week',
    japaneseTitle: '曜日',
    description: 'The 7 days of the week rooted in classical celestial elements.',
    level: 'intermediate',
    allowedModes: ['trace', 'free'],
    iconName: 'Sun',
    itemCount: daysList.length,
    progressPercent: 0,
  },
  months: {
    id: 'months',
    title: 'Months',
    japaneseTitle: '月',
    description: 'Japanese calendar months from Ichigatsu to Juunigatsu.',
    level: 'intermediate',
    allowedModes: ['trace', 'free'],
    iconName: 'Clock',
    itemCount: monthsList.length,
    progressPercent: 0,
  },
  years: {
    id: 'years',
    title: 'Years',
    japaneseTitle: '年',
    description: 'Express this year, next year, last year, and recurring cycles.',
    level: 'intermediate',
    allowedModes: ['trace', 'free'],
    iconName: 'History',
    itemCount: yearsList.length,
    progressPercent: 0,
  },
  'basic-vocabulary': {
    id: 'basic-vocabulary',
    title: 'Basic Vocabulary',
    japaneseTitle: '基本語彙',
    description: 'Everyday objects, animals, and common words in everyday Japanese.',
    level: 'intermediate',
    allowedModes: ['trace', 'free'],
    iconName: 'BookOpen',
    itemCount: basicVocabularyList.length,
    progressPercent: 0,
  },
  'common-expressions': {
    id: 'common-expressions',
    title: 'Common Expressions',
    japaneseTitle: '日常挨拶',
    description: 'Essential polite greetings and phrases for natural Japanese communication.',
    level: 'intermediate',
    allowedModes: ['trace', 'free'],
    iconName: 'MessageCircle',
    itemCount: commonExpressionsList.length,
    progressPercent: 0,
  },

  // Advanced
  'basic-words': {
    id: 'basic-words',
    title: 'Basic Words',
    japaneseTitle: '初級単語',
    description: 'Foundational compound words written completely from memory.',
    level: 'advanced',
    allowedModes: ['free'],
    iconName: 'PenTool',
    itemCount: advancedBasicWordsList.length,
    progressPercent: 0,
  },
  'intermediate-words': {
    id: 'intermediate-words',
    title: 'Intermediate Words',
    japaneseTitle: '中級単語',
    description: 'Complex multi-kanji vocabulary for academic and professional contexts.',
    level: 'advanced',
    allowedModes: ['free'],
    iconName: 'Layers',
    itemCount: advancedIntermediateWordsList.length,
    progressPercent: 0,
  },
  'advanced-words': {
    id: 'advanced-words',
    title: 'Advanced Words',
    japaneseTitle: '上級単語',
    description: 'Challenging high-stroke four-character idioms and modern terminology.',
    level: 'advanced',
    allowedModes: ['free'],
    iconName: 'Award',
    itemCount: advancedChallengingWordsList.length,
    progressPercent: 0,
  },
};

export const LEVELS: LevelMetadata[] = [
  {
    id: 'beginner',
    title: 'BEGINNER',
    subtitle: 'Japanese Characters',
    japaneseTitle: '入門・文字',
    description: 'Learn Hiragana, Katakana and Numbers.',
    buttonText: 'Start Beginner',
    path: '/beginner',
    writingModeRule: 'trace-only',
    writingModeLabel: 'Trace Only',
    categories: [
      CATEGORIES.hiragana,
      CATEGORIES.katakana,
      CATEGORIES.numbers,
    ],
  },
  {
    id: 'intermediate',
    title: 'INTERMEDIATE',
    subtitle: 'Japanese in Daily Life',
    japaneseTitle: '中級・生活語彙',
    description: 'Learn countries, dates, days, months, years and everyday vocabulary.',
    buttonText: 'Start Intermediate',
    path: '/intermediate',
    writingModeRule: 'trace-or-free',
    writingModeLabel: 'Trace or Free Style',
    categories: [
      CATEGORIES.countries,
      CATEGORIES.dates,
      CATEGORIES.days,
      CATEGORIES.months,
      CATEGORIES.years,
      CATEGORIES['basic-vocabulary'],
      CATEGORIES['common-expressions'],
    ],
  },
  {
    id: 'advanced',
    title: 'ADVANCED',
    subtitle: 'Japanese Vocabulary',
    japaneseTitle: '上級・語彙鍛錬',
    description: 'Write increasingly challenging Japanese words from memory.',
    buttonText: 'Start Advanced',
    path: '/advanced',
    writingModeRule: 'free-only',
    writingModeLabel: 'Free Style Writing Only',
    categories: [
      CATEGORIES['basic-words'],
      CATEGORIES['intermediate-words'],
      CATEGORIES['advanced-words'],
    ],
  },
];

export function getItemById(id: string): LearningItem | undefined {
  return allLearningItems.find((item) => item.id === id);
}

export function getItemsByCategory(category: CategoryId): LearningItem[] {
  return allLearningItems.filter((item) => item.category === category);
}

export function getItemsByLevel(level: LevelId): LearningItem[] {
  return allLearningItems.filter((item) => item.level === level);
}

export function getCategoryMeta(category: CategoryId): CategoryMetadata | undefined {
  return CATEGORIES[category];
}

export function getLevelMeta(level: LevelId): LevelMetadata | undefined {
  return LEVELS.find((l) => l.id === level);
}
