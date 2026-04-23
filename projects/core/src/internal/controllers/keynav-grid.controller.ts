// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { onChildListMutation, throttle } from '../utils/events.js';
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
import {
  focusElement,
  getActiveElement,
  initializeKeyListItems,
  setActiveKeyListItem,
  isSimpleFocusable
} from '../utils/focus.js';

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
  #observers: MutationObserver[] = [];

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
    return [...Array.from(this.#config.columns ?? []), ...Array.from(this.#config.cells)];
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.host.updateComplete;
    initializeKeyListItems(this.#hostCells);
    this.#config.grid.addEventListener('keyup', (e: KeyboardEvent) => this.#updateCellActivation(e));
    this.#config.grid.addEventListener('keydown', (e: KeyboardEvent) => this.#keynavCell(e));
    this.#config.grid.addEventListener('mouseup', (e: MouseEvent) => this.#clickCell(e));
    this.#observers.push(
      onChildListMutation(
        this.host,
        throttle(() => initializeKeyListItems(this.#hostCells), 500)
      )
    );
  }

  hostDisconnected() {
    this.#observers.forEach(o => o?.disconnect());
  }

  #clickCell(e: MouseEvent) {
    if (!isContextMenuClick(e)) {
      const focusedElement = e.composedPath()[0] as HTMLElement;
      const activeCell = this.#hostCells.find(i => i === focusedElement) ? focusedElement : null;
      if (activeCell) {
        this.#setActiveCell(e, activeCell as HTMLElement);
      }
    }
  }

  #keynavCell(e: KeyboardEvent) {
    const rows = Array.from(this.#hostRows);
    const cells = Array.from(this.#hostCells);

    if (GlobalStateService.state.env !== 'production' && hasInvalidDOMGrid(rows)) {
      LogService.warn('Invalid grid structure, all rows must have the same number of cells');
      return;
    }

    if (validKeyNavigationCode(e) && isSimpleFocusable(getActiveElement() as Element)) {
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
  }

  #setActiveCell(e: KeyboardEvent | MouseEvent, activeCell: HTMLElement) {
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

  #updateCellActivation(e: KeyboardEvent) {
    const activeCell = Array.from(this.#hostCells).find(i => i.tabIndex === 0) as HTMLElement;
    if (e.code === 'Escape') {
      activeCell?.focus();
    }

    if (e.code === 'Enter' && activeCell === e.composedPath()[0]) {
      getFlattenedFocusableItems(activeCell as HTMLElement)[0]?.focus();
    }
  }
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
  x: number,
  y: number,
  columnCount: number,
  rowCount: number,
  ctrlKey: boolean
) {
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
    ({ x, y } = applyGridHomeEnd(config.code, x, y, columnCount, rowCount, config.ctrlKey));
  }

  return { x, y };
}
