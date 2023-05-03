import { ReactiveController, ReactiveElement } from 'lit';
import { attachInternals } from '../utils/a11y.js';
import { endOfScrollBox, waitForScrollEnd } from '../utils/dom.js';

/**
 * Adds active scroll state detection
 */
export function stateScroll<T extends Scroll>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new StateScrollController(instance));
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

  #offset = 0;

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.host.updateComplete;
    attachInternals(this.host);
    this.#offset = this.host.stateScrollConfig?.scrollOffset ? this.host.stateScrollConfig?.scrollOffset : 0;

    let prevX = 0;
    let prevY = 0;
    this.#target.addEventListener('scroll', async () => {
      if (prevX !== this.#target.scrollLeft) {
        prevX = this.#target.scrollLeft;
        this.host._internals.states.add('--scrolling');
      }

      if ((prevY !== this.#target.scrollTop) && endOfScrollBox(this.#target, this.#offset)){
        this.host.dispatchEvent(new CustomEvent('scrollend'));
      }

      prevY = this.#target.scrollTop;
      await waitForScrollEnd(this.#target);

      if ((this.host._internals.states as any).has('--scrolling')) {
        this.host._internals.states.delete('--scrolling');
      }
    });
  }
}
