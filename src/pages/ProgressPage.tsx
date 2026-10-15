import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart2,
  CheckCircle2,
  Bookmark,
  Trophy,
  Target,
  ArrowRight,
  Sparkles,
  RotateCcw,
  Gamepad2,
  Trash2,
  AlertTriangle,
  X,
} from 'lucide-react';
import { LEVELS, allLearningItems, getItemsByCategory } from '../data';
import { LevelBadge } from '../components/common/LevelBadge';
import {
  getOverallStats,
  getCategoryProgressionStats,
  getSkippedLearningItems,
  getAllAttemptSummaries,
  getSkippedItems,
  getMasteredItems,
  getGameStats,
  resetProgression,
  onProgressionUpdated,
  type ItemAttemptSummary,
  type OverallProgressionStats,
  type GameStats,
} from '../utils/progression';

export const ProgressPage = () => {
  const navigate = useNavigate();

  // Reactive state from local progression storage
  const [stats, setStats] = useState<OverallProgressionStats>(() =>
    getOverallStats(allLearningItems)
  );
  const [gameStats, setGameStats] = useState<GameStats>(() => getGameStats());
  const [skippedLearningList, setSkippedLearningList] = useState(() =>
    getSkippedLearningItems(allLearningItems)
  );
  const [attemptSummaries, setAttemptSummaries] = useState<ItemAttemptSummary[]>(() =>
    getAllAttemptSummaries(allLearningItems)
  );
  const [skippedMap, setSkippedMap] = useState(() => getSkippedItems());
  const [masteredMap, setMasteredMap] = useState(() => getMasteredItems());
  const [showResetModal, setShowResetModal] = useState(false);

  const refreshData = useCallback(() => {
    setStats(getOverallStats(allLearningItems));
    setGameStats(getGameStats());
    setSkippedLearningList(getSkippedLearningItems(allLearningItems));
    setAttemptSummaries(getAllAttemptSummaries(allLearningItems));
    setSkippedMap(getSkippedItems());
    setMasteredMap(getMasteredItems());
  }, []);

  useEffect(() => {
    const unsubscribe = onProgressionUpdated(refreshData);
    return unsubscribe;
  }, [refreshData]);

  // Derived counts for characters vs vocabulary
  const characterCategories = new Set(['hiragana', 'katakana', 'numbers']);
  let charactersMastered = 0;
  let vocabularyMastered = 0;
  allLearningItems.forEach((item) => {
    if (masteredMap[item.id]) {
      if (characterCategories.has(item.category)) {
        charactersMastered++;
      } else {
        vocabularyMastered++;
      }
    }
  });

  const handleConfirmReset = () => {
    resetProgression();
    setShowResetModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-10">
      {/* ==================================================
          PAGE HEADER
          ================================================== */}
      <div className="border-b border-slate-200 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
            <BarChart2 size={14} className="text-rose-600" />
            <span>KanaSense Learning Tracker • 学習進捗</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Learning Progress & Mastery
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-2xl">
            Track your handwriting accuracy, pass rates, attempt histories, and skipped items across all 3 levels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Global Progress Pill */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-black font-mono text-base border border-rose-100">
              {stats.overallPercentage}%
            </div>
            <div>
              <div className="text-xs font-bold uppercase text-slate-400">Total Completion</div>
              <div className="text-sm font-extrabold text-slate-900">
                {stats.masteredCount} / {stats.totalCurriculumCount} Mastered
              </div>
            </div>
          </div>

          {/* Reset My Progress button */}
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Reset My Progress"
          >
            <Trash2 size={14} className="text-rose-500" />
            <span>Reset Progress</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modal for Reset My Progress */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 text-slate-900 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 shrink-0">
                <AlertTriangle size={24} />
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                aria-label="Cancel"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Reset All Progress?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                This will reset your mastered characters, vocabulary, handwriting evaluation history, and game runner high scores back to <strong>0</strong>. This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
              >
                Yes, Reset My Progress
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          MASTERED ITEMS OVERVIEW METRICS
          ================================================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Characters Mastered */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-wider">Characters Mastered</span>
            <CheckCircle2 size={16} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {charactersMastered}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Hiragana, Katakana & Numbers
          </div>
        </div>

        {/* Vocabulary Mastered */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-teal-600 mb-2">
            <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-wider">Vocabulary Mastered</span>
            <Target size={16} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {vocabularyMastered}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Intermediate & Advanced words
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-wider">Average Score</span>
            <Trophy size={16} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {stats.averageScore > 0 ? `${stats.averageScore}%` : '0%'}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Across mastered attempts
          </div>
        </div>

        {/* Total Attempts */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-[11px] sm:text-xs uppercase font-extrabold tracking-wider">Practice Attempts</span>
            <RotateCcw size={16} />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {stats.totalAttemptsCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">
            Submissions evaluated
          </div>
        </div>
      </div>

      {/* Runner Game Lifetime Stats (Starts at 0 for new visitors) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-5 sm:p-6 text-white shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5 text-amber-400" />
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-amber-200">
              KanaSense Runner • Expo Statistics
            </span>
          </div>
          <Link
            to="/game"
            className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-white transition-colors"
          >
            <span>Play Runner</span>
            <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] font-bold uppercase text-slate-300">Games Played</div>
            <div className="text-2xl font-black font-mono mt-0.5 text-white">{gameStats.gamesPlayed}</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] font-bold uppercase text-slate-300">Best Score</div>
            <div className="text-2xl font-black font-mono mt-0.5 text-amber-300">{gameStats.bestScore.toLocaleString()}</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] font-bold uppercase text-slate-300">Total XP</div>
            <div className="text-2xl font-black font-mono mt-0.5 text-emerald-300">+{gameStats.totalXp}</div>
          </div>
          <div className="bg-white/10 rounded-2xl p-3.5 border border-white/10">
            <div className="text-[10px] font-bold uppercase text-slate-300">Best Combo</div>
            <div className="text-2xl font-black font-mono mt-0.5 text-rose-300">x{gameStats.bestCombo}</div>
          </div>
        </div>
      </div>

      {/* ==================================================
          SKIPPED ITEMS SECTION & PRACTICE SKIPPED ITEMS
          ================================================== */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                <Bookmark size={18} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Practice Skipped Items
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {skippedLearningList.length} Items
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Characters or words skipped during practice. When practiced and passed with score &ge; 75, they are automatically removed from this list.
            </p>
          </div>

          {/* Practice Skipped Items Button */}
          {skippedLearningList.length > 0 && (
            <button
              type="button"
              onClick={() => navigate('/practice/skipped')}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-md shadow-amber-200 transition-all cursor-pointer select-none"
            >
              <span>Practice Skipped Items</span>
              <ArrowRight size={16} />
            </button>
          )}
        </div>

        {skippedLearningList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {skippedLearningList.map((item) => {
              const record = skippedMap[item.id];
              return (
                <Link
                  key={item.id}
                  to={`/practice/skipped`}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/80 hover:border-amber-300 transition-all flex flex-col items-center justify-center text-center group cursor-pointer"
                >
                  <span className="text-2xl font-bold font-serif text-slate-900 group-hover:scale-110 transition-transform">
                    {item.japanese}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 mt-1">
                    {item.romaji}
                  </span>
                  {record && (
                    <div className="mt-1.5 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md font-mono">
                      <span>Last: {record.lastScore}%</span>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-2xl bg-slate-50 text-center flex flex-col items-center justify-center gap-2 border border-slate-100">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
            <p className="text-sm font-bold text-slate-800">
              No Skipped Items!
            </p>
            <p className="text-xs text-slate-500 max-w-sm">
              All items you have attempted have been passed (&ge; 75), or none have been skipped yet.
            </p>
          </div>
        )}
      </div>

      {/* ==================================================
          LEVEL-BY-LEVEL CATEGORY BREAKDOWN
          ================================================== */}
      <div className="space-y-8">
        {LEVELS.map((lvl) => (
          <div
            key={lvl.id}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-6"
          >
            {/* Level Title & Protocol Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <LevelBadge level={lvl.id} size="md" />
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    {lvl.title} ({lvl.japaneseTitle})
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500">{lvl.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
                  {lvl.writingModeLabel}
                </span>
                <Link
                  to={lvl.path}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                >
                  <span>Open {lvl.title}</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Categories Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lvl.categories.map((cat) => {
                const catItems = getItemsByCategory(cat.id);
                const catStats = getCategoryProgressionStats(cat.id, catItems);

                return (
                  <div
                    key={cat.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-rose-200 transition-all flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-900 text-sm sm:text-base">
                          {cat.title}
                        </span>
                        <span className="font-serif text-slate-400 font-bold text-sm">
                          {cat.japaneseTitle}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {cat.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 font-mono">
                          {catStats.completedCount} / {catStats.totalCount} completed
                        </span>
                        <span
                          className={`font-mono ${
                            catStats.percentage >= 75
                              ? 'text-emerald-600'
                              : catStats.percentage > 0
                              ? 'text-amber-600'
                              : 'text-slate-400'
                          }`}
                        >
                          {catStats.percentage}%
                        </span>
                      </div>

                      {/* Visual Progress Bar */}
                      <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            catStats.percentage >= 75
                              ? 'bg-emerald-500'
                              : catStats.percentage > 0
                              ? 'bg-amber-500'
                              : 'bg-slate-300'
                          }`}
                          style={{ width: `${catStats.percentage}%` }}
                        />
                      </div>

                      {/* Practice Link Button */}
                      <Link
                        to={
                          lvl.id === 'beginner'
                            ? `/beginner/${cat.id}`
                            : lvl.id === 'intermediate'
                            ? `/intermediate/${cat.id}`
                            : `/advanced/${cat.id}`
                        }
                        className="mt-1 text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center gap-1 self-start cursor-pointer"
                      >
                        <span>Practice {cat.title}</span>
                        <ArrowRight size={13} />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ==================================================
          ATTEMPT HISTORY AUDIT LIST
          ================================================== */}
      {attemptSummaries.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col gap-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles size={18} />
              </div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Item Attempt Histories
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {attemptSummaries.length} attempted items
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-1">
            {attemptSummaries.map((summary) => (
              <div
                key={summary.itemId}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-serif text-slate-900">
                      {summary.character}
                    </span>
                    <span className="text-xs font-mono text-rose-600 font-medium">
                      {summary.romaji}
                    </span>
                  </div>
                  {summary.meaning && (
                    <div className="text-xs text-slate-500 truncate mt-0.5">
                      {summary.meaning}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2 text-[11px] font-mono text-slate-600">
                    <span>Best: <strong>{summary.bestScore}%</strong></span>
                    <span>•</span>
                    <span>Latest: <strong>{summary.latestScore}%</strong></span>
                    <span>•</span>
                    <span>{summary.attemptsCount} attempt{summary.attemptsCount > 1 ? 's' : ''}</span>
                  </div>
                </div>

                <div>
                  {summary.status === 'mastered' ? (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold whitespace-nowrap">
                      Mastered
                    </span>
                  ) : summary.status === 'skipped' ? (
                    <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[11px] font-bold whitespace-nowrap">
                      Skipped
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 text-[11px] font-bold whitespace-nowrap">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
