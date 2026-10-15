import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Layers, Award, Volume2, PenTool, Gamepad2 } from 'lucide-react';
import { allLearningItems } from '../data';
import { getMasteredItems, onProgressionUpdated } from '../utils/progression';

export const HomePage = () => {
  const [masteredMap, setMasteredMap] = useState(() => getMasteredItems());

  useEffect(() => {
    const unsub = onProgressionUpdated(() => setMasteredMap(getMasteredItems()));
    return unsub;
  }, []);

  // Compute actual level progress %
  const calcLevelProgress = (levelId: string) => {
    const levelItems = allLearningItems.filter((it) => it.level === levelId);
    if (levelItems.length === 0) return 0;
    const masteredCount = levelItems.filter((it) => Boolean(masteredMap[it.id])).length;
    return Math.round((masteredCount / levelItems.length) * 100);
  };

  const beginnerPct = calcLevelProgress('beginner');
  const intermediatePct = calcLevelProgress('intermediate');
  const advancedPct = calcLevelProgress('advanced');
  return (
    <div className="flex flex-col gap-16 py-8 sm:py-12">
      {/* Hero Section */}
      <section className="relative px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center flex flex-col items-center">
        {/* Decorative Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm font-semibold mb-6 shadow-xs animate-in fade-in duration-300">
          <span className="text-base">🇯🇵</span>
          <span>KanaSense • Interactive Japanese Learning</span>
        </div>

        {/* Tagline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 leading-[1.1] mb-6">
          Learn Japanese.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600">
            Listen. Write. Master.
          </span>
        </h1>

        {/* Short Description */}
        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed mb-8">
          Practice Japanese characters and vocabulary through pronunciation, guided tracing and free-style writing.
        </p>

        {/* Fast Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/beginner"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-base shadow-lg shadow-rose-200 hover:shadow-xl transition-all cursor-pointer group active:scale-95"
          >
            <span>Start Beginner</span>
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/game"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-lg shadow-slate-300 hover:shadow-xl transition-all cursor-pointer group active:scale-95"
          >
            <Gamepad2 size={18} className="text-amber-400" />
            <span>Runner Game</span>
          </Link>
          <Link
            to="/progress"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold text-base shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <span>View Progress</span>
          </Link>
        </div>

        {/* Feature Highlights Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-12 w-full max-w-3xl pt-8 border-t border-slate-200/80">
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs flex flex-col items-center text-center">
            <PenTool size={20} className="text-rose-600 mb-1" />
            <span className="text-xs font-bold text-slate-800">Genkouyoushi Grid</span>
            <span className="text-[10px] text-slate-500">Authentic writing sheet</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs flex flex-col items-center text-center">
            <Volume2 size={20} className="text-rose-600 mb-1" />
            <span className="text-xs font-bold text-slate-800">Clear Pronunciation</span>
            <span className="text-[10px] text-slate-500">Audio playback</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs flex flex-col items-center text-center">
            <Sparkles size={20} className="text-rose-600 mb-1" />
            <span className="text-xs font-bold text-slate-800">Guided Tracing</span>
            <span className="text-[10px] text-slate-500">Faint character guides</span>
          </div>
          <div className="p-3 bg-white rounded-xl border border-slate-200/70 shadow-xs flex flex-col items-center text-center">
            <Award size={20} className="text-rose-600 mb-1" />
            <span className="text-xs font-bold text-slate-800">3 Structured Levels</span>
            <span className="text-[10px] text-slate-500">Zero grammar clutter</span>
          </div>
        </div>
      </section>

      {/* Three Large Level Cards */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Select Your Learning Level
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-2">
            Progressive learning tailored from foundational kana tracing to advanced free-style kanji compound recall.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: BEGINNER */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200 hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  BEGINNER
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  入門・文字
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Sparkles size={24} />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Japanese Characters
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Learn Hiragana, Katakana and Numbers.
              </p>

              {/* Mode Rule Indicator */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
                  Writing Protocol
                </div>
                <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Trace Only Mode (Guided outline)
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Hiragana, Katakana & Numbers</span>
                  <span className="font-mono font-bold text-emerald-600">{beginnerPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${beginnerPct}%` }}
                  />
                </div>
              </div>
            </div>

            <Link
              to="/beginner"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all group-hover:bg-emerald-700"
            >
              <span>Start Beginner</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 2: INTERMEDIATE */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200 hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  INTERMEDIATE
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  中級・生活語彙
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Layers size={24} />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Japanese in Daily Life
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Learn countries, dates, days, months, years and everyday vocabulary.
              </p>

              {/* Mode Rule Indicator */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
                  Writing Protocol
                </div>
                <div className="text-xs font-semibold text-amber-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Choice: [ Trace Mode ] OR [ Free Style ]
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>7 Active Modules</span>
                  <span className="font-mono font-bold text-amber-600">{intermediatePct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${intermediatePct}%` }}
                  />
                </div>
              </div>
            </div>

            <Link
              to="/intermediate"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all group-hover:bg-amber-700"
            >
              <span>Start Intermediate</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          {/* Card 3: ADVANCED */}
          <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-200 hover:shadow-md hover:border-rose-300 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-extrabold tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  ADVANCED
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  上級・語彙鍛錬
                </span>
              </div>

              <div className="w-12 h-12 rounded-2xl bg-rose-100/70 text-rose-700 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                <Award size={24} />
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Japanese Vocabulary
              </h3>

              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Write increasingly challenging Japanese words from memory.
              </p>

              {/* Mode Rule Indicator */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 mb-6">
                <div className="text-[11px] uppercase tracking-wider font-bold text-slate-400 mb-0.5">
                  Writing Protocol
                </div>
                <div className="text-xs font-semibold text-rose-700 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Free Style Writing Only (No Tracing)
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Basic, Intermediate & Idioms</span>
                  <span className="font-mono font-bold text-rose-600">{advancedPct}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-rose-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${advancedPct}%` }}
                  />
                </div>
              </div>
            </div>

            <Link
              to="/advanced"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-sm hover:shadow transition-all group-hover:bg-rose-700"
            >
              <span>Start Advanced</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
