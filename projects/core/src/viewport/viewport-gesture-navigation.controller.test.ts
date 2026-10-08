// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attachInternals } from '@nvidia-elements/core/internal';
import { createFixture, removeFixture } from '@internals/testing';
import { ViewportGestureNavigationController } from './viewport-gesture-navigation.controller.js';
import type {
  ViewportPanBehavior,
  ViewportPanProposal,
  ViewportPanSession,
  ViewportTransform,
  ViewportZoomProposal
} from './viewport.types.js';

class ViewportGestureNavigationControllerTestHost extends HTMLElement {
  readonly #controllers = new Set<ReactiveController>();
  declare _internals: ElementInternals;
  readonly updateComplete = Promise.resolve(true);
  behaviorPan: ViewportPanBehavior = false;
  behaviorZoom = false;
  dragThreshold = 5;

  get pannable(): boolean {
    return Boolean(this.behaviorPan);
  }

  get zoomable(): boolean {
    return this.behaviorZoom;
  }

  requestPan(_proposal: ViewportPanProposal): boolean {
    return false;
  }

  requestZoom(_proposal: ViewportZoomProposal): boolean {
    return false;
  }

  startPan(_proposal: ViewportPanProposal): ViewportPanSession | undefined {
    return undefined;
  }

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

class ViewportGestureFormAssociatedField extends HTMLElement {
  static formAssociated = true;
}

const tag = 'viewport-gesture-navigation-controller-test-host';
const formAssociatedFieldTag = 'viewport-gesture-form-associated-field';
if (!customElements.get(tag)) customElements.define(tag, ViewportGestureNavigationControllerTestHost);
if (!customElements.get(formAssociatedFieldTag)) {
  customElements.define(formAssociatedFieldTag, ViewportGestureFormAssociatedField);
}

describe('ViewportGestureNavigationController', () => {
  let controller: ViewportGestureNavigationController;
  let fixture: HTMLElement;
  let host: ViewportGestureNavigationControllerTestHost;
  let sessions: ViewportPanSession[];
  let transform: ViewportTransform;
  let requestAdmittedPinchZoom: ReturnType<typeof vi.fn<(proposal: ViewportZoomProposal) => boolean>>;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as ViewportGestureNavigationControllerTestHost;
    host.tabIndex = 0;
    sessions = [];
    transform = { scale: 1, x: 0, y: 0 };
    vi.spyOn(host, 'requestPan').mockReturnValue(true);
    vi.spyOn(host, 'requestZoom').mockReturnValue(true);
    vi.spyOn(host, 'startPan').mockImplementation(() => {
      const session: ViewportPanSession = {
        start: transform,
        update: vi.fn(() => true),
        end: vi.fn()
      };
      sessions.push(session);
      return session;
    });
    requestAdmittedPinchZoom = vi.fn(() => true);
    controller = new ViewportGestureNavigationController(host, {
      clampScale: value => Math.min(4, Math.max(0.5, value)),
      clientToViewport: (x, y) => ({ x, y }),
      getTransform: () => transform,
      requestAdmittedPinchZoom
    });
    fixture.append(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('does not claim pointer or wheel input while both capabilities are disabled', () => {
    const capture = vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    expect(host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }))).toBe(true);
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    expect(host.dispatchEvent(wheelEvent({ deltaY: 10 }))).toBe(true);

    expect(capture).not.toHaveBeenCalled();
    expect(host.startPan).not.toHaveBeenCalled();
    expect(host.requestPan).not.toHaveBeenCalled();
    expect(host.requestZoom).not.toHaveBeenCalled();
  });

  it('prepares touch-action from effective capabilities and retains it for a claimed pointer', async () => {
    host.style.setProperty('touch-action', 'pan-y', 'important');
    host.behaviorPan = 'space';
    host.sync();
    expect(host.style.touchAction).toBe('none');

    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1, pointerType: 'touch' }));
    host.behaviorPan = false;
    host.sync();
    expect(host.style.touchAction).toBe('none');

    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1, pointerType: 'touch' }));
    await Promise.resolve();
    expect(host.style.touchAction).toBe('pan-y');
    expect(host.style.getPropertyPriority('touch-action')).toBe('important');
  });

  it('starts one pan at the sampled threshold, then updates and ends its session', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    const target = host;
    target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    target.dispatchEvent(pointerEvent('pointermove', { clientX: 4, pointerId: 1 }));
    expect(host.startPan).not.toHaveBeenCalled();

    host.dragThreshold = 20;
    host.sync();
    target.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));
    target.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 10, pointerId: 1 }));

    expect(host.startPan).toHaveBeenCalledOnce();
    expect(host.startPan).toHaveBeenCalledWith(
      expect.objectContaining({
        next: { scale: 1, x: -5, y: 0 },
        source: 'pointer'
      })
    );
    expect(sessions).toHaveLength(1);
    expect(sessions[0]?.update).toHaveBeenCalledWith(expect.objectContaining({ next: { scale: 1, x: -10, y: 0 } }));
    expect(vi.mocked(sessions[0]?.update).mock.calls[0]?.[0]).not.toHaveProperty('source');
    expect(sessions[0]?.end).toHaveBeenCalledWith(expect.objectContaining({ interrupted: false, reason: 'up' }));
    expect(host.matches(':state(panning)')).toBe(false);
    expect(target.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(false);
  });

  it('leaves a pointer release below the drag threshold as an ordinary click', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 4, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 4, pointerId: 1 }));

    expect(host.startPan).not.toHaveBeenCalled();
    expect(host.matches(':state(panning)')).toBe(false);
    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(true);
  });

  it.each([
    { type: 'pointerup', buttons: 0, interrupted: false, reason: 'up' },
    { type: 'pointermove', buttons: 0, interrupted: false, reason: 'buttons-released' },
    { type: 'pointercancel', buttons: 1, interrupted: true, reason: 'cancel' },
    { type: 'lostpointercapture', buttons: 1, interrupted: true, reason: 'lost-capture' }
  ] as const)('ends an admitted pointer session after $type', ({ type, buttons, interrupted, reason }) => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));

    host.dispatchEvent(pointerEvent(type, { buttons, clientX: 5, pointerId: 1 }));
    expect(sessions[0]?.end).toHaveBeenCalledOnce();
    expect(sessions[0]?.end).toHaveBeenCalledWith(expect.objectContaining({ interrupted, reason }));

    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    expect(sessions[0]?.update).not.toHaveBeenCalled();
    expect(sessions[0]?.end).toHaveBeenCalledOnce();
    expect(host.matches(':state(panning)')).toBe(false);
  });

  it.each([
    { button: 0, buttons: 1, matching: 'click', other: 'auxclick' },
    { button: 1, buttons: 4, matching: 'auxclick', other: 'click' }
  ] as const)(
    'suppresses only the matching $matching after a completed drag',
    ({ button, buttons, matching, other }) => {
      host.behaviorPan = true;
      host.sync();
      vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
      host.dispatchEvent(pointerEvent('pointerdown', { button, buttons, pointerId: 1 }));
      host.dispatchEvent(pointerEvent('pointermove', { button: -1, buttons, clientX: 5, pointerId: 1 }));
      host.dispatchEvent(pointerEvent('pointerup', { button, buttons: 0, clientX: 5, pointerId: 1 }));

      expect(host.dispatchEvent(pointerEvent(other, { button, buttons: 0, pointerId: 1 }))).toBe(true);
      expect(host.dispatchEvent(pointerEvent(matching, { button, buttons: 0, pointerId: 2 }))).toBe(true);
      expect(host.dispatchEvent(pointerEvent(matching, { button, buttons: 0, pointerId: 1 }))).toBe(false);
      expect(host.dispatchEvent(pointerEvent(matching, { button, buttons: 0, pointerId: 1 }))).toBe(true);
    }
  );

  it('keeps a queued click suppression after pan policy is disabled until consumed or expired', () => {
    vi.useFakeTimers();
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    const drag = (pointerId: number): void => {
      host.dispatchEvent(pointerEvent('pointerdown', { pointerId }));
      host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId }));
      host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 5, pointerId }));
    };

    drag(1);
    host.behaviorPan = false;
    host.sync();
    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(false);

    host.behaviorPan = true;
    host.sync();
    drag(2);
    host.behaviorPan = false;
    host.sync();
    vi.runAllTimers();
    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 2 }))).toBe(true);
  });

  it('clears stale native-interaction hover when panning is disabled', () => {
    const input = document.createElement('input');
    host.append(input);
    host.behaviorPan = true;
    host.sync();
    expect(host.matches(':state(pan-eligible)')).toBe(true);

    input.dispatchEvent(pointerEvent('pointerover', { pointerId: 1 }));
    expect(host.matches(':state(pan-eligible)')).toBe(false);
    host.behaviorPan = false;
    host.sync();
    host.behaviorPan = true;
    host.sync();
    expect(host.matches(':state(pan-eligible)')).toBe(true);
  });

  it('retains aggregate panning state until both touch pans end', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    for (const pointerId of [1, 2]) {
      host.dispatchEvent(pointerEvent('pointerdown', { pointerId, pointerType: 'touch' }));
      host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId, pointerType: 'touch' }));
    }
    expect(sessions).toHaveLength(2);
    expect(host.matches(':state(panning)')).toBe(true);

    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1, pointerType: 'touch' }));
    expect(host.matches(':state(panning)')).toBe(true);
    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 2, pointerType: 'touch' }));
    expect(host.matches(':state(panning)')).toBe(false);
  });

  it('does not reactivate a pointer canceled synchronously during pan activation', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    const navigation: ViewportPanSession = {
      start: transform,
      update: vi.fn(() => true),
      end: vi.fn()
    };
    vi.mocked(host.startPan).mockImplementationOnce(() => {
      host.dispatchEvent(pointerEvent('pointercancel', { pointerId: 1 }));
      return navigation;
    });

    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));

    expect(host.startPan).toHaveBeenCalledOnce();
    expect(navigation.end).toHaveBeenCalledWith(expect.objectContaining({ interrupted: true, reason: 'cancel' }));
    expect(navigation.update).not.toHaveBeenCalled();
    expect(host.matches(':state(panning)')).toBe(false);
  });

  it('keeps an admitted pan session active after panning is disabled and rejects a new pointer', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));
    host.behaviorPan = false;
    host.sync();

    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 10, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 2 }));

    expect(sessions[0]?.update).toHaveBeenCalledOnce();
    expect(sessions[0]?.end).toHaveBeenCalledWith(expect.objectContaining({ interrupted: false, reason: 'up' }));
    expect(host.startPan).toHaveBeenCalledOnce();
  });

  it('keeps overlay and native interactive descendants out of pointer admission', () => {
    host.behaviorPan = true;
    host.sync();
    const overlay = document.createElement('div');
    overlay.slot = 'overlay';
    const input = document.createElement('input');
    host.append(overlay, input);
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    for (const target of [overlay, input]) {
      target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    }

    expect(host.startPan).not.toHaveBeenCalled();
  });

  it('keeps a form-associated custom element out of pointer admission', () => {
    host.behaviorPan = true;
    host.sync();
    const field = document.createElement(formAssociatedFieldTag);
    host.append(field);
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    field.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    field.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));

    expect(host.startPan).not.toHaveBeenCalled();
  });

  it('does not admit a right mouse button as a pan', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    host.dispatchEvent(pointerEvent('pointerdown', { button: 2, buttons: 2, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { button: -1, buttons: 2, clientX: 10, pointerId: 1 }));

    expect(host.startPan).not.toHaveBeenCalled();
    expect(host.matches(':state(panning)')).toBe(false);
  });

  it('leaves a focused modifier wheel unclaimed when zoom is disabled', () => {
    host.behaviorPan = true;
    host.sync();
    host.focus();

    expect(host.dispatchEvent(wheelEvent({ ctrlKey: true, deltaY: -20 }))).toBe(true);
    expect(host.dispatchEvent(wheelEvent({ metaKey: true, deltaY: -20 }))).toBe(true);
    expect(host.requestZoom).not.toHaveBeenCalled();
    expect(host.requestPan).not.toHaveBeenCalled();
  });

  it('leaves a focused wheel unclaimed when pan is disabled', () => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();

    expect(host.dispatchEvent(wheelEvent({ deltaY: 10 }))).toBe(true);
    expect(host.requestPan).not.toHaveBeenCalled();
    expect(host.requestZoom).not.toHaveBeenCalled();
  });

  it('sends focused wheel pan and zoom through the public request methods', () => {
    host.behaviorPan = true;
    host.behaviorZoom = true;
    host.sync();
    host.focus();
    transform = { scale: 2, x: 100, y: 200 };
    const pan = wheelEvent({ clientX: 30, clientY: 40, deltaX: 20, deltaY: 10 });

    expect(host.dispatchEvent(pan)).toBe(false);
    expect(host.requestPan).toHaveBeenCalledWith({
      clientX: 30,
      clientY: 40,
      deltaX: 20,
      deltaY: 10,
      event: pan,
      next: { scale: 2, x: 110, y: 205 },
      source: 'wheel'
    });

    const zoom = wheelEvent({ clientX: 30, clientY: 40, ctrlKey: true, deltaY: -50 });
    expect(host.dispatchEvent(zoom)).toBe(false);
    const proposal = vi.mocked(host.requestZoom).mock.calls[0]?.[0];
    expect(proposal).toMatchObject({ clientX: 30, clientY: 40, event: zoom, source: 'wheel' });
    expect(proposal?.factor).toBeGreaterThan(1);
    expect(proposal?.anchor).toEqual({ x: 115, y: 220 });
  });

  it.each([
    { name: 'Ctrl', modifier: { ctrlKey: true } },
    { name: 'Meta', modifier: { metaKey: true } }
  ])('admits focused $name-wheel zoom', ({ modifier }) => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();
    const event = wheelEvent({ ...modifier, deltaY: -20 });

    expect(host.dispatchEvent(event)).toBe(false);
    expect(host.requestZoom).toHaveBeenCalledOnce();
    expect(host.requestZoom).toHaveBeenCalledWith(
      expect.objectContaining({ event, factor: expect.any(Number), source: 'wheel' })
    );
    expect(vi.mocked(host.requestZoom).mock.calls[0]?.[0].factor).toBeGreaterThan(1);
  });

  it('leaves wheel input unclaimed without exact viewport focus', () => {
    host.behaviorPan = true;
    host.behaviorZoom = true;
    host.sync();
    const input = document.createElement('input');
    host.append(input);
    input.focus();

    expect(host.dispatchEvent(wheelEvent({ deltaY: 10 }))).toBe(true);
    expect(host.dispatchEvent(wheelEvent({ ctrlKey: true, deltaY: -10 }))).toBe(true);
    expect(host.requestPan).not.toHaveBeenCalled();
    expect(host.requestZoom).not.toHaveBeenCalled();
  });

  it('requires Space for primary pointer panning in Space mode but admits middle-button panning', async () => {
    host.behaviorPan = 'space';
    host.sync();
    host.focus();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    expect(host.startPan).not.toHaveBeenCalled();

    host.dispatchEvent(pointerEvent('pointerdown', { button: 1, buttons: 4, pointerId: 2 }));
    host.dispatchEvent(pointerEvent('pointermove', { button: -1, buttons: 4, clientX: 5, pointerId: 2 }));
    expect(host.startPan).toHaveBeenCalledOnce();
    host.dispatchEvent(pointerEvent('pointerup', { button: 1, buttons: 0, pointerId: 2 }));

    const space = keyEvent({ code: 'Space', key: ' ' });
    expect(window.dispatchEvent(space)).toBe(false);
    await Promise.resolve();
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 3 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 3 }));
    expect(host.startPan).toHaveBeenCalledTimes(2);
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
  });

  it('admits focused wheel and Space-pan input inside an enclosing shadow root', async () => {
    const wrapper = document.createElement('div');
    fixture.append(wrapper);
    wrapper.attachShadow({ mode: 'open' }).append(host);
    host.behaviorPan = 'space';
    host.sync();
    host.focus();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    expect(host.dispatchEvent(wheelEvent({ deltaY: 10 }))).toBe(false);
    expect(host.requestPan).toHaveBeenCalledWith(expect.objectContaining({ source: 'wheel' }));

    window.dispatchEvent(keyEvent({ code: 'Space', key: ' ' }));
    await Promise.resolve();
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));
    expect(host.startPan).toHaveBeenCalledWith(expect.objectContaining({ source: 'pointer' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
  });

  it('leaves Space and primary pointer input on a focused descendant alone in Space mode', () => {
    host.behaviorPan = 'space';
    host.sync();
    const input = document.createElement('input');
    host.append(input);
    input.focus();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    expect(input.dispatchEvent(keyEvent({ code: 'Space', key: ' ' }))).toBe(true);
    input.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    input.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    expect(host.startPan).not.toHaveBeenCalled();
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
  });

  it('limits Ctrl-context-menu suppression to eligible pan modes', async () => {
    const contextMenu = (): boolean =>
      host.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, ctrlKey: true }));
    host.behaviorPan = true;
    host.sync();
    expect(contextMenu()).toBe(false);

    host.behaviorPan = false;
    host.sync();
    expect(contextMenu()).toBe(true);

    host.behaviorPan = 'space';
    host.sync();
    expect(contextMenu()).toBe(true);
    host.focus();
    expect(contextMenu()).toBe(true);
    window.dispatchEvent(keyEvent({ code: 'Space', key: ' ' }));
    await Promise.resolve();
    expect(contextMenu()).toBe(false);
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
  });

  it('uses a private admitted-pinch proposal after zoom is disabled mid-gesture', () => {
    host.behaviorZoom = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 2, pointerType: 'touch' }));
    host.behaviorZoom = false;
    host.sync();
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 30, pointerId: 2, pointerType: 'touch' }));

    expect(requestAdmittedPinchZoom).toHaveBeenCalledTimes(2);
    expect(requestAdmittedPinchZoom).toHaveBeenLastCalledWith(expect.objectContaining({ factor: 3, source: 'pinch' }));
    expect(host.requestZoom).not.toHaveBeenCalled();

    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 2, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 3, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 4, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 4, pointerType: 'touch' }));
    expect(requestAdmittedPinchZoom).toHaveBeenCalledTimes(2);
  });

  it('ends a pointer pan when an admitted pinch takes over', () => {
    host.behaviorPan = true;
    host.behaviorZoom = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 2, pointerType: 'touch' }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 40, pointerId: 2, pointerType: 'touch' }));

    expect(sessions[0]?.end).toHaveBeenCalledWith(expect.objectContaining({ interrupted: true, reason: 'pinch' }));
    expect(requestAdmittedPinchZoom).toHaveBeenCalledOnce();
    expect(host.matches(':state(panning)')).toBe(false);
  });

  it('rebases pointer proposal math after an independent transform change', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    transform = { scale: 1, x: 100, y: 0 };
    controller.rebasePointerSessions();

    host.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

    expect(sessions[0]?.update).toHaveBeenCalledWith(expect.objectContaining({ next: { scale: 1, x: 90, y: 0 } }));
  });

  it('clears an active pointer session and panning state on disconnection', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));
    expect(host.matches(':state(panning)')).toBe(true);

    host.remove();
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    expect(sessions[0]?.update).not.toHaveBeenCalled();
    expect(host.matches(':state(panning)')).toBe(false);
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
