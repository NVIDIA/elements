// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, elementIsStable, removeFixture } from '@internals/testing';
import { Grid, type GridColumn } from '@nvidia-elements/core/grid';
import type { DragHandle } from '@nvidia-elements/core/drag-handle';
import type { DraggableDropDetail } from '@nvidia-elements/foundations/draggable-list';
import '@nvidia-elements/core/grid/define.js';
import '@nvidia-elements/core/drag-handle/define.js';
import '@nvidia-elements/foundations/virtual-list/define.js';

function key(target: HTMLElement, value: string) {
  const init = { key: value, code: value === ' ' ? 'Space' : value, bubbles: true, composed: true, cancelable: true };
  const event = new KeyboardEvent('keydown', init);
  target.dispatchEvent(event);
  target.dispatchEvent(new KeyboardEvent('keyup', init));
  return event;
}

function drag(target: HTMLElement, type: string, portion = 0.75) {
  const rect = target.getBoundingClientRect();
  const event = new DragEvent(type, {
    bubbles: true,
    composed: true,
    cancelable: true,
    dataTransfer: new DataTransfer(),
    clientY: rect.top + rect.height * portion,
    clientX: rect.left + rect.width * portion
  });
  target.dispatchEvent(event);
  return event;
}

describe(`${Grid.metadata.tag} draggable rows and columns`, () => {
  let fixture: HTMLElement;
  let grid: Grid;
  let other: Grid;
  let drop: ReturnType<typeof vi.fn<(event: CustomEvent<DraggableDropDetail>) => void>>;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <nve-grid draggable-rows draggable-columns aria-label="Jobs">
        <nve-grid-header>
          <nve-grid-column width="140px" column-align="end">Job<nve-drag-handle aria-label="Move job column"></nve-drag-handle></nve-grid-column>
          <nve-grid-column width="180px">Status<nve-drag-handle aria-label="Move status column"></nve-drag-handle><button>Sort status</button></nve-grid-column>
        </nve-grid-header>
        <nve-grid-row><nve-grid-cell>A<nve-drag-handle aria-label="Move A"></nve-drag-handle></nve-grid-cell><nve-grid-cell><input aria-label="Edit status"></nve-grid-cell></nve-grid-row>
        <nve-grid-row><nve-grid-cell>B<nve-drag-handle aria-label="Move B"></nve-drag-handle></nve-grid-cell><nve-grid-cell>Ready</nve-grid-cell></nve-grid-row>
        <nve-grid-row><nve-grid-cell>C<nve-drag-handle aria-label="Move C"></nve-drag-handle></nve-grid-cell><nve-grid-cell>Done</nve-grid-cell></nve-grid-row>
      </nve-grid>
      <nve-grid draggable-rows draggable-columns aria-label="Queue" style="min-height:160px">
        <nve-grid-header><nve-grid-column>Job<nve-drag-handle aria-label="Move queue column"></nve-drag-handle></nve-grid-column><nve-grid-column>Status</nve-grid-column></nve-grid-header>
        <nve-grid-placeholder tabindex="0">Drop jobs here</nve-grid-placeholder>
      </nve-grid>
    `);
    [grid, other] = Array.from(fixture.querySelectorAll('nve-grid'));
    await elementIsStable(grid);
    await elementIsStable(other);
    drop = vi.fn();
    fixture.addEventListener('draggable-drop', drop);
  });
  afterEach(() => {
    removeFixture(fixture);
  });

  it('resolves a native handle drag to its row and its full-row preview', () => {
    const rows = grid.querySelectorAll('nve-grid-row');
    const source = rows[0].querySelector('nve-drag-handle')!;
    const transfer = new DataTransfer();
    const preview = vi.spyOn(transfer, 'setDragImage');
    source.dispatchEvent(
      new DragEvent('dragstart', { bubbles: true, composed: true, cancelable: true, dataTransfer: transfer })
    );
    expect(preview).toHaveBeenCalledWith(rows[0], 0, 0);
    drag(rows[2], 'drop');
    expect(drop.mock.calls[0][0].detail).toMatchObject({
      source: rows[0],
      target: rows[2],
      sourceIndex: 0,
      targetIndex: 2,
      placement: 'after'
    });
    expect(rows[0].parentElement).toBe(grid);
  });

  it('transfers rows into an empty grid and leaves the mutation to the application', () => {
    const row = grid.querySelector('nve-grid-row')!;
    drag(row.querySelector('nve-drag-handle')!, 'dragstart');
    drag(other.querySelector('nve-grid-placeholder')!, 'drop');
    expect(drop.mock.calls[0][0].detail).toMatchObject({
      source: row,
      targetContainer: other,
      sourceContainer: grid,
      targetIndex: 0,
      placement: 'append'
    });
    expect(row.parentElement).toBe(grid);
    expect(other.querySelector('nve-grid-row')).toBeNull();
  });

  it('keeps row and column sessions separate when both features are enabled', () => {
    const row = grid.querySelector('nve-grid-row')!;
    const column = grid.querySelector('nve-grid-column')!;
    drag(row.querySelector('nve-drag-handle')!, 'dragstart');
    expect(drag(column, 'dragover').defaultPrevented).toBe(false);
    drag(column, 'drop');
    expect(drop).not.toHaveBeenCalled();
    drag(column.querySelector('nve-drag-handle')!, 'dragstart');
    expect(drag(row, 'dragover').defaultPrevented).toBe(false);
    drag(row, 'drop');
    expect(drop).not.toHaveBeenCalled();
  });

  it('keeps a row handle unpressed when a column pickup rejects it', () => {
    const columnHandle = grid.querySelector<DragHandle>('nve-grid-column nve-drag-handle')!;
    const rowHandle = grid.querySelector<DragHandle>('nve-grid-row nve-drag-handle')!;
    columnHandle.click();
    expect(columnHandle.pressed).toBe(true);

    rowHandle.click();
    expect(rowHandle.pressed).toBe(false);
    expect(columnHandle.pressed).toBe(true);
    expect(drop).not.toHaveBeenCalled();

    key(columnHandle, 'Escape');
    expect(columnHandle.pressed).toBe(false);
    expect(rowHandle.pressed).toBe(false);
  });

  it('reorders headers locally and rejects cross-grid column drops', () => {
    const columns = grid.querySelectorAll('nve-grid-column');
    drag(columns[0].querySelector('nve-drag-handle')!, 'dragstart');
    drag(columns[1], 'drop');
    expect(drop.mock.calls[0][0].detail).toMatchObject({ source: columns[0], target: columns[1], targetIndex: 1 });
    drag(columns[0].querySelector('nve-drag-handle')!, 'dragstart');
    expect(drag(other.querySelector('nve-grid-column')!, 'dragover').defaultPrevented).toBe(false);
    drag(other.querySelector('nve-grid-column')!, 'drop');
    expect(drop).toHaveBeenCalledTimes(1);
  });

  it('coordinates handle pressed state and consumes grid navigation only during pickup', async () => {
    const handle = grid.querySelector<DragHandle>('nve-grid-row nve-drag-handle')!;
    handle.focus();
    key(handle, ' ');
    await elementIsStable(handle);
    expect(handle.pressed).toBe(true);
    expect(key(handle, 'ArrowDown').defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(handle);
    key(handle, 'Enter');
    await elementIsStable(handle);
    expect(handle.pressed).toBe(false);
    expect(drop.mock.calls[0][0].detail.targetIndex).toBe(1);
    key(handle, ' ');
    key(handle, 'Escape');
    expect(document.activeElement).toBe(handle);
    expect(drop).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard transfer to a focusable empty-grid placeholder', () => {
    const handle = grid.querySelector<DragHandle>('nve-grid-row nve-drag-handle')!;
    key(handle, ' ');
    const placeholder = other.querySelector('nve-grid-placeholder')!;
    placeholder.focus();
    key(placeholder, 'Enter');
    expect(drop.mock.calls[0][0].detail).toMatchObject({
      targetContainer: other,
      targetIndex: 0,
      interaction: 'keyboard'
    });
  });

  it('cancels a row pickup with Escape from another row-enabled grid header', async () => {
    const destination = document.createElement('nve-grid');
    destination.draggableRows = true;
    destination.innerHTML = '<nve-grid-header><nve-grid-column>Job</nve-grid-column></nve-grid-header>';
    fixture.append(destination);
    await elementIsStable(destination);
    const handle = grid.querySelector<DragHandle>('nve-grid-row nve-drag-handle')!;
    const column = destination.querySelector('nve-grid-column')!;
    handle.focus();
    key(handle, ' ');
    expect(handle.pressed).toBe(true);

    column.focus();
    expect(document.activeElement).toBe(column);
    expect(key(column, 'Escape').defaultPrevented).toBe(true);
    expect(handle.pressed).toBe(false);
    expect(drop).not.toHaveBeenCalled();
  });

  it('preserves editing, sorting and non-handle row interactions', () => {
    const input = grid.querySelector('input')!;
    const sort = grid.querySelector('button')!;
    const click = vi.fn();
    sort.addEventListener('click', click);
    sort.click();
    expect(click).toHaveBeenCalledTimes(1);
    expect(key(input, 'ArrowDown').defaultPrevented).toBe(false);
    expect(key(input, ' ').defaultPrevented).toBe(false);
    expect(drag(grid.querySelector('nve-grid-row')!, 'dragstart').defaultPrevented).toBe(true);
    expect(drop).not.toHaveBeenCalled();
  });

  it('lets links and standalone handles keep their native drag behavior', async () => {
    const row = grid.querySelector('nve-grid-row')!;
    const link = document.createElement('a');
    link.href = '#job';
    link.textContent = 'Open job';
    row.firstElementChild!.append(link);
    const start = vi.fn();
    grid.addEventListener('draggable-start', start);
    expect(drag(link, 'dragstart').defaultPrevented).toBe(false);

    grid.draggableRows = false;
    await elementIsStable(grid);
    expect(drag(row.querySelector('nve-drag-handle')!, 'dragstart').defaultPrevented).toBe(false);
    expect(start).not.toHaveBeenCalled();
  });

  it('respects disabled and readonly handles and disabling a feature during pickup', async () => {
    const handle = grid.querySelector<DragHandle>('nve-grid-row nve-drag-handle')!;
    handle.disabled = true;
    await elementIsStable(handle);
    expect(drag(handle, 'dragstart').defaultPrevented).toBe(true);
    handle.disabled = false;
    handle.readOnly = true;
    await elementIsStable(handle);
    expect(drag(handle, 'dragstart').defaultPrevented).toBe(true);
    handle.readOnly = false;
    await elementIsStable(handle);
    key(handle, ' ');
    grid.draggableRows = false;
    await elementIsStable(grid);
    await elementIsStable(handle);
    expect(handle.pressed).toBe(false);
    drag(grid.querySelectorAll('nve-grid-row')[2], 'drop');
    expect(drop).not.toHaveBeenCalled();
  });

  it('refreshes column widths and replaces obsolete alignment rules after an applied reorder', async () => {
    const columns = Array.from(grid.querySelectorAll<GridColumn>('nve-grid-column'));
    const header = grid.querySelector('nve-grid-header')!;
    const cells = Array.from(grid.querySelector('nve-grid-row')!.querySelectorAll('nve-grid-cell'));
    fixture.addEventListener('draggable-drop', (event: CustomEvent<DraggableDropDetail>) => {
      const { source, targetIndex } = event.detail;
      const sourceIndex = columns.indexOf(source as GridColumn);
      header.append(source);
      for (const row of grid.querySelectorAll('nve-grid-row')) row.append(row.children[sourceIndex]);
      expect(targetIndex).toBe(1);
    });
    const handle = columns[0].querySelector('nve-drag-handle')!;
    key(handle, ' ');
    key(handle, 'End');
    key(handle, ' ');
    await elementIsStable(header);
    await elementIsStable(columns[0]);
    expect(header.lastElementChild).toBe(columns[0]);
    expect(columns[0].ariaColIndex).toBe('2');
    expect(grid.style.getPropertyValue('--c0')).toBe('180px');
    expect(grid.style.getPropertyValue('--c1')).toBe('140px');
    expect(getComputedStyle(cells[0]).getPropertyValue('--justify-content').trim()).toBe('end');
    expect(getComputedStyle(cells[1]).getPropertyValue('--justify-content').trim()).not.toBe('end');
  });

  it('uses rendered virtual-row indices and cancels when the rendered window changes', async () => {
    const viewport = document.createElement('nve-virtual-list');
    viewport.itemCount = 2;
    viewport.itemHeight = 44;
    viewport.style.setProperty('--scroll-height', '100px');
    const rows = Array.from(grid.querySelectorAll('nve-grid-row'));
    rows[2].remove();
    viewport.append(rows[0], rows[1]);
    grid.append(viewport);
    rows[0].ariaRowIndex = '101';
    rows[1].ariaRowIndex = '102';
    await elementIsStable(viewport);
    await elementIsStable(grid);
    const handle = rows[0].querySelector('nve-drag-handle')!;
    key(handle, ' ');
    key(handle, 'End');
    key(handle, 'Enter');
    expect(drop.mock.calls[0][0].detail).toMatchObject({ sourceIndex: 0, targetIndex: 1 });
    key(handle, ' ');
    key(handle, 'End');
    viewport.replaceChildren();
    await elementIsStable(viewport);
    expect(handle.hasAttribute('pressed')).toBe(false);
    expect(rows[0].hasAttribute('nve-draggable')).toBe(false);
    expect(drop).toHaveBeenCalledTimes(1);
  });

  it('lays out a visible append target after a virtual viewport', async () => {
    const viewport = document.createElement('nve-virtual-list');
    viewport.itemCount = 3;
    viewport.itemHeight = 44;
    viewport.style.setProperty('--scroll-height', '100px');
    viewport.append(...grid.querySelectorAll('nve-grid-row'));
    const placeholder = document.createElement('nve-grid-placeholder');
    placeholder.textContent = 'Append a job';
    grid.append(viewport, placeholder);
    await elementIsStable(viewport);
    await elementIsStable(grid);

    const bounds = placeholder.getBoundingClientRect();
    expect(bounds.height).toBeGreaterThan(0);
    expect(bounds.top).toBeCloseTo(viewport.getBoundingClientRect().bottom);
  });

  it('replaces fixed-column rules when an applied reorder moves a column to the other edge', async () => {
    grid.style.width = '320px';
    const columns = Array.from(grid.querySelectorAll('nve-grid-column'));
    const header = grid.querySelector('nve-grid-header')!;
    const cells = Array.from(grid.querySelector('nve-grid-row')!.querySelectorAll('nve-grid-cell'));
    columns[0].position = 'fixed';
    await elementIsStable(columns[0]);
    expect(columns[0].hasAttribute('left')).toBe(true);
    fixture.addEventListener('draggable-drop', () => {
      header.append(columns[0]);
      for (const row of grid.querySelectorAll('nve-grid-row')) row.append(row.firstElementChild!);
    });
    const handle = columns[0].querySelector('nve-drag-handle')!;
    key(handle, ' ');
    key(handle, 'End');
    key(handle, 'Enter');
    await elementIsStable(header);
    await elementIsStable(columns[0]);
    expect(columns[0].hasAttribute('right')).toBe(true);
    expect(columns[0].hasAttribute('left')).toBe(false);
    expect(getComputedStyle(cells[0]).position).toBe('sticky');
    expect(getComputedStyle(cells[1]).position).not.toBe('sticky');
  });
});
