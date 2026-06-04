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
    readOnly: boolean;
    disabled: boolean;
  };

export class TypeCommandController<T extends Command> implements ReactiveController {
  #trigger: 'click' | 'manual';

  constructor(
    private host: T,
    options: TypeCommandControllerOptions = {}
  ) {
    this.#trigger = options.trigger ?? 'click';
    this.host.addController(this);
  }

  get target(): HTMLElement | null {
    if (this.host.commandForElement) {
      return this.host.commandForElement;
    }

    if (!this.host.commandfor) {
      return null;
    }

    return (
      getFlattenedDOMTree(this.host.getRootNode() as HTMLElement).find(el => el.id === this.host.commandfor) ?? null
    );
  }

  async hostUpdated() {
    await this.host.updateComplete;
    this.#updateListener();
  }

  hostDisconnected() {
    this.host.removeEventListener('click', this.#triggerCommand);
  }

  #updateListener() {
    if (this.#trigger === 'manual' || this.host.readOnly || this.host.disabled) {
      this.host.removeEventListener('click', this.#triggerCommand);
    } else {
      this.host.addEventListener('click', this.#triggerCommand);
    }
  }

  #triggerCommand = (event: Event) => {
    if (event.defaultPrevented) {
      return;
    }

    this.dispatchCommand();
  };

  dispatchCommand() {
    if (this.host.readOnly || this.host.disabled || !this.host.command) {
      return false;
    }

    const target = this.target;
    if (!target) {
      if (this.host.commandfor || this.host.commandForElement) {
        console.warn('commandForElement', this.host.commandfor || this.host.commandForElement, 'not found');
      }
      return false;
    }

    target.dispatchEvent(new globalThis.CommandEvent('command', { command: this.host.command, source: this.host }));
    return true;
  }
}

export interface TypeCommandControllerOptions {
  trigger?: 'click' | 'manual';
}
