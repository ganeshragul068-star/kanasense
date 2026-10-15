import obstacleManifest from './obstacleManifest.json';
import { AVATAR_OPTIONS } from './avatarData';

class AssetManager {
  private images: Map<string, HTMLImageElement> = new Map();
  private loaded = false;
  private loadPromise: Promise<void> | null = null;
  private missingAssets: string[] = [];

  public async preloadAll(): Promise<void> {
    if (this.loaded) return;
    if (this.loadPromise) return this.loadPromise;

    const urlsToLoad = [
      ...AVATAR_OPTIONS.map((av) => ({
        id: `avatar_${av.id}`,
        src: av.imagePath,
      })),
      // Per-avatar backgrounds — fall back gracefully if missing
      ...AVATAR_OPTIONS.map((av) => ({
        id: `bg_${av.id}`,
        src: av.backgroundPath,
      })),
      // Default environment (always loaded as final fallback)
      { id: 'environment', src: '/assets/game/environment.png' },
      ...obstacleManifest.map((obs) => ({
        id: `obstacle_${obs.id}`,
        src: obs.imagePath,
      })),
    ];

    this.loadPromise = Promise.all(
      urlsToLoad.map(
        ({ id, src }) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.onload = () => {
              this.images.set(id, img);
              resolve();
            };
            img.onerror = () => {
              console.warn(`[AssetManager] Missing asset "${id}" at ${src} — using fallback.`);
              this.missingAssets.push(src);
              resolve(); // Don't block game start
            };
            img.src = src;
          })
      )
    ).then(() => {
      this.loaded = true;
    });

    return this.loadPromise;
  }

  /**
   * Get the background image for the given avatar.
   * Falls back to the generic environment if the avatar-specific bg wasn't loaded.
   */
  public getBackgroundForAvatar(avatarId: string): HTMLImageElement | undefined {
    return (
      this.images.get(`bg_${avatarId}`) ||
      this.images.get('environment')
    );
  }

  public getImage(id: string): HTMLImageElement | undefined {
    return this.images.get(id);
  }

  public getMissingAssets(): string[] {
    return this.missingAssets;
  }

  public isReady(): boolean {
    return this.loaded;
  }
}

export const assetManager = new AssetManager();
