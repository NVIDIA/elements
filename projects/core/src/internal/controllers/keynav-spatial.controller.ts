// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveControllerHost } from 'lit';

type SpatialKeyHost = ReactiveControllerHost & HTMLElement;

export type SpatialKeyHandling = 'handled' | 'ignored';

export type SpatialKeyCommand =
  | {
      readonly ctrlKey: boolean;
      readonly event: KeyboardEvent;
      readonly kind: 'direction';
      readonly horizontal: -1 | 0 | 1;
      readonly key: 'ArrowDown' | 'ArrowLeft' | 'ArrowRight' | 'ArrowUp';
      readonly shiftKey: boolean;
      readonly vertical: -1 | 0 | 1;
    }
  | {
      readonly event: KeyboardEvent;
      readonly kind: 'zoom';
      readonly key: '+' | '-' | '=';
    };

/** Converts direct-host keyboard input into spatial direction and zoom commands. */
export class KeyNavigationSpatialController implements ReactiveController {
  readonly #host: SpatialKeyHost;

  constructor(host: SpatialKeyHost) {
    this.#host = host;
    host.addController(this);
  }

  hostConnected(): void {
    this.#host.addEventListener('keydown', this.#handleKeydown);
  }

  hostDisconnected(): void {
    this.#host.removeEventListener('keydown', this.#handleKeydown);
  }

  #handleKeydown = (event: KeyboardEvent): void => {
    if (event.composedPath()[0] !== this.#host) return;
    const command = getSpatialKeyCommand(event);
    if (!command) return;
    this.#host.dispatchEvent(
      new CustomEvent<SpatialKeyCommand>('nve-key', {
        bubbles: false,
        cancelable: false,
        composed: false,
        detail: command
      })
    );
  };
}

function getSpatialKeyCommand(event: KeyboardEvent): SpatialKeyCommand | undefined {
  switch (event.key) {
    case 'ArrowDown':
      return {
        ctrlKey: event.ctrlKey,
        event,
        horizontal: 0,
        key: event.key,
        kind: 'direction',
        shiftKey: event.shiftKey,
        vertical: -1
      };
    case 'ArrowLeft':
      return {
        ctrlKey: event.ctrlKey,
        event,
        horizontal: -1,
        key: event.key,
        kind: 'direction',
        shiftKey: event.shiftKey,
        vertical: 0
      };
    case 'ArrowRight':
      return {
        ctrlKey: event.ctrlKey,
        event,
        horizontal: 1,
        key: event.key,
        kind: 'direction',
        shiftKey: event.shiftKey,
        vertical: 0
      };
    case 'ArrowUp':
      return {
        ctrlKey: event.ctrlKey,
        event,
        horizontal: 0,
        key: event.key,
        kind: 'direction',
        shiftKey: event.shiftKey,
        vertical: 1
      };
    case '+':
    case '-':
    case '=':
      return { event, key: event.key, kind: 'zoom' };
    default:
      return undefined;
  }
}
