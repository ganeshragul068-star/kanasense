/**
 * Pronunciation audio utility for KanaSense.
 * Uses browser Web Speech API (speechSynthesis) configured strictly for Japanese ('ja-JP').
 *
 * Rules:
 * - Always speak the Japanese text directly (never Romaji).
 * - If no Japanese speech synthesis voice is available, show:
 *   "Japanese voice is unavailable on this device."
 * - Do not disrupt the handwriting canvas or any other application feature.
 */

export const VOICE_UNAVAILABLE_MESSAGE = 'Japanese voice is unavailable on this device.';

export interface AudioPlayResult {
  success: boolean;
  voiceAvailable: boolean;
  error?: string;
}

// Global cached Japanese voice to avoid repeated lookup overhead
let cachedJaVoice: SpeechSynthesisVoice | null = null;
let hasCheckedVoices = false;

/**
 * Searches an array of voices for a Japanese language voice.
 */
function findJapaneseVoiceInList(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;

  // 1. Exact match for ja-JP
  const exact = voices.find(
    (v) => v.lang.toLowerCase().replace('_', '-') === 'ja-jp'
  );
  if (exact) return exact;

  // 2. Any voice starting with 'ja' (e.g. ja-JP, ja, ja_JP)
  const anyJa = voices.find(
    (v) =>
      v.lang.toLowerCase().startsWith('ja') ||
      v.lang.toLowerCase().replace('_', '-').startsWith('ja-')
  );
  if (anyJa) return anyJa;

  // 3. Name includes Japanese or 日本語
  const byName = voices.find((v) => {
    const name = v.name.toLowerCase();
    return name.includes('japan') || name.includes('日本語') || name.includes('ja-jp');
  });
  if (byName) return byName;

  return null;
}

/**
 * Retrieves the available Japanese voice, waiting briefly for voiceschanged if needed.
 */
export function getJapaneseVoice(): Promise<SpeechSynthesisVoice | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve(null);
      return;
    }

    if (cachedJaVoice) {
      resolve(cachedJaVoice);
      return;
    }

    const currentVoices = window.speechSynthesis.getVoices();
    const found = findJapaneseVoiceInList(currentVoices);

    if (found) {
      cachedJaVoice = found;
      hasCheckedVoices = true;
      resolve(found);
      return;
    }

    // If voices are empty or not yet loaded, wait for voiceschanged
    let resolved = false;
    let timer: number | undefined;

    const cleanup = () => {
      if (timer) window.clearTimeout(timer);
      window.speechSynthesis.removeEventListener('voiceschanged', onVoices);
    };

    const onVoices = () => {
      if (resolved) return;
      resolved = true;
      cleanup();
      const updated = window.speechSynthesis.getVoices();
      const jaVoice = findJapaneseVoiceInList(updated);
      cachedJaVoice = jaVoice;
      hasCheckedVoices = true;
      resolve(jaVoice);
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoices);

    // Safety timeout in case voiceschanged already fired or browser has no extra voices
    timer = window.setTimeout(() => {
      if (resolved) return;
      resolved = true;
      cleanup();
      const fallbackList = window.speechSynthesis.getVoices();
      const jaVoice = findJapaneseVoiceInList(fallbackList);
      cachedJaVoice = jaVoice;
      hasCheckedVoices = true;
      resolve(jaVoice);
    }, 350);
  });
}

/**
 * Checks whether a Japanese voice is currently available on the user's device.
 */
export async function isJapaneseVoiceAvailable(): Promise<boolean> {
  const voice = await getJapaneseVoice();
  return voice !== null;
}

/**
 * Dispatches an event when Japanese voice is unavailable so UI can show the message.
 */
function notifyVoiceUnavailable(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('kanasense:voice-unavailable', {
        detail: { message: VOICE_UNAVAILABLE_MESSAGE },
      })
    );
  }
}

/**
 * Pronounces Japanese text using SpeechSynthesis.
 * IMPORTANT:
 * - Always pass the JAPANESE text to this function, never Romaji.
 * - If no Japanese voice exists, gracefully reports failure without speaking English phonetics.
 */
export async function playJapanesePronunciation(japaneseText: string): Promise<AudioPlayResult> {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    notifyVoiceUnavailable();
    return {
      success: false,
      voiceAvailable: false,
      error: VOICE_UNAVAILABLE_MESSAGE,
    };
  }

  const voice = await getJapaneseVoice();

  if (!voice) {
    notifyVoiceUnavailable();
    return {
      success: false,
      voiceAvailable: false,
      error: VOICE_UNAVAILABLE_MESSAGE,
    };
  }

  return new Promise((resolve) => {
    try {
      // Cancel previous speech to prevent queued overlapping audio
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(japaneseText);
      utterance.voice = voice;
      utterance.lang = voice.lang || 'ja-JP';
      utterance.rate = 0.85; // Learner-friendly deliberate articulation
      utterance.pitch = 1.0;

      let hasResolved = false;

      utterance.onend = () => {
        if (!hasResolved) {
          hasResolved = true;
          resolve({ success: true, voiceAvailable: true });
        }
      };

      utterance.onerror = (e) => {
        // 'canceled' or 'interrupted' is normal if user tapped another word or stopped
        if (e.error === 'canceled' || e.error === 'interrupted') {
          if (!hasResolved) {
            hasResolved = true;
            resolve({ success: true, voiceAvailable: true });
          }
          return;
        }

        if (!hasResolved) {
          hasResolved = true;
          resolve({
            success: false,
            voiceAvailable: true,
            error: `Speech playback error: ${e.error}`,
          });
        }
      };

      // Safety timeout for mobile browsers where onend occasionally fails to fire
      const maxDuration = Math.max(2500, japaneseText.length * 500);
      window.setTimeout(() => {
        if (!hasResolved) {
          hasResolved = true;
          resolve({ success: true, voiceAvailable: true });
        }
      }, maxDuration);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis playback exception:', err);
      if (!hasCheckedVoices) {
        notifyVoiceUnavailable();
      }
      resolve({
        success: false,
        voiceAvailable: false,
        error: VOICE_UNAVAILABLE_MESSAGE,
      });
    }
  });
}

/**
 * Subscribes to Japanese voice availability notifications.
 */
export function onVoiceUnavailable(callback: (msg: string) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ message: string }>;
    callback(customEvent.detail?.message || VOICE_UNAVAILABLE_MESSAGE);
  };

  window.addEventListener('kanasense:voice-unavailable', handler);
  return () => {
    window.removeEventListener('kanasense:voice-unavailable', handler);
  };
}
