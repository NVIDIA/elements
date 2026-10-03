// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Viewport, ViewportGridlines } from '@nvidia-elements/core/viewport';
import { selectGridlineInterval } from './viewport-gridlines.utils.js';
import '@nvidia-elements/core/viewport/define.js';

class TestResizeObserver implements ResizeObserver {
  static readonly instances: TestResizeObserver[] = [];
  readonly disconnect = vi.fn();
  readonly observe = vi.fn();
  readonly unobserve = vi.fn();
  readonly #callback: ResizeObserverCallback;

  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback;
    TestResizeObserver.instances.push(this);
  }

  notify(): void {
    this.#callback([], this);
  }
}

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
    vi.unstubAllGlobals();
  });

  it('defines reflected properties with normalized defaults', async () => {
    expect(customElements.get(ViewportGridlines.metadata.tag)).toBe(ViewportGridlines);
    expect({
      originX: gridlines.originX,
      originY: gridlines.originY,
      pattern: gridlines.pattern,
      step: gridlines.step,
      targetSpacing: gridlines.targetSpacing
    }).toEqual({ originX: 0, originY: 0, pattern: 'lines', step: 10, targetSpacing: 64 });

    gridlines.pattern = 'dots';
    gridlines.step = 20;
    gridlines.originX = -15;
    gridlines.originY = 25;
    gridlines.targetSpacing = 80;
    await elementIsStable(gridlines);
    expect(gridlines.getAttribute('pattern')).toBe('dots');
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
    expect(lineOrigin(gridlines)).toEqual({ x: 20, y: -30 });

    viewport.x = 600;
    viewport.y = -450;
    viewport.scale = 2;
    await elementIsStable(gridlines);
    expect(lineOrigin(gridlines)).toEqual({ x: 20, y: -30 });
  });

  it('places dots at line intersections through panning and adaptive zoom', async () => {
    gridlines.originX = 20;
    gridlines.originY = -30;
    await elementIsStable(gridlines);
    const lineInterval = gridlines.shadowRoot?.querySelector('pattern')?.getAttribute('width');

    gridlines.pattern = 'dots';
    await elementIsStable(gridlines);
    expect(gridlines.getAttribute('pattern')).toBe('dots');
    expect(gridlines.shadowRoot?.querySelector('pattern')?.getAttribute('width')).toBe(lineInterval);
    expect(dotOrigin(gridlines)).toEqual({ x: 20, y: -30 });
    expect(gridlines.shadowRoot?.querySelector('circle')?.namespaceURI).toBe('http://www.w3.org/2000/svg');

    viewport.x = 600;
    viewport.y = -450;
    viewport.scale = 2;
    await elementIsStable(gridlines);
    expect(dotOrigin(gridlines)).toEqual({ x: 20, y: -30 });
    expect(gridlines.shadowRoot?.querySelector('pattern')?.getAttribute('width')).toBe('20');
  });

  it('keeps configured dot radius stable on screen while zooming', async () => {
    gridlines.pattern = 'dots';
    await elementIsStable(gridlines);
    const circle = gridlines.shadowRoot?.querySelector<SVGCircleElement>('circle');
    if (!circle) throw new Error('Expected a dot');
    expect(getComputedStyle(circle).r).toBe('2px');

    gridlines.style.setProperty('--dot-radius', '4px');
    gridlines.style.setProperty('--color', 'rgb(10, 20, 30)');
    expect(getComputedStyle(circle).r).toBe('4px');
    expect(getComputedStyle(circle).fill).toBe('rgb(10, 20, 30)');

    viewport.scale = 2;
    await elementIsStable(gridlines);
    expect(getComputedStyle(circle).r).toBe('2px');
  });

  it('places crosses at line intersections through panning and adaptive zoom', async () => {
    const root = gridlines.shadowRoot;
    if (!root) throw new Error('Expected a gridline shadow root');
    gridlines.originX = 20;
    gridlines.originY = -30;
    await elementIsStable(gridlines);
    const lineInterval = root.querySelector('pattern')?.getAttribute('width');

    gridlines.pattern = 'crosses';
    await elementIsStable(gridlines);
    expect(gridlines.getAttribute('pattern')).toBe('crosses');
    expect(root.querySelector('pattern')?.getAttribute('width')).toBe(lineInterval);
    expect(crossOrigin(gridlines)).toEqual({ x: 20, y: -30 });
    expect(root.querySelector('g')?.namespaceURI).toBe('http://www.w3.org/2000/svg');

    viewport.x = 600;
    viewport.y = -450;
    viewport.scale = 2;
    await elementIsStable(gridlines);
    expect(crossOrigin(gridlines)).toEqual({ x: 20, y: -30 });
    expect(root.querySelector('pattern')?.getAttribute('width')).toBe('20');
  });

  it('keeps configured cross size and arm thickness stable on screen while zooming', async () => {
    gridlines.pattern = 'crosses';
    await elementIsStable(gridlines);
    const horizontal = gridlines.shadowRoot?.querySelector('.cross-horizontal');
    const vertical = gridlines.shadowRoot?.querySelector('.cross-vertical');
    if (!(horizontal instanceof SVGRectElement) || !(vertical instanceof SVGRectElement)) {
      throw new Error('Expected both cross arms');
    }
    expect(getComputedStyle(horizontal).width).toBe('8px');
    expect(getComputedStyle(horizontal).height).toBe('1px');

    gridlines.style.setProperty('--cross-size', '12px');
    gridlines.style.setProperty('--line-width', '2px');
    gridlines.style.setProperty('--color', 'rgb(10, 20, 30)');
    expect(getComputedStyle(horizontal).width).toBe('12px');
    expect(getComputedStyle(horizontal).height).toBe('2px');
    expect(getComputedStyle(vertical).width).toBe('2px');
    expect(getComputedStyle(vertical).height).toBe('12px');
    const cross = gridlines.shadowRoot?.querySelector('.cross');
    if (!cross) throw new Error('Expected a cross');
    expect(getComputedStyle(cross).fill).toBe('rgb(10, 20, 30)');

    viewport.scale = 2;
    await elementIsStable(gridlines);
    expect(getComputedStyle(horizontal).width).toBe('6px');
    expect(getComputedStyle(horizontal).height).toBe('1px');
    expect(getComputedStyle(horizontal).x).toBe('-3px');
    expect(getComputedStyle(horizontal).y).toBe('-0.5px');
    expect(getComputedStyle(vertical).width).toBe('1px');
    expect(getComputedStyle(vertical).height).toBe('6px');
    expect(getComputedStyle(vertical).x).toBe('-0.5px');
    expect(getComputedStyle(vertical).y).toBe('-3px');
  });

  it('paints translucent crosses with the same opacity at the center and along each arm', async () => {
    gridlines.pattern = 'crosses';
    gridlines.originX = 25;
    gridlines.originY = 25;
    gridlines.style.setProperty('--cross-size', '20px');
    gridlines.style.setProperty('--line-width', '4px');
    gridlines.style.setProperty('--color', 'rgb(10 20 30 / 50%)');
    await elementIsStable(gridlines);
    const source = gridlines.shadowRoot?.querySelector('svg');
    if (!source) throw new Error('Expected a gridline SVG');

    // Rasterize the rendered SVG with resolved CSS geometry and paint.
    const snapshot = source.cloneNode(true);
    if (!(snapshot instanceof SVGSVGElement)) throw new Error('Expected an SVG snapshot');
    snapshot.removeAttribute('style');
    snapshot.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    snapshot.setAttribute('viewBox', '0 0 50 50');
    snapshot.setAttribute('width', '50');
    snapshot.setAttribute('height', '50');
    const sourceRects = source.querySelectorAll('rect');
    snapshot.querySelectorAll('rect').forEach((rect, index) => {
      const original = sourceRects.item(index);
      const style = getComputedStyle(original);
      for (const property of ['x', 'y', 'width', 'height', 'fill']) {
        rect.style.setProperty(property, style.getPropertyValue(property));
      }
    });
    const image = new Image();
    image.src = `data:image/svg+xml,${encodeURIComponent(new XMLSerializer().serializeToString(snapshot))}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 50;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Expected a canvas context');
    context.drawImage(image, 0, 0);
    const alphaAt = (x: number, y: number) => context.getImageData(x, y, 1, 1).data[3];
    expect(alphaAt(25, 25)).toBe(128);
    expect(alphaAt(18, 25)).toBe(128);
    expect(alphaAt(25, 18)).toBe(128);
    expect(alphaAt(18, 18)).toBe(0);
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

  it('does not schedule an update or render when configuration values are assigned again', async () => {
    gridlines.step = 20;
    gridlines.originX = -15;
    gridlines.originY = 25;
    gridlines.targetSpacing = 80;
    await elementIsStable(gridlines);
    const render = vi.spyOn(gridlines, 'render');

    gridlines.step = gridlines.step;
    gridlines.originX = gridlines.originX;
    gridlines.originY = gridlines.originY;
    gridlines.targetSpacing = gridlines.targetSpacing;

    expect(gridlines.isUpdatePending).toBe(false);
    await elementIsStable(gridlines);
    expect(render).not.toHaveBeenCalled();
  });

  it('refreshes its projection when the viewport is resized', async () => {
    gridlines.remove();
    vi.stubGlobal('ResizeObserver', TestResizeObserver);
    const resizedGridlines = document.createElement(ViewportGridlines.metadata.tag);
    viewport.append(resizedGridlines);
    await elementIsStable(resizedGridlines);
    const initial = resizedGridlines.shadowRoot?.querySelector('svg')?.getAttribute('viewBox');

    vi.spyOn(viewport, 'getVisibleRect').mockReturnValue({ x: 1000, y: 1000, width: 200, height: 100 });
    TestResizeObserver.instances.at(-1)?.notify();
    await elementIsStable(resizedGridlines);

    expect(resizedGridlines.shadowRoot?.querySelector('svg')?.getAttribute('viewBox')).not.toBe(initial);
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

function lineOrigin(element: ViewportGridlines): { x: number; y: number } {
  const pattern = element.shadowRoot?.querySelector('[data-gridline-pattern]');
  return { x: Number(pattern?.getAttribute('x')), y: Number(pattern?.getAttribute('y')) };
}

function dotOrigin(element: ViewportGridlines): { x: number; y: number } {
  const pattern = element.shadowRoot?.querySelector('[data-gridline-pattern]');
  const circle = pattern?.querySelector('circle');
  return {
    x: Number(pattern?.getAttribute('x')) + Number(circle?.getAttribute('cx')),
    y: Number(pattern?.getAttribute('y')) + Number(circle?.getAttribute('cy'))
  };
}

function crossOrigin(element: ViewportGridlines): { x: number; y: number } {
  const pattern = element.shadowRoot?.querySelector('[data-gridline-pattern]');
  const cross = pattern?.querySelector('g');
  const translation = cross?.transform.baseVal.getItem(0).matrix;
  return {
    x: Number(pattern?.getAttribute('x')) + Number(translation?.e),
    y: Number(pattern?.getAttribute('y')) + Number(translation?.f)
  };
}
