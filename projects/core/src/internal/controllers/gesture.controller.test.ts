// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import {
  GestureController,
  type Gesture,
  type GestureCapabilities,
  type GestureControllerOptions,
  type UnhandledPointerInput
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
  let capabilities: GestureCapabilities;
  let controller: GestureController<string>;
  let fixture: HTMLElement;
  let gestureEvents: CustomEvent<Gesture<string>>[];
  let host: GestureControllerTestHost;
  let ignored: boolean;
  let pointerInputEvents: CustomEvent<UnhandledPointerInput>[];
  let prepare: ReturnType<typeof vi.fn>;
  let target: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as GestureControllerTestHost;
    target = document.createElement('div');
    host.append(target);
    capabilities = { drag: true, pan: true, pinch: true, wheel: true };
    gestureEvents = [];
    ignored = false;
    pointerInputEvents = [];
    prepare = vi.fn();
    const options: GestureControllerOptions<string> = {
      createPinchContext: () => 'pinch-start',
      getCapabilities: () => capabilities,
      prepare,
      shouldIgnore: () => ignored
    };
    controller = new GestureController(host, options);
    controller.target = target;
    host.addEventListener('nve-gesture', event => gestureEvents.push(event as CustomEvent<Gesture<string>>));
    host.addEventListener('nve-pointer-input', event =>
      pointerInputEvents.push(event as CustomEvent<UnhandledPointerInput>)
    );
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    vi.spyOn(target, 'setPointerCapture').mockImplementation(() => {});
    fixture.append(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('exposes recognition configuration without input callbacks', () => {
    const options: GestureControllerOptions = {
      getCapabilities: () => ({ drag: true, pan: false, pinch: false, wheel: false })
    };

    expectTypeOf<
      Extract<keyof GestureControllerOptions<string>, 'onGesture' | 'onUnhandledPointer'>
    >().toEqualTypeOf<never>();
    expect(options.createPinchContext).toBeUndefined();
  });

  it('recognizes drag without a pinch context factory', () => {
    const dragHost = document.createElement(tag) as GestureControllerTestHost;
    const dragTarget = document.createElement('div');
    const dragEvents: CustomEvent<Gesture<undefined>>[] = [];
    dragHost.append(dragTarget);
    const dragController = new GestureController(dragHost, {
      getCapabilities: () => ({ drag: true, pan: false, pinch: false, wheel: false })
    });
    dragController.target = dragTarget;
    dragHost.addEventListener('nve-gesture', event => dragEvents.push(event as CustomEvent<Gesture<undefined>>));
    vi.spyOn(dragTarget, 'setPointerCapture').mockImplementation(() => {});
    fixture.append(dragHost);

    dragTarget.dispatchEvent(pointerEvent('pointerdown', { clientX: 2, clientY: 3, pointerId: 1 }));
    const move = pointerEvent('pointermove', { clientX: 7, clientY: 9, pointerId: 1 });
    dragTarget.dispatchEvent(move);

    expect(dragEvents.map(event => event.detail)).toEqual([{ event: move, kind: 'drag', movementX: 5, movementY: 6 }]);
  });

  it('disables reported pinch capability without a pinch context factory', () => {
    const pinchHost = document.createElement(tag) as GestureControllerTestHost;
    const pinchTarget = document.createElement('div');
    const gestures = vi.fn();
    const inputs: UnhandledPointerInput[] = [];
    pinchHost.append(pinchTarget);
    const pinchController = new GestureController(pinchHost, {
      getCapabilities: () => ({ drag: false, pan: false, pinch: true, wheel: false })
    });
    pinchController.target = pinchTarget;
    pinchHost.addEventListener('nve-gesture', gestures);
    pinchHost.addEventListener('nve-pointer-input', event =>
      inputs.push((event as CustomEvent<UnhandledPointerInput>).detail)
    );
    const setPointerCapture = vi.spyOn(pinchTarget, 'setPointerCapture').mockImplementation(() => {});
    fixture.append(pinchHost);

    pinchTarget.dispatchEvent(
      pointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch' })
    );
    pinchTarget.dispatchEvent(
      pointerEvent('pointerdown', { clientX: 20, clientY: 10, pointerId: 2, pointerType: 'touch' })
    );
    const move = pointerEvent('pointermove', {
      clientX: 30,
      clientY: 10,
      pointerId: 2,
      pointerType: 'touch'
    });
    pinchTarget.dispatchEvent(move);

    expect(gestures).not.toHaveBeenCalled();
    expect(inputs.map(input => input.kind)).toEqual(['pointerdown', 'pointerdown', 'pointermove']);
    expect(setPointerCapture).not.toHaveBeenCalled();
  });

  it('dispatches synchronous custom events on the host before target listeners', () => {
    const order: string[] = [];
    const parentGesture = vi.fn();
    const parentPointerInput = vi.fn();
    fixture.addEventListener('nve-gesture', parentGesture);
    fixture.addEventListener('nve-pointer-input', parentPointerInput);
    host.addEventListener('nve-pointer-input', () => order.push('pointer-input'));
    host.addEventListener('nve-gesture', () => order.push('gesture'));
    target.addEventListener('pointerdown', () => order.push('pointerdown'));
    target.addEventListener('pointermove', () => order.push('pointermove'));

    const down = pointerEvent('pointerdown', { clientX: 1, clientY: 2, pointerId: 1 });
    target.dispatchEvent(down);
    expect(order).toEqual(['pointer-input', 'pointerdown']);

    const move = pointerEvent('pointermove', { clientX: 3, clientY: 5, pointerId: 1 });
    target.dispatchEvent(move);
    expect(order).toEqual(['pointer-input', 'pointerdown', 'gesture', 'pointermove']);

    const inputEvent = pointerInputEvents[0];
    const gestureEvent = gestureEvents[0];
    expect(inputEvent?.target).toBe(host);
    expect(inputEvent?.detail).toEqual({ event: down, kind: 'pointerdown' });
    expect(gestureEvent?.target).toBe(host);
    expect(gestureEvent?.detail).toEqual({ event: move, kind: 'drag', movementX: 2, movementY: 3 });
    for (const event of [inputEvent, gestureEvent]) {
      expect(event).toMatchObject({ bubbles: false, cancelable: false, composed: false });
    }
    expect(parentGesture).not.toHaveBeenCalled();
    expect(parentPointerInput).not.toHaveBeenCalled();
  });

  it('tracks primary drags while routing pointer boundaries and stationary movement', () => {
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));
    const move = pointerEvent('pointermove', { clientX: 16, clientY: 24, pointerId: 1 });
    const stationary = pointerEvent('pointermove', { clientX: 16, clientY: 24, pointerId: 1 });

    expect(target.dispatchEvent(move)).toBe(false);
    expect(target.dispatchEvent(stationary)).toBe(true);
    target.dispatchEvent(pointerEvent('pointerup', { clientX: 16, clientY: 24, pointerId: 1 }));
    target.dispatchEvent(pointerEvent('click', { clientX: 16, clientY: 24, pointerId: 1 }));

    expect(gestureEvents.map(event => event.detail)).toEqual([
      { event: move, kind: 'drag', movementX: 6, movementY: 4 }
    ]);
    expect(pointerInputEvents.map(event => event.detail.kind)).toEqual([
      'pointerdown',
      'pointermove',
      'pointerup',
      'click'
    ]);
    expect(target.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('should clear stale pointer state when a pointermove has no pressed buttons', () => {
    target.dispatchEvent(
      pointerEvent('pointerdown', { button: 2, buttons: 2, clientX: 10, clientY: 10, pointerId: 4 })
    );
    const released = pointerEvent('pointermove', { button: -1, buttons: 0, clientX: 20, clientY: 10, pointerId: 4 });
    const resumed = pointerEvent('pointermove', { button: -1, buttons: 2, clientX: 30, clientY: 10, pointerId: 4 });
    const restarted = pointerEvent('pointerdown', { button: 0, buttons: 1, clientX: 30, clientY: 10, pointerId: 4 });

    expect(target.dispatchEvent(released)).toBe(true);
    expect(pointerInputEvents.at(-1)?.detail).toEqual({ event: released, kind: 'pointermove' });
    expect(target.dispatchEvent(resumed)).toBe(true);
    expect(target.dispatchEvent(restarted)).toBe(true);
    expect(gestureEvents).toEqual([]);
    expect(pointerInputEvents.map(event => event.detail.kind)).toEqual(['pointermove', 'pointermove', 'pointerdown']);
  });

  it('clears released pointer state and reports lost pointer capture', () => {
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch' }));
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, clientY: 10, pointerId: 2, pointerType: 'touch' }));
    const lost = pointerEvent('lostpointercapture', { pointerId: 2, pointerType: 'touch' });
    target.dispatchEvent(lost);
    const remainingMove = pointerEvent('pointermove', {
      clientX: 12,
      clientY: 10,
      pointerId: 1,
      pointerType: 'touch'
    });
    const releasedMove = pointerEvent('pointermove', {
      clientX: 30,
      clientY: 10,
      pointerId: 2,
      pointerType: 'touch'
    });

    expect(target.dispatchEvent(remainingMove)).toBe(false);
    expect(target.dispatchEvent(releasedMove)).toBe(true);
    expect(gestureEvents.map(event => event.detail)).toEqual([
      { event: remainingMove, kind: 'drag', movementX: 2, movementY: 0 }
    ]);
    expect(pointerInputEvents.at(-2)?.detail).toEqual({ event: lost, kind: 'lostpointercapture' });
    expect(pointerInputEvents.at(-1)?.detail).toEqual({ event: releasedMove, kind: 'pointermove' });
  });

  it('reports pinch scale against context captured when the second pointer starts', () => {
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch' }));
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, clientY: 10, pointerId: 2, pointerType: 'touch' }));
    const move = pointerEvent('pointermove', { clientX: 30, clientY: 10, pointerId: 2, pointerType: 'touch' });

    expect(target.dispatchEvent(move)).toBe(false);
    expect(gestureEvents.map(event => event.detail)).toEqual([
      { context: 'pinch-start', event: move, kind: 'pinch', scale: 2 }
    ]);

    const cancel = pointerEvent('pointercancel', { pointerId: 2, pointerType: 'touch' });
    target.dispatchEvent(cancel);
    expect(pointerInputEvents.at(-1)?.detail).toEqual({ event: cancel, kind: 'pointercancel' });

    const remainingMove = pointerEvent('pointermove', {
      clientX: 12,
      clientY: 10,
      pointerId: 1,
      pointerType: 'touch'
    });
    target.dispatchEvent(remainingMove);
    expect(gestureEvents.at(-1)?.detail).toEqual({
      event: remainingMove,
      kind: 'drag',
      movementX: 2,
      movementY: 0
    });
  });

  it('preserves a pinch pair when another pointer moves or ends', () => {
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch' }));
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, clientY: 10, pointerId: 2, pointerType: 'touch' }));
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 40, clientY: 10, pointerId: 3, pointerType: 'touch' }));
    const nonParticipantMove = pointerEvent('pointermove', {
      clientX: 50,
      clientY: 10,
      pointerId: 3,
      pointerType: 'touch'
    });
    const participantMove = pointerEvent('pointermove', {
      clientX: 30,
      clientY: 10,
      pointerId: 2,
      pointerType: 'touch'
    });

    expect(target.dispatchEvent(nonParticipantMove)).toBe(true);
    target.dispatchEvent(pointerEvent('pointerup', { clientX: 50, clientY: 10, pointerId: 3, pointerType: 'touch' }));
    expect(target.dispatchEvent(participantMove)).toBe(false);
    expect(gestureEvents.map(event => event.detail)).toEqual([
      { context: 'pinch-start', event: participantMove, kind: 'pinch', scale: 2 }
    ]);
  });

  it('should establish a pinch baseline after zero-distance touch input', () => {
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch' }));
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 2, pointerType: 'touch' }));
    const move = pointerEvent('pointermove', { clientX: 20, clientY: 10, pointerId: 2, pointerType: 'touch' });

    expect(target.dispatchEvent(move)).toBe(false);
    expect(gestureEvents.map(event => event.detail)).toEqual([
      { context: 'pinch-start', event: move, kind: 'pinch', scale: 1 }
    ]);
  });

  it('consumes secondary-button boundaries and emits pan movement', () => {
    const downstream = vi.fn();
    target.addEventListener('pointerdown', downstream);
    const down = pointerEvent('pointerdown', { button: 2, buttons: 2, clientX: 10, clientY: 10, pointerId: 4 });
    const move = pointerEvent('pointermove', { button: -1, buttons: 2, clientX: 20, clientY: 15, pointerId: 4 });

    expect(target.dispatchEvent(down)).toBe(false);
    expect(target.dispatchEvent(move)).toBe(false);
    expect(target.dispatchEvent(pointerEvent('pointerup', { button: 2, pointerId: 4 }))).toBe(false);
    expect(target.dispatchEvent(pointerEvent('auxclick', { button: 2, pointerId: 4 }))).toBe(false);
    expect(target.dispatchEvent(pointerEvent('click', { button: 2, pointerId: 4 }))).toBe(false);

    expect(downstream).not.toHaveBeenCalled();
    expect(gestureEvents.map(event => event.detail)).toEqual([
      { event: move, kind: 'pan', movementX: 10, movementY: 5 }
    ]);
    expect(pointerInputEvents).toEqual([]);
  });

  it('normalizes wheel modes and suppresses the context menu when pan is available', () => {
    const pixel = new WheelEvent('wheel', { cancelable: true, deltaMode: WheelEvent.DOM_DELTA_PIXEL, deltaY: 2 });
    const line = new WheelEvent('wheel', { cancelable: true, deltaMode: WheelEvent.DOM_DELTA_LINE, deltaY: 2 });
    const page = new WheelEvent('wheel', { cancelable: true, deltaMode: WheelEvent.DOM_DELTA_PAGE, deltaY: 2 });
    const contextMenu = new MouseEvent('contextmenu', { cancelable: true });

    expect([pixel, line].map(event => target.dispatchEvent(event))).toEqual([false, false]);
    expect(target.getBoundingClientRect).not.toHaveBeenCalled();
    expect(target.dispatchEvent(page)).toBe(false);
    expect(target.getBoundingClientRect).toHaveBeenCalledOnce();
    expect(target.dispatchEvent(contextMenu)).toBe(false);
    expect(
      gestureEvents.map(({ detail }) =>
        detail.kind === 'wheel' ? { deltaPixels: detail.deltaPixels, kind: detail.kind } : null
      )
    ).toEqual([
      { deltaPixels: 2, kind: 'wheel' },
      { deltaPixels: 32, kind: 'wheel' },
      { deltaPixels: 200, kind: 'wheel' }
    ]);
  });

  it('honors capability and ignore gates without consuming events', () => {
    capabilities = { drag: false, pan: false, pinch: false, wheel: false };
    const down = pointerEvent('pointerdown', { clientX: 1, clientY: 1, pointerId: 1 });
    const move = pointerEvent('pointermove', { clientX: 2, clientY: 1, pointerId: 1 });
    const wheel = new WheelEvent('wheel', { cancelable: true, deltaY: 1 });
    const contextMenu = new MouseEvent('contextmenu', { cancelable: true });

    expect([down, move, wheel, contextMenu].map(event => target.dispatchEvent(event))).toEqual([
      true,
      true,
      true,
      true
    ]);
    expect(gestureEvents).toEqual([]);
    expect(pointerInputEvents.map(event => event.detail.kind)).toEqual(['pointerdown', 'pointermove']);

    ignored = true;
    target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
    expect(pointerInputEvents.map(event => event.detail.kind)).toEqual(['pointerdown', 'pointermove']);
    expect(prepare).toHaveBeenCalledTimes(4);
  });

  it('clears gesture state when its target changes and removes listeners on disconnect', () => {
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 1, clientY: 1, pointerId: 1 }));
    const replacement = document.createElement('div');
    host.append(replacement);
    vi.spyOn(replacement, 'setPointerCapture').mockImplementation(() => {});
    controller.target = replacement;
    const replacementMove = pointerEvent('pointermove', { clientX: 3, clientY: 1, pointerId: 1 });
    replacement.dispatchEvent(replacementMove);

    expect(pointerInputEvents.at(-1)?.detail).toEqual({ event: replacementMove, kind: 'pointermove' });
    expect(gestureEvents).toEqual([]);

    const callCount = pointerInputEvents.length;
    host.remove();
    replacement.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
    expect(pointerInputEvents).toHaveLength(callCount);
  });
});

function pointerEvent(type: string, init: PointerEventInit): PointerEvent {
  return new PointerEvent(type, { bubbles: true, buttons: 1, cancelable: true, ...init });
}
