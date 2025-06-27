import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { attachInternals } from '../utils/a11y.js';

/**
 * Adds CSS State psuedo-selector :state(active) behavior for keydown space/enter for custom elements
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 */
export function stateActive<T extends Active>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) => target.addInitializer((instance: T) => new StateActiveController(instance));
}

type Active = ReactiveElement & { disabled: boolean; _internals?: ElementInternals };

export class StateActiveController<T extends Active> implements ReactiveController {
  #initialized = false;
  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    if (!this.#initialized) {
      attachInternals(this.host);
      await this.host.updateComplete;
      this.host.addEventListener('keypress', this.#emulateActive);
      this.host.addEventListener('mousedown', this.#emulateActive);
      this.host.addEventListener('keyup', this.#emulateInactive);
      this.host.addEventListener('blur', this.#emulateInactive);
      this.host.addEventListener('mouseup', this.#emulateInactive);
      this.#initialized = true;
    }
  }

  hostDisconnected() {
    this.host.removeEventListener('keypress', this.#emulateActive);
    this.host.removeEventListener('mousedown', this.#emulateActive);
    this.host.removeEventListener('keyup', this.#emulateInactive);
    this.host.removeEventListener('blur', this.#emulateInactive);
    this.host.removeEventListener('mouseup', this.#emulateInactive);
  }

  #emulateActive = (e: KeyboardEvent | PointerEvent) => {
    if (!this.host.disabled && this.#isValidKeyEvent(e)) {
      this.host._internals.states.add('active');
    }

    if (e instanceof KeyboardEvent && e.code === 'Space' && e.target === this.host) {
      e.preventDefault(); // prevent space bar scroll with standard button behavior
    }
  };

  #emulateInactive = () => {
    this.host._internals.states.delete('active');
  };

  #isValidKeyEvent(e: KeyboardEvent | PointerEvent) {
    return e instanceof KeyboardEvent ? e.code === 'Space' || e.code === 'Enter' : true;
  }
}
