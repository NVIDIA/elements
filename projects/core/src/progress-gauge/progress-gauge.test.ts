// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { ProgressGauge } from '@nvidia-elements/core/progress-gauge';
import '@nvidia-elements/core/progress-gauge/define.js';

describe(ProgressGauge.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ProgressGauge;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-progress-gauge></nve-progress-gauge>
    `);
    element = fixture.querySelector(ProgressGauge.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(ProgressGauge.metadata.tag)).toBeDefined();
  });

  it('should set aria attributes', async () => {
    element.value = 50;
    element.max = 80;
    await elementIsStable(element);

    expect(element._internals.role).toBe('progressbar');
    expect(element._internals.ariaValueNow).toBe('50');
    expect(element._internals.ariaValueMax).toBe('80');
    expect(element._internals.ariaLabel).toBe('information');

    element.status = 'success';
    await elementIsStable(element);
    expect(element._internals.ariaLabel).toBe('success');
  });

  it('should default to neutral status', () => {
    expect(element.status).toBe('neutral');
  });

  it('should default to the 270-degree container', () => {
    expect(element.container).toBeUndefined();
  });

  it('should default max to 100', () => {
    expect(element.max).toBe(100);
  });

  it('should default value to 0', () => {
    expect(element.value).toBe(0);
  });

  it('should default gauge width to 12px', () => {
    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;

    expect(getComputedStyle(gauge).strokeWidth).toBe('12px');
  });

  it.each([
    ['default', undefined, '128px'],
    ['sm', 'sm', '96px'],
    ['md', 'md', '128px'],
    ['lg', 'lg', '160px']
  ] as const)('should set %s width', async (_, size, width) => {
    if (size) {
      element.size = size;
    }

    await elementIsStable(element);

    expect(getComputedStyle(element).width).toBe(width);
  });

  it('should scale slotted text with size', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <div>
        <nve-progress-gauge size="sm"><span data-size="sm">50%</span></nve-progress-gauge>
        <nve-progress-gauge size="md"><span data-size="md">50%</span></nve-progress-gauge>
        <nve-progress-gauge size="lg"><span data-size="lg">50%</span></nve-progress-gauge>
      </div>
    `);

    const gauges = Array.from(fixture.querySelectorAll(ProgressGauge.metadata.tag)) as ProgressGauge[];
    await Promise.all(gauges.map(gauge => elementIsStable(gauge)));

    const fontSizes = ['sm', 'md', 'lg'].map(size =>
      parseFloat(getComputedStyle(fixture.querySelector(`[data-size="${size}"]`) as HTMLElement).fontSize)
    );

    expect(fontSizes[0]).toBeLessThan(fontSizes[1]);
    expect(fontSizes[1]).toBeLessThan(fontSizes[2]);
  });

  it('should not apply the status color to slotted text', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-progress-gauge status="danger" value="50">
        <span>50%</span>
      </nve-progress-gauge>
    `);
    element = fixture.querySelector(ProgressGauge.metadata.tag);
    await elementIsStable(element);

    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;
    const text = fixture.querySelector('span') as HTMLSpanElement;

    expect(getComputedStyle(text).color).not.toBe(getComputedStyle(gauge).stroke);
  });

  it.each(['warning', 'success', 'danger'] as const)(
    'should leave the default slot empty for %s status',
    async status => {
      element.status = status;
      await elementIsStable(element);

      const defaultSlot = element.shadowRoot.querySelector('slot:not([name])') as HTMLSlotElement;
      expect(defaultSlot.childElementCount).toBe(0);
      expect(defaultSlot.textContent.trim()).toBe('');
    }
  );

  it('should render default state as determinate 0 progress', async () => {
    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;

    expect(gauge.getAttribute('stroke-dasharray')).toBe('0 100');
  });

  it('should suppress rounded foreground caps when progress is 0', async () => {
    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;

    expect(gauge.hasAttribute('empty')).toBe(true);
    expect(getComputedStyle(gauge).strokeLinecap).toBe('butt');

    element.value = 1;
    await elementIsStable(element);

    expect(gauge.hasAttribute('empty')).toBe(false);
    expect(getComputedStyle(gauge).strokeLinecap).toBe('round');
  });

  it('should animate progress on initial render and value changes', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-progress-gauge value="50"></nve-progress-gauge>
    `);
    element = fixture.querySelector(ProgressGauge.metadata.tag);
    await elementIsStable(element);

    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;

    expect(gauge.style.getPropertyValue('--_progress')).toBe('50');
    expect(getComputedStyle(gauge).animationName).toBe('gauge-progress-in');
    expect(getComputedStyle(gauge).transitionProperty).toBe('stroke-dasharray');

    element.value = 75;
    await elementIsStable(element);

    expect(gauge.style.getPropertyValue('--_progress')).toBe('75');
    expect(gauge.getAttribute('stroke-dasharray')).toBe('75 100');
  });

  it('should render a 270-degree inset arc with rounded ends by default', async () => {
    element.value = 50;
    await elementIsStable(element);

    const svg = element.shadowRoot.querySelector('svg') as SVGElement;
    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;

    expect(svg.getAttribute('viewBox')).toBe('0 0 128 128');
    expect(gauge.getAttribute('d')).toBe('M 27.23 100.77 A 52 52 0 1 1 100.77 100.77');
    expect(getComputedStyle(gauge).strokeLinecap).toBe('round');
    expect(getComputedStyle(element).height).toBe('128px');
  });

  it('should render the half container with the semi-circular arc', async () => {
    element.container = 'half';
    element.value = 50;
    await elementIsStable(element);

    const svg = element.shadowRoot.querySelector('svg') as SVGElement;
    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;

    expect(element.getAttribute('container')).toBe('half');
    expect(svg.getAttribute('viewBox')).toBe('0 0 128 64');
    expect(gauge.getAttribute('d')).toBe('M 12 64 A 52 52 0 0 1 116 64');
    expect(getComputedStyle(gauge).strokeLinecap).toBe('round');
    expect(getComputedStyle(element).height).toBe('64px');
  });

  it('should assign slotted content to the default slot', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-progress-gauge status="warning">
        <span>50%</span>
      </nve-progress-gauge>
    `);
    element = fixture.querySelector(ProgressGauge.metadata.tag);
    await elementIsStable(element);

    const defaultSlot = element.shadowRoot.querySelector('slot:not([name])') as HTMLSlotElement;
    const assigned = defaultSlot.assignedElements();
    expect(assigned).toHaveLength(1);
    expect(assigned[0]).toBe(fixture.querySelector('span'));
  });

  it('should set stroke-dasharray to 0 100 when value is 0', async () => {
    element.value = 0;
    await elementIsStable(element);

    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;
    expect(gauge.getAttribute('stroke-dasharray')).toBe('0 100');
  });

  it('should default stroke-dasharray scaling when max is omitted', async () => {
    element.value = 50;
    element.max = undefined;
    await elementIsStable(element);

    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;
    expect(gauge.getAttribute('stroke-dasharray')).toBe('50 100');
  });

  it('should scale stroke-dasharray with a custom max', async () => {
    element.value = 5;
    element.max = 20;
    await elementIsStable(element);

    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;
    expect(gauge.getAttribute('stroke-dasharray')).toBe('25 100');
  });

  it('should clamp over-max values', async () => {
    element.value = 150;
    element.max = 100;
    await elementIsStable(element);

    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;
    expect(gauge.getAttribute('stroke-dasharray')).toBe('100 100');
    expect(element._internals.ariaValueNow).toBe('100');
    expect(element._internals.ariaValueMax).toBe('100');
  });

  it.each([
    { name: 'NaN value', value: Number.NaN, max: 100, dasharray: '0 100', ariaValueNow: '0', ariaValueMax: '100' },
    { name: 'negative value', value: -1, max: 100, dasharray: '0 100', ariaValueNow: '0', ariaValueMax: '100' },
    { name: 'NaN max', value: 50, max: Number.NaN, dasharray: '50 100', ariaValueNow: '50', ariaValueMax: '100' },
    { name: 'zero max', value: 50, max: 0, dasharray: '50 100', ariaValueNow: '50', ariaValueMax: '100' },
    { name: 'negative max', value: 50, max: -1, dasharray: '50 100', ariaValueNow: '50', ariaValueMax: '100' }
  ])('should normalize $name', async ({ value, max, dasharray, ariaValueNow, ariaValueMax }) => {
    element.value = value;
    element.max = max;
    await elementIsStable(element);

    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;
    expect(gauge.getAttribute('stroke-dasharray')).toBe(dasharray);
    expect(element._internals.ariaValueNow).toBe(ariaValueNow);
    expect(element._internals.ariaValueMax).toBe(ariaValueMax);
  });
});
