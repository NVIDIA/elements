import type { ReactiveController, ReactiveElement } from 'lit';
import { attachInternals } from '../utils/a11y.js';

export type TypeClosable = ReactiveElement & { closable: boolean };

/**
 * Controller for enabling closable behavior for elements.
 */
export class TypeClosableController<T extends TypeClosable> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);

    this.host.addEventListener('command', () => {
      this.host.hidden = true;
      this.#dispatchEvent();
    });
  }

  close() {
    if (this.host.closable) {
      this.#dispatchEvent();
    }
  }

  #dispatchEvent() {
    this.host.dispatchEvent(new CustomEvent('close', { bubbles: true, composed: true }));
  }
}
