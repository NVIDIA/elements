import type { ReactiveController, ReactiveElement } from 'lit';
import { attachInternals } from '../utils/a11y.js';

/**
 * Adds button support for interactive custom elements including aria-button and focus behavior.
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role
 */
export function typeButton<T extends Button>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new TypeButtonController(instance));
}

export interface Button extends ReactiveElement {
  readonly: boolean;
  disabled;
  _internals?: ElementInternals;
}

export class TypeButtonController<T extends Button> implements ReactiveController {
  #initialTabIndex: number;

  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);

    if (this.host.hasAttribute('tabindex')) {
      this.#initialTabIndex = this.host.tabIndex;
    }
  }

  async hostUpdated() {
    await this.host.updateComplete;

    if (!this.host._internals.role) {
      this.host._internals.role = 'button';
    }

    this.host.tabIndex = this.host.disabled ? -1 : this.#initialTabIndex;

    if (this.host.readonly) {
      this.host._internals.role = 'none';
      this.host.tabIndex = null;
      this.host.removeAttribute('tabindex');
    }
  }
}
