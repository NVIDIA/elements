// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from './types.js';
import { attachInternals } from '../utils.js';

type ReadOnlyState = ReactiveElement & { readOnly?: boolean; _internals?: ElementInternals };

export class StateReadOnlyController<T extends ReadOnlyState> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    if (this.host.readOnly) {
      this.host._internals!.ariaDisabled = null;
      this.host._internals!.ariaExpanded = null;
      this.host._internals!.ariaPressed = null;
      this.host._internals!.ariaSelected = null;
      this.host._internals!.ariaCurrent = null;
      this.host._internals!.states.delete('expanded');
      this.host._internals!.states.delete('pressed');
      this.host._internals!.states.delete('selected');
      this.host._internals!.states.delete('current');
    }
  }
}
