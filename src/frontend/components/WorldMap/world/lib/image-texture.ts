import type { LoadingManager } from 'three';
import { Texture, Loader, Cache } from 'three';

class ImageLoader extends Loader {
  constructor(manager?: LoadingManager) {
    super(manager);
  }

  load(url: string, onLoad: (image: HTMLImageElement) => void, onError?: (error: ErrorEvent) => void): void {
    url = this.manager.resolveURL(url);
    const cached = Cache.get(url) as HTMLImageElement;
    if (cached !== undefined) {
      this.manager.itemStart(url);
      setTimeout(() => {
        onLoad(cached);
        this.manager.itemEnd(url);
      }, 0);
      return;
    }
    const image = new Image();
    const onImageLoad = () => {
      removeEventListeners();
      Cache.add(url, image);
      onLoad(image);
      this.manager.itemEnd(url);
    };
    const onImageError = (event: ErrorEvent) => {
      removeEventListeners();
      onError?.(event);
      this.manager.itemError(url);
      this.manager.itemEnd(url);
    };
    const removeEventListeners = () => {
      image.removeEventListener('load', onImageLoad, false);
      image.removeEventListener('error', onImageError, false);
    };
    image.addEventListener('load', onImageLoad, false);
    image.addEventListener('error', onImageError, false);
    this.manager.itemStart(url);
    image.crossOrigin = this.crossOrigin;
    image.src = url;
  }
}

const IMAGE_LOADER = new ImageLoader();

export class ImageTexture extends Texture {
  constructor(url: string) {
    super();
    IMAGE_LOADER.load(url, (image) => {
      this.image = image;
      this.needsUpdate = true;
    });
  }
}
