// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { attachInternals, toggleState } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type Expanded = ReactiveElement & { expanded?: boolean | null; _internals?: ElementInternals };

export class StateExpandedController<T extends Expanded> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    if (this.host.expanded !== null && this.host.expanded !== undefined) {
      this.host._internals!.ariaExpanded = `${this.host.expanded}`;
    }

    toggleState(this.host._internals!, 'expanded', Boolean(this.host.expanded));
  }
}
