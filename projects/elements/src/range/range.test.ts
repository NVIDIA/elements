// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { Range } from '@nvidia-elements/core/range';
import '@nvidia-elements/core/range/define.js';

describe(Range.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Range;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-range>
        <label>label</label>
        <input type="range" value="50" />
      </nve-range>
    `);
    element = fixture.querySelector(Range.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Range.metadata.tag)).toBeDefined();
  });

  it('should set the custom track width', async () => {
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--track-width')).toBe('0.5');
  });

  it('should update the custom track width', async () => {
    element.querySelector('input').value = '99';
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--track-width')).toBe('0.99');
  });

  it('should update the custom track width with custom min/max', async () => {
    element.input.min = '20';
    element.input.max = '80';
    element.querySelector('input').value = '66';
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--track-width')).toBe('0.76');
  });

  it('should update the custom track width when input changes', async () => {
    element.querySelector('input').value = '50';
    await elementIsStable(element);
    element.querySelector('input').dispatchEvent(new Event('input'));
    expect(element.style.getPropertyValue('--track-width')).toBe('0.5');
  });

  it('should update support decimals', async () => {
    element.input.min = '0.1';
    element.input.max = '0.9';
    element.querySelector('input').value = '0.7';
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--track-width')).toBe('0.74');
  });

  it('should properly render datalist ticks', async () => {
    // Create a new fixture with datalist
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-range>
        <label>label</label>
        <input type="range" value="50" />
        <datalist>
          <option value="0">0</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </datalist>
      </nve-range>
    `);
    element = fixture.querySelector(Range.metadata.tag);
    await elementIsStable(element);

    const ticks = element.shadowRoot.querySelectorAll('.datalist-tick');
    expect(ticks.length).toBe(3);
    expect(ticks[1].textContent).toBe('50');
    expect(ticks[1].style.left).toBe('50%');
  });

  it('should default orientation to horizontal', async () => {
    expect(element.orientation).toBe('horizontal');
    expect(element.getAttribute('orientation')).toBe('horizontal');
  });

  it('should set aria-orientation to horizontal by default', async () => {
    expect(element._internals.ariaOrientation).toBe('horizontal');
  });

  it('should reflect orientation attribute', async () => {
    element.orientation = 'vertical';
    await elementIsStable(element);
    expect(element.getAttribute('orientation')).toBe('vertical');
  });

  it('should update aria-orientation when orientation changes', async () => {
    element.orientation = 'vertical';
    await elementIsStable(element);
    expect(element._internals.ariaOrientation).toBe('vertical');
  });

  it('should set track width in vertical mode', async () => {
    element.orientation = 'vertical';
    element.querySelector('input').value = '50';
    await elementIsStable(element);
    expect(element.style.getPropertyValue('--track-width')).toBe('0.5');
  });

  it('should position datalist ticks with bottom for vertical orientation', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-range orientation="vertical" style="height: 200px">
        <label>label</label>
        <input type="range" value="50" />
        <datalist>
          <option value="0">0</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </datalist>
      </nve-range>
    `);
    element = fixture.querySelector(Range.metadata.tag);
    await elementIsStable(element);

    const ticks = element.shadowRoot.querySelectorAll('.datalist-tick');
    expect(ticks.length).toBe(3);
    expect(ticks[1].style.bottom).toBe('50%');
  });
});
