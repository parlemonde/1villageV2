import { BackSide, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

import { ImageTexture } from '../lib/image-texture';
import { BACKGROUND_IMAGE_URL } from '../world.constants';

export class Sky extends Mesh {
  constructor() {
    const skyGeometry = new SphereGeometry(50000, 75, 75);
    const defaultSkyMaterial = new MeshBasicMaterial({ map: new ImageTexture(BACKGROUND_IMAGE_URL), side: BackSide });
    super(skyGeometry, defaultSkyMaterial);

    this.name = 'sky';
  }
}
