// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { ViewportNavigationController } from './viewport-navigation.controller.js';
import type { ViewportPanBehavior, ViewportTransform } from './viewport.types.js';
import type { ViewportZoomAction } from './viewport-navigation.types.js';

class ViewportNavigationControllerTestHost extends HTMLElement {
  readonly #controllers = new Set<ReactiveController>();
  readonly updateComplete = Promise.resolve(true);
  behaviorPan: ViewportPanBehavior = false;
  behaviorZoom = false;

  get pannable(): boolean {
    return Boolean(this.behaviorPan);
  }

  get zoomable(): boolean {
    return this.behaviorZoom;
  }

  addController(controller: ReactiveController): void {
    this.#controllers.add(controller);
  }

  removeController(controller: ReactiveController): void {
    this.#controllers.delete(controller);
  }

  requestUpdate(): void {}

  sync(): void {
    this.#controllers.forEach(controller => controller.hostUpdated?.());
  }

  connectedCallback(): void {
    this.#controllers.forEach(controller => controller.hostConnected?.());
  }

  disconnectedCallback(): void {
    this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }
}

const tag = 'viewport-navigation-controller-test-host';
if (!customElements.get(tag)) customElements.define(tag, ViewportNavigationControllerTestHost);

describe('ViewportNavigationController', () => {
  let fixture: HTMLElement;
  let host: ViewportNavigationControllerTestHost;
  let transform: ViewportTransform;
  const applyPan = vi.fn();
  const applyZoom = vi.fn();
  const getZoomTarget = vi.fn((_action: ViewportZoomAction): ViewportTransform => ({ x: 100, y: 75, scale: 2 }));

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as ViewportNavigationControllerTestHost;
    transform = { x: 0, y: 0, scale: 1 };
    applyPan.mockReset();
    applyZoom.mockReset();
    getZoomTarget.mockClear();
    new ViewportNavigationController(host, {
      getTransform: () => transform,
      getZoomTarget,
      getCenteredZoomTarget: scale => ({ x: 100, y: 75, scale }),
      applyPan,
      applyZoom
    });
    fixture.append(host);
  });

  afterEach(() => removeFixture(fixture));

  it('manages only its own tabindex', () => {
    host.behaviorPan = true;
    host.sync();
    expect(host.tabIndex).toBe(0);
    host.tabIndex = -1;
    host.behaviorPan = false;
    host.sync();
    expect(host.tabIndex).toBe(-1);
    host.removeAttribute('tabindex');
    host.behaviorZoom = true;
    host.sync();
    expect(host.tabIndex).toBe(0);
    host.behaviorZoom = false;
    host.sync();
    expect(host.hasAttribute('tabindex')).toBe(false);
  });

  it.each([
    ['--pan-left', 'ArrowLeft', { x: -1, y: 0 }],
    ['--pan-right', 'ArrowRight', { x: 1, y: 0 }],
    ['--pan-up', 'ArrowUp', { x: 0, y: -1 }],
    ['--pan-down', 'ArrowDown', { x: 0, y: 1 }]
  ] as const)('maps %s and %s to scale-independent movement', (command, key, { x, y }) => {
    host.behaviorPan = 'space';
    host.sync();
    transform = { x: 100, y: 200, scale: 2 };
    host.dispatchEvent(new CommandEvent('command', { command }));
    expect(applyPan).toHaveBeenLastCalledWith({ x: 100 + x * 10, y: 200 + y * 10, scale: 2 });
    host.focus();
    expect(host.dispatchEvent(keyEvent({ key, shiftKey: true }))).toBe(false);
    expect(applyPan).toHaveBeenLastCalledWith({ x: 100 + x * 50, y: 200 + y * 50, scale: 2 });
  });

  it.each([
    ['--zoom-in', '+', 'in'],
    ['--zoom-out', '-', 'out'],
    ['--zoom-reset', '0', 'reset'],
    ['--zoom-to-fit', '1', 'fit']
  ] as const)('maps %s and keyboard input to animated navigation', (command, key, action) => {
    host.behaviorZoom = true;
    host.sync();
    host.dispatchEvent(new CommandEvent('command', { command }));
    expect(getZoomTarget).toHaveBeenLastCalledWith(action);
    expect(applyZoom).toHaveBeenLastCalledWith({ x: 100, y: 75, scale: 2 }, { animated: true });
    host.focus();
    expect(host.dispatchEvent(keyEvent({ key, ctrlKey: key === '0' || key === '1' }))).toBe(false);
    expect(getZoomTarget).toHaveBeenLastCalledWith(action);
  });

  it('leaves disabled, modified and descendant input alone', () => {
    host.dispatchEvent(new CommandEvent('command', { command: '--pan-right' }));
    host.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
    host.behaviorPan = true;
    host.behaviorZoom = true;
    host.sync();
    host.focus();
    expect(host.dispatchEvent(keyEvent({ key: 'ArrowRight', ctrlKey: true }))).toBe(true);
    const input = document.createElement('input');
    host.append(input);
    input.focus();
    expect(input.dispatchEvent(keyEvent({ key: '+' }))).toBe(true);
    expect(applyPan).not.toHaveBeenCalled();
    expect(applyZoom).not.toHaveBeenCalled();
  });

  it('registers routes once across reconnects', () => {
    host.behaviorPan = true;
    host.sync();
    host.remove();
    host.dispatchEvent(new CommandEvent('command', { command: '--pan-right' }));
    expect(applyPan).not.toHaveBeenCalled();
    fixture.append(host);
    host.dispatchEvent(new CommandEvent('command', { command: '--pan-right' }));
    expect(applyPan).toHaveBeenCalledOnce();
  });
});

function keyEvent(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', { bubbles: true, cancelable: true, composed: true, ...init });
}
