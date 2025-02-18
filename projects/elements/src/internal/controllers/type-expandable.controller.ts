import type { ReactiveController, ReactiveElement } from 'lit';
import { attachInternals } from '../utils/a11y.js';

export type TypeExpandable = ReactiveElement & {
  expanded?: boolean;
  behaviorExpand?: boolean;
  expandable?: boolean;
  _internals?: ElementInternals;
};

/**
 * Controller for enabling expandable behavior for elements.
 * @event open - Dispatched when the expandable element is opened.
 * @event close - Dispatched when the expandable element is closed.
 * @prop expanded
 * @prop behaviorExpand?
 */
export class TypeExpandableController<T extends TypeExpandable> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    this.host.expandable
      ? this.host._internals.states.add('expandable')
      : this.host._internals.states.delete('expandable');
  }

  open() {
    this.host.dispatchEvent(new CustomEvent('open', { bubbles: true }));

    if (this.host.behaviorExpand) {
      this.host.expanded = true;
    }
  }

  close() {
    this.host.dispatchEvent(new CustomEvent('close', { bubbles: true }));

    if (this.host.behaviorExpand) {
      this.host.expanded = false;
    }
  }

  toggle() {
    if (this.host.expanded) {
      this.close();
    } else {
      this.open();
    }
  }
}
