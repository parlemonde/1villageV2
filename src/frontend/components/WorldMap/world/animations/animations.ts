export interface Animation {
  animate: (dt: number) => boolean; // todo add time.
}

export class Animations {
  private animations: Animation[];
  constructor() {
    this.animations = [];
  }

  public animate(dt: number) {
    const animationsEnded: number[] = [];

    // Animate
    for (let i = 0; i < this.animations.length; i += 1) {
      const animate = this.animations[i].animate(dt);
      if (!animate) {
        animationsEnded.push(i);
      }
    }

    // Remove animation that ended
    for (const i of animationsEnded.reverse()) {
      this.animations.splice(i, 1);
    }
  }

  public addAnimation(animation: Animation) {
    this.animations.push(animation);
  }

  public cancelAnimations() {
    this.animations = [];
  }
}
