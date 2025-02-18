import type { ReactiveController, ReactiveElement } from 'lit';
import { attachInternals } from '../utils/a11y.js';

/**
 * Adds CSS State psuedo-selector :state(active) behavior for keydown space/enter for custom elements
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 */
export function stateActive<T extends Active>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new StateActiveController(instance));
}

type Active = ReactiveElement & { disabled: boolean; _internals?: ElementInternals };

export class StateActiveController<T extends Active> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    attachInternals(this.host);
    await this.host.updateComplete;
    this.host.addEventListener('keypress', (e: any) => this.#emulateActive(e));
    this.host.addEventListener('mousedown', (e: any) => this.#emulateActive(e));
    this.host.addEventListener('keyup', () => this.#emulateInactive());
    this.host.addEventListener('blur', () => this.#emulateInactive());
    this.host.addEventListener('mouseup', () => this.#emulateInactive());
  }

  #emulateActive(e: any) {
    if (!this.host.disabled && this.#isValidKeyEvent(e)) {
      this.host._internals.states.add('active');
    }

    if (e.code === 'Space' && e.target === this.host) {
      e.preventDefault(); // prevent space bar scroll with standard button behavior
    }
  }

  #emulateInactive() {
    this.host._internals.states.delete('active');
  }

  #isValidKeyEvent(e: KeyboardEvent) {
    return e.code ? e.code === 'Space' || e.code === 'Enter' : true;
  }
}
