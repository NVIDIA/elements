// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { ViewportNavigationController } from './viewport-navigation.controller.js';
import type {
  ViewportPanBehavior,
  ViewportPanProposal,
  ViewportTransform,
  ViewportZoomProposal,
  ViewportZoomRequestOptions
} from './viewport.types.js';
import type { ViewportZoomAction } from './viewport-navigation.types.js';

class ViewportNavigationControllerTestHost extends HTMLElement {
  readonly #controllers = new Set<ReactiveController>();
  readonly updateComplete = Promise.resolve(true);
  behaviorPan: ViewportPanBehavior = false;
  behaviorZoom = false;
  readonly requestPan = vi.fn((_proposal: ViewportPanProposal) => true);
  readonly requestZoom = vi.fn((_proposal: ViewportZoomProposal, _options?: ViewportZoomRequestOptions) => true);

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
  let getZoomTarget: ReturnType<typeof vi.fn<(action: ViewportZoomAction) => ViewportTransform | undefined>>;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as ViewportNavigationControllerTestHost;
    Object.defineProperties(host, {
      clientHeight: { configurable: true, value: 300 },
      clientWidth: { configurable: true, value: 400 }
    });
    transform = { scale: 1, x: 0, y: 0 };
    getZoomTarget = vi.fn(action => {
      if (action === 'in') return { scale: 2, x: 100, y: 75 };
      if (action === 'out') return { scale: 0.5, x: -200, y: -150 };
      if (action === 'reset') return { scale: 1, x: 0, y: 0 };
      return { scale: 1.5, x: 50, y: 25 };
    });
    new ViewportNavigationController(host, { getTransform: () => transform, getZoomTarget });
    fixture.append(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('manages only its own tabindex while either effective capability needs focus', () => {
    expect(host.hasAttribute('tabindex')).toBe(false);
    host.behaviorPan = 'space';
    host.sync();
    expect(host.getAttribute('tabindex')).toBe('0');

    host.setAttribute('tabindex', '-1');
    host.behaviorPan = false;
    host.sync();
    expect(host.getAttribute('tabindex')).toBe('-1');

    host.removeAttribute('tabindex');
    host.behaviorZoom = true;
    host.sync();
    expect(host.getAttribute('tabindex')).toBe('0');
    host.behaviorZoom = false;
    host.sync();
    expect(host.hasAttribute('tabindex')).toBe(false);
  });

  it('preserves a consumer tabindex assigned while disconnected', () => {
    host.behaviorPan = true;
    host.sync();
    expect(host.getAttribute('tabindex')).toBe('0');

    host.remove();
    host.tabIndex = -1;
    fixture.append(host);
    host.behaviorPan = false;
    host.sync();

    expect(host.getAttribute('tabindex')).toBe('-1');
  });

  it('turns focused Arrow input into a scale-independent pan request in Space mode', () => {
    host.behaviorPan = 'space';
    host.sync();
    host.focus();
    transform = { scale: 2, x: 100, y: 200 };
    const event = keyEvent({ key: 'ArrowRight', shiftKey: true });

    expect(host.dispatchEvent(event)).toBe(false);
    expect(host.requestPan).toHaveBeenCalledWith({
      event,
      next: { scale: 2, x: 150, y: 200 },
      source: 'keyboard'
    });
  });

  it.each([
    ['ArrowLeft', { scale: 2, x: 90, y: 200 }],
    ['ArrowRight', { scale: 2, x: 110, y: 200 }],
    ['ArrowUp', { scale: 2, x: 100, y: 190 }],
    ['ArrowDown', { scale: 2, x: 100, y: 210 }]
  ] as const)('maps %s to a 20-pixel pan step', (key, next) => {
    host.behaviorPan = true;
    host.sync();
    host.focus();
    transform = { scale: 2, x: 100, y: 200 };

    host.dispatchEvent(keyEvent({ key }));

    expect(host.requestPan).toHaveBeenCalledWith(expect.objectContaining({ next, source: 'keyboard' }));
  });

  it('leaves modified and descendant Arrow input alone', () => {
    host.behaviorPan = true;
    host.sync();
    host.focus();
    for (const modifier of ['ctrlKey', 'metaKey', 'altKey'] as const) {
      expect(host.dispatchEvent(keyEvent({ key: 'ArrowRight', [modifier]: true }))).toBe(true);
    }
    const input = document.createElement('input');
    host.append(input);
    input.focus();
    expect(host.dispatchEvent(keyEvent({ key: 'ArrowRight' }))).toBe(true);

    expect(host.requestPan).not.toHaveBeenCalled();
  });

  it('accepts keyboard input when focused inside an immediate shadow root', () => {
    host.remove();
    const shadowHost = document.createElement('div');
    const root = shadowHost.attachShadow({ mode: 'open' });
    root.append(host);
    fixture.append(shadowHost);
    host.behaviorPan = true;
    host.sync();
    host.focus();

    expect(host.dispatchEvent(keyEvent({ key: 'ArrowDown' }))).toBe(false);
    expect(host.requestPan).toHaveBeenCalledOnce();
  });

  it.each([
    ['--pan-left', { scale: 2, x: 90, y: 200 }],
    ['--pan-right', { scale: 2, x: 110, y: 200 }],
    ['--pan-up', { scale: 2, x: 100, y: 190 }],
    ['--pan-down', { scale: 2, x: 100, y: 210 }]
  ] as const)('issues a %s command pan without focus', (command, next) => {
    host.behaviorPan = 'space';
    host.sync();
    transform = { scale: 2, x: 100, y: 200 };
    const event = new CommandEvent('command', { command });

    host.dispatchEvent(event);

    expect(host.requestPan).toHaveBeenCalledWith({ event, next, source: 'command' });
  });

  it('issues an animated keyboard zoom with a content anchor and no synthetic client point', () => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();
    const event = keyEvent({ key: '+' });

    expect(host.dispatchEvent(event)).toBe(false);
    expect(getZoomTarget).toHaveBeenCalledWith('in');
    expect(host.requestZoom).toHaveBeenCalledWith(
      {
        anchor: { x: 200, y: 150 },
        event,
        factor: 2,
        next: { scale: 2, x: 100, y: 75 },
        source: 'keyboard'
      },
      { animated: true }
    );
  });

  it.each([
    ['plus', { code: 'Equal', key: '+' }, 'in'],
    ['equal', { code: 'Equal', key: '=' }, 'in'],
    ['numpad plus', { code: 'NumpadAdd', key: '+' }, 'in'],
    ['minus', { code: 'Minus', key: '-' }, 'out'],
    ['numpad minus', { code: 'NumpadSubtract', key: '-' }, 'out']
  ] as const)('maps focused %s zoom input to %s', (_name, init, action) => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();

    expect(host.dispatchEvent(keyEvent(init))).toBe(false);
    expect(getZoomTarget).toHaveBeenCalledWith(action);
    expect(host.requestZoom).toHaveBeenCalledWith(expect.objectContaining({ source: 'keyboard' }), { animated: true });
  });

  it.each([
    ['reset', { ctrlKey: true, key: '0' }, 'reset'],
    ['fit', { key: '1', metaKey: true }, 'fit']
  ] as const)('maps modified %s input to %s', (_name, init, action) => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();

    expect(host.dispatchEvent(keyEvent(init))).toBe(false);
    expect(getZoomTarget).toHaveBeenCalledWith(action);
    expect(host.requestZoom).toHaveBeenCalledOnce();
  });

  it.each([
    ['--zoom-in', 'in'],
    ['--zoom-out', 'out'],
    ['--zoom-reset', 'reset'],
    ['--zoom-to-fit', 'fit']
  ] as const)('issues an animated %s command zoom without focus', (command, action) => {
    host.behaviorZoom = true;
    host.sync();
    const event = new CommandEvent('command', { command });

    host.dispatchEvent(event);

    expect(getZoomTarget).toHaveBeenCalledWith(action);
    expect(host.requestZoom).toHaveBeenCalledWith(expect.objectContaining({ event, source: 'command' }), {
      animated: true
    });
  });

  it('leaves disabled zoom commands unrequested', () => {
    host.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
    expect(getZoomTarget).not.toHaveBeenCalled();
    expect(host.requestZoom).not.toHaveBeenCalled();
  });

  it('registers keyboard and command zoom routes once after reconnecting', () => {
    host.behaviorZoom = true;
    host.sync();
    host.remove();
    fixture.append(host);
    host.focus();

    host.dispatchEvent(keyEvent({ key: '+' }));
    host.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));

    expect(host.requestZoom).toHaveBeenCalledTimes(2);
    expect(vi.mocked(host.requestZoom).mock.calls.map(([proposal]) => proposal.source)).toEqual([
      'keyboard',
      'command'
    ]);
  });

  it('rejects disabled input and resumes once after reconnecting', () => {
    const command = (): void => host.dispatchEvent(new CommandEvent('command', { command: '--pan-right' }));
    command();
    expect(host.requestPan).not.toHaveBeenCalled();

    host.behaviorPan = true;
    host.sync();
    command();
    expect(host.requestPan).toHaveBeenCalledOnce();

    host.remove();
    command();
    expect(host.requestPan).toHaveBeenCalledOnce();

    fixture.append(host);
    command();
    expect(host.requestPan).toHaveBeenCalledTimes(2);
  });
});

function keyEvent(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', { bubbles: true, cancelable: true, composed: true, ...init });
}
