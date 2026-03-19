// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { attachInternals } from '../utils/a11y.js';

/**
 * Adds disabled support for interactive custom elements including CSS State psuedo-selector :state(disabled) and aria-disabled.
 * https://developer.mozilla.org/en-US/docs/Web/API/ElementInternals/states
 * https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-disabled
 */
export function stateDisabled<T extends Disabled>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer!((instance: T) => new StateDisabledController(instance));
}

export type Disabled = ReactiveElement & { disabled: boolean; readonly?: boolean; _internals?: ElementInternals };

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

    if (this.host.readonly) {
      this.host._internals!.ariaDisabled = null;
    }
  }
}
