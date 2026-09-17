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

    it('renders an interaction frame beneath noninteractive background and interactive default content', () => {
      const plane = element.shadowRoot?.querySelector<HTMLElement>('.plane');
      const frame = viewportFrame(element);
      const slots = [...(plane?.querySelectorAll('slot') ?? [])];
      const background = document.createElement('svg');
      background.slot = 'background';
      const contribution = document.createElement('div');
      element.append(background, contribution);

      expect(frame).toBeInstanceOf(HTMLElement);
      expect(slots.map(slot => slot.name)).toEqual(['background', '']);
      expect(getComputedStyle(plane as HTMLElement).pointerEvents).toBe('none');
      expect(getComputedStyle(background).pointerEvents).toBe('none');
      expect(getComputedStyle(contribution).pointerEvents).toBe('auto');
      expect(getComputedStyle(element).overflow).toBe('hidden');
    });
  });

  describe('ownership and semantic events', () => {
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

    it('wires a discrete keyboard request through the public event delegate before its default transform', async () => {
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
      customElements.define(customTag, class extends HTMLElement {});
      await waitForAnimationFrames();

      expect(element.getTransform()).toEqual({ scale: 1, x: 0, y: 0 });
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
