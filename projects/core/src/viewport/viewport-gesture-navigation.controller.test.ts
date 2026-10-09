// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attachInternals } from '@nvidia-elements/core/internal';
import { createFixture, removeFixture } from '@internals/testing';
import { ViewportGestureNavigationController } from './viewport-gesture-navigation.controller.js';
import type { ViewportPanBehavior, ViewportTransform } from './viewport.types.js';

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
  let fixture: HTMLElement;
  let host: ViewportGestureNavigationControllerTestHost;
  const applyPan = vi.fn();
  const applyZoom = vi.fn();
  let transform: ViewportTransform;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as ViewportGestureNavigationControllerTestHost;
    host.tabIndex = 0;
    applyPan.mockReset();
    applyZoom.mockReset();
    transform = { scale: 1, x: 0, y: 0 };
    new ViewportGestureNavigationController(host, {
      clampScale: value => Math.min(4, Math.max(0.5, value)),
      clientToViewport: (x, y) => ({ x, y }),
      getTransform: () => transform,
      applyPan,
      applyZoom
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
    expect(applyPan).not.toHaveBeenCalled();
    expect(applyZoom).not.toHaveBeenCalled();
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

  it('leaves a pointer release below the drag threshold as an ordinary click', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 4, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 4, pointerId: 1 }));

    expect(applyPan).not.toHaveBeenCalled();
    expect(host.matches(':state(panning)')).toBe(false);
    expect(host.dispatchEvent(pointerEvent('click', { buttons: 0, pointerId: 1 }))).toBe(true);
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

  it('does not start pointer navigation from overlays or native interactive descendants', () => {
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

    expect(applyPan).not.toHaveBeenCalled();
  });

  it('keeps a form-associated custom element out of pointer admission', () => {
    host.behaviorPan = true;
    host.sync();
    const field = document.createElement(formAssociatedFieldTag);
    host.append(field);
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    field.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    field.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));

    expect(applyPan).not.toHaveBeenCalled();
  });

  it('does not admit a right mouse button as a pan', () => {
    host.behaviorPan = true;
    host.sync();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});

    host.dispatchEvent(pointerEvent('pointerdown', { button: 2, buttons: 2, pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { button: -1, buttons: 2, clientX: 10, pointerId: 1 }));

    expect(applyPan).not.toHaveBeenCalled();
    expect(host.matches(':state(panning)')).toBe(false);
  });

  it.each([
    { name: 'Ctrl', modifier: { ctrlKey: true } },
    { name: 'Meta', modifier: { metaKey: true } }
  ])('zooms on $name-wheel input when the viewport is focused', ({ modifier }) => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();
    const event = wheelEvent({ ...modifier, deltaY: -20 });

    expect(host.dispatchEvent(event)).toBe(false);
    expect(applyZoom).toHaveBeenCalledOnce();
    expect(applyZoom).toHaveBeenCalledWith(expect.objectContaining({ x: 0, y: 0 }));
    expect(applyZoom.mock.calls[0]?.[0].scale).toBeGreaterThan(1);
  });

  it('leaves a focused modifier wheel unclaimed when zoom is disabled', () => {
    host.behaviorPan = true;
    host.sync();
    host.focus();

    expect(host.dispatchEvent(wheelEvent({ ctrlKey: true, deltaY: -20 }))).toBe(true);
    expect(host.dispatchEvent(wheelEvent({ metaKey: true, deltaY: -20 }))).toBe(true);
    expect(applyZoom).not.toHaveBeenCalled();
    expect(applyPan).not.toHaveBeenCalled();
  });

  it('leaves a focused wheel unclaimed when pan is disabled', () => {
    host.behaviorZoom = true;
    host.sync();
    host.focus();

    expect(host.dispatchEvent(wheelEvent({ deltaY: 10 }))).toBe(true);
    expect(applyPan).not.toHaveBeenCalled();
    expect(applyZoom).not.toHaveBeenCalled();
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
    expect(applyPan).not.toHaveBeenCalled();
    expect(applyZoom).not.toHaveBeenCalled();
  });

  it('requires Space for primary pointer panning in Space mode and allows middle-button panning', async () => {
    host.behaviorPan = 'space';
    host.sync();
    host.focus();
    vi.spyOn(host, 'setPointerCapture').mockImplementation(() => {});
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
    expect(applyPan).not.toHaveBeenCalled();

    host.dispatchEvent(pointerEvent('pointerdown', { button: 1, buttons: 4, pointerId: 2 }));
    host.dispatchEvent(pointerEvent('pointermove', { button: -1, buttons: 4, clientX: 5, pointerId: 2 }));
    expect(applyPan).toHaveBeenCalledOnce();
    host.dispatchEvent(pointerEvent('pointerup', { button: 1, buttons: 0, pointerId: 2 }));

    const space = keyEvent({ code: 'Space', key: ' ' });
    expect(window.dispatchEvent(space)).toBe(false);
    await Promise.resolve();
    host.dispatchEvent(pointerEvent('pointerdown', { pointerId: 3 }));
    host.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 3 }));
    expect(applyPan).toHaveBeenCalledTimes(2);
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
    expect(applyPan).not.toHaveBeenCalled();
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
