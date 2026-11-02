// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, render } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { VirtualList, type VirtualRange } from '@nvidia-elements/foundations/virtual-list';
import '@nvidia-elements/foundations/virtual-list/define.js';

const frame = () => new Promise(requestAnimationFrame);

describe(VirtualList.metadata.tag, () => {
  let fixture: HTMLElement;
  let list: VirtualList;
  beforeEach(async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    fixture = await createFixture(
      html`<nve-virtual-list item-count="100" item-height="40" style="--scroll-height: 200px"></nve-virtual-list>`
    );
    list = fixture.querySelector<VirtualList>('nve-virtual-list')!;
    await elementIsStable(list);
    list.refresh();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    removeFixture(fixture);
  });

  it('provides native keyboard scrolling and preserves authored tabindex', () => {
    expect(list.tabIndex).toBe(0);
    list.tabIndex = -1;
    list.remove();
    fixture.append(list);
    expect(list.tabIndex).toBe(-1);
  });

  it('sizes ordinary slotted items without consumer sizing rules', async () => {
    list.itemCount = 1;
    await elementIsStable(list);
    const item = document.createElement('div');
    item.textContent = 'Long content '.repeat(100);
    item.style.cssText = 'border: 2px solid; padding: 8px;';
    list.replaceChildren(item);
    await frame();
    expect(item.getBoundingClientRect().height).toBe(40);
    expect(getComputedStyle(item).overflow).toBe('hidden');
    list.itemHeight = 60;
    await elementIsStable(list);
    expect(item.getBoundingClientRect().height).toBe(60);
  });

  it('positions replacement elements and lets consumers discard obsolete scheduled work', async () => {
    const draw = (request: VirtualRange) => {
      if (list.range !== request) return false;
      const template = document.createElement('template');
      template.innerHTML = '<div style="height:40px"></div>';
      const items = Array.from({ length: request.end - request.start }, (_, i) => {
        const item = template.content.firstElementChild!.cloneNode(true) as HTMLElement;
        item.textContent = `${request.start + i}`;
        return item;
      });
      list.replaceChildren(...items);
      return true;
    };
    expect(draw(list.range!)).toBe(true);
    await frame();
    expect(list.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(false);
    list.scrollTop = 400;
    list.refresh();
    const obsolete = list.range!;
    list.scrollTop = 800;
    list.refresh();
    const alsoObsolete = list.range!;
    list.itemCount = 90;
    await elementIsStable(list);
    expect(draw(obsolete)).toBe(false);
    expect(draw(alsoObsolete)).toBe(false);
    expect(list.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(true);
    const latest = list.range!;
    expect(draw(latest)).toBe(true);
    await frame();
    expect(list.firstElementChild!.textContent).toBe(`${latest.start}`);
    expect(list.shadowRoot!.querySelector<HTMLElement>('.content')!.style.top).toBe(`${latest.start * 40}px`);
    expect(list.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(false);
    expect(list.range!.count).toBe(90);
  });

  it('ignores queued slot events from assignments made before the latest request', async () => {
    list.replaceChildren(document.createElement('div'));
    await frame();
    list.replaceChildren(document.createElement('div'));
    list.scrollTop = 400;
    list.refresh();
    await frame();
    const content = list.shadowRoot!.querySelector<HTMLElement>('.content')!;
    expect(content.hidden).toBe(true);
    list.replaceChildren(document.createElement('div'));
    await frame();
    expect(content.hidden).toBe(false);
    expect(content.style.top).toBe(`${list.start * 40}px`);
  });

  it('requires a changed element assignment for a new window', async () => {
    const first = document.createElement('div');
    const second = document.createElement('div');
    list.replaceChildren(first, second);
    await frame();
    list.scrollTop = 400;
    list.refresh();
    first.textContent = `${list.start}`;
    second.textContent = `${list.start + 1}`;
    await frame();
    const content = list.shadowRoot!.querySelector<HTMLElement>('.content')!;
    expect(content.hidden).toBe(true);
    list.replaceChildren(second, first);
    await frame();
    expect(content.hidden).toBe(false);
    expect(content.style.top).toBe(`${list.start * 40}px`);
  });

  it('provides vertical scrolling without a horizontal scrollbar', async () => {
    list.style.width = '200px';
    const wide = document.createElement('div');
    wide.style.width = '900px';
    list.replaceChildren(wide);
    await frame();
    expect(getComputedStyle(list).overflowX).toBe('hidden');
    expect(getComputedStyle(list).overflowY).toBe('auto');
    expect(list.clientHeight).toBe(200);
    list.scrollTop = 400;
    list.refresh();
    await frame();
    await frame();
    expect(list.scrollTop).toBe(400);
    expect(list.scrollLeft).toBe(0);
  });

  it('allows a consumer to park focus before replacing a focused item', async () => {
    fixture.tabIndex = -1;
    list.innerHTML = '<button type="button">item</button>';
    await frame();
    const button = list.querySelector('button')!;
    button.focus();
    fixture.addEventListener('virtual-change', () => fixture.focus({ preventScroll: true }), { capture: true });
    list.addEventListener('virtual-change', () => {
      expect(document.activeElement).toBe(fixture);
      list.replaceChildren(document.createElement('button'));
    });
    list.scrollTop = 40;
    list.refresh();
    expect(document.activeElement).toBe(fixture);
  });

  it('supports scheduled Lit repeat with data identity keys and no slot event loop', async () => {
    const events = vi.fn();
    list.addEventListener('virtual-change', events);
    const request = list.range!;
    await Promise.resolve();
    if (list.range === request) {
      render(
        repeat(
          Array.from({ length: request.end - request.start }, (_, i) => i + request.start),
          i => i,
          i => html`<div style="height:40px">${i}</div>`
        ),
        list
      );
    }
    await frame();
    expect(events).not.toHaveBeenCalled();
    expect(list.children.length).toBe(7);
    expect(list.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(false);
  });
  it.each([
    [0, 0, 0],
    [1, 0, 1],
    [100, 0, 7],
    [100, 19.5, 8],
    [100, 3999, 100]
  ])('calculates count %s at scroll %s', (count, top, end) => {
    list.itemCount = count;
    list.refresh();
    list.scrollTop = top;
    list.refresh();
    expect(list.end).toBe(end);
    expect(list.start).toBe(count === 100 && top === 3999 ? 93 : 0);
    expect(list.scrollHeight).toBe(Math.max(200, count * 40));
  });

  it.each([NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects count %s and recovers', async count => {
    list.itemCount = count;
    await elementIsStable(list);
    expect([list.start, list.end]).toEqual([0, 0]);
    expect(list.shadowRoot!.querySelector<HTMLElement>('.spacer')!.hidden).toBe(true);
    list.itemCount = 10;
    await elementIsStable(list);
    expect([list.start, list.end]).toEqual([0, 7]);
  });

  it.each([0, -1, NaN, Infinity])('rejects height %s', async height => {
    list.itemHeight = height;
    await elementIsStable(list);
    expect(list.range).toBeUndefined();
    expect(list.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(true);
  });

  it('requires both inputs and accepts property assignments before the first update', async () => {
    const missing = document.createElement('nve-virtual-list');
    fixture.append(missing);
    await elementIsStable(missing);
    expect(missing.range).toBeUndefined();
    const configured = document.createElement('nve-virtual-list');
    configured.itemCount = 3;
    configured.itemHeight = 20;
    configured.style.setProperty('--scroll-height', '40px');
    fixture.append(configured);
    await elementIsStable(configured);
    expect(configured.range).toEqual({ start: 0, end: 3, count: 3 });
    configured.removeAttribute('item-height');
    configured.setAttribute('item-height', '');
    await elementIsStable(configured);
    expect(configured.range).toBeUndefined();
  });

  it.each([NaN, Infinity, -1, 1.5, Number.MAX_SAFE_INTEGER + 1])('uses default buffer for %s', async buffer => {
    list.itemBuffer = buffer;
    await elementIsStable(list);
    expect(list.end).toBe(7);
  });

  it('dispatches initial empty and count-only ranges, but refresh and slot changes do not loop', async () => {
    const events = vi.fn();
    const initial = document.createElement('nve-virtual-list');
    initial.itemCount = 0;
    initial.itemHeight = 40;
    initial.addEventListener('virtual-change', events);
    fixture.append(initial);
    await elementIsStable(initial);
    expect(events).toHaveBeenCalledTimes(1);
    expect(initial.range).toEqual({ start: 0, end: 0, count: 0 });
    initial.refresh();
    initial.replaceChildren(document.createElement('div'));
    await frame();
    expect(events).toHaveBeenCalledTimes(1);
    list.replaceChildren(document.createElement('div'));
    await frame();
    list.addEventListener('virtual-change', events);
    list.itemCount++;
    await elementIsStable(list);
    expect(events).toHaveBeenCalledTimes(2);
    expect(list.range!.count).toBe(101);
    expect(list.shadowRoot!.querySelector<HTMLElement>('.content')!.hidden).toBe(false);
  });

  it('updates buffer, height, viewport, and hidden-to-visible geometry', async () => {
    list.itemBuffer = 0;
    list.itemHeight = 50;
    await elementIsStable(list);
    expect(list.end).toBe(4);
    list.style.setProperty('--scroll-height', '100px');
    await frame();
    await frame();
    expect(list.end).toBe(2);
    list.style.display = 'none';
    await frame();
    await frame();
    expect(list.range).toEqual({ start: 0, end: 0, count: 100 });
    list.style.display = 'block';
    await frame();
    await frame();
    expect(list.end).toBe(2);
  });

  it('clamps extent after count and height changes, and rejects unsupported scroll extents', async () => {
    list.scrollToIndex(99);
    list.itemCount = 3;
    await elementIsStable(list);
    expect(list.scrollTop).toBe(0);
    expect(list.end).toBe(3);
    list.itemCount = 1_000_000;
    await elementIsStable(list);
    expect(list.range).toBeUndefined();
  });

  it('scrolls nearest edges, clamps integer indices, and aligns tall items to their start', async () => {
    list.style.scrollBehavior = 'smooth';
    list.scrollToIndex(20);
    expect(list.scrollTop).toBe(640);
    list.scrollToIndex(18);
    expect(list.scrollTop).toBe(640);
    for (const index of [NaN, Infinity, 2.5]) list.scrollToIndex(index);
    expect(list.scrollTop).toBe(640);
    list.scrollToIndex(-100);
    expect(list.scrollTop).toBe(0);
    list.scrollToIndex(1000);
    expect(list.scrollTop).toBe(3800);
    list.itemHeight = 300;
    await elementIsStable(list);
    list.scrollToIndex(3);
    expect(list.scrollTop).toBe(900);
  });

  it('honors explicit smooth behavior and immediate calls interrupt it', async () => {
    const scroll = vi.spyOn(list, 'scrollTo');
    list.scrollToIndex(99, 'smooth');
    expect(scroll).toHaveBeenLastCalledWith({ top: 3800, behavior: 'smooth' });
    await frame();
    list.scrollToIndex(0);
    expect(scroll).toHaveBeenLastCalledWith({ top: 0, behavior: 'instant' });
    await frame();
    await frame();
    expect(list.scrollTop).toBe(0);
  });

  it('validates native command source values', () => {
    const button = document.createElement('button');
    for (const value of ['', ' ', 'hello', '2.5', 'Infinity']) {
      button.value = value;
      list.dispatchEvent(new CommandEvent('command', { command: '--scroll-to-index', source: button }));
      expect(list.scrollTop).toBe(0);
    }
    button.value = '20';
    list.dispatchEvent(new CommandEvent('command', { command: '--scroll-to-index', source: button }));
    expect(list.scrollTop).toBe(640);
    list.dispatchEvent(new CommandEvent('command', { command: '--scroll-to-index' }));
    expect(list.scrollTop).toBe(640);
  });

  it('cleans up scheduled work and reconnects without duplicate range or scroll events', async () => {
    const events = vi.fn();
    const scroll = vi.fn();
    list.addEventListener('virtual-change', events);
    list.addEventListener('virtual-scroll', scroll);
    list.dispatchEvent(new Event('scroll'));
    list.remove();
    await frame();
    fixture.append(list);
    await frame();
    await frame();
    list.scrollToIndex(99);
    await frame();
    await frame();
    expect(events).toHaveBeenCalledTimes(1);
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.calls[0]![0].detail).toEqual({ scrollTop: 3800, direction: 'down' });
  });
  it('reports one diagnostic per invalid configuration with the shared event shape', async () => {
    const logs = vi.fn();
    document.addEventListener('NVE_ELEMENTS_LOG', logs);
    try {
      list.removeAttribute('item-height');
      await elementIsStable(list);
      list.refresh();
      list.refresh();
      expect(console.warn).toHaveBeenCalledTimes(1);
      expect(logs.mock.calls[0]![0].detail).toMatchObject({
        type: 'warn',
        value: expect.stringContaining('nve-virtual-list:'),
        args: [list]
      });
      list.itemHeight = 40;
      await elementIsStable(list);
      list.itemHeight = 0;
      await elementIsStable(list);
      expect(console.warn).toHaveBeenCalledTimes(2);
    } finally {
      document.removeEventListener('NVE_ELEMENTS_LOG', logs);
    }
  });

  it('ignores empty-dataset indices, unrelated commands and commands without a value source', async () => {
    const source = document.createElement('div');
    list.dispatchEvent(new CommandEvent('command', { command: '--scroll-to-index', source }));
    list.dispatchEvent(new CommandEvent('command', { command: '--other', source }));
    expect(list.scrollTop).toBe(0);
    list.itemCount = 0;
    await elementIsStable(list);
    list.scrollToIndex(20);
    expect(list.scrollTop).toBe(0);
    list.itemCount = NaN;
    await elementIsStable(list);
    expect(list.range).toBeUndefined();
  });

  it('coalesces scroll notifications and reports direction only when vertical position changes', async () => {
    const scroll = vi.fn();
    const ranges = vi.fn();
    fixture.addEventListener('virtual-scroll', scroll);
    list.addEventListener('virtual-change', ranges);
    const refresh = vi.spyOn(list, 'refresh');
    for (let top = 1; top <= 5; top++) {
      list.scrollTop = top;
      list.dispatchEvent(new Event('scroll'));
    }
    await frame();
    expect(refresh).toHaveBeenCalledTimes(1);
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.calls[0]![0].detail).toEqual({ scrollTop: 5, direction: 'down' });
    expect(scroll.mock.calls[0]![0].composed).toBe(true);
    ranges.mockClear();
    list.scrollTop = 3;
    await frame();
    await frame();
    expect(scroll).toHaveBeenCalledTimes(2);
    expect(scroll.mock.calls[1]![0].detail).toEqual({ scrollTop: 3, direction: 'up' });
    expect(ranges).not.toHaveBeenCalled();
    list.dispatchEvent(new Event('scroll'));
    list.style.setProperty('--scroll-height', '180px');
    await frame();
    await frame();
    expect(scroll).toHaveBeenCalledTimes(2);
    expect(Object.isFrozen(list.range)).toBe(true);
  });
});
