import { BackSide, Mesh, MeshBasicMaterial, SphereGeometry, TextureLoader, SRGBColorSpace } from 'three';

const BACKGROUND_IMAGE_URL = '/static/images/night-sky.png';
const SKY_RADIUS = 10;

const textureLoader = new TextureLoader();

export class Sky extends Mesh {
    constructor() {
        const skyGeometry = new SphereGeometry(SKY_RADIUS, 64, 64);
        const defaultSkyMaterial = new MeshBasicMaterial({
            side: BackSide,
        });
        super(skyGeometry, defaultSkyMaterial);
        textureLoader.load(BACKGROUND_IMAGE_URL, (texture) => {
            texture.colorSpace = SRGBColorSpace;
            defaultSkyMaterial.map = texture;
        });
        this.name = 'sky';
    }
}
