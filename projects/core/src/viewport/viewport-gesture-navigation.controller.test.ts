// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attachInternals } from '@nvidia-elements/core/internal';
import { createFixture, removeFixture } from '@internals/testing';
import {
  ViewportGestureNavigationController,
  type ViewportGestureNavigationDelegate
} from './viewport-gesture-navigation.controller.js';
import type { ViewportNavigationEventDelegate } from './viewport-navigation.types.js';
import type { ViewportPanBehavior, ViewportTransform } from './viewport.types.js';

class ViewportGestureNavigationControllerTestHost extends HTMLElement {
  readonly #controllers = new Set<ReactiveController>();
  declare _internals: ElementInternals;
  readonly updateComplete = Promise.resolve(true);
  behaviorPan: ViewportPanBehavior = false;
  behaviorZoom = false;
  dragThreshold = 5;

  addController(controller: ReactiveController): void {
    this.#controllers.add(controller);
  }

  removeController(controller: ReactiveController): void {
    this.#controllers.delete(controller);
  }

  requestUpdate(): void {
    queueMicrotask(() => this.sync());
  }

  sync(): void {
    this.#controllers.forEach(controller => controller.hostUpdated?.());
  }

  connectedCallback(): void {
    attachInternals(this);
    this.#controllers.forEach(controller => controller.hostConnected?.());
  }

  disconnectedCallback(): void {
    this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }
}

const tag = 'viewport-gesture-navigation-controller-test-host';
if (!customElements.get(tag)) customElements.define(tag, ViewportGestureNavigationControllerTestHost);

describe('ViewportGestureNavigationController', () => {
  let commitTransform: ReturnType<typeof vi.fn<ViewportGestureNavigationDelegate['commitTransform']>>;
  let cancelAnimation: ReturnType<typeof vi.fn<ViewportGestureNavigationDelegate['cancelAnimation']>>;
  let consumeAutoFit: ReturnType<typeof vi.fn<ViewportGestureNavigationDelegate['consumeAutoFit']>>;
  let events: ViewportNavigationEventDelegate;
  let fixture: HTMLElement;
  let host: ViewportGestureNavigationControllerTestHost;
  let transform: ViewportTransform;
  let controller: ViewportGestureNavigationController;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as ViewportGestureNavigationControllerTestHost;
    host.tabIndex = 0;
    transform = { scale: 1, x: 0, y: 0 };
    commitTransform = vi.fn(next => {
      transform = next;
      return true;
    });
    cancelAnimation = vi.fn();
    consumeAutoFit = vi.fn();
    events = {
      dispatchPanStart: vi.fn(() => true),
      dispatchPan: vi.fn(() => true),
      dispatchPanEnd: vi.fn(),
      dispatchZoom: vi.fn(() => true)
    };
    controller = new ViewportGestureNavigationController(host, {
      commitTransform,
      cancelAnimation,
      clampScale: value => Math.min(4, Math.max(0.5, value)),
      clientToViewport: (x, y) => ({ x, y }),
      consumeAutoFit,
      events,
      getTransform: () => transform
    });
    fixture.append(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('does not admit native pointer and wheel input while gesture targeting is disabled', () => {
    const capture = vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    const down = pointerEvent('pointerdown', { pointerId: 1 });
    const wheel = wheelEvent({ deltaY: 10 });

    expect(host.dispatchEvent(down)).toBe(true);
    expect(host.dispatchEvent(wheel)).toBe(true);
    expect(capture).not.toHaveBeenCalled();
    expect(events.dispatchPan).not.toHaveBeenCalled();
    expect(events.dispatchZoom).not.toHaveBeenCalled();
  });

  it('does not retain native-interaction hover observed while panning is disabled', () => {
    const input = document.createElement('input');
    host.append(input);

    input.dispatchEvent(pointerEvent('pointerover', { pointerId: 1 }));
    host.behaviorPan = true;
    host.sync();
    expect(host.matches(':state(pan-eligible)')).toBe(true);

    input.dispatchEvent(pointerEvent('pointerover', { pointerId: 1 }));
    expect(host.matches(':state(pan-eligible)')).toBe(false);

    host.behaviorPan = false;
    host.sync();
    expect(host.matches(':state(pan-eligible)')).toBe(false);

    host.behaviorPan = true;
    host.sync();
    expect(host.matches(':state(pan-eligible)')).toBe(true);
  });

  it('keeps a claimed pointer pending below threshold and clears it without pan terminal effects', () => {
    host.behaviorPan = true;
    host.sync();
    const capture = vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 4, pointerId: 1 }));

    expect(capture).toHaveBeenCalledWith(1);
    expect(consumeAutoFit).toHaveBeenCalledOnce();
    expect(cancelAnimation).not.toHaveBeenCalled();
    expect(events.dispatchPanStart).not.toHaveBeenCalled();
    expect(events.dispatchPan).not.toHaveBeenCalled();
    expect(host.matches(':state(panning)')).toBe(false);

    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 4, pointerId: 1 }));

    expect(events.dispatchPanEnd).not.toHaveBeenCalled();
    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(true);
  });

  it('stops pending activation when panstart synchronously terminates its pointer', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    vi.mocked(events.dispatchPanStart).mockImplementation(() => {
      host.dispatchEvent(pointerEvent('pointercancel', { buttons: 0, pointerId: 1 }));
      return true;
    });

    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));

    expect(events.dispatchPanStart).toHaveBeenCalledOnce();
    expect(events.dispatchPan).not.toHaveBeenCalled();
    expect(events.dispatchPanEnd).not.toHaveBeenCalled();
    expect(commitTransform).not.toHaveBeenCalled();
    expect(host.matches(':state(panning)')).toBe(false);

    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));

    expect(events.dispatchPanStart).toHaveBeenCalledOnce();
    expect(events.dispatchPan).not.toHaveBeenCalled();
    expect(commitTransform).not.toHaveBeenCalled();
    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(true);
  });

  it('activates a pending pointer pan once at threshold, completes it once, and suppresses its click', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    const focus = vi.spyOn(host, 'focus');
    const panStart = vi.mocked(events.dispatchPanStart);
    const pan = vi.mocked(events.dispatchPan);

    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 4, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
    expect(panStart).toHaveBeenCalledOnce();
    expect(pan).toHaveBeenCalledTimes(2);
    expect(commitTransform).toHaveBeenCalledWith({ scale: 1, x: -10, y: 0 });
    expect(commitTransform).toHaveBeenLastCalledWith({ scale: 1, x: -20, y: 0 });
    expect(cancelAnimation).toHaveBeenCalledTimes(2);
    expect(host.matches(':state(panning)')).toBe(true);

    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 20, pointerId: 1 }));
    expect(events.dispatchPanEnd).toHaveBeenCalledWith(expect.objectContaining({ interrupted: false, reason: 'up' }));
    expect(events.dispatchPanEnd).toHaveBeenCalledOnce();
    expect(host.matches(':state(panning)')).toBe(false);
    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(false);
  });

  it('does not commit an active pan after its listener synchronously terminates the pointer', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));
    vi.mocked(events.dispatchPan).mockImplementationOnce(() => {
      host.dispatchEvent(pointerEvent('lostpointercapture', { buttons: 0, pointerId: 1 }));
      return true;
    });

    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));

    expect(events.dispatchPan).toHaveBeenCalledTimes(2);
    expect(events.dispatchPanEnd).toHaveBeenCalledWith(
      expect.objectContaining({ interrupted: true, reason: 'lost-capture' })
    );
    expect(events.dispatchPanEnd).toHaveBeenCalledOnce();
    expect(commitTransform).toHaveBeenCalledOnce();
    expect(commitTransform).toHaveBeenLastCalledWith({ scale: 1, x: -5, y: 0 });
    expect(host.matches(':state(panning)')).toBe(false);
    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(true);

    host.dispatchEvent(pointerEvent('pointermove', { clientX: 15, pointerId: 1 }));

    expect(events.dispatchPan).toHaveBeenCalledTimes(2);
    expect(commitTransform).toHaveBeenCalledOnce();
  });

  it('does not restore click suppression after panend synchronously disconnects the host', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    vi.mocked(events.dispatchPanEnd).mockImplementation(() => host.remove());
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));

    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 5, pointerId: 1 }));

    expect(events.dispatchPanEnd).toHaveBeenCalledOnce();
    expect(host.matches(':state(panning)')).toBe(false);

    fixture.append(host);

    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(true);
  });

  it('does not commit or reactivate an active pan after its listener synchronously starts a pinch', () => {
    host.behaviorPan = true;
    host.behaviorZoom = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    vi.mocked(events.dispatchZoom).mockReturnValue(false);
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1, pointerType: 'touch' }));
    vi.mocked(events.dispatchPan).mockImplementationOnce(() => {
      host.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 2, pointerType: 'touch' }));
      host.dispatchEvent(pointerEvent('pointermove', { clientX: 40, pointerId: 2, pointerType: 'touch' }));
      return true;
    });

    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1, pointerType: 'touch' }));

    expect(events.dispatchPan).toHaveBeenCalledTimes(2);
    expect(events.dispatchPanEnd).toHaveBeenCalledWith(expect.objectContaining({ interrupted: true, reason: 'pinch' }));
    expect(events.dispatchPanEnd).toHaveBeenCalledOnce();
    expect(commitTransform).toHaveBeenCalledOnce();
    expect(commitTransform).toHaveBeenLastCalledWith({ scale: 1, x: -5, y: 0 });
    expect(host.matches(':state(panning)')).toBe(false);
    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(true);
  });

  it('continues an admitted pointer session after pan behavior is disabled while rejecting new pointers', () => {
    host.behaviorPan = true;
    host.sync();
    const capture = vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));
    host.behaviorPan = false;
    host.sync();
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 10, pointerId: 1 }));

    expect(capture).toHaveBeenCalledTimes(1);
    expect(events.dispatchPan).toHaveBeenCalledTimes(2);
    expect(events.dispatchPanEnd).toHaveBeenCalledWith(expect.objectContaining({ interrupted: false, reason: 'up' }));
    expect(host.matches(':state(panning)')).toBe(false);
    expect(host.matches(':state(pan-eligible)')).toBe(false);
  });

  it('samples dragThreshold when a pointer is admitted', () => {
    host.behaviorPan = true;
    host.dragThreshold = 10;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dragThreshold = 1;
    host.sync();
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));

    expect(events.dispatchPanStart).not.toHaveBeenCalled();
    expect(host.matches(':state(panning)')).toBe(false);

    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    expect(events.dispatchPanStart).toHaveBeenCalledOnce();
    expect(host.matches(':state(panning)')).toBe(true);
  });

  it('derives panning from every active pointer session', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 2, pointerType: 'touch' }));

    expect(host.matches(':state(panning)')).toBe(true);

    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 5, pointerId: 1, pointerType: 'touch' }));
    expect(host.matches(':state(panning)')).toBe(true);

    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 5, pointerId: 2, pointerType: 'touch' }));
    expect(host.matches(':state(panning)')).toBe(false);
  });

  it.each([
    { init: { buttons: 0 }, interrupted: false, name: 'pointerup', reason: 'up', type: 'pointerup' },
    { init: { buttons: 0 }, interrupted: true, name: 'pointercancel', reason: 'cancel', type: 'pointercancel' },
    {
      init: { buttons: 0 },
      interrupted: true,
      name: 'lost pointer capture',
      reason: 'lost-capture',
      type: 'lostpointercapture'
    },
    {
      init: { buttons: 0 },
      interrupted: false,
      name: 'buttons released during movement',
      reason: 'buttons-released',
      type: 'pointermove'
    }
  ] as const)('translates $name into a cleaned-up panend contract', ({ init, interrupted, reason, type }) => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));

    host.dispatchEvent(pointerEvent(type, { clientX: 5, pointerId: 1, ...init }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));

    expect(events.dispatchPanEnd).toHaveBeenCalledWith(
      expect.objectContaining({ interrupted, reason, source: 'pointer', transform: expect.any(Object) })
    );
    expect(events.dispatchPan).toHaveBeenCalledOnce();
    expect(host.matches(':state(panning)')).toBe(false);
  });

  it('continues reporting semantic pointer events when panstart cancels its session default', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    vi.mocked(events.dispatchPanStart).mockReturnValue(false);

    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 20, pointerId: 1 }));

    expect(events.dispatchPanStart).toHaveBeenCalledOnce();
    expect(events.dispatchPan).toHaveBeenCalledTimes(2);
    expect(events.dispatchPanEnd).toHaveBeenCalledOnce();
    expect(commitTransform).not.toHaveBeenCalled();
    expect(consumeAutoFit).toHaveBeenCalledOnce();
    expect(cancelAnimation).toHaveBeenCalledTimes(2);
    expect(host.matches(':state(panning)')).toBe(false);
    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(false);
  });

  it('skips only a canceled pan proposal while retaining the active session default', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    vi.mocked(events.dispatchPan).mockReturnValueOnce(false);

    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

    expect(events.dispatchPanStart).toHaveBeenCalledOnce();
    expect(events.dispatchPan).toHaveBeenCalledTimes(2);
    expect(consumeAutoFit).toHaveBeenCalledOnce();
    expect(cancelAnimation).toHaveBeenCalledTimes(2);
    expect(commitTransform).toHaveBeenCalledOnce();
    expect(commitTransform).toHaveBeenCalledWith({ scale: 1, x: -20, y: 0 });
    expect(host.matches(':state(panning)')).toBe(true);
  });

  it.each([
    { button: 0, buttons: 1, matchingType: 'click', name: 'primary', wrongType: 'auxclick' },
    { button: 1, buttons: 4, matchingType: 'auxclick', name: 'middle-button', wrongType: 'click' }
  ] as const)(
    'suppresses only the matching terminal $name click type and pointer ID',
    ({ button, buttons, matchingType, wrongType }) => {
      host.behaviorPan = true;
      host.sync();
      vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
      host.dispatchEvent(pointerEvent('pointerdown', { button, buttons, pointerId: 1 }));
      host.dispatchEvent(pointerEvent('pointermove', { button: -1, buttons, clientX: 5, pointerId: 1 }));
      host.dispatchEvent(pointerEvent('pointerup', { button, buttons: 0, clientX: 5, pointerId: 1 }));

      expect(host.dispatchEvent(pointerEvent(wrongType, { button, buttons: 0, pointerId: 1 }))).toBe(true);
      expect(host.dispatchEvent(pointerEvent(matchingType, { button, buttons: 0, pointerId: 2 }))).toBe(true);
      expect(host.dispatchEvent(pointerEvent(matchingType, { button, buttons: 0, pointerId: 1 }))).toBe(false);
      expect(host.dispatchEvent(pointerEvent(matchingType, { button, buttons: 0, pointerId: 1 }))).toBe(true);
    }
  );

  it('retains click suppression after behavior is disabled and clears it after its timer', () => {
    vi.useFakeTimers();
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 5, pointerId: 1 }));
    host.behaviorPan = false;
    host.sync();

    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(false);

    host.behaviorPan = true;
    host.sync();
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 2 }));
    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 5, pointerId: 2 }));
    vi.advanceTimersByTime(0);

    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 2 }))).toBe(true);
  });

  it('translates focused wheel pan and zoom through the event delegate before applying transform', () => {
    host.behaviorPan = true;
    host.behaviorZoom = true;
    host.sync();
    host.focus();

    expect(host.dispatchEvent(wheelEvent({ deltaX: 20, deltaY: 10 }))).toBe(false);
    expect(events.dispatchPan).toHaveBeenCalledWith(
      expect.objectContaining({ next: { scale: 1, x: 20, y: 10 }, source: 'wheel' })
    );
    expect(commitTransform).toHaveBeenLastCalledWith({ scale: 1, x: 20, y: 10 });

    expect(host.dispatchEvent(wheelEvent({ ctrlKey: true, deltaY: -50 }))).toBe(false);
    const zoom = vi.mocked(events.dispatchZoom).mock.calls[0]?.[0];
    expect(zoom).toEqual(expect.objectContaining({ factor: expect.any(Number), source: 'wheel' }));
    expect(zoom?.factor).toBeGreaterThan(1);
    expect(commitTransform).toHaveBeenLastCalledWith({ scale: zoom?.factor, x: 20, y: 10 });
    expect(cancelAnimation).toHaveBeenCalledTimes(2);
  });

  it('admits Meta-wheel input as zoom', () => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();

    expect(host.dispatchEvent(wheelEvent({ deltaY: -50, metaKey: true }))).toBe(false);

    const zoom = vi.mocked(events.dispatchZoom).mock.calls[0]?.[0];
    expect(zoom).toEqual(expect.objectContaining({ factor: expect.any(Number), source: 'wheel' }));
    expect(zoom?.factor).toBeGreaterThan(1);
    expect(commitTransform).toHaveBeenCalledWith({ scale: zoom?.factor, x: 0, y: 0 });
  });

  it('preserves the focal content point during wheel zoom', () => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();
    transform = { scale: 2, x: 10, y: -4 };
    const viewportPoint = { x: 30, y: 50 };
    const anchor = {
      x: viewportPoint.x / transform.scale + transform.x,
      y: viewportPoint.y / transform.scale + transform.y
    };

    host.dispatchEvent(wheelEvent({ clientX: viewportPoint.x, clientY: viewportPoint.y, ctrlKey: true, deltaY: -50 }));

    expect(events.dispatchZoom).toHaveBeenCalledWith(expect.objectContaining({ anchor, source: 'wheel' }));
    expect((anchor.x - transform.x) * transform.scale).toBeCloseTo(viewportPoint.x);
    expect((anchor.y - transform.y) * transform.scale).toBeCloseTo(viewportPoint.y);
  });

  it.each([
    { deltaY: -1000, expectedScale: 4, name: 'maximum' },
    { deltaY: 1000, expectedScale: 0.5, name: 'minimum' }
  ])('clamps wheel zoom to the $name scale while preserving its focal point', ({ deltaY, expectedScale }) => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();
    transform = { scale: 1, x: 10, y: -5 };
    const viewportPoint = { x: 80, y: 40 };
    const anchor = { x: 90, y: 35 };

    host.dispatchEvent(wheelEvent({ clientX: viewportPoint.x, clientY: viewportPoint.y, ctrlKey: true, deltaY }));

    expect(transform.scale).toBe(expectedScale);
    expect((anchor.x - transform.x) * transform.scale).toBeCloseTo(viewportPoint.x);
    expect((anchor.y - transform.y) * transform.scale).toBeCloseTo(viewportPoint.y);
  });

  it.each([
    { behaviorPan: false, behaviorZoom: true, event: wheelEvent({ deltaY: 10 }), name: 'plain wheel without pan' },
    {
      behaviorPan: true,
      behaviorZoom: false,
      event: wheelEvent({ ctrlKey: true, deltaY: -10 }),
      name: 'modified wheel without zoom'
    }
  ] as const)('leaves $name passive', ({ behaviorPan, behaviorZoom, event }) => {
    host.behaviorPan = behaviorPan;
    host.behaviorZoom = behaviorZoom;
    host.sync();
    host.focus();

    expect(host.dispatchEvent(event)).toBe(true);
    expect(events.dispatchPan).not.toHaveBeenCalled();
    expect(events.dispatchZoom).not.toHaveBeenCalled();
    expect(consumeAutoFit).not.toHaveBeenCalled();
    expect(cancelAnimation).not.toHaveBeenCalled();
  });

  it.each([
    {
      event: wheelEvent({ deltaX: 10, deltaY: 5 }),
      eventDelegate: 'dispatchPan' as const,
      name: 'pan',
      behavior: 'behaviorPan' as const
    },
    {
      event: wheelEvent({ ctrlKey: true, deltaY: -10 }),
      eventDelegate: 'dispatchZoom' as const,
      name: 'zoom',
      behavior: 'behaviorZoom' as const
    }
  ])('does not apply a canceled wheel $name default', ({ behavior, event, eventDelegate }) => {
    host[behavior] = true;
    host.sync();
    host.focus();
    vi.mocked(events[eventDelegate]).mockReturnValue(false);

    expect(host.dispatchEvent(event)).toBe(false);
    expect(commitTransform).not.toHaveBeenCalled();
    expect(consumeAutoFit).toHaveBeenCalledOnce();
    expect(cancelAnimation).toHaveBeenCalledOnce();
  });

  it('does not rebase a live pointer pan for an accepted wheel proposal that does not commit', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    commitTransform.mockImplementationOnce(() => false);

    host.dispatchEvent(wheelEvent({ deltaX: 10, deltaY: 5 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

    expect(events.dispatchPan).toHaveBeenCalledWith(expect.objectContaining({ source: 'wheel' }));
    expect(transform).toEqual({ scale: 1, x: -20, y: 0 });
  });

  it('rebases a live pointer pan after an accepted wheel transform', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));

    host.dispatchEvent(wheelEvent({ deltaX: 20, deltaY: 0 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

    expect(transform).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it.each(['outside the viewport', 'a native descendant', 'a descendant shadow tree'] as const)(
    'rejects wheel admission when focus is inside %s rather than on the host',
    focusLocation => {
      host.behaviorPan = true;
      host.behaviorZoom = true;
      host.sync();
      if (focusLocation === 'outside the viewport') {
        const outside = document.createElement('button');
        fixture.append(outside);
        outside.focus();
      } else if (focusLocation === 'a native descendant') {
        const input = document.createElement('input');
        host.append(input);
        input.focus();
      } else {
        const nestedHost = document.createElement('div');
        const nestedButton = document.createElement('button');
        nestedHost.attachShadow({ mode: 'open' }).append(nestedButton);
        host.append(nestedHost);
        nestedButton.focus();
      }

      expect(host.dispatchEvent(wheelEvent({ deltaY: 10 }))).toBe(true);
      expect(host.dispatchEvent(wheelEvent({ ctrlKey: true, deltaY: -10 }))).toBe(true);
      expect(events.dispatchPan).not.toHaveBeenCalled();
      expect(events.dispatchZoom).not.toHaveBeenCalled();
    }
  );

  it('uses immediate shadow-root focus for wheel and Space-pointer admission', async () => {
    host.remove();
    const shadowHost = document.createElement('div');
    const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
    shadowRoot.append(host);
    fixture.append(shadowHost);
    host.behaviorPan = 'space';
    host.sync();
    host.focus();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    window.dispatchEvent(keyEvent({ code: 'Space', key: ' ' }));
    await Promise.resolve();

    expect(shadowRoot.activeElement).toBe(host);
    expect(host.dispatchEvent(wheelEvent({ deltaY: 10 }))).toBe(false);
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));

    expect(events.dispatchPan).toHaveBeenCalledTimes(2);
    expect(host.matches(':state(pan-eligible)')).toBe(true);
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
  });

  it('requires Space before primary admission and keeps an admitted session after Space releases', async () => {
    host.behaviorPan = 'space';
    host.sync();
    host.focus();
    const capture = vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    expect(capture).not.toHaveBeenCalled();

    const down = keyEvent({ code: 'Space', key: ' ' });
    expect(window.dispatchEvent(down)).toBe(false);
    expect(down.defaultPrevented).toBe(true);
    await Promise.resolve();
    expect(host.matches(':state(pan-eligible)')).toBe(true);

    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    await Promise.resolve();
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 2 }));

    expect(capture).toHaveBeenCalledWith(2);
    expect(events.dispatchPan).toHaveBeenCalledOnce();
    expect(host.matches(':state(pan-eligible)')).toBe(false);
  });

  it('preserves native Space behavior without exact host focus and focuses an allowed unclaimed pointer', async () => {
    host.behaviorPan = 'space';
    host.sync();
    const content = document.createElement('div');
    const outside = document.createElement('button');
    host.append(content);
    fixture.append(outside);
    outside.focus();
    const capture = vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    const space = keyEvent({ code: 'Space', key: ' ' });

    expect(window.dispatchEvent(space)).toBe(true);
    expect(space.defaultPrevented).toBe(false);
    content.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));

    expect(document.activeElement).toBe(host);
    expect(capture).not.toHaveBeenCalled();
    expect(events.dispatchPan).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    await Promise.resolve();
  });

  it('does not admit a Space pointer when focus is inside a descendant shadow tree', async () => {
    host.behaviorPan = 'space';
    host.sync();
    const nestedHost = document.createElement('div');
    const nestedButton = document.createElement('button');
    nestedHost.attachShadow({ mode: 'open' }).append(nestedButton);
    host.append(nestedHost);
    nestedButton.focus();
    const capture = vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    const space = keyEvent({ code: 'Space', key: ' ' });

    expect(window.dispatchEvent(space)).toBe(true);
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));

    expect(space.defaultPrevented).toBe(false);
    expect(capture).not.toHaveBeenCalled();
    expect(events.dispatchPan).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    await Promise.resolve();
  });

  it('preserves native Space and excludes native interactive descendants during Space-pan', async () => {
    host.behaviorPan = 'space';
    host.sync();
    const input = document.createElement('input');
    host.append(input);
    input.focus();
    const capture = vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    const space = keyEvent({ code: 'Space', key: ' ' });

    expect(input.dispatchEvent(space)).toBe(true);
    expect(space.defaultPrevented).toBe(false);
    input.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));

    expect(capture).not.toHaveBeenCalled();
    expect(events.dispatchPan).not.toHaveBeenCalled();
    input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, code: 'Space', composed: true }));
    await Promise.resolve();
  });

  it('excludes native interactive descendants from pointer admission', () => {
    host.behaviorPan = true;
    host.sync();
    const input = document.createElement('input');
    host.append(input);
    const capture = vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    input.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    input.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));

    expect(capture).not.toHaveBeenCalled();
    expect(events.dispatchPan).not.toHaveBeenCalled();
  });

  it.each([
    { behaviorPan: true, name: 'ordinary pan mode', prevents: true },
    { behaviorPan: 'space' as const, name: 'Space mode without eligibility', prevents: false },
    { behaviorPan: false, name: 'disabled navigation', prevents: false }
  ])('applies the context-menu policy for $name', ({ behaviorPan, prevents }) => {
    host.behaviorPan = behaviorPan;
    host.sync();
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, composed: true, ctrlKey: true });

    expect(host.dispatchEvent(event)).toBe(!prevents);
    expect(event.defaultPrevented).toBe(prevents);
  });

  it('prevents Ctrl context menus for eligible Space panning only', async () => {
    host.behaviorPan = 'space';
    host.sync();
    host.focus();
    window.dispatchEvent(keyEvent({ code: 'Space', key: ' ' }));
    await Promise.resolve();
    const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, composed: true, ctrlKey: true });

    expect(host.dispatchEvent(event)).toBe(false);
    expect(event.defaultPrevented).toBe(true);
  });

  it('interrupts pointer pan for pinch and delegates the continuous zoom', () => {
    host.behaviorPan = true;
    host.behaviorZoom = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 2, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 40, pointerId: 2, pointerType: 'touch' }));

    expect(events.dispatchPanEnd).toHaveBeenCalledWith(expect.objectContaining({ interrupted: true, reason: 'pinch' }));
    expect(events.dispatchPanEnd).toHaveBeenCalledOnce();
    expect(events.dispatchZoom).toHaveBeenCalledWith(expect.objectContaining({ source: 'pinch' }));
    expect(host.matches(':state(panning)')).toBe(false);

    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 2, pointerType: 'touch' }));

    expect(events.dispatchPanEnd).toHaveBeenCalledOnce();
  });

  it('pans and zooms simultaneously as a two-pointer pinch center moves', () => {
    host.behaviorZoom = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, clientY: 20, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 40, clientY: 20, pointerId: 2, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 30, clientY: 30, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 70, clientY: 30, pointerId: 2, pointerType: 'touch' }));

    expect(events.dispatchZoom).toHaveBeenLastCalledWith(
      expect.objectContaining({
        anchor: { x: 30, y: 20 },
        clientX: 50,
        clientY: 30,
        factor: 2,
        next: { scale: 2, x: 5, y: 5 },
        source: 'pinch'
      })
    );
    expect(transform).toEqual({ scale: 2, x: 5, y: 5 });
  });

  it('continues an admitted pinch after zoom behavior is disabled and cleans up after the pair ends', () => {
    host.behaviorZoom = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 2, pointerType: 'touch' }));
    host.behaviorZoom = false;
    host.sync();
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 30, pointerId: 2, pointerType: 'touch' }));

    expect(events.dispatchZoom).toHaveBeenCalledTimes(2);
    expect(events.dispatchZoom).toHaveBeenLastCalledWith(expect.objectContaining({ factor: 3, source: 'pinch' }));
    expect(transform.scale).toBe(3);

    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 40, pointerId: 2, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 2, pointerType: 'touch' }));

    expect(events.dispatchZoom).toHaveBeenCalledTimes(2);
    expect(host.matches(':state(panning)')).toBe(false);
  });

  it('reports a canceled pinch zoom request without applying its default transform', () => {
    host.behaviorZoom = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    vi.mocked(events.dispatchZoom).mockReturnValue(false);
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 2, pointerType: 'touch' }));

    expect(events.dispatchZoom).toHaveBeenCalledWith(expect.objectContaining({ factor: 2, source: 'pinch' }));
    expect(commitTransform).not.toHaveBeenCalled();
    expect(transform).toEqual({ scale: 1, x: 0, y: 0 });
    expect(consumeAutoFit).toHaveBeenCalledTimes(2);
    expect(cancelAnimation).toHaveBeenCalledOnce();
  });

  it('rebases a pending pointer session after an explicit independent transform', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    transform = { scale: 1, x: 10, y: 0 };
    controller.rebasePointerSessions();

    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));

    expect(commitTransform).toHaveBeenLastCalledWith({ scale: 1, x: 0, y: 0 });
  });

  it('rebases an active pointer session after an explicit independent transform', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    transform = { scale: 1, x: 10, y: 0 };
    controller.rebasePointerSessions();

    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

    expect(commitTransform).toHaveBeenLastCalledWith({ scale: 1, x: 0, y: 0 });
  });

  it('does not rebase a pointer session from its own pointer-pan commit', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    transform = { scale: 1, x: 100, y: 0 };

    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

    expect(commitTransform).toHaveBeenLastCalledWith({ scale: 1, x: -20, y: 0 });
  });

  it('clears pending and active sessions and panning state on disconnection', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 2 }));
    expect(host.matches(':state(panning)')).toBe(true);

    host.remove();
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    expect(events.dispatchPan).toHaveBeenCalledOnce();
    expect(host.matches(':state(panning)')).toBe(false);

    fixture.append(host);
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 3 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 3 }));

    expect(events.dispatchPan).toHaveBeenCalledTimes(2);
  });
});

function keyEvent(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', { bubbles: true, cancelable: true, composed: true, ...init });
}

function pointerEvent(type: string, init: PointerEventInit): PointerEvent {
  return new PointerEvent(type, { bubbles: true, buttons: 1, cancelable: true, composed: true, ...init });
}

function wheelEvent(init: WheelEventInit): WheelEvent {
  return new WheelEvent('wheel', { bubbles: true, cancelable: true, composed: true, ...init });
}
