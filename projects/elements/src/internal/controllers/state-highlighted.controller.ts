import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { attachInternals } from '../utils/a11y.js';

/**
 * Adds highlighted support for interactive custom elements including CSS State psuedo-selector :state(highlighted).
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 */
export function stateHighlighted<T extends Highlighted>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer!((instance: T) => new StateHighlightedController(instance));
}

export type Highlighted = ReactiveElement & { highlighted: boolean; _internals?: ElementInternals };

export class StateHighlightedController<T extends Highlighted> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    if (this.host.highlighted) {
      this.host._internals!.states.add('highlighted');
    } else {
      this.host._internals!.states.delete('highlighted');
    }
  }
}
