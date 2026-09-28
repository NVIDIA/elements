// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import {
  Viewport,
  type ViewportNavigationSource,
  type ViewportPanDetail,
  type ViewportPanEndDetail,
  type ViewportPanProposal,
  type ViewportPanSession,
  type ViewportPanUpdateProposal,
  type ViewportTransform,
  type ViewportZoomDetail,
  type ViewportZoomProposal
} from '@nvidia-elements/core/viewport';
import '@nvidia-elements/core/viewport/define.js';

describe(Viewport.metadata.tag, () => {
  let element: Viewport;
  let fixture: HTMLElement;

  beforeEach(async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn(() => ({ matches: false }))
    );
    fixture = await createFixture(html`<nve-viewport style="width: 400px; height: 300px"></nve-viewport>`);
    element = fixture.querySelector(Viewport.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('transform, projection, and rendering', () => {
    it('defines transform-only defaults', () => {
      expect(customElements.get(Viewport.metadata.tag)).toBe(Viewport);
      expect(viewportProperties(element)).toEqual({
        autoFit: false,
        dragThreshold: 5,
        behaviorPan: false,
        behaviorZoom: false,
        fitInset: 0,
        maxScale: 20,
        minScale: 0.05,
        scale: 1,
        x: 0,
        y: 0
      });
    });

    it('keeps transform values in properties and reflects low-frequency configuration', async () => {
      element.x = 12;
      element.y = -8;
      element.scale = 3;
      element.minScale = 0.5;
      element.maxScale = 4;
      element.dragThreshold = 9;
      element.behaviorPan = 'space';
      element.behaviorZoom = true;
      element.autoFit = true;
      element.fitInset = 24;
      await elementIsStable(element);

      expect(element.hasAttribute('x')).toBe(false);
      expect(element.hasAttribute('y')).toBe(false);
      expect(element.hasAttribute('scale')).toBe(false);
      expect(element.getAttribute('min-scale')).toBe('0.5');
      expect(element.getAttribute('max-scale')).toBe('4');
      expect(element.getAttribute('drag-threshold')).toBe('9');
      expect(element.getAttribute('behavior-pan')).toBe('space');
      expect(element.hasAttribute('behavior-zoom')).toBe(true);
      expect(element.hasAttribute('autofit')).toBe(true);
      expect(element.getAttribute('fit-inset')).toBe('24');

      element.x = Number.NaN;
      element.y = Number.POSITIVE_INFINITY;
      element.scale = 0;
      element.dragThreshold = -1;

      expect({
        dragThreshold: element.dragThreshold,
        scale: element.scale,
        x: element.x,
        y: element.y
      }).toEqual({ dragThreshold: 5, scale: 0.5, x: 0, y: 0 });

      for (const invalid of [Number.NaN, Number.POSITIVE_INFINITY, -1]) {
        element.fitInset = 24;
        expect(element.fitInset).toBe(24);
        element.fitInset = invalid;
        expect(element.fitInset).toBe(0);
      }
      await elementIsStable(element);
      expect(element.getAttribute('fit-inset')).toBe('0');
    });

    it('accepts transform attributes without rewriting them during property updates', async () => {
      element.setAttribute('x', '12');
      element.setAttribute('y', '-8');
      element.setAttribute('scale', '3');
      await elementIsStable(element);

      expect({ scale: element.scale, x: element.x, y: element.y }).toEqual({ scale: 3, x: 12, y: -8 });

      element.x = 20;
      element.y = 10;
      element.scale = 4;
      await elementIsStable(element);

      expect(element.getAttribute('x')).toBe('12');
      expect(element.getAttribute('y')).toBe('-8');
      expect(element.getAttribute('scale')).toBe('3');
    });

    it('coalesces synchronous transform writes into one committed viewport fact', async () => {
      const changes: ViewportTransform[] = [];
      element.addEventListener('viewportchange', event =>
        changes.push((event as CustomEvent<ViewportTransform>).detail)
      );

      element.x = 10;
      element.y = 20;
      element.scale = 2;
      expect(changes).toEqual([]);
      await elementIsStable(element);

      expect(changes).toEqual([{ scale: 2, x: 10, y: 20 }]);
    });

    it('does not publish a viewport fact for a no-op transform write', async () => {
      const changes = vi.fn();
      element.addEventListener('viewportchange', changes);

      element.x = element.x;
      element.y = element.y;
      element.scale = element.scale;
      await elementIsStable(element);

      expect(changes).not.toHaveBeenCalled();
    });

    it('publishes a coalesced viewport fact when synchronous writes return to their initial transform', async () => {
      const changes: ViewportTransform[] = [];
      element.addEventListener('viewportchange', event =>
        changes.push((event as CustomEvent<ViewportTransform>).detail)
      );

      element.x = 10;
      expect(element.x).toBe(10);
      element.x = 0;
      await elementIsStable(element);

      expect(changes).toEqual([{ scale: 1, x: 0, y: 0 }]);
    });

    it('does not publish initial declarative or disconnected setup as a viewport change', async () => {
      const configured = document.createElement('nve-viewport');
      configured.setAttribute('x', '10');
      configured.setAttribute('y', '20');
      configured.setAttribute('scale', '2');
      const changes = vi.fn();
      configured.addEventListener('viewportchange', changes);

      fixture.append(configured);
      await elementIsStable(configured);
      expect(changes).not.toHaveBeenCalled();

      configured.remove();
      configured.x = 30;
      await elementIsStable(configured);
      configured.y = 40;
      await elementIsStable(configured);
      configured.scale = 3;
      await elementIsStable(configured);
      expect(changes).not.toHaveBeenCalled();

      fixture.append(configured);
      await elementIsStable(configured);
      expect(changes).not.toHaveBeenCalled();

      configured.x = 50;
      await elementIsStable(configured);
      expect(changes).toHaveBeenCalledOnce();
      expect(changes.mock.calls[0]?.[0]).toMatchObject({ detail: { scale: 3, x: 50, y: 40 } });

      configured.remove();
      configured.x = 60;
      fixture.append(configured);
      await elementIsStable(configured);
      expect(changes).toHaveBeenCalledOnce();

      configured.x = 70;
      await elementIsStable(configured);
      expect(changes).toHaveBeenCalledTimes(2);
    });

    it('synchronously clamps scale and reclamps it when limits change', () => {
      element.scale = 100;
      expect(element.scale).toBe(20);
      element.maxScale = 4;
      expect(element.scale).toBe(4);
      element.scale = 0.01;
      expect(element.scale).toBe(0.05);
      element.minScale = 0.5;
      expect(element.scale).toBe(0.5);
      element.minScale = 100;
      expect(element.minScale).toBe(4);
      expect(element.maxScale).toBe(4);
      expect(element.scale).toBe(4);
    });

    it('cancels animation for changed scale bounds whether or not they clamp the current transform', () => {
      const request = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValueOnce(42).mockReturnValueOnce(43);
      const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
      element.scale = 2;

      element.animateTo({ scale: 4 });
      element.maxScale = 4;
      expect(element.getTransform()).toEqual({ scale: 2, x: 0, y: 0 });

      element.animateTo({ scale: 3 });
      element.maxScale = 1;

      expect(request).toHaveBeenCalledTimes(2);
      expect(cancel).toHaveBeenCalledWith(42);
      expect(cancel).toHaveBeenCalledWith(43);
      expect(element.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
    });

    it('converts coordinates and exposes the transform and visible rectangle', async () => {
      element.x = 10;
      element.y = 20;
      element.scale = 2;
      await elementIsStable(element);

      expect(element.toViewportCoords(13, 25)).toEqual({ x: 6, y: 10 });
      expect(element.toContentCoords(6, 10)).toEqual({ x: 13, y: 25 });
      const transform = element.getTransform();
      expect(transform).toEqual({ scale: 2, x: 10, y: 20 });
      expect(element.getTransform()).not.toBe(transform);
      expect(element.getVisibleRect()).toEqual({ height: 150, width: 200, x: 10, y: 20 });
      expect(element.shadowRoot?.querySelector<HTMLElement>('.plane')?.style.transform).toBe(
        'scale(2) translate(-10px, -20px)'
      );
    });

    it('uses geometric precision within the transformed content plane', () => {
      element.style.setProperty('text-rendering', 'optimizeSpeed');
      const plane = element.shadowRoot?.querySelector<HTMLElement>('.plane');
      const content = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      element.append(content);

      expect(getComputedStyle(element).textRendering).toBe('optimizespeed');
      expect(getComputedStyle(plane as HTMLElement).textRendering).toBe('geometricprecision');
      expect(getComputedStyle(content).textRendering).toBe('geometricprecision');
    });

    it('renders the fixed interaction frame as the focus-ring target', () => {
      const frame = viewportFrame(element);
      const plane = element.shadowRoot?.querySelector<HTMLElement>('.plane');

      expect(frame.matches('[internal-host][focusable]')).toBe(true);
      expect(plane?.hasAttribute('focusable')).toBe(false);
      expect(getComputedStyle(frame).outlineOffset).toBe('-2px');
    });

    it('gates host keyboard focusability on navigation behavior', async () => {
      expect(element.hasAttribute('tabindex')).toBe(false);

      element.behaviorPan = true;
      await elementIsStable(element);
      expect(element.getAttribute('tabindex')).toBe('0');

      element.behaviorPan = false;
      await elementIsStable(element);
      expect(element.hasAttribute('tabindex')).toBe(false);

      element.behaviorZoom = true;
      await elementIsStable(element);
      expect(element.getAttribute('tabindex')).toBe('0');
    });

    it('renders transformed content beneath a fixed interactive overlay', () => {
      const plane = element.shadowRoot?.querySelector<HTMLElement>('.plane');
      const overlayLayer = element.shadowRoot?.querySelector<HTMLElement>('.overlay');
      const frame = viewportFrame(element);
      const slots = [...(element.shadowRoot?.querySelectorAll('slot') ?? [])];
      const background = document.createElement('svg');
      background.slot = 'background';
      const contribution = document.createElement('div');
      const overlay = document.createElement('div');
      overlay.slot = 'overlay';
      element.append(background, contribution, overlay);

      expect(frame).toBeInstanceOf(HTMLElement);
      expect(slots.map(slot => slot.name)).toEqual(['background', '', 'overlay']);
      expect(getComputedStyle(plane as HTMLElement).pointerEvents).toBe('none');
      expect(getComputedStyle(overlayLayer as HTMLElement).pointerEvents).toBe('none');
      expect(getComputedStyle(background).pointerEvents).toBe('none');
      expect(getComputedStyle(contribution).pointerEvents).toBe('auto');
      expect(getComputedStyle(overlay).pointerEvents).toBe('auto');
      expect(getComputedStyle(element).overflow).toBe('hidden');
    });
  });

  describe('ownership and semantic events', () => {
    it('reports effective admission only when pan or zoom availability changes', async () => {
      const changes: Event[] = [];
      const observed: { pannable: boolean; zoomable: boolean; panAttribute: string | null }[] = [];
      fixture.addEventListener('capabilitieschange', event => {
        changes.push(event);
        observed.push({
          pannable: element.pannable,
          zoomable: element.zoomable,
          panAttribute: element.getAttribute('behavior-pan')
        });
      });
      expect([element.pannable, element.zoomable]).toEqual([false, false]);

      element.behaviorPan = true;
      element.behaviorZoom = true;
      await elementIsStable(element);
      expect([element.pannable, element.zoomable]).toEqual([true, true]);
      expect(element.hasAttribute('pannable')).toBe(false);
      expect(element.hasAttribute('zoomable')).toBe(false);
      expect(changes).toHaveLength(1);
      expect(observed[0]).toEqual({ pannable: true, zoomable: true, panAttribute: '' });
      expect(changes[0]).toMatchObject({ bubbles: true, composed: true });
      expect('detail' in changes[0]!).toBe(false);
      expect(element.hasAttribute('behavior-pan')).toBe(true);
      expect(element.hasAttribute('behavior-zoom')).toBe(true);

      element.behaviorPan = 'space';
      await elementIsStable(element);
      expect(element.pannable).toBe(true);
      expect(changes).toHaveLength(1);

      element.behaviorPan = false;
      await elementIsStable(element);
      expect(element.pannable).toBe(false);
      expect(changes).toHaveLength(2);

      element.behaviorZoom = false;
      await elementIsStable(element);
      expect(element.zoomable).toBe(false);
      expect(changes).toHaveLength(3);
    });

    it('admits discrete control pans and zooms and normalizes the proposed scale', async () => {
      element.behaviorPan = true;
      element.behaviorZoom = true;
      const pan = vi.fn();
      const zoom = vi.fn();
      element.addEventListener('pan', pan);
      element.addEventListener('zoom', zoom);
      const event = new Event('input');
      const controlZoom: ViewportZoomProposal = {
        source: 'control',
        event,
        anchor: { x: 0, y: 0 },
        factor: 100,
        next: { x: 25, y: 5, scale: 100 }
      };

      expect(element.requestPan({ source: 'control', event, next: { x: 25, y: 5, scale: 1 } })).toBe(true);
      expect(element.requestZoom(controlZoom)).toBe(true);

      expect(pan.mock.calls[0]?.[0]).toMatchObject({
        cancelable: true,
        detail: { source: 'control', event, next: { x: 25, y: 5, scale: 1 } }
      });
      expect(zoom.mock.calls[0]?.[0]).toMatchObject({
        cancelable: true,
        detail: { source: 'control', event, next: { x: 25, y: 5, scale: 20 } }
      });
      expect('clientX' in (zoom.mock.calls[0]?.[0] as CustomEvent).detail).toBe(false);
      expect('clientY' in (zoom.mock.calls[0]?.[0] as CustomEvent).detail).toBe(false);
      expect(element.getTransform()).toEqual({ x: 25, y: 5, scale: 20 });
      await elementIsStable(element);
    });

    it('rejects disabled proposals without events while direct writes remain programmatic', async () => {
      const pan = vi.fn();
      const zoom = vi.fn();
      const change = vi.fn();
      element.addEventListener('pan', pan);
      element.addEventListener('zoom', zoom);
      element.addEventListener('viewportchange', change);
      const event = new Event('input');

      expect(element.requestPan({ source: 'control', event, next: { x: 10, y: 0, scale: 1 } })).toBe(false);
      expect(
        element.requestZoom({
          source: 'control',
          event,
          anchor: { x: 0, y: 0 },
          clientX: 0,
          clientY: 0,
          factor: 2,
          next: { x: 0, y: 0, scale: 2 }
        })
      ).toBe(false);
      expect(element.startPan({ source: 'control', event, next: { x: 10, y: 0, scale: 1 } })).toBeUndefined();
      element.x = 10;
      element.y = 20;
      element.scale = 2;
      await elementIsStable(element);

      expect(pan).not.toHaveBeenCalled();
      expect(zoom).not.toHaveBeenCalled();
      expect(change).toHaveBeenCalledOnce();
      expect(change.mock.calls[0]?.[0]).toMatchObject({ detail: { x: 10, y: 20, scale: 2 } });
    });

    it('keeps a canceled panstart interactive and ends its session exactly once', () => {
      type UpdateHasSource = 'source' extends keyof ViewportPanUpdateProposal ? true : false;
      const updateHasSource: UpdateHasSource = false;
      expect(updateHasSource).toBe(false);
      const acceptsUpdate: Parameters<ViewportPanSession['update']>[0] = {
        event: new Event('input'),
        next: { x: 0, y: 0, scale: 1 }
      };
      expect(acceptsUpdate).not.toHaveProperty('source');
      element.behaviorPan = true;
      const events: Event[] = [];
      element.addEventListener('panstart', event => {
        events.push(event);
        event.preventDefault();
      });
      element.addEventListener('pan', event => events.push(event));
      element.addEventListener('panend', event => events.push(event));
      const event = new Event('input');
      const session = element.startPan({ source: 'control', event, next: { x: 10, y: 0, scale: 1 } });

      expect(session?.start).toEqual({ x: 0, y: 0, scale: 1 });
      element.behaviorPan = false;
      expect(session?.update({ event, next: { x: 20, y: 0, scale: 1 } })).toBe(false);
      session?.end({ event, interrupted: false, reason: 'up' });
      session?.end({ event, interrupted: false, reason: 'up' });
      expect(events.map(item => item.type)).toEqual(['panstart', 'pan', 'pan', 'panend']);
      expect(events.map(item => (item as CustomEvent).detail.source)).toEqual([
        'control',
        'control',
        'control',
        'control'
      ]);
      expect(element.x).toBe(0);
    });

    it('skips only a canceled pan update in an accepted session', () => {
      element.behaviorPan = true;
      const event = new Event('input');
      const session = element.startPan({ source: 'control', event, next: { x: 10, y: 0, scale: 1 } });
      expect(element.x).toBe(10);
      element.addEventListener('pan', item => item.preventDefault(), { once: true });
      expect(session?.update({ event, next: { x: 20, y: 0, scale: 1 } })).toBe(false);
      expect(element.x).toBe(10);
      expect(session?.update({ event, next: { x: 30, y: 0, scale: 1 } })).toBe(true);
      expect(element.x).toBe(30);
      session?.end({ event, interrupted: false, reason: 'up' });
    });

    it('keeps the initial pan target and session source despite mutation of the caller proposal', () => {
      element.behaviorPan = true;
      const event = new Event('input');
      const proposal: ViewportPanProposal = { source: 'control', event, next: { x: 10, y: 0, scale: 1 } };
      let panstart: ViewportPanDetail | undefined;
      const pans: ViewportPanDetail[] = [];
      let panend: ViewportPanEndDetail | undefined;
      element.addEventListener('panstart', item => {
        panstart = (item as CustomEvent<ViewportPanDetail>).detail;
        Object.assign(proposal.next, { x: 900 });
        (proposal as { source: ViewportNavigationSource }).source = 'minimap';
      });
      element.addEventListener('pan', item => pans.push((item as CustomEvent<ViewportPanDetail>).detail));
      element.addEventListener('panend', item => {
        panend = (item as CustomEvent<ViewportPanEndDetail>).detail;
      });

      const session = element.startPan(proposal);
      expect(session?.update({ event, next: { x: 10, y: 0, scale: 1 } })).toBe(false);
      session?.end({ event, interrupted: false, reason: 'up' });

      expect(panstart?.next.x).toBe(10);
      expect(pans[0]?.next.x).toBe(10);
      expect(pans.map(detail => detail.source)).toEqual(['control', 'control']);
      expect(element.x).toBe(10);
      expect(panend?.source).toBe('control');
    });

    it('keeps pan targets and the session baseline independent of public snapshots', () => {
      element.behaviorPan = true;
      const event = new Event('input');
      const panStarts: ViewportTransform[] = [];
      let panend: ViewportPanEndDetail | undefined;
      element.addEventListener('panstart', item => {
        const detail = (item as CustomEvent<ViewportPanDetail>).detail;
        Object.assign(detail.next, { x: 900 });
        Object.assign(detail.start, { x: 900 });
      });
      element.addEventListener('pan', item => {
        const detail = (item as CustomEvent<ViewportPanDetail>).detail;
        panStarts.push({ ...detail.start });
        Object.assign(detail.next, { x: 900 });
        Object.assign(detail.start, { x: 900 });
      });
      element.addEventListener('panend', item => {
        panend = (item as CustomEvent<ViewportPanEndDetail>).detail;
      });

      const session = element.startPan({ source: 'control', event, next: { x: 10, y: 0, scale: 1 } });
      expect(element.x).toBe(10);
      expect(session?.start).toEqual({ x: 0, y: 0, scale: 1 });
      if (!session) throw new Error('Expected an admitted pan session');
      Object.assign(session.start, { x: 800 });
      expect(session.update({ event, next: { x: 20, y: 0, scale: 1 } })).toBe(true);
      session.end({ event, interrupted: false, reason: 'up' });

      expect(element.x).toBe(20);
      expect(panStarts).toEqual([
        { x: 0, y: 0, scale: 1 },
        { x: 0, y: 0, scale: 1 }
      ]);
      expect(panend?.start).toEqual({ x: 0, y: 0, scale: 1 });
      if (panend) Object.assign(panend.start, { x: 700 });
      expect(session.start.x).toBe(800);
    });

    it('commits the private zoom target despite mutations to zoom detail values', () => {
      element.behaviorZoom = true;
      element.addEventListener('zoom', item => {
        const detail = (item as CustomEvent<ViewportZoomDetail>).detail;
        Object.assign(detail.next, { x: 900, scale: 10 });
        Object.assign(detail.start, { x: 900 });
      });

      expect(
        element.requestZoom({
          source: 'control',
          event: new Event('input'),
          anchor: { x: 0, y: 0 },
          factor: 2,
          next: { x: 10, y: 5, scale: 2 }
        })
      ).toBe(true);
      expect(element.getTransform()).toEqual({ x: 10, y: 5, scale: 2 });
    });

    it('preserves an admitted pan session after behavior is disabled and rejects the next one', () => {
      element.behaviorPan = true;
      const pan = vi.fn();
      const panend = vi.fn();
      element.addEventListener('pan', pan);
      element.addEventListener('panend', panend);
      const event = new Event('input');
      const session = element.startPan({ source: 'control', event, next: { x: 10, y: 0, scale: 1 } });

      element.behaviorPan = false;
      expect(session?.update({ event, next: { x: 20, y: 0, scale: 1 } })).toBe(true);
      session?.end({ event, interrupted: false, reason: 'up' });

      expect(pan).toHaveBeenCalledTimes(2);
      expect(panend).toHaveBeenCalledOnce();
      expect(panend.mock.calls[0]?.[0]).toMatchObject({ detail: { interrupted: false, reason: 'up' } });
      expect(element.x).toBe(20);
      expect(element.startPan({ source: 'control', event, next: { x: 30, y: 0, scale: 1 } })).toBeUndefined();
    });

    it('continues an admitted pinch after zoom behavior is disabled', async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      vi.spyOn(element, 'setPointerCapture').mockImplementation(() => {});
      const zoom = vi.fn();
      element.addEventListener('zoom', zoom);

      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 61, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 62, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 62, pointerType: 'touch' }));
      element.behaviorZoom = false;
      await elementIsStable(element);
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 30, pointerId: 62, pointerType: 'touch' }));

      expect(zoom).toHaveBeenCalledTimes(2);
      expect(element.scale).toBe(3);
      element.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 61, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 62, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 63, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 64, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 64, pointerType: 'touch' }));
      expect(zoom).toHaveBeenCalledTimes(2);
      expect(
        element.requestZoom({
          source: 'control',
          event: new Event('input'),
          anchor: { x: 0, y: 0 },
          clientX: 0,
          clientY: 0,
          factor: 2,
          next: { x: 0, y: 0, scale: 6 }
        })
      ).toBe(false);
    });

    it('makes semantic navigation events composed, bubbling, and selectively cancelable', async () => {
      element.behaviorPan = true;
      element.behaviorZoom = true;
      await elementIsStable(element);
      element.focus();
      const pan = vi.fn((event: Event) => event.preventDefault());
      const zoom = vi.fn((event: Event) => event.preventDefault());
      fixture.addEventListener('pan', pan);
      fixture.addEventListener('zoom', zoom);

      element.dispatchEvent(wheelEvent({ deltaY: 10 }));
      element.dispatchEvent(wheelEvent({ ctrlKey: true, deltaY: -10 }));

      expect(pan).toHaveBeenCalledOnce();
      expect(zoom).toHaveBeenCalledOnce();
      expect(pan.mock.calls[0]?.[0]).toMatchObject({ bubbles: true, cancelable: true, composed: true });
      expect(zoom.mock.calls[0]?.[0]).toMatchObject({ bubbles: true, cancelable: true, composed: true });
      expect({ scale: element.scale, x: element.x, y: element.y }).toEqual({ scale: 1, x: 0, y: 0 });
    });

    it('publishes a committed pointer-pan transform after its immediate semantic lifecycle', async () => {
      await enablePointerPanning(element);
      const events: Event[] = [];
      for (const type of ['panstart', 'pan', 'viewportchange', 'panend']) {
        element.addEventListener(type, event => events.push(event));
      }

      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 10, pointerId: 1 }));
      await elementIsStable(element);

      expect(events.map(event => event.type)).toEqual(['panstart', 'pan', 'panend', 'viewportchange']);
      expect(events.map(event => event.cancelable)).toEqual([true, true, false, false]);
      expect(events.every(event => event.bubbles && event.composed)).toBe(true);
    });

    it('composes an accepted wheel pan with later movement in an active pointer pan', async () => {
      await enablePointerPanning(element);
      element.focus();
      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
      expect(element.x).toBe(-10);

      element.dispatchEvent(wheelEvent({ deltaX: 30 }));
      expect(element.x).toBe(20);
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

      expect(element.x).toBe(10);
      element.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 20, pointerId: 1 }));
    });

    it('does not rebase an active pointer pan for a canceled wheel proposal', async () => {
      await enablePointerPanning(element);
      element.focus();
      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
      element.addEventListener('pan', event => {
        if (event.detail.source === 'wheel') event.preventDefault();
      });

      element.dispatchEvent(wheelEvent({ deltaX: 30 }));
      expect(element.x).toBe(-10);
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

      expect(element.x).toBe(-20);
      element.dispatchEvent(pointerEvent('pointerup', { buttons: 0, clientX: 20, pointerId: 1 }));
    });

    it('keeps the start focal content point while a pinch center translates and scales', async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      vi.spyOn(element, 'setPointerCapture').mockImplementation(() => {});
      const zoom = vi.fn();
      element.addEventListener('zoom', zoom);
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
      element.dispatchEvent(
        pointerEvent('pointermove', { clientX: 20, clientY: 10, pointerId: 2, pointerType: 'touch' })
      );

      expect(zoom).toHaveBeenCalledOnce();
      const detail = (zoom.mock.calls[0]?.[0] as CustomEvent<ViewportZoomDetail>).detail;
      expect(detail).toMatchObject({ source: 'pinch', anchor: { x: 5, y: 0 }, clientX: 10, clientY: 5 });
      expect(detail.factor).toBeCloseTo(Math.sqrt(5));
      expect(detail.next.scale).toBeCloseTo(Math.sqrt(5));
      expect(detail.next.x).toBeCloseTo(5 - 10 / Math.sqrt(5));
      expect(detail.next.y).toBeCloseTo(-5 / Math.sqrt(5));
      expect(element.getTransform()).toEqual(detail.next);
    });

    it('emits a canceled pinch zoom without moving or starting a pointer pan', async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      vi.spyOn(element, 'setPointerCapture').mockImplementation(() => {});
      const zoom = vi.fn((event: CustomEvent<ViewportZoomDetail>) => {
        if (event.detail.source === 'pinch') event.preventDefault();
      });
      const pan = vi.fn();
      element.addEventListener('zoom', zoom);
      element.addEventListener('pan', pan);
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 2, pointerType: 'touch' }));

      expect(zoom).toHaveBeenCalledOnce();
      expect(element.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
      expect(pan).not.toHaveBeenCalled();
      expect(element.matches(':state(panning)')).toBe(false);
    });

    it('does not commit a later pointer-pan update that synchronously ends its session', async () => {
      await enablePointerPanning(element);
      const panend = vi.fn();
      element.addEventListener('panend', panend);
      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 5, pointerId: 1 }));
      expect(element.x).toBe(-5);
      element.addEventListener(
        'pan',
        () => element.dispatchEvent(pointerEvent('pointercancel', { clientX: 10, pointerId: 1 })),
        { once: true }
      );

      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));

      expect(element.x).toBe(-5);
      expect(panend).toHaveBeenCalledOnce();
      expect(panend.mock.calls[0]?.[0]).toMatchObject({ detail: { interrupted: true, reason: 'cancel' } });
    });

    it('dispatches a discrete keyboard pan proposal before its default transform', async () => {
      element.behaviorPan = true;
      await elementIsStable(element);
      element.focus();
      let canceledRequest: CustomEvent | undefined;
      const cancel = (event: Event): void => {
        canceledRequest = event as CustomEvent;
        event.preventDefault();
      };
      element.addEventListener('pan', cancel);
      const canceled = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        composed: true,
        key: 'ArrowRight'
      });

      expect(element.dispatchEvent(canceled)).toBe(false);
      expect(canceledRequest).toMatchObject({
        bubbles: true,
        cancelable: true,
        composed: true,
        detail: { next: { scale: 1, x: 20, y: 0 }, source: 'keyboard', start: { scale: 1, x: 0, y: 0 } }
      });
      expect(element.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });

      element.removeEventListener('pan', cancel);
      element.dispatchEvent(
        new KeyboardEvent('keydown', { bubbles: true, cancelable: true, composed: true, key: 'ArrowRight' })
      );

      expect(element.getTransform()).toEqual({ scale: 1, x: 20, y: 0 });
    });
  });

  describe('animation integration', () => {
    it('animates one keyboard zoom proposal and steps later keys from the pending destination', async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      element.focus();
      const animationFrame = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
      const animateTo = vi.spyOn(element, 'animateTo');
      const details: Record<string, unknown>[] = [];
      element.addEventListener('zoom', event => details.push((event as CustomEvent).detail as Record<string, unknown>));

      for (let step = 0; step < 3; step += 1) {
        element.dispatchEvent(
          new KeyboardEvent('keydown', { bubbles: true, cancelable: true, composed: true, key: '+' })
        );
      }

      expect(details.map(detail => (detail.next as ViewportTransform).scale)).toEqual([2, 4, 8]);
      expect(details[0]).toMatchObject({ anchor: { x: 200, y: 150 }, source: 'keyboard' });
      expect(details[0]).not.toHaveProperty('clientX');
      expect(details[0]).not.toHaveProperty('clientY');
      expect(details[0]).not.toHaveProperty('animated');
      expect(animationFrame).toHaveBeenCalledTimes(3);
      expect(animateTo.mock.calls.map(([target]) => target.scale)).toEqual([2, 4, 8]);
      expect(element.scale).toBe(1);
    });

    it('animates one command zoom proposal without a synthetic client point', async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      const animationFrame = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      const animateTo = vi.spyOn(element, 'animateTo');
      const zoom = vi.fn();
      element.addEventListener('zoom', zoom);

      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));

      expect(zoom).toHaveBeenCalledOnce();
      const detail = (zoom.mock.calls[0]?.[0] as CustomEvent).detail;
      expect(detail).toMatchObject({ anchor: { x: 200, y: 150 }, source: 'command' });
      expect(detail).not.toHaveProperty('clientX');
      expect(detail).not.toHaveProperty('clientY');
      expect(detail).not.toHaveProperty('animated');
      expect(animationFrame).toHaveBeenCalledOnce();
      expect(animateTo).toHaveBeenCalledOnce();
      expect(element.scale).toBe(1);
    });

    it.each([
      { source: 'keyboard', zoomIn: () => keyEvent({ key: '+' }), zoomOut: () => keyEvent({ key: '-' }) },
      {
        source: 'command',
        zoomIn: () => new CommandEvent('command', { command: '--zoom-in' }),
        zoomOut: () => new CommandEvent('command', { command: '--zoom-out' })
      }
    ])(
      'stops a pending $source zoom-in when the next animated request reverses it',
      async ({ source, zoomIn, zoomOut }) => {
        element.behaviorZoom = true;
        await elementIsStable(element);
        element.focus();
        const frames = new Map<number, FrameRequestCallback>();
        let nextFrame = 0;
        vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(callback => {
          const frame = ++nextFrame;
          frames.set(frame, callback);
          return frame;
        });
        const cancelFrame = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(frame => {
          frames.delete(frame);
        });
        const zoom = vi.fn();
        element.addEventListener('zoom', zoom);

        element.dispatchEvent(zoomIn());
        const pendingFrame = nextFrame;
        expect(frames.has(pendingFrame)).toBe(true);
        element.dispatchEvent(zoomOut());

        expect(zoom).toHaveBeenCalledTimes(2);
        expect(zoom.mock.calls.map(([event]) => (event as CustomEvent<ViewportZoomDetail>).detail.next.scale)).toEqual([
          2, 1
        ]);
        expect(
          zoom.mock.calls.every(([event]) => (event as CustomEvent<ViewportZoomDetail>).detail.source === source)
        ).toBe(true);
        expect(cancelFrame).toHaveBeenCalledWith(pendingFrame);
        expect(frames.size).toBe(0);
        expect(element.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
      }
    );

    it.each([
      ['keyboard', () => new KeyboardEvent('keydown', { bubbles: true, cancelable: true, composed: true, key: '+' })],
      ['command', () => new CommandEvent('command', { command: '--zoom-in' })]
    ] as const)('does not animate a canceled %s zoom', async (_source, makeEvent) => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      element.focus();
      const animationFrame = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      const animateTo = vi.spyOn(element, 'animateTo');
      const zoom = vi.fn((event: Event) => event.preventDefault());
      element.addEventListener('zoom', zoom);

      element.dispatchEvent(makeEvent());

      expect(zoom).toHaveBeenCalledOnce();
      expect(animationFrame).not.toHaveBeenCalled();
      expect(animateTo).not.toHaveBeenCalled();
      expect(element.getTransform()).toEqual({ x: 0, y: 0, scale: 1 });
    });

    it('keeps an earlier accepted zoom animation running when a later zoom is canceled', async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      element.focus();
      const frames = new Map<number, FrameRequestCallback>();
      let nextFrame = 0;
      vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(callback => {
        const frame = ++nextFrame;
        frames.set(frame, callback);
        return frame;
      });
      const cancelFrame = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(frame => {
        frames.delete(frame);
      });
      const zoom = vi.fn();
      element.addEventListener('zoom', zoom);

      element.dispatchEvent(keyEvent({ key: '+' }));
      const acceptedFrame = nextFrame;
      element.addEventListener('zoom', event => event.preventDefault(), { once: true });
      element.dispatchEvent(keyEvent({ key: '+' }));

      expect(zoom).toHaveBeenCalledTimes(2);
      expect((zoom.mock.calls[1]?.[0] as CustomEvent).detail.next.scale).toBe(4);
      expect(cancelFrame).not.toHaveBeenCalled();
      expect(frames.has(acceptedFrame)).toBe(true);
      expect(element.scale).toBe(1);

      const first = frames.get(acceptedFrame);
      if (!first) throw new Error('Expected the accepted animation frame');
      frames.delete(acceptedFrame);
      first(0);
      const second = frames.get(nextFrame);
      if (!second) throw new Error('Expected the continuing animation frame');
      second(300);

      expect(element.scale).toBe(2);
    });

    it.each(['canceled pan', 'canceled panstart', 'no-op pan', 'clamped no-op zoom'] as const)(
      'keeps a keyboard zoom animation running after a %s proposal',
      async kind => {
        element.behaviorPan = true;
        element.behaviorZoom = true;
        element.minScale = 1;
        await elementIsStable(element);
        element.focus();
        const frames = new Map<number, FrameRequestCallback>();
        let nextFrame = 0;
        vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation(callback => {
          const frame = ++nextFrame;
          frames.set(frame, callback);
          return frame;
        });
        const cancelFrame = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(frame => {
          frames.delete(frame);
        });
        element.dispatchEvent(keyEvent({ key: '+' }));
        const acceptedFrame = nextFrame;
        const event = new Event('input');
        const pan = vi.fn();
        const zoom = vi.fn();
        element.addEventListener('pan', pan);
        element.addEventListener('zoom', zoom);

        if (kind === 'canceled pan') {
          element.addEventListener('pan', item => item.preventDefault(), { once: true });
          expect(element.requestPan({ source: 'control', event, next: { x: 10, y: 0, scale: 1 } })).toBe(false);
          expect(pan).toHaveBeenCalledOnce();
        } else if (kind === 'canceled panstart') {
          element.addEventListener('panstart', item => item.preventDefault(), { once: true });
          const session = element.startPan({ source: 'control', event, next: { x: 10, y: 0, scale: 1 } });
          expect(pan).toHaveBeenCalledOnce();
          session?.end({ event, interrupted: false, reason: 'up' });
        } else if (kind === 'no-op pan') {
          expect(element.requestPan({ source: 'control', event, next: element.getTransform() })).toBe(false);
          expect(pan).toHaveBeenCalledOnce();
        } else {
          expect(
            element.requestZoom({
              source: 'control',
              event,
              anchor: { x: 0, y: 0 },
              factor: 0.25,
              next: { x: 0, y: 0, scale: 0.25 }
            })
          ).toBe(false);
          expect(zoom).toHaveBeenCalledOnce();
          expect((zoom.mock.calls[0]?.[0] as CustomEvent<ViewportZoomDetail>).detail.next.scale).toBe(1);
        }

        expect(cancelFrame).not.toHaveBeenCalled();
        expect(frames.has(acceptedFrame)).toBe(true);
        const first = frames.get(acceptedFrame);
        if (!first) throw new Error('Expected the accepted animation frame');
        frames.delete(acceptedFrame);
        first(0);
        const second = frames.get(nextFrame);
        if (!second) throw new Error('Expected the continuing animation frame');
        second(300);
        expect(element.scale).toBe(2);
      }
    );

    it('commits wheel and pinch zoom immediately without scheduling an animation', async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      element.focus();
      vi.spyOn(element, 'setPointerCapture').mockImplementation(() => {});
      const animationFrame = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      const animateTo = vi.spyOn(element, 'animateTo');
      const zoom = vi.fn();
      element.addEventListener('zoom', zoom);

      element.dispatchEvent(wheelEvent({ ctrlKey: true, deltaY: -10 }));
      const afterWheel = element.scale;
      expect(afterWheel).toBeGreaterThan(1);
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 70, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 71, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 71, pointerType: 'touch' }));

      expect(zoom).toHaveBeenCalledTimes(2);
      expect((zoom.mock.calls[0]?.[0] as CustomEvent).detail.source).toBe('wheel');
      expect((zoom.mock.calls[1]?.[0] as CustomEvent).detail.source).toBe('pinch');
      expect(element.scale).toBeGreaterThan(afterWheel);
      expect(animationFrame).not.toHaveBeenCalled();
      expect(animateTo).not.toHaveBeenCalled();
    });

    it('publishes animateTo transform as one render-coalesced viewport fact without navigation events', async () => {
      const changes: ViewportTransform[] = [];
      const semanticEvents = vi.fn();
      element.addEventListener('viewportchange', event =>
        changes.push((event as CustomEvent<ViewportTransform>).detail)
      );
      element.addEventListener('pan', semanticEvents);
      element.addEventListener('zoom', semanticEvents);
      const target = { scale: 2, x: 10, y: 20 };

      element.animateTo(target, { duration: 0 });

      expect({ scale: element.scale, x: element.x, y: element.y }).toEqual(target);
      expect(changes).toEqual([]);
      expect(semanticEvents).not.toHaveBeenCalled();

      await elementIsStable(element);

      expect(changes).toEqual([target]);
      expect(semanticEvents).not.toHaveBeenCalled();
    });

    it('cancels an animation when external transform changes', () => {
      const request = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

      element.animateTo({ scale: 4, x: 10 });
      expect(request).toHaveBeenCalledOnce();
      element.x = 20;

      expect(cancel).toHaveBeenCalledWith(42);
    });

    it('cancels an animation when an external assignment normalizes to the current transform', () => {
      const request = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
      element.scale = element.minScale;
      element.animateTo({ scale: 4 });

      element.scale = 0;

      expect(request).toHaveBeenCalledOnce();
      expect(cancel).toHaveBeenCalledWith(42);
      expect(element.getTransform()).toEqual({ scale: element.minScale, x: 0, y: 0 });
    });

    it('rebases an active pointer-pan session after an external transform commit', async () => {
      await enablePointerPanning(element);

      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
      element.x = 100;
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

      expect(element.getTransform()).toEqual({ scale: 1, x: 90, y: 0 });
    });

    it('rebases an active pointer-pan session after animation application', async () => {
      await enablePointerPanning(element);

      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
      element.animateTo({ x: 100 }, { duration: 0 });
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

      expect(element.getTransform()).toEqual({ scale: 1, x: 90, y: 0 });
    });
  });

  describe('reveal and fitting', () => {
    it('ignores fitting requests before its internal frame renders', () => {
      const pending = document.createElement(Viewport.metadata.tag) as Viewport;
      pending.behaviorZoom = true;
      pending.append(document.createElement('div'));
      fixture.append(pending);

      expect(() => pending.fitContents()).not.toThrow();
      expect(() => pending.dispatchEvent(new CommandEvent('command', { command: '--zoom-to-fit' }))).not.toThrow();
      expect(pending.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
    });

    it('handles zoom commands before its internal frame renders', () => {
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: true }))
      );
      const pending = document.createElement(Viewport.metadata.tag) as Viewport;
      pending.behaviorZoom = true;
      fixture.append(pending);

      for (const command of ['--zoom-in', '--zoom-out', '--zoom-reset']) {
        expect(() => pending.dispatchEvent(new CommandEvent('command', { command }))).not.toThrow();
      }
      expect(pending.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
    });

    it('applies public reveal targets immediately by default', () => {
      element.scale = 2;
      element.reveal({ x: 300, y: 200 });

      expect(element.getTransform()).toEqual({ scale: 2, x: 200, y: 125 });
    });

    it('uses the animation controller default duration or an explicit reveal duration', () => {
      const animateTo = vi.spyOn(element, 'animateTo').mockImplementation(() => {});
      const region = { x: 300, y: 200 };

      element.reveal(region, { animated: true });
      element.reveal(region, { animated: true, duration: 500 });

      expect(animateTo).toHaveBeenNthCalledWith(1, { scale: 1, x: 100, y: 50 });
      expect(animateTo).toHaveBeenNthCalledWith(2, { scale: 1, x: 100, y: 50 }, { duration: 500 });
    });

    it('fits direct default-slot boxes with configured or explicit insets and excludes named slots', () => {
      const pan = vi.fn();
      const zoom = vi.fn();
      element.addEventListener('pan', pan);
      element.addEventListener('zoom', zoom);
      vi.spyOn(viewportFrame(element), 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 300, width: 400, x: 100, y: 50 })
      );
      const content = document.createElement('div');
      vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 100, width: 200, x: 150, y: 100 })
      );
      const background = document.createElement('div');
      background.slot = 'background';
      vi.spyOn(background, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ height: 1000, width: 1000 }));
      element.append(background, content);

      element.fitInset = 40;
      element.fitContents();

      expect(element.scale).toBe(1.6);
      expect(vi.mocked(background.getBoundingClientRect)).not.toHaveBeenCalled();
      element.x = 0;
      element.y = 0;
      element.scale = 1;
      element.fitContents({ inset: 0 });

      expect(element.scale).toBe(2);
      expect(pan).not.toHaveBeenCalled();
      expect(zoom).not.toHaveBeenCalled();
    });

    it('animates an explicit fitContents target instead of applying it synchronously', () => {
      const request = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      vi.spyOn(viewportFrame(element), 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 300, width: 400, x: 100, y: 50 })
      );
      const content = document.createElement('div');
      vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 100, width: 200, x: 150, y: 100 })
      );
      element.append(content);

      element.fitContents({ animated: true });

      expect(request).toHaveBeenCalledOnce();
      expect(element.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
    });
  });

  describe('autofit', () => {
    it('preserves pending autofit when a zoom proposal is canceled', async () => {
      const customTag = `viewport-autofit-canceled-zoom-${crypto.randomUUID()}`;
      const custom = document.createElement(customTag);
      vi.spyOn(custom, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 100, width: 200, x: 150, y: 100 })
      );
      element.append(custom);
      element.behaviorZoom = true;
      element.autoFit = true;
      await elementIsStable(element);
      element.addEventListener('zoom', event => event.preventDefault(), { once: true });

      const fitted = untilEvent(element, 'viewportchange');
      expect(
        element.requestZoom({
          anchor: { x: 200, y: 150 },
          event: new Event('input'),
          factor: 2,
          next: { scale: 2, x: 0, y: 0 },
          source: 'control'
        })
      ).toBe(false);
      customElements.define(customTag, class extends HTMLElement {});
      await fitted;

      expect(element.scale).toBe(2);
      expect(element.x).not.toBe(0);
    });

    it('autofits the initially measurable default-slot children once', async () => {
      vi.spyOn(viewportFrame(element), 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 300, width: 400, x: 100, y: 50 })
      );
      const content = document.createElement('div');
      vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 100, width: 200, x: 150, y: 100 })
      );
      element.append(content);
      const changes = vi.fn();
      element.addEventListener('viewportchange', changes);

      const fitted = untilEvent(element, 'viewportchange');
      element.fitInset = 20;
      element.autoFit = true;
      await fitted;
      await elementIsStable(element);

      expect(viewportProperties(element)).toMatchObject({ autoFit: true, fitInset: 20, scale: 1.8 });
      expect(element.x).toBeCloseTo(38.8889);
      expect(element.y).toBeCloseTo(16.6667);
      expect(changes).toHaveBeenCalledOnce();
    });

    it('cancels a definition-gated autofit when application transform takes ownership', async () => {
      const customTag = `viewport-autofit-cancel-${crypto.randomUUID()}`;
      const custom = document.createElement(customTag);
      vi.spyOn(custom, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 100, width: 200, x: 150, y: 100 })
      );
      element.append(custom);

      element.autoFit = true;
      await elementIsStable(element);
      element.x = 25;
      customElements.define(customTag, class extends HTMLElement {});
      await waitForAnimationFrames();

      expect(element.getTransform()).toEqual({ scale: 1, x: 25, y: 0 });
    });

    it('keeps an immediate animation transform authoritative over a pending initial autofit', async () => {
      const customTag = `viewport-autofit-animation-${crypto.randomUUID()}`;
      const custom = document.createElement(customTag);
      vi.spyOn(custom, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 100, width: 200, x: 150, y: 100 })
      );
      element.append(custom);
      const changes = vi.fn();
      element.addEventListener('viewportchange', changes);

      element.autoFit = true;
      await elementIsStable(element);
      element.animateTo({ x: 25 }, { duration: 0 });
      customElements.define(customTag, class extends HTMLElement {});
      await waitForAnimationFrames();
      await elementIsStable(element);

      expect(element.getTransform()).toEqual({ scale: 1, x: 25, y: 0 });
      expect(changes).toHaveBeenCalledOnce();
    });

    it('cancels an active animation when initial autofit applies', async () => {
      vi.stubGlobal('ResizeObserver', undefined);
      vi.spyOn(viewportFrame(element), 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 300, width: 400, x: 100, y: 50 })
      );
      const content = document.createElement('div');
      vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 100, width: 200, x: 150, y: 100 })
      );
      element.append(content);
      vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});

      element.animateTo({ x: 25 });
      const fitted = untilEvent(element, 'viewportchange');
      element.autoFit = true;
      await fitted;

      expect(cancel).toHaveBeenCalledWith(42);
    });

    it('rebases an admitted pointer pan when initial autofit is enabled afterward', async () => {
      vi.stubGlobal('ResizeObserver', undefined);
      vi.spyOn(viewportFrame(element), 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 300, width: 400, x: 100, y: 50 })
      );
      await enablePointerPanning(element);
      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
      await elementIsStable(element);
      const content = document.createElement('div');
      vi.spyOn(content, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 100, width: 200, x: 150, y: 100 })
      );
      element.append(content);

      const fitted = untilEvent(element, 'viewportchange');
      element.autoFit = true;
      await fitted;
      const fittedTransform = element.getTransform();
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));

      expect(element.getTransform()).toEqual({
        scale: fittedTransform.scale,
        x: fittedTransform.x - 10 / fittedTransform.scale,
        y: fittedTransform.y
      });
    });

    it.each(['canceled panstart', 'no-op pan', 'clamped no-op zoom'] as const)(
      'keeps a definition-gated autofit pending after a %s proposal',
      async kind => {
        vi.stubGlobal('ResizeObserver', undefined);
        vi.spyOn(viewportFrame(element), 'getBoundingClientRect').mockReturnValue(
          DOMRect.fromRect({ height: 300, width: 400, x: 100, y: 50 })
        );
        const customTag = `viewport-autofit-proposal-${crypto.randomUUID()}`;
        const custom = document.createElement(customTag);
        vi.spyOn(custom, 'getBoundingClientRect').mockReturnValue(
          DOMRect.fromRect({ height: 100, width: 200, x: 150, y: 100 })
        );
        element.append(custom);
        element.behaviorPan = true;
        element.behaviorZoom = true;
        element.minScale = 1;
        element.autoFit = true;
        await elementIsStable(element);
        const event = new Event('input');

        if (kind === 'canceled panstart') {
          element.addEventListener('panstart', item => item.preventDefault(), { once: true });
          const session = element.startPan({ source: 'control', event, next: { x: 10, y: 0, scale: 1 } });
          session?.end({ event, interrupted: false, reason: 'up' });
        } else if (kind === 'no-op pan') {
          expect(element.requestPan({ source: 'control', event, next: element.getTransform() })).toBe(false);
        } else {
          expect(
            element.requestZoom({
              source: 'control',
              event,
              anchor: { x: 0, y: 0 },
              factor: 0.25,
              next: { x: 0, y: 0, scale: 0.25 }
            })
          ).toBe(false);
        }

        customElements.define(customTag, class extends HTMLElement {});
        await waitForAnimationFrames();
        expect(element.scale).toBe(2);
      }
    );

    it('cancels a definition-gated autofit when pointer navigation takes ownership', async () => {
      const customTag = `viewport-autofit-pointer-${crypto.randomUUID()}`;
      const custom = document.createElement(customTag);
      vi.spyOn(custom, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 100, width: 200, x: 150, y: 100 })
      );
      element.append(custom);
      vi.spyOn(element, 'setPointerCapture').mockImplementation(() => {});

      element.behaviorPan = true;
      element.autoFit = true;
      await elementIsStable(element);
      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
      customElements.define(customTag, class extends HTMLElement {});
      await waitForAnimationFrames();

      expect(element.getTransform()).toEqual({ scale: 1, x: -10, y: 0 });
    });
  });
});

async function enablePointerPanning(element: Viewport): Promise<void> {
  element.behaviorPan = true;
  await elementIsStable(element);
  vi.spyOn(element, 'setPointerCapture').mockImplementation(() => {});
}

async function waitForAnimationFrames(count = 2): Promise<void> {
  for (let frame = 0; frame < count; frame += 1) {
    await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
  }
}

function viewportFrame(element: Viewport): HTMLElement {
  const frame = element.shadowRoot?.querySelector<HTMLElement>('[internal-host]');
  if (!frame) throw new Error('Viewport frame not found');
  return frame;
}

function pointerEvent(type: string, init: PointerEventInit): PointerEvent {
  return new PointerEvent(type, { bubbles: true, buttons: 1, cancelable: true, composed: true, ...init });
}

function keyEvent(init: KeyboardEventInit): KeyboardEvent {
  return new KeyboardEvent('keydown', { bubbles: true, cancelable: true, composed: true, ...init });
}

function viewportProperties(element: Viewport) {
  return {
    autoFit: element.autoFit,
    behaviorPan: element.behaviorPan,
    behaviorZoom: element.behaviorZoom,
    dragThreshold: element.dragThreshold,
    fitInset: element.fitInset,
    maxScale: element.maxScale,
    minScale: element.minScale,
    scale: element.scale,
    x: element.x,
    y: element.y
  };
}

function wheelEvent(init: WheelEventInit): WheelEvent {
  return new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init });
}
