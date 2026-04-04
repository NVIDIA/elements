// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { removeEmptyTextNode } from '../utils/dom.js';
import { attachInternals } from '../utils/a11y.js';

/**
 * Adds anchor/link support for interactive custom elements.
 */
export function typeAnchor<T extends Anchor>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) => target.addInitializer!((instance: T) => new TypeAnchorController(instance));
}

export interface Anchor extends ReactiveElement {
  disabled: boolean;
  readonly: boolean;
  _internals: ElementInternals;
}

export class TypeAnchorController<T extends Anchor> implements ReactiveController {
  get #anchor() {
    return this.#slottedAnchor ? this.#slottedAnchor : this.#parentAnchor;
  }

  get #slottedAnchor() {
    // return elements that nest in a slot
    return this.host
      .shadowRoot!.querySelector<HTMLSlotElement>('slot, slot[name=anchor]')
      ?.assignedElements()
      ?.find(e => e?.tagName === 'A');
  }

  get #parentAnchor() {
    return this.host.parentElement?.tagName === 'A' ? (this.host.parentElement as HTMLAnchorElement) : null;
  }

  get #defaultSlot() {
    return this.host.shadowRoot!.querySelector<HTMLSlotElement>('slot:not([name])');
  }

  get #anchorSlot() {
    return this.host.shadowRoot!.querySelector<HTMLSlotElement>('slot[name=anchor]');
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    attachInternals(this.host);
    await this.host.updateComplete;

    this.#updateAnchorSlotAssignment();

    if (this.#anchor) {
      this.host.readonly = true;
      this.host._internals?.states.add('anchor');
    } else {
      this.host._internals?.states.delete('anchor');
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
