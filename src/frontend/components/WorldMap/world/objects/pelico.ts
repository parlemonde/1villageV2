import { Vector3, Group, Mesh, MeshBasicMaterial, SphereGeometry } from 'three';

import type { WorldMapUser } from '../../types';
import type { HoverableObject } from '../lib/hoverable-object';
import { ImageTexture } from '../lib/image-texture';
import { GLOBE_RADIUS, PELICO_IMAGE_URL, PELICO_USER } from '../world.constants';
import { AtmosphereGlow } from './atmosphere-glow';
import { GlobeOutline } from './globe-outline';
import { Pin } from './pin';

type User = WorldMapUser;

export class Pelico extends Group implements HoverableObject {
  public userVisibility: boolean = true;
  public userData: HoverableObject['userData'];

  constructor() {
    super();

    // Add globe
    const globeGeometry = new SphereGeometry(GLOBE_RADIUS * 0.75, 75, 75);
    const defaultGlobeMaterial = new MeshBasicMaterial({ map: new ImageTexture(PELICO_IMAGE_URL), transparent: false });
    const globeObj = new Mesh(globeGeometry, defaultGlobeMaterial);
    globeObj.name = 'globe';
    this.add(globeObj);

    // Add glow
    const glowObj = new AtmosphereGlow(GLOBE_RADIUS * 0.75);
    this.add(glowObj);

    // Add outline
    const outlineMesh1 = new GlobeOutline(GLOBE_RADIUS * 0.75, 0x000000, 2);
    const outlineMesh2 = new GlobeOutline(GLOBE_RADIUS * 0.75, 0x4c3ed9, 6);
    this.add(outlineMesh1);
    this.add(outlineMesh2);

    // Set data
    this.name = 'pelico';
    this.userData = {
      isHoverable: true,
      hoverableViews: ['global'],
      hovarableTargets: [globeObj],
    };
  }

  public addUsers(users: User[], cameraPos: Vector3) {
    this.remove(...this.children.filter((child) => child.name === 'pin'));
    // Add pelico user
    const pelicoPin = new Pin(PELICO_USER, new Vector3(0, 0, 1), true, GLOBE_RADIUS * 0.75, true);
    pelicoPin.visible = this.userVisibility;
    this.add(pelicoPin);

    // Add all users
    for (const user of users) {
      const userPin = new Pin({ ...user, position: getRandomPos() }, cameraPos, true, GLOBE_RADIUS * 0.75);
      userPin.visible = this.userVisibility;
      this.add(userPin);
    }
  }
  public setUserVisibility(isVisible: boolean) {
    this.userVisibility = isVisible;
    for (const child of this.children) {
      if (child.name === 'pin') {
        child.visible = isVisible;
      }
    }
  }

  public onMouseEnter(): void {
    for (const child of this.children) {
      if (child.name === 'globe-outline') {
        child.visible = true;
      }
    }
  }
  public onMouseLeave(): void {
    for (const child of this.children) {
      if (child.name === 'globe-outline') {
        child.visible = false;
      }
    }
  }
}

const getRandomPos = () => {
  return {
    lat: Math.round(Math.random() * 180) - 90,
    lng: Math.round(Math.random() * 360) - 180,
  };
};
