import { useState, useRef, useEffect } from 'react';
import type React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { playJapanesePronunciation, VOICE_UNAVAILABLE_MESSAGE } from '../../utils/audio';

interface AudioButtonProps {
  /** The Japanese text to be spoken. Must ALWAYS be Japanese kana/kanji, never Romaji. */
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  label?: string;
}

export const AudioButton = ({
  text,
  className = '',
  size = 'md',
  showLabel = false,
  label = 'Listen',
}: AudioButtonProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isPlaying) return;

    setIsPlaying(true);
    setErrorMessage(null);

    const result = await playJapanesePronunciation(text);

    if (isMountedRef.current) {
      setIsPlaying(false);
      if (!result.success && !result.voiceAvailable) {
        setErrorMessage(VOICE_UNAVAILABLE_MESSAGE);
        setTimeout(() => {
          if (isMountedRef.current) {
            setErrorMessage(null);
          }
        }, 3500);
      }
    }
  };

  const sizeClasses = {
    sm: 'h-8 px-2.5 text-xs gap-1.5',
    md: 'h-10 px-3.5 text-sm gap-2',
    lg: 'h-12 px-4.5 text-base gap-2.5',
  }[size];

  const iconSizes = {
    sm: 15,
    md: 18,
    lg: 22,
  }[size];

  return (
    <div className="relative inline-flex items-center">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPlaying}
        aria-label={`Listen to Japanese pronunciation for ${text}`}
        aria-pressed={isPlaying}
        title={errorMessage || `Listen to pronunciation: ${text}`}
        className={`group inline-flex items-center justify-center font-medium rounded-full cursor-pointer transition-all duration-150 select-none shadow-xs active:scale-95 disabled:opacity-90 ${
          isPlaying
            ? 'bg-rose-600 text-white shadow-rose-300 ring-4 ring-rose-200 scale-105'
            : errorMessage
            ? 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
            : 'bg-rose-50 hover:bg-rose-100/90 text-rose-700 hover:text-rose-800 border border-rose-200 hover:border-rose-300 hover:shadow-sm'
        } ${sizeClasses} ${className}`}
      >
        {errorMessage ? (
          <VolumeX size={iconSizes} className="text-amber-600" />
        ) : isPlaying ? (
          <div className="flex items-center gap-1">
            <Volume2 size={iconSizes} className="animate-pulse" />
            {/* Visual soundwave bars */}
            <span className="flex items-end gap-0.5 h-3 ml-0.5" aria-hidden="true">
              <span className="w-0.5 bg-white rounded-full h-full animate-[pulse_0.6s_ease-in-out_infinite]" />
              <span className="w-0.5 bg-white rounded-full h-2/3 animate-[pulse_0.4s_ease-in-out_infinite_0.1s]" />
              <span className="w-0.5 bg-white rounded-full h-4/5 animate-[pulse_0.5s_ease-in-out_infinite_0.2s]" />
            </span>
          </div>
        ) : (
          <Volume2
            size={iconSizes}
            className="transition-transform group-hover:scale-110 text-rose-600"
          />
        )}

        {showLabel && (
          <span className="font-semibold tracking-wide">
            {isPlaying ? 'Playing...' : label}
          </span>
        )}
      </button>

      {/* Inline popover tooltip if voice is unavailable on device */}
      {errorMessage && (
        <div
          role="alert"
          className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 whitespace-nowrap bg-slate-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-lg border border-slate-700 animate-in fade-in zoom-in-95 duration-150 pointer-events-none"
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45 border-t border-l border-slate-700" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
