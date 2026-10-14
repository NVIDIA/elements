// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { ScrollBox } from '@nvidia-elements/foundations/scroll-box';
import '@nvidia-elements/foundations/scroll-box/define.js';

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

  async function measureContent(scrollBox = element) {
    await elementIsStable(scrollBox);
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
  }

  function expectBottom(scrollBox = element) {
    expect(scrollBox.scrollTop).toBe(scrollBox.scrollHeight - scrollBox.clientHeight);
  }

  it('should define the element with both-axis scrolling and no shadows by default', () => {
    expect(customElements.get(ScrollBox.metadata.tag)).toBe(ScrollBox);
    expect(element.orientation).toBe('both');
    expect(element.getAttribute('orientation')).toBe('both');
    expect(element.scrollShadow).toBe(false);
    expect(element.autoScroll).toBe('off');
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

  it('should preserve the scroll position when auto scrolling is off', async () => {
    element.scrollTop = 80;
    content.style.height = '700px';
    await measureContent();
    expect(element.scrollTop).toBe(80);
  });

  it.each(['follow', 'always'] as const)('should start at the bottom with auto-scroll="%s"', async mode => {
    const scrollBox = document.createElement('nve-scroll-box');
    scrollBox.setAttribute('auto-scroll', mode);
    scrollBox.style.cssText = 'width: 200px; height: 150px;';
    scrollBox.append(content);
    fixture.append(scrollBox);
    await elementIsStable(scrollBox);
    expect(scrollBox.autoScroll).toBe(mode);
    await vi.waitFor(() => expectBottom(scrollBox));
    expect(scrollBox.scrollLeft).toBe(0);
  });

  it.each(['follow', 'always'] as const)('should follow growth and resizing in %s mode', async mode => {
    element.scrollLeft = 80;
    element.autoScroll = mode;
    await vi.waitFor(() => expectBottom());
    content.style.height = '700px';
    await vi.waitFor(() => expectBottom());
    element.style.height = '100px';
    await vi.waitFor(() => expectBottom());
    expect(element.scrollLeft).toBe(80);
  });

  it('should pause following away from the bottom and resume on return', async () => {
    element.setAttribute('auto-scroll', 'follow');
    await vi.waitFor(() => expectBottom());
    element.scrollTop = 80;
    content.style.height = '700px';
    await measureContent();
    expect(element.scrollTop).toBe(80);
    expect(element.autoScroll).toBe('follow');
    expect(element.getAttribute('auto-scroll')).toBe('follow');
    // Return and grow before the native scroll event has arrived.
    element.scrollTop = element.scrollHeight - element.clientHeight;
    content.style.height = '900px';
    await vi.waitFor(() => expectBottom());
  });

  it('should allow a one-pixel tolerance when following', async () => {
    element.autoScroll = 'follow';
    await vi.waitFor(() => expectBottom());
    element.scrollTop -= 1;
    content.style.height = '700px';
    await vi.waitFor(() => expectBottom());
  });

  it('should return on growth in always mode after manual scrolling', async () => {
    element.autoScroll = 'always';
    await vi.waitFor(() => expectBottom());
    element.scrollTop = 80;
    await measureContent();
    expect(element.scrollTop).toBe(80);
    content.style.height = '700px';
    await vi.waitFor(() => expectBottom());
  });

  it('should return on viewport resizing even when the bottom coordinate stays the same', async () => {
    element.autoScroll = 'always';
    await vi.waitFor(() => expectBottom());
    element.scrollTop = 80;
    await measureContent();
    expect(element.scrollTop).toBe(80);
    element.style.width = '180px';
    await vi.waitFor(() => expectBottom());
  });

  it('should stop auto scrolling when disabled and return when enabled again', async () => {
    element.autoScroll = 'follow';
    await vi.waitFor(() => expectBottom());
    element.autoScroll = 'off';
    await elementIsStable(element);
    content.style.height = '700px';
    await measureContent();
    expect(element.scrollTop).toBe(350);
    element.autoScroll = 'follow';
    await vi.waitFor(() => expectBottom());
  });

  it('should follow streaming text and appended content after initially fitting', async () => {
    content.style.cssText = 'width: 100px; white-space: pre; line-height: 20px;';
    content.textContent = 'Short';
    element.autoScroll = 'follow';
    await measureContent();
    expect(element.scrollTop).toBe(0);
    content.firstChild.textContent = 'Response\n'.repeat(30);
    await vi.waitFor(() => {
      expect(element.scrollTop).toBeGreaterThan(0);
      expectBottom();
    });
    const message = document.createElement('div');
    message.style.height = '300px';
    content.append(message);
    await vi.waitFor(() => expectBottom());
  });

  it('should follow content size changes without DOM mutations', async () => {
    const child = document.createElement('div');
    child.style.cssText = 'height: 500px; width: 100%;';
    content.style.width = '100px';
    content.style.removeProperty('height');
    content.append(child);
    element.autoScroll = 'follow';
    await vi.waitFor(() => expectBottom());
    const animation = child.animate([{ height: '700px' }, { height: '700px' }], { duration: 1, fill: 'forwards' });
    await animation.finished;
    await vi.waitFor(() => {
      expect(element.scrollHeight).toBe(700);
      expect(element.shadowRoot.querySelector<HTMLElement>('[internal-host]').clientHeight).toBe(700);
      expectBottom();
    });
    animation.cancel();
  });

  it('should follow shrinking and growing content with shadows enabled', async () => {
    await enableShadows();
    element.autoScroll = 'follow';
    await vi.waitFor(() => expectBottom());
    content.style.cssText = 'width: 50px; height: 50px;';
    await vi.waitFor(() => {
      expect(element.scrollHeight).toBe(element.clientHeight);
      expect(element.scrollTop).toBe(0);
    });
    content.style.height = '700px';
    await vi.waitFor(() => expectBottom());
  });

  it('should defer auto scrolling while hidden or restricted to horizontal scrolling', async () => {
    element.orientation = 'horizontal';
    element.autoScroll = 'follow';
    await measureContent();
    expect(element.scrollTop).toBe(0);
    element.hidden = true;
    element.orientation = 'vertical';
    await measureContent();
    element.hidden = false;
    await vi.waitFor(() => expectBottom());
  });

  it('should keep following during smooth scrolling and stop after scrolling away', async () => {
    element.style.scrollBehavior = 'smooth';
    element.autoScroll = 'follow';
    await vi.waitFor(() => expectBottom());
    content.style.height = '900px';
    await vi.waitFor(() => expect(element.scrollTop).toBeGreaterThan(350));
    content.style.height = '1200px';
    await vi.waitFor(() => expectBottom());
    element.scrollTo({ top: 80, behavior: 'instant' });
    content.style.height = '1400px';
    await measureContent();
    expect(element.scrollTop).toBe(80);
    element.scrollTo({ top: element.scrollHeight, behavior: 'instant' });
    content.style.height = '1600px';
    await vi.waitFor(() => expectBottom());
  });

  it('should follow repeated text growth during smooth scrolling', async () => {
    content.style.cssText = 'width: 100px; white-space: pre; line-height: 20px;';
    content.textContent = 'Response\n'.repeat(30);
    element.style.scrollBehavior = 'smooth';
    element.autoScroll = 'follow';
    for (let index = 0; index < 20; index++) {
      content.firstChild.textContent = 'Response\n'.repeat(31 + index);
      await new Promise(requestAnimationFrame);
    }
    await vi.waitFor(() => expectBottom());
  });

  it('should pause when scrolling away during an automatic smooth scroll', async () => {
    element.autoScroll = 'follow';
    await vi.waitFor(() => expectBottom());
    element.style.scrollBehavior = 'smooth';
    content.style.height = '1400px';
    await vi.waitFor(() => expect(element.scrollTop).toBeGreaterThan(350));
    const scroll = vi.spyOn(element, 'scrollTo');
    element.scrollTo({ top: 80, behavior: 'instant' });
    content.style.height = '1600px';
    await measureContent();
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(element.scrollTop).toBeLessThan(350);
  });

  it('should cancel an automatic smooth scroll when disabled', async () => {
    element.style.scrollBehavior = 'smooth';
    element.autoScroll = 'follow';
    await vi.waitFor(() => expect(element.scrollTop).toBeGreaterThan(0));
    element.autoScroll = 'off';
    await elementIsStable(element);
    await measureContent();
    const position = element.scrollTop;
    content.style.height = '900px';
    await measureContent();
    expect(element.scrollTop).toBe(position);
    expect(element.scrollTop).toBeLessThan(element.scrollHeight - element.clientHeight);
  });

  it('should retain following through hiding and reconnection', async () => {
    element.autoScroll = 'follow';
    await vi.waitFor(() => expectBottom());
    element.hidden = true;
    await measureContent();
    content.style.height = '700px';
    element.hidden = false;
    await vi.waitFor(() => expectBottom());
    element.remove();
    content.style.height = '900px';
    fixture.append(element);
    await vi.waitFor(() => expectBottom());
  });

  it('should keep a paused follower paused after reconnection', async () => {
    element.autoScroll = 'follow';
    await vi.waitFor(() => expectBottom());
    const scrolled = untilEvent(element, 'scroll');
    element.scrollTop = 80;
    await scrolled;
    element.remove();
    content.style.height = '700px';
    fixture.append(element);
    await measureContent();
    expect(element.scrollTop).toBeLessThan(element.scrollHeight - element.clientHeight);
    expect(element.autoScroll).toBe('follow');
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
    await vi.waitFor(() => {
      expect(visibleEdges()).toEqual([]);
      expect(element.scrollWidth).toBe(element.clientWidth);
      expect(element.scrollHeight).toBe(element.clientHeight);
      expect(element.hasAttribute('tabindex')).toBe(false);
    });
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

  it('should keep two resize targets regardless of descendant count or mutations', async () => {
    const observe = vi.spyOn(ResizeObserver.prototype, 'observe');
    const unobserve = vi.spyOn(ResizeObserver.prototype, 'unobserve');
    const disconnect = vi.spyOn(ResizeObserver.prototype, 'disconnect');
    const scrollBox = document.createElement('nve-scroll-box');
    scrollBox.style.cssText = 'width: 100px; height: 100px;';
    const wrapper = document.createElement('div');
    wrapper.append(...Array.from({ length: 1000 }, () => document.createElement('div')));
    scrollBox.append(wrapper);
    fixture.append(scrollBox);
    await elementIsStable(scrollBox);
    expect(observe).toHaveBeenCalledTimes(2);
    expect(observe).toHaveBeenCalledWith(scrollBox);
    expect(observe).toHaveBeenCalledWith(scrollBox.shadowRoot.querySelector('[internal-host]'));

    wrapper.append(document.createElement('div'), document.createTextNode('Message'));
    await measureContent(scrollBox);
    wrapper.replaceChildren();
    await measureContent(scrollBox);
    expect(observe).toHaveBeenCalledTimes(2);
    expect(unobserve).not.toHaveBeenCalled();
    expect(disconnect).not.toHaveBeenCalled();
  });

  it('should observe text changes', async () => {
    const observe = vi.spyOn(ResizeObserver.prototype, 'observe');
    const unobserve = vi.spyOn(ResizeObserver.prototype, 'unobserve');
    content.style.cssText = 'width: 100px; white-space: nowrap;';
    content.textContent = 'Short';
    await vi.waitFor(() => expect(element.hasAttribute('tabindex')).toBe(false));
    content.firstChild.textContent = 'Long content '.repeat(50);
    await vi.waitFor(() => expect(element.tabIndex).toBe(0));
    expect(observe).not.toHaveBeenCalled();
    expect(unobserve).not.toHaveBeenCalled();
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
