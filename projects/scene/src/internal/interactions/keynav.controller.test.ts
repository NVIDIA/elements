// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { KeynavController, type KeynavCommand, type KeynavHandling } from './keynav.controller.js';

class KeynavControllerTestHost extends HTMLElement {
  readonly #controllers = new Set<ReactiveController>();
  readonly updateComplete = Promise.resolve(true);

  addController(controller: ReactiveController): void {
    this.#controllers.add(controller);
  }

  removeController(controller: ReactiveController): void {
    this.#controllers.delete(controller);
  }

  requestUpdate(): void {}

  connectedCallback(): void {
    this.#controllers.forEach(controller => controller.hostConnected?.());
  }

  disconnectedCallback(): void {
    this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }
}

const tag = 'keynav-controller-test-host';
if (!customElements.get(tag)) customElements.define(tag, KeynavControllerTestHost);

describe('KeynavController', () => {
  let fixture: HTMLElement;
  let host: KeynavControllerTestHost;
  let commands: KeynavCommand[];
  let handling: KeynavHandling;
  let prepare: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as KeynavControllerTestHost;
    commands = [];
    handling = 'handled';
    prepare = vi.fn();
    new KeynavController(host, {
      onCommand: command => {
        commands.push(command);
        return handling;
      },
      prepare
    });
    fixture.append(host);
  });

  afterEach(() => removeFixture(fixture));

  it('normalizes directional and zoom keys and prevents handled defaults', () => {
    const events = [
      new KeyboardEvent('keydown', { cancelable: true, key: 'ArrowLeft', shiftKey: true }),
      new KeyboardEvent('keydown', { cancelable: true, key: 'ArrowUp' }),
      new KeyboardEvent('keydown', { cancelable: true, key: '+' }),
      new KeyboardEvent('keydown', { cancelable: true, key: '=' }),
      new KeyboardEvent('keydown', { cancelable: true, key: '-' })
    ];

    expect(events.map(event => host.dispatchEvent(event))).toEqual([false, false, false, false, false]);
    expect(commands).toEqual([
      { horizontal: -1, key: 'ArrowLeft', kind: 'direction', shiftKey: true, vertical: 0 },
      { horizontal: 0, key: 'ArrowUp', kind: 'direction', shiftKey: false, vertical: 1 },
      { key: '+', kind: 'zoom' },
      { key: '=', kind: 'zoom' },
      { key: '-', kind: 'zoom' }
    ]);
    expect(prepare).toHaveBeenCalledTimes(5);
  });

  it('leaves ignored, descendant, and unrecognized input alone', () => {
    handling = 'ignored';
    const child = document.createElement('button');
    host.append(child);
    const descendant = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' });
    const ignored = new KeyboardEvent('keydown', { cancelable: true, key: 'ArrowDown' });
    const unrecognized = new KeyboardEvent('keydown', { cancelable: true, key: 'x' });

    expect(child.dispatchEvent(descendant)).toBe(true);
    expect(host.dispatchEvent(ignored)).toBe(true);
    expect(host.dispatchEvent(unrecognized)).toBe(true);
    expect(commands).toEqual([{ horizontal: 0, key: 'ArrowDown', kind: 'direction', shiftKey: false, vertical: -1 }]);
    expect(prepare).toHaveBeenCalledTimes(2);
  });

  it('removes its listener when the host disconnects', () => {
    host.remove();
    host.dispatchEvent(new KeyboardEvent('keydown', { cancelable: true, key: 'ArrowRight' }));

    expect(commands).toEqual([]);
    expect(prepare).not.toHaveBeenCalled();
  });
});
