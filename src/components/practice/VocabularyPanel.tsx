import { useState } from 'react';
import {
  BookOpen,
  Sparkles,
  Globe,
  Calendar,
  Hash,
  Languages,
  Clock,
  Compass,
} from 'lucide-react';
import type { LearningItem, ExampleSentence, CategoryId } from '../../types/learning';
import { AudioButton } from '../common/AudioButton';

interface VocabularyPanelProps {
  item: LearningItem;
  className?: string;
}

/**
 * Clean, self-contained visual placeholder illustration for vocabulary items.
 * Uses inline SVG and Japanese styling without relying on external image APIs.
 */
const VocabularyPlaceholder = ({
  japanese,
  category,
}: {
  japanese: string;
  category: CategoryId;
}) => {
  // Select contextual decorative icon based on category
  const getCategoryIcon = () => {
    switch (category) {
      case 'countries':
        return <Globe className="w-8 h-8 text-rose-500/80" />;
      case 'dates':
      case 'days':
        return <Calendar className="w-8 h-8 text-amber-500/80" />;
      case 'months':
      case 'years':
        return <Clock className="w-8 h-8 text-indigo-500/80" />;
      case 'numbers':
        return <Hash className="w-8 h-8 text-teal-500/80" />;
      case 'common-expressions':
        return <Languages className="w-8 h-8 text-emerald-500/80" />;
      case 'basic-words':
      case 'intermediate-words':
      case 'advanced-words':
        return <Compass className="w-8 h-8 text-purple-500/80" />;
      default:
        return <Sparkles className="w-8 h-8 text-rose-500/80" />;
    }
  };

  return (
    <div className="w-full h-36 sm:h-40 rounded-xl bg-gradient-to-br from-rose-50/70 via-slate-50 to-amber-50/60 border border-slate-200/80 flex flex-col items-center justify-center relative overflow-hidden select-none p-4 shadow-inner">
      {/* Subtle traditional Japanese circular motif */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.06] text-slate-900"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 2" />
        <circle cx="50" cy="50" r="26" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>

      {/* Large faint kanji watermark */}
      <div
        className="absolute right-3 top-1/2 -translate-y-1/2 opacity-[0.08] text-7xl font-bold font-serif pointer-events-none select-none text-slate-900"
        aria-hidden="true"
      >
        {japanese}
      </div>

      {/* Center illustration content */}
      <div className="flex flex-col items-center justify-center gap-2 z-10 text-center">
        <div className="p-2.5 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-center">
          {getCategoryIcon()}
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 border border-slate-200 text-[11px] font-medium text-slate-600 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          <span>KanaSense Vocabulary Visual</span>
        </div>
      </div>

      {/* Traditional red corner seal stamp */}
      <div className="absolute top-2.5 left-2.5 px-1.5 py-0.5 rounded border border-rose-300 bg-rose-50/90 text-rose-700 text-[9px] font-bold tracking-widest uppercase font-serif">
        語彙
      </div>
    </div>
  );
};

export const VocabularyPanel = ({ item, className = '' }: VocabularyPanelProps) => {
  const [selectedExampleIndex, setSelectedExampleIndex] = useState(0);

  // Determine vocabulary list
  const hasExamples = Boolean(item.examples && item.examples.length > 0);

  // If item has explicit examples, derive active vocabulary entry;
  // otherwise treat the item itself as the primary vocabulary word
  const activeVocabulary: ExampleSentence = hasExamples
    ? item.examples![Math.min(selectedExampleIndex, item.examples!.length - 1)]
    : {
        japanese: item.japanese,
        romaji: item.romaji,
        english: item.meaning || 'Core Japanese Entry',
      };

  return (
    <div
      className={`bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200 flex flex-col gap-5 ${className}`}
    >
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
            <BookOpen size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base tracking-wide">
              VOCABULARY
            </h3>
            <p className="text-[11px] text-slate-400 font-medium leading-none">
              Practical Usage & Pronunciation
            </p>
          </div>
        </div>

        {item.strokeCount && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200/80">
            {item.strokeCount} Strokes
          </span>
        )}
      </div>

      {/* Multiple Examples Switcher Pills (if more than 1 example available) */}
      {hasExamples && item.examples!.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
            Words:
          </span>
          {item.examples!.map((ex, idx) => {
            const isSelected = idx === selectedExampleIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedExampleIndex(idx)}
                className={`text-xs font-medium px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-rose-600 text-white shadow-xs font-bold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ex.japanese}
              </button>
            );
          })}
        </div>
      )}

      {/* ==================================================
          REFERENCE CONCEPT CARD
          Header: VOCABULARY
          [Image if available / Clean Placeholder]
          Japanese: ...
          Romaji: ...
          English: ...
          🔊 Listen
          ================================================== */}
      <div className="flex flex-col gap-4 rounded-xl p-4 bg-slate-50/70 border border-slate-100">
        {/* Visual Media Area: Real image if available, otherwise clean styled placeholder */}
        {item.vocabularyImage ? (
          <div className="w-full h-40 rounded-xl overflow-hidden border border-slate-200 bg-white">
            <img
              src={item.vocabularyImage}
              alt={activeVocabulary.japanese}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ) : (
          <VocabularyPlaceholder
            japanese={activeVocabulary.japanese}
            category={item.category}
          />
        )}

        {/* Detailed Vocabulary Information */}
        <div className="space-y-3 pt-1">
          {/* Japanese Display */}
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Japanese:
            </span>
            <div className="text-3xl sm:text-4xl font-bold font-serif text-slate-900 tracking-wide mt-0.5">
              {activeVocabulary.japanese}
            </div>
          </div>

          {/* Romaji Display */}
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              Romaji:
            </span>
            <div className="text-base sm:text-lg font-bold font-mono text-rose-600 capitalize mt-0.5">
              {activeVocabulary.romaji}
            </div>
          </div>

          {/* English Meaning */}
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400">
              English:
            </span>
            <div className="text-sm sm:text-base font-semibold text-slate-700 mt-0.5">
              {activeVocabulary.english}
            </div>
          </div>

          {/* 🔊 Listen Button */}
          <div className="pt-2 flex items-center gap-3">
            <AudioButton
              text={activeVocabulary.japanese}
              size="md"
              showLabel
              label="Listen"
              className="shadow-xs"
            />
            <span className="text-xs text-slate-400">
              Pronounces <strong className="text-slate-600 font-serif">{activeVocabulary.japanese}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Additional Examples List (if multiple examples exist) */}
      {hasExamples && item.examples!.length > 1 && (
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            All Examples in this lesson:
          </div>
          <div className="space-y-2">
            {item.examples!.map((ex, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  idx === selectedExampleIndex
                    ? 'bg-rose-50/50 border-rose-200'
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-bold text-slate-900 font-serif text-base">
                      {ex.japanese}
                    </span>
                    <span className="text-xs font-mono text-rose-600 font-medium">
                      {ex.romaji}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 font-medium truncate">
                    {ex.english}
                  </div>
                </div>
                <AudioButton text={ex.japanese} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes / Tips (if present) */}
      {item.notes && (
        <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-start gap-2">
          <Sparkles size={14} className="text-rose-500 shrink-0 mt-0.5" />
          <p className="leading-relaxed">{item.notes}</p>
        </div>
      )}
    </div>
  );
};
