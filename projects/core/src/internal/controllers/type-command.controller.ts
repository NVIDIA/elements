// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { getFlattenedDOMTree } from '../utils/dom.js';

/**
 * Adds Invoker Commands API support for interactive custom elements.
 * https://developer.mozilla.org/en-US/docs/Web/API/Invoker_Commands_API
 */
export function typeCommand<T extends Command>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer!((instance: T) => new TypeCommandController(instance));
}

export type Command = ReactiveElement &
  HTMLElement & {
    command: string;
    commandfor: string | null;
    commandForElement: HTMLElement | null;
    readonly: boolean;
    disabled: boolean;
  };

export class TypeCommandController<T extends Command> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostUpdated() {
    await this.host.updateComplete;
    this.#updateListener();
  }

  hostDisconnected() {
    this.host.removeEventListener('click', this.#triggerCommand);
  }

  #updateListener() {
    if (!this.host.readonly && !this.host.disabled) {
      this.host.addEventListener('click', this.#triggerCommand);
    } else {
      this.host.removeEventListener('click', this.#triggerCommand);
    }
  }

  #triggerCommand = () => {
    if ((this.host.commandfor || this.host.commandForElement) && globalThis.CommandEvent) {
      const match = getFlattenedDOMTree(this.host.getRootNode() as HTMLElement).find(
        el => el.id === this.host.commandfor || el === this.host.commandForElement
      );
      if (!match) {
        console.warn('commandForElement', this.host.commandfor || this.host.commandForElement, 'not found');
      } else {
        match.dispatchEvent(new globalThis.CommandEvent('command', { command: this.host.command, source: this.host }));
      }
    }
  };
}
