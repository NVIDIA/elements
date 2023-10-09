import { ReactiveController, ReactiveElement } from 'lit';
import { attachInternals } from '../utils/a11y.js';

export type TypeSelectable = ReactiveElement &  { selected?: boolean, behaviorSelect?: boolean };

/**
 * Controller for enabling selectable behavior for elements.
 * @event select
 * @prop selected
 * @prop behaviorSelect?
 */
export class TypeSelectableController<T extends TypeSelectable> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  select(element: HTMLElement & { selected?: boolean } = this.host) {
    this.host.dispatchEvent(new CustomEvent('select', { bubbles: true, detail: element }));
    if (this.host.behaviorSelect) {
      element.selected = true;
    }
  }
}
