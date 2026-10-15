import { useState, useEffect } from 'react';
import { VolumeX, X } from 'lucide-react';
import { onVoiceUnavailable, VOICE_UNAVAILABLE_MESSAGE } from '../../utils/audio';

export const VoiceAlertToast = () => {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onVoiceUnavailable((msg) => {
      setMessage(msg || VOICE_UNAVAILABLE_MESSAGE);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      setMessage(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 shrink-0 mt-0.5">
          <VolumeX size={18} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-rose-300 leading-snug">
            {message}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Writing practice and canvas interactions continue normally.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setMessage(null)}
          aria-label="Dismiss voice alert"
          className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};
