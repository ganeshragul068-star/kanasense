import React from 'react';
import { Check, Sparkles, X, Play, Layers } from 'lucide-react';
import { AVATAR_OPTIONS } from '../../game/avatarData';
import type { AvatarId } from '../../game/types';
import type { LevelId } from '../../types/learning';

interface AvatarSelectModalProps {
  isOpen: boolean;
  selectedAvatar: AvatarId;
  selectedLevel: LevelId;
  onSelectAvatar: (id: AvatarId) => void;
  onSelectLevel: (level: LevelId) => void;
  onClose: () => void;
  onStartGame?: () => void;
}

const LEVEL_CARDS: {
  id: LevelId;
  title: string;
  subtitle: string;
  badge: string;
}[] = [
  {
    id: 'beginner',
    title: 'BEGINNER',
    subtitle: 'Hiragana, Katakana & Numbers',
    badge: '入門',
  },
  {
    id: 'intermediate',
    title: 'INTERMEDIATE',
    subtitle: 'Countries, Dates, Days, Months & Daily Words',
    badge: '中級',
  },
  {
    id: 'advanced',
    title: 'ADVANCED',
    subtitle: 'Basic, Intermediate & Challenging Vocabulary',
    badge: '上級',
  },
];

export const AvatarSelectModal: React.FC<AvatarSelectModalProps> = ({
  isOpen,
  selectedAvatar,
  selectedLevel,
  onSelectAvatar,
  onSelectLevel,
  onClose,
  onStartGame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] text-slate-900">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-200" />
              <h2 className="text-lg sm:text-xl font-black tracking-wide uppercase">
                CHOOSE YOUR CHARACTER
              </h2>
            </div>
            <p className="text-xs text-rose-100 mt-0.5">
              Select your runner sprite and Japanese learning level
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close character selection"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Learning Level Selector */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Layers size={15} className="text-rose-600" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                1. Select Learning Level
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {LEVEL_CARDS.map((lvl) => {
                const active = selectedLevel === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => onSelectLevel(lvl.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                      active
                        ? 'border-rose-500 bg-rose-50/60 shadow-sm ring-2 ring-rose-400/30'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                        {lvl.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-serif">
                        {lvl.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      {lvl.subtitle}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Avatar Cards Grid */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={15} className="text-emerald-600" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
                2. Select Runner Character
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {AVATAR_OPTIONS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.id;
                return (
                  <div
                    key={avatar.id}
                    onClick={() => onSelectAvatar(avatar.id)}
                    data-testid={`avatar-card-${avatar.id}`}
                    className={`relative flex flex-col p-3.5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/40 shadow-md ring-2 ring-emerald-400/40'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      {/* Avatar Sprite Preview */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                        <img
                          src={avatar.imagePath}
                          alt={avatar.name}
                          className="w-full h-full object-contain p-1"
                          style={{ imageRendering: 'pixelated' }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-semibold text-rose-600 font-serif">
                          {avatar.japaneseName}
                        </div>
                        <div className="text-base font-extrabold text-slate-900 truncate">
                          {avatar.name}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {avatar.title}
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                          {avatar.description}
                        </p>
                      </div>

                      {isSelected && (
                        <span className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs shrink-0">
                          <Check size={14} className="stroke-[3]" />
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-600">
            Selected:{' '}
            <span className="font-bold text-slate-900">
              {AVATAR_OPTIONS.find((a) => a.id === selectedAvatar)?.name}
            </span>{' '}
            • Level:{' '}
            <span className="font-bold text-rose-600 uppercase">
              {selectedLevel}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Close
            </button>
            {onStartGame && (
              <button
                type="button"
                data-testid="start-game-button"
                onClick={() => {
                  onClose();
                  onStartGame();
                }}
                className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Play size={15} className="fill-white" />
                <span>START GAME</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
