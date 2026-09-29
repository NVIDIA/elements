// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Viewport, ViewportGridlines } from '@nvidia-elements/core/viewport';
import { selectGridlineInterval } from './viewport-gridlines.utils.js';
import '@nvidia-elements/core/viewport/define.js';

describe(ViewportGridlines.metadata.tag, () => {
  let fixture: HTMLElement;
  let gridlines: ViewportGridlines;
  let viewport: Viewport;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-viewport style="width: 400px; height: 300px">
        <nve-viewport-gridlines></nve-viewport-gridlines>
      </nve-viewport>
    `);
    viewport = fixture.querySelector(Viewport.metadata.tag);
    gridlines = fixture.querySelector(ViewportGridlines.metadata.tag);
    await elementIsStable(viewport);
    await elementIsStable(gridlines);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
  });

  it('defines reflected properties with normalized defaults', async () => {
    expect(customElements.get(ViewportGridlines.metadata.tag)).toBe(ViewportGridlines);
    expect({
      originX: gridlines.originX,
      originY: gridlines.originY,
      step: gridlines.step,
      targetSpacing: gridlines.targetSpacing
    }).toEqual({ originX: 0, originY: 0, step: 10, targetSpacing: 64 });

    gridlines.step = 20;
    gridlines.originX = -15;
    gridlines.originY = 25;
    gridlines.targetSpacing = 80;
    await elementIsStable(gridlines);
    expect(gridlines.getAttribute('step')).toBe('20');
    expect(gridlines.getAttribute('origin-x')).toBe('-15');
    expect(gridlines.getAttribute('origin-y')).toBe('25');
    expect(gridlines.getAttribute('target-spacing')).toBe('80');

    gridlines.step = 0;
    gridlines.originX = Number.NaN;
    gridlines.targetSpacing = Number.POSITIVE_INFINITY;
    expect({ originX: gridlines.originX, step: gridlines.step, targetSpacing: gridlines.targetSpacing }).toEqual({
      originX: 0,
      step: 10,
      targetSpacing: 64
    });
  });

  it('updates property-driven projections in one render cycle', async () => {
    const warnings = vi.spyOn(console, 'warn');

    gridlines.step = 20;
    await elementIsStable(gridlines);
    gridlines.targetSpacing = 100;
    await elementIsStable(gridlines);

    expect(gridlines.shadowRoot?.querySelector('pattern')?.getAttribute('width')).toBe('100');
    expect(warnings.mock.calls.flat().join(' ')).not.toContain('scheduled an update after an update completed');
  });

  it('assigns itself to the background and remains inert and hidden from accessibility', () => {
    const svg = gridlines.shadowRoot?.querySelector('svg');
    expect(gridlines.slot).toBe('background');
    expect(gridlines.getAttribute('aria-hidden')).toBe('true');
    expect(gridlines.tabIndex).toBe(-1);
    expect(svg?.getAttribute('focusable')).toBe('false');
    expect(getComputedStyle(gridlines).pointerEvents).toBe('none');
    expect(getComputedStyle(gridlines).userSelect).toBe('none');
  });

  it('cleans up the owning viewport listener and size observer', () => {
    const removeListener = vi.spyOn(viewport, 'removeEventListener');
    const disconnectObserver = vi.spyOn(ResizeObserver.prototype, 'disconnect');
    gridlines.remove();
    expect(removeListener).toHaveBeenCalledWith('viewportchange', expect.any(Function));
    expect(disconnectObserver).toHaveBeenCalled();
  });

  it('fails harmlessly outside a direct viewport background context', async () => {
    const standalone = document.createElement(ViewportGridlines.metadata.tag);
    fixture.append(standalone);
    await elementIsStable(standalone);
    expect(standalone.slot).toBe('background');
    expect(standalone.shadowRoot?.querySelector('svg')).toBeNull();
  });

  it('keeps the configured origin stable through pan and zoom', async () => {
    gridlines.originX = 20;
    gridlines.originY = -30;
    await elementIsStable(gridlines);
    expect(patternOrigin(gridlines)).toEqual({ x: 20, y: -30 });

    viewport.x = 600;
    viewport.y = -450;
    viewport.scale = 2;
    await elementIsStable(gridlines);
    expect(patternOrigin(gridlines)).toEqual({ x: 20, y: -30 });
  });

  it('uses one shared interval and visually compensates line width for scale', async () => {
    viewport.scale = 2;
    await elementIsStable(viewport);
    await elementIsStable(gridlines);
    const pattern = gridlines.shadowRoot?.querySelector<SVGPatternElement>('[data-gridline-pattern]');
    const path = gridlines.shadowRoot?.querySelector<SVGPathElement>('path');
    expect(pattern?.getAttribute('width')).toBe(pattern?.getAttribute('height'));
    expect(gridlines.style.getPropertyValue('--_scale')).toBe('2');
    expect(getComputedStyle(path as SVGPathElement).strokeWidth).toBe('0.5px');
  });

  it('updates its private scale without rendering when projection geometry remains valid', async () => {
    expect(gridlines.style.getPropertyValue('--_scale')).toBe('1');
    const requestUpdate = vi.spyOn(gridlines, 'requestUpdate');

    viewport.scale = 1.01;
    await elementIsStable(viewport);

    expect(gridlines.style.getPropertyValue('--_scale')).toBe('1.01');
    expect(requestUpdate).not.toHaveBeenCalled();
  });

  it('retains overscan coverage until the visible bounds approach its edge', async () => {
    const initial = gridlines.shadowRoot?.querySelector('svg')?.getAttribute('viewBox');
    viewport.x = 10;
    await elementIsStable(gridlines);
    expect(gridlines.shadowRoot?.querySelector('svg')?.getAttribute('viewBox')).toBe(initial);

    viewport.x = 600;
    await elementIsStable(gridlines);
    expect(gridlines.shadowRoot?.querySelector('svg')?.getAttribute('viewBox')).not.toBe(initial);
  });

  it('keeps normalized defaults when a new assignment does not change them', async () => {
    const before = renderedGrid(gridlines);

    gridlines.step = 0;
    gridlines.step = Number.NaN;
    gridlines.step = Number.POSITIVE_INFINITY;
    gridlines.originX = Number.NaN;
    gridlines.originX = Number.POSITIVE_INFINITY;
    gridlines.originY = Number.NaN;
    gridlines.originY = Number.NEGATIVE_INFINITY;
    gridlines.targetSpacing = 0;
    gridlines.targetSpacing = Number.NaN;
    gridlines.targetSpacing = Number.POSITIVE_INFINITY;
    await elementIsStable(gridlines);

    expect({
      originX: gridlines.originX,
      originY: gridlines.originY,
      step: gridlines.step,
      targetSpacing: gridlines.targetSpacing
    }).toEqual({ originX: 0, originY: 0, step: 10, targetSpacing: 64 });
    expect(renderedGrid(gridlines)).toEqual(before);
  });

  it('keeps a repeated finite property assignment', async () => {
    gridlines.step = 20;
    gridlines.originX = -15;
    gridlines.originY = 25;
    gridlines.targetSpacing = 80;
    await elementIsStable(gridlines);
    const before = renderedGrid(gridlines);

    gridlines.step = 20;
    gridlines.originX = -15;
    gridlines.originY = 25;
    gridlines.targetSpacing = 80;
    await elementIsStable(gridlines);

    expect(gridlines.getAttribute('step')).toBe('20');
    expect(gridlines.getAttribute('origin-x')).toBe('-15');
    expect(gridlines.getAttribute('origin-y')).toBe('25');
    expect(gridlines.getAttribute('target-spacing')).toBe('80');
    expect(renderedGrid(gridlines)).toEqual(before);
  });

  it('keeps the current pattern when the viewport has no area', async () => {
    const before = renderedGrid(gridlines);
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 0 },
      clientWidth: { configurable: true, value: 0 }
    });

    gridlines.step = 20;
    await elementIsStable(gridlines);

    expect(gridlines.getAttribute('step')).toBe('20');
    expect(renderedGrid(gridlines)).toEqual(before);
  });
});

class RecordingResizeObserver implements ResizeObserver {
  static latest?: RecordingResizeObserver;
  readonly disconnect = vi.fn();
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly #callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback;
    RecordingResizeObserver.latest = this;
  }

  notify(): void {
    this.#callback([], this);
  }
}

describe('viewport gridlines resize observation', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('rebuilds overscan coverage when the viewport element resizes', async () => {
    vi.stubGlobal('ResizeObserver', RecordingResizeObserver);
    const fixture = await createFixture(html`
      <nve-viewport style="width: 400px; height: 300px">
        <nve-viewport-gridlines></nve-viewport-gridlines>
      </nve-viewport>
    `);
    const viewport = fixture.querySelector(Viewport.metadata.tag);
    const gridlines = fixture.querySelector(ViewportGridlines.metadata.tag);
    await elementIsStable(viewport);
    await elementIsStable(gridlines);
    const svg = gridlines.shadowRoot?.querySelector('svg');
    const before = svg?.getAttribute('viewBox');
    Object.defineProperties(viewport, {
      clientHeight: { configurable: true, value: 180 },
      clientWidth: { configurable: true, value: 720 }
    });

    RecordingResizeObserver.latest?.notify();
    await elementIsStable(gridlines);

    expect(svg?.getAttribute('viewBox')).toBe('-720 -180 2160 540');
    expect(svg?.getAttribute('viewBox')).not.toBe(before);
    removeFixture(fixture);
  });

  it('draws gridlines when resize observation is unavailable', async () => {
    vi.stubGlobal('ResizeObserver', undefined);
    const fixture = await createFixture(html`
      <nve-viewport style="width: 400px; height: 300px">
        <nve-viewport-gridlines></nve-viewport-gridlines>
      </nve-viewport>
    `);
    const gridlines = fixture.querySelector(ViewportGridlines.metadata.tag);
    await elementIsStable(gridlines);

    expect(gridlines.shadowRoot?.querySelector('svg')).not.toBeNull();
    gridlines.remove();
    removeFixture(fixture);
  });
});

describe('viewport gridline interval selection', () => {
  it('selects the nearest 1/2/5 interval derived from step', () => {
    expect(selectGridlineInterval({ scale: 6.4, step: 10, targetSpacing: 64 })).toBe(10);
    expect(selectGridlineInterval({ scale: 3.2, step: 10, targetSpacing: 64 })).toBe(20);
    expect(selectGridlineInterval({ scale: 1.28, step: 10, targetSpacing: 64 })).toBe(50);
    expect(selectGridlineInterval({ scale: 0.64, step: 10, targetSpacing: 64 })).toBe(100);
  });

  it('always selects an integral multiple of step', () => {
    for (const scale of [0.01, 0.1, 0.75, 1, 4, 20]) {
      const interval = selectGridlineInterval({ scale, step: 7, targetSpacing: 64 });
      expect(interval / 7).toBe(Math.round(interval / 7));
    }
  });

  it('retains an interval across its hysteresis range', () => {
    expect(selectGridlineInterval({ current: 50, scale: 0.65, step: 10, targetSpacing: 64 })).toBe(50);
    expect(selectGridlineInterval({ current: 50, scale: 0.63, step: 10, targetSpacing: 64 })).toBe(100);
    expect(selectGridlineInterval({ current: 100, scale: 0.65, step: 10, targetSpacing: 64 })).toBe(100);
  });

  it('returns a finite interval when the desired interval overflows', () => {
    expect(selectGridlineInterval({ scale: Number.MIN_VALUE, step: 10, targetSpacing: 64 })).toBe(Number.MAX_VALUE);
  });

  it('returns a finite interval when the desired factor overflows', () => {
    expect(selectGridlineInterval({ scale: 1, step: Number.MIN_VALUE, targetSpacing: 64 })).toBe(Number.MAX_VALUE);
  });

  it('skips candidate intervals that overflow', () => {
    expect(selectGridlineInterval({ scale: 1, step: 1e308, targetSpacing: 1.7e308 })).toBe(1e308);
  });
});

function patternOrigin(element: ViewportGridlines): { x: number; y: number } {
  const pattern = element.shadowRoot?.querySelector('[data-gridline-pattern]');
  return { x: Number(pattern?.getAttribute('x')), y: Number(pattern?.getAttribute('y')) };
}

function renderedGrid(element: ViewportGridlines): {
  originX: string | null;
  originY: string | null;
  viewBox: string | null;
  width: string | null;
} {
  const pattern = element.shadowRoot?.querySelector('[data-gridline-pattern]');
  const svg = element.shadowRoot?.querySelector('svg');
  return {
    originX: pattern ? pattern.getAttribute('x') : null,
    originY: pattern ? pattern.getAttribute('y') : null,
    viewBox: svg ? svg.getAttribute('viewBox') : null,
    width: pattern ? pattern.getAttribute('width') : null
  };
}
