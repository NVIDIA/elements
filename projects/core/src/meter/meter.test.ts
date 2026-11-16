// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Meter } from '@nvidia-elements/core/meter';
import '@nvidia-elements/core/meter/define.js';

// Exercise server-only sizing alongside browser rendering; meter-group tests cover normal browser mode.
vi.mock('lit-html/is-server.js', () => ({ isServer: true }));

describe(Meter.metadata.tag, () => {
  let fixture: HTMLElement;
  let meter: Meter;
  const fill = () => meter.shadowRoot!.querySelector<HTMLElement>('.fill')!;
  const track = () => meter.shadowRoot!.querySelector<HTMLElement>('[internal-host]')!;

  beforeEach(async () => {
    fixture = await createFixture(html`<nve-meter aria-label="Storage" style="width: 400px"></nve-meter>`);
    meter = fixture.querySelector('nve-meter')!;
    await elementIsStable(meter);
  });

  afterEach(() => removeFixture(fixture));

  it('should define a read-only meter with default bounds', () => {
    expect(customElements.get('nve-meter')).toBe(Meter);
    expect([meter.value, meter.min, meter.max]).toEqual([0, 0, 100]);
    expect(meter._internals.role).toBe('meter');
    expect(meter.tabIndex).toBe(-1);
    expect(fill().getBoundingClientRect().width).toBe(0);
  });

  it('should expose the same numeric scale that it paints', async () => {
    meter.setAttribute('value', '58');
    meter.max = 128;
    await elementIsStable(meter);
    expect(meter._internals.ariaValueNow).toBe('58');
    expect(meter._internals.ariaValueMin).toBe('0');
    expect(meter._internals.ariaValueMax).toBe('128');
    expect(fill().getBoundingClientRect().width).toBeCloseTo((400 * 58) / 128, 1);
    expect(meter.hasAttribute('max')).toBe(false);
  });

  it('should use the minimum as the fill origin', async () => {
    meter.min = 10;
    meter.max = 110;
    meter.value = 30;
    await elementIsStable(meter);
    expect(fill().getBoundingClientRect().width).toBeCloseTo(80);
    expect(meter._internals.ariaValueNow).toBe('30');
    expect(meter._internals.ariaValueMin).toBe('10');
  });

  it('should clamp accessible values without overwriting consumer properties', async () => {
    meter.min = 20;
    meter.max = 10;
    meter.value = 50;
    await elementIsStable(meter);
    expect([meter.value, meter.min, meter.max]).toEqual([50, 20, 10]);
    expect(meter._internals.ariaValueNow).toBe('20');
    expect(meter._internals.ariaValueMax).toBe('20');
    expect(fill().getBoundingClientRect().width).toBe(0);
  });

  it('should use finite defaults for malformed attributes', async () => {
    meter.setAttribute('value', 'invalid');
    meter.setAttribute('min', '-Infinity');
    meter.setAttribute('max', 'NaN');
    await elementIsStable(meter);
    expect(meter._internals.ariaValueNow).toBe('0');
    expect(meter._internals.ariaValueMin).toBe('0');
    expect(meter._internals.ariaValueMax).toBe('100');
  });

  it.each([
    {
      name: 'below the minimum',
      min: 20,
      max: 100,
      value: -10,
      effectiveMin: 20,
      effectiveMax: 100,
      effectiveValue: 20,
      width: 0
    },
    {
      name: 'above the maximum',
      min: 20,
      max: 100,
      value: 150,
      effectiveMin: 20,
      effectiveMax: 100,
      effectiveValue: 100,
      width: 400
    },
    {
      name: 'negative range',
      min: -100,
      max: -20,
      value: -80,
      effectiveMin: -100,
      effectiveMax: -20,
      effectiveValue: -80,
      width: 100
    },
    {
      name: 'fractional range',
      min: 0.5,
      max: 2.5,
      value: 1.25,
      effectiveMin: 0.5,
      effectiveMax: 2.5,
      effectiveValue: 1.25,
      width: 150
    },
    {
      name: 'equal bounds',
      min: 10,
      max: 10,
      value: 50,
      effectiveMin: 10,
      effectiveMax: 10,
      effectiveValue: 10,
      width: 0
    },
    ...[NaN, Infinity, -Infinity].map(value => ({
      name: `non-finite value ${value}`,
      min: 20,
      max: 100,
      value,
      effectiveMin: 20,
      effectiveMax: 100,
      effectiveValue: 20,
      width: 0
    })),
    ...[NaN, Infinity, -Infinity].map(min => ({
      name: `non-finite minimum ${min}`,
      min,
      max: 100,
      value: 25,
      effectiveMin: 0,
      effectiveMax: 100,
      effectiveValue: 25,
      width: 100
    })),
    ...[NaN, Infinity, -Infinity].map(max => ({
      name: `non-finite maximum ${max}`,
      min: 20,
      max,
      value: 40,
      effectiveMin: 20,
      effectiveMax: 100,
      effectiveValue: 40,
      width: 100
    }))
  ])(
    'should keep the painted and accessible scale consistent for $name',
    async ({ min, max, value, effectiveMin, effectiveMax, effectiveValue, width }) => {
      meter.min = min;
      meter.max = max;
      meter.value = value;
      await elementIsStable(meter);

      expect(meter._internals.ariaValueMin).toBe(String(effectiveMin));
      expect(meter._internals.ariaValueMax).toBe(String(effectiveMax));
      expect(meter._internals.ariaValueNow).toBe(String(effectiveValue));
      expect(fill().getBoundingClientRect().width).toBeCloseTo(width, 1);
      expect([meter.min, meter.max, meter.value]).toEqual([min, max, value]);
      expect(['min', 'max', 'value'].some(attribute => meter.hasAttribute(attribute))).toBe(false);
    }
  );

  it('should recover the supplied value when bounds expand after clamping or collapsing', async () => {
    meter.value = 75;
    meter.max = 50;
    await elementIsStable(meter);
    expect(meter._internals.ariaValueNow).toBe('50');
    expect(fill().getBoundingClientRect().width).toBe(400);

    meter.min = 100;
    await elementIsStable(meter);
    expect(meter._internals.ariaValueMin).toBe('100');
    expect(meter._internals.ariaValueMax).toBe('100');
    expect(meter._internals.ariaValueNow).toBe('100');
    expect(fill().getBoundingClientRect().width).toBe(0);

    meter.min = 0;
    meter.max = 100;
    await elementIsStable(meter);
    expect(meter.value).toBe(75);
    expect(meter._internals.ariaValueMin).toBe('0');
    expect(meter._internals.ariaValueMax).toBe('100');
    expect(meter._internals.ariaValueNow).toBe('75');
    expect(fill().getBoundingClientRect().width).toBe(300);
  });

  it('should preserve consumer accessibility text without announcements or change events', async () => {
    const changed = vi.fn();
    meter.addEventListener('change', changed);
    meter.setAttribute('aria-valuetext', 'Storage nearly full');
    meter.setAttribute('aria-describedby', 'description');
    meter.status = 'warning';
    meter.value = 95;
    await elementIsStable(meter);
    expect(meter.getAttribute('aria-label')).toBe('Storage');
    expect(meter.getAttribute('aria-valuetext')).toBe('Storage nearly full');
    expect(meter.getAttribute('aria-describedby')).toBe('description');
    expect(meter._internals.role).toBe('meter');
    expect(meter._internals.ariaLive).toBeNull();
    expect(changed).not.toHaveBeenCalled();
  });

  it('should prioritize CSS overrides, then palette, then status, then default fill', async () => {
    meter.value = 50;
    await elementIsStable(meter);
    const defaultColor = getComputedStyle(fill()).backgroundColor;
    meter.status = 'danger';
    await elementIsStable(meter);
    const statusColor = getComputedStyle(fill()).backgroundColor;
    expect(statusColor).not.toBe(defaultColor);
    meter.color = 'blue-cobalt';
    await elementIsStable(meter);
    const paletteColor = getComputedStyle(fill()).backgroundColor;
    expect(paletteColor).not.toBe(statusColor);
    expect(meter.getAttribute('color')).toBe('blue-cobalt');
    expect(meter.getAttribute('status')).toBe('danger');
    meter.style.setProperty('--accent-color', 'rgb(90, 30, 120)');
    expect(getComputedStyle(fill()).backgroundColor).toBe('rgb(90, 30, 120)');
    meter.style.removeProperty('--accent-color');
    expect(getComputedStyle(fill()).backgroundColor).toBe(paletteColor);
    meter.color = undefined;
    await elementIsStable(meter);
    expect(getComputedStyle(fill()).backgroundColor).toBe(statusColor);
    meter.status = undefined;
    await elementIsStable(meter);
    expect(getComputedStyle(fill()).backgroundColor).toBe(defaultColor);
  });

  it('should support track customization and RTL fill direction', async () => {
    meter.style.setProperty('--height', '12px');
    meter.style.setProperty('--background', 'rgb(220, 220, 220)');
    meter.dir = 'rtl';
    meter.value = 25;
    await elementIsStable(meter);
    expect(track().getBoundingClientRect().height).toBe(12);
    expect(getComputedStyle(track()).backgroundColor).toBe('rgb(220, 220, 220)');
    expect(fill().getBoundingClientRect().right).toBe(track().getBoundingClientRect().right);
  });
});

describe('nve-meter server lifecycle', () => {
  it('should provide an empty segment size without consumer styles', () => {
    const meter = new Meter();

    meter.willUpdate();

    expect(meter.style.getPropertyValue('--_meter-segment-size')).toBe('0%');
  });

  it.each([
    { name: 'offset range', min: 10, max: 110, value: 35, percent: 25 },
    { name: 'below minimum', min: 10, max: 110, value: -10, percent: 0 },
    { name: 'above maximum', min: 10, max: 110, value: 150, percent: 100 },
    { name: 'collapsed range', min: 20, max: 10, value: 50, percent: 0 },
    { name: 'non-finite value', min: 20, max: 100, value: NaN, percent: 0 }
  ])('should size $name and preserve consumer styles', ({ min, max, value, percent }) => {
    const meter = new Meter();
    meter.min = min;
    meter.max = max;
    meter.value = value;
    meter.style.setProperty('width', '400px');
    meter.style.setProperty('--accent-color', 'rebeccapurple');

    meter.willUpdate();

    expect(meter.style.getPropertyValue('--_meter-segment-size')).toBe(`${percent}%`);
    expect(meter.style.width).toBe('400px');
    expect(meter.style.getPropertyValue('--accent-color')).toBe('rebeccapurple');
    expect([meter.min, meter.max, meter.value]).toEqual([min, max, value]);
  });
});
