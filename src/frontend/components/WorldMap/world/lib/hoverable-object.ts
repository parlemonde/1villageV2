import type { Object3D, Scene } from 'three';

export interface HoverableObject<T extends Record<string, unknown> = Record<string, unknown>> extends Object3D {
  userData: T & {
    isHoverable: true;
    hoverableViews: ('earth' | 'global' | 'pelico')[];
    hovarableTargets?: Object3D[];
    cursor?: React.CSSProperties['cursor'];
  };
  onMouseEnter(): void;
  onMouseLeave(): void;
}

export const isHoverable = (object?: Object3D | null): object is HoverableObject =>
  object !== null && object !== undefined && object.userData && object.userData.isHoverable;

export const onResetHoveredObject = (id: number | null, scene: Scene) => {
  if (id === null) {
    return;
  }
  const previousObject = scene.getObjectById(id);
  if (isHoverable(previousObject)) {
    previousObject.onMouseLeave();
  }
};
