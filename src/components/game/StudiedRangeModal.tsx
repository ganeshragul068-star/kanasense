import React, { useState, useMemo, useCallback } from 'react';
import {
  Check,
  Sparkles,
  Play,
  ChevronRight,
  Users,
  Globe,
  BookOpen,
  Calendar,
  Sun,
  Clock,
  History,
  MessageCircle,
  PenTool,
  Layers,
  Award,
  X,
  Volume2,
  Info,
} from 'lucide-react';

import {
  basicHiragana,
  dakutenHiragana,
  handakutenHiragana,
  yoonHiragana,
  basicKatakana,
  dakutenKatakana,
  handakutenKatakana,
  yoonKatakana,
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
} from '../../data';
import { AVATAR_OPTIONS } from '../../game/avatarData';
import type { GameSessionConfig, BeginnerContentType, NumberRangeKey, AvatarId } from '../../game/types';
import { playJapanesePronunciation } from '../../utils/audio';
import type { LearningItem } from '../../types/learning';

// ─── Helpers ───────────────────────────────────────────────────────────────────

const NUMBER_IDS_MAP: Record<NumberRangeKey, string[]> = {
  '1-10': ['num-1','num-2','num-3','num-4','num-5','num-6','num-7','num-8','num-9','num-10'],
  '1-20': ['num-1','num-2','num-3','num-4','num-5','num-6','num-7','num-8','num-9','num-10','num-11','num-12','num-13','num-14','num-15','num-16','num-17','num-18','num-19','num-20'],
  '1-100': ['num-1','num-2','num-3','num-4','num-5','num-6','num-7','num-8','num-9','num-10','num-11','num-12','num-13','num-14','num-15','num-16','num-17','num-18','num-19','num-20','num-30','num-40','num-50','num-60','num-70','num-80','num-90','num-100'],
};

const ALL_BASIC_HIRAGANA_IDS = basicHiragana.map((i) => i.id);
const ALL_BASIC_KATAKANA_IDS = basicKatakana.map((i) => i.id);

// Row shortcuts for hiragana (gojuon order: a i u e o, ka ki ku ke ko, ...)
const HIRAGANA_ROWS = [
  { label: 'Vowels (あ行)', ids: ['hiragana-a','hiragana-i','hiragana-u','hiragana-e','hiragana-o'] },
  { label: 'K-row (か行)', ids: basicHiragana.slice(5,10).map(i=>i.id) },
  { label: 'S-row (さ行)', ids: basicHiragana.slice(10,15).map(i=>i.id) },
  { label: 'T-row (た行)', ids: basicHiragana.slice(15,20).map(i=>i.id) },
  { label: 'N-row (な行)', ids: basicHiragana.slice(20,25).map(i=>i.id) },
  { label: 'H-row (は行)', ids: basicHiragana.slice(25,30).map(i=>i.id) },
  { label: 'M-row (ま行)', ids: basicHiragana.slice(30,35).map(i=>i.id) },
  { label: 'Y-row (や行)', ids: basicHiragana.slice(35,38).map(i=>i.id) },
  { label: 'R-row (ら行)', ids: basicHiragana.slice(38,43).map(i=>i.id) },
  { label: 'W & N (わ行)', ids: basicHiragana.slice(43).map(i=>i.id) },
];
const KATAKANA_ROWS = [
  { label: 'Vowels (ア行)', ids: ['katakana-a','katakana-i','katakana-u','katakana-e','katakana-o'] },
  { label: 'K-row (カ行)', ids: basicKatakana.slice(5,10).map(i=>i.id) },
  { label: 'S-row (サ行)', ids: basicKatakana.slice(10,15).map(i=>i.id) },
  { label: 'T-row (タ行)', ids: basicKatakana.slice(15,20).map(i=>i.id) },
  { label: 'N-row (ナ行)', ids: basicKatakana.slice(20,25).map(i=>i.id) },
  { label: 'H-row (ハ行)', ids: basicKatakana.slice(25,30).map(i=>i.id) },
  { label: 'M-row (マ行)', ids: basicKatakana.slice(30,35).map(i=>i.id) },
  { label: 'Y-row (ヤ行)', ids: basicKatakana.slice(35,38).map(i=>i.id) },
  { label: 'R-row (ラ行)', ids: basicKatakana.slice(38,43).map(i=>i.id) },
  { label: 'W & N (ワ行)', ids: basicKatakana.slice(43).map(i=>i.id) },
];

const INTERMEDIATE_TOPICS = [
  { id: 'countries', label: 'Countries', jaLabel: '国名', icon: Globe, items: countriesList },
  { id: 'dates', label: 'Dates', jaLabel: '日付', icon: Calendar, items: datesList },
  { id: 'days', label: 'Days', jaLabel: '曜日', icon: Sun, items: daysList },
  { id: 'months', label: 'Months', jaLabel: '月', icon: Clock, items: monthsList },
  { id: 'years', label: 'Years', jaLabel: '年', icon: History, items: yearsList },
  { id: 'basic-vocabulary', label: 'Vocabulary', jaLabel: '基本語彙', icon: BookOpen, items: basicVocabularyList },
  { id: 'common-expressions', label: 'Expressions', jaLabel: '日常挨拶', icon: MessageCircle, items: commonExpressionsList },
];

const ADVANCED_BANDS = [
  { id: 'basic-words', label: 'Basic Words', jaLabel: '初級単語', icon: PenTool, items: advancedBasicWordsList },
  { id: 'intermediate-words', label: 'Intermediate Words', jaLabel: '中級単語', icon: Layers, items: advancedIntermediateWordsList },
  { id: 'advanced-words', label: 'Challenging Words', jaLabel: '上級単語', icon: Award, items: advancedChallengingWordsList },
];

// ─── Types ─────────────────────────────────────────────────────────────────────

type LevelTab = 'beginner' | 'intermediate' | 'advanced';
type HiraganaSubTab = 'basic' | 'dakuten' | 'contracted';
type KatakanaSubTab = 'basic' | 'dakuten' | 'contracted';

interface Props {
  isOpen: boolean;
  initialConfig: GameSessionConfig;
  onClose: () => void;
  onStartGame: (config: GameSessionConfig) => void;
}

// ─── Main Component ────────────────────────────────────────────────────────────

export const StudiedRangeModal: React.FC<Props> = ({ isOpen, initialConfig, onClose, onStartGame }) => {
  const [level, setLevel] = useState<LevelTab>(initialConfig.level as LevelTab);
  const [beginnerType, setBeginnerType] = useState<BeginnerContentType>(initialConfig.beginnerType);
  const [selectedCharIds, setSelectedCharIds] = useState<Set<string>>(new Set(initialConfig.selectedCharacterIds));
  const [numberRange, setNumberRange] = useState<NumberRangeKey>(initialConfig.selectedNumberRange);
  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set(initialConfig.selectedTopicIds));
  const [selectedIntermItemIds, setSelectedIntermItemIds] = useState<Set<string>>(new Set(initialConfig.selectedIntermediateItemIds));
  const [selectedBands, setSelectedBands] = useState<Set<string>>(new Set(initialConfig.selectedBands));
  const [selectedAdvItemIds, setSelectedAdvItemIds] = useState<Set<string>>(new Set(initialConfig.selectedAdvancedItemIds));
  const [avatarId, setAvatarId] = useState<AvatarId>(initialConfig.avatarId);
  const [hSubTab, setHSubTab] = useState<HiraganaSubTab>('basic');
  const [kSubTab, setKSubTab] = useState<KatakanaSubTab>('basic');
  const [page, setPage] = useState<'selection' | 'avatar'>('selection');

  // ─── Helpers ───────────────────────────────────────────────────────

  const toggleChar = (id: string) => {
    setSelectedCharIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleTopic = (id: string) => {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      // Clear fine-grained selection when toggling a topic
      setSelectedIntermItemIds(new Set());
      return next;
    });
  };

  const toggleBand = (id: string) => {
    setSelectedBands((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      setSelectedAdvItemIds(new Set());
      return next;
    });
  };

  // ─── Kana grid for current sub-tab ────────────────────────────────

  const hiraganaGridItems = useMemo<LearningItem[]>(() => {
    if (hSubTab === 'basic') return basicHiragana;
    if (hSubTab === 'dakuten') return [...dakutenHiragana, ...handakutenHiragana];
    return yoonHiragana;
  }, [hSubTab]);

  const katakanaGridItems = useMemo<LearningItem[]>(() => {
    if (kSubTab === 'basic') return basicKatakana;
    if (kSubTab === 'dakuten') return [...dakutenKatakana, ...handakutenKatakana];
    return yoonKatakana;
  }, [kSubTab]);

  // ─── Selection count ───────────────────────────────────────────────

  const selectionCount = useMemo(() => {
    if (level === 'beginner') {
      if (beginnerType === 'numbers') return NUMBER_IDS_MAP[numberRange].length;
      return selectedCharIds.size;
    }
    if (level === 'intermediate') {
      if (selectedIntermItemIds.size > 0) return selectedIntermItemIds.size;
      return selectedTopicIds.size > 0
        ? INTERMEDIATE_TOPICS.filter((t) => selectedTopicIds.has(t.id)).reduce((a, t) => a + t.items.length, 0)
        : 0;
    }
    if (selectedAdvItemIds.size > 0) return selectedAdvItemIds.size;
    return selectedBands.size > 0
      ? ADVANCED_BANDS.filter((b) => selectedBands.has(b.id)).reduce((a, b) => a + b.items.length, 0)
      : 0;
  }, [level, beginnerType, selectedCharIds, numberRange, selectedTopicIds, selectedIntermItemIds, selectedBands, selectedAdvItemIds]);

  const canStart = selectionCount > 0;

  // ─── Preview pills ─────────────────────────────────────────────────

  const previewItems = useMemo<string[]>(() => {
    if (level === 'beginner') {
      if (beginnerType === 'numbers') {
        const ids = NUMBER_IDS_MAP[numberRange];
        return numbersList.filter((i) => ids.includes(i.id)).slice(0, 12).map((i) => `${i.japanese} (${i.romaji.split('/')[0].trim()})`);
      }
      const src = beginnerType === 'hiragana' ? [...basicHiragana, ...dakutenHiragana, ...handakutenHiragana, ...yoonHiragana] : [...basicKatakana, ...dakutenKatakana, ...handakutenKatakana, ...yoonKatakana];
      return src.filter((i) => selectedCharIds.has(i.id)).slice(0, 16).map((i) => `${i.japanese} (${i.romaji})`);
    }
    if (level === 'intermediate') {
      const items = selectedIntermItemIds.size > 0
        ? INTERMEDIATE_TOPICS.flatMap(t => t.items).filter(i => selectedIntermItemIds.has(i.id))
        : INTERMEDIATE_TOPICS.filter(t => selectedTopicIds.has(t.id)).flatMap(t => t.items);
      return items.slice(0, 12).map(i => i.japanese);
    }
    const items = selectedAdvItemIds.size > 0
      ? ADVANCED_BANDS.flatMap(b => b.items).filter(i => selectedAdvItemIds.has(i.id))
      : ADVANCED_BANDS.filter(b => selectedBands.has(b.id)).flatMap(b => b.items);
    return items.slice(0, 12).map(i => i.japanese);
  }, [level, beginnerType, selectedCharIds, numberRange, selectedTopicIds, selectedIntermItemIds, selectedBands, selectedAdvItemIds]);

  // ─── Build config and start ────────────────────────────────────────

  const handleStartGame = useCallback(() => {
    const config: GameSessionConfig = {
      level,
      beginnerType,
      selectedCharacterIds: Array.from(selectedCharIds),
      selectedNumberRange: numberRange,
      selectedTopicIds: Array.from(selectedTopicIds),
      selectedIntermediateItemIds: Array.from(selectedIntermItemIds),
      selectedBands: Array.from(selectedBands),
      selectedAdvancedItemIds: Array.from(selectedAdvItemIds),
      avatarId,
    };
    onStartGame(config);
  }, [level, beginnerType, selectedCharIds, numberRange, selectedTopicIds, selectedIntermItemIds, selectedBands, selectedAdvItemIds, avatarId, onStartGame]);

  if (!isOpen) return null;

  // ─── Shortcut helpers ──────────────────────────────────────────────

  const applyHiraganaShortcut = (ids: string[]) => {
    setSelectedCharIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };
  const applyKatakanaShortcut = (ids: string[]) => {
    setSelectedCharIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      return next;
    });
  };
  const clearKana = () => setSelectedCharIds(new Set());

  // ─── JSX ───────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[96dvh] my-auto text-slate-900">

        {/* ─ Header ─────────────────────────────────────────────────── */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-200" />
              <h2 className="text-lg sm:text-xl font-black tracking-wide uppercase">
                {page === 'avatar' ? 'Choose Your Runner' : 'What Have You Studied?'}
              </h2>
            </div>
            <p className="text-xs text-rose-100 mt-0.5">
              {page === 'avatar'
                ? 'Pick your runner character — then start!'
                : 'Select the Japanese material you have already learnt'}
            </p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-white/20 transition-colors cursor-pointer" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* ─ Body ───────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {page === 'selection' ? (
            <div className="p-4 sm:p-5 space-y-4">

              {/* Step 1: Level Tabs */}
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">1. Select Your Learning Level</p>
                <div className="grid grid-cols-3 gap-2">
                  {([
                    { id: 'beginner', label: 'BEGINNER', ja: '入門', color: 'from-teal-500 to-cyan-500' },
                    { id: 'intermediate', label: 'INTERMEDIATE', ja: '中級', color: 'from-indigo-500 to-violet-500' },
                    { id: 'advanced', label: 'ADVANCED', ja: '上級', color: 'from-rose-500 to-pink-500' },
                  ] as const).map((lv) => (
                    <button
                      key={lv.id}
                      type="button"
                      onClick={() => setLevel(lv.id)}
                      className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer text-center ${
                        level === lv.id
                          ? 'border-transparent text-white shadow-lg ring-2 ring-offset-1 ring-rose-400/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                      style={level === lv.id ? { background: `linear-gradient(135deg, var(--tw-gradient-stops))` } : {}}
                    >
                      {level === lv.id && (
                        <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${lv.color}`} />
                      )}
                      <div className="relative z-10">
                        <div className={`text-xs font-extrabold ${level === lv.id ? 'text-white' : 'text-slate-800'}`}>{lv.label}</div>
                        <div className={`text-base font-black font-serif mt-0.5 ${level === lv.id ? 'text-white/80' : 'text-slate-500'}`}>{lv.ja}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Material Selection */}
              <div>
                <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">2. Choose What You Have Studied</p>

                {/* ── BEGINNER ─────────────────────────────────────────── */}
                {level === 'beginner' && (
                  <div className="space-y-3">
                    {/* Type toggle */}
                    <div className="flex gap-2">
                      {(['hiragana','katakana','numbers'] as BeginnerContentType[]).map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setBeginnerType(t)}
                          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            beginnerType === t
                              ? 'bg-teal-600 text-white border-teal-600 shadow'
                              : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                          }`}
                        >
                          {t === 'hiragana' ? 'Hiragana' : t === 'katakana' ? 'Katakana' : 'Numbers'}
                          <span className="ml-1 font-serif text-[11px]">
                            {t === 'hiragana' ? 'ひらがな' : t === 'katakana' ? 'カタカナ' : '数字'}
                          </span>
                        </button>
                      ))}
                    </div>

                    {/* Hiragana grid */}
                    {beginnerType === 'hiragana' && (
                      <>
                        {/* Row shortcuts */}
                        <div className="flex flex-wrap gap-1.5">
                          <button type="button" onClick={() => setSelectedCharIds(new Set(['hiragana-a','hiragana-i','hiragana-u','hiragana-e','hiragana-o']))} className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold cursor-pointer hover:bg-teal-100">First 5 vowels</button>
                          <button type="button" onClick={() => applyHiraganaShortcut([...HIRAGANA_ROWS[0].ids,...HIRAGANA_ROWS[1].ids])} className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold cursor-pointer hover:bg-teal-100">Vowels + K-row (10)</button>
                          <button type="button" onClick={() => applyHiraganaShortcut(HIRAGANA_ROWS.slice(0,5).flatMap(r=>r.ids))} className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold cursor-pointer hover:bg-teal-100">First 5 rows (25)</button>
                          <button type="button" onClick={() => setSelectedCharIds(new Set(ALL_BASIC_HIRAGANA_IDS))} className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold cursor-pointer hover:bg-teal-100">All basic 46</button>
                          <button type="button" onClick={clearKana} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold cursor-pointer hover:bg-slate-200">Clear</button>
                        </div>
                        {/* Sub-tabs */}
                        <div className="flex gap-1">
                          {(['basic','dakuten','contracted'] as HiraganaSubTab[]).map((t) => (
                            <button key={t} type="button" onClick={() => setHSubTab(t)} className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${hSubTab===t?'bg-teal-600 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                              {t === 'basic' ? 'Basic (46)' : t === 'dakuten' ? 'Voiced (25)' : 'Contracted (33)'}
                            </button>
                          ))}
                        </div>
                        {/* Grid */}
                        <KanaGrid items={hiraganaGridItems} selectedIds={selectedCharIds} onToggle={toggleChar} />
                      </>
                    )}

                    {/* Katakana grid */}
                    {beginnerType === 'katakana' && (
                      <>
                        <div className="flex flex-wrap gap-1.5">
                          <button type="button" onClick={() => setSelectedCharIds(new Set(['katakana-a','katakana-i','katakana-u','katakana-e','katakana-o']))} className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold cursor-pointer hover:bg-teal-100">First 5 vowels</button>
                          <button type="button" onClick={() => applyKatakanaShortcut([...KATAKANA_ROWS[0].ids,...KATAKANA_ROWS[1].ids])} className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold cursor-pointer hover:bg-teal-100">Vowels + K-row (10)</button>
                          <button type="button" onClick={() => applyKatakanaShortcut(KATAKANA_ROWS.slice(0,5).flatMap(r=>r.ids))} className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold cursor-pointer hover:bg-teal-100">First 5 rows (25)</button>
                          <button type="button" onClick={() => setSelectedCharIds(new Set(ALL_BASIC_KATAKANA_IDS))} className="px-2.5 py-1 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 text-[11px] font-bold cursor-pointer hover:bg-teal-100">All basic 46</button>
                          <button type="button" onClick={clearKana} className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-500 text-[11px] font-bold cursor-pointer hover:bg-slate-200">Clear</button>
                        </div>
                        <div className="flex gap-1">
                          {(['basic','dakuten','contracted'] as KatakanaSubTab[]).map((t) => (
                            <button key={t} type="button" onClick={() => setKSubTab(t)} className={`px-3 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${kSubTab===t?'bg-teal-600 text-white':'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                              {t === 'basic' ? 'Basic (46)' : t === 'dakuten' ? 'Voiced (25)' : 'Contracted (33)'}
                            </button>
                          ))}
                        </div>
                        <KanaGrid items={katakanaGridItems} selectedIds={selectedCharIds} onToggle={toggleChar} />
                      </>
                    )}

                    {/* Numbers */}
                    {beginnerType === 'numbers' && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          {(['1-10','1-20','1-100'] as NumberRangeKey[]).map((r) => (
                            <button key={r} type="button" onClick={() => setNumberRange(r)} className={`flex-1 py-2 rounded-xl text-xs font-bold cursor-pointer border transition-all ${numberRange===r?'bg-teal-600 text-white border-teal-600':'bg-white text-slate-600 border-slate-200 hover:border-teal-300'}`}>
                              {r === '1-10' ? '1 – 10' : r === '1-20' ? '1 – 20' : '1 – 100'}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5">
                          {numbersList.filter(n => NUMBER_IDS_MAP[numberRange].includes(n.id)).map((num) => (
                            <div key={num.id} className="flex flex-col items-center p-2 rounded-xl bg-teal-50 border border-teal-100">
                              <span className="text-lg font-black text-slate-800">{num.japanese}</span>
                              <span className="text-[10px] text-teal-700 font-medium">{num.romaji.split('/')[0].trim()}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── INTERMEDIATE ──────────────────────────────────────── */}
                {level === 'intermediate' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => { setSelectedTopicIds(new Set(INTERMEDIATE_TOPICS.map(t=>t.id))); setSelectedIntermItemIds(new Set()); }} className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold cursor-pointer hover:bg-indigo-100">Select All Topics</button>
                      <button type="button" onClick={() => { setSelectedTopicIds(new Set()); setSelectedIntermItemIds(new Set()); }} className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold cursor-pointer hover:bg-slate-200">Clear</button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {INTERMEDIATE_TOPICS.map((topic) => {
                        const Icon = topic.icon;
                        const isSelected = selectedTopicIds.has(topic.id);
                        return (
                          <button key={topic.id} type="button" onClick={() => toggleTopic(topic.id)} className={`relative p-3 rounded-2xl border-2 text-left cursor-pointer transition-all ${isSelected ? 'border-indigo-500 bg-indigo-50/60 shadow-sm ring-2 ring-indigo-400/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                            {isSelected && <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-indigo-500 text-white flex items-center justify-center"><Check size={12} className="stroke-[3]" /></span>}
                            <Icon size={16} className={`mb-1.5 ${isSelected ? 'text-indigo-600' : 'text-slate-400'}`} />
                            <div className={`text-xs font-extrabold ${isSelected ? 'text-indigo-800' : 'text-slate-700'}`}>{topic.label}</div>
                            <div className="text-[10px] font-serif text-slate-400">{topic.jaLabel}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{topic.items.length} words</div>
                          </button>
                        );
                      })}
                    </div>
                    {selectedTopicIds.size > 0 && (
                      <p className="text-[11px] text-indigo-600 font-medium flex items-center gap-1"><Info size={12}/>{selectedTopicIds.size} topic(s) selected — all their words will be included in your game.</p>
                    )}
                  </div>
                )}

                {/* ── ADVANCED ──────────────────────────────────────────── */}
                {level === 'advanced' && (
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => { setSelectedBands(new Set(ADVANCED_BANDS.map(b=>b.id))); setSelectedAdvItemIds(new Set()); }} className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold cursor-pointer hover:bg-rose-100">Select All Bands</button>
                      <button type="button" onClick={() => { setSelectedBands(new Set()); setSelectedAdvItemIds(new Set()); }} className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-bold cursor-pointer hover:bg-slate-200">Clear</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {ADVANCED_BANDS.map((band) => {
                        const Icon = band.icon;
                        const isSelected = selectedBands.has(band.id);
                        return (
                          <button key={band.id} type="button" onClick={() => toggleBand(band.id)} className={`relative p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${isSelected ? 'border-rose-500 bg-rose-50/60 shadow ring-2 ring-rose-400/30' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                            {isSelected && <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center"><Check size={12} className="stroke-[3]" /></span>}
                            <Icon size={16} className={`mb-1.5 ${isSelected ? 'text-rose-600' : 'text-slate-400'}`} />
                            <div className={`text-xs font-extrabold ${isSelected ? 'text-rose-800' : 'text-slate-700'}`}>{band.label}</div>
                            <div className="text-[10px] font-serif text-slate-400">{band.jaLabel}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{band.items.length} words</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Live Summary */}
              <div className={`rounded-2xl border p-3.5 ${canStart ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Your Selection</span>
                  <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${canStart ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-amber-900'}`}>
                    {selectionCount} item{selectionCount !== 1 ? 's' : ''}
                  </span>
                </div>
                {canStart ? (
                  <>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {previewItems.map((p, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[11px] font-bold">{p}</span>
                      ))}
                      {selectionCount > 12 && <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-600 text-[11px]">+{selectionCount - 12} more</span>}
                    </div>
                    <p className="text-[11px] text-emerald-700 font-medium">⏱ Estimated play time: ~1–3 minutes</p>
                  </>
                ) : (
                  <p className="text-xs text-amber-700 font-semibold flex items-center gap-1.5">
                    <Info size={13} className="shrink-0" />
                    Please select at least 1 item to start the game.
                  </p>
                )}
              </div>
            </div>
          ) : (
            /* Avatar Selection Page */
            <div className="p-4 sm:p-5">
              <p className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-3">Choose Your Runner Character</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {AVATAR_OPTIONS.map((avatar) => {
                  const isSelected = avatarId === avatar.id;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setAvatarId(avatar.id)}
                      className={`relative flex items-center gap-3.5 p-3.5 rounded-2xl border-2 text-left cursor-pointer transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50/40 shadow-md ring-2 ring-emerald-400/40' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'}`}
                    >
                      {isSelected && (
                        <span className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow">
                          <Check size={14} className="stroke-[3]" />
                        </span>
                      )}
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                        <img src={avatar.imagePath} alt={avatar.name} className="w-full h-full object-contain p-1" style={{ imageRendering: 'pixelated' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-rose-600 font-serif">{avatar.japaneseName}</div>
                        <div className="text-base font-extrabold text-slate-900 truncate">{avatar.name}</div>
                        <div className="text-xs text-slate-500 font-medium">{avatar.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ─ Footer ─────────────────────────────────────────────────── */}
        <div className="px-4 sm:px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Users size={13} className="text-slate-400" />
            <span>
              <span className="font-bold text-slate-700">
                {AVATAR_OPTIONS.find(a => a.id === avatarId)?.name}
              </span>
              {' '}&bull;{' '}
              <span className="font-bold uppercase text-rose-600">{level}</span>
              {' '}&bull;{' '}
              <span className="font-semibold">{selectionCount} item{selectionCount !== 1 ? 's' : ''} selected</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {page === 'selection' ? (
              <>
                <button
                  type="button"
                  onClick={() => setPage('avatar')}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wide cursor-pointer transition-colors"
                >
                  <Users size={13} />
                  <span>Choose Avatar</span>
                  <ChevronRight size={13} />
                </button>
                <button
                  type="button"
                  data-testid="start-game-button"
                  disabled={!canStart}
                  onClick={handleStartGame}
                  className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${canStart ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  <Play size={13} className={canStart ? 'fill-white' : ''} />
                  <span>START GAME</span>
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setPage('selection')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer transition-colors"
                >
                  ← Edit Selection
                </button>
                <button
                  type="button"
                  data-testid="start-game-button"
                  disabled={!canStart}
                  onClick={handleStartGame}
                  className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wide transition-all ${canStart ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 cursor-pointer' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                  <Play size={13} className={canStart ? 'fill-white' : ''} />
                  <span>START GAME</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── KanaGrid sub-component ────────────────────────────────────────────────────

interface KanaGridProps {
  items: LearningItem[];
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
}

const KanaGrid: React.FC<KanaGridProps> = ({ items, selectedIds, onToggle }) => {
  const handleAudio = (e: React.MouseEvent, japanese: string) => {
    e.stopPropagation();
    playJapanesePronunciation(japanese).catch(() => {});
  };

  return (
    <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 max-h-64 overflow-y-auto rounded-xl p-1">
      {items.map((item) => {
        const isSel = selectedIds.has(item.id);
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onToggle(item.id)}
            className={`relative group flex flex-col items-center p-1.5 rounded-xl border cursor-pointer transition-all select-none ${
              isSel
                ? 'border-teal-400 bg-teal-50 shadow ring-1 ring-teal-300/60'
                : 'border-slate-200 bg-white hover:border-teal-200 hover:bg-teal-50/30'
            }`}
          >
            {isSel && (
              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-teal-500 text-white flex items-center justify-center">
                <Check size={9} className="stroke-[3]" />
              </span>
            )}
            <span className={`text-xl font-black leading-none ${isSel ? 'text-teal-800' : 'text-slate-700'}`}>{item.japanese}</span>
            <span className={`text-[9px] font-semibold mt-0.5 ${isSel ? 'text-teal-600' : 'text-slate-400'}`}>{item.romaji}</span>
            <button
              type="button"
              onClick={(e) => handleAudio(e, item.japanese)}
              className="mt-0.5 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-teal-600 transition-opacity cursor-pointer"
              title="Play pronunciation"
              aria-label={`Pronounce ${item.romaji}`}
            >
              <Volume2 size={9} />
            </button>
          </button>
        );
      })}
    </div>
  );
};
