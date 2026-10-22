// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture, untilEvent } from '@internals/testing';
import { Grid } from '@nvidia-elements/core/grid';
import '@nvidia-elements/core/grid/define.js';

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
    expect(element.keynavGridConfig.cells[0].tabIndex).toBe(0);
    expect(element.keynavGridConfig.cells[1].tabIndex).toBe(-1);
  });

  it('should restore keyboard navigation after repeated attribute-only mutations', async () => {
    const cells = element.keynavGridConfig.cells;
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
        const cells = element.keynavGridConfig.cells;
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
      expect(element.keynavGridConfig.cells.filter(item => item.tabIndex === 0)).toHaveLength(1);
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
    const cells = element.keynavGridConfig.cells;
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
