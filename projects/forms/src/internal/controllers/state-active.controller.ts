// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { attachInternals } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type Active = ReactiveElement & { disabled: boolean; _internals?: ElementInternals };

export class StateActiveController<T extends Active> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    attachInternals(this.host);
    this.host.addEventListener('keypress', this.#onActive as EventListener);
    this.host.addEventListener('mousedown', this.#onActive as EventListener);
    this.host.addEventListener('keyup', this.#onInactive);
    this.host.addEventListener('blur', this.#onInactive);
    this.host.addEventListener('mouseup', this.#onInactive);
  }

  hostDisconnected() {
    this.host.removeEventListener('keypress', this.#onActive as EventListener);
    this.host.removeEventListener('mousedown', this.#onActive as EventListener);
    this.host.removeEventListener('keyup', this.#onInactive);
    this.host.removeEventListener('blur', this.#onInactive);
    this.host.removeEventListener('mouseup', this.#onInactive);
  }

  #onActive = (event: KeyboardEvent | PointerEvent) => {
    if (!this.host.disabled && this.#isValidActiveEvent(event)) {
      this.host._internals!.states.add('active');
    }

    if (event instanceof KeyboardEvent && event.code === 'Space' && event.target === this.host) {
      event.preventDefault();
    }
  };

  #onInactive = () => {
    this.host._internals!.states.delete('active');
  };

  #isValidActiveEvent(event: KeyboardEvent | PointerEvent) {
    return event instanceof KeyboardEvent ? event.code === 'Space' || event.code === 'Enter' : true;
  }
}
