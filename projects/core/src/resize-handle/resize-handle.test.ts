// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, removeFixture, elementIsStable, untilEvent } from '@internals/testing';
import { ResizeHandle } from '@nvidia-elements/core/resize-handle';
import '@nvidia-elements/core/resize-handle/define.js';

describe(ResizeHandle.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ResizeHandle;
  let input: HTMLInputElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <nve-resize-handle id="resize" name="resize"></nve-resize-handle>
      </form>
    `);
    element = fixture.querySelector(ResizeHandle.metadata.tag);
    input = element.shadowRoot.querySelector('input');
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('should define element', () => {
    expect(customElements.get(ResizeHandle.metadata.tag)).toBeDefined();
  });

  it('should proivide fallback aria-label', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('input').ariaLabel).toBe('resize');
  });

  it('should proivide custom aria-label', async () => {
    element.ariaLabel = 'custom resize';
    element.requestUpdate();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('input').ariaLabel).toBe('custom resize');
  });

  it('should reflect properties to inner range', async () => {
    element.min = 10;
    element.max = 90;
    element.valueAsNumber = 60;
    await elementIsStable(element);

    expect(input.min).toBe('10');
    expect(input.max).toBe('90');
    expect(input.value).toBe('60');
  });

  it('should emit a input event when range has input', async () => {
    input.valueAsNumber = 70;
    const event = untilEvent(element, 'input');
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await event;
    expect(element.valueAsNumber).toBe(70);
  });

  it('should emit a change event when range has change', async () => {
    input.valueAsNumber = 70;
    const event = untilEvent(element, 'change');
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await event;
    expect(element.valueAsNumber).toBe(70);
  });

  it('should set a form value when native input receives changes', async () => {
    await elementIsStable(element);
    const form = fixture.querySelector('form');
    expect(element.valueAsNumber).toBe(50);
    expect(Object.fromEntries(new FormData(form)).resize).toBe('50');

    const event = untilEvent(element, 'change');
    input.valueAsNumber = 70;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await event;
    expect(element.valueAsNumber).toBe(70);
    expect(Object.fromEntries(new FormData(form)).resize).toBe('70');
  });

  it('should set a form value when native input receives input', async () => {
    await elementIsStable(element);
    const form = fixture.querySelector('form');
    expect(element.valueAsNumber).toBe(50);
    expect(Object.fromEntries(new FormData(form)).resize).toBe('50');

    const event = untilEvent(element, 'input');
    input.valueAsNumber = 70;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await event;
    expect(element.valueAsNumber).toBe(70);
    expect(Object.fromEntries(new FormData(form)).resize).toBe('70');
  });

  it('should associate form reference', async () => {
    expect(element.form).toBe(fixture.querySelector('form'));
  });

  it('should support checkValidity', async () => {
    expect(element.checkValidity()).toBe(true);
  });

  it('should support reportValidity', async () => {
    expect(element.reportValidity()).toBe(true);
  });

  it('should support willValidate', async () => {
    expect(element.willValidate).toBe(true);
  });

  it('should support validationMessage', async () => {
    expect(element.validationMessage).toBe('');
  });

  it('should support validity state', async () => {
    expect(element.validity.tooLong).toBe(false);
    expect(element.validity.tooShort).toBe(false);
  });

  it('should activate with a temporary step and capture the pointer on pointerdown', () => {
    const setPointerCapture = vi.spyOn(element, 'setPointerCapture').mockImplementation(() => {});
    element.dispatchEvent(
      pointerEvent('pointerdown', { button: 0, clientX: 10, clientY: 20, isPrimary: true, pointerId: 3 })
    );

    expect(input.step).toBe('1');
    expect(element.matches(':state(active)')).toBe(true);
    expect(setPointerCapture).toHaveBeenCalledWith(3);
  });

  it('should ignore secondary and nonprimary pointerdown events', () => {
    [
      { button: 1, isPrimary: true, pointerId: 1 },
      { button: 0, isPrimary: false, pointerId: 2 }
    ].forEach(init => {
      element.dispatchEvent(pointerEvent('pointerdown', init));
      expect(input.step).toBe('10');
      expect(element.matches(':not(:state(active))')).toBe(true);
    });

    element.dispatchEvent(pointerEvent('pointerdown', { button: 0, isPrimary: true, pointerId: 3 }));
    expect(element.matches(':state(active)')).toBe(true);
  });

  it('should ignore pointer input before its internal range is ready', async () => {
    const pending = document.createElement(ResizeHandle.metadata.tag) as ResizeHandle;
    fixture.append(pending);

    expect(() =>
      pending.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }))
    ).not.toThrow();
    expect(pending.matches(':not(:state(active))')).toBe(true);

    await elementIsStable(pending);
    pending.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));
    expect(pending.matches(':state(active)')).toBe(true);
  });

  it('should ignore pointerup when no matching drag is active', () => {
    const changeListener = vi.fn();
    element.addEventListener('change', changeListener);

    element.dispatchEvent(pointerEvent('pointerup', { pointerId: 1 }));
    element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
    element.dispatchEvent(pointerEvent('pointerup', { pointerId: 3 }));

    expect(changeListener).not.toHaveBeenCalled();
    expect(input.step).toBe('1');
    expect(element.matches(':state(active)')).toBe(true);
  });

  it('should update horizontal values and dispatch input during drag', async () => {
    const inputEvent = untilEvent(element, 'input');
    const changeListener = vi.fn();
    element.addEventListener('change', changeListener);
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));
    const move = pointerEvent('pointermove', { clientX: 10, clientY: 10, pointerId: 1 });

    expect(element.dispatchEvent(move)).toBe(false);
    await inputEvent;

    expect(element.valueAsNumber).toBe(60);
    expect(changeListener).not.toHaveBeenCalled();
  });

  it('should clamp drag offsets and remain responsive at either boundary', async () => {
    element.min = 10;
    element.max = 90;
    await elementIsStable(element);
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));

    element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, clientY: -80, pointerId: 1 }));
    expect(element.valueAsNumber).toBe(90);

    element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, clientY: -70, pointerId: 1 }));
    expect(element.valueAsNumber).toBe(80);

    element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, clientY: 120, pointerId: 1 }));
    expect(element.valueAsNumber).toBe(10);

    element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, clientY: 110, pointerId: 1 }));
    expect(element.valueAsNumber).toBe(20);
  });

  it('should use horizontal movement for vertical orientation', async () => {
    element.orientation = 'vertical';
    await elementIsStable(element);
    const inputEvent = untilEvent(element, 'input');
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, clientY: 20, pointerId: 1 }));

    await inputEvent;

    expect(element.valueAsNumber).toBe(60);
  });

  it('should reverse drag movement in rtl direction', async () => {
    element.dir = 'rtl';
    const inputEvent = untilEvent(element, 'input');
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, clientY: 10, pointerId: 1 }));

    await inputEvent;

    expect(element.valueAsNumber).toBe(40);
  });

  it('should restore its step and dispatch a final change on pointerup', async () => {
    const changeEvent = untilEvent(element, 'change');
    const changeListener = vi.fn();
    element.addEventListener('change', changeListener);
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));
    element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, clientY: 10, pointerId: 1 }));
    element.dispatchEvent(pointerEvent('pointerup', { clientX: 10, clientY: 10, pointerId: 1 }));

    await changeEvent;

    expect(element.valueAsNumber).toBe(60);
    expect(input.step).toBe('10');
    expect(element.matches(':not(:state(active))')).toBe(true);
    expect(changeListener).toHaveBeenCalledOnce();
  });

  it('should restore drag state after a matching pointercancel and support subsequent drags', async () => {
    element.step = 5;
    await elementIsStable(element);
    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 1 }));
    element.dispatchEvent(pointerEvent('pointercancel', { pointerId: 1 }));

    expect(input.step).toBe('5');
    expect(element.matches(':not(:state(active))')).toBe(true);

    element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, clientY: 20, pointerId: 2 }));
    expect(element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, clientY: 10, pointerId: 2 }))).toBe(false);
    expect(element.valueAsNumber).toBe(60);
  });

  it('should support snap to value on double click', async () => {
    element.min = 10;
    element.max = 90;
    element.valueAsNumber = 40;
    await elementIsStable(element);

    const event = untilEvent(element, 'input');
    element.dispatchEvent(new Event('dblclick', { bubbles: true }));
    await event;
    expect(element.valueAsNumber).toBe(10);
    expect(element.value).toBe(10);

    const event2 = untilEvent(element, 'input');
    element.dispatchEvent(new Event('dblclick', { bubbles: true }));
    await event2;
    expect(element.valueAsNumber).toBe(90);
    expect(element.value).toBe(90);
  });

  it('should allow prevent default on dblclick and not change value', async () => {
    expect(element.valueAsNumber).toBe(50);

    element.addEventListener('toggle', e => {
      e.preventDefault();
    });

    const event = untilEvent(element, 'toggle');
    element.dispatchEvent(new Event('dblclick', { bubbles: true, cancelable: true }));
    expect((await event)?.defaultPrevented).toBe(true);
    expect(element.valueAsNumber).toBe(50);
  });
});

function pointerEvent(type: string, init: PointerEventInit): PointerEvent {
  return new PointerEvent(type, { bubbles: true, buttons: 1, cancelable: true, isPrimary: true, ...init });
}
