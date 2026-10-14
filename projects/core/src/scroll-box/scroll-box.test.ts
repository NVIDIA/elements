// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { ScrollBox } from '@nvidia-elements/core/scroll-box';
import '@nvidia-elements/core/scroll-box/define.js';

describe(ScrollBox.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: ScrollBox;
  let content: HTMLElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-scroll-box aria-label="Activity" style="width: 200px; height: 150px; --scrollbar-width: none;">
        <div style="width: 600px; height: 500px;"></div>
      </nve-scroll-box>
    `);
    element = fixture.querySelector(ScrollBox.metadata.tag);
    content = element.querySelector('div');
    await elementIsStable(element);
    await vi.waitFor(() => expect(element.tabIndex).toBe(0));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    removeFixture(fixture);
  });

  async function enableShadows() {
    element.scrollShadow = true;
    await elementIsStable(element);
    await vi.waitFor(() => expect(element.shadowRoot.querySelector<HTMLElement>('.shadow-layer').hidden).toBe(false));
  }

  function visibleEdges(scrollBox = element) {
    return Array.from(scrollBox.shadowRoot.querySelectorAll('.edge'))
      .filter(edge => getComputedStyle(edge).opacity === '1')
      .map(edge => edge.classList.item(1))
      .sort();
  }

  it('should define the element with both-axis scrolling and no shadows by default', () => {
    expect(customElements.get(ScrollBox.metadata.tag)).toBe(ScrollBox);
    expect(element.orientation).toBe('both');
    expect(element.getAttribute('orientation')).toBe('both');
    expect(element.scrollShadow).toBe(false);
    expect(element.shadowRoot.querySelector('.shadow-layer')).toBeNull();
    expect(getComputedStyle(element).overflow).toBe('auto');
  });

  it.each(['horizontal', 'vertical'] as const)(
    'should reflect %s orientation and clip the other axis',
    async orientation => {
      element.orientation = orientation;
      await elementIsStable(element);
      expect(element.getAttribute('orientation')).toBe(orientation);
      const style = getComputedStyle(element);
      expect(style.overflowX).toBe(orientation === 'horizontal' ? 'auto' : 'hidden');
      expect(style.overflowY).toBe(orientation === 'vertical' ? 'auto' : 'hidden');
    }
  );

  it('should preserve native methods, coordinates, and scroll events on the host', async () => {
    expect(element.scrollTo).toBe(Element.prototype.scrollTo);
    expect(element.scrollBy).toBe(Element.prototype.scrollBy);
    const scrolled = untilEvent(element, 'scroll');
    const ended = untilEvent(element, 'scrollend');
    element.scrollTo({ left: 80, top: 90 });
    const event = await scrolled;
    await ended;
    expect(event.target).toBe(element);
    expect(event.bubbles).toBe(false);
    expect(event).not.toBeInstanceOf(CustomEvent);
    expect(element.scrollLeft).toBe(80);
    expect(element.scrollTop).toBe(90);
    element.scrollBy(20, 30);
    expect(element.scrollLeft).toBe(100);
    expect(element.scrollTop).toBe(120);
    expect(element.scrollWidth).toBe(600);
    expect(element.scrollHeight).toBe(500);
  });

  it('should hide scrollbars through native CSS without disabling scrolling', () => {
    expect(getComputedStyle(element).scrollbarWidth).toBe('none');
    element.scrollTop = 40;
    expect(element.scrollTop).toBe(40);
  });

  it('should remove automatic focusability when content fits or is empty', async () => {
    content.style.cssText = 'width: 100px; height: 100px;';
    await vi.waitFor(() => expect(element.hasAttribute('tabindex')).toBe(false));
    content.remove();
    await vi.waitFor(() => expect(element.scrollHeight).toBe(element.clientHeight));
    expect(element.hasAttribute('tabindex')).toBe(false);
  });

  it('should restore automatic focusability when content or the host resizes', async () => {
    content.style.cssText = 'width: 100px; height: 100px;';
    await vi.waitFor(() => expect(element.hasAttribute('tabindex')).toBe(false));
    element.style.height = '50px';
    await vi.waitFor(() => expect(element.tabIndex).toBe(0));
    element.style.height = '150px';
    await vi.waitFor(() => expect(element.hasAttribute('tabindex')).toBe(false));
    content.style.width = '600px';
    await vi.waitFor(() => expect(element.tabIndex).toBe(0));
  });

  it('should consider only enabled axes when assigning automatic focusability', async () => {
    element.orientation = 'vertical';
    content.style.height = '100px';
    await elementIsStable(element);
    await vi.waitFor(() => expect(element.hasAttribute('tabindex')).toBe(false));
    element.orientation = 'horizontal';
    await elementIsStable(element);
    await vi.waitFor(() => expect(element.tabIndex).toBe(0));
  });

  it.each(['-1', '0', '3'])('should preserve author tabindex %s through content changes', async tabIndex => {
    element.setAttribute('tabindex', tabIndex);
    content.style.cssText = 'width: 50px; height: 50px;';
    await vi.waitFor(() => expect(element.scrollWidth).toBe(element.clientWidth));
    await new Promise(requestAnimationFrame);
    expect(element.getAttribute('tabindex')).toBe(tabIndex);
  });

  it('should resume automatic focusability after the author removes tabindex', async () => {
    element.tabIndex = -1;
    element.removeAttribute('tabindex');
    await vi.waitFor(() => expect(element.tabIndex).toBe(0));
  });

  it('should respect tabindex supplied before connection', async () => {
    const scrollBox = document.createElement('nve-scroll-box');
    scrollBox.tabIndex = -1;
    scrollBox.style.cssText = 'width: 50px; height: 50px;';
    scrollBox.append(content);
    fixture.append(scrollBox);
    await elementIsStable(scrollBox);
    await vi.waitFor(() => expect(scrollBox.scrollHeight).toBe(500));
    expect(scrollBox.tabIndex).toBe(-1);
  });

  it('should remove automatic focusability when hidden and restore it when shown', async () => {
    element.hidden = true;
    await vi.waitFor(() => expect(element.hasAttribute('tabindex')).toBe(false));
    element.hidden = false;
    await vi.waitFor(() => expect(element.tabIndex).toBe(0));
  });

  it('should show only edges with more content at the start, middle, and end', async () => {
    await enableShadows();
    expect(element.hasAttribute('scroll-shadow')).toBe(true);
    await vi.waitFor(() => expect(visibleEdges()).toEqual(['bottom', 'right']));
    element.scrollTo(100, 100);
    await vi.waitFor(() => expect(visibleEdges()).toEqual(['bottom', 'left', 'right', 'top']));
    element.scrollTo(400, 350);
    await vi.waitFor(() => expect(visibleEdges()).toEqual(['left', 'top']));
    element.scrollShadow = false;
    await elementIsStable(element);
    expect(element.hasAttribute('scroll-shadow')).toBe(false);
    expect(element.shadowRoot.querySelector('.shadow-layer')).toBeNull();
  });

  it.each(['horizontal', 'vertical'] as const)('should show shadows only on the %s axis', async orientation => {
    element.orientation = orientation;
    await enableShadows();
    await vi.waitFor(() => expect(visibleEdges()).toEqual([orientation === 'horizontal' ? 'right' : 'bottom']));
    element.scrollTo(100, 100);
    await vi.waitFor(() =>
      expect(visibleEdges()).toEqual(orientation === 'horizontal' ? ['left', 'right'] : ['bottom', 'top'])
    );
    element.orientation = 'both';
    await elementIsStable(element);
    await vi.waitFor(() => expect(visibleEdges()).toEqual(['bottom', 'left', 'right', 'top']));
  });

  it('should hide shadows on axes disabled by author styles', async () => {
    await enableShadows();
    element.scrollTo(100, 100);
    await vi.waitFor(() => expect(visibleEdges()).toEqual(['bottom', 'left', 'right', 'top']));
    element.style.overflowX = 'hidden';
    await vi.waitFor(() => expect(visibleEdges()).toEqual(['bottom', 'top']));
    element.style.overflowY = 'hidden';
    await vi.waitFor(() => expect(visibleEdges()).toEqual([]));
    element.style.overflow = 'auto';
    await vi.waitFor(() => expect(visibleEdges()).toEqual(['bottom', 'left', 'right', 'top']));
  });

  it('should isolate shadow visibility in nested scroll boxes', async () => {
    await enableShadows();
    const nested = document.createElement('nve-scroll-box');
    nested.scrollShadow = true;
    nested.style.cssText = 'width: 100px; height: 100px; --scrollbar-width: none;';
    const child = document.createElement('div');
    child.style.cssText = 'width: 50px; height: 50px;';
    nested.append(child);
    content.append(nested);
    await elementIsStable(nested);
    await vi.waitFor(() => expect(visibleEdges()).toEqual(['bottom', 'right']));
    expect(visibleEdges(nested)).toEqual([]);
    child.style.height = '300px';
    await vi.waitFor(() => expect(visibleEdges(nested)).toEqual(['bottom']));
    nested.scrollTo(0, 200);
    await vi.waitFor(() => expect(visibleEdges(nested)).toEqual(['top']));
    expect(visibleEdges()).toEqual(['bottom', 'right']);
  });

  it('should preserve native negative RTL coordinates and the matching edge cues', async () => {
    element.dir = 'rtl';
    await enableShadows();
    expect(element.scrollLeft).toBe(0);
    await vi.waitFor(() => expect(visibleEdges()).toEqual(['bottom', 'left']));
    element.scrollTo(-100, 100);
    await vi.waitFor(() => expect(visibleEdges()).toEqual(['bottom', 'left', 'right', 'top']));
    element.scrollTo(-400, 350);
    await vi.waitFor(() => expect(visibleEdges()).toEqual(['right', 'top']));
  });

  it.each(['ltr', 'rtl'])('should pin non-interactive shadows with padding and borders in %s', async direction => {
    element.dir = direction;
    element.style.padding = '10px';
    element.style.border = '2px solid';
    const width = element.scrollWidth;
    const height = element.scrollHeight;
    await enableShadows();
    const layer = element.shadowRoot.querySelector<HTMLElement>('.shadow-layer');
    const shadows = layer.querySelector<HTMLElement>('.shadows');
    const positions: [number, number][] = [
      [0, 0],
      [100, 100],
      [width - element.clientWidth, height - element.clientHeight]
    ];
    for (const [x, y] of positions) {
      element.scrollTo(direction === 'rtl' ? -x : x, y);
      const hostBounds = element.getBoundingClientRect();
      const shadowBounds = shadows.getBoundingClientRect();
      expect(shadowBounds.left).toBe(hostBounds.left + element.clientLeft);
      expect(shadowBounds.top).toBe(hostBounds.top + element.clientTop);
      expect(shadowBounds.width).toBe(element.clientWidth);
      expect(shadowBounds.height).toBe(element.clientHeight);
    }
    expect(element.scrollWidth).toBe(width);
    expect(element.scrollHeight).toBe(height);
    expect(layer.getAttribute('aria-hidden')).toBe('true');
    expect(getComputedStyle(layer).pointerEvents).toBe('none');
  });

  it('should let content shrink after showing shadows', async () => {
    await enableShadows();
    content.style.cssText = 'width: 50px; height: 50px;';
    await vi.waitFor(() => expect(visibleEdges()).toEqual([]));
    expect(element.scrollWidth).toBe(element.clientWidth);
    expect(element.scrollHeight).toBe(element.clientHeight);
    expect(element.hasAttribute('tabindex')).toBe(false);
  });

  it('should observe asynchronous overflow inside a fixed-size content wrapper', async () => {
    content.style.cssText = 'width: 100px; height: 100px;';
    await vi.waitFor(() => expect(element.hasAttribute('tabindex')).toBe(false));
    const child = document.createElement('div');
    child.style.height = '500px';
    content.append(child);
    await vi.waitFor(() => expect(element.tabIndex).toBe(0));
    child.style.height = '50px';
    await vi.waitFor(() => expect(element.hasAttribute('tabindex')).toBe(false));
  });

  it('should observe text changes', async () => {
    content.style.cssText = 'width: 100px; white-space: nowrap;';
    content.textContent = 'Short';
    await vi.waitFor(() => expect(element.hasAttribute('tabindex')).toBe(false));
    content.firstChild.textContent = 'Long content '.repeat(50);
    await vi.waitFor(() => expect(element.tabIndex).toBe(0));
  });

  it('should stop observers while disconnected and restore them on reconnection', async () => {
    const resizeDisconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect');
    const mutationDisconnect = vi.spyOn(MutationObserver.prototype, 'disconnect');
    element.remove();
    expect(resizeDisconnect).toHaveBeenCalled();
    expect(mutationDisconnect).toHaveBeenCalled();
    content.style.cssText = 'width: 50px; height: 50px;';
    fixture.append(element);
    await vi.waitFor(() => expect(element.hasAttribute('tabindex')).toBe(false));
    content.style.height = '500px';
    await vi.waitFor(() => expect(element.tabIndex).toBe(0));
  });

  it('should keep nested scroll events on their native target', async () => {
    const nested = document.createElement('nve-scroll-box');
    nested.style.cssText = 'width: 100px; height: 100px;';
    const child = document.createElement('div');
    child.style.height = '500px';
    nested.append(child);
    content.append(nested);
    await elementIsStable(nested);
    const listener = vi.fn();
    element.addEventListener('scroll', listener);
    const scrolled = untilEvent(nested, 'scroll');
    nested.scrollTop = 50;
    await scrolled;
    expect(listener).not.toHaveBeenCalled();
    expect(element.scrollTop).toBe(0);
  });

  it('should support native scroll snapping on slotted descendants', async () => {
    const sections = Array.from({ length: 2 }, () => {
      const section = document.createElement('div');
      section.style.cssText = 'height: 200px; scroll-snap-align: start;';
      return section;
    });
    content.replaceChildren(...sections);
    element.style.scrollSnapType = 'y mandatory';
    element.scrollTo({ top: 170, behavior: 'instant' });
    await vi.waitFor(() => expect(element.scrollTop).toBe(200));
  });

  it('should avoid starting observers if removed before its first update', async () => {
    const scrollBox = document.createElement('nve-scroll-box');
    scrollBox.style.cssText = 'width: 50px; height: 50px;';
    scrollBox.append(content);
    fixture.append(scrollBox);
    scrollBox.remove();
    const observe = vi.spyOn(ResizeObserver.prototype, 'observe');
    await scrollBox.updateComplete;
    expect(observe).not.toHaveBeenCalledWith(scrollBox);
    fixture.append(scrollBox);
    await vi.waitFor(() => expect(scrollBox.tabIndex).toBe(0));
    expect(observe).toHaveBeenCalledWith(scrollBox);
  });
});
