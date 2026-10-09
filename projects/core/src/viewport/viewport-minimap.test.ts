// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import {
  Viewport,
  ViewportMinimap,
  type ViewportPanDetail,
  type ViewportPanEndDetail,
  type ViewportZoomDetail
} from '@nvidia-elements/core/viewport';
import '@nvidia-elements/core/viewport/define.js';

describe(ViewportMinimap.metadata.tag, () => {
  let fixture: HTMLElement;
  let viewport: Viewport;
  let minimap: ViewportMinimap;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-viewport behavior-pan style="width: 400px; height: 300px">
        <div id="automatic-root"><span id="nested-root">nested</span></div>
        <nve-viewport-minimap></nve-viewport-minimap>
      </nve-viewport>
    `);
    const foundViewport = fixture.querySelector<Viewport>(Viewport.metadata.tag);
    const foundMinimap = fixture.querySelector<ViewportMinimap>(ViewportMinimap.metadata.tag);
    if (!foundViewport || !foundMinimap) throw new Error('Viewport minimap fixture did not render');
    viewport = foundViewport;
    minimap = foundMinimap;
    mockSize(viewport, 400, 300);
    mockSize(minimap, 192, 144);
    vi.spyOn(viewport, 'getBoundingClientRect').mockReturnValue(rect({ height: 300, width: 400 }));
    vi.spyOn(minimap, 'getBoundingClientRect').mockReturnValue(rect({ height: 144, width: 192 }));
    vi.spyOn(viewport.querySelector<HTMLElement>('#automatic-root')!, 'getBoundingClientRect').mockReturnValue(
      rect({ width: 800, height: 600 })
    );
    minimap.refresh();
    await flushProjection(minimap);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('defines the associated element and assigns the fixed overlay slot without a tab stop', () => {
    expect(customElements.get(ViewportMinimap.metadata.tag)).toBe(ViewportMinimap);
    expect(minimap.slot).toBe('overlay');
    expect(minimap.getAttribute('aria-hidden')).toBe('true');
    expect(minimap.tabIndex).toBe(-1);
    expect(minimap.shadowRoot?.querySelector('svg')?.getAttribute('focusable')).toBe('false');
  });

  it('stays inert outside a viewport and connects without resize observer support', async () => {
    const standalone = document.createElement(ViewportMinimap.metadata.tag);
    fixture.append(standalone);
    await elementIsStable(standalone);
    standalone.refresh();
    await flushProjection(standalone);
    expect(standalone.shadowRoot?.querySelector('[data-visible-region]')).toBeNull();

    vi.stubGlobal('ResizeObserver', undefined);
    const fallback = document.createElement(ViewportMinimap.metadata.tag);
    viewport.append(fallback);
    await elementIsStable(fallback);
    await flushProjection(fallback);
    expect(fallback.shadowRoot?.querySelector('[data-visible-region]')).not.toBeNull();
  });

  it('prepares touch dragging from the parent capability and restores prior inline touch-action', async () => {
    expect(minimap.style.touchAction).toBe('none');
    viewport.behaviorPan = false;
    await elementIsStable(viewport);
    await elementIsStable(minimap);
    expect(minimap.style.touchAction).toBe('');

    minimap.style.setProperty('touch-action', 'pan-y', 'important');
    viewport.behaviorPan = 'space';
    await elementIsStable(viewport);
    await elementIsStable(minimap);
    expect(minimap.style.touchAction).toBe('none');

    viewport.behaviorPan = false;
    await elementIsStable(viewport);
    await elementIsStable(minimap);
    expect(minimap.style.touchAction).toBe('pan-y');
    expect(minimap.style.getPropertyPriority('touch-action')).toBe('important');

    viewport.behaviorZoom = true;
    await elementIsStable(viewport);
    await elementIsStable(minimap);
    expect(minimap.style.touchAction).toBe('pan-y');
  });

  it('owns cursor presentation from pan eligibility and the admitted drag state', async () => {
    const indicator = visibleRegion(minimap);
    const capture = vi.spyOn(minimap, 'setPointerCapture');
    expect(minimap.matches(':state(pan-eligible)')).toBe(true);
    expect(minimap.matches(':state(panning)')).toBe(false);
    expect(getComputedStyle(background(minimap)).cursor).toBe('pointer');
    expect(getComputedStyle(indicator).cursor).toBe('grab');

    minimap.style.setProperty('--recenter-cursor', 'crosshair');
    expect(getComputedStyle(background(minimap)).cursor).toBe('crosshair');
    viewport.style.setProperty('--pan-cursor', 'crosshair');
    expect(getComputedStyle(indicator).cursor).toBe('crosshair');
    minimap.style.setProperty('--pan-cursor', 'move');
    expect(getComputedStyle(indicator).cursor).toBe('move');

    viewport.behaviorPan = false;
    await elementIsStable(viewport);
    await elementIsStable(minimap);
    expect(minimap.matches(':state(pan-eligible)')).toBe(false);
    expect(getComputedStyle(background(minimap)).cursor).toBe('default');
    expect(getComputedStyle(indicator).cursor).toBe('default');

    viewport.behaviorPan = 'space';
    await elementIsStable(viewport);
    await elementIsStable(minimap);
    expect(minimap.matches(':state(pan-eligible)')).toBe(true);
    expect(getComputedStyle(indicator).cursor).toBe('move');

    indicator.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 60 }));
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 23, pointerId: 60 }));
    expect(capture).toHaveBeenCalledWith(60);
    expect(minimap.matches(':state(panning)')).toBe(true);
    expect(getComputedStyle(minimap).cursor).toBe('grabbing');
    expect(getComputedStyle(indicator).cursor).toBe('grabbing');

    viewport.behaviorPan = false;
    await elementIsStable(viewport);
    await elementIsStable(minimap);
    expect(minimap.matches(':state(pan-eligible)')).toBe(false);
    expect(minimap.matches(':state(panning)')).toBe(true);
    expect(getComputedStyle(minimap).cursor).toBe('grabbing');
    expect(getComputedStyle(indicator).cursor).toBe('grabbing');

    indicator.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 23, pointerId: 60 }));
    expect(minimap.matches(':state(panning)')).toBe(false);
    await elementIsStable(minimap);
    expect(getComputedStyle(minimap).cursor).toBe('default');
    expect(getComputedStyle(indicator).cursor).toBe('default');
  });

  it('retains touch-action and navigation for an admitted drag after panning is disabled', async () => {
    const pan = vi.fn();
    const panend = vi.fn();
    viewport.addEventListener('pan', pan);
    viewport.addEventListener('panend', panend);
    const indicator = visibleRegion(minimap);
    indicator.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 45 }));
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 23, pointerId: 45 }));
    viewport.behaviorPan = false;
    await elementIsStable(viewport);
    await elementIsStable(minimap);
    expect(minimap.style.touchAction).toBe('none');

    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 26, pointerId: 45 }));
    indicator.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 26, pointerId: 45 }));
    await elementIsStable(minimap);

    expect(pan).toHaveBeenCalledTimes(2);
    expect(viewport.x).toBeCloseTo(30);
    expect(panend).toHaveBeenCalledOnce();
    expect(panend.mock.calls[0]?.[0]).toMatchObject({ detail: { interrupted: false, reason: 'up' } });
    expect(minimap.style.touchAction).toBe('');

    clickMinimap(background(minimap), { clientX: 176, clientY: 72, pointerId: 46 });
    expect(pan).toHaveBeenCalledTimes(2);
  });

  it('reads an already enabled parent capability when connected', async () => {
    const laterMinimap = document.createElement(ViewportMinimap.metadata.tag) as ViewportMinimap;
    viewport.append(laterMinimap);
    await elementIsStable(laterMinimap);
    expect(laterMinimap.style.touchAction).toBe('none');
  });

  it('renders arbitrary slotted preview content in place of automatic rectangles', async () => {
    expect(itemKeys(minimap)).toEqual(['automatic-root']);
    const preview = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    preview.setAttribute('slot', 'preview');
    preview.setAttribute('width', '800');
    preview.setAttribute('height', '600');
    preview.innerHTML = '<circle cx="100" cy="300" r="100"></circle><path d="M 600 190 L 710 300 L 600 410 Z"></path>';
    vi.spyOn(preview, 'getBoundingClientRect').mockImplementation(() => {
      const transform = previewProjection(minimap);
      return rect({
        x: transform.offsetX,
        y: transform.offsetY,
        width: 800 * transform.scale,
        height: 600 * transform.scale
      });
    });
    minimap.append(preview);
    await elementIsStable(minimap);
    await flushProjection(minimap);

    expect(itemKeys(minimap)).toEqual([]);
    expect(minimap.shadowRoot?.querySelector('slot[name="preview"]')?.assignedElements()).toEqual([preview]);
    expect(preview.querySelectorAll('circle, path')).toHaveLength(2);
    expect(previewProjection(minimap).scale).toBeCloseTo(0.2);
    expect(visibleRegionRect(minimap).x).toBeCloseTo(16);
    expect(visibleRegionRect(minimap).y).toBeCloseTo(12);
    expect(visibleRegionRect(minimap).width).toBeCloseTo(80);
    expect(visibleRegionRect(minimap).height).toBeCloseTo(60);

    preview.remove();
    await elementIsStable(minimap);
    await flushProjection(minimap);
    expect(itemKeys(minimap)).toEqual(['automatic-root']);
  });

  it('measures custom preview roots from their initial unprojected state', async () => {
    const freshMinimap = document.createElement(ViewportMinimap.metadata.tag);
    const empty = document.createElement('div');
    const visible = document.createElement('div');
    empty.slot = 'preview';
    visible.slot = 'preview';
    vi.spyOn(visible, 'getBoundingClientRect').mockReturnValue(rect({ width: 100, height: 50 }));
    freshMinimap.append(empty, visible);
    mockSize(freshMinimap, 192, 144);
    viewport.append(freshMinimap);
    await elementIsStable(freshMinimap);
    await flushProjection(freshMinimap);

    expect(itemKeys(freshMinimap)).toEqual([]);
    expect(freshMinimap.shadowRoot?.querySelector('slot[name="preview"]')?.assignedElements()).toEqual([
      empty,
      visible
    ]);
  });

  it('uses HTML preview root bounds and remeasures them after position-only changes', async () => {
    let contentX = 100;
    const preview = document.createElement('div');
    preview.slot = 'preview';
    preview.innerHTML = '<span>Node preview</span>';
    vi.spyOn(preview, 'getBoundingClientRect').mockImplementation(() => {
      const projection = previewProjection(minimap);
      return rect({
        x: contentX * projection.scale + projection.offsetX,
        y: projection.offsetY,
        width: 800 * projection.scale,
        height: 600 * projection.scale
      });
    });
    minimap.append(preview);
    await elementIsStable(minimap);
    await flushProjection(minimap);

    const initialScale = previewProjection(minimap).scale;
    expect(itemKeys(minimap)).toEqual([]);
    expect(initialScale).toBeLessThan(0.2);

    contentX = 300;
    minimap.refresh();
    await flushProjection(minimap);
    expect(previewProjection(minimap).scale).toBeLessThan(initialScale);
  });

  it('automatically measures only immediate default-slot roots and keeps stable generated keys', async () => {
    const root = viewport.querySelector<HTMLElement>('#automatic-root')!;
    const nested = viewport.querySelector<HTMLElement>('#nested-root')!;
    const rootRect = vi
      .spyOn(root, 'getBoundingClientRect')
      .mockReturnValue(rect({ x: 20, y: 30, width: 100, height: 80 }));
    const nestedRect = vi.spyOn(nested, 'getBoundingClientRect');
    minimap.refresh();
    await flushProjection(minimap);
    const firstKey = itemKeys(minimap);

    minimap.refresh();
    await flushProjection(minimap);
    expect(itemKeys(minimap)).toEqual(firstKey);
    expect(rootRect).toHaveBeenCalled();
    expect(nestedRect).not.toHaveBeenCalled();
    expect(firstKey).toHaveLength(1);
  });

  it('ignores empty automatic roots and keeps generated keys stable', async () => {
    const empty = document.createElement('div');
    const visible = document.createElement('div');
    vi.spyOn(visible, 'getBoundingClientRect').mockReturnValue(rect({ x: 100, y: 100, width: 50, height: 50 }));
    viewport.append(empty, visible);
    await elementIsStable(viewport);
    await flushProjection(minimap);
    const firstKeys = itemKeys(minimap);

    minimap.refresh();
    await flushProjection(minimap);

    expect(firstKeys).toEqual(['automatic-root', 'root-0']);
    expect(itemKeys(minimap)).toEqual(firstKeys);
  });

  it('rebuilds automatic roots on default-slot changes while excluding background and overlay children', async () => {
    const added = document.createElement('div');
    added.id = 'added-root';
    vi.spyOn(added, 'getBoundingClientRect').mockReturnValue(rect({ x: 100, y: 100, width: 50, height: 50 }));
    viewport.append(added);
    await elementIsStable(viewport);
    await flushProjection(minimap);
    expect(itemKeys(minimap)).toContain('added-root');
    expect(itemKeys(minimap)).not.toContain(ViewportMinimap.metadata.tag);
  });

  it('keeps overlay pointer input out of viewport surface panning even when the overlay declines it', () => {
    const overlay = document.createElement('div');
    overlay.slot = 'overlay';
    viewport.append(overlay);
    const panstart = vi.fn();
    viewport.addEventListener('panstart', panstart);

    overlay.dispatchEvent(pointerEvent('pointerdown', { pointerId: 44 }));
    overlay.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 44 }));
    overlay.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 20, pointerId: 44 }));

    expect(panstart).not.toHaveBeenCalled();
    expect(viewport.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it('excludes the minimap overlay from content fitting', () => {
    const content = viewport.querySelector<HTMLElement>('#automatic-root')!;
    vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(rect({ x: 0, y: 0, width: 200, height: 100 }));
    const minimapRect = vi.mocked(minimap.getBoundingClientRect);
    minimapRect.mockClear();

    viewport.fitContents();

    expect(minimapRect).not.toHaveBeenCalled();
  });

  it('centers the viewport on background and indicator clicks through a cancelable pan proposal', () => {
    const requestPan = vi.spyOn(viewport, 'requestPan');
    const pan = vi.fn();
    viewport.addEventListener('pan', pan);
    clickMinimap(background(minimap), { clientX: 176, clientY: 72, pointerId: 1 });

    expect(pan).toHaveBeenCalledOnce();
    expect(requestPan).toHaveBeenCalledWith(expect.objectContaining({ source: 'minimap' }));
    expect((pan.mock.calls[0]?.[0] as CustomEvent<ViewportPanDetail>).detail).toMatchObject({
      source: 'minimap',
      start: { scale: 1, x: 0, y: 0 }
    });
    expect(viewport.getTransform()).toEqual({ scale: 1, x: 600, y: 150 });
  });

  it('uses the exact three-pixel squared-distance threshold for indicator dragging', () => {
    const panstart = vi.fn();
    viewport.addEventListener('panstart', panstart);
    const indicator = visibleRegion(minimap);
    indicator.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, clientY: 20, pointerId: 2 }));
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 22, clientY: 22, pointerId: 2 }));
    expect(panstart).not.toHaveBeenCalled();

    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 23, clientY: 20, pointerId: 2 }));
    expect(panstart).toHaveBeenCalledOnce();
    expect(viewport.x).toBeCloseTo(15);
  });

  it('does not start navigation when panning is disabled before the drag threshold', () => {
    const panstart = vi.fn();
    viewport.addEventListener('panstart', panstart);
    const indicator = visibleRegion(minimap);
    indicator.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 20 }));
    viewport.behaviorPan = false;
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 23, pointerId: 20 }));
    indicator.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 23, pointerId: 20 }));

    expect(panstart).not.toHaveBeenCalled();
    expect(viewport.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it('emits the minimap pan lifecycle', () => {
    const events: CustomEvent[] = [];
    for (const type of ['panstart', 'pan', 'panend'])
      viewport.addEventListener(type, event => events.push(event as CustomEvent));
    dragIndicator(minimap, { displacementX: 6, pointerId: 3 });

    expect(events.map(event => event.type)).toEqual(['panstart', 'pan', 'panend']);
    expect(events.map(event => event.detail.source)).toEqual(['minimap', 'minimap', 'minimap']);
    expect(events.map(event => event.cancelable)).toEqual([true, true, false]);
    expect((events[2]?.detail as ViewportPanEndDetail).reason).toBe('up');
    expect(viewport.x).toBeCloseTo(30);
  });

  it('preserves the visual projection while the visible region remains within the content extent', async () => {
    const initialItem = itemRect(minimap, 'automatic-root');
    const initialVisible = visibleRegionRect(minimap);

    viewport.x = 100;
    await elementIsStable(viewport);
    await flushProjection(minimap);

    expect(itemRect(minimap, 'automatic-root')).toEqual(initialItem);
    expect(visibleRegionRect(minimap).x).toBeGreaterThan(initialVisible.x);
    expectVisibleRegionWithinBounds(minimap);
  });

  it('expands the visual projection continuously as the visible region moves beyond content', async () => {
    viewport.x = 480;
    await elementIsStable(viewport);
    await flushProjection(minimap);
    const beforeItem = itemRect(minimap, 'automatic-root');
    const beforeVisible = visibleRegionRect(minimap);

    viewport.x = 481;
    await elementIsStable(viewport);
    await flushProjection(minimap);
    const afterItem = itemRect(minimap, 'automatic-root');
    const afterVisible = visibleRegionRect(minimap);

    expect(beforeItem.width - afterItem.width).toBeGreaterThan(0);
    expect(beforeItem.width - afterItem.width).toBeLessThan(1);
    expect(afterVisible.x).toBeGreaterThan(beforeVisible.x);
    expectItemWithinBounds(minimap, 'automatic-root');
    expectVisibleRegionWithinBounds(minimap);
  });

  it('rebases drag math after a committed transform change without altering the public start', async () => {
    const details: ViewportPanDetail[] = [];
    viewport.addEventListener('pan', event => details.push((event as CustomEvent<ViewportPanDetail>).detail));
    const indicator = visibleRegion(minimap);
    indicator.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 4 }));
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 23, pointerId: 4 }));
    viewport.x = 100;
    await elementIsStable(viewport);
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 26, pointerId: 4 }));

    expect(viewport.x).toBeCloseTo(115);
    expect(details.at(-1)?.start).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it('continues long drags through changing render projections without a release jump', async () => {
    const initialItem = itemRect(minimap, 'automatic-root');
    const indicator = visibleRegion(minimap);
    indicator.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, clientY: 20, pointerId: 13 }));
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 220, clientY: 20, pointerId: 13 }));
    expect(viewport.x).toBeCloseTo(1000);

    await elementIsStable(viewport);
    await flushProjection(minimap);
    const firstItem = itemRect(minimap, 'automatic-root');
    expect(firstItem.width).toBeLessThan(initialItem.width);
    expectItemWithinBounds(minimap, 'automatic-root');
    expectVisibleRegionWithinBounds(minimap);

    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 240, clientY: 20, pointerId: 13 }));
    expect(viewport.x).toBeCloseTo(1100);
    await elementIsStable(viewport);
    await flushProjection(minimap);
    const beforePointerUp = visibleRegionRect(minimap);
    const secondItem = itemRect(minimap, 'automatic-root');
    expect(secondItem.width).toBeLessThan(firstItem.width);
    expectItemWithinBounds(minimap, 'automatic-root');
    expectVisibleRegionWithinBounds(minimap);

    indicator.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 240, clientY: 20, pointerId: 13 }));
    await flushProjection(minimap);
    expect(visibleRegionRect(minimap)).toEqual(beforePointerUp);
  });

  it('derives projected rectangles from current geometry rather than transform history', async () => {
    const initialItem = itemRect(minimap, 'automatic-root');
    const initialVisible = visibleRegionRect(minimap);

    viewport.scale = 0.4;
    await elementIsStable(viewport);
    await flushProjection(minimap);
    const expandedItem = itemRect(minimap, 'automatic-root');
    const expandedVisible = visibleRegionRect(minimap);
    expect(expandedItem).not.toEqual(initialItem);
    expect(expandedVisible).not.toEqual(initialVisible);

    viewport.scale = 1;
    await elementIsStable(viewport);
    await flushProjection(minimap);
    expect(itemRect(minimap, 'automatic-root')).toEqual(initialItem);
    expect(visibleRegionRect(minimap)).toEqual(initialVisible);
  });

  it('honors panstart and individual pan cancellation without suppressing semantic lifecycle events', () => {
    const pan = vi.fn((event: Event) => event.preventDefault());
    const panend = vi.fn();
    viewport.addEventListener('panstart', event => event.preventDefault());
    viewport.addEventListener('pan', pan);
    viewport.addEventListener('panend', panend);
    dragIndicator(minimap, { displacementX: 6, pointerId: 5 });

    expect(pan).toHaveBeenCalledOnce();
    expect(panend).toHaveBeenCalledOnce();
    expect(viewport.x).toBe(0);
  });

  it('keeps an application-owned drag interactive after a committed transform rebases it', async () => {
    const proposals: ViewportPanDetail[] = [];
    viewport.addEventListener('panstart', event => event.preventDefault());
    viewport.addEventListener('pan', event => {
      const detail = (event as CustomEvent<ViewportPanDetail>).detail;
      proposals.push(detail);
      viewport.x = proposals.length === 1 ? 100 : detail.next.x;
    });
    const indicator = visibleRegion(minimap);
    indicator.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 16 }));
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 23, pointerId: 16 }));
    expect(viewport.x).toBe(100);

    await elementIsStable(viewport);
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 26, pointerId: 16 }));

    expect(proposals).toHaveLength(2);
    expect(proposals[1]?.start).toEqual({ scale: 1, x: 0, y: 0 });
    expect(viewport.x).toBeCloseTo(115);
  });

  it.each([
    { reason: 'cancel', type: 'pointercancel' },
    { reason: 'lost-capture', type: 'lostpointercapture' }
  ] as const)('ends on $type exactly once and preserves the committed transform', ({ reason, type }) => {
    const pan = vi.fn();
    const panend = vi.fn();
    viewport.addEventListener('pan', pan);
    viewport.addEventListener('panend', panend);
    const indicator = visibleRegion(minimap);
    indicator.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 8 }));
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 23, pointerId: 8 }));
    const committed = viewport.getTransform();

    indicator.dispatchEvent(pointerEvent(type, { clientX: 23, pointerId: 8 }));
    indicator.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 23, pointerId: 8 }));

    expect(pan).toHaveBeenCalledOnce();
    expect(panend).toHaveBeenCalledOnce();
    expect((panend.mock.calls[0]?.[0] as CustomEvent<ViewportPanEndDetail>).detail).toMatchObject({
      interrupted: true,
      reason,
      source: 'minimap',
      transform: committed
    });
    expect(viewport.getTransform()).toEqual(committed);
  });

  it('ends once when pointercancel interrupts panstart synchronously', () => {
    const pan = vi.fn();
    const panend = vi.fn();
    const indicator = visibleRegion(minimap);
    viewport.addEventListener('panstart', () => {
      indicator.dispatchEvent(pointerEvent('pointercancel', { clientX: 23, pointerId: 17 }));
    });
    viewport.addEventListener('pan', pan);
    viewport.addEventListener('panend', panend);

    indicator.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 17 }));
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 23, pointerId: 17 }));

    expect(pan).toHaveBeenCalledOnce();
    expect(panend).toHaveBeenCalledOnce();
    expect((panend.mock.calls[0]?.[0] as CustomEvent<ViewportPanEndDetail>).detail).toMatchObject({
      interrupted: true,
      reason: 'cancel',
      source: 'minimap'
    });
  });

  it('ends an application-owned drag once when the minimap disconnects', () => {
    const panend = vi.fn();
    viewport.addEventListener('panstart', event => event.preventDefault());
    viewport.addEventListener('pan', () => {
      viewport.x = 75;
    });
    viewport.addEventListener('panend', panend);
    const indicator = visibleRegion(minimap);
    indicator.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 18 }));
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 23, pointerId: 18 }));
    expect(viewport.x).toBe(75);

    minimap.remove();
    indicator.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 23, pointerId: 18 }));
    indicator.dispatchEvent(pointerEvent('lostpointercapture', { clientX: 23, pointerId: 18 }));

    expect(panend).toHaveBeenCalledOnce();
    expect((panend.mock.calls[0]?.[0] as CustomEvent<ViewportPanEndDetail>).detail).toMatchObject({
      event: expect.objectContaining({ type: 'disconnect' }),
      interrupted: true,
      reason: 'cancel',
      source: 'minimap',
      transform: { x: 75, y: 0, scale: 1 }
    });
    expect(viewport.x).toBe(75);
  });

  it('ends a pan session when the minimap disconnects during panstart', () => {
    const events: Event[] = [];
    viewport.addEventListener('panstart', event => {
      events.push(event);
      minimap.remove();
    });
    viewport.addEventListener('pan', event => events.push(event));
    viewport.addEventListener('panend', event => events.push(event));
    const indicator = visibleRegion(minimap);
    indicator.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 19 }));
    indicator.dispatchEvent(pointerEvent('pointermove', { clientX: 23, pointerId: 19 }));

    expect(events.map(event => event.type)).toEqual(['panstart', 'pan', 'panend']);
    expect((events[2] as CustomEvent<ViewportPanEndDetail>).detail).toMatchObject({
      interrupted: true,
      reason: 'cancel',
      source: 'minimap'
    });
  });

  it('does not click-navigate after a background press crosses the threshold or loses its buttons', () => {
    const target = background(minimap);
    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 9 }));
    target.dispatchEvent(pointerEvent('pointermove', { clientX: 23, pointerId: 9 }));
    target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 23, pointerId: 9 }));
    expect(viewport.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });

    target.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 10 }));
    target.dispatchEvent(pointerEvent('pointermove', { buttons: 0, clientX: 21, pointerId: 10 }));
    expect(viewport.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it('gates navigation on behavior-pan while treating space mode as direct minimap permission', async () => {
    viewport.behaviorPan = false;
    await elementIsStable(viewport);
    clickMinimap(background(minimap), { clientX: 176, clientY: 72, pointerId: 11 });
    expect(viewport.x).toBe(0);

    viewport.behaviorPan = 'space';
    await elementIsStable(viewport);
    clickMinimap(background(minimap), { clientX: 176, clientY: 72, pointerId: 12 });
    expect(viewport.x).toBe(600);
  });

  it('leaves wheel input unclaimed when the viewport does not own focus', async () => {
    viewport.behaviorZoom = true;
    await elementIsStable(viewport);
    const outside = document.createElement('button');
    fixture.append(outside);
    outside.focus();
    const wheel = wheelEvent({ deltaY: 20 });
    const documentWheel = vi.fn();
    document.addEventListener('wheel', documentWheel);

    expect(minimap.dispatchEvent(wheel)).toBe(true);
    expect(wheel.defaultPrevented).toBe(false);
    expect(documentWheel).toHaveBeenCalledOnce();
    document.removeEventListener('wheel', documentWheel);
  });

  it('focuses a zoom-only viewport on primary press without panning and accepts subsequent wheel zoom', async () => {
    viewport.behaviorPan = false;
    viewport.behaviorZoom = true;
    await elementIsStable(viewport);
    await elementIsStable(minimap);
    const outside = document.createElement('button');
    fixture.append(outside);
    outside.focus();
    const start = viewport.getTransform();

    background(minimap).dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId: 15 }));

    expect(document.activeElement).toBe(viewport);
    expect(viewport.getTransform()).toEqual(start);
    const wheel = wheelEvent({ deltaY: -10 });
    expect(minimap.dispatchEvent(wheel)).toBe(false);
    expect(wheel.defaultPrevented).toBe(true);
    expect(viewport.scale).toBeGreaterThan(start.scale);
  });

  it.each([
    { modifier: {}, name: 'unmodified' },
    { modifier: { ctrlKey: true }, name: 'Ctrl' },
    { modifier: { metaKey: true }, name: 'Meta' }
  ])('zooms from $name-wheel around the viewport center', async ({ modifier }) => {
    viewport.behaviorPan = false;
    viewport.behaviorZoom = true;
    viewport.x = 40;
    viewport.y = 30;
    viewport.scale = 2;
    await elementIsStable(viewport);
    viewport.focus();
    const zoom = vi.fn();
    const requestZoom = vi.spyOn(viewport, 'requestZoom');
    const animationFrame = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
    const animateTo = vi.spyOn(viewport, 'animateTo');
    const documentWheel = vi.fn();
    viewport.addEventListener('zoom', zoom);
    document.addEventListener('wheel', documentWheel);
    const wheel = wheelEvent({ ...modifier, clientX: 180, clientY: 100, deltaY: -10 });

    expect(minimap.dispatchEvent(wheel)).toBe(false);
    expect(wheel.defaultPrevented).toBe(true);
    expect(documentWheel).not.toHaveBeenCalled();
    expect(requestZoom).toHaveBeenCalledWith(expect.objectContaining({ source: 'minimap', event: wheel }));
    const detail = (zoom.mock.calls[0]?.[0] as CustomEvent<ViewportZoomDetail>).detail;
    expect(detail).toMatchObject({
      anchor: { x: 140, y: 105 },
      event: wheel,
      source: 'minimap'
    });
    expect(detail).not.toHaveProperty('clientX');
    expect(detail).not.toHaveProperty('clientY');
    expect(animationFrame).not.toHaveBeenCalled();
    expect(animateTo).not.toHaveBeenCalled();
    expect(detail.factor).toBeGreaterThan(1);
    const visible = viewport.getVisibleRect();
    expect(visible.x + visible.width / 2).toBeCloseTo(140);
    expect(visible.y + visible.height / 2).toBeCloseTo(105);
    document.removeEventListener('wheel', documentWheel);
  });

  it('leaves horizontal-only wheel input unclaimed when zoom is enabled and focused', async () => {
    viewport.behaviorZoom = true;
    await elementIsStable(viewport);
    viewport.focus();
    const requestZoom = vi.spyOn(viewport, 'requestZoom');
    const documentWheel = vi.fn();
    document.addEventListener('wheel', documentWheel);
    const wheel = wheelEvent({ ctrlKey: true, deltaX: 20, deltaY: 0 });

    expect(minimap.dispatchEvent(wheel)).toBe(true);
    expect(wheel.defaultPrevented).toBe(false);
    expect(documentWheel).toHaveBeenCalledOnce();
    expect(requestZoom).not.toHaveBeenCalled();
    document.removeEventListener('wheel', documentWheel);
  });

  it('leaves Ctrl-wheel unclaimed when zoom is disabled', () => {
    viewport.focus();
    const wheel = wheelEvent({ ctrlKey: true, deltaY: -10 });
    const documentWheel = vi.fn();
    const zoom = vi.fn();
    document.addEventListener('wheel', documentWheel);
    viewport.addEventListener('zoom', zoom);

    expect(minimap.dispatchEvent(wheel)).toBe(true);
    expect(wheel.defaultPrevented).toBe(false);
    expect(documentWheel).toHaveBeenCalledOnce();
    expect(zoom).not.toHaveBeenCalled();
    expect(viewport.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
    document.removeEventListener('wheel', documentWheel);
  });

  it('honors scale limits and zoom cancellation for wheel input', async () => {
    viewport.behaviorZoom = true;
    viewport.maxScale = 1.1;
    await elementIsStable(viewport);
    viewport.focus();
    viewport.addEventListener('zoom', event => event.preventDefault(), { once: true });

    expect(minimap.dispatchEvent(wheelEvent({ deltaY: -1000 }))).toBe(false);
    expect(viewport.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });

    expect(minimap.dispatchEvent(wheelEvent({ deltaY: -1000 }))).toBe(false);
    expect(viewport.scale).toBe(1.1);
    const visible = viewport.getVisibleRect();
    expect(visible.x + visible.width / 2).toBeCloseTo(200);
    expect(visible.y + visible.height / 2).toBeCloseTo(150);
  });
});

function mockSize(element: HTMLElement, width: number, height: number): void {
  Object.defineProperties(element, {
    clientHeight: { configurable: true, value: height },
    clientWidth: { configurable: true, value: width }
  });
}

function rect(init: DOMRectInit): DOMRect {
  return DOMRect.fromRect(init);
}

function previewProjection(minimap: ViewportMinimap): { offsetX: number; offsetY: number; scale: number } {
  const wrapper = minimap.shadowRoot?.querySelector<HTMLElement>('.preview');
  if (!wrapper) throw new Error('Preview wrapper did not render');
  const matrix = new DOMMatrix(wrapper.style.transform);
  const frame = wrapper.getBoundingClientRect();
  return { offsetX: frame.left, offsetY: frame.top, scale: matrix.m11 };
}

async function flushProjection(minimap: ViewportMinimap): Promise<void> {
  await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  await elementIsStable(minimap);
}

function itemKeys(minimap: ViewportMinimap): string[] {
  return [...(minimap.shadowRoot?.querySelectorAll('[data-item-key]') ?? [])].map(
    item => item.getAttribute('data-item-key')!
  );
}

function background(minimap: ViewportMinimap): SVGRectElement {
  return minimap.shadowRoot?.querySelector('[data-minimap-background]') as SVGRectElement;
}

function visibleRegion(minimap: ViewportMinimap): SVGRectElement {
  return minimap.shadowRoot?.querySelector('[data-visible-region]') as SVGRectElement;
}

function visibleRegionRect(minimap: ViewportMinimap): { x: number; y: number; width: number; height: number } {
  const indicator = visibleRegion(minimap);
  return {
    x: Number(indicator.getAttribute('x')),
    y: Number(indicator.getAttribute('y')),
    width: Number(indicator.getAttribute('width')),
    height: Number(indicator.getAttribute('height'))
  };
}

function itemRect(minimap: ViewportMinimap, key: string): { x: number; y: number; width: number; height: number } {
  const item = minimap.shadowRoot?.querySelector(`[data-item-key="${key}"]`);
  return {
    x: Number(item?.getAttribute('x')),
    y: Number(item?.getAttribute('y')),
    width: Number(item?.getAttribute('width')),
    height: Number(item?.getAttribute('height'))
  };
}

function expectVisibleRegionWithinBounds(minimap: ViewportMinimap): void {
  expectRectWithinBounds(minimap, visibleRegionRect(minimap));
}

function expectItemWithinBounds(minimap: ViewportMinimap, key: string): void {
  expectRectWithinBounds(minimap, itemRect(minimap, key));
}

function expectRectWithinBounds(
  minimap: ViewportMinimap,
  projected: { readonly x: number; readonly y: number; readonly width: number; readonly height: number }
): void {
  expect(projected.x).toBeGreaterThanOrEqual(0);
  expect(projected.y).toBeGreaterThanOrEqual(0);
  expect(projected.x + projected.width).toBeLessThanOrEqual(minimap.clientWidth);
  expect(projected.y + projected.height).toBeLessThanOrEqual(minimap.clientHeight);
}

function clickMinimap(target: Element, init: PointerEventInit): void {
  target.dispatchEvent(pointerEvent('pointerdown', init));
  target.dispatchEvent(pointerEvent('pointerup', { ...init, buttons: 0 }));
}

function dragIndicator(
  minimap: ViewportMinimap,
  { displacementX, pointerId }: { displacementX: number; pointerId: number }
): void {
  const target = visibleRegion(minimap);
  target.dispatchEvent(pointerEvent('pointerdown', { clientX: 20, pointerId }));
  target.dispatchEvent(pointerEvent('pointermove', { clientX: 20 + displacementX, pointerId }));
  target.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 20 + displacementX, pointerId }));
}

function pointerEvent(type: string, init: PointerEventInit): PointerEvent {
  return new PointerEvent(type, {
    bubbles: true,
    buttons: 1,
    cancelable: true,
    composed: true,
    isPrimary: true,
    pointerType: 'mouse',
    ...init
  });
}

function wheelEvent(init: WheelEventInit): WheelEvent {
  return new WheelEvent('wheel', { bubbles: true, cancelable: true, composed: true, ...init });
}
