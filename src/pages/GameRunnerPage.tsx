import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
  User,
  Sparkles,
  ArrowUp,
  PenTool,
  ShieldAlert,
  CheckCircle2,
  Flame,
  SlidersHorizontal,
  BookOpen,
  Maximize,
  Minimize,
  ChevronLeft,
  Smartphone,
  X,
} from 'lucide-react';
import { GameEngine } from '../game/GameEngine';
import type {
  GameHUDStats,
  GameState,
  AvatarId,
  GameQuestion,
  GameSessionConfig,
} from '../game/types';
import { createDefaultSessionConfig } from '../game/types';
import type { LevelId } from '../types/learning';
import { AVATAR_OPTIONS } from '../game/avatarData';
import { GameHUD } from '../components/game/GameHUD';
import { GameCanvas } from '../components/game/GameCanvas';
import { StudiedRangeModal } from '../components/game/StudiedRangeModal';
import { GameOverModal } from '../components/game/GameOverModal';
import { QuestionPopup } from '../components/game/QuestionPopup';
import { WritingChallenge } from '../components/game/WritingChallenge';
import { soundEffects } from '../game/soundEffects';
import { avatarMusicManager } from '../game/avatarMusicManager';

export const GameRunnerPage: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engine = useMemo(() => new GameEngine(), []);

  const [stats, setStats] = useState<GameHUDStats>(engine.getStats());
  const [gameState, setGameState] = useState<GameState>(engine.getState());
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarId>(engine.getAvatar());
  const [selectedLevel, setSelectedLevel] = useState<LevelId>(engine.getLevel());
  const [activeQuestion, setActiveQuestion] = useState<GameQuestion | null>(engine.getActiveQuestion());
  const [isMuted, setIsMuted] = useState(soundEffects.getMuted());
  const [setupModalOpen, setSetupModalOpen] = useState(true);
  const [showTestDrawer, setShowTestDrawer] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<GameSessionConfig>(createDefaultSessionConfig());

  // Fullscreen state
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));

  // Mobile portrait orientation detection
  const [isPortrait, setIsPortrait] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < window.innerHeight && window.innerWidth < 1024
  );
  const [dismissRotatePrompt, setDismissRotatePrompt] = useState(false);

  // Subscribe to engine state
  useEffect(() => {
    const unsubscribe = engine.subscribe((newStats, newState, question) => {
      setStats({ ...newStats });
      setGameState(newState);
      setActiveQuestion(question);
      setSelectedAvatar(engine.getAvatar());
      setSelectedLevel(engine.getLevel());
    });

    return () => {
      unsubscribe();
      engine.destroy();
    };
  }, [engine]);

  // Fullscreen event listener sync
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Screen orientation & resize listener
  useEffect(() => {
    const checkOrientation = () => {
      setIsPortrait(window.innerWidth < window.innerHeight && window.innerWidth < 1024);
    };
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Pause automatically if document becomes hidden (tab switch, phone call, minimized)
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        if (engine.getState() === 'RUNNING') {
          engine.pause();
        }
        avatarMusicManager.pause();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [engine]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        const target = containerRef.current || document.documentElement;
        if (target.requestFullscreen) {
          await target.requestFullscreen();
        } else if ((target as any).webkitRequestFullscreen) {
          await (target as any).webkitRequestFullscreen();
        }
        // Attempt landscape lock where supported (e.g. Chrome on Android)
        if (screen.orientation && 'lock' in screen.orientation) {
          (screen.orientation as any).lock('landscape').catch(() => {
            // Graceful fallback: non-blocking toast remains available
          });
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any)?.webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        }
        if (screen.orientation && 'unlock' in screen.orientation) {
          (screen.orientation as any).unlock?.();
        }
      }
    } catch (err) {
      console.warn('Fullscreen action unavailable:', err);
    }
  };

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (engine.getState() === 'QUESTION' || setupModalOpen) {
        return;
      }

      if (
        e.code === 'Space' ||
        e.code === 'ArrowUp' ||
        e.key === 'w' ||
        e.key === 'W'
      ) {
        e.preventDefault();
        if (engine.getState() === 'READY') {
          engine.start();
        } else if (engine.getState() === 'RUNNING') {
          engine.jump();
        }
      } else if (e.key === 'p' || e.key === 'P') {
        if (engine.getState() === 'RUNNING') {
          engine.pause();
        } else if (engine.getState() === 'PAUSED') {
          engine.resume();
        }
      } else if (e.key === 'r' || e.key === 'R') {
        engine.reset();
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [engine, setupModalOpen]);

  // ── Avatar Background Music ───────────────────────────────────────────────
  // React to game-state changes to play / pause / stop avatar music.
  useEffect(() => {
    switch (gameState) {
      case 'RUNNING':
      case 'QUESTION':
      case 'COLLISION':
      case 'SUCCESS':
        // (Re-)play the currently selected avatar's track
        avatarMusicManager.play(selectedAvatar);
        break;
      case 'PAUSED':
        avatarMusicManager.pause();
        break;
      case 'GAME_OVER':
      case 'READY':
        avatarMusicManager.stop();
        break;
      default:
        break;
    }
  }, [gameState, selectedAvatar]);

  // Cleanup music on unmount
  useEffect(() => {
    return () => {
      avatarMusicManager.stop();
    };
  }, []);

  const toggleSound = () => {
    const muted = soundEffects.toggleMute();
    // Keep avatar music manager in sync with the global mute state
    avatarMusicManager.setMuted(muted);
    setIsMuted(muted);
  };

  const handleStartOrJump = () => {
    if (gameState === 'READY') {
      engine.start();
    } else if (gameState === 'RUNNING') {
      engine.jump();
    } else if (gameState === 'PAUSED') {
      engine.resume();
    }
  };

  const handlePlayAgain = () => {
    engine.start();
  };

  /** Called when the setup modal emits a confirmed config + start action */
  const handleStartGame = (config: GameSessionConfig) => {
    setSessionConfig(config);
    engine.setSessionConfig(config);
    setSetupModalOpen(false);
    engine.start();
  };

  /** Open the setup modal — pause game first if running */
  const openSetupModal = () => {
    if (engine.getState() === 'RUNNING') {
      engine.pause();
    }
    setSetupModalOpen(true);
  };

  const currentAvatarMeta =
    AVATAR_OPTIONS.find((a) => a.id === selectedAvatar) || AVATAR_OPTIONS[0];

  return (
    <div
      ref={containerRef}
      className={`w-full bg-slate-950 flex flex-col items-center justify-center select-none overflow-x-hidden ${
        isFullscreen
          ? 'h-screen max-h-screen p-0 m-0'
          : 'min-h-[calc(100vh-4rem)] p-1.5 sm:p-3'
      }`}
    >
      {/* Top Bar: Back to Learning + Brand + Quick Fullscreen & Range Controls */}
      <div className="w-full max-w-6xl flex items-center justify-between px-2 py-1 sm:px-3 text-slate-300 z-20 shrink-0">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/beginner')}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-[11px] sm:text-xs font-semibold text-slate-200 border border-slate-700/80 transition-colors cursor-pointer"
            title="Exit game to learning materials"
          >
            <ChevronLeft size={14} />
            <span>Back to Learning</span>
          </button>
          <div className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-slate-400">
            <span className="text-rose-500 font-black">KanaSense</span> Runner
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Fullscreen Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-[11px] sm:text-xs font-bold text-white border border-slate-700/80 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen (Esc)' : 'Play Fullscreen (F)'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? (
              <Minimize size={13} className="text-amber-400" />
            ) : (
              <Maximize size={13} className="text-rose-400" />
            )}
            <span className="hidden xs:inline">
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </span>
          </button>
        </div>
      </div>

      {/* Non-blocking Mobile Landscape Tip Banner */}
      {isPortrait && !dismissRotatePrompt && (
        <div className="w-full max-w-6xl px-2 pb-1.5 z-30 shrink-0">
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600/90 to-rose-600/90 text-white text-[11px] sm:text-xs font-medium shadow-md backdrop-blur-sm">
            <div className="flex items-center gap-2">
              <Smartphone size={13} className="rotate-90 shrink-0 text-amber-200" />
              <span>Rotate phone horizontally (landscape) for the best full-screen experience! 🔄</span>
            </div>
            <button
              type="button"
              onClick={() => setDismissRotatePrompt(true)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss orientation tip"
            >
              <X size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Coherent Relative Game Scene Container: Background + Player + Obstacles + Pixel-Art HUD Overlay */}
      <div
        className={`relative w-full max-w-6xl mx-auto ${
          isFullscreen ? 'flex-1 h-full max-h-screen flex items-center justify-center' : ''
        }`}
        data-testid="game-scene-container"
      >
        {/* Pixel-Art HUD Directly Over Top of Japanese Background */}
        <GameHUD stats={stats} />

        {/* Game Canvas (Clean Japanese Pixel-Art Scenery + Selected Avatar + Obstacles) */}
        <GameCanvas
          engine={engine}
          isFullscreen={isFullscreen}
          onCanvasClick={handleStartOrJump}
        />

        {/* Compact In-Scene Bottom-Left Controls Overlay */}
        <div className="absolute bottom-2.5 left-2.5 sm:bottom-4 sm:left-4 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Studied Range / Avatar button */}
          <button
            type="button"
            onClick={openSetupModal}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 border border-slate-700/90 text-[11px] sm:text-xs font-bold text-white shadow-md backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Edit studied range and character"
          >
            <User size={13} className="text-rose-400" />
            <span>{currentAvatarMeta.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/30 text-rose-200 uppercase">
              {selectedLevel}
            </span>
          </button>

          {/* Edit Studied Range quick button */}
          <button
            type="button"
            onClick={openSetupModal}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 border border-slate-700/90 text-[11px] sm:text-xs font-bold text-amber-300 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Edit studied range"
          >
            <BookOpen size={13} />
            <span className="hidden sm:inline">Edit Range</span>
          </button>

          {gameState === 'RUNNING' ? (
            <button
              type="button"
              onClick={() => engine.pause()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 border border-slate-700/90 text-[11px] sm:text-xs font-bold text-amber-300 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
              aria-label="Pause game"
            >
              <Pause size={13} />
              <span>Pause</span>
            </button>
          ) : gameState === 'PAUSED' ? (
            <button
              type="button"
              onClick={() => engine.resume()}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-[11px] sm:text-xs font-bold text-white shadow-md transition-colors cursor-pointer"
              aria-label="Resume game"
            >
              <Play size={13} />
              <span>Resume</span>
            </button>
          ) : null}

          <button
            type="button"
            onClick={toggleSound}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/85 hover:bg-slate-900 border border-slate-700/90 text-slate-200 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
            aria-label={isMuted ? 'Unmute sound' : 'Mute sound'}
          >
            {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>

          <button
            type="button"
            onClick={() => engine.reset()}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-900/85 hover:bg-slate-900 border border-slate-700/90 text-slate-200 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Restart game"
            title="Restart Game"
          >
            <RotateCcw size={14} />
          </button>

          <button
            type="button"
            onClick={() => setShowTestDrawer((prev) => !prev)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-900/85 hover:bg-slate-900 border border-slate-700/90 text-[11px] font-bold text-slate-300 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Toggle test controls"
          >
            <SlidersHorizontal size={12} />
            <span className="hidden sm:inline">Test Controls</span>
          </button>
        </div>

        {/* Touch Jump Button at Bottom-Right of Game Scene (Thumb-friendly & Safe Area supported) */}
        <div className="absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-20 safe-pr safe-pb">
          <button
            type="button"
            onClick={handleStartOrJump}
            className="px-4 py-2.5 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 active:scale-95 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-2xl border-2 border-white/40 flex items-center gap-1.5 cursor-pointer select-none"
            aria-label="Jump or Start Running"
          >
            <ArrowUp size={16} className="stroke-[3]" />
            <span>{gameState === 'READY' ? 'START RUN' : 'JUMP'}</span>
          </button>
        </div>

        {/* Optional Collapsible Test & Verification Drawer Inside Scene */}
        {showTestDrawer && (
          <div className="absolute bottom-14 left-2.5 right-2.5 sm:left-4 sm:right-auto z-30 bg-slate-900/95 border border-slate-700 rounded-2xl p-3 shadow-2xl backdrop-blur-md max-w-xl">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Quick Difficulty & Event Verification ({selectedLevel.toUpperCase()})
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => engine.triggerDifficultyChallenge('easy')}
                className="px-2.5 py-1.5 bg-teal-700 hover:bg-teal-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <Sparkles size={12} /> Easy (MCQ)
              </button>
              <button
                type="button"
                onClick={() => engine.triggerDifficultyChallenge('medium')}
                className="px-2.5 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <PenTool size={12} /> Medium (Write)
              </button>
              <button
                type="button"
                onClick={() => engine.triggerDifficultyChallenge('hard')}
                className="px-2.5 py-1.5 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <ShieldAlert size={12} /> Hard Challenge
              </button>
              <button
                type="button"
                onClick={() => engine.onCorrectAnswer()}
                className="px-2.5 py-1.5 bg-sky-700 hover:bg-sky-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <CheckCircle2 size={12} /> +Correct
              </button>
              <button
                type="button"
                onClick={() => engine.onCollision()}
                className="px-2.5 py-1.5 bg-rose-700 hover:bg-rose-600 text-white font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer"
              >
                <Flame size={12} /> -1 Life
              </button>
            </div>
          </div>
        )}

        {/* Question Popup (EASY Multiple-Choice & HARD Multiple-Choice Challenges) */}
        {gameState === 'QUESTION' &&
          activeQuestion &&
          activeQuestion.interactionType === 'multiple_choice' && (
            <QuestionPopup
              key={activeQuestion.id}
              question={activeQuestion}
              onComplete={(result) => engine.resolveQuestion(result)}
            />
          )}

        {/* Writing Challenge Popup (MEDIUM Free-Style Writing & HARD Writing Challenges) */}
        {gameState === 'QUESTION' &&
          activeQuestion &&
          activeQuestion.interactionType === 'writing' && (
            <WritingChallenge
              key={activeQuestion.id}
              question={activeQuestion}
              passThreshold={engine.getConfig().gameWritingPassThreshold}
              writingScoreBonus={engine.getConfig().writingScoreBonus}
              onComplete={(result) => {
                if (result.isCorrect) {
                  engine.getStats();
                }
                engine.resolveQuestion(result);
              }}
            />
          )}

        {/* Studied-Range & Avatar Setup Modal */}
        <StudiedRangeModal
          isOpen={setupModalOpen}
          initialConfig={sessionConfig}
          onClose={() => setSetupModalOpen(false)}
          onStartGame={handleStartGame}
        />

        {/* Game Over Modal */}
        <GameOverModal
          isOpen={gameState === 'GAME_OVER'}
          stats={stats}
          onPlayAgain={handlePlayAgain}
          onChangeAvatar={() => {
            engine.reset();
            setSetupModalOpen(true);
          }}
        />
      </div>
    </div>
  );
};
