import type { AvatarOption } from './types';

/**
 * Avatar configuration with per-avatar backgrounds.
 * backgroundPath falls back to the default environment if the specific
 * background file does not exist (handled by AssetManager).
 */
export const AVATAR_OPTIONS: AvatarOption[] = [
  {
    id: 'user',
    name: 'Sensei',
    japaneseName: '先生',
    title: 'Kana Master',
    description: 'Pixel-art runner character with green striped shirt & blue aura.',
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500',
    badge: 'Supplied Asset',
    isCustomAsset: true,
    imagePath: '/assets/game/avatar_user.png',
    backgroundPath: '/assets/game/environment.png',
  },
  {
    id: 'shinchan',
    name: 'Shinchan',
    japaneseName: '野原 しんのすけ',
    title: 'Kasukabe Runner',
    description: 'Energetic and mischievous runner ready for village adventures.',
    color: 'from-rose-500 to-amber-500',
    borderColor: 'border-rose-400',
    badge: 'Supplied Asset',
    isCustomAsset: true,
    imagePath: '/assets/game/avatar_shinchan.png',
    backgroundPath: '/assets/game/bg_shinchan.png',
  },
  {
    id: 'doraemon',
    name: 'Doraemon',
    japaneseName: 'ドラえもん',
    title: '22nd-Century Cat Robot',
    description: 'Equipped with futuristic gadgets to master Japanese vocabulary.',
    color: 'from-sky-500 to-blue-600',
    borderColor: 'border-sky-400',
    badge: 'Supplied Asset',
    isCustomAsset: true,
    imagePath: '/assets/game/avatar_doraemon.png',
    backgroundPath: '/assets/game/bg_doraemon.png',
  },
  {
    id: 'naruto',
    name: 'Naruto',
    japaneseName: 'うずまき ナルト',
    title: 'Hidden Leaf Ninja',
    description: 'Steadfast shinobi dashing forward at lightning ninja speed.',
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-400',
    badge: 'Supplied Asset',
    isCustomAsset: true,
    imagePath: '/assets/game/avatar_naruto.png',
    backgroundPath: '/assets/game/bg_naruto.png',
  },
];
