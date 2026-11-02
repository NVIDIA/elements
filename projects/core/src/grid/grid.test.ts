// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { Grid } from '@nvidia-elements/core/grid';
import type { VirtualList, VirtualRange } from '@nvidia-elements/foundations/virtual-list';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/foundations/virtual-list/define.js';

function navigationCells(grid: Grid) {
  const { columns, cells } = grid.keynavGridConfig;
  return [...columns, ...cells];
}

describe(Grid.metadata.tag, () => {
  let fixture: HTMLElement;
  let element: Grid;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid>
        <nve-grid-header>
          <nve-grid-column>column 1</nve-grid-column>
          <nve-grid-column>column 2</nve-grid-column>
          <nve-grid-column>column 3</nve-grid-column>
          <nve-grid-column>column 4</nve-grid-column>
        </nve-grid-header>
        <nve-grid-row>
          <nve-grid-cell>cell 1-1</nve-grid-cell>
          <nve-grid-cell>cell 1-2</nve-grid-cell>
          <nve-grid-cell>cell 1-3</nve-grid-cell>
          <nve-grid-cell>cell 1-4</nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>cell 2-1</nve-grid-cell>
          <nve-grid-cell>cell 2-2</nve-grid-cell>
          <nve-grid-cell>cell 2-3</nve-grid-cell>
          <nve-grid-cell>cell 2-4</nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    `);
    element = fixture.querySelector(Grid.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('should define element', () => {
    expect(customElements.get(Grid.metadata.tag)).toBeDefined();
  });

  it('should set to have the grid role of grid', () => {
    expect(element._internals.role).toBe('grid');
  });

  it('should generate an ID if no default is provided', () => {
    expect(element.id.startsWith('_')).toBe(true);
  });

  it('should default to no :state(scrolling) state', () => {
    expect(element.matches(':state(scrolling)')).toBe(false);
  });

  it('should default to no scroll target before rendering', () => {
    const detachedElement = document.createElement(Grid.metadata.tag) as Grid;
    expect(detachedElement.stateScrollConfig.target).toBeUndefined();
  });

  it('should enable keynav control from keynav controller', async () => {
    await elementIsStable(element);
    expect(navigationCells(element)[0].tabIndex).toBe(0);
    expect(navigationCells(element)[1].tabIndex).toBe(-1);
  });

  it('should restore keyboard navigation after repeated attribute-only mutations', async () => {
    const cells = navigationCells(element);
    cells[4].dispatchEvent(new MouseEvent('mouseup', { bubbles: true, buttons: 1 }));
    for (let update = 0; update < 2; update++) {
      cells.forEach(cell => cell.removeAttribute('tabindex'));

      await vi.waitFor(() => {
        expect(cells[4].tabIndex).toBe(0);
        expect(cells.filter(cell => cell.tabIndex === 0)).toHaveLength(1);
        expect(cells.every(cell => cell.hasAttribute('tabindex'))).toBe(true);
      });

      cells[4].focus();
      cells[4].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true }));
      expect(document.activeElement).toBe(cells[8]);
      cells[8].dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp', bubbles: true }));
      expect(document.activeElement).toBe(cells[4]);
    }
  });

  it('should initialize replacement cells inside a retained row', async () => {
    const row = element.querySelector('nve-grid-row');
    const oldCell = row.querySelector('nve-grid-cell');
    oldCell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, buttons: 1 }));

    for (let update = 0; update < 2; update++) {
      row.innerHTML =
        '<nve-grid-cell>updated 1</nve-grid-cell><nve-grid-cell>updated 2</nve-grid-cell><nve-grid-cell>updated 3</nve-grid-cell><nve-grid-cell>updated 4</nve-grid-cell>';
      await elementIsStable(element);

      await vi.waitFor(() => {
        const cells = navigationCells(element);
        expect(cells.filter(cell => cell.tabIndex === 0)).toHaveLength(1);
        expect(cells.every(cell => cell.hasAttribute('tabindex'))).toBe(true);
      });
    }
  });

  it('should preserve the active cell when rows are added', async () => {
    const cell = element.querySelector('nve-grid-cell');
    cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, buttons: 1 }));
    const row = element.querySelector('nve-grid-row').cloneNode(true);
    element.append(row);
    await elementIsStable(element);

    await vi.waitFor(() => {
      expect(cell.tabIndex).toBe(0);
      expect(navigationCells(element).filter(item => item.tabIndex === 0)).toHaveLength(1);
    });
  });

  it('should throttle repeated mutations and reconcile the final update', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const column = element.querySelector('nve-grid-column');
    const configReads = vi.spyOn(element, 'keynavGridConfig', 'get');

    column.removeAttribute('tabindex');
    await Promise.resolve();
    expect(column.tabIndex).toBe(0);
    const leadingReads = configReads.mock.calls.length;

    for (let update = 0; update < 4; update++) {
      vi.advanceTimersByTime(100);
      column.setAttribute('tabindex', '-1');
      await Promise.resolve();
      expect(configReads.mock.calls).toHaveLength(leadingReads);
    }

    vi.advanceTimersByTime(100);
    await Promise.resolve();
    expect(column.tabIndex).toBe(0);
    expect(configReads.mock.calls.length).toBeGreaterThan(leadingReads);
    const trailingReads = configReads.mock.calls.length;

    await Promise.resolve();
    vi.advanceTimersByTime(500);
    expect(configReads.mock.calls).toHaveLength(trailingReads);
  });

  it('should ignore text updates and its own tabindex writes', async () => {
    const cell = element.querySelector('nve-grid-cell');
    const configReads = vi.spyOn(element, 'keynavGridConfig', 'get');
    cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, buttons: 1 }));
    const navigationReads = configReads.mock.calls.length;

    for (let update = 0; update < 3; update++) {
      cell.textContent = `updated ${update}`;
      await Promise.resolve();
      await Promise.resolve();
      expect(configReads.mock.calls).toHaveLength(navigationReads);
    }
  });

  it('should ignore tabindex changes on nested controls', async () => {
    const cell = element.querySelector('nve-grid-cell');
    cell.innerHTML = '<button>control</button>';
    await elementIsStable(element);
    const button = cell.querySelector('button');
    const configReads = vi.spyOn(element, 'keynavGridConfig', 'get');

    button.tabIndex = -1;
    await Promise.resolve();
    expect(configReads).not.toHaveBeenCalled();
  });

  it.each([false, true])('should reconcile before arrow navigation with delivered mutations: %s', async delivered => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const cells = navigationCells(element);
    cells[4].innerHTML = '<a href="#first">first</a>';
    cells[8].innerHTML = '<a href="#second">second</a>';
    await elementIsStable(element);
    cells[4].dispatchEvent(new MouseEvent('mouseup', { bubbles: true, buttons: 1 }));
    cells.forEach(cell => cell.removeAttribute('tabindex'));
    if (delivered) await Promise.resolve();

    cells[4].querySelector('a').dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(cells[8].querySelector('a'));
    expect(cells[8].tabIndex).toBe(0);

    vi.advanceTimersByTime(500);
    await Promise.resolve();
    expect(cells[8].tabIndex).toBe(0);
  });

  it('should cancel deferred reconciliation when disconnected', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const column = element.querySelector('nve-grid-column');
    column.removeAttribute('tabindex');
    await Promise.resolve();
    column.removeAttribute('tabindex');
    await Promise.resolve();
    const configReads = vi.spyOn(element, 'keynavGridConfig', 'get');

    element.remove();
    vi.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(configReads).not.toHaveBeenCalled();
    expect(column.hasAttribute('tabindex')).toBe(false);

    fixture.append(element);
    await elementIsStable(element);
    expect(column.tabIndex).toBe(0);
  });

  it('should reflect container attribute to DOM', async () => {
    expect(element.hasAttribute('container')).toBe(false);
    element.container = 'flat';
    await elementIsStable(element);
    expect(element.getAttribute('container')).toBe('flat');
  });

  it('should reflect stripe attribute to DOM', async () => {
    expect(element.hasAttribute('stripe')).toBe(false);
    element.stripe = true;
    await elementIsStable(element);
    expect(element.hasAttribute('stripe')).toBe(true);
  });

  it('should provide a footer slot', async () => {
    expect(element.shadowRoot.querySelector('slot[name="footer"]')).toBeTruthy();
  });
});

describe(`${Grid.metadata.tag}: id check`, () => {
  let fixture: HTMLElement;
  let element: Grid;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid id="test">
        <nve-grid-header>
          <nve-grid-column>column 1</nve-grid-column>
          <nve-grid-column>column 2</nve-grid-column>
          <nve-grid-column>column 3</nve-grid-column>
          <nve-grid-column>column 4</nve-grid-column>
        </nve-grid-header>
        <nve-grid-row>
          <nve-grid-cell>cell 1-1</nve-grid-cell>
          <nve-grid-cell>cell 1-2</nve-grid-cell>
          <nve-grid-cell>cell 1-3</nve-grid-cell>
          <nve-grid-cell>cell 1-4</nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>cell 2-1</nve-grid-cell>
          <nve-grid-cell>cell 2-2</nve-grid-cell>
          <nve-grid-cell>cell 2-3</nve-grid-cell>
          <nve-grid-cell>cell 2-4</nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    `);
    element = fixture.querySelector(Grid.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should use existing id if one is provided', () => {
    expect(element.id).toBe('test');
  });
});

describe(`${Grid.metadata.tag}: scroll`, () => {
  let fixture: HTMLElement;
  let element: Grid;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid style="height: 100px">
        <nve-grid-header>
          <nve-grid-column>column 1</nve-grid-column>
          <nve-grid-column>column 2</nve-grid-column>
          <nve-grid-column>column 3</nve-grid-column>
          <nve-grid-column>column 4</nve-grid-column>
        </nve-grid-header>
        <nve-grid-row>
          <nve-grid-cell>cell 1-1</nve-grid-cell>
          <nve-grid-cell>cell 1-2</nve-grid-cell>
          <nve-grid-cell>cell 1-3</nve-grid-cell>
          <nve-grid-cell>cell 1-4</nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>cell 2-1</nve-grid-cell>
          <nve-grid-cell>cell 2-2</nve-grid-cell>
          <nve-grid-cell>cell 2-3</nve-grid-cell>
          <nve-grid-cell>cell 2-4</nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>cell 3-1</nve-grid-cell>
          <nve-grid-cell>cell 3-2</nve-grid-cell>
          <nve-grid-cell>cell 3-3</nve-grid-cell>
          <nve-grid-cell>cell 3-4</nve-grid-cell>
        </nve-grid-row>
        <nve-grid-row>
          <nve-grid-cell>cell 4-1</nve-grid-cell>
          <nve-grid-cell>cell 4-2</nve-grid-cell>
          <nve-grid-cell>cell 4-3</nve-grid-cell>
          <nve-grid-cell>cell 4-4</nve-grid-cell>
        </nve-grid-row>
      </nve-grid>
    `);
    element = fixture.querySelector(Grid.metadata.tag);
    await elementIsStable(element);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    removeFixture(fixture);
    vi.useRealTimers();
  });

  it('should allow scroll position to be set', async () => {
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('[part="_scrollbox"]').scrollTop).toBe(0);

    await element.scrollTo({ top: 20 });
    await elementIsStable(element);
    expect(element.shadowRoot.querySelector('[part="_scrollbox"]').scrollTop).toBe(20);
  });

  it('should debounce scrolling state and dispatch scrollboxend immediately', () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    const scrollbox = element.shadowRoot.querySelector<HTMLElement>('[part="_scrollbox"]')!;
    Object.defineProperties(scrollbox, {
      clientHeight: { configurable: true, value: 50 },
      scrollHeight: { configurable: true, value: 100 },
      scrollTop: { configurable: true, value: 50 }
    });
    const scrollboxEnd = vi.fn();
    element.addEventListener('scrollboxend', scrollboxEnd);
    scrollbox.dispatchEvent(new Event('scroll'));
    scrollbox.dispatchEvent(new Event('scrollend'));
    expect(scrollboxEnd).toHaveBeenCalledOnce();
    expect(element.matches(':state(scrolling)')).toBe(true);

    vi.advanceTimersByTime(60);
    scrollbox.dispatchEvent(new Event('scroll'));
    vi.advanceTimersByTime(100);
    expect(element.matches(':state(scrolling)')).toBe(true);

    scrollbox.dispatchEvent(new Event('scrollend'));
    expect(scrollboxEnd).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(99);
    expect(element.matches(':state(scrolling)')).toBe(true);
    vi.advanceTimersByTime(1);
    expect(element.matches(':state(scrolling)')).toBe(false);
  });

  it('should dispatch scrollboxend when the scrollbox reaches the end', async () => {
    const scrollbox = element.shadowRoot.querySelector<HTMLElement>('[part="_scrollbox"]')!;
    Object.defineProperties(scrollbox, {
      clientHeight: { configurable: true, value: 50 },
      scrollHeight: { configurable: true, value: 100 },
      scrollTop: { configurable: true, value: 50 }
    });

    const event = untilEvent(element, 'scrollboxend');
    scrollbox.dispatchEvent(new Event('scrollend'));
    const scrollboxEndEvent = await event;

    expect(scrollboxEndEvent.bubbles).toBe(true);
    expect(scrollboxEndEvent.composed).toBe(true);
  });
});

describe(`${Grid.metadata.tag}: windowed rows`, () => {
  const frame = () => new Promise(requestAnimationFrame);
  let fixture: HTMLElement;
  let grid: Grid;
  let list: VirtualList;
  let deferred: boolean;

  function draw(range: VirtualRange) {
    if (range !== list.range) return;
    grid.ariaRowCount = `${range.count + 2}`;
    const rows = Array.from({ length: range.end - range.start }, (_, i) => {
      const row = document.createElement('nve-grid-row');
      row.ariaRowIndex = `${range.start + i + 2}`;
      for (let column = 0; column < 3; column++) {
        const cell = document.createElement('nve-grid-cell');
        cell.textContent = `${range.start + i}:${column}`;
        row.append(cell);
      }
      return row;
    });
    list.replaceChildren(...rows);
  }

  async function settle() {
    await elementIsStable(grid);
    await elementIsStable(list);
    await frame();
    await frame();
  }

  function key(code: string, ctrlKey = false) {
    document.activeElement.dispatchEvent(
      new KeyboardEvent('keydown', { code, ctrlKey, bubbles: true, composed: true, cancelable: true })
    );
  }

  beforeEach(async () => {
    deferred = false;
    fixture = await createFixture(html`
      <nve-grid aria-label="Jobs" stripe>
        <nve-grid-header aria-rowindex="1"><nve-grid-column>Job</nve-grid-column><nve-grid-column>Status</nve-grid-column><nve-grid-column>Owner</nve-grid-column></nve-grid-header>
        <nve-virtual-list item-count="10000" item-height="40" item-buffer="0" style="--scroll-height:200px"></nve-virtual-list>
        <nve-grid-footer>10,000 jobs <button type="button">Next</button></nve-grid-footer>
      </nve-grid>`);
    grid = fixture.querySelector('nve-grid');
    list = fixture.querySelector('nve-virtual-list');
    list.addEventListener('virtual-change', event => {
      if (!deferred) draw((event as CustomEvent<VirtualRange>).detail);
    });
    await settle();
    draw(list.range);
    await settle();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    removeFixture(fixture);
  });

  it('uses the existing grid navigation for rendered rows', () => {
    const cells = navigationCells(grid);
    expect(cells).toHaveLength(18);
    expect(cells.filter(cell => cell.tabIndex === 0)).toHaveLength(1);
    cells[0].focus();
    key('ArrowDown');
    expect(document.activeElement).toBe(cells[3]);
    key('End', true);
    expect(document.activeElement).toBe(cells.at(-1));
    expect(list.scrollTop).toBe(0);
    key('Home', true);
    expect(document.activeElement).toBe(cells[0]);
  });

  it('reconciles replacement rows without a separate navigation mode', async () => {
    list.scrollToIndex(500);
    await settle();
    await vi.waitFor(() => expect(navigationCells(grid).filter(cell => cell.tabIndex === 0)).toHaveLength(1));
    const cells = navigationCells(grid);
    cells[0].focus();
    key('ArrowDown');
    expect(document.activeElement).toBe(cells[3]);
    expect(cells[3].textContent).toBe(`${list.start}:0`);
    expect(list.children.length).toBeLessThanOrEqual(6);
  });

  it('leaves full-dataset ARIA metadata with the renderer', async () => {
    expect(grid.getAttribute('aria-rowcount')).toBe('10002');
    expect(list.firstElementChild.getAttribute('aria-rowindex')).toBe('2');
    expect(grid._internals.ariaRowCount).toBe(null);
    list.scrollToIndex(500);
    await settle();
    expect(list.firstElementChild.getAttribute('aria-rowindex')).toBe(`${list.start + 2}`);
  });

  it('lets the renderer discard stale requests and positions replacement rows automatically', async () => {
    deferred = true;
    list.scrollTop = 400;
    list.refresh();
    const stale = list.range;
    list.scrollTop = 800;
    list.refresh();
    const current = list.range;
    draw(stale);
    await settle();
    expect(list.firstElementChild.textContent).toContain('0:0');
    expect(list.shadowRoot.querySelector<HTMLElement>('.content').hidden).toBe(true);
    draw(current);
    await settle();
    expect(list.shadowRoot.querySelector<HTMLElement>('.content').hidden).toBe(false);
    expect(list.shadowRoot.querySelector<HTMLElement>('.content').style.top).toBe(`${current.start * 40}px`);
    expect(list.firstElementChild.textContent).toContain(`${current.start}:0`);
  });

  it('keeps item geometry in the viewport and styling in CSS', async () => {
    list.firstElementChild.querySelector('nve-grid-cell').textContent = 'Long content '.repeat(100);
    await settle();
    expect(list.firstElementChild.getBoundingClientRect().height).toBe(40);
    expect(list.firstElementChild.querySelector('nve-grid-cell').getBoundingClientRect().height).toBeLessThanOrEqual(
      40
    );
    expect(getComputedStyle(list.firstElementChild).overflow).toBe('hidden');
    expect(getComputedStyle(list.firstElementChild).getPropertyValue('--background')).not.toBe(
      getComputedStyle(list.children[1]).getPropertyValue('--background')
    );
    expect(getComputedStyle(grid.shadowRoot.querySelector('[part="_scrollbox"]')).overflowX).toBe('auto');
  });

  it('keeps footer controls outside navigation and preserves Enter/Escape', async () => {
    const cell = list.querySelector<HTMLElement>('nve-grid-cell');
    cell.innerHTML = '<input aria-label="Name"><button type="button">Edit</button>';
    await elementIsStable(cell);
    cell.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, composed: true }));
    cell.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', bubbles: true, composed: true }));
    expect(document.activeElement).toBe(cell.querySelector('input'));
    key('ArrowDown');
    expect(document.activeElement).toBe(cell.querySelector('input'));
    cell
      .querySelector('input')
      .dispatchEvent(new KeyboardEvent('keyup', { code: 'Escape', bubbles: true, composed: true }));
    expect(document.activeElement).toBe(cell);
    const footer = grid.querySelector<HTMLButtonElement>('nve-grid-footer button');
    footer.focus();
    key('ArrowUp');
    expect(document.activeElement).toBe(footer);
  });

  it('uses shared scroll state and emits a single end event', async () => {
    const end = vi.fn();
    grid.addEventListener('scrollboxend', end);
    await grid.scrollTo({ top: 399800 });
    await settle();
    expect(list.scrollTop).toBe(399800);
    end.mockClear();
    list.dispatchEvent(new Event('scrollend'));
    expect(end).toHaveBeenCalledOnce();
    expect(grid.stateScrollConfig.target).toBe(list);
  });

  async function widenColumns() {
    grid.style.width = '400px';
    const header = grid.querySelector('nve-grid-header');
    for (const column of header.columns) column.width = '300px';
    await settle();
    await vi.waitFor(() => expect(header.columns[0].getBoundingClientRect().width).toBe(300));
    return header;
  }

  it('keeps header and body aligned when focus scrolls offscreen columns', async () => {
    const header = await widenColumns();
    const scrollbox = grid.shadowRoot.querySelector<HTMLElement>('[part="_scrollbox"]');
    header.columns[0].focus();
    key('End');
    await settle();
    await vi.waitFor(() => {
      expect(scrollbox.scrollLeft).toBeGreaterThan(0);
      expect(list.scrollLeft).toBe(0);
      expect(header.scrollLeft).toBe(0);
    });
    const column = header.columns.at(-1);
    const cell = list.firstElementChild.lastElementChild;
    expect(Math.abs(column.getBoundingClientRect().x - cell.getBoundingClientRect().x)).toBeLessThan(1);
    key('ArrowDown');
    await settle();
    expect(document.activeElement).toBe(cell);
    expect(Math.abs(column.getBoundingClientRect().x - cell.getBoundingClientRect().x)).toBeLessThan(1);
    await grid.scrollTo({ left: 100 });
    await vi.waitFor(() => expect(scrollbox.scrollLeft).toBe(100));
    expect(list.scrollWidth).toBe(list.clientWidth);
    expect(scrollbox.scrollHeight).toBe(scrollbox.clientHeight);
    expect(Math.abs(column.getBoundingClientRect().x - cell.getBoundingClientRect().x)).toBeLessThan(1);
    await grid.scrollTo(200, 400);
    await settle();
    expect(scrollbox.scrollLeft).toBe(200);
    expect(scrollbox.scrollTop).toBe(0);
    expect(list.scrollTop).toBe(400);
    expect(list.scrollLeft).toBe(0);
  });

  it('preserves horizontal scrolling while replacement rows are pending', async () => {
    const header = await widenColumns();
    const scrollbox = grid.shadowRoot.querySelector<HTMLElement>('[part="_scrollbox"]');
    await grid.scrollTo({ left: 300 });
    await settle();
    deferred = true;
    list.scrollTop = 400;
    list.refresh();
    await settle();
    expect(list.shadowRoot.querySelector<HTMLElement>('.content').hidden).toBe(true);
    expect(scrollbox.scrollLeft).toBe(300);
    expect(list.scrollLeft).toBe(0);
    expect(header.scrollLeft).toBe(0);
    draw(list.range);
    await settle();
    expect(scrollbox.scrollLeft).toBe(300);
    expect(list.scrollLeft).toBe(0);
    expect(header.scrollLeft).toBe(0);
  });

  it('supports list replacement and returning to ordinary rows', async () => {
    const header = await widenColumns();
    const scrollbox = grid.shadowRoot.querySelector<HTMLElement>('[part="_scrollbox"]');
    await grid.scrollTo({ left: 300 });
    await settle();
    expect(scrollbox.scrollLeft).toBe(300);
    const replacement = list.cloneNode() as VirtualList;
    list.replaceWith(replacement);
    list = replacement;
    await settle();
    draw(list.range);
    await settle();
    expect(grid.stateScrollConfig.target).toBe(replacement);
    expect(header.scrollLeft).toBe(0);
    expect(scrollbox.scrollLeft).toBe(300);
    list.remove();
    const row = document.createElement('nve-grid-row');
    row.innerHTML = '<nve-grid-cell>Ordinary</nve-grid-cell>';
    grid.append(row);
    await elementIsStable(grid);
    await vi.waitFor(() => expect(navigationCells(grid).filter(cell => cell.tabIndex === 0)).toHaveLength(1));
    expect(navigationCells(grid)).toContain(row.firstElementChild);
    expect(grid.stateScrollConfig.target).toBe(grid.shadowRoot.querySelector('[part="_scrollbox"]'));
  });
});
