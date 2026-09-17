// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import {
  GestureController,
  type Gesture,
  type GestureControllerOptions,
  type GestureInput,
  type PinchStartDecision,
  type PinchStart
} from '@nvidia-elements/core/internal';

class GestureControllerTestHost extends HTMLElement {
  readonly #controllers = new Set<ReactiveController>();
  readonly updateComplete = Promise.resolve(true);

  addController(controller: ReactiveController): void {
    this.#controllers.add(controller);
  }

  removeController(controller: ReactiveController): void {
    this.#controllers.delete(controller);
  }

  requestUpdate(): void {}

  updateControllers(): void {
    this.#controllers.forEach(controller => controller.hostUpdated?.());
  }

  connectedCallback(): void {
    this.#controllers.forEach(controller => controller.hostConnected?.());
  }

  disconnectedCallback(): void {
    this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }
}

const tag = 'gesture-controller-test-host';
if (!customElements.get(tag)) customElements.define(tag, GestureControllerTestHost);

describe('GestureController', () => {
  let automaticallyClaim: boolean;
  let beginPinch: ReturnType<typeof vi.fn<(start: PinchStart) => PinchStartDecision<string> | undefined>>;
  let controller: GestureController<string>;
  let fixture: HTMLElement;
  let gestureInputEvents: CustomEvent<GestureInput>[];
  let gestureEvents: CustomEvent<Gesture<string>>[];
  let host: GestureControllerTestHost;
  let ignored: boolean;
  let shouldPreventContextMenu: ReturnType<typeof vi.fn<(event: MouseEvent) => boolean>>;
  let target: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as GestureControllerTestHost;
    target = document.createElement('div');
    host.append(target);
    automaticallyClaim = true;
    beginPinch = vi.fn(start => ({ context: `${start.startCenterClientX},${start.startCenterClientY}` }));
    gestureInputEvents = [];
    gestureEvents = [];
    ignored = false;
    shouldPreventContextMenu = vi.fn(() => true);
    const options: GestureControllerOptions<string> = {
      beginPinch,
      shouldIgnoreEvent: () => ignored,
      shouldPreventContextMenu
    };
    controller = new GestureController(host, options);
    controller.target = target;
    host.addEventListener('nve-gesture', event => gestureEvents.push(event as CustomEvent<Gesture<string>>));
    host.addEventListener('nve-gesture-input', event => {
      const gestureInputEvent = event as CustomEvent<GestureInput>;
      const input = gestureInputEvent.detail;
      gestureInputEvents.push(gestureInputEvent);
      if (!automaticallyClaim) return;
      if (input.kind === 'pointerdown') {
        input.claim({
          kind: input.event.button === 2 ? 'pan' : 'drag',
          pinchCandidate: input.event.pointerType === 'touch'
        });
      } else if (input.kind === 'wheel') {
        input.claim();
      }
    });
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    vi.spyOn(target, 'setPointerCapture').mockImplementation(() => {});
    fixture.append(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  describe('pointer claims and movement', () => {
    it('allows a pointerdown claim exactly once during synchronous input dispatch', () => {
      automaticallyClaim = false;
      let firstClaim = false;
      let secondClaim = true;
      let claimAfterDispatch: (() => boolean) | undefined;
      host.addEventListener(
        'nve-gesture-input',
        event => {
          const input = (event as CustomEvent<GestureInput>).detail;
          if (input.kind !== 'pointerdown') return;
          claimAfterDispatch = input.claim;
          firstClaim = input.claim({ kind: 'drag' });
          secondClaim = input.claim({ kind: 'pan' });
        },
        { once: true }
      );

      target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));

      expect(firstClaim).toBe(true);
      expect(secondClaim).toBe(false);
      expect(claimAfterDispatch?.()).toBe(false);
    });

    it('suppresses text selection immediately on claim and restores the prior inline declaration', () => {
      target.style.setProperty('user-select', 'text', 'important');
      const down = pointerEvent('pointerdown', { pointerId: 1 });

      expect(target.dispatchEvent(down)).toBe(true);
      expect(down.defaultPrevented).toBe(false);
      expect(target.style.getPropertyValue('user-select')).toBe('none');
      expect(target.style.getPropertyPriority('user-select')).toBe('');

      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1 }));

      expect(target.style.getPropertyValue('user-select')).toBe('text');
      expect(target.style.getPropertyPriority('user-select')).toBe('important');
    });

    it('prevents selectstart only while a claimed pointer is active', () => {
      const before = new Event('selectstart', { bubbles: true, cancelable: true });
      expect(target.dispatchEvent(before)).toBe(true);

      target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      const active = new Event('selectstart', { bubbles: true, cancelable: true });
      expect(target.dispatchEvent(active)).toBe(false);
      expect(active.defaultPrevented).toBe(true);

      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1 }));
      const after = new Event('selectstart', { bubbles: true, cancelable: true });
      expect(target.dispatchEvent(after)).toBe(true);
    });

    it('retains text-selection suppression until the final claimed pointer ends', () => {
      target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));

      expect(target.style.userSelect).toBe('none');
      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1 }));
      expect(target.style.userSelect).toBe('none');

      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 2 }));
      expect(target.style.userSelect).toBe('');
    });

    it('preserves an external user-select change made during a claim', () => {
      target.style.userSelect = 'text';
      target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      target.style.setProperty('user-select', 'none', 'important');

      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1 }));

      expect(target.style.userSelect).toBe('none');
      expect(target.style.getPropertyPriority('user-select')).toBe('important');
    });

    it('uses event admission only before a pointer session and for stateless events', () => {
      const shouldIgnoreEvent = vi.fn(() => ignored);
      const admissionHost = document.createElement(tag) as GestureControllerTestHost;
      const admissionTarget = document.createElement('div');
      admissionHost.append(admissionTarget);
      const admissionController = new GestureController(admissionHost, {
        shouldIgnoreEvent
      });
      admissionController.target = admissionTarget;
      admissionHost.addEventListener('nve-gesture-input', event => {
        const input = (event as CustomEvent<GestureInput>).detail;
        if (input.kind === 'pointerdown') input.claim({ kind: 'drag' });
        if (input.kind === 'wheel') input.claim();
      });
      vi.spyOn(admissionTarget, 'setPointerCapture').mockImplementation(() => {});
      fixture.append(admissionHost);

      const down = pointerEvent('pointerdown', { pointerId: 1 });
      admissionTarget.dispatchEvent(down);
      ignored = true;
      admissionTarget.dispatchEvent(pointerEvent('pointermove', { clientX: 2, pointerId: 1 }));
      admissionTarget.dispatchEvent(pointerEvent('pointercancel', { pointerId: 1 }));
      const wheel = wheelEvent({});
      admissionTarget.dispatchEvent(wheel);

      expect(shouldIgnoreEvent).toHaveBeenCalledTimes(2);
      expect(shouldIgnoreEvent).toHaveBeenNthCalledWith(1, down);
      expect(shouldIgnoreEvent).toHaveBeenNthCalledWith(2, wheel);
    });

    it('reports incremental movement and start-derived client displacement', () => {
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));
      const firstMove = pointerEvent('pointermove', {
        clientX: 16,
        clientY: 24,
        movementX: 100,
        movementY: 100,
        pointerId: 1
      });
      const secondMove = pointerEvent('pointermove', {
        clientX: 14,
        clientY: 30,
        movementX: 100,
        movementY: 100,
        pointerId: 1
      });

      target.dispatchEvent(firstMove);
      target.dispatchEvent(secondMove);

      expect(gestureEvents.map(event => event.detail)).toEqual([
        {
          clientX: 16,
          clientY: 24,
          event: firstMove,
          kind: 'drag',
          movementX: 6,
          movementY: 4,
          startClientX: 10,
          startClientY: 20,
          totalDisplacementX: 6,
          totalDisplacementY: 4
        },
        {
          clientX: 14,
          clientY: 30,
          event: secondMove,
          kind: 'drag',
          movementX: -2,
          movementY: 6,
          startClientX: 10,
          startClientY: 20,
          totalDisplacementX: 4,
          totalDisplacementY: 10
        }
      ]);
    });

    it('reports the same client frame for a claimed secondary-button pan', () => {
      const downstream = vi.fn();
      host.addEventListener('pointerdown', downstream);
      const down = pointerEvent('pointerdown', { button: 2, buttons: 2, clientX: 10, clientY: 20, pointerId: 1 });
      const move = pointerEvent('pointermove', { button: -1, buttons: 2, clientX: 16, clientY: 24, pointerId: 1 });
      const up = pointerEvent('pointerup', { button: 2, buttons: 0, clientX: 18, clientY: 27, pointerId: 1 });

      expect(target.dispatchEvent(down)).toBe(true);
      expect(target.dispatchEvent(move)).toBe(false);
      expect(target.dispatchEvent(up)).toBe(true);

      expect(downstream).not.toHaveBeenCalled();
      expect(gestureEvents[0]?.detail).toEqual({
        clientX: 16,
        clientY: 24,
        event: move,
        kind: 'pan',
        movementX: 6,
        movementY: 4,
        startClientX: 10,
        startClientY: 20,
        totalDisplacementX: 6,
        totalDisplacementY: 4
      });
      expect(gestureInputEvents.map(event => event.detail.kind)).toEqual(['pointerdown', 'pointerend']);
      expect(gestureInputEvents.at(-1)?.detail).toMatchObject({ reason: 'up', totalDisplacementX: 8 });
    });

    it('supports a claimed drag without pinch configuration', () => {
      const dragHost = document.createElement(tag) as GestureControllerTestHost;
      const dragTarget = document.createElement('div');
      const dragEvents: CustomEvent<Gesture<undefined>>[] = [];
      dragHost.append(dragTarget);
      const dragController = new GestureController(dragHost, {});
      dragController.target = dragTarget;
      dragHost.addEventListener('nve-gesture', event => dragEvents.push(event as CustomEvent<Gesture<undefined>>));
      dragHost.addEventListener('nve-gesture-input', event => {
        const input = (event as CustomEvent<GestureInput>).detail;
        if (input.kind === 'pointerdown') input.claim({ kind: 'drag' });
      });
      vi.spyOn(dragTarget, 'setPointerCapture').mockImplementation(() => {});
      fixture.append(dragHost);

      dragTarget.dispatchEvent(pointerEvent('pointerdown', { clientX: 2, clientY: 3, pointerId: 1 }));
      dragTarget.dispatchEvent(pointerEvent('pointermove', { clientX: 7, clientY: 9, pointerId: 1 }));

      expect(dragEvents[0]?.detail).toMatchObject({ kind: 'drag', movementX: 5, movementY: 6 });
    });
  });

  describe('pinch geometry and admission', () => {
    it('reports pinch start and current centers against a stable scale baseline', () => {
      target.dispatchEvent(
        pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1, pointerType: 'touch' })
      );
      target.dispatchEvent(
        pointerEvent('pointerdown', { clientX: 30, clientY: 40, pointerId: 2, pointerType: 'touch' })
      );
      const firstMove = pointerEvent('pointermove', { clientX: 50, clientY: 60, pointerId: 2, pointerType: 'touch' });
      const secondMove = pointerEvent('pointermove', { clientX: 70, clientY: 80, pointerId: 2, pointerType: 'touch' });

      target.dispatchEvent(firstMove);
      target.dispatchEvent(secondMove);

      expect(beginPinch).toHaveBeenCalledOnce();
      expect(beginPinch).toHaveBeenCalledWith({
        firstPointerId: 1,
        firstPointerType: 'touch',
        firstStartClientX: 10,
        firstStartClientY: 20,
        secondPointerId: 2,
        secondPointerType: 'touch',
        secondStartClientX: 30,
        secondStartClientY: 40,
        startCenterClientX: 20,
        startCenterClientY: 30
      });
      expect(gestureEvents.map(event => event.detail)).toEqual([
        {
          centerClientX: 30,
          centerClientY: 40,
          context: '20,30',
          event: firstMove,
          firstPointerId: 1,
          firstPointerType: 'touch',
          firstStartClientX: 10,
          firstStartClientY: 20,
          kind: 'pinch',
          scale: 2,
          secondPointerId: 2,
          secondPointerType: 'touch',
          secondStartClientX: 30,
          secondStartClientY: 40,
          startCenterClientX: 20,
          startCenterClientY: 30
        },
        {
          centerClientX: 40,
          centerClientY: 50,
          context: '20,30',
          event: secondMove,
          firstPointerId: 1,
          firstPointerType: 'touch',
          firstStartClientX: 10,
          firstStartClientY: 20,
          kind: 'pinch',
          scale: 3,
          secondPointerId: 2,
          secondPointerType: 'touch',
          secondStartClientX: 30,
          secondStartClientY: 40,
          startCenterClientX: 20,
          startCenterClientY: 30
        }
      ]);
    });

    it('establishes pinch context and baseline after zero-distance input separates', () => {
      target.dispatchEvent(
        pointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch' })
      );
      target.dispatchEvent(
        pointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 2, pointerType: 'touch' })
      );
      const move = pointerEvent('pointermove', { clientX: 20, clientY: 10, pointerId: 2, pointerType: 'touch' });

      target.dispatchEvent(move);

      expect(beginPinch).toHaveBeenCalledWith(
        expect.objectContaining({ startCenterClientX: 15, startCenterClientY: 10 })
      );
      expect(gestureEvents[0]?.detail).toMatchObject({
        centerClientX: 15,
        centerClientY: 10,
        scale: 1,
        startCenterClientX: 15,
        startCenterClientY: 10
      });
    });

    it('consults pinch admission once for a pointer pair and retries for a new pair', () => {
      beginPinch.mockReturnValue(undefined);
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 2, pointerId: 1, pointerType: 'touch' }));

      expect(beginPinch).toHaveBeenCalledOnce();
      expect(gestureEvents.map(event => event.detail.kind)).toEqual(['drag', 'drag']);

      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 20, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 30, pointerId: 3, pointerType: 'touch' }));

      expect(beginPinch).toHaveBeenCalledTimes(2);
    });

    it('distinguishes an accepted undefined pinch context from declined admission', () => {
      const pinchHost = document.createElement(tag) as GestureControllerTestHost;
      const pinchTarget = document.createElement('div');
      const pinchEvents: CustomEvent<Gesture<undefined>>[] = [];
      pinchHost.append(pinchTarget);
      const pinchController = new GestureController(pinchHost, {
        beginPinch: () => ({ context: undefined })
      });
      pinchController.target = pinchTarget;
      pinchHost.addEventListener('nve-gesture', event => pinchEvents.push(event as CustomEvent<Gesture<undefined>>));
      pinchHost.addEventListener('nve-gesture-input', event => {
        const input = (event as CustomEvent<GestureInput>).detail;
        if (input.kind === 'pointerdown') input.claim({ pinchCandidate: true });
      });
      vi.spyOn(pinchTarget, 'setPointerCapture').mockImplementation(() => {});
      fixture.append(pinchHost);

      pinchTarget.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
      pinchTarget.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
      pinchTarget.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 2, pointerType: 'touch' }));

      expect(pinchEvents[0]?.detail).toMatchObject({ context: undefined, kind: 'pinch', scale: 2 });
    });
  });

  describe('wheel and context menu input', () => {
    it('normalizes both wheel axes and reports focal client coordinates', () => {
      const pixel = wheelEvent({
        clientX: 11,
        clientY: 12,
        deltaX: 2,
        deltaY: -3,
        deltaMode: WheelEvent.DOM_DELTA_PIXEL
      });
      const line = wheelEvent({
        clientX: 21,
        clientY: 22,
        deltaX: 2,
        deltaY: -3,
        deltaMode: WheelEvent.DOM_DELTA_LINE
      });
      const page = wheelEvent({
        clientX: 31,
        clientY: 32,
        deltaX: 2,
        deltaY: -3,
        deltaMode: WheelEvent.DOM_DELTA_PAGE
      });

      for (const event of [pixel, line, page]) expect(target.dispatchEvent(event)).toBe(false);

      expect(gestureInputEvents.map(({ detail }) => detail)).toEqual([
        { claim: expect.any(Function), clientX: 11, clientY: 12, deltaX: 2, deltaY: -3, event: pixel, kind: 'wheel' },
        { claim: expect.any(Function), clientX: 21, clientY: 22, deltaX: 32, deltaY: -48, event: line, kind: 'wheel' },
        {
          claim: expect.any(Function),
          clientX: 31,
          clientY: 32,
          deltaX: 400,
          deltaY: -300,
          event: page,
          kind: 'wheel'
        }
      ]);
      expect(gestureEvents).toEqual([]);
      expect(target.getBoundingClientRect).toHaveBeenCalledOnce();
    });

    it('claims wheel input only during its synchronous dispatch', () => {
      automaticallyClaim = false;
      const firstWheel = wheelEvent({ deltaY: 1 });
      const secondWheel = wheelEvent({ deltaY: 2 });

      let lateClaim: (() => boolean) | undefined;
      host.addEventListener('nve-gesture-input', event => {
        const input = (event as CustomEvent<GestureInput>).detail;
        if (input.kind !== 'wheel') return;
        if (input.event === firstWheel) lateClaim = input.claim;
        if (input.event === secondWheel) expect(input.claim()).toBe(true);
      });

      expect(target.dispatchEvent(firstWheel)).toBe(true);
      expect(lateClaim?.()).toBe(false);
      expect(target.dispatchEvent(secondWheel)).toBe(false);
    });

    it('consults context-menu prevention for each event', () => {
      shouldPreventContextMenu.mockReturnValueOnce(false).mockReturnValueOnce(true);
      const firstMenu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      const secondMenu = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });

      expect(target.dispatchEvent(firstMenu)).toBe(true);
      expect(target.dispatchEvent(secondMenu)).toBe(false);

      expect(shouldPreventContextMenu).toHaveBeenNthCalledWith(1, firstMenu);
      expect(shouldPreventContextMenu).toHaveBeenNthCalledWith(2, secondMenu);
    });
  });

  describe('pointer termination and ownership', () => {
    it.each([
      ['pointerup', 'up', false],
      ['pointercancel', 'cancel', true],
      ['lostpointercapture', 'lost-capture', true],
      ['pointermove', 'buttons-released', false]
    ] as const)('reports one %s terminal outcome with reason %s and a final frame', (type, reason, interrupted) => {
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));
      expect(target.style.userSelect).toBe('none');
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 13, clientY: 25, pointerId: 1 }));
      const end = interrupted
        ? pointerEvent(type, { buttons: 0, pointerId: 1 })
        : pointerEvent(type, { buttons: 0, clientX: 15, clientY: 29, pointerId: 1 });
      const clientX = interrupted ? 13 : 15;
      const clientY = interrupted ? 25 : 29;

      target.dispatchEvent(end);
      target.dispatchEvent(pointerEvent('lostpointercapture', { clientX: 15, clientY: 29, pointerId: 1 }));

      const terminal = gestureInputEvents.filter(event => event.detail.kind === 'pointerend');
      expect(terminal).toHaveLength(1);
      expect(terminal[0]?.detail).toEqual({
        clientX,
        clientY,
        event: end,
        interrupted,
        kind: 'pointerend',
        movementX: interrupted ? 0 : 2,
        movementY: interrupted ? 0 : 4,
        reason,
        startClientX: 10,
        startClientY: 20,
        totalDisplacementX: interrupted ? 3 : 5,
        totalDisplacementY: interrupted ? 5 : 9
      });
      expect(target.style.userSelect).toBe('');
    });

    it('does not follow pointer movement after a terminal event', () => {
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));
      const end = pointerEvent('pointerup', { buttons: 0, clientX: 15, clientY: 25, pointerId: 1 });
      target.dispatchEvent(end);
      const inputCount = gestureInputEvents.length;
      const staleMove = pointerEvent('pointermove', { clientX: 20, clientY: 30, pointerId: 1 });
      target.dispatchEvent(staleMove);

      expect(gestureInputEvents).toHaveLength(inputCount);
      expect(gestureInputEvents.at(-1)?.detail).toMatchObject({ event: end, kind: 'pointerend' });
      expect(gestureEvents).toHaveLength(0);
    });

    it('terminates a tracked pointer even when the terminal event becomes ignored', () => {
      target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      ignored = true;
      target.dispatchEvent(pointerEvent('pointercancel', { pointerId: 1 }));

      expect(gestureInputEvents.at(-1)?.detail).toMatchObject({ kind: 'pointerend', reason: 'cancel' });
    });

    it('does not retain or follow an unclaimed pointer sequence', () => {
      automaticallyClaim = false;
      const setPointerCapture = vi.mocked(target.setPointerCapture);
      const down = pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 });
      const move = pointerEvent('pointermove', { clientX: 13, clientY: 25, pointerId: 1 });
      const up = pointerEvent('pointerup', { buttons: 0, clientX: 15, clientY: 29, pointerId: 1 });

      target.dispatchEvent(down);
      target.dispatchEvent(move);
      target.dispatchEvent(up);

      expect(setPointerCapture).not.toHaveBeenCalled();
      expect(target.style.userSelect).toBe('');
      expect(gestureEvents).toEqual([]);
      expect(gestureInputEvents.map(event => event.detail.kind)).toEqual(['pointerdown']);
    });

    it('does not suppress selection for an ignored pointerdown', () => {
      ignored = true;

      target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));

      expect(target.style.userSelect).toBe('');
      expect(gestureInputEvents).toEqual([]);
    });
  });

  describe('pinch candidate ownership', () => {
    it('forms pinch pairs only from claimed pinch candidates', () => {
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'mouse' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 2, pointerType: 'touch' }));

      expect(beginPinch).not.toHaveBeenCalled();
      expect(gestureEvents.at(-1)?.detail).toMatchObject({ kind: 'drag' });
    });

    it('gives an accepted pinch priority over individual pointer gestures', () => {
      automaticallyClaim = false;
      host.addEventListener('nve-gesture-input', event => {
        const input = (event as CustomEvent<GestureInput>).detail;
        if (input.kind === 'pointerdown') input.claim({ kind: 'pan', pinchCandidate: true });
      });
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 2, pointerType: 'touch' }));

      expect(gestureEvents.map(event => event.detail.kind)).toEqual(['pinch']);
    });

    it('allows a noncandidate pointer gesture alongside an active pinch', () => {
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 3, pointerType: 'pen' }));
      const penMove = pointerEvent('pointermove', { clientX: 25, pointerId: 3, pointerType: 'pen' });
      target.dispatchEvent(penMove);

      expect(gestureEvents.map(event => event.detail)).toEqual([
        expect.objectContaining({ event: penMove, kind: 'drag', movementX: 5 })
      ]);
    });

    it('suppresses candidate movement when an active pair becomes incomplete within a three-touch cluster', () => {
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 3, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 30, pointerId: 3, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 0, pointerId: 1, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 12, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 32, pointerId: 3, pointerType: 'touch' }));

      expect(beginPinch).toHaveBeenCalledOnce();
      expect(gestureEvents.filter(event => event.detail.event.pointerId === 2)).toEqual([]);
      expect(gestureEvents.filter(event => event.detail.event.pointerId === 3)).toEqual([]);

      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 12, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 40, pointerId: 4, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 50, pointerId: 4, pointerType: 'touch' }));

      expect(beginPinch).toHaveBeenCalledTimes(2);
      expect(gestureEvents.filter(event => event.detail.kind === 'pinch')).toHaveLength(1);
    });

    it('keeps a pending pair locked until its three-touch cluster resets', () => {
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 3, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 0, pointerId: 1, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 2, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 22, pointerId: 3, pointerType: 'touch' }));

      expect(beginPinch).not.toHaveBeenCalled();
      expect(gestureEvents.filter(event => event.detail.event.pointerId === 2)).toEqual([]);
      expect(gestureEvents.filter(event => event.detail.event.pointerId === 3)).toEqual([]);

      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 2, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 30, pointerId: 4, pointerType: 'touch' }));

      expect(beginPinch).toHaveBeenCalledOnce();
    });

    it('keeps one declined pair locked throughout a three-touch cluster', () => {
      beginPinch.mockReturnValue(undefined);
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 3, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointermove', { clientX: 30, pointerId: 3, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 0, pointerId: 1, pointerType: 'touch' }));
      const survivingPairMove = pointerEvent('pointermove', {
        clientX: 12,
        pointerId: 2,
        pointerType: 'touch'
      });
      const extraCandidateMove = pointerEvent('pointermove', {
        clientX: 32,
        pointerId: 3,
        pointerType: 'touch'
      });
      target.dispatchEvent(survivingPairMove);
      target.dispatchEvent(extraCandidateMove);

      expect(beginPinch).toHaveBeenCalledOnce();
      expect(gestureEvents.map(event => event.detail)).toEqual([
        expect.objectContaining({ event: survivingPairMove, kind: 'drag', movementX: 2 })
      ]);
      expect(gestureEvents.filter(event => event.detail.event.pointerId === 3)).toEqual([]);

      target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 12, pointerId: 2, pointerType: 'touch' }));
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 40, pointerId: 4, pointerType: 'touch' }));

      expect(beginPinch).toHaveBeenCalledTimes(2);
    });
  });

  describe('claim priority and pointerdown reservation', () => {
    it('gives a default self-first outer controller precedence over an inner descendant-first claim', () => {
      const outerHost = document.createElement(tag) as GestureControllerTestHost;
      const innerHost = document.createElement(tag) as GestureControllerTestHost;
      const outerInputKinds: GestureInput['kind'][] = [];
      const outerGestures = vi.fn();
      const innerInputs = vi.fn();
      outerHost.append(innerHost);
      const outerController = new GestureController(outerHost, {});
      const innerController = new GestureController(innerHost, { claimPriority: 'descendant-first' });
      outerController.target = outerHost;
      innerController.target = innerHost;
      outerHost.addEventListener('nve-gesture-input', event => {
        const input = (event as CustomEvent<GestureInput>).detail;
        outerInputKinds.push(input.kind);
        if (input.kind === 'pointerdown') input.claim({ kind: 'drag' });
      });
      outerHost.addEventListener('nve-gesture', outerGestures);
      innerHost.addEventListener('nve-gesture-input', event => {
        const input = (event as CustomEvent<GestureInput>).detail;
        innerInputs(input);
        if (input.kind === 'pointerdown') input.claim({ kind: 'drag' });
      });
      fixture.append(outerHost);

      innerHost.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      innerHost.dispatchEvent(pointerEvent('pointermove', { clientX: 2, pointerId: 1 }));
      innerHost.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 2, pointerId: 1 }));

      expect(outerInputKinds).toEqual(['pointerdown', 'pointerend']);
      expect(outerGestures).toHaveBeenCalledOnce();
      expect(innerInputs).not.toHaveBeenCalled();
    });

    it('lets an inner descendant-first pointer claim hide its sequence from an outer descendant-first controller', () => {
      const outerHost = document.createElement(tag) as GestureControllerTestHost;
      const innerHost = document.createElement(tag) as GestureControllerTestHost;
      const outerInputs = vi.fn();
      const innerInputs = vi.fn();
      outerHost.append(innerHost);
      const outerController = new GestureController(outerHost, { claimPriority: 'descendant-first' });
      const innerController = new GestureController(innerHost, { claimPriority: 'descendant-first' });
      outerController.target = outerHost;
      innerController.target = innerHost;
      outerHost.addEventListener('nve-gesture-input', outerInputs);
      innerHost.addEventListener('nve-gesture-input', event => {
        const input = (event as CustomEvent<GestureInput>).detail;
        innerInputs(input);
        if (input.kind === 'pointerdown') input.claim({ kind: 'drag' });
      });
      fixture.append(outerHost);

      innerHost.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      innerHost.dispatchEvent(pointerEvent('pointermove', { clientX: 2, pointerId: 1 }));
      innerHost.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 2, pointerId: 1 }));

      expect(innerInputs).toHaveBeenCalled();
      expect(outerInputs).not.toHaveBeenCalled();
    });

    it('lets an inner descendant-first wheel claim hide input from an outer descendant-first controller', () => {
      const outerHost = document.createElement(tag) as GestureControllerTestHost;
      const innerHost = document.createElement(tag) as GestureControllerTestHost;
      const outerInputs = vi.fn();
      outerHost.append(innerHost);
      const outerController = new GestureController(outerHost, { claimPriority: 'descendant-first' });
      const innerController = new GestureController(innerHost, { claimPriority: 'descendant-first' });
      outerController.target = outerHost;
      innerController.target = innerHost;
      outerHost.addEventListener('nve-gesture-input', outerInputs);
      innerHost.addEventListener('nve-gesture-input', event => {
        const input = (event as CustomEvent<GestureInput>).detail;
        if (input.kind === 'wheel') input.claim();
      });
      fixture.append(outerHost);

      expect(innerHost.dispatchEvent(wheelEvent({ deltaY: 2 }))).toBe(false);
      expect(outerInputs).not.toHaveBeenCalled();
    });

    it('makes target application code observe a descendant-first pointerdown reservation', () => {
      const reservationHost = document.createElement(tag) as GestureControllerTestHost;
      const child = document.createElement('div');
      const observedDefaultPrevented = vi.fn();
      reservationHost.append(child);
      const reservationController = new GestureController(reservationHost, {
        claimPriority: 'descendant-first',
        shouldReservePointerDown: () => true
      });
      reservationController.target = reservationHost;
      child.addEventListener('pointerdown', event => observedDefaultPrevented(event.defaultPrevented));
      fixture.append(reservationHost);

      child.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));

      expect(observedDefaultPrevented).toHaveBeenCalledWith(true);
    });

    it('reserves without stopping propagation, claiming, capturing, suppressing selection, or producing output', () => {
      const reservationHost = document.createElement(tag) as GestureControllerTestHost;
      const reservationTarget = document.createElement('div');
      const child = document.createElement('button');
      const childPointerDown = vi.fn((event: PointerEvent) => event.stopPropagation());
      const inputs = vi.fn();
      const gestures = vi.fn();
      reservationTarget.append(child);
      reservationHost.append(reservationTarget);
      const reservationController = new GestureController(reservationHost, {
        claimPriority: 'descendant-first',
        shouldReservePointerDown: () => true
      });
      reservationController.target = reservationTarget;
      const capture = vi.spyOn(reservationTarget, 'setPointerCapture').mockImplementation(() => {});
      reservationHost.addEventListener('nve-gesture-input', inputs);
      reservationHost.addEventListener('nve-gesture', gestures);
      child.addEventListener('pointerdown', childPointerDown);
      fixture.append(reservationHost);

      const down = pointerEvent('pointerdown', { pointerId: 1 });
      child.dispatchEvent(down);
      reservationTarget.dispatchEvent(pointerEvent('pointermove', { clientX: 2, pointerId: 1 }));

      expect(down.defaultPrevented).toBe(true);
      expect(childPointerDown).toHaveBeenCalledOnce();
      expect(inputs).not.toHaveBeenCalled();
      expect(gestures).not.toHaveBeenCalled();
      expect(capture).not.toHaveBeenCalled();
      expect(reservationTarget.style.userSelect).toBe('');
    });

    it('lets an inner descendant-first controller claim after an outer reservation', () => {
      const outerHost = document.createElement(tag) as GestureControllerTestHost;
      const innerHost = document.createElement(tag) as GestureControllerTestHost;
      const reserve = vi.fn(() => true);
      const outerInputs = vi.fn();
      const innerInputs = vi.fn();
      outerHost.append(innerHost);
      const outerController = new GestureController(outerHost, {
        claimPriority: 'descendant-first',
        shouldReservePointerDown: reserve
      });
      const innerController = new GestureController(innerHost, { claimPriority: 'descendant-first' });
      outerController.target = outerHost;
      innerController.target = innerHost;
      outerHost.addEventListener('nve-gesture-input', outerInputs);
      innerHost.addEventListener('nve-gesture-input', event => {
        const input = (event as CustomEvent<GestureInput>).detail;
        innerInputs(input);
        if (input.kind === 'pointerdown') input.claim({ kind: 'drag' });
      });
      fixture.append(outerHost);

      const down = pointerEvent('pointerdown', { pointerId: 1 });
      innerHost.dispatchEvent(down);
      innerHost.dispatchEvent(pointerEvent('pointermove', { clientX: 2, pointerId: 1 }));
      innerHost.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 2, pointerId: 1 }));

      expect(down.defaultPrevented).toBe(true);
      expect(reserve).toHaveBeenCalledOnce();
      expect(innerInputs).toHaveBeenCalled();
      expect(outerInputs).not.toHaveBeenCalled();
    });

    it('skips reservation for ignored or already canceled input', () => {
      let reservationIgnored = true;
      const reservationHost = document.createElement(tag) as GestureControllerTestHost;
      const reservationTarget = document.createElement('div');
      const child = document.createElement('div');
      const reserve = vi.fn(() => true);
      reservationTarget.append(child);
      reservationHost.append(reservationTarget);
      const reservationController = new GestureController(reservationHost, {
        claimPriority: 'descendant-first',
        shouldIgnoreEvent: () => reservationIgnored,
        shouldReservePointerDown: reserve
      });
      reservationController.target = reservationTarget;
      fixture.append(reservationHost);

      const ignoredDown = pointerEvent('pointerdown', { pointerId: 1 });
      child.dispatchEvent(ignoredDown);
      expect(ignoredDown.defaultPrevented).toBe(false);

      reservationIgnored = false;
      const canceledDown = pointerEvent('pointerdown', { pointerId: 2 });
      canceledDown.preventDefault();
      child.dispatchEvent(canceledDown);
      expect(canceledDown.defaultPrevented).toBe(true);
      expect(reserve).not.toHaveBeenCalled();
    });

    it('removes reservation handling after target removal or disconnect', () => {
      const reservationHost = document.createElement(tag) as GestureControllerTestHost;
      const reservationTarget = document.createElement('div');
      const child = document.createElement('div');
      const reserve = vi.fn(() => true);
      reservationTarget.append(child);
      reservationHost.append(reservationTarget);
      const reservationController = new GestureController(reservationHost, {
        claimPriority: 'descendant-first',
        shouldReservePointerDown: reserve
      });
      reservationController.target = reservationTarget;
      fixture.append(reservationHost);

      reservationController.target = undefined;
      const removedTargetDown = pointerEvent('pointerdown', { pointerId: 3 });
      child.dispatchEvent(removedTargetDown);
      expect(removedTargetDown.defaultPrevented).toBe(false);

      reservationController.target = reservationTarget;
      reservationHost.remove();
      const disconnectedDown = pointerEvent('pointerdown', { pointerId: 4 });
      child.dispatchEvent(disconnectedDown);
      expect(disconnectedDown.defaultPrevented).toBe(false);
      expect(reserve).not.toHaveBeenCalled();
    });
  });

  describe('platform behavior and lifecycle', () => {
    it('applies and restores opt-in touch action without overwriting later caller changes', () => {
      const touchHost = document.createElement(tag) as GestureControllerTestHost;
      const touchTarget = document.createElement('div');
      touchTarget.style.setProperty('touch-action', 'pan-x', 'important');
      touchHost.append(touchTarget);
      const touchController = new GestureController(touchHost, {
        touchAction: 'none'
      });
      touchController.target = touchTarget;
      fixture.append(touchHost);

      expect(touchTarget.style.touchAction).toBe('none');
      touchHost.remove();
      expect(touchTarget.style.touchAction).toBe('pan-x');
      expect(touchTarget.style.getPropertyPriority('touch-action')).toBe('important');

      fixture.append(touchHost);
      touchTarget.style.touchAction = 'pan-y';
      touchHost.remove();
      expect(touchTarget.style.touchAction).toBe('pan-y');
    });

    it('updates a callback-provided touch action while preserving the original inline value', () => {
      let reservesTouch = false;
      const touchHost = document.createElement(tag) as GestureControllerTestHost;
      const touchTarget = document.createElement('div');
      touchTarget.style.touchAction = 'pan-y';
      touchHost.append(touchTarget);
      const touchController = new GestureController(touchHost, {
        touchAction: () => (reservesTouch ? 'none' : undefined)
      });
      touchController.target = touchTarget;
      fixture.append(touchHost);
      expect(touchTarget.style.touchAction).toBe('pan-y');

      reservesTouch = true;
      touchHost.updateControllers();
      expect(touchTarget.style.touchAction).toBe('none');

      reservesTouch = false;
      touchHost.updateControllers();
      expect(touchTarget.style.touchAction).toBe('pan-y');
    });

    it('suppresses native drag only when opted in', () => {
      const nativeDrag = new DragEvent('dragstart', { bubbles: true, cancelable: true });
      expect(target.dispatchEvent(nativeDrag)).toBe(true);

      const suppressHost = document.createElement(tag) as GestureControllerTestHost;
      const suppressTarget = document.createElement('div');
      suppressHost.append(suppressTarget);
      const suppressController = new GestureController(suppressHost, {
        suppressNativeDrag: true
      });
      suppressController.target = suppressTarget;
      fixture.append(suppressHost);

      expect(suppressTarget.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true }))).toBe(false);
    });

    it('clears gesture state when its target changes and removes listeners on disconnect', () => {
      target.dispatchEvent(pointerEvent('pointerdown', { clientX: 1, clientY: 1, pointerId: 1 }));
      expect(target.style.userSelect).toBe('none');
      const replacement = document.createElement('div');
      host.append(replacement);
      vi.spyOn(replacement, 'setPointerCapture').mockImplementation(() => {});
      controller.target = replacement;
      expect(target.style.userSelect).toBe('');
      const inputCallCount = gestureInputEvents.length;
      const replacementMove = pointerEvent('pointermove', { clientX: 3, clientY: 1, pointerId: 1 });
      replacement.dispatchEvent(replacementMove);

      expect(gestureInputEvents).toHaveLength(inputCallCount);
      expect(gestureEvents).toEqual([]);

      replacement.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
      expect(replacement.style.userSelect).toBe('none');
      const disconnectedInputCount = gestureInputEvents.length;
      host.remove();
      expect(replacement.style.userSelect).toBe('');
      replacement.dispatchEvent(pointerEvent('pointerdown', { pointerId: 3 }));
      expect(gestureInputEvents).toHaveLength(disconnectedInputCount);
    });
  });
});

function pointerEvent(type: string, init: PointerEventInit): PointerEvent {
  return new PointerEvent(type, { bubbles: true, buttons: 1, cancelable: true, ...init });
}

function wheelEvent(init: WheelEventInit): WheelEvent {
  return new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init });
}
