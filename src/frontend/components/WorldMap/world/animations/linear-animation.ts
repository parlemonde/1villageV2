import type { Animation } from './animations';

export class LinearAnimation implements Animation {
  private current: number;
  private to: number;
  private speed: number;
  private updateCallback: (newValue: number) => void;

  constructor(from: number, to: number, duration: number, updateCallback: (newValue: number) => void) {
    this.current = from;
    this.to = to;

    this.speed = (to - from) / duration;
    if (Math.abs(this.speed) < 1e-5) {
      this.speed = Math.sign(this.speed) * 1e-5;
    }
    this.updateCallback = updateCallback;
  }

  public animate(dt: number) {
    this.current = this.current + this.speed * dt;
    if (this.speed >= 0 && this.current > this.to) {
      this.current = this.to;
    } else if (this.speed < 0 && this.current < this.to) {
      this.current = this.to;
    }
    this.updateCallback(this.current);
    return Math.abs(this.current - this.to) > 1e-5;
  }
}
