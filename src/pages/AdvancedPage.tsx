import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PenTool, Layers, Award, ArrowRight, Sparkles, AlertCircle } from 'lucide-react';
import { CATEGORIES, getItemsByCategory } from '../data';
import { getCategoryProgressionStats, onProgressionUpdated } from '../utils/progression';

export const AdvancedPage = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = onProgressionUpdated(() => setTick((t) => t + 1));
    return unsub;
  }, []);
  const cards = [
    {
      meta: CATEGORIES['basic-words'],
      icon: PenTool,
      path: '/advanced/basic-words',
      sample: '先生 • 学校 • 会社 • 家族',
    },
    {
      meta: CATEGORIES['intermediate-words'],
      icon: Layers,
      path: '/advanced/intermediate-words',
      sample: '図書館 • 飛行機 • 新幹線',
    },
    {
      meta: CATEGORIES['advanced-words'],
      icon: Award,
      path: '/advanced/advanced-words',
      sample: '一期一会 • 環境保護 • 人工知能',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Level 3</span>
            <span>•</span>
            <span>上級・語彙鍛錬</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Advanced Dashboard
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-2xl">
            Japanese Vocabulary: Write increasingly challenging Japanese words from memory without guidelines.
          </p>
        </div>

        {/* Prominent Free Style Writing Notice */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-rose-50 border-2 border-rose-300 text-rose-900 shadow-xs">
          <AlertCircle size={20} className="text-rose-600 shrink-0" />
          <div className="text-xs">
            <span className="font-extrabold text-rose-700 text-sm block">
              Free Style Writing
            </span>
            <span className="text-[11px] text-rose-800">
              Free Style Only — no tracing aids. Recall character forms from memory.
            </span>
          </div>
        </div>
      </div>

      {/* Advanced Vocabulary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {cards.map((item) => {
          const Icon = item.icon;
          const { meta, path, sample } = item;

          return (
            <div
              key={meta.id}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon size={24} />
                  </div>
                  <span className="text-xl font-bold font-serif text-slate-300 group-hover:text-rose-600 transition-colors">
                    {meta.japaneseTitle}
                  </span>
                </div>

                {/* Free Style Mode Tag */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 text-xs font-bold mb-3">
                  <Sparkles size={12} />
                  <span>Free Style Writing</span>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {meta.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {meta.description}
                </p>

                {/* Sample Kanji Compound Preview */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-6 text-center">
                  <span className="text-base font-serif text-slate-800 tracking-wider font-bold">
                    {sample}
                  </span>
                </div>

                {/* Item Count & Progress */}
                {(() => {
                  const catStats = getCategoryProgressionStats(meta.id, getItemsByCategory(meta.id));
                  return (
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>{catStats.totalCount} Words</span>
                        <span className="font-mono text-rose-600 font-bold">
                          {catStats.completedCount}/{catStats.totalCount} ({catStats.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${catStats.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Start Button */}
              <Link
                to={path}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all group-hover:bg-rose-700 active:scale-95"
              >
                <span>Start Practice</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};
