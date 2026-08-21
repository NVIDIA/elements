// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { createFixture, removeFixture, elementIsStable } from '@internals/testing';
import { Gauge } from '@nvidia-elements/core/gauge';
import '@nvidia-elements/core/gauge/define.js';

describe(Gauge.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Gauge;

  const renderedProgress = () => {
    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;
    const background = element.shadowRoot.querySelector('.background') as SVGPathElement;
    return gauge.getTotalLength() / background.getTotalLength();
  };

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-gauge></nve-gauge>
    `);
    element = fixture.querySelector(Gauge.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should define element', () => {
    expect(customElements.get(Gauge.metadata.tag)).toBeDefined();
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

  it.each([
    ['neutral', 'information'],
    ['accent', 'information'],
    ['warning', 'warning'],
    ['success', 'success'],
    ['danger', 'danger']
  ] as const)('should set the %s status aria label', async (status, label) => {
    element.status = status;
    await elementIsStable(element);

    expect(element._internals.ariaLabel).toBe(label);
  });

  it('should use custom i18n strings for the status aria label', async () => {
    element.i18n = { success: 'complete' };
    element.status = 'success';
    await elementIsStable(element);

    expect(element._internals.ariaLabel).toBe('complete');
  });

  it('should not use custom neutral i18n strings for the neutral aria label', async () => {
    element.i18n = { neutral: 'custom neutral', information: 'custom information' };
    element.status = 'neutral';
    await elementIsStable(element);

    expect(element._internals.ariaLabel).toBe('custom information');
  });

  it('should default to neutral status', () => {
    expect(element.status).toBe('neutral');
  });

  it('should default to the 270-degree shape', () => {
    expect(element.shape).toBeUndefined();
  });

  it('should default to the fill thumb', () => {
    expect(element.thumb).toBe('fill');
  });

  it('should default max to 100', () => {
    expect(element.max).toBe(100);
  });

  it('should default value to 0', () => {
    expect(element.value).toBe(0);
  });

  it('should default track width to 8px', () => {
    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;

    expect(getComputedStyle(gauge).strokeWidth).toBe('8px');
  });

  it('should support css backgrounds for the track and thumb', async () => {
    element.value = 50;
    element.thumb = 'dot';
    element.style.setProperty('--background', 'linear-gradient(90deg, red, blue)');
    element.style.setProperty('--track-background', 'transparent');
    element.style.setProperty('--thumb-background', 'rgb(1, 2, 3)');
    await elementIsStable(element);

    const background = element.shadowRoot.querySelector('.background-surface') as HTMLElement;
    const fill = element.shadowRoot.querySelector('.fill-surface') as HTMLElement;
    const dot = element.shadowRoot.querySelector('.fill-dot-end:not([hidden])') as SVGCircleElement;

    expect(getComputedStyle(background).backgroundImage).toContain('linear-gradient');
    expect(getComputedStyle(fill).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(getComputedStyle(dot).fill).toBe('rgb(1, 2, 3)');
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
        <nve-gauge size="sm"><span data-size="sm">50%</span></nve-gauge>
        <nve-gauge size="md"><span data-size="md">50%</span></nve-gauge>
        <nve-gauge size="lg"><span data-size="lg">50%</span></nve-gauge>
      </div>
    `);

    const gauges = Array.from(fixture.querySelectorAll(Gauge.metadata.tag)) as Gauge[];
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
      <nve-gauge status="danger" value="50">
        <span>50%</span>
      </nve-gauge>
    `);
    element = fixture.querySelector(Gauge.metadata.tag);
    await elementIsStable(element);

    const fill = element.shadowRoot.querySelector('.fill-surface') as HTMLElement;
    const text = fixture.querySelector('span') as HTMLSpanElement;

    expect(getComputedStyle(text).color).not.toBe(getComputedStyle(fill).backgroundColor);
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

    expect(gauge.getTotalLength()).toBe(0);
  });

  it('should hide fill progress when progress is 0', async () => {
    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;
    const fill = element.shadowRoot.querySelector('.fill-layer') as SVGElement;

    expect(gauge.hasAttribute('empty')).toBe(true);
    expect(getComputedStyle(gauge).strokeLinecap).toBe('round');
    expect(fill.hasAttribute('hidden')).toBe(true);

    element.value = 1;
    await elementIsStable(element);

    expect(gauge.hasAttribute('empty')).toBe(false);
    expect(getComputedStyle(gauge).strokeLinecap).toBe('round');
    expect(fill.hasAttribute('hidden')).toBe(false);
  });

  it('should render fill progress with native round caps', async () => {
    element.value = 50;
    await elementIsStable(element);

    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;
    const endDot = element.shadowRoot.querySelector('.fill-dot-end') as SVGCircleElement;

    expect(getComputedStyle(gauge).strokeLinecap).toBe('round');
    expect(endDot.hasAttribute('hidden')).toBe(false);
    expect(parseFloat(getComputedStyle(endDot).r) * 2).toBeLessThan(parseFloat(getComputedStyle(gauge).strokeWidth));
  });

  it('should update progress and the end dot when value changes', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-gauge value="50"></nve-gauge>
    `);
    element = fixture.querySelector(Gauge.metadata.tag);
    await elementIsStable(element);

    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;
    const dot = element.shadowRoot.querySelector('.fill-dot-end') as SVGCircleElement;
    const initialPath = gauge.getAttribute('d');

    expect(renderedProgress()).toBeCloseTo(0.5, 2);
    expect(dot.style.getPropertyValue('--_dot-angle')).toBe('270deg');
    expect(getComputedStyle(gauge).animationName).toBe('none');
    expect(getComputedStyle(dot).animationName).toBe('none');

    element.value = 75;
    await elementIsStable(element);

    expect(gauge.getAttribute('d')).not.toBe(initialPath);
    expect(renderedProgress()).toBeCloseTo(0.75, 2);
    expect(dot.style.getPropertyValue('--_dot-angle')).toBe('337.5deg');
  });

  it('should align the end dot with the fill path at low values', async () => {
    element.value = 12;
    await elementIsStable(element);

    const dot = element.shadowRoot.querySelector('.fill-dot-end') as SVGCircleElement;
    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;
    const fillEnd = gauge.getPointAtLength(gauge.getTotalLength());
    const fillEndScreen = new DOMPoint(fillEnd.x, fillEnd.y).matrixTransform(gauge.getScreenCTM());
    const dotCenterScreen = new DOMPoint(dot.cx.baseVal.value, dot.cy.baseVal.value).matrixTransform(
      dot.getScreenCTM()
    );

    expect(dot.tagName).toBe('circle');
    expect(dot.style.getPropertyValue('--_dot-angle')).toBe('167.4deg');
    expect(renderedProgress()).toBeCloseTo(0.12, 2);
    expect(fillEndScreen.x).toBeCloseTo(dotCenterScreen.x, 3);
    expect(fillEndScreen.y).toBeCloseTo(dotCenterScreen.y, 3);
  });

  it.each([
    { thumb: 'fill', fillHidden: false, endDotHidden: false, needleHidden: true },
    { thumb: 'dot', fillHidden: true, endDotHidden: false, needleHidden: true },
    { thumb: 'needle', fillHidden: true, endDotHidden: true, needleHidden: false }
  ] as const)('should render the $thumb thumb', async ({ thumb, fillHidden, endDotHidden, needleHidden }) => {
    element.value = 50;
    element.thumb = thumb;
    await elementIsStable(element);

    const fill = element.shadowRoot.querySelector('.fill-layer') as SVGElement;
    const endDot = element.shadowRoot.querySelector('.fill-dot-end') as SVGElement;
    const needle = element.shadowRoot.querySelector('.needle') as SVGElement;

    expect(element.getAttribute('thumb')).toBe(thumb);
    expect(fill.hasAttribute('hidden')).toBe(fillHidden);
    expect(endDot.hasAttribute('hidden')).toBe(endDotHidden);
    expect(needle.hasAttribute('hidden')).toBe(needleHidden);
  });

  it('should rotate the needle thumb to the current value', async () => {
    element.thumb = 'needle';
    element.value = 50;
    await elementIsStable(element);

    const needle = element.shadowRoot.querySelector('.needle') as SVGElement;
    const line = element.shadowRoot.querySelector('.needle-line') as SVGLineElement;

    expect(needle.style.getPropertyValue('--_needle-angle')).toBe('270deg');
    expect(line.getAttribute('x1')).toBe('64');
    expect(line.getAttribute('x2')).toBe('104');

    element.value = 75;
    await elementIsStable(element);

    expect(needle.style.getPropertyValue('--_needle-angle')).toBe('337.5deg');
  });

  it('should fall back to the fill thumb for invalid values', async () => {
    element.setAttribute('thumb', 'invalid');
    element.value = 50;
    await elementIsStable(element);

    const fill = element.shadowRoot.querySelector('.fill-layer') as SVGElement;
    const endDot = element.shadowRoot.querySelector('.fill-dot-end') as SVGElement;
    const needle = element.shadowRoot.querySelector('.needle') as SVGElement;

    expect(fill.hasAttribute('hidden')).toBe(false);
    expect(endDot.hasAttribute('hidden')).toBe(false);
    expect(needle.hasAttribute('hidden')).toBe(true);
  });

  it('should render a 270-degree inset arc with rounded ends by default', async () => {
    element.value = 50;
    await elementIsStable(element);

    const svg = element.shadowRoot.querySelector('svg') as SVGElement;
    const background = element.shadowRoot.querySelector('.background') as SVGPathElement;
    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;

    expect(svg.getAttribute('viewBox')).toBe('8.53 8.53 110.93 95.7');
    expect(background.getAttribute('d')).toBe('M 27.23 100.77 A 52 52 0 1 1 100.77 100.77');
    expect(gauge.getAttribute('d')).not.toBe(background.getAttribute('d'));
    expect(renderedProgress()).toBeCloseTo(0.5, 2);
    expect(getComputedStyle(background).strokeLinecap).toBe('round');
    expect(getComputedStyle(gauge).strokeLinecap).toBe('round');
    expect(parseFloat(getComputedStyle(element).height)).toBeCloseTo(110.4, 1);
  });

  it('should render the half shape with the semi-circular arc', async () => {
    element.shape = 'half';
    element.value = 50;
    await elementIsStable(element);

    const svg = element.shadowRoot.querySelector('svg') as SVGElement;
    const background = element.shadowRoot.querySelector('.background') as SVGPathElement;
    const gauge = element.shadowRoot.querySelector('.gauge') as SVGPathElement;

    expect(element.getAttribute('shape')).toBe('half');
    expect(svg.getAttribute('viewBox')).toBe('8.53 8.53 110.93 58.93');
    expect(background.getAttribute('d')).toBe('M 12 64 A 52 52 0 0 1 116 64');
    expect(gauge.getAttribute('d')).not.toBe(background.getAttribute('d'));
    expect(renderedProgress()).toBeCloseTo(0.5, 2);
    expect(getComputedStyle(background).strokeLinecap).toBe('round');
    expect(getComputedStyle(gauge).strokeLinecap).toBe('round');
    expect(parseFloat(getComputedStyle(element).height)).toBeCloseTo(68, 1);
  });

  it('should assign slotted content to the default slot', async () => {
    removeFixture(fixture);
    fixture = await createFixture(html`
      <nve-gauge status="warning">
        <span>50%</span>
      </nve-gauge>
    `);
    element = fixture.querySelector(Gauge.metadata.tag);
    await elementIsStable(element);

    const defaultSlot = element.shadowRoot.querySelector('slot:not([name])') as HTMLSlotElement;
    const assigned = defaultSlot.assignedElements();
    expect(assigned).toHaveLength(1);
    expect(assigned[0]).toBe(fixture.querySelector('span'));
  });

  it('should render zero-length progress when value is 0', async () => {
    element.value = 0;
    await elementIsStable(element);

    expect(renderedProgress()).toBe(0);
  });

  it('should default progress scaling when max is omitted', async () => {
    element.value = 50;
    element.max = undefined;
    await elementIsStable(element);

    expect(renderedProgress()).toBeCloseTo(0.5, 2);
  });

  it('should scale progress with a custom max', async () => {
    element.value = 5;
    element.max = 20;
    await elementIsStable(element);

    expect(renderedProgress()).toBeCloseTo(0.25, 2);
  });

  it('should clamp over-max values', async () => {
    element.value = 150;
    element.max = 100;
    await elementIsStable(element);

    expect(renderedProgress()).toBeCloseTo(1, 2);
    expect(element._internals.ariaValueNow).toBe('100');
    expect(element._internals.ariaValueMax).toBe('100');
  });

  it.each([
    { name: 'NaN value', value: Number.NaN, max: 100, progress: 0, ariaValueNow: '0', ariaValueMax: '100' },
    { name: 'negative value', value: -1, max: 100, progress: 0, ariaValueNow: '0', ariaValueMax: '100' },
    { name: 'NaN max', value: 50, max: Number.NaN, progress: 0.5, ariaValueNow: '50', ariaValueMax: '100' },
    { name: 'zero max', value: 50, max: 0, progress: 0.5, ariaValueNow: '50', ariaValueMax: '100' },
    { name: 'negative max', value: 50, max: -1, progress: 0.5, ariaValueNow: '50', ariaValueMax: '100' }
  ])('should normalize $name', async ({ value, max, progress, ariaValueNow, ariaValueMax }) => {
    element.value = value;
    element.max = max;
    await elementIsStable(element);

    expect(renderedProgress()).toBeCloseTo(progress, 2);
    expect(element._internals.ariaValueNow).toBe(ariaValueNow);
    expect(element._internals.ariaValueMax).toBe(ariaValueMax);
  });
});
