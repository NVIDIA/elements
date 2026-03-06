import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { attachInternals } from '../utils/a11y.js';

/**
 * Adds selected support for interactive custom elements including CSS State psuedo-selector :state(selected) and aria-selected.
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-selected
 */
export function stateSelected<T extends Selected>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer((instance: T) => new StateSelectedController(instance));
}

export type Selected = ReactiveElement & { selected: boolean; readonly?: boolean; _internals?: ElementInternals };

export class StateSelectedController<T extends Selected> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    if (this.host.readonly) {
      this.host._internals.ariaSelected = null;
      this.host._internals.states.delete('selected');
      return;
    }

    if (this.host._internals?.states.has('anchor') && this.host.selected) {
      this.host._internals.ariaSelected = null;
      this.host._internals.states.add('selected');
      this.host.querySelector('a')?.setAttribute('aria-current', 'page');
      return;
    }

    if (this.host.selected !== null && this.host.selected !== undefined) {
      this.host._internals.ariaSelected = `${this.host.selected}`;
    }

    if (this.host.selected) {
      this.host._internals.states.add('selected');
    } else {
      this.host._internals.states.delete('selected');
    }
  }
}
