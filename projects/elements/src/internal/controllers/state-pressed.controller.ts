import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { attachInternals } from '../utils/a11y.js';

/**
 * Adds pressed support for interactive custom elements including CSS State psuedo-selector :state(pressed) and aria-pressed.
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed
 */
export function statePressed<T extends Pressed>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer!((instance: T) => new StatePressedController(instance));
}

export type Pressed = ReactiveElement & { pressed: boolean; readonly?: boolean; _internals?: ElementInternals };

export class StatePressedController<T extends Pressed> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    if (this.host.pressed !== null && this.host.pressed !== undefined) {
      this.host._internals!.ariaPressed = `${this.host.pressed}`;
    }

    if (this.host.pressed) {
      this.host._internals!.states.add('pressed');
    } else {
      this.host._internals!.states.delete('pressed');
    }

    if (this.host.readonly) {
      this.host._internals!.ariaPressed = null;
      this.host._internals!.states.delete('pressed');
    }
  }
}
