import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, Hash, ArrowRight, ShieldCheck } from 'lucide-react';
import { CATEGORIES, getItemsByCategory } from '../data';
import { getCategoryProgressionStats, onProgressionUpdated } from '../utils/progression';

export const BeginnerPage = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = onProgressionUpdated(() => setTick((t) => t + 1));
    return unsub;
  }, []);

  const cards = [
    {
      meta: CATEGORIES.hiragana,
      path: '/beginner/hiragana',
      icon: Sparkles,
      accent: 'emerald',
      sample: 'あ い う え お',
    },
    {
      meta: CATEGORIES.katakana,
      path: '/beginner/katakana',
      icon: Globe,
      accent: 'teal',
      sample: 'ア イ ウ エ オ',
    },
    {
      meta: CATEGORIES.numbers,
      path: '/beginner/numbers',
      icon: Hash,
      accent: 'cyan',
      sample: '一 二 三 四 五',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
      {/* Level Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Level 1</span>
            <span>•</span>
            <span>入門・文字</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Beginner Dashboard
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-2xl">
            Japanese Characters: Learn Hiragana, Katakana and Numbers through guided tracing.
          </p>
        </div>

        {/* Mandatory Mode Notice */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 shadow-xs">
          <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Writing Mode:</span> Trace Only
            <div className="text-[11px] text-emerald-700/80">
              Trace faint outlines to build muscle memory. No Free Style in Beginner.
            </div>
          </div>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
        {cards.map((item) => {
          const Icon = item.icon;
          const { meta, path, sample } = item;

          return (
            <div
              key={meta.id}
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Icon & Category Japanese Name */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon size={24} />
                  </div>
                  <span className="text-xl font-bold font-serif text-slate-300 group-hover:text-emerald-600 transition-colors">
                    {meta.japaneseTitle}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {meta.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed mb-6">
                  {meta.description}
                </p>

                {/* Sample Character Preview */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-6 text-center">
                  <span className="text-base font-serif text-slate-700 tracking-widest font-bold">
                    {sample}
                  </span>
                </div>

                {/* Number of Items & Progress */}
                {(() => {
                  const catStats = getCategoryProgressionStats(meta.id, getItemsByCategory(meta.id));
                  return (
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>{catStats.totalCount} Characters</span>
                        <span className="font-mono text-emerald-600 font-bold">
                          {catStats.completedCount}/{catStats.totalCount} ({catStats.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${catStats.percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Start Practice Button */}
              <Link
                to={path}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all group-hover:bg-emerald-700 active:scale-95"
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
