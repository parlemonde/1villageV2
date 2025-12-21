import { BackSide, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

import { ImageTexture } from './image-texture';

const BACKGROUND_IMAGE_URL = '/static/images/night-sky.png';
const SKY_RADIUS = 10;

export class Sky extends Mesh {
    constructor() {
        const skyGeometry = new SphereGeometry(SKY_RADIUS, 64, 64);
        const defaultSkyMaterial = new MeshBasicMaterial({
            map: new ImageTexture(BACKGROUND_IMAGE_URL),
            side: BackSide,
            depthWrite: false, // Don't write to depth buffer
        });
        super(skyGeometry, defaultSkyMaterial);
        this.name = 'sky';
    }
}
