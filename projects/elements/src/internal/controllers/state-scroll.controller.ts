import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { attachInternals, endOfScrollBox } from '@nvidia-elements/core/internal';

/**
 * Adds active scroll state detection
 */
export function stateScroll<T extends Scroll>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) => target.addInitializer((instance: T) => new StateScrollController(instance));
}

export interface StateScrollConfig {
  target?: HTMLElement;
  scrollOffset?: number;
}

export type Scroll = ReactiveElement & {
  _internals?: ElementInternals;
  stateScrollConfig?: StateScrollConfig;
};

export class StateScrollController<T extends Scroll> implements ReactiveController {
  get #target() {
    const target = this.host.stateScrollConfig?.target;
    return target ? target : this.host;
  }

  get #offset() {
    return this.host.stateScrollConfig?.scrollOffset ? this.host.stateScrollConfig?.scrollOffset : 0;
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.host.updateComplete;
    attachInternals(this.host);

    this.#startScroll();

    this.#target.addEventListener('scrollend', () => {
      this.host._internals.states.delete('scrolling');

      if (endOfScrollBox(this.#target, this.#offset)) {
        this.host.dispatchEvent(new CustomEvent('scrollboxend'));
      }

      this.#startScroll();
    });
  }

  #startScroll() {
    this.#target.addEventListener('scroll', () => this.host._internals.states.add('scrolling'), { once: true });
  }
}
