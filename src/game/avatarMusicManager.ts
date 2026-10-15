/**
 * AvatarMusicManager
 *
 * Manages looping background music per avatar during gameplay.
 *
 * Rules:
 *  - Play the selected avatar's track when the game starts.
 *  - Loop continuously during RUNNING / QUESTION / COLLISION / SUCCESS states.
 *  - Pause when the game is paused; resume when the game resumes.
 *  - Stop (and reset) when the game ends or the player restarts.
 *  - Never play two tracks simultaneously — always stop the previous one first.
 *  - Respect mute/volume state from the SoundEffects singleton.
 *  - Works around browser autoplay policy by deferring play until user gesture.
 */

import type { AvatarId } from './types';

/** Maps avatar ID → public audio path */
const AVATAR_MUSIC_MAP: Record<AvatarId, string> = {
  user: '/audio/sensei.mp3',
  shinchan: '/audio/shinchan.mp3',
  doraemon: '/audio/doraemon_instrumental.mp3',
  naruto: '/audio/naruto.mp3',
};

class AvatarMusicManager {
  private currentAvatarId: AvatarId | null = null;
  private audio: HTMLAudioElement | null = null;
  private _isMuted: boolean = false;
  private _volume: number = 0.45; // default background music volume (0–1)

  /** Whether any track is intended to be playing (not paused by game) */
  private _shouldBePlaying: boolean = false;

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Start looping the avatar's background music.
   * Stops any previously playing track first.
   */
  public play(avatarId: AvatarId): void {
    this._shouldBePlaying = true;

    // Re-use the current element if same avatar
    if (this.currentAvatarId === avatarId && this.audio) {
      this._applySettings();
      this._resumeAudio();
      return;
    }

    // Stop the previous track before starting the new one
    this.stop();

    this.currentAvatarId = avatarId;
    const src = AVATAR_MUSIC_MAP[avatarId];
    if (!src) return;

    try {
      const el = new Audio(src);
      el.loop = true;
      el.volume = this._isMuted ? 0 : this._volume;
      el.preload = 'auto';
      this.audio = el;
      this._resumeAudio();
    } catch {
      // Audio creation can fail in non-browser environments
    }
  }

  /** Pause the currently playing track (game paused). */
  public pause(): void {
    this._shouldBePlaying = false;
    if (this.audio && !this.audio.paused) {
      this.audio.pause();
    }
  }

  /**
   * Resume after game un-pause.
   * Only resumes if play() had been called previously.
   */
  public resume(): void {
    this._shouldBePlaying = true;
    this._resumeAudio();
  }

  /**
   * Fully stop and discard the current track.
   * Called on game-over or restart.
   */
  public stop(): void {
    this._shouldBePlaying = false;
    if (this.audio) {
      try {
        this.audio.pause();
        this.audio.currentTime = 0;
        this.audio.src = ''; // release resource
      } catch {
        // Ignore
      }
      this.audio = null;
    }
    this.currentAvatarId = null;
  }

  /** Set muted state — immediately applies to the active track. */
  public setMuted(muted: boolean): void {
    this._isMuted = muted;
    this._applySettings();
    // If unmuting while music should be playing, ensure it's running
    if (!muted && this._shouldBePlaying) {
      this._resumeAudio();
    }
  }

  public getMuted(): boolean {
    return this._isMuted;
  }

  /** Set volume (0–1). Immediately applies to the active track. */
  public setVolume(vol: number): void {
    this._volume = Math.max(0, Math.min(1, vol));
    this._applySettings();
  }

  public getVolume(): number {
    return this._volume;
  }

  // ── Private helpers ───────────────────────────────────────────────────────

  private _applySettings(): void {
    if (!this.audio) return;
    this.audio.volume = this._isMuted ? 0 : this._volume;
    this.audio.loop = true;
  }

  private _resumeAudio(): void {
    if (!this.audio || this._isMuted) return;
    if (this.audio.paused) {
      this.audio.play().catch(() => {
        // Browser blocked autoplay — will play on next user gesture
        // (the GameRunnerPage calls resume() on user interactions)
      });
    }
  }
}

/** Singleton — import this everywhere you need avatar music control. */
export const avatarMusicManager = new AvatarMusicManager();
