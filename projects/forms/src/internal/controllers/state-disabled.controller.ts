// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { attachInternals } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type Disabled = ReactiveElement & { disabled: boolean; readOnly?: boolean; _internals?: ElementInternals };

/**
 * Adds disabled support for interactive custom elements including CSS State psuedo-selector :state(disabled) and aria-disabled.
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled
 */
export class StateDisabledController<T extends Disabled> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    if (this.host.disabled !== null && this.host.disabled !== undefined) {
      this.host._internals!.ariaDisabled = `${this.host.disabled}`;
    } else {
      this.host._internals!.ariaDisabled = null;
    }

    if (this.host.disabled) {
      this.host._internals!.states.add('disabled');
    } else {
      this.host._internals!.states.delete('disabled');
    }

    if (this.host.readOnly) {
      this.host._internals!.ariaDisabled = null;
    }
  }
}
