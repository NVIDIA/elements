import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { attachInternals } from '../utils/a11y.js';

/**
 * Adds current support for interactive custom elements including CSS State psuedo-selector :state(current) and aria-current.
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current
 */
export function stateCurrent<T extends Current>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer((instance: T) => new StateCurrentController(instance));
}

type Current = ReactiveElement & { current: 'page' | 'step'; readonly?: boolean; _internals?: ElementInternals };

export class StateCurrentController<T extends Current> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    if (this.host.readonly) {
      this.host._internals.ariaCurrent = null;
      this.host._internals.states.delete('current');
      return;
    }

    if (this.host._internals?.states.has('anchor') && this.host.current) {
      this.host._internals.ariaCurrent = null;
      this.host._internals.states.add('current');
      this.host.querySelector('a')?.setAttribute('aria-current', 'page');
      return;
    }

    if (this.host.current !== null && this.host.current !== undefined) {
      this.host._internals.ariaCurrent = `${this.host.current}`;
    }

    if (this.host.current) {
      this.host._internals.states.add('current');
    } else {
      this.host._internals.states.delete('current');
    }
  }
}
