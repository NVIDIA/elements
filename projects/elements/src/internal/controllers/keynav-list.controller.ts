import type { ReactiveController, ReactiveElement } from 'lit';
import { focusElement, initializeKeyListItems, setActiveKeyListItem } from '../utils/focus.js';
import { KeynavCode, validKeyNavigationCode } from '../utils/dom.js';

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
  get #config(): KeynavListConfig & { items: HTMLElement[] } {
    return {
      layout: 'horizontal',
      manageFocus: true,
      manageTabindex: true,
      loop: false,
      dir: this.host.getAttribute('rtl'),
      ...this.host.keynavListConfig,
      items: Array.from(this.host.keynavListConfig.items).filter((i: any) => !i.disabled)
    };
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  /** @private attr nve-keynav-disabled is an internal API for advanced use cases only */
  get #keynavDisabled() {
    return this.host.hasAttribute('nve-keynav-disabled');
  }

  async hostConnected() {
    await this.host.updateComplete;
    this.#initializeTabIndex();
    this.host.addEventListener('pointerup', (e: PointerEvent) => this.#clickItem(e));
    this.host.addEventListener('keydown', (e: KeyboardEvent) => this.#focusItem(e));
  }

  #initializeTabIndex() {
    const { manageFocus, manageTabindex, items } = this.#config;
    if (manageFocus && manageTabindex && !this.#keynavDisabled) {
      initializeKeyListItems(items);
    }
  }

  #clickItem(e: Event) {
    const item = this.#getActiveItem(e, this.#config.items);
    if (item) {
      this.#setActiveItem(e, item);
    }
  }

  #focusItem(e: KeyboardEvent) {
    if (validKeyNavigationCode(e) && !this.#keynavDisabled) {
      const { loop, layout, dir, items } = this.#config;
      const activeItem = this.#getActiveItem(e, items);
      if (activeItem) {
        const { next, previous } = getNextKeyListItem(activeItem, Array.from(items), {
          loop,
          layout,
          dir,
          code: e.code as KeynavCode
        });

        if (next !== previous) {
          this.#setActiveItem(e, items[next], items[previous]);
        }
      }
    }
  }

  #getActiveItem(e: Event, items: HTMLElement[]) {
    const focusedElement = e.composedPath()[0] as HTMLElement;
    return items.find(i => i === focusedElement) ? focusedElement : null;
  }

  #setActiveItem(e: any, activeItem: HTMLElement, previousItem?: HTMLElement) {
    const { manageFocus, manageTabindex, items } = this.#config;
    if (manageFocus) {
      if (manageTabindex) {
        setActiveKeyListItem(items, activeItem);
      }

      focusElement(activeItem);
      e.preventDefault();
    }

    const detail = {
      activeItem,
      previousItem,
      code: e.code,
      metaKey: e.ctrlKey || e.metaKey,
      items
    };
    activeItem.dispatchEvent(new CustomEvent('nve-key-change', { bubbles: true, detail }));
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
