import { ReactiveController, ReactiveElement  } from 'lit';
import { attachInternals } from '../utils/a11y.js';

/**
 * Adds button support for interactive custom elements including aria-button and focus behavior.
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/button_role
 */
export function typeButton<T extends Button>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new TypeButtonController(instance));
}

export interface Button extends ReactiveElement { readonly: boolean; disabled; _internals?: ElementInternals; }

export class TypeButtonController<T extends Button> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
    this.host.tabIndex = 0;
  }

  async hostUpdated() {
    await this.host.updateComplete;

    if (!this.host._internals.role) {
      this.host._internals.role = 'button';
    }

    this.host.tabIndex = !this.host.disabled ? 0 : -1;

    if (this.host.readonly) {
      this.host._internals.role = null;
      this.host.tabIndex = null;
      this.host.removeAttribute('tabindex');
    }
  }
}
