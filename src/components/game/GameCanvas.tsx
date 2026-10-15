import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../../game/GameEngine';
import { assetManager } from '../../game/assetLoader';

interface GameCanvasProps {
  engine: GameEngine;
  isFullscreen?: boolean;
  onCanvasClick?: () => void;
}

interface SakuraPetal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, isFullscreen, onCanvasClick }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [assetsReady, setAssetsReady] = useState(false);

  // Background atmospheric sakura petals
  const petalsRef = useRef<SakuraPetal[]>([]);

  useEffect(() => {
    assetManager.preloadAll().then(() => {
      setAssetsReady(true);
    });

    const petals: SakuraPetal[] = [];
    for (let i = 0; i < 20; i++) {
      petals.push({
        x: Math.random() * 960,
        y: Math.random() * 540,
        size: 3 + Math.random() * 5,
        speedX: -20 - Math.random() * 35,
        speedY: 15 + Math.random() * 25,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 2,
        opacity: 0.35 + Math.random() * 0.4,
      });
    }
    petalsRef.current = petals;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let lastRenderTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastRenderTime) / 1000, 0.1);
      lastRenderTime = now;

      const config = engine.getConfig();
      const player = engine.getPlayer();
      const obstacles = engine.getObstacles();
      const bgOffset = engine.getBgOffset();
      const state = engine.getState();
      const stats = engine.getStats();
      const selectedAvatar = engine.getAvatar();

      // Configure crisp pixelated rendering
      ctx.imageSmoothingEnabled = false;

      // 1. Draw Clean Parallax Background Scenery (avatar-specific or default)
      const bgImg = assetManager.getBackgroundForAvatar(selectedAvatar);
      if (bgImg) {
        const bgW = config.virtualWidth;
        const bgH = config.virtualHeight;
        const xOffset = -(bgOffset % bgW);

        ctx.drawImage(bgImg, xOffset, 0, bgW, bgH);
        ctx.drawImage(bgImg, xOffset + bgW, 0, bgW, bgH);
        if (xOffset + bgW < config.virtualWidth) {
          ctx.drawImage(bgImg, xOffset + bgW * 2, 0, bgW, bgH);
        }
      } else {
        ctx.fillStyle = '#fce7f3';
        ctx.fillRect(0, 0, config.virtualWidth, config.virtualHeight);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(0, config.groundY, config.virtualWidth, config.virtualHeight - config.groundY);
      }

      // 2. Ambient Sakura Petals
      ctx.save();
      const petals = petalsRef.current;
      const isMoving = state === 'RUNNING' || state === 'COLLISION' || state === 'SUCCESS';
      for (let i = 0; i < petals.length; i++) {
        const p = petals[i];
        if (isMoving) {
          p.x += p.speedX * dt - (stats.speedPercent / 100) * 40 * dt;
          p.y += p.speedY * dt;
          p.rotation += p.rotationSpeed * dt;
        }

        if (p.x < -10) p.x = config.virtualWidth + 10;
        if (p.y > config.virtualHeight) {
          p.y = -10;
          p.x = Math.random() * config.virtualWidth;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = `rgba(244, 114, 182, ${p.opacity})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      // 3. Draw Obstacles
      for (const obs of obstacles) {
        ctx.save();

        // Ground shadow for obstacles
        if (obs.def.ground) {
          ctx.fillStyle = 'rgba(15, 23, 42, 0.22)';
          ctx.beginPath();
          ctx.ellipse(
            obs.x + obs.width / 2,
            config.groundY - 2,
            obs.width * 0.42,
            5,
            0,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }

        const obsImg = assetManager.getImage(`obstacle_${obs.def.id}`);

        if (obs.cleared) {
          ctx.globalAlpha = 0.35;
        }

        if (obsImg) {
          if (obs.def.rolling) {
            ctx.translate(obs.x + obs.width / 2, obs.y + obs.height / 2);
            ctx.rotate(obs.rotation);
            ctx.drawImage(obsImg, -obs.width / 2, -obs.height / 2, obs.width, obs.height);
          } else {
            ctx.drawImage(obsImg, obs.x, obs.y, obs.width, obs.height);
          }
        } else {
          ctx.fillStyle = '#e11d48';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
        }

        ctx.restore();
      }

      // 4. Draw Player Shadow & Selected Avatar Sprite
      const playerY = player.y + player.bobOffset;
      const distFromGround = config.groundY - (playerY + player.height);
      const shadowScale = Math.max(0.3, 1 - distFromGround / 220);
      const shadowAlpha = Math.max(0.08, 0.28 * shadowScale);

      ctx.save();
      ctx.fillStyle = `rgba(15, 23, 42, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(
        player.x + player.width / 2,
        config.groundY - 3,
        player.width * 0.4 * shadowScale,
        5 * shadowScale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      // Draw Player Avatar using selectedAvatar ('user' | 'doraemon' | 'shinchan' | 'naruto')
      ctx.save();

      if (player.invulnerableTime > 0) {
        const isBlink = Math.floor(now / 80) % 2 === 0;
        ctx.globalAlpha = isBlink ? 0.35 : 0.85;
      }

      let tilt = 0;
      if (!player.isGrounded) {
        tilt = player.vy < 0 ? -0.07 : 0.05;
      }

      ctx.translate(player.x + player.width / 2, playerY + player.height / 2);
      ctx.rotate(tilt);

      const avatarImg =
        assetManager.getImage(`avatar_${selectedAvatar}`) ||
        assetManager.getImage('avatar_user');

      if (avatarImg) {
        // Maintain proportional aspect ratio based on image's natural dimensions
        const aspect = avatarImg.naturalWidth / Math.max(1, avatarImg.naturalHeight);
        const drawH = player.height;
        const drawW = Math.round(drawH * aspect);
        ctx.drawImage(avatarImg, -drawW / 2, -drawH / 2, drawW, drawH);
      } else {
        ctx.fillStyle = '#059669';
        ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
      }

      ctx.restore();

      // 5. Collision / Success Visual Flash
      if (state === 'COLLISION') {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.22)';
        ctx.fillRect(0, 0, config.virtualWidth, config.virtualHeight);
      } else if (state === 'SUCCESS') {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.fillRect(0, 0, config.virtualWidth, config.virtualHeight);
      }

      // 6. Ready State Overlay Prompt
      if (state === 'READY') {
        ctx.save();
        ctx.fillStyle = 'rgba(15, 23, 42, 0.50)';
        ctx.fillRect(0, 0, config.virtualWidth, config.virtualHeight);

        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 26px sans-serif';
        ctx.fillText(
          'PRESS SPACE / TAP TO START!',
          config.virtualWidth / 2,
          config.virtualHeight / 2 - 22
        );

        ctx.font = '15px sans-serif';
        ctx.fillStyle = '#fecdd3';
        ctx.fillText(
          'Jump over 1–5 obstacles, then answer a Japanese question to keep running!',
          config.virtualWidth / 2,
          config.virtualHeight / 2 + 14
        );

        ctx.font = '13px sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.fillText(
          'Space / ↑ to jump   •   P to pause   •   R to restart',
          config.virtualWidth / 2,
          config.virtualHeight / 2 + 42
        );
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [engine, assetsReady]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (engine.getState() === 'READY') {
      engine.start();
    } else if (engine.getState() === 'RUNNING') {
      engine.jump();
    }
    if (onCanvasClick) onCanvasClick();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-[16/9] ${
        isFullscreen
          ? 'h-full max-h-[100dvh] rounded-none border-0 shadow-none'
          : 'max-h-[82vh] mx-auto rounded-2xl shadow-2xl border-4 border-slate-800'
      } overflow-hidden bg-slate-900 select-none cursor-pointer flex items-center justify-center`}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <canvas
        ref={canvasRef}
        width={960}
        height={540}
        className="w-full h-full block object-contain"
        style={{
          imageRendering: 'pixelated',
          touchAction: 'none',
        }}
      />

      {!assetsReady && (
        <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-white">
          <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p className="text-sm font-semibold tracking-wider font-mono">
            Loading Japanese Runner Assets...
          </p>
        </div>
      )}
    </div>
  );
};
