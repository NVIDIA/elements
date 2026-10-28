// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { ProgressiveFilterChip } from '@nvidia-elements/core/progressive-filter-chip';
import { IconButton } from '@nvidia-elements/core/icon-button';
import { Button } from '@nvidia-elements/core/button';
import { Select } from '@nvidia-elements/core/select';
import { Input } from '@nvidia-elements/core/input';
import { Date } from '@nvidia-elements/core/date';
import '@nvidia-elements/core/progressive-filter-chip/define.js';
import '@nvidia-elements/core/forms/define.js';
import '@nvidia-elements/core/input/define.js';
import '@nvidia-elements/core/select/define.js';
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/color/define.js';

describe(ProgressiveFilterChip.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ProgressiveFilterChip;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progressive-filter-chip>
        <select>
          <option value="1">option 1</option>
          <option value="2">option 2</option>
        </select>
        <input type="text" value="text value" />
        <input type="date" value="2021-01-01" />
      </nve-progressive-filter-chip>
    `);
    element = fixture.querySelector(ProgressiveFilterChip.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ProgressiveFilterChip.metadata.tag)).toBeDefined();
  });

  it('should render close button when closable', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBeTruthy();
  });

  it('should apply proper aria label for close button', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    element.closable = true;
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag).ariaLabel).toBe('close');
  });

  it('should trigger close event when close button clicked', async () => {
    expect(element.shadowRoot.querySelector(IconButton.metadata.tag)).toBe(null);
    element.closable = true;
    await elementIsStable(element);

    const event = untilEvent(element, 'close');
    element.shadowRoot.querySelector<IconButton>(IconButton.metadata.tag).click();
    expect(await event).toBeDefined();
  });

  it('should render a nve-select when a select is slotted', () => {
    expect(element.shadowRoot.querySelector(Select.metadata.tag)).toBeTruthy();
  });

  it('should render a nve-input when a text input is slotted', () => {
    expect(element.shadowRoot.querySelector(Input.metadata.tag)).toBeTruthy();
  });

  it('should render a nve-date when a date input is slotted', () => {
    expect(element.shadowRoot.querySelector(Date.metadata.tag)).toBeTruthy();
  });

  it('should use a plain slot when a custom input is slotted', async () => {
    element.querySelector('select').remove();
    element.querySelector('[type=text]').remove();
    element.querySelector('[type=date]').remove();
    element.appendChild(document.createElement(Button.metadata.tag));
    await elementIsStable(element);

    expect(element.shadowRoot.querySelector(Select.metadata.tag)).toBe(null);
    expect(element.shadowRoot.querySelector(Input.metadata.tag)).toBe(null);
    expect(element.shadowRoot.querySelector(Date.metadata.tag)).toBe(null);
    expect(element.shadowRoot.querySelector('slot').name).toBe(element.querySelector(Button.metadata.tag).slot);
  });

  it('should remove item when slot is empty', async () => {
    element.querySelector('select').remove();
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector(Select.metadata.tag)).toBe(null);
  });

  it.each(['number', 'text'])('should preserve fit-text %s input width alongside other controls', async type => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <div style="width: 450px; display: flex; align-items: center; gap: 4px;">
        <span>When value</span>
        <nve-progressive-filter-chip closable style="width: 100%;">
          <nve-select fit-content>
            <select aria-label="condition">
              <option>Is anything</option>
              <option selected>Is less than</option>
              <option>Is greater than</option>
            </select>
          </nve-select>
          <nve-input fit-text>
            <input type=${type} value="50" aria-label="Conditional Value" />
          </nve-input>
          <nve-button readonly>Show as</nve-button>
          <nve-color>
            <input type="color" value="#ffef11" aria-label="Select conditional color" />
          </nve-color>
        </nve-progressive-filter-chip>
      </div>
      <nve-input fit-text style="--font-weight: var(--nve-ref-font-weight-medium);">
        <input type=${type} value="50" aria-label="Standalone value" />
      </nve-input>
    `);
    element = fixture.querySelector(ProgressiveFilterChip.metadata.tag);
    await elementIsStable(element);
    const inputs = fixture.querySelectorAll<Input>('nve-input');
    await Promise.all(Array.from(inputs, control => elementIsStable(control)));
    await new Promise(resolve => requestAnimationFrame(resolve));

    const input = inputs[0].querySelector('input');
    const standaloneInput = inputs[1].querySelector('input');
    expect(input.getBoundingClientRect().width).toBeCloseTo(standaloneInput.getBoundingClientRect().width, 0);

    const initialWidth = input.getBoundingClientRect().width;
    input.value = standaloneInput.value = '1234567890';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    standaloneInput.dispatchEvent(new Event('input', { bubbles: true }));
    await Promise.all(Array.from(inputs, control => elementIsStable(control)));
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(input.getBoundingClientRect().width).toBeGreaterThan(initialWidth);
    expect(input.getBoundingClientRect().width).toBeCloseTo(standaloneInput.getBoundingClientRect().width, 0);
    expect(inputs[0].getBoundingClientRect().width).toBeGreaterThanOrEqual(input.getBoundingClientRect().width);

    inputs[0].style.setProperty('--max-width', '80px');
    input.value = '123456789012345678901234567890';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await elementIsStable(inputs[0]);
    await new Promise(resolve => requestAnimationFrame(resolve));

    expect(inputs[0].getBoundingClientRect().width).toBeLessThanOrEqual(80);
    expect(input.getBoundingClientRect().width).toBeLessThanOrEqual(80);
  });

  it('should only update options if valid element is slotted', async () => {
    const el = document.createElement('div');
    element.appendChild(el);
    await elementIsStable(element);
    expect(element['inputs'].length).toBe(3);
  });
});
