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
  #initialTabIndex = 0;

  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    if (this.host.hasAttribute('tabindex')) {
      this.#initialTabIndex = this.host.tabIndex;
    }
  }

  hostUpdated() {
    if (this.host.readOnly) {
      if (this.host._internals!.role && this.host._internals!.role !== 'none') {
        this.#enabledRole = this.host._internals!.role;
      }

      this.host._internals!.role = 'none';
      this.host.tabIndex = -1;
      this.host.removeAttribute('tabindex');
      return;
    }

    if (!this.host._internals!.role || this.host._internals!.role === 'none') {
      this.host._internals!.role = this.#enabledRole ?? 'button';
    } else {
      this.#enabledRole = this.host._internals!.role;
    }

    this.host.tabIndex = this.host.disabled ? -1 : this.#initialTabIndex;
  }
}
