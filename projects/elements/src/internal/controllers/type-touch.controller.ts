import type { ReactiveElement, ReactiveController } from 'lit';
import type { LegacyDecoratorTarget, OffsetPoint, Point } from '../types/index.js';
import { getDifference } from '../utils/objects.js';

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
  return (target: LegacyDecoratorTarget) => target.addInitializer((instance: T) => new TypeTouchController(instance));
}

export class TypeTouchController<T extends ReactiveElement> implements ReactiveController {
  #startPosition: Point;
  #pointerId: number;

  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    this.host.addEventListener('pointerdown', this.#start);
  }

  hostDisconnected() {
    this.host.removeEventListener('pointerdown', this.#start);
    globalThis.document.removeEventListener('pointerup', this.#end);
    globalThis.document.removeEventListener('pointermove', this.#move);
  }

  #start = (e: PointerEvent) => {
    if (e.composedPath().find(el => el === this.host)) {
      this.#startPosition = { x: e.clientX, y: e.clientY };
      this.#pointerId = e.pointerId;
      this.host.setPointerCapture(this.#pointerId);
      globalThis.document.addEventListener('pointerup', this.#end);
      globalThis.document.addEventListener('pointermove', this.#move);
      this.host.dispatchEvent(new NveTouchEvent('nve-touch-start', { ...this.#startPosition, offsetX: 0, offsetY: 0 }));
    }
  };

  #move = (e: PointerEvent) => {
    requestAnimationFrame(() => {
      const point = this.#getCoordinatesFromPointerEvent(e);
      this.host.dispatchEvent(new NveTouchEvent('nve-touch-move', point));
      this.#startPosition = { x: e.clientX, y: e.clientY };
    });
  };

  #end = (e: PointerEvent) => {
    if (this.#startPosition) {
      globalThis.document.removeEventListener('pointerup', this.#end, false);
      globalThis.document.removeEventListener('pointermove', this.#move, false);
      this.host.dispatchEvent(new NveTouchEvent('nve-touch-end', this.#getCoordinatesFromPointerEvent(e)));
      this.host.releasePointerCapture(this.#pointerId);
      this.#pointerId = null;
    }
  };

  #getCoordinatesFromPointerEvent(e: PointerEvent) {
    const value = {
      offsetX: getDifference(this.#startPosition.x, e.clientX),
      offsetY: getDifference(this.#startPosition.y, e.clientY),
      x: e.clientX,
      y: e.clientY
    };
    return value;
  }
}
