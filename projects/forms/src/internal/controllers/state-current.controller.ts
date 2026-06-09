// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { attachInternals, toggleState } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type Current = ReactiveElement & {
  current?: string | null;
  readOnly?: boolean;
  selected?: boolean | null;
  _internals?: ElementInternals;
};

export class StateCurrentController<T extends Current> implements ReactiveController {
  #anchorCurrentTarget: HTMLAnchorElement | null = null;

  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    if (this.host.readOnly) {
      this.host._internals!.ariaCurrent = null;
      toggleState(this.host._internals!, 'current', false);
      this.#syncAnchorCurrentAttribute();
      return;
    }

    if (this.host._internals?.states.has('anchor')) {
      this.host._internals!.ariaCurrent = null;
      toggleState(this.host._internals!, 'current', Boolean(this.host.current));
      this.#syncAnchorCurrentAttribute();
      return;
    }

    this.host._internals!.ariaCurrent =
      this.host.current === null || this.host.current === undefined ? null : `${this.host.current}`;

    toggleState(this.host._internals!, 'current', Boolean(this.host.current));
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
