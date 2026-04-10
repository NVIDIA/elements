// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { css, html, LitElement } from 'lit';
import { customElement } from 'lit/decorators/custom-element.js';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { typeTouch } from '@nvidia-elements/core/internal';
import type { NveTouchEvent } from '@nvidia-elements/core/internal';

@typeTouch<TypeTouchControllerTestElement>()
@customElement('type-touch-controller-test-element')
class TypeTouchControllerTestElement extends LitElement {
  // using an internal relative block to get more accurate offset values
  static styles = [
    css`
      :host {
        display: block;
        position: relative;
        width: 100px;
        height: 100px;
      }

      button {
        position: absolute;
        top: 20px;
        left: 20px;
      }
    `
  ];

  render() {
    return html`<button aria-label="touch button"></button>`;
  }
}

describe('touch.controller', () => {
  let element: TypeTouchControllerTestElement;
  let fixture: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`<type-touch-controller-test-element></type-touch-controller-test-element>`);
    element = fixture.querySelector<TypeTouchControllerTestElement>('type-touch-controller-test-element');
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should trigger nve-touch-start on pointerdown', async () => {
    await elementIsStable(element);
    const event = untilEvent(element, 'nve-touch-start');
    element.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1 }));
    expect(await event).toBeTruthy();
  });

  it('should trigger nve-touch-end on pointerup', async () => {
    await elementIsStable(element);
    const startEvent = untilEvent(element, 'nve-touch-start');
    const endEvent = untilEvent(element, 'nve-touch-end');

    element.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1 }));
    expect(await startEvent).toBeTruthy();

    document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    expect(await endEvent).toBeTruthy();
  });

  it('should return coordinates of touchstart event', async () => {
    await elementIsStable(element);
    const event = untilEvent<NveTouchEvent>(element, 'nve-touch-start');

    element.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1 }));
    const touchEvent = await event;
    expect(touchEvent.x).toBe(0);
    expect(touchEvent.y).toBe(0);
    expect(touchEvent.offsetX).toBe(0);
    expect(touchEvent.offsetY).toBe(0);
  });

  it('should return coordinates of touchmove event', async () => {
    await elementIsStable(element);
    const event = untilEvent<NveTouchEvent>(element, 'nve-touch-move');
    element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 0, clientY: 0, pointerId: 1 }));
    document.dispatchEvent(new PointerEvent('pointermove', { clientX: 75, clientY: 75, pointerId: 1 }));

    const touchEvent = await event;
    expect(touchEvent.x).toEqual(75);
    expect(touchEvent.y).toEqual(75);
    expect(touchEvent.offsetX).toEqual(75);
    expect(touchEvent.offsetY).toEqual(75);
  });

  it('should return coordinates of touchend event', async () => {
    await elementIsStable(element);
    const event = untilEvent<NveTouchEvent>(element, 'nve-touch-end');

    element.dispatchEvent(new PointerEvent('pointerdown', { pointerId: 1 }));
    document.dispatchEvent(new PointerEvent('pointerup', { pointerId: 1 }));
    const touchEvent = await event;
    expect(touchEvent.x).toBe(0);
    expect(touchEvent.y).toBe(0);
    expect(touchEvent.offsetX).toBe(0);
    expect(touchEvent.offsetY).toBe(0);
  });

  it('should return offset value from initial starting point of touchstart', async () => {
    await elementIsStable(element);
    const event = untilEvent<NveTouchEvent>(element, 'nve-touch-end');
    element.dispatchEvent(new PointerEvent('pointerdown', { clientX: 20, clientY: 10, pointerId: 1 }));
    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 40, clientY: 20, pointerId: 1 }));

    const touchEvent = await event;
    expect(touchEvent.x).toEqual(40);
    expect(touchEvent.y).toEqual(20);
    expect(touchEvent.offsetX).toEqual(20);
    expect(touchEvent.offsetY).toEqual(10);
  });
});
