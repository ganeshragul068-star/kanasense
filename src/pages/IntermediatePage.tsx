import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Calendar,
  Sun,
  Clock,
  History,
  BookOpen,
  MessageCircle,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { CATEGORIES, getItemsByCategory } from '../data';
import { getCategoryProgressionStats, onProgressionUpdated } from '../utils/progression';

export const IntermediatePage = () => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsub = onProgressionUpdated(() => setTick((t) => t + 1));
    return unsub;
  }, []);
  const cards = [
    {
      meta: CATEGORIES.countries,
      icon: Compass,
      path: '/intermediate/countries',
      sample: '日本 • インド • アメリカ',
    },
    {
      meta: CATEGORIES.dates,
      icon: Calendar,
      path: '/intermediate/dates',
      sample: '一日 • 二日 • 三日',
    },
    {
      meta: CATEGORIES.days,
      icon: Sun,
      path: '/intermediate/days',
      sample: '月曜日 • 火曜日 • 水曜日',
    },
    {
      meta: CATEGORIES.months,
      icon: Clock,
      path: '/intermediate/months',
      sample: '一月 • 二月 • 三月',
    },
    {
      meta: CATEGORIES.years,
      icon: History,
      path: '/intermediate/years',
      sample: '今年 • 来年 • 去年',
    },
    {
      meta: CATEGORIES['basic-vocabulary'],
      icon: BookOpen,
      path: '/intermediate/basic-vocabulary',
      sample: '本 • 水 • 猫 • 犬',
    },
    {
      meta: CATEGORIES['common-expressions'],
      icon: MessageCircle,
      path: '/intermediate/common-expressions',
      sample: 'ありがとう • おはよう',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Level 2</span>
            <span>•</span>
            <span>中級・生活語彙</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Intermediate Dashboard
          </h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1 max-w-2xl">
            Japanese in Daily Life: Learn countries, dates, days, months, years and everyday vocabulary.
          </p>
        </div>

        {/* Writing Mode Info */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border border-amber-200 text-amber-800 shadow-xs">
          <SlidersHorizontal size={20} className="text-amber-600 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">Writing Mode:</span> Student Chooses
            <div className="text-[11px] text-amber-700/80">
              Toggle freely between [ Trace Mode ] or [ Free Style ] anytime.
            </div>
          </div>
        </div>
      </div>

      {/* 7 Intermediate Category Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((item) => {
          const Icon = item.icon;
          const { meta, path, sample } = item;

          return (
            <div
              key={meta.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header with Icon and Japanese Title */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon size={22} />
                  </div>
                  <span className="text-lg font-bold font-serif text-slate-300 group-hover:text-amber-600 transition-colors">
                    {meta.japaneseTitle}
                  </span>
                </div>

                {/* Title */}
                <h2 className="text-xl font-bold text-slate-900 mb-2">
                  {meta.title}
                </h2>

                {/* Description */}
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {meta.description}
                </p>

                {/* Sample Preview */}
                <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 mb-5 text-center">
                  <span className="text-xs font-serif text-slate-700 tracking-wider font-semibold">
                    {sample}
                  </span>
                </div>

                {/* Item Count and Progress */}
                {(() => {
                  const catStats = getCategoryProgressionStats(meta.id, getItemsByCategory(meta.id));
                  return (
                    <div className="space-y-1.5 mb-6">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>{catStats.totalCount} Items</span>
                        <span className="font-mono text-amber-600 font-bold">
                          {catStats.completedCount}/{catStats.totalCount} ({catStats.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all duration-500"
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
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all group-hover:bg-amber-700 active:scale-95"
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
