// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, type ReactiveController } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';
import {
  TouchController,
  type TouchCapabilities,
  type TouchGesture,
  type UnhandledPointerInput
} from './touch.controller.js';

class TouchControllerTestHost extends HTMLElement {
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

const tag = 'touch-controller-test-host';
if (!customElements.get(tag)) customElements.define(tag, TouchControllerTestHost);

describe('TouchController', () => {
  let capabilities: TouchCapabilities;
  let controller: TouchController<string>;
  let fixture: HTMLElement;
  let gestures: TouchGesture<string>[];
  let host: TouchControllerTestHost;
  let ignored: boolean;
  let inputs: UnhandledPointerInput[];
  let prepare: ReturnType<typeof vi.fn>;
  let target: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<div></div>`);
    host = document.createElement(tag) as TouchControllerTestHost;
    target = document.createElement('div');
    host.append(target);
    capabilities = { drag: true, pan: true, pinch: true, wheel: true };
    gestures = [];
    ignored = false;
    inputs = [];
    prepare = vi.fn();
    controller = new TouchController(host, {
      createPinchContext: () => 'pinch-start',
      getCapabilities: () => capabilities,
      onGesture: gesture => gestures.push(gesture),
      onUnhandledPointer: input => inputs.push(input),
      prepare,
      shouldIgnore: () => ignored
    });
    controller.target = target;
    vi.spyOn(target, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 200, 100));
    vi.spyOn(target, 'setPointerCapture').mockImplementation(() => {});
    fixture.append(host);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('tracks primary drags while routing pointer boundaries and stationary movement', () => {
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));
    const move = pointerEvent('pointermove', { clientX: 16, clientY: 24, pointerId: 1 });
    const stationary = pointerEvent('pointermove', { clientX: 16, clientY: 24, pointerId: 1 });

    expect(target.dispatchEvent(move)).toBe(false);
    expect(target.dispatchEvent(stationary)).toBe(true);
    target.dispatchEvent(pointerEvent('pointerup', { clientX: 16, clientY: 24, pointerId: 1 }));
    target.dispatchEvent(pointerEvent('click', { clientX: 16, clientY: 24, pointerId: 1 }));

    expect(gestures).toEqual([{ event: move, kind: 'drag', movementX: 6, movementY: 4 }]);
    expect(inputs.map(input => input.kind)).toEqual(['pointerdown', 'pointermove', 'pointerup', 'click']);
    expect(target.setPointerCapture).toHaveBeenCalledWith(1);
  });

  it('reports pinch scale against context captured when the second pointer starts', () => {
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 10, pointerId: 1, pointerType: 'touch' }));
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, clientY: 10, pointerId: 2, pointerType: 'touch' }));
    const move = pointerEvent('pointermove', { clientX: 30, clientY: 10, pointerId: 2, pointerType: 'touch' });

    expect(target.dispatchEvent(move)).toBe(false);
    expect(gestures).toEqual([{ context: 'pinch-start', event: move, kind: 'pinch', scale: 2 }]);

    target.dispatchEvent(pointerEvent('pointercancel', { pointerId: 2, pointerType: 'touch' }));
    const remainingMove = pointerEvent('pointermove', {
      clientX: 12,
      clientY: 10,
      pointerId: 1,
      pointerType: 'touch'
    });
    target.dispatchEvent(remainingMove);
    expect(gestures.at(-1)).toEqual({ event: remainingMove, kind: 'drag', movementX: 2, movementY: 0 });
  });

  it('consumes secondary-button boundaries and emits pan movement', () => {
    const downstream = vi.fn();
    target.addEventListener('pointerdown', downstream);
    const down = pointerEvent('pointerdown', { button: 2, buttons: 2, clientX: 10, clientY: 10, pointerId: 4 });
    const move = pointerEvent('pointermove', { button: -1, buttons: 2, clientX: 20, clientY: 15, pointerId: 4 });

    expect(target.dispatchEvent(down)).toBe(false);
    expect(target.dispatchEvent(move)).toBe(false);
    expect(target.dispatchEvent(pointerEvent('pointerup', { button: 2, pointerId: 4 }))).toBe(false);
    expect(target.dispatchEvent(pointerEvent('click', { button: 2, pointerId: 4 }))).toBe(false);

    expect(downstream).not.toHaveBeenCalled();
    expect(gestures).toEqual([{ event: move, kind: 'pan', movementX: 10, movementY: 5 }]);
    expect(inputs).toEqual([]);
  });

  it('normalizes wheel modes and suppresses the context menu when pan is available', () => {
    const pixel = new WheelEvent('wheel', { cancelable: true, deltaMode: WheelEvent.DOM_DELTA_PIXEL, deltaY: 2 });
    const line = new WheelEvent('wheel', { cancelable: true, deltaMode: WheelEvent.DOM_DELTA_LINE, deltaY: 2 });
    const page = new WheelEvent('wheel', { cancelable: true, deltaMode: WheelEvent.DOM_DELTA_PAGE, deltaY: 2 });
    const contextMenu = new MouseEvent('contextmenu', { cancelable: true });

    expect([pixel, line, page].map(event => target.dispatchEvent(event))).toEqual([false, false, false]);
    expect(target.dispatchEvent(contextMenu)).toBe(false);
    expect(
      gestures.map(gesture =>
        gesture.kind === 'wheel' ? { deltaPixels: gesture.deltaPixels, kind: gesture.kind } : null
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
    expect(gestures).toEqual([]);
    expect(inputs.map(input => input.kind)).toEqual(['pointerdown', 'pointermove']);

    ignored = true;
    target.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
    expect(inputs.map(input => input.kind)).toEqual(['pointerdown', 'pointermove']);
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

    expect(inputs.at(-1)).toEqual({ event: replacementMove, kind: 'pointermove' });
    expect(gestures).toEqual([]);

    const callCount = inputs.length;
    host.remove();
    replacement.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
    expect(inputs).toHaveLength(callCount);
  });
});

function pointerEvent(type: string, init: PointerEventInit): PointerEvent {
  return new PointerEvent(type, { bubbles: true, cancelable: true, ...init });
}
