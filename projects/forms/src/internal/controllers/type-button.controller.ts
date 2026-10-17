// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from './types.js';

type ButtonBehaviorHost = ReactiveElement & {
  disabled: boolean;
  readOnly: boolean;
  _internals?: ElementInternals;
};

export class TypeButtonController<T extends ButtonBehaviorHost> implements ReactiveController {
  #enabledRole: string | null = null;
  #enabledTabIndex = 0;
  #unavailable?: boolean;

  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    if (this.#unavailable === undefined && this.host.hasAttribute('tabindex')) {
      this.#enabledTabIndex = this.host.tabIndex;
    }
  }

  hostUpdated() {
    this.#updateTabIndex();
    if (this.host.readOnly) {
      if (this.host._internals!.role && this.host._internals!.role !== 'none') {
        this.#enabledRole = this.host._internals!.role;
      }

      this.host._internals!.role = 'none';
      return;
    }

    if (!this.host._internals!.role || this.host._internals!.role === 'none') {
      this.host._internals!.role = this.#enabledRole ?? 'button';
    } else {
      this.#enabledRole = this.host._internals!.role;
    }
  }

  #updateTabIndex() {
    const unavailable = this.host.disabled || this.host.readOnly;
    const restore = this.#unavailable === undefined || (this.#unavailable && !unavailable);
    if (unavailable && this.#unavailable === false) this.#enabledTabIndex = this.host.tabIndex;
    this.#unavailable = unavailable;
    if (this.host.readOnly) {
      this.host.tabIndex = -1;
      this.host.removeAttribute('tabindex');
    } else if (this.host.disabled) {
      this.host.tabIndex = -1;
    } else if (restore) {
      this.host.tabIndex = this.#enabledTabIndex;
    }
  }
}
