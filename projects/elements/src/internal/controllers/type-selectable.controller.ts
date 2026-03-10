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
 * @event select - Dispatched when the selectable element selects.
 * @property selected - selected state
 * @property behaviorSelect - determines if stateful auto behavior should enable
 */
export class TypeSelectableController<T extends TypeSelectable> implements ReactiveController {
  #commandTriggered = false;
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);

    this.host.addEventListener('command', ((e: CommandEvent) => {
      this.#commandTriggered = true;
      if (e.command === '--toggle-select') {
        this.toggle();
      }

      if (e.command === '--select') {
        this.select();
      }

      if (e.command === '--deselect') {
        this.host.selected = false;
      }
      this.#commandTriggered = false;
    }) as EventListener);
  }

  hostUpdated() {
    this.host.selectable === 'single'
      ? this.host._internals!.states.add('selectable-single')
      : this.host._internals!.states.delete('selectable-single');
    this.host.selectable === 'multi'
      ? this.host._internals!.states.add('selectable-multi')
      : this.host._internals!.states.delete('selectable-multi');
  }

  select() {
    if (this.host.behaviorSelect || this.#commandTriggered) {
      this.host.selected = true;
    }

    this.host.dispatchEvent(new CustomEvent('select', { bubbles: true, detail: this.host }));
  }

  deselect() {
    if (this.host.behaviorSelect || this.#commandTriggered) {
      this.host.selected = false;
    }

    this.host.dispatchEvent(new CustomEvent('select', { bubbles: true, detail: this.host }));
  }

  toggle() {
    if (this.host.selected) {
      this.deselect();
    } else {
      this.select();
    }
  }
}
