// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { KeyNavigationSpatialController, type SpatialKeyCommand } from './keynav-spatial.controller.js';

class KeyNavigationSpatialControllerTestHost extends HTMLElement {
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

const tag = 'keynav-spatial-controller-test-host';
if (!customElements.get(tag)) customElements.define(tag, KeyNavigationSpatialControllerTestHost);

describe('KeyNavigationSpatialController', () => {
  let fixture: HTMLElement;
  let host: KeyNavigationSpatialControllerTestHost;
  let events: CustomEvent<SpatialKeyCommand>[];

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as KeyNavigationSpatialControllerTestHost;
    events = [];
    new KeyNavigationSpatialController(host);
    host.addEventListener('nve-key', event => events.push(event as CustomEvent<SpatialKeyCommand>));
    fixture.append(host);
  });

  afterEach(() => removeFixture(fixture));

  it('synchronously dispatches normalized directional and zoom commands on the host', () => {
    const sourceEvents = [
      new KeyboardEvent('keydown', { cancelable: true, key: 'ArrowLeft', shiftKey: true }),
      new KeyboardEvent('keydown', { cancelable: true, key: 'ArrowUp' }),
      new KeyboardEvent('keydown', { cancelable: true, ctrlKey: true, key: 'ArrowDown', shiftKey: true }),
      new KeyboardEvent('keydown', { cancelable: true, key: '+' }),
      new KeyboardEvent('keydown', { cancelable: true, key: '=' }),
      new KeyboardEvent('keydown', { cancelable: true, key: '-' })
    ];

    expect(sourceEvents.map(event => host.dispatchEvent(event))).toEqual([true, true, true, true, true, true]);
    expect(events.map(event => event.detail.event)).toEqual(sourceEvents);
    expect(events.map(({ detail: { event: _, ...command } }) => command)).toEqual([
      { ctrlKey: false, horizontal: -1, key: 'ArrowLeft', kind: 'direction', shiftKey: true, vertical: 0 },
      { ctrlKey: false, horizontal: 0, key: 'ArrowUp', kind: 'direction', shiftKey: false, vertical: 1 },
      { ctrlKey: true, horizontal: 0, key: 'ArrowDown', kind: 'direction', shiftKey: true, vertical: -1 },
      { key: '+', kind: 'zoom' },
      { key: '=', kind: 'zoom' },
      { key: '-', kind: 'zoom' }
    ]);
    expect(events[0]).toMatchObject({ bubbles: false, cancelable: false, composed: false, target: host });
    expect(sourceEvents.every(event => !event.defaultPrevented)).toBe(true);
  });

  it('keeps keynav events internal and leaves descendant and unrecognized input alone', () => {
    const ancestorListener = vi.fn();
    fixture.addEventListener('nve-key', ancestorListener);
    const child = document.createElement('button');
    host.append(child);
    const descendant = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'ArrowRight' });
    const recognized = new KeyboardEvent('keydown', { cancelable: true, key: 'ArrowDown' });
    const unrecognized = new KeyboardEvent('keydown', { cancelable: true, key: 'x' });

    expect(child.dispatchEvent(descendant)).toBe(true);
    expect(host.dispatchEvent(recognized)).toBe(true);
    expect(host.dispatchEvent(unrecognized)).toBe(true);
    expect(events).toHaveLength(1);
    expect(events[0]?.detail).toMatchObject({
      ctrlKey: false,
      event: recognized,
      horizontal: 0,
      key: 'ArrowDown',
      kind: 'direction',
      shiftKey: false,
      vertical: -1
    });
    expect(ancestorListener).not.toHaveBeenCalled();
  });

  it('should ignore composed keydown events from shadow descendants', () => {
    const shadowChild = document.createElement('button');
    host.attachShadow({ mode: 'open' }).append(shadowChild);

    shadowChild.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, composed: true, key: 'ArrowRight' }));

    expect(events).toEqual([]);
  });

  it('removes its listener when the host disconnects', () => {
    host.remove();
    host.dispatchEvent(new KeyboardEvent('keydown', { cancelable: true, key: 'ArrowRight' }));

    expect(events).toEqual([]);
  });
});
