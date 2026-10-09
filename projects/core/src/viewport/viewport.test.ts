// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { Viewport, type ViewportTransform } from '@nvidia-elements/core/viewport';
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

      element.removeAttribute('behavior-pan');
      await elementIsStable(element);
      expect(element.behaviorPan).toBe(false);

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

  describe('change notifications', () => {
    it('coalesces synchronous transform writes into one viewportchange after rendering', async () => {
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

    it('does not publish viewportchange for a no-op transform write', async () => {
      const changes = vi.fn();
      element.addEventListener('viewportchange', changes);

      element.x = element.x;
      element.y = element.y;
      element.scale = element.scale;
      await elementIsStable(element);

      expect(changes).not.toHaveBeenCalled();
    });

    it('publishes one viewportchange when synchronous writes return to their initial transform', async () => {
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

    it('does not publish initial declarative or disconnected setup as viewportchange', async () => {
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

    it('publishes changed scale limits even when the current scale remains valid', async () => {
      const changes = vi.fn();
      element.addEventListener('capabilitieschange', changes);
      element.minScale = 0.25;
      expect(changes).toHaveBeenCalledOnce();
      element.maxScale = 8;
      expect(changes).toHaveBeenCalledTimes(2);
      await elementIsStable(element);
      expect(changes).toHaveBeenCalledTimes(2);
      expect(element.scale).toBe(1);
    });

    it.each(['behaviorPan', 'behaviorZoom'] as const)(
      'announces each %s capability transition synchronously without render duplicates',
      async property => {
        const states: boolean[] = [];
        element.addEventListener('capabilitieschange', event => {
          states.push(Boolean(element[property]));
          expect(event.bubbles).toBe(true);
          expect(event.composed).toBe(true);
          expect(event.cancelable).toBe(false);
        });
        element[property] = true;
        expect(states).toEqual([true]);
        element[property] = false;
        expect(states).toEqual([true, false]);
        await elementIsStable(element);
        expect(states).toEqual([true, false]);
      }
    );

    it('announces normalized scale limits and clamped scale before the transform render', async () => {
      const states: { min: number; max: number; scale: number }[] = [];
      const transforms = vi.fn();
      element.addEventListener('capabilitieschange', () => {
        states.push({ min: element.minScale, max: element.maxScale, scale: element.scale });
      });
      element.addEventListener('viewportchange', transforms);
      element.minScale = 2;
      expect(states).toEqual([{ min: 2, max: 20, scale: 2 }]);
      element.maxScale = 0.5;
      expect(states).toEqual([
        { min: 2, max: 20, scale: 2 },
        { min: 2, max: 2, scale: 2 }
      ]);
      expect(transforms).not.toHaveBeenCalled();
      await elementIsStable(element);
      expect(states).toHaveLength(2);
      expect(transforms).toHaveBeenCalledOnce();
    });

    it('does not announce capability changes for equivalent normalized assignments', () => {
      element.behaviorPan = true;
      const changes = vi.fn();
      element.addEventListener('capabilitieschange', changes);
      element.behaviorPan = 'space';
      element.behaviorZoom = false;
      element.minScale = element.minScale;
      element.maxScale = element.maxScale;
      expect(changes).not.toHaveBeenCalled();
    });
  });

  describe('reveal and fitting', () => {
    it('applies reveal targets immediately by default', () => {
      element.scale = 2;
      element.reveal({ x: 300, y: 200 });

      expect(element.getTransform()).toEqual({ scale: 2, x: 200, y: 125 });
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

    it('uses the animation controller default duration or an explicit reveal duration', () => {
      const animateTo = vi.spyOn(element, 'animateTo').mockImplementation(() => {});
      const region = { x: 300, y: 200 };

      element.reveal(region, { animated: true });
      element.reveal(region, { animated: true, duration: 500 });

      expect(animateTo).toHaveBeenNthCalledWith(1, { scale: 1, x: 100, y: 50 });
      expect(animateTo).toHaveBeenNthCalledWith(2, { scale: 1, x: 100, y: 50 }, { duration: 500 });
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
  });

  describe('commands', () => {
    it('commits absolute pan and zoom commands atomically and reports committed state', async () => {
      element.behaviorPan = true;
      element.behaviorZoom = true;
      element.maxScale = 4;
      await elementIsStable(element);
      const changes = vi.fn((event: Event) => event.preventDefault());
      element.addEventListener('viewportchange', changes);
      const point = Object.assign(document.createElement('div'), { x: 25, y: 5 });
      fixture.append(point);
      element.dispatchEvent(new CommandEvent('command', { command: '--pan-to', source: point }));
      expect(element.getTransform()).toEqual({ x: 25, y: 5, scale: 1 });
      const scale = Object.assign(document.createElement('div'), { scale: 10, valueAsNumber: 2 });
      fixture.append(scale);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-to', source: scale }));
      expect(element.getTransform()).toEqual({ x: 175, y: 117.5, scale: 4 });
      await elementIsStable(element);
      expect(changes).toHaveBeenCalledOnce();
      expect(changes.mock.calls[0]?.[0].cancelable).toBe(false);
    });

    it('rejects disabled commands while programmatic navigation stays available', () => {
      const source = Object.assign(document.createElement('div'), { x: 50, y: 75, scale: 2 });
      for (const command of ['--pan-to', '--zoom-to', '--pan-right', '--zoom-in']) {
        element.dispatchEvent(new CommandEvent('command', { command, source }));
      }
      expect(element.getTransform()).toEqual({ x: 0, y: 0, scale: 1 });
      element.reveal({ x: 300, y: 250 });
      expect(element.getTransform()).toEqual({ x: 100, y: 100, scale: 1 });
    });

    it('rejects absent, malformed, and nonfinite command values', () => {
      element.behaviorPan = true;
      element.behaviorZoom = true;
      for (const scale of [undefined, '', '2', NaN, Infinity, -1, 0]) {
        const source = Object.assign(document.createElement('div'), { scale, valueAsNumber: 2, value: '2' });
        element.dispatchEvent(new CommandEvent('command', { command: '--zoom-to', source }));
      }
      const source = Object.assign(document.createElement('div'), { x: NaN, y: 10 });
      element.dispatchEvent(new CommandEvent('command', { command: '--pan-to', source }));
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-to' }));
      expect(element.getTransform()).toEqual({ x: 0, y: 0, scale: 1 });
    });
  });

  describe('pointer gestures', () => {
    it('composes wheel movement with an active pointer drag', async () => {
      await enablePointerPanning(element);
      element.focus();
      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
      element.dispatchEvent(wheelEvent({ deltaX: 30 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));
      expect(element.x).toBe(10);
    });

    it('continues an active pointer drag after disabling pan and rejects the next drag', async () => {
      await enablePointerPanning(element);
      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
      element.behaviorPan = false;
      await elementIsStable(element);
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 1 }));
      expect(element.x).toBe(-20);
      expect(element.matches(':state(panning)')).toBe(true);
      expect(element.style.touchAction).toBe('none');
      element.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1 }));
      expect(element.matches(':state(panning)')).toBe(false);
      expect(element.style.touchAction).toBe('');
      expect(element.dispatchEvent(pointerEvent('click', { pointerId: 1 }))).toBe(false);
      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 2 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 2 }));
      expect(element.x).toBe(-20);
    });

    it('does not activate a pending pointer drag while pan is disabled', async () => {
      await enablePointerPanning(element);
      element.dispatchEvent(pointerEvent('pointerdown', { pointerId: 1 }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 2, pointerId: 1 }));
      element.behaviorPan = false;
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 10, pointerId: 1 }));
      expect(element.x).toBe(0);
      expect(element.matches(':state(panning)')).toBe(false);
      element.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1 }));
    });

    it('keeps the pinch anchor while the center moves', async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      vi.spyOn(element, 'setPointerCapture').mockImplementation(() => {});
      const frame = viewportFrame(element).getBoundingClientRect();
      const left = frame.left;
      const top = frame.top;
      element.dispatchEvent(
        pointerEvent('pointerdown', { clientX: left, clientY: top, pointerId: 1, pointerType: 'touch' })
      );
      element.dispatchEvent(
        pointerEvent('pointerdown', { clientX: left + 10, clientY: top, pointerId: 2, pointerType: 'touch' })
      );
      element.dispatchEvent(
        pointerEvent('pointermove', { clientX: left + 20, clientY: top, pointerId: 2, pointerType: 'touch' })
      );
      expect(element.scale).toBe(2);
      expect(element.toViewportCoords(5, 0)).toEqual({ x: 10, y: 0 });
    });

    it('continues an active pinch after disabling zoom and rejects the next pinch', async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      vi.spyOn(element, 'setPointerCapture').mockImplementation(() => {});
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 1, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 2, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 2, pointerType: 'touch' }));
      element.behaviorZoom = false;
      await elementIsStable(element);
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 30, pointerId: 2, pointerType: 'touch' }));
      expect(element.scale).toBe(3);
      expect(element.style.touchAction).toBe('none');
      element.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 1, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointerup', { buttons: 0, pointerId: 2, pointerType: 'touch' }));
      expect(element.style.touchAction).toBe('');
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 3, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 4, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 4, pointerType: 'touch' }));
      expect(element.scale).toBe(3);
    });
  });

  describe('zoom stops', () => {
    const routes = [
      { source: 'keyboard', zoomIn: () => keyEvent({ key: '+' }), zoomOut: () => keyEvent({ key: '-' }) },
      {
        source: 'command',
        zoomIn: () => new CommandEvent('command', { command: '--zoom-in' }),
        zoomOut: () => new CommandEvent('command', { command: '--zoom-out' })
      }
    ];

    beforeEach(async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      element.focus();
      vi.stubGlobal(
        'matchMedia',
        vi.fn(() => ({ matches: true }))
      );
    });

    describe.each(routes)('$source', ({ zoomIn, zoomOut }) => {
      it('uses built-in stops when no override is supplied', () => {
        expect(element.zoomStops).toBeUndefined();
        element.scale = element.minScale;
        for (const scale of [0.1, 0.25, 0.5, 1, 2, 4, 8, 16, 20, 20]) {
          element.dispatchEvent(zoomIn());
          expect(element.scale).toBe(scale);
        }
        for (const scale of [16, 8, 4, 2, 1, 0.5, 0.25, 0.1, 0.05, 0.05]) {
          element.dispatchEvent(zoomOut());
          expect(element.scale).toBe(scale);
        }
      });

      it('sorts and deduplicates custom stops without changing the supplied array', () => {
        const stops = Object.freeze([3, 0.75, 3, 1.5, 0.75]);
        element.zoomStops = stops;
        element.minScale = 0.5;
        element.maxScale = 4;
        element.scale = 0.5;
        for (const scale of [0.75, 1.5, 3, 4]) {
          element.dispatchEvent(zoomIn());
          expect(element.scale).toBe(scale);
        }
        for (const scale of [3, 1.5, 0.75, 0.5]) {
          element.dispatchEvent(zoomOut());
          expect(element.scale).toBe(scale);
        }
        expect(element.zoomStops).toBe(stops);
        expect(stops).toEqual([3, 0.75, 3, 1.5, 0.75]);
      });

      it('ignores nonfinite and nonpositive stops', () => {
        element.zoomStops = [NaN, Infinity, -Infinity, 0, -2, 1.5];
        element.minScale = 0.5;
        element.maxScale = 4;
        element.scale = 0.5;
        element.dispatchEvent(zoomIn());
        expect(element.scale).toBe(1.5);
        element.dispatchEvent(zoomIn());
        expect(element.scale).toBe(4);
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(1.5);
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(0.5);
      });

      it('uses only the bounds when all supplied stops are invalid', () => {
        element.zoomStops = [NaN, Infinity, 0, -2];
        element.minScale = 0.5;
        element.maxScale = 4;
        element.scale = 0.5;
        element.dispatchEvent(zoomIn());
        expect(element.scale).toBe(4);
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(0.5);
      });

      it('clamps custom stops to the scale bounds', () => {
        element.zoomStops = [0.1, 0.2, 1.5, 8, 10];
        element.minScale = 0.5;
        element.maxScale = 4;
        element.scale = 1.5;
        element.dispatchEvent(zoomIn());
        expect(element.scale).toBe(4);
        element.dispatchEvent(zoomIn());
        expect(element.scale).toBe(4);
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(1.5);
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(0.5);
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(0.5);
      });

      it('uses only the bounds for an empty override', () => {
        element.zoomStops = [];
        element.minScale = 0.5;
        element.maxScale = 4;
        element.scale = 1;
        element.dispatchEvent(zoomIn());
        expect(element.scale).toBe(4);
        element.dispatchEvent(zoomIn());
        expect(element.scale).toBe(4);
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(0.5);
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(0.5);
      });

      it('keeps the scale fixed when the bounds are equal', () => {
        element.zoomStops = [0.5, 1, 4];
        element.minScale = 2;
        element.maxScale = 2;
        element.dispatchEvent(zoomIn());
        expect(element.scale).toBe(2);
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(2);
      });

      it('selects the next higher or lower stop from a scale between stops', () => {
        element.zoomStops = [0.75, 1.5, 3];
        element.scale = 1.2;
        element.dispatchEvent(zoomIn());
        expect(element.scale).toBe(1.5);
        element.scale = 1.2;
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(0.75);
      });

      it('reclamps stops when the scale bounds change', () => {
        element.zoomStops = [0.1, 0.75, 1.5, 3, 10];
        element.minScale = 0.6;
        element.maxScale = 2.5;
        element.scale = 1.5;
        element.dispatchEvent(zoomIn());
        expect(element.scale).toBe(2.5);
        element.scale = 0.75;
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(0.6);

        element.minScale = 0.8;
        element.maxScale = 1.4;
        element.scale = 1;
        element.dispatchEvent(zoomIn());
        expect(element.scale).toBe(1.4);
        element.dispatchEvent(zoomOut());
        expect(element.scale).toBe(0.8);
      });

      it('steps from the pending animation destination on repeated input', () => {
        vi.stubGlobal(
          'matchMedia',
          vi.fn(() => ({ matches: false }))
        );
        vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
        vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
        element.zoomStops = [0.75, 1.5, 3, 6];
        element.scale = 1.2;
        const animate = vi.spyOn(element, 'animateTo');

        for (const makeEvent of [zoomIn, zoomIn, zoomIn, zoomOut, zoomOut, zoomOut]) {
          element.dispatchEvent(makeEvent());
        }

        expect(animate.mock.calls.map(([target]) => target.scale)).toEqual([1.5, 3, 6, 3, 1.5, 0.75]);
        expect(element.scale).toBe(1.2);
      });
    });

    it('uses JSON attribute stops and applies attribute updates', async () => {
      element.setAttribute('zoom-stops', '[3, 1.5, 1.5, 0.75]');
      await elementIsStable(element);
      expect(element.zoomStops).toEqual([3, 1.5, 1.5, 0.75]);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(1.5);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-out' }));
      expect(element.scale).toBe(0.75);

      element.setAttribute('zoom-stops', '[1.25, 2.5]');
      await elementIsStable(element);
      element.scale = 1;
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(1.25);
    });

    it('uses property stops without reflecting them to an existing attribute', async () => {
      element.setAttribute('zoom-stops', '[1.25, 2.5]');
      element.zoomStops = [1.75, 3.5];
      await elementIsStable(element);
      expect(element.getAttribute('zoom-stops')).toBe('[1.25, 2.5]');
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(1.75);
    });

    it('does not create an attribute when stops are assigned through the property', async () => {
      element.zoomStops = [1.5, 3];
      await elementIsStable(element);
      expect(element.hasAttribute('zoom-stops')).toBe(false);
    });

    it('uses only the scale bounds for an empty JSON array attribute', async () => {
      element.setAttribute('zoom-stops', '[]');
      await elementIsStable(element);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(20);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-out' }));
      expect(element.scale).toBe(0.05);
    });

    it('restores built-in stops when the attribute is removed', async () => {
      element.setAttribute('zoom-stops', '[1.5, 3]');
      await elementIsStable(element);
      element.removeAttribute('zoom-stops');
      await elementIsStable(element);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(2);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-out' }));
      expect(element.scale).toBe(1);
    });

    it('restores built-in stops when the property is set to undefined', () => {
      element.zoomStops = [1.5, 3];
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(1.5);
      element.zoomStops = undefined;
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(2);
    });

    it('uses built-in stops when the attribute contains invalid JSON', async () => {
      element.setAttribute('zoom-stops', 'invalid json');
      await elementIsStable(element);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(2);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-out' }));
      expect(element.scale).toBe(1);
    });

    it('uses built-in stops when the attribute contains a JSON object', async () => {
      element.setAttribute('zoom-stops', '{}');
      await elementIsStable(element);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(2);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-out' }));
      expect(element.scale).toBe(1);
    });

    it('uses built-in stops when the attribute contains a JSON number', async () => {
      element.setAttribute('zoom-stops', '2');
      await elementIsStable(element);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(2);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-out' }));
      expect(element.scale).toBe(1);
    });

    it('uses built-in stops when the attribute contains a JSON string', async () => {
      element.setAttribute('zoom-stops', '"text"');
      await elementIsStable(element);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(2);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-out' }));
      expect(element.scale).toBe(1);
    });

    it('uses built-in stops when the attribute contains null', async () => {
      element.setAttribute('zoom-stops', 'null');
      await elementIsStable(element);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
      expect(element.scale).toBe(2);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-out' }));
      expect(element.scale).toBe(1);
    });

    it('keeps scale assignment and zoom reset independent of custom stops', () => {
      element.zoomStops = [];
      element.scale = 1.2;
      expect(element.scale).toBe(1.2);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-reset' }));
      expect(element.scale).toBe(1);
    });

    it('keeps content fitting independent of custom stops', async () => {
      element.zoomStops = [];
      const content = document.createElement('div');
      content.style.cssText = 'width: 200px; height: 100px';
      element.append(content);
      await elementIsStable(element);
      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-to-fit' }));
      expect(element.scale).toBeCloseTo(2);
      element.scale = 1.2;
      await elementIsStable(element);
      element.fitContents();
      expect(element.scale).toBeCloseTo(2);
    });
  });

  describe('animation integration', () => {
    it('keeps the minimum scale for an animated zoom-out request', async () => {
      element.behaviorZoom = true;
      element.minScale = 0.3;
      element.scale = 0.3;
      await elementIsStable(element);
      const animationFrame = vi.spyOn(globalThis, 'requestAnimationFrame');

      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-out' }));
      expect(animationFrame).not.toHaveBeenCalled();
      expect(element.scale).toBe(0.3);
    });

    it('animates keyboard zoom and steps later keys from the pending destination', async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      element.focus();
      const animationFrame = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
      const animateTo = vi.spyOn(element, 'animateTo');

      for (let step = 0; step < 3; step += 1) {
        element.dispatchEvent(
          new KeyboardEvent('keydown', { bubbles: true, cancelable: true, composed: true, key: '+' })
        );
      }
      expect(animationFrame).toHaveBeenCalledTimes(3);
      expect(animateTo.mock.calls.map(([target]) => target.scale)).toEqual([2, 4, 8]);
      expect(element.scale).toBe(1);
    });

    it('animates command zoom without a synthetic client point', async () => {
      element.behaviorZoom = true;
      await elementIsStable(element);
      const animationFrame = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      const animateTo = vi.spyOn(element, 'animateTo');

      element.dispatchEvent(new CommandEvent('command', { command: '--zoom-in' }));
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
    ])('stops a pending $source zoom-in when the next animated request reverses it', async ({ zoomIn, zoomOut }) => {
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

      element.dispatchEvent(zoomIn());
      const pendingFrame = nextFrame;
      expect(frames.has(pendingFrame)).toBe(true);
      element.dispatchEvent(zoomOut());
      expect(cancelFrame).toHaveBeenCalledWith(pendingFrame);
      expect(frames.size).toBe(0);
      expect(element.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
    });

    it('commits wheel and pinch zoom immediately without scheduling an animation', async () => {
      element.zoomStops = [];
      element.behaviorZoom = true;
      await elementIsStable(element);
      element.focus();
      vi.spyOn(element, 'setPointerCapture').mockImplementation(() => {});
      const animationFrame = vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      const animateTo = vi.spyOn(element, 'animateTo');

      element.dispatchEvent(wheelEvent({ ctrlKey: true, deltaY: -10 }));
      const afterWheel = element.scale;
      expect(afterWheel).toBeGreaterThan(1);
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 0, pointerId: 70, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointerdown', { clientX: 10, pointerId: 71, pointerType: 'touch' }));
      element.dispatchEvent(pointerEvent('pointermove', { clientX: 20, pointerId: 71, pointerType: 'touch' }));
      expect(element.scale).toBeGreaterThan(afterWheel);
      expect(animationFrame).not.toHaveBeenCalled();
      expect(animateTo).not.toHaveBeenCalled();
    });

    it('reports an animateTo transform in one viewportchange after rendering', async () => {
      const changes: ViewportTransform[] = [];
      element.addEventListener('viewportchange', event =>
        changes.push((event as CustomEvent<ViewportTransform>).detail)
      );
      const target = { scale: 2, x: 10, y: 20 };

      element.animateTo(target, { duration: 0 });

      expect({ scale: element.scale, x: element.x, y: element.y }).toEqual(target);
      expect(changes).toEqual([]);

      await elementIsStable(element);

      expect(changes).toEqual([target]);
    });

    it('leaves an active animation running when an absolute pan command changes nothing', async () => {
      element.behaviorPan = true;
      await elementIsStable(element);
      vi.spyOn(globalThis, 'requestAnimationFrame').mockReturnValue(42);
      const cancel = vi.spyOn(globalThis, 'cancelAnimationFrame').mockImplementation(() => {});
      element.animateTo({ scale: 4, x: 10 });
      const source = Object.assign(document.createElement('div'), { x: element.x, y: element.y });
      element.dispatchEvent(new CommandEvent('command', { command: '--pan-to', source }));
      expect(cancel).not.toHaveBeenCalled();
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

  describe('autofit', () => {
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

    it('keeps a pending autofit after an absolute pan command changes nothing', async () => {
      const customTag = `viewport-autofit-noop-${crypto.randomUUID()}`;
      const custom = document.createElement(customTag);
      vi.spyOn(custom, 'getBoundingClientRect').mockReturnValue(
        DOMRect.fromRect({ height: 100, width: 200, x: 150, y: 100 })
      );
      element.append(custom);
      element.behaviorPan = true;
      element.autoFit = true;
      await elementIsStable(element);
      const source = Object.assign(document.createElement('div'), { x: element.x, y: element.y });
      element.dispatchEvent(new CommandEvent('command', { command: '--pan-to', source }));
      customElements.define(customTag, class extends HTMLElement {});
      await waitForAnimationFrames();
      expect(element.scale).toBe(2);
    });

    it('cancels pending autofit when a programmatic transform is assigned before content is defined', async () => {
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

    it('rebases an active pointer drag when initial autofit is enabled afterward', async () => {
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

    it('cancels pending autofit when pointer navigation starts before content is defined', async () => {
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
