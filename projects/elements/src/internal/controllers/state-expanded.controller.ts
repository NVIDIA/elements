import type { ReactiveController, ReactiveElement } from 'lit';
import { attachInternals } from '../utils/a11y.js';

/**
 * Adds expanded support for interactive custom elements including CSS State psuedo-selector :state(expanded) and aria-expanded.
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded
 */
export function stateExpanded<T extends Expanded>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new StateExpandedController(instance));
}

export type Expanded = ReactiveElement & { expanded: boolean; readonly?: boolean; _internals?: ElementInternals };

export class StateExpandedController<T extends Expanded> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    if (this.host.expanded !== null && this.host.expanded !== undefined) {
      this.host._internals.ariaExpanded = `${this.host.expanded}`;
    }

    if (this.host.expanded) {
      this.host._internals.states.add('expanded');
    } else {
      this.host._internals.states.delete('expanded');
    }

    if (this.host.readonly) {
      this.host._internals.ariaExpanded = null;
      this.host._internals.states.delete('expanded');
    }
  }
}
