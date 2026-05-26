// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getFlattenedDOMTree } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type CommandBehaviorHost = ReactiveElement & {
  command?: string;
  commandForElement: HTMLElement | null;
  disabled: boolean;
  readOnly: boolean;
};

export class TypeCommandController<T extends CommandBehaviorHost> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostUpdated() {
    this.#removeCommandBehavior();
    if (!this.host.readOnly && !this.host.disabled) {
      this.host.addEventListener('click', this.#onCommandClick);
    }
  }

  hostDisconnected() {
    this.#removeCommandBehavior();
  }

  #removeCommandBehavior() {
    this.host.removeEventListener('click', this.#onCommandClick);
  }

  #onCommandClick = (event: Event) => {
    if (!event.defaultPrevented) {
      this.#dispatchCommand();
    }
  };

  #dispatchCommand() {
    if (this.host.readOnly || this.host.disabled || !this.host.command) {
      return false;
    }

    const target = this.target;
    if (!target) {
      console.warn(
        'commandForElement',
        this.host.commandForElement || this.host.getAttribute('commandfor'),
        'not found'
      );
      return false;
    }

    target.dispatchEvent(new globalThis.CommandEvent('command', { command: this.host.command, source: this.host }));
    return true;
  }

  get target(): HTMLElement | null {
    if (this.host.commandForElement) {
      return this.host.commandForElement;
    }

    const id = this.host.getAttribute('commandfor');
    if (!id) {
      return null;
    }

    return getFlattenedDOMTree(this.host.getRootNode() as HTMLElement).find(el => el.id === id) ?? null;
  }
}
