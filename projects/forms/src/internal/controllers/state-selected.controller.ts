// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { attachInternals, toggleState } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type Selected = ReactiveElement & {
  current?: string | null;
  readOnly?: boolean;
  selected?: boolean | null;
  _internals?: ElementInternals;
};

export class StateSelectedController<T extends Selected> implements ReactiveController {
  #anchorCurrentTarget: HTMLAnchorElement | null = null;

  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    if (this.host.readOnly) {
      this.host._internals!.ariaSelected = null;
      toggleState(this.host._internals!, 'selected', false);
      this.#syncAnchorCurrentAttribute();
      return;
    }

    if (this.host._internals?.states.has('anchor')) {
      this.host._internals!.ariaSelected = null;
      toggleState(this.host._internals!, 'selected', Boolean(this.host.selected));
      this.#syncAnchorCurrentAttribute();
      return;
    }

    this.host._internals!.ariaSelected =
      this.host.selected === null || this.host.selected === undefined ? null : `${this.host.selected}`;

    toggleState(this.host._internals!, 'selected', Boolean(this.host.selected));
  }

  #syncAnchorCurrentAttribute() {
    const anchor = this.host.querySelector<HTMLAnchorElement>('a');
    const isCurrent =
      !this.host.readOnly &&
      this.host._internals!.states.has('anchor') &&
      Boolean(this.host.selected || this.host.current);

    if (anchor && isCurrent) {
      this.#anchorCurrentTarget?.removeAttribute('aria-current');
      anchor.setAttribute('aria-current', this.host.current ?? 'page');
      this.#anchorCurrentTarget = anchor;
      return;
    }

    this.#anchorCurrentTarget?.removeAttribute('aria-current');
    this.#anchorCurrentTarget = null;
  }
}
