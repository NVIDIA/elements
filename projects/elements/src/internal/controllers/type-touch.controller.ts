import { ReactiveElement, ReactiveController } from 'lit';
import { getDifference } from '../utils/objects.js';
import type { OffsetPoint, Point } from '../types/index.js';

export class NveTouchEvent extends Event {
  x: number;
  y: number;
  offsetX: number;
  offsetY: number;

  constructor(event: 'nve-touch-start' | 'nve-touch-move' | 'nve-touch-end', point: Point & OffsetPoint) {
    super(event);
    this.x = point.x;
    this.y = point.y;
    this.offsetX = point.offsetX;
    this.offsetY = point.offsetY;
  }
}

/**
 * @event nve-touch-start
 * @event nve-touch-move
 * @event nve-touch-end
 */
export function typeTouch<T extends ReactiveElement>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new TypeTouchController(instance));
}

export class TypeTouchController<T extends ReactiveElement> implements ReactiveController {
  #startPosition: Point;
  #moveFn = this.#move.bind(this);
  #endFn = this.#end.bind(this);

  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    this.host.addEventListener('pointerdown', (e: any) => this.#start(e), { passive: true });
  }

  #start(e: PointerEvent) {
    if (e.composedPath().find((el: any) => el === this.host)) {
      this.#startPosition = { x: e.clientX, y: e.clientY };
      document.addEventListener('pointerup', this.#endFn, { passive: true });
      document.addEventListener('pointermove', this.#moveFn, { passive: true });
      this.host.dispatchEvent(new NveTouchEvent('nve-touch-start', { ...this.#startPosition, offsetX: 0, offsetY: 0 }));
    }
  }

  #move(e: PointerEvent) {
    requestAnimationFrame(() => {
      const point = this.#getCoordinatesFromPointerEvent(e);
      this.#startPosition = { x: e.clientX, y: e.clientY };
      this.host.dispatchEvent(new NveTouchEvent('nve-touch-move', point));
    });
  }

  #end(e: PointerEvent) {
    if (this.#startPosition) {
      document.removeEventListener('pointerup', this.#endFn, false);
      document.removeEventListener('pointermove', this.#moveFn, false);
      this.host.dispatchEvent(new NveTouchEvent('nve-touch-end', this.#getCoordinatesFromPointerEvent(e)));
    }
  }

  #getCoordinatesFromPointerEvent(e: PointerEvent) {
    return {
      offsetX: getDifference(this.#startPosition.x, e.clientX),
      offsetY: getDifference(this.#startPosition.y, e.clientY),
      x: e.clientX,
      y: e.clientY
    };
  }
}
