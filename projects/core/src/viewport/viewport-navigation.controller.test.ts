// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import { ViewportNavigationController, type ViewportNavigationDelegate } from './viewport-navigation.controller.js';
import type { ViewportNavigationEventDelegate } from './viewport-navigation.types.js';
import type { ViewportPanBehavior, ViewportTransform } from './viewport.types.js';
import type { ViewportZoomAction } from './viewport-navigation.types.js';

class ViewportNavigationControllerTestHost extends HTMLElement {
  readonly #controllers = new Set<ReactiveController>();
  readonly updateComplete = Promise.resolve(true);
  behaviorPan: ViewportPanBehavior = false;
  behaviorZoom = false;

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
  let animateTo: ReturnType<typeof vi.fn<ViewportNavigationDelegate['animateTo']>>;
  let commitTransform: ReturnType<typeof vi.fn<ViewportNavigationDelegate['commitTransform']>>;
  let cancelAnimation: ReturnType<typeof vi.fn<ViewportNavigationDelegate['cancelAnimation']>>;
  let consumeAutoFit: ReturnType<typeof vi.fn<ViewportNavigationDelegate['consumeAutoFit']>>;
  let events: ViewportNavigationEventDelegate;
  let fixture: HTMLElement;
  let getZoomTarget: ReturnType<typeof vi.fn<(action: ViewportZoomAction) => ViewportTransform | undefined>>;
  let host: ViewportNavigationControllerTestHost;
  let rebasePointerSessions: ReturnType<typeof vi.fn<ViewportNavigationDelegate['rebasePointerSessions']>>;
  let transform: ViewportTransform;
  let animationDestinationScale: number | undefined;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as ViewportNavigationControllerTestHost;
    Object.defineProperties(host, {
      clientHeight: { configurable: true, value: 300 },
      clientWidth: { configurable: true, value: 400 }
    });
    transform = { scale: 1, x: 0, y: 0 };
    animationDestinationScale = undefined;
    animateTo = vi.fn(target => {
      animationDestinationScale = target.scale;
    });
    commitTransform = vi.fn(next => {
      transform = next;
      return true;
    });
    cancelAnimation = vi.fn();
    consumeAutoFit = vi.fn();
    rebasePointerSessions = vi.fn();
    events = {
      dispatchPanStart: vi.fn(() => true),
      dispatchPan: vi.fn(() => true),
      dispatchPanEnd: vi.fn(),
      dispatchZoom: vi.fn(() => true)
    };
    getZoomTarget = vi.fn(action => {
      const scale = animationDestinationScale ?? transform.scale;
      if (action === 'in') return { scale: Math.min(4, scale * 2), x: 0, y: 0 };
      if (action === 'out') return { scale: Math.max(0.5, scale / 2), x: 0, y: 0 };
      if (action === 'reset') return { scale: 1, x: 0, y: 0 };
      return { scale: 1.5, x: 50, y: 25 };
    });
    new ViewportNavigationController(host, {
      animateTo,
      commitTransform,
      cancelAnimation,
      consumeAutoFit,
      events,
      getTransform: () => transform,
      getZoomTarget,
      rebasePointerSessions,
      viewportToClient: (x, y) => ({ x, y })
    });
    fixture.append(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('manages only the tabindex it owns while either navigation policy needs focusability', () => {
    expect(host.hasAttribute('tabindex')).toBe(false);

    host.behaviorPan = true;
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

  it('translates focused Arrow keys into scale-independent discrete pan requests', () => {
    host.behaviorPan = true;
    host.sync();
    transform = { scale: 2, x: 100, y: 200 };
    host.focus();

    const event = keyEvent({ key: 'ArrowRight', shiftKey: true });
    expect(host.dispatchEvent(event)).toBe(false);

    expect(event.defaultPrevented).toBe(true);
    expect(events.dispatchPan).toHaveBeenCalledWith({
      event,
      next: { scale: 2, x: 150, y: 200 },
      source: 'keyboard',
      start: { scale: 2, x: 100, y: 200 }
    });
    expect(commitTransform).toHaveBeenCalledWith({ scale: 2, x: 150, y: 200 });
    expect(cancelAnimation).toHaveBeenCalledOnce();
    expect(consumeAutoFit).toHaveBeenCalledOnce();
    expect(rebasePointerSessions).toHaveBeenCalledOnce();
  });

  it.each([
    ['ArrowLeft', { scale: 2, x: 90, y: 200 }],
    ['ArrowRight', { scale: 2, x: 110, y: 200 }],
    ['ArrowUp', { scale: 2, x: 100, y: 190 }],
    ['ArrowDown', { scale: 2, x: 100, y: 210 }]
  ] as const)('translates %s into a visible 20-pixel pan step', (key, next) => {
    host.behaviorPan = true;
    transform = { scale: 2, x: 100, y: 200 };
    host.sync();
    host.focus();

    host.dispatchEvent(keyEvent({ key }));

    expect(events.dispatchPan).toHaveBeenCalledWith(
      expect.objectContaining({ next, source: 'keyboard', start: { scale: 2, x: 100, y: 200 } })
    );
    expect(commitTransform).toHaveBeenCalledWith(next);
  });

  it.each([
    [0.5, false, 40],
    [0.5, true, 200]
  ] as const)(
    'converts a %s-scale Arrow step with Shift %s from viewport pixels to content space',
    (scale, shiftKey, contentDelta) => {
      host.behaviorPan = 'space';
      transform = { scale, x: 0, y: 0 };
      host.sync();
      host.focus();

      host.dispatchEvent(keyEvent({ key: 'ArrowRight', shiftKey }));

      expect(commitTransform).toHaveBeenCalledWith({ scale, x: contentDelta, y: 0 });
    }
  );

  it.each(['ctrlKey', 'metaKey', 'altKey'] as const)('leaves %s Arrow input alone', modifier => {
    host.behaviorPan = true;
    host.sync();
    host.focus();
    const modified = keyEvent({ key: 'ArrowRight', [modifier]: true });

    expect(host.dispatchEvent(modified)).toBe(true);
    expect(events.dispatchPan).not.toHaveBeenCalled();
  });

  it('requires exact host focus and rejects focused light- and shadow-DOM descendants', () => {
    host.behaviorPan = true;
    host.behaviorZoom = true;
    host.sync();
    const outside = document.createElement('button');
    const input = document.createElement('input');
    const shadowHost = document.createElement('div');
    const shadowButton = document.createElement('button');
    shadowHost.attachShadow({ mode: 'open' }).append(shadowButton);
    host.append(input, shadowHost);
    fixture.append(outside);

    outside.focus();
    expect(host.dispatchEvent(keyEvent({ key: 'ArrowRight' }))).toBe(true);
    expect(host.dispatchEvent(keyEvent({ key: '+' }))).toBe(true);
    input.focus();
    expect(host.dispatchEvent(keyEvent({ key: 'ArrowRight' }))).toBe(true);
    expect(host.dispatchEvent(keyEvent({ key: '+' }))).toBe(true);
    shadowButton.focus();
    expect(host.dispatchEvent(keyEvent({ key: 'ArrowRight' }))).toBe(true);
    expect(host.dispatchEvent(keyEvent({ key: '+' }))).toBe(true);

    expect(events.dispatchPan).not.toHaveBeenCalled();
    expect(events.dispatchZoom).not.toHaveBeenCalled();
  });

  it('uses immediate shadow-root focus for keyboard admission', async () => {
    host.remove();
    const shadowHost = document.createElement('div');
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    shadowRoot.append(host);
    fixture.append(shadowHost);
    host.behaviorPan = true;
    host.sync();
    host.focus();
    const event = keyEvent({ key: 'ArrowDown' });

    expect(shadowRoot.activeElement).toBe(host);
    expect(host.dispatchEvent(event)).toBe(false);
    expect(events.dispatchPan).toHaveBeenCalledOnce();
  });

  it('handles Invoker commands without focus and uses the event delegate before the default', () => {
    host.behaviorPan = 'space';
    host.sync();
    const event = new CommandEvent('command', { command: '--pan-left' });

    host.dispatchEvent(event);

    expect(events.dispatchPan).toHaveBeenCalledWith({
      event,
      next: { scale: 1, x: -20, y: 0 },
      source: 'command',
      start: { scale: 1, x: 0, y: 0 }
    });
    expect(commitTransform).toHaveBeenCalledWith({ scale: 1, x: -20, y: 0 });
  });

  it('constructs a focused keyboard zoom request and delegates its animated default', () => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();
    const event = keyEvent({ key: '+' });

    expect(host.dispatchEvent(event)).toBe(false);

    expect(events.dispatchZoom).toHaveBeenCalledWith({
      anchor: { x: 200, y: 150 },
      clientX: 200,
      clientY: 150,
      event,
      factor: 2,
      next: { scale: 2, x: 0, y: 0 },
      source: 'keyboard',
      start: { scale: 1, x: 0, y: 0 }
    });
    expect(animateTo).toHaveBeenCalledWith({ scale: 2, x: 0, y: 0 });
  });

  it.each([
    ['plus', { code: 'Equal', key: '+' }, 'in'],
    ['equal', { code: 'Equal', key: '=' }, 'in'],
    ['numpad plus', { code: 'NumpadAdd', key: '+' }, 'in'],
    ['minus', { code: 'Minus', key: '-' }, 'out'],
    ['numpad minus', { code: 'NumpadSubtract', key: '-' }, 'out']
  ] as const)('handles the focused %s keyboard zoom variant', (_name, init, action) => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();
    const event = keyEvent(init);

    expect(host.dispatchEvent(event)).toBe(false);

    expect(event.defaultPrevented).toBe(true);
    expect(getZoomTarget).toHaveBeenCalledWith(action);
    expect(events.dispatchZoom).toHaveBeenCalledWith(expect.objectContaining({ event, source: 'keyboard' }));
  });

  it.each([
    ['reset', { ctrlKey: true, key: '0' }, 'reset'],
    ['fit', { key: '1', metaKey: true }, 'fit']
  ] as const)('handles the focused modified %s shortcut', (_name, init, action) => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();

    expect(host.dispatchEvent(keyEvent(init))).toBe(false);

    expect(getZoomTarget).toHaveBeenCalledWith(action);
    expect(events.dispatchZoom).toHaveBeenCalledWith(expect.objectContaining({ source: 'keyboard' }));
  });

  it('does not apply canceled discrete pan or zoom defaults', () => {
    host.behaviorPan = true;
    host.behaviorZoom = true;
    host.sync();
    vi.mocked(events.dispatchPan).mockReturnValue(false);
    vi.mocked(events.dispatchZoom).mockReturnValue(false);

    host.dispatchEvent(new CommandEvent('command', { command: '--pan-right' }));
    host.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));

    expect(commitTransform).not.toHaveBeenCalled();
    expect(animateTo).not.toHaveBeenCalled();
    expect(consumeAutoFit).toHaveBeenCalledTimes(2);
    expect(cancelAnimation).toHaveBeenCalledOnce();
    expect(rebasePointerSessions).not.toHaveBeenCalled();
  });

  it('does not rebase pointer sessions when an accepted discrete pan proposal does not commit', () => {
    host.behaviorPan = true;
    host.sync();
    commitTransform.mockReturnValue(false);

    host.dispatchEvent(new CommandEvent('command', { command: '--pan-right' }));

    expect(events.dispatchPan).toHaveBeenCalledOnce();
    expect(commitTransform).toHaveBeenCalledOnce();
    expect(consumeAutoFit).toHaveBeenCalledOnce();
    expect(cancelAnimation).toHaveBeenCalledOnce();
    expect(rebasePointerSessions).not.toHaveBeenCalled();
  });

  it.each([
    ['--pan-left', { scale: 2, x: 90, y: 200 }],
    ['--pan-right', { scale: 2, x: 110, y: 200 }],
    ['--pan-up', { scale: 2, x: 100, y: 190 }],
    ['--pan-down', { scale: 2, x: 100, y: 210 }]
  ] as const)('handles %s without focus and constructs the command pan detail', (command, next) => {
    host.behaviorPan = 'space';
    transform = { scale: 2, x: 100, y: 200 };
    host.sync();
    const event = new CommandEvent('command', { command });

    host.dispatchEvent(event);

    expect(events.dispatchPan).toHaveBeenCalledWith({
      event,
      next,
      source: 'command',
      start: { scale: 2, x: 100, y: 200 }
    });
    expect(commitTransform).toHaveBeenCalledWith(next);
  });

  it('leaves pan commands inert when pan behavior is disabled', () => {
    host.dispatchEvent(new CommandEvent('command', { command: '--pan-right' }));

    expect(events.dispatchPan).not.toHaveBeenCalled();
    expect(commitTransform).not.toHaveBeenCalled();
  });

  it.each([
    ['--zoom-in', 'in'],
    ['--zoom-out', 'out'],
    ['--zoom-reset', 'reset'],
    ['--zoom-to-fit', 'fit']
  ] as const)('handles %s as a command-originated animated zoom request', (command, action) => {
    host.behaviorZoom = true;
    host.sync();
    const event = new CommandEvent('command', { command });

    host.dispatchEvent(event);

    expect(getZoomTarget).toHaveBeenCalledWith(action);
    expect(events.dispatchZoom).toHaveBeenCalledWith(expect.objectContaining({ event, source: 'command' }));
    expect(animateTo).toHaveBeenCalledOnce();
  });

  it('leaves zoom commands inert when zoom behavior is disabled', () => {
    host.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));

    expect(events.dispatchZoom).not.toHaveBeenCalled();
    expect(animateTo).not.toHaveBeenCalled();
  });

  it.each([
    ['keyboard', () => host.dispatchEvent(keyEvent({ key: '+' }))],
    ['command', () => host.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }))]
  ] as const)('steps repeated %s zoom requests from the animation destination', (_source, requestZoom) => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();

    requestZoom();
    requestZoom();
    requestZoom();

    expect(events.dispatchZoom).toHaveBeenCalledTimes(3);
    expect(animateTo.mock.calls.map(([target]) => target.scale)).toEqual([2, 4, 4]);
    expect(transform.scale).toBe(1);
  });

  it('retains tabindex ownership through reconnects without blurring or overwriting consumer values', () => {
    host.behaviorPan = true;
    host.sync();
    host.focus();
    const blur = vi.spyOn(host, 'blur');

    host.remove();
    fixture.append(host);
    expect(host.getAttribute('tabindex')).toBe('0');

    host.focus();
    host.behaviorPan = false;
    host.sync();
    expect(host.hasAttribute('tabindex')).toBe(false);
    expect(blur).not.toHaveBeenCalled();

    host.setAttribute('tabindex', '-1');
    host.behaviorZoom = true;
    host.sync();
    host.behaviorZoom = false;
    host.sync();
    expect(host.getAttribute('tabindex')).toBe('-1');
  });

  it('ignores command and keyboard input while disabled or disconnected and handles each once after reconnection', () => {
    const requestPan = (): void => {
      host.dispatchEvent(new CommandEvent('command', { command: '--pan-right' }));
      host.dispatchEvent(keyEvent({ key: 'ArrowRight' }));
    };

    requestPan();
    expect(events.dispatchPan).not.toHaveBeenCalled();

    for (let cycle = 0; cycle < 2; cycle += 1) {
      host.behaviorPan = true;
      host.sync();
      host.focus();
      requestPan();
      expect(events.dispatchPan).toHaveBeenCalledTimes((cycle + 1) * 2);

      host.behaviorPan = false;
      host.sync();
      requestPan();
      expect(events.dispatchPan).toHaveBeenCalledTimes((cycle + 1) * 2);
    }

    host.behaviorPan = true;
    host.sync();
    host.focus();
    host.remove();
    requestPan();
    expect(events.dispatchPan).toHaveBeenCalledTimes(4);

    fixture.append(host);
    host.focus();
    requestPan();
    expect(events.dispatchPan).toHaveBeenCalledTimes(6);
  });
});

function keyEvent(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', { bubbles: true, cancelable: true, composed: true, ...init });
}
