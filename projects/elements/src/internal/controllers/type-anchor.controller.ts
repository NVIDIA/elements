import { ReactiveController, ReactiveElement  } from 'lit';
import { removeEmptyTextNode } from '../utils/dom.js';

/**
 * Adds anchor/link support for interactive custom elements.
 */
export function typeAnchor<T extends Anchor>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new TypeAnchorController(instance));
}

export interface Anchor extends ReactiveElement { disabled: boolean; readonly: boolean; }

export class TypeAnchorController<T extends Anchor> implements ReactiveController {
  get #anchor() {
    return this.#slottedAnchor ? this.#slottedAnchor : this.#parentAnchor;
  }

  get #slottedAnchor() {
    return this.host.querySelector<HTMLAnchorElement>('a');
  }

  get #parentAnchor() {
    return this.host.parentElement?.tagName === 'A' ? this.host.parentElement as HTMLAnchorElement : null;
  }

  get #defaultSlot() {
    return this.host.shadowRoot.querySelector<HTMLSlotElement>('slot:not([name])');
  }

  get #anchorSlot() {
    return this.host.shadowRoot.querySelector<HTMLSlotElement>('slot[name=anchor]');
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.host.updateComplete;

    this.#updateAnchorSlotAssignment();

    if (this.#anchor) {
      this.host.readonly = true;
    }

    if (this.#parentAnchor) {
      this.#parentAnchor.style.textDecoration = 'none';
      this.host.style.cursor = 'pointer';
    }

    this.#anchor?.addEventListener('click', e => {
      if (this.host.disabled) {
        e.preventDefault();
        e.stopImmediatePropagation();
      }
    });
  }

  #updateAnchorSlotAssignment() {
    if (this.#anchor && this.#anchorSlot) {
      this.#anchor.slot = 'anchor';
      this.#defaultSlot?.assignedNodes().forEach(node => removeEmptyTextNode(node));
    }
  }
}
