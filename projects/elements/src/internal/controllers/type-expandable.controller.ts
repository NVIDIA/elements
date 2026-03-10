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
 * @event open - Dispatched when the expandable element opens.
 * @event close - Dispatched when the expandable element closes.
 * @property expanded - expanded state
 * @property behaviorExpand - determines if stateful auto behavior should enable
 */
export class TypeExpandableController<T extends TypeExpandable> implements ReactiveController {
  #commandTriggered = false;
  #useHidden = false;

  constructor(
    private host: T,
    config: { useHidden?: boolean } = {}
  ) {
    this.#useHidden = config.useHidden ?? false;
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);

    this.host.addEventListener('command', ((e: CommandEvent) => {
      this.#commandTriggered = true;
      if (e.command === '--toggle') {
        this.toggle();
      }

      if (e.command === '--open') {
        this.open();
      }

      if (e.command === '--close') {
        this.close();
      }
      this.#commandTriggered = false;
    }) as EventListener);
  }

  hostUpdated() {
    this.host.expandable
      ? this.host._internals!.states.add('expandable')
      : this.host._internals!.states.delete('expandable');
  }

  open() {
    if (this.host.behaviorExpand || this.#commandTriggered) {
      this.host.expanded = true;

      if (this.#useHidden) {
        this.host.hidden = false;
      }
    }

    this.host.dispatchEvent(new CustomEvent('open', { bubbles: true }));
  }

  close() {
    if (this.host.behaviorExpand || this.#commandTriggered) {
      this.host.expanded = false;

      if (this.#useHidden) {
        this.host.hidden = true;
      }
    }

    this.host.dispatchEvent(new CustomEvent('close', { bubbles: true }));
  }

  toggle() {
    if (this.host.expanded || (this.#useHidden && !this.host.hidden)) {
      this.close();
    } else {
      this.open();
    }
  }
}
