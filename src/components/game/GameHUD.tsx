import React from 'react';
import type { GameHUDStats } from '../../game/types';

interface GameHUDProps {
  stats: GameHUDStats;
}

/**
 * Authentic 13x11 Retro Pixel-Art Heart Sprite with thick dark outline,
 * crimson fill, lower shadow pixels, and upper-left specular highlight.
 */
const PixelHeart: React.FC<{ filled: boolean }> = ({ filled }) => {
  const fillMain = filled ? '#e6192e' : '#3a2e39';
  const fillShadow = filled ? '#a80d1e' : '#261e26';
  const fillHighlight = filled ? '#ff99a8' : '#524350';
  const outline = '#180e12';

  return (
    <svg
      viewBox="0 0 13 11"
      className="w-6 h-5 sm:w-8 sm:h-7 md:w-9 md:h-8 drop-shadow-[0_3px_0_rgba(15,10,6,0.85)] transition-transform duration-200"
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {/* Outer Dark Pixel Outline */}
      <path
        fill={outline}
        d="
          M2,0 h3 v1 h1 v1 h1 v-1 h1 v-1 h3 v1 h1 v1 h1 v4 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-3 v-1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-4 h1 v-1 h1 z
        "
      />
      {/* Main Heart Pixel Fill */}
      <path
        fill={fillMain}
        d="
          M2,1 h3 v1 h1 v1 h1 v-1 h1 v-1 h3 v1 h1 v4 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-3 v-1 h-1 v-1 h-1 v-1 h-1 v-1 h-1 v-4 h1 z
        "
      />
      {/* Bottom/Right Pixel Shading */}
      <path
        fill={fillShadow}
        d="
          M10,2 h1 v4 h-1 v1 h-1 v1 h-1 v1 h-1 v1 h-2 v-1 h1 v-1 h1 v-1 h1 v-1 h1 v-4 z
        "
      />
      {/* Top-Left Specular Pixel Highlight */}
      <rect x="2" y="2" width="2" height="1" fill={fillHighlight} />
      <rect x="2" y="3" width="1" height="1" fill={fillHighlight} />
    </svg>
  );
};

const PIXEL_TEXT_STYLE: React.CSSProperties = {
  fontFamily:
    '"Press Start 2P", "Courier New", Consolas, "Liberation Mono", monospace',
  color: '#fff8e1',
  textShadow: [
    '-2px -2px 0 #180e12',
    '2px -2px 0 #180e12',
    '-2px 2px 0 #180e12',
    '2px 2px 0 #180e12',
    '0px -2px 0 #180e12',
    '0px 2px 0 #180e12',
    '-2px 0px 0 #180e12',
    '2px 0px 0 #180e12',
    '0px 4px 0 #0d0709',
  ].join(', '),
  letterSpacing: '0.06em',
};

export const GameHUD: React.FC<GameHUDProps> = ({ stats }) => {
  // Format score with minimum 5 digits and leading zeros (e.g. 00000, 01240)
  const formattedScore = String(Math.max(0, Math.floor(stats.score))).padStart(
    5,
    '0'
  );

  return (
    <div
      className="absolute top-0 left-0 right-0 z-20 pointer-events-none select-none px-3 pt-2.5 sm:px-6 sm:pt-4"
      data-testid="game-hud"
    >
      {/* Primary Top HUD Row directly over the background */}
      <div className="w-full grid grid-cols-3 items-center gap-1">
        {/* TOP-LEFT: SCORE: 01240 */}
        <div className="flex items-center justify-start">
          <span
            style={PIXEL_TEXT_STYLE}
            className="text-sm sm:text-xl md:text-2xl font-black uppercase whitespace-nowrap"
            data-testid="hud-score"
          >
            SCORE: {formattedScore}
          </span>
        </div>

        {/* TOP-CENTER: Three red pixel-art hearts with dark outlines */}
        <div
          className="flex items-center justify-center gap-1.5 sm:gap-2.5"
          aria-label={`Lives: ${stats.lives} of 3`}
          data-testid="hud-hearts"
        >
          {[1, 2, 3].map((heartIndex) => (
            <PixelHeart key={heartIndex} filled={heartIndex <= stats.lives} />
          ))}
        </div>

        {/* TOP-RIGHT: COMBO: x5 */}
        <div className="flex items-center justify-end">
          <span
            style={PIXEL_TEXT_STYLE}
            className="text-sm sm:text-xl md:text-2xl font-black uppercase whitespace-nowrap"
            data-testid="hud-combo"
          >
            COMBO: x{stats.streak}
          </span>
        </div>
      </div>

      {/* Subtle Secondary Pixel Status Row (Difficulty & Speed %) directly on background */}
      <div className="w-full flex items-center justify-between mt-1 sm:mt-1.5 opacity-95">
        <span
          style={PIXEL_TEXT_STYLE}
          className="text-[10px] sm:text-xs font-extrabold uppercase"
          data-testid="hud-difficulty"
        >
          {stats.currentDifficulty.toUpperCase()} MODE
        </span>

        <span
          style={PIXEL_TEXT_STYLE}
          className="text-[10px] sm:text-xs font-extrabold uppercase"
          data-testid="hud-speed"
        >
          SPEED: {stats.speedPercent}%
        </span>
      </div>

      {/* Difficulty Progression Transition Banner */}
      {stats.difficultyNotice && (
        <div className="mt-3 flex justify-center animate-bounce">
          <span
            style={PIXEL_TEXT_STYLE}
            className="px-4 py-1.5 bg-slate-950/75 border-2 border-amber-400 rounded-lg text-xs sm:text-sm font-black uppercase text-amber-300"
          >
            {stats.difficultyNotice}
          </span>
        </div>
      )}
    </div>
  );
};
