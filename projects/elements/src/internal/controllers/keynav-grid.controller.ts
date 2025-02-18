import type { ReactiveController, ReactiveElement } from 'lit';
import { onChildListMutation, throttle } from '../utils/events.js';
import {
  validKeyNavigationCode,
  isContextMenuClick,
  getFlattenedDOMTree,
  getFlattenedFocusableItems,
  KeynavCode
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
  return (target: any) => target.addInitializer((instance: T) => new KeyNavigationGridController(instance));
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
    if (validKeyNavigationCode(e) && isSimpleFocusable(getActiveElement() as Element)) {
      const { x, y } = getNextKeyGridItem(this.#hostCells, this.#hostRows, {
        code: e.code,
        ctrlKey: e.ctrlKey,
        dir: this.host.dir
      });

      const nextCell = Array.from(getFlattenedDOMTree(this.#hostRows[y])).filter(
        c => !!this.#hostCells.find(i => i === c)
      )[x];
      this.#setActiveCell(e, nextCell);
      e.preventDefault();
    }
  }

  #setActiveCell(e: any, activeCell: HTMLElement) {
    setActiveKeyListItem(this.#hostCells, activeCell);

    const items = getFlattenedFocusableItems(activeCell);
    const simpleItems = items.filter(i => isSimpleFocusable(i));

    if (simpleItems.length === 1 && items.length === 1) {
      focusElement(simpleItems[0]);
    } else {
      focusElement(activeCell);
    }

    const detail = { code: e.code, shiftKey: e.shiftKey, activeItem: activeCell };
    activeCell.dispatchEvent(new CustomEvent('nve-key-change', { bubbles: true, detail }));
  }

  #updateCellActivation(e: KeyboardEvent) {
    const activeCell = Array.from(this.#hostCells).find(i => i.tabIndex === 0) as HTMLElement;
    if (e.code === 'Escape') {
      activeCell?.focus();
    }

    if (e.code === 'Enter' && activeCell === e.composedPath()[0]) {
      getFlattenedFocusableItems(activeCell as Node)[0]?.focus();
    }
  }
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

  const start = config.dir === 'rtl' ? KeynavCode.ArrowRight : KeynavCode.ArrowLeft;
  const end = config.dir === 'rtl' ? KeynavCode.ArrowLeft : KeynavCode.ArrowRight;

  if (config.code === KeynavCode.ArrowUp && y !== 0) {
    y = y - 1;
  } else if (config.code === KeynavCode.ArrowDown && y < rowCount) {
    y = y + 1;
  } else if (config.code === start && x !== 0) {
    x = x - 1;
  } else if (config.code === end && x < columnCount) {
    x = x + 1;
  } else if (config.code === KeynavCode.End) {
    x = columnCount;

    if (config.ctrlKey) {
      y = rowCount;
    }
  } else if (config.code === KeynavCode.Home) {
    x = 0;

    if (config.ctrlKey) {
      y = 0;
    }
  } else if (config.code === KeynavCode.PageUp) {
    y = y - 4 > 0 ? y - 4 : 0;
  } else if (config.code === KeynavCode.PageDown) {
    y = y + 4 < rowCount ? y + 4 : rowCount;
  }

  return { x, y };
}
