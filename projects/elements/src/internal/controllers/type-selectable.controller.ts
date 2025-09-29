import type { ReactiveController, ReactiveElement } from 'lit';
import { attachInternals } from '../utils/a11y.js';

export type TypeSelectable = ReactiveElement & {
  selected?: boolean;
  behaviorSelect?: boolean;
  selectable?: 'single' | 'multi';
  _internals?: ElementInternals;
};

/**
 * Controller for enabling selectable behavior for elements.
 * @event select - Dispatched when the selectable element is selected.
 * @property selected - selected state
 * @property behaviorSelect? - determines if stateful auto behavior should be enabled
 */
export class TypeSelectableController<T extends TypeSelectable> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    this.host.selectable === 'single'
      ? this.host._internals.states.add('selectable-single')
      : this.host._internals.states.delete('selectable-single');
    this.host.selectable === 'multi'
      ? this.host._internals.states.add('selectable-multi')
      : this.host._internals.states.delete('selectable-multi');
  }

  select() {
    this.host.dispatchEvent(new CustomEvent('select', { bubbles: true, detail: this.host }));

    if (this.host.behaviorSelect) {
      this.host.selected = true;
    }
  }

  toggle() {
    this.host.dispatchEvent(new CustomEvent('select', { bubbles: true, detail: this.host }));

    if (this.host.behaviorSelect) {
      this.host.selected = !this.host.selected;
    }
  }
}
