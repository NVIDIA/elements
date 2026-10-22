// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { throttle } from '../utils/events.js';
import { GlobalStateService } from '../services/global.service.js';
import { LogService } from '../services/log.service.js';
import {
  validKeyNavigationCode,
  isContextMenuClick,
  getFlattenedDOMTree,
  getFlattenedFocusableItems,
  KeynavCode,
  hasInvalidDOMGrid
} from '../utils/dom.js';
import { focusElement, getActiveElement, setActiveKeyListItem, isSimpleFocusable } from '../utils/focus.js';

export interface KeynavGridConfig {
  grid?: HTMLElement;
  columnRow?: HTMLElement;
  columns?: NodeListOf<HTMLElement> | HTMLElement[];
  rows: NodeListOf<HTMLElement> | HTMLElement[];
  cells: NodeListOf<HTMLElement> | HTMLElement[];
}

export interface KeynavGridElement {
  keynavGridConfig: KeynavGridConfig;
}

/**
 * https://w3c.github.io/aria-practices/#gridNav_focus
 */
export function keyNavigationGrid<T extends ReactiveElement & KeynavGridElement>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer!((instance: T) => new KeyNavigationGridController(instance));
}

export class KeyNavigationGridController<T extends ReactiveElement & KeynavGridElement> implements ReactiveController {
  #observer?: MutationObserver;
  #grid?: HTMLElement;
  #activeCell?: HTMLElement;
  #cells = new WeakSet<HTMLElement>();
  #updateCells = throttle(() => this.#initializeCells(), 500, { trailing: true });

  get #config() {
    return {
      grid: this.host,
      ...this.host.keynavGridConfig
    };
  }

  get #hostRows() {
    const rows = Array.from(this.#config.rows);

    if (this.#config.columnRow) {
      rows.unshift(this.#config.columnRow);
    }

    return rows;
  }

  get #hostCells() {
    const { columns, cells } = this.#config;
    return [...Array.from(columns ?? []), ...Array.from(cells)];
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.host.updateComplete;
    if (!this.host.isConnected) return;

    this.#grid = this.#config.grid;
    this.#initializeCells();
    this.#grid.addEventListener('keyup', this.#onKeyUp);
    this.#grid.addEventListener('keydown', this.#onKeyDown);
    this.#grid.addEventListener('mouseup', this.#onMouseUp);
    this.#observer?.disconnect();
    this.#observer = new MutationObserver(this.#onMutations);
    this.#observer.observe(this.#grid, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex']
    });
  }

  hostDisconnected() {
    this.#observer?.disconnect();
    this.#observer = undefined;
    this.#updateCells.cancel();
    this.#grid?.removeEventListener('keyup', this.#onKeyUp);
    this.#grid?.removeEventListener('keydown', this.#onKeyDown);
    this.#grid?.removeEventListener('mouseup', this.#onMouseUp);
    this.#grid = undefined;
    this.#activeCell = undefined;
  }

  #initializeCells() {
    const cells = this.#hostCells;
    const activeCell =
      cells.find(cell => cell.tabIndex === 0) ??
      (this.#activeCell && cells.includes(this.#activeCell) ? this.#activeCell : cells[0]);
    this.#activeCell = activeCell;
    this.#cells = new WeakSet(cells);
    for (const cell of cells) {
      const tabIndex = cell === activeCell ? '0' : '-1';
      // Avoid observing our own unchanged writes after a DOM morph or key change.
      if (cell.getAttribute('tabindex') !== tabIndex) {
        cell.setAttribute('tabindex', tabIndex);
      }
    }
  }

  #onMutations = (mutations: MutationRecord[]) => {
    const changed = mutations.some(mutation => {
      if (mutation.type === 'attributes') {
        const cell = mutation.target;
        // Ignore nested controls and our own tabindex writes.
        return (
          cell instanceof HTMLElement &&
          this.#cells.has(cell) &&
          cell.getAttribute('tabindex') !== (cell === this.#activeCell ? '0' : '-1')
        );
      }
      return [...mutation.addedNodes, ...mutation.removedNodes].some(node => node.nodeType === Node.ELEMENT_NODE);
    });
    if (changed) this.#updateCells();
  };

  #flushCellUpdates() {
    // A key event can arrive before the observer delivers a synchronous DOM update.
    this.#onMutations(this.#observer?.takeRecords() ?? []);
    this.#updateCells.flush();
  }

  #onMouseUp = (e: MouseEvent) => {
    if (!isContextMenuClick(e)) {
      this.#flushCellUpdates();
      const focusedElement = e.composedPath()[0] as HTMLElement;
      const activeCell = this.#hostCells.find(i => i === focusedElement) ? focusedElement : null;
      if (activeCell) {
        this.#setActiveCell(e, activeCell);
      }
    }
  };

  #onKeyDown = (e: KeyboardEvent) => {
    if (!validKeyNavigationCode(e)) return;
    this.#flushCellUpdates();
    const rows = Array.from(this.#hostRows);
    const cells = Array.from(this.#hostCells);

    if (GlobalStateService.state.env !== 'production' && hasInvalidDOMGrid(rows)) {
      LogService.warn('Invalid grid structure, all rows must have the same number of cells');
      return;
    }

    if (isSimpleFocusable(getActiveElement() as Element)) {
      const { x, y } = getNextKeyGridItem(cells, rows, {
        code: e.code,
        ctrlKey: e.ctrlKey,
        dir: this.host.dir
      });

      const nextCell = Array.from(getFlattenedDOMTree(rows[y]!)).filter(c => !!cells.find(i => i === c))[
        x
      ] as HTMLElement;
      this.#setActiveCell(e, nextCell);
      e.preventDefault();
    }
  };

  #setActiveCell(e: KeyboardEvent | MouseEvent, activeCell: HTMLElement) {
    this.#activeCell = activeCell;
    setActiveKeyListItem(this.#hostCells, activeCell);

    const items = getFlattenedFocusableItems(activeCell);
    const simpleItems = items.filter(i => isSimpleFocusable(i));

    if (simpleItems.length === 1 && items.length === 1) {
      focusElement(simpleItems[0]!);
    } else {
      focusElement(activeCell);
    }

    const detail = { code: e instanceof KeyboardEvent ? e.code : null, shiftKey: e.shiftKey, activeItem: activeCell };
    activeCell.dispatchEvent(new CustomEvent('nve-key-change', { bubbles: true, composed: true, detail }));
  }

  #onKeyUp = (e: KeyboardEvent) => {
    if (e.code !== 'Enter' && e.code !== 'Escape') return;
    this.#flushCellUpdates();
    const activeCell = Array.from(this.#hostCells).find(i => i.tabIndex === 0) as HTMLElement;
    if (e.code === 'Escape') {
      activeCell?.focus();
    }

    if (e.code === 'Enter' && activeCell === e.composedPath()[0]) {
      getFlattenedFocusableItems(activeCell)[0]?.focus();
    }
  };
}

function getGridDelta(code: KeynavCode | string, dir: string): { dx: number; dy: number } | null {
  const start = dir === 'rtl' ? KeynavCode.ArrowRight : KeynavCode.ArrowLeft;
  const end = dir === 'rtl' ? KeynavCode.ArrowLeft : KeynavCode.ArrowRight;

  if (code === KeynavCode.ArrowUp) return { dx: 0, dy: -1 };
  if (code === KeynavCode.ArrowDown) return { dx: 0, dy: 1 };
  if (code === start) return { dx: -1, dy: 0 };
  if (code === end) return { dx: 1, dy: 0 };
  if (code === KeynavCode.PageUp) return { dx: 0, dy: -4 };
  if (code === KeynavCode.PageDown) return { dx: 0, dy: 4 };
  return null;
}

function applyGridHomeEnd(
  code: KeynavCode | string,
  position: { x: number; y: number },
  bounds: { columnCount: number; rowCount: number; ctrlKey: boolean }
) {
  const { x, y } = position;
  const { columnCount, rowCount, ctrlKey } = bounds;
  if (code === KeynavCode.End) {
    return { x: columnCount, y: ctrlKey ? rowCount : y };
  }

  if (code === KeynavCode.Home) {
    return { x: 0, y: ctrlKey ? 0 : y };
  }

  return { x, y };
}

export function getNextKeyGridItem(
  cells: HTMLElement[],
  rows: HTMLElement[],
  config: { code: KeynavCode | string; ctrlKey: boolean; dir: string }
) {
  const currentCell = cells.find(i => i.tabIndex === 0) as HTMLElement;
  const currentRow = rows.find(r => getFlattenedDOMTree(r).find(c => c === currentCell)) as HTMLElement;
  const currentRowCells = Array.from(getFlattenedDOMTree(currentRow)).filter(c => !!cells.find(i => i === c));
  const rowCount = rows.length - 1;
  const columnCount = currentRowCells.length - 1;

  let x = currentRowCells.indexOf(currentCell);
  let y = rows.indexOf(currentRow);

  const delta = getGridDelta(config.code, config.dir);
  if (delta) {
    x = Math.max(0, Math.min(columnCount, x + delta.dx));
    y = Math.max(0, Math.min(rowCount, y + delta.dy));
  } else {
    ({ x, y } = applyGridHomeEnd(config.code, { x, y }, { columnCount, rowCount, ctrlKey: config.ctrlKey }));
  }

  return { x, y };
}
