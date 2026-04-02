// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
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

  it('should support touch start event states', async () => {
    const event = untilEvent(element, 'nve-touch-start');
    element.dispatchEvent(new CustomEvent('nve-touch-start'));
    await event;
    expect(input.step).toBe('1');
    expect(element.matches(':state(active)'));
  });

  it('should support touch end event states', async () => {
    const event = untilEvent(element, 'nve-touch-end');
    element.dispatchEvent(new CustomEvent('nve-touch-end'));
    await event;
    expect(input.step).toBe('10');
    expect(element.matches(':not(:state(active))'));
  });

  it('should support touch move event states', async () => {
    const event = untilEvent(element, 'nve-touch-move');
    element.dispatchEvent(new CustomEvent('nve-touch-move'));
    await event;
    await new Promise(r => requestAnimationFrame(r));

    expect(element.valueAsNumber).toBe(50);
  });

  it('should support touch move event states for vertical orientation', async () => {
    element.orientation = 'vertical';
    await elementIsStable(element);

    const event = untilEvent(element, 'nve-touch-move');
    element.dispatchEvent(new CustomEvent('nve-touch-move'));
    await event;
    await new Promise(r => requestAnimationFrame(r));

    expect(element.valueAsNumber).toBe(50);
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
