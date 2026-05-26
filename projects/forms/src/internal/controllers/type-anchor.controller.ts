// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { removeEmptyTextNode } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type AnchorBehaviorHost = ReactiveElement & {
  disabled: boolean;
  readOnly: boolean;
  _internals?: ElementInternals;
};

export class TypeAnchorController<T extends AnchorBehaviorHost> implements ReactiveController {
  #anchorClickTarget: HTMLAnchorElement | null = null;
  #readOnly = false;

  constructor(private host: T) {
    this.host.addController(this);
  }

  get readOnly() {
    return this.#readOnly;
  }

  hostUpdated() {
    this.#updateAnchorSlotAssignment();
    const anchor = this.#anchor;
    this.#readOnly = Boolean(anchor);

    if (anchor) {
      this.host._internals!.states.add('anchor');
    } else {
      this.host._internals!.states.delete('anchor');
    }

    if (this.#parentAnchor) {
      this.#parentAnchor.style.textDecoration = 'none';
      this.host.style.cursor = 'pointer';
    }

    this.#setupAnchorClickBehavior(anchor);
  }

  hostDisconnected() {
    this.#removeAnchorClickBehavior();
  }

  get #anchor() {
    return this.#slottedAnchor ?? this.#parentAnchor;
  }

  get #slottedAnchor() {
    return this.host.shadowRoot
      ?.querySelector<HTMLSlotElement>('slot, slot[name=anchor]')
      ?.assignedElements()
      ?.find(element => element?.tagName === 'A') as HTMLAnchorElement | undefined;
  }

  get #parentAnchor() {
    return this.host.parentElement?.tagName === 'A' ? (this.host.parentElement as HTMLAnchorElement) : null;
  }

  get #defaultSlot() {
    return this.host.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])');
  }

  get #anchorSlot() {
    return this.host.shadowRoot?.querySelector<HTMLSlotElement>('slot[name=anchor]');
  }

  #updateAnchorSlotAssignment() {
    if (this.#anchor && this.#anchorSlot) {
      this.#anchor.slot = 'anchor';
      this.#defaultSlot?.assignedNodes().forEach(node => removeEmptyTextNode(node));
    }
  }

  #setupAnchorClickBehavior(anchor: HTMLAnchorElement | null | undefined) {
    this.#removeAnchorClickBehavior();
    this.#anchorClickTarget = anchor ?? null;
    this.#anchorClickTarget?.addEventListener('click', this.#onAnchorClick);
  }

  #removeAnchorClickBehavior() {
    this.#anchorClickTarget?.removeEventListener('click', this.#onAnchorClick);
    this.#anchorClickTarget = null;
  }

  #onAnchorClick = (event: Event) => {
    if (this.host.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  };
}
