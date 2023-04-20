import { ReactiveController, ReactiveElement } from 'lit';
import { attachInternals } from '../utils/a11y.js';

export type TypeExpandable = ReactiveElement &  {expanded?: boolean, behaviorExpand?: boolean };

/**
 * Controller for enabling expandable behavior for elements.
 * @event open
 * @event close
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

  open() {
    this.host.dispatchEvent(new CustomEvent('open'));

    if (this.host.behaviorExpand) {
      this.host.expanded = true;
    }
  }

  close() {
    this.host.dispatchEvent(new CustomEvent('close'));

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
