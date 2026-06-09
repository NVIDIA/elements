// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { attachInternals, toggleState } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type Pressed = ReactiveElement & { pressed?: boolean | null; _internals?: ElementInternals };

export class StatePressedController<T extends Pressed> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
  }

  hostUpdated() {
    this.host._internals!.ariaPressed =
      this.host.pressed === null || this.host.pressed === undefined ? null : `${this.host.pressed}`;

    toggleState(this.host._internals!, 'pressed', Boolean(this.host.pressed));
  }
}
