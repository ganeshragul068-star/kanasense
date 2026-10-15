import React, { useState } from 'react';
import {
  RotateCcw,
  User,
  BookOpen,
  Flame,
  Award,
  Zap,
  Crosshair,
  CheckCircle2,
  XCircle,
  BarChart2,
  AlertTriangle,
  Lightbulb,
  ChevronRight,
  PenTool,
} from 'lucide-react';
import type { GameHUDStats, ObstacleDifficulty } from '../../game/types';
import { useNavigate } from 'react-router-dom';
import { getItemById } from '../../data';
import { recordGameSession } from '../../utils/progression';

interface GameOverModalProps {
  isOpen: boolean;
  stats: GameHUDStats;
  onPlayAgain: () => void;
  onChangeAvatar: () => void;
}

type ReportTab = 'overview' | 'difficulty' | 'mistakes' | 'tips';

const DIFF_LABELS: Record<ObstacleDifficulty, { label: string; color: string; bg: string }> = {
  easy: { label: 'EASY', color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200' },
  medium: { label: 'MEDIUM', color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200' },
  hard: { label: 'HARD', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200' },
};

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  stats,
  onPlayAgain,
  onChangeAvatar,
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const recordedRef = React.useRef(false);

  React.useEffect(() => {
    if (isOpen && !recordedRef.current) {
      recordedRef.current = true;
      recordGameSession(stats.score, stats.xp, stats.bestStreak);
    } else if (!isOpen) {
      recordedRef.current = false;
    }
  }, [isOpen, stats.score, stats.xp, stats.bestStreak]);

  if (!isOpen) return null;

  const totalAnswered = stats.correctAnswers + stats.incorrectAnswers;
  const accuracy =
    totalAnswered > 0
      ? Math.min(100, Math.round((stats.correctAnswers / totalAnswered) * 100))
      : stats.obstaclesCleared > 0
      ? 100
      : 0;

  // Personalized recommendations
  const recommendations: string[] = [];
  const easy = stats.difficultyStats.easy;
  const medium = stats.difficultyStats.medium;
  const hard = stats.difficultyStats.hard;

  const easyAcc = easy.attempted > 0 ? Math.round((easy.correct / easy.attempted) * 100) : 100;
  const medAcc = medium.attempted > 0 ? Math.round((medium.correct / medium.attempted) * 100) : 100;
  const hardAcc = hard.attempted > 0 ? Math.round((hard.correct / hard.attempted) * 100) : 100;

  if (easy.attempted > 0 && easyAcc < 70) {
    recommendations.push('Review your selected basic characters — low accuracy on EASY questions suggests some characters need more practice.');
  }
  if (medium.attempted > 0 && medAcc < 60) {
    recommendations.push('Revisit your selected vocabulary in learning mode before your next game.');
  }
  if (hard.attempted > 0 && hardAcc < 50) {
    recommendations.push('Practice advanced writing and reading exercises to improve HARD accuracy.');
  }
  if (stats.writingChallengesAttempted > 0 && stats.incorrectAnswers > stats.correctAnswers) {
    recommendations.push('Try tracing mode in Practice to improve your handwriting recognition score.');
  }
  if (stats.totalCollisions > 3) {
    recommendations.push('Work on your jump timing to avoid more obstacles during normal gameplay.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Great session! Keep challenging yourself with more advanced material or higher difficulty.');
  }

  const tabs: { id: ReportTab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <Award size={13} /> },
    { id: 'difficulty', label: 'By Difficulty', icon: <BarChart2 size={13} /> },
    { id: 'mistakes', label: `Mistakes (${stats.mistakes.length})`, icon: <AlertTriangle size={13} /> },
    { id: 'tips', label: 'Tips', icon: <Lightbulb size={13} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-slate-900 max-h-[96dvh] my-auto flex flex-col">
        {/* Banner */}
        <div className="py-4 px-4 bg-gradient-to-b from-rose-600 to-rose-700 text-white relative shrink-0">
          <div className="text-2xl font-black tracking-widest font-mono text-white drop-shadow-md text-center">
            GAME OVER
          </div>
          <div className="text-xs font-serif text-rose-200 tracking-widest mt-0.5 text-center">
            ゲームオーバー • お疲れ様でした！
          </div>
          {/* Quick score */}
          <div className="mt-2 text-center">
            <span className="text-3xl font-black font-mono">{stats.score.toLocaleString()}</span>
            <span className="text-sm font-semibold opacity-80 ml-1">pts</span>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 shrink-0 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-bold whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
                activeTab === tab.id
                  ? 'border-rose-500 text-rose-600 bg-rose-50/50'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {/* ── OVERVIEW ────────────────────────────────────────── */}
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 gap-2 text-left">
                <StatCard icon={<CheckCircle2 size={13} />} label="Correct Answers" value={stats.correctAnswers.toString()} color="emerald" />
                <StatCard icon={<XCircle size={13} />} label="Incorrect Answers" value={stats.incorrectAnswers.toString()} color="rose" />
                <StatCard icon={<Crosshair size={13} />} label="Accuracy" value={`${accuracy}%`} color="teal" />
                <StatCard icon={<Flame size={13} />} label="Best Combo" value={`×${stats.bestStreak} 🔥`} color="orange" />
                <StatCard icon={<Award size={13} />} label="Obstacles Cleared" value={stats.obstaclesCleared.toString()} color="indigo" />
                <StatCard icon={<Zap size={13} />} label="XP Earned" value={`+${stats.xp}`} color="amber" />
                <StatCard icon={<AlertTriangle size={13} />} label="Collisions" value={stats.totalCollisions.toString()} color="rose" />
                <StatCard icon={<BarChart2 size={13} />} label="Highest Difficulty" value={stats.highestDifficulty.toUpperCase()} color="violet" />
              </div>
              {stats.writingChallengesAttempted > 0 && (
                <div className="text-xs text-slate-500 text-center pt-1">
                  ✍️ {stats.writingChallengesAttempted} writing challenge{stats.writingChallengesAttempted !== 1 ? 's' : ''} attempted
                </div>
              )}
            </>
          )}

          {/* ── DIFFICULTY BREAKDOWN ────────────────────────────── */}
          {activeTab === 'difficulty' && (
            <div className="space-y-2.5">
              {(['easy', 'medium', 'hard'] as ObstacleDifficulty[]).map((diff) => {
                const ds = stats.difficultyStats[diff];
                const acc = ds.attempted > 0 ? Math.round((ds.correct / ds.attempted) * 100) : null;
                const meta = DIFF_LABELS[diff];
                return (
                  <div key={diff} className={`rounded-2xl border p-3 ${meta.bg}`}>
                    <div className={`text-xs font-extrabold uppercase tracking-wider mb-2 ${meta.color}`}>
                      {meta.label}
                    </div>
                    {ds.attempted === 0 ? (
                      <div className="text-xs text-slate-400">No questions at this level</div>
                    ) : (
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <div className="text-lg font-black font-mono">{ds.attempted}</div>
                          <div className="text-[10px] text-slate-500">Questions</div>
                        </div>
                        <div>
                          <div className="text-lg font-black font-mono text-emerald-700">{ds.correct}</div>
                          <div className="text-[10px] text-slate-500">Correct</div>
                        </div>
                        <div>
                          <div className="text-lg font-black font-mono text-rose-700">{ds.wrong}</div>
                          <div className="text-[10px] text-slate-500">Wrong</div>
                        </div>
                        <div>
                          <div className={`text-lg font-black font-mono ${(acc ?? 0) >= 70 ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {acc}%
                          </div>
                          <div className="text-[10px] text-slate-500">Accuracy</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ── MISTAKES ────────────────────────────────────────── */}
          {activeTab === 'mistakes' && (
            <div className="space-y-2">
              {stats.mistakes.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <div className="text-sm font-bold text-slate-700">No mistakes — perfect run!</div>
                </div>
              ) : (
                stats.mistakes.map((m, i) => {
                  const practiceItem = getItemById(m.questionId);
                  const practiceUrl = practiceItem
                    ? `/practice/${practiceItem.category}/${practiceItem.id}`
                    : null;
                  return (
                    <div key={`${m.questionId}-${i}`} className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-black font-mono text-rose-900">{m.japanese}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${DIFF_LABELS[m.difficulty].bg} ${DIFF_LABELS[m.difficulty].color}`}>
                          {DIFF_LABELS[m.difficulty].label}
                        </span>
                      </div>
                      <div className="text-slate-600">{m.prompt}</div>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex gap-1.5">
                          <span className="text-rose-600 font-semibold">Your answer:</span>
                          <span className="font-mono">{m.playerAnswer}</span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="text-emerald-700 font-semibold">Correct:</span>
                          <span className="font-mono font-bold">{m.correctAnswer} ({m.romaji}{m.meaning ? ` — ${m.meaning}` : ''})</span>
                        </div>
                      </div>
                      {m.isWriting && m.writingScore !== undefined && (
                        <div className="text-slate-500">Handwriting score: {m.writingScore}/100</div>
                      )}
                      <div className="text-slate-500 italic">{m.explanation}</div>
                      {practiceUrl && (
                        <button
                          type="button"
                          onClick={() => navigate(practiceUrl)}
                          className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold transition-colors cursor-pointer"
                        >
                          <PenTool size={10} />
                          Practice "{m.japanese}" Now
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* ── TIPS ────────────────────────────────────────────── */}
          {activeTab === 'tips' && (
            <div className="space-y-2.5">
              {recommendations.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200">
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-900">{tip}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="p-4 pt-2 space-y-2 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-700 hover:to-rose-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
          >
            <RotateCcw size={16} /> Play Again
          </button>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onChangeAvatar}
              className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              <User size={13} /> Change Avatar
            </button>
            <button
              type="button"
              onClick={() => navigate('/beginner')}
              className="py-2.5 px-4 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              <BookOpen size={13} /> Back to Learning
            </button>
          </div>

          {stats.mistakes.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab('mistakes')}
              className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-semibold rounded-2xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer text-xs"
            >
              <AlertTriangle size={13} /> Review {stats.mistakes.length} Mistake{stats.mistakes.length !== 1 ? 's' : ''}
              <ChevronRight size={13} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Reusable stat card ──────────────────────────────────────────────────────
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}

const COLOR_MAP: Record<string, string> = {
  emerald: 'text-emerald-700 bg-emerald-50/70 border-emerald-200/60',
  rose: 'text-rose-700 bg-rose-50/70 border-rose-200/60',
  teal: 'text-teal-700 bg-teal-50/70 border-teal-200/60',
  orange: 'text-orange-700 bg-orange-50/70 border-orange-200/60',
  indigo: 'text-indigo-700 bg-indigo-50/70 border-indigo-200/60',
  amber: 'text-amber-700 bg-amber-50/70 border-amber-200/60',
  violet: 'text-violet-700 bg-violet-50/70 border-violet-200/60',
};

const StatCard: React.FC<StatCardProps> = ({ icon, label, value, color }) => (
  <div className={`p-2.5 rounded-xl border ${COLOR_MAP[color] ?? ''}`}>
    <div className={`flex items-center gap-1.5 text-xs font-semibold ${COLOR_MAP[color]?.split(' ')[0] ?? ''}`}>
      {icon} {label}
    </div>
    <div className="text-lg font-bold mt-0.5 font-mono text-slate-900">
      {value}
    </div>
  </div>
);
