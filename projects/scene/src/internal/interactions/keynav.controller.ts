// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveControllerHost } from 'lit';

type KeynavHost = ReactiveControllerHost & HTMLElement;

export type KeynavHandling = 'handled' | 'ignored';

export type KeynavCommand =
  | {
      readonly kind: 'direction';
      readonly horizontal: -1 | 0 | 1;
      readonly key: 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp';
      readonly shiftKey: boolean;
      readonly vertical: -1 | 0 | 1;
    }
  | {
      readonly kind: 'zoom';
      readonly key: '+' | '-' | '=';
    };

interface KeynavControllerOptions {
  readonly onCommand: (command: KeynavCommand) => KeynavHandling;
  readonly prepare?: () => void;
}

/** Converts direct-host keyboard input into generic directional and zoom commands. */
export class KeynavController implements ReactiveController {
  readonly #host: KeynavHost;
  readonly #options: KeynavControllerOptions;

  constructor(host: KeynavHost, options: KeynavControllerOptions) {
    this.#host = host;
    this.#options = options;
    host.addController(this);
  }

  hostConnected(): void {
    this.#host.addEventListener('keydown', this.#handleKeydown);
  }

  hostDisconnected(): void {
    this.#host.removeEventListener('keydown', this.#handleKeydown);
  }

  #handleKeydown = (event: KeyboardEvent): void => {
    if (event.target !== this.#host) return;
    this.#options.prepare?.();
    const command = getKeynavCommand(event);
    if (command && this.#options.onCommand(command) === 'handled') event.preventDefault();
  };
}

function getKeynavCommand(event: KeyboardEvent): KeynavCommand | undefined {
  switch (event.key) {
    case 'ArrowDown':
      return { horizontal: 0, key: event.key, kind: 'direction', shiftKey: event.shiftKey, vertical: -1 };
    case 'ArrowLeft':
      return { horizontal: -1, key: event.key, kind: 'direction', shiftKey: event.shiftKey, vertical: 0 };
    case 'ArrowRight':
      return { horizontal: 1, key: event.key, kind: 'direction', shiftKey: event.shiftKey, vertical: 0 };
    case 'ArrowUp':
      return { horizontal: 0, key: event.key, kind: 'direction', shiftKey: event.shiftKey, vertical: 1 };
    case '+':
    case '-':
    case '=':
      return { key: event.key, kind: 'zoom' };
    default:
      return undefined;
  }
}
