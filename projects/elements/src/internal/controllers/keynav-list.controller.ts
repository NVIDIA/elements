import { ReactiveController, ReactiveElement } from 'lit';
import { focusElement, initializeKeyListItems, setActiveKeyListItem } from '../utils/focus.js';
import { getFlattenedFocusableItems, KeynavCode, validKeyNavigationCode } from '../utils/dom.js';

export interface KeynavListConfig {
  items: NodeListOf<HTMLElement> | HTMLElement[];
  layout?: 'both' | 'horizontal' | 'vertical';
  manageFocus?: boolean;
  manageTabindex?: boolean;
  loop?: boolean;
  dir?: string | null;
}

export interface KeynavListElement {
  keynavListConfig: KeynavListConfig;
}

/** https://webaim.org/techniques/keyboard/ */
export function keyNavigationList<T extends ReactiveElement & KeynavListElement>(): ClassDecorator {
  return (target: any) => target.addInitializer((instance: T) => new KeyNavigationListController(instance));
}

export class KeyNavigationListController<T extends ReactiveElement & KeynavListElement> implements ReactiveController {
  get #config(): KeynavListConfig {
    return {
      layout: 'horizontal',
      manageFocus: true,
      manageTabindex: true,
      loop: false,
      dir: this.host.getAttribute('rtl'),
      ...this.host.keynavListConfig,
    };
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.host.updateComplete;
    this.#initializeTabIndex();
    this.host.shadowRoot?.addEventListener('mouseup', (e: MouseEvent) => this.#clickItem(e));
    this.host.shadowRoot?.addEventListener('keydown', (e: KeyboardEvent) => this.#focusItem(e));
    this.host.addEventListener('mouseup', (e: MouseEvent) => this.#clickItem(e));
    this.host.addEventListener('keydown', (e: KeyboardEvent) => this.#focusItem(e));
  }

  #initializeTabIndex() {
    if (this.#config.manageFocus && this.#config.manageTabindex) {
      initializeKeyListItems(this.#config.items);
    }
  }

  #clickItem(e: Event) {
    const item = this.#getActiveItem(e);
    if (item) {
      this.#setActiveItem(e, item);
    }
  }

  #focusItem(e: KeyboardEvent) {
    if (validKeyNavigationCode(e)) {
      const activeItem = this.#getActiveItem(e);
      if (activeItem) {
        const { loop, layout, dir } = this.#config;
        const { next, previous } = getNextKeyListItem(activeItem, Array.from(this.#config.items), { loop, layout, dir, code: e.code as KeynavCode });

        if (next !== previous) {
          this.#setActiveItem(e, this.#config.items[next], this.#config.items[previous]);
        }
      }
    }
  }

  #getActiveItem(e: Event) {
    return e.composedPath().find(i => Array.from(this.#config.items).find(c => c === i)) as HTMLElement;
  }

  #setActiveItem(e: any, activeItem: HTMLElement, previousItem?: HTMLElement) {
    if (this.#config.manageFocus) {
      if (this.#config.manageTabindex) {
        setActiveKeyListItem(this.#config.items, activeItem);
      }

      const items = getFlattenedFocusableItems(activeItem);
      focusElement(items[0] ?? activeItem);
      e.preventDefault();
    }

    const detail = { activeItem, previousItem, code: e.code, metaKey: e.ctrlKey || e.metaKey, items: this.#config.items };
    activeItem.dispatchEvent(new CustomEvent('mlv-key-change', { bubbles: true, detail }));
  }
}

interface KeyListConfig {
  code: KeynavCode;
  loop?: boolean;
  layout?: 'horizontal' | 'vertical' | 'both';
  dir: string | null | undefined;
}

export function getNextKeyListItem(item: HTMLElement, items: HTMLElement[], config: KeyListConfig) {
  const { code, layout, loop, dir } = config;
  let next = items.indexOf(item);
  const previous = next;
  const start = dir === 'rtl' ? KeynavCode.ArrowRight : KeynavCode.ArrowLeft;
  const end = dir === 'rtl' ? KeynavCode.ArrowLeft : KeynavCode.ArrowRight;
  const itemCount = items.length - 1;

  if (layout !== 'horizontal' && code === KeynavCode.ArrowUp && next !== 0) {
    next = next - 1;
  } else if (layout !== 'horizontal' && code === KeynavCode.ArrowUp && next === 0 && loop) {
    next = itemCount;
  } else if (layout !== 'horizontal' && code === KeynavCode.ArrowDown && next < itemCount) {
    next = next + 1;
  } else if (layout !== 'horizontal' && code === KeynavCode.ArrowDown && next === itemCount && loop) {
    next = 0;
  } else if (layout !== 'vertical' && code === start && next !== 0) {
    next = next - 1;
  } else if (layout !== 'vertical' && code === end && next < itemCount) {
    next = next + 1;
  } else if (code === KeynavCode.End) {
    next = itemCount;
  } else if (code === KeynavCode.Home) {
    next = 0;
  } else if (code === KeynavCode.PageUp) {
    next = next - 4 > 0 ? next - 4 : 0;
  } else if (code === KeynavCode.PageDown) {
    next = next + 4 < itemCount ? next + 4 : itemCount;
  }

  return { next: next, previous };
}
