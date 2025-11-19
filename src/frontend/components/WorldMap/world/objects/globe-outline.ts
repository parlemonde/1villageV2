import { BackSide, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

export class GlobeOutline extends Mesh {
  constructor(radius: number, color: number, width: number, visibleByDefault = false) {
    const material = new MeshBasicMaterial({ color, side: BackSide });
    const geometry = new SphereGeometry(radius + width, 75, 75);
    super(geometry, material);

    // By default, the outline is not visible
    this.visible = visibleByDefault;
    this.name = 'globe-outline';
  }
}
