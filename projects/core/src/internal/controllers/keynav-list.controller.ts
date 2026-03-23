import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
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
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer!((instance: T) => new KeyNavigationListController(instance));
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
      items: Array.from(this.host.keynavListConfig.items).filter(
        (i: HTMLElement & { disabled?: boolean }) => !i.disabled
      )
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

  #clickItem(e: PointerEvent) {
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
          this.#setActiveItem(e, items[next]!, items[previous]);
        }
      }
    }
  }

  #getActiveItem(e: Event, items: HTMLElement[]) {
    const focusedElement = e.composedPath()[0] as HTMLElement;
    return items.find(i => i === focusedElement) ? focusedElement : null;
  }

  #setActiveItem(e: KeyboardEvent | PointerEvent, activeItem: HTMLElement, previousItem?: HTMLElement) {
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
      code: e instanceof KeyboardEvent ? e.code : null,
      metaKey: e.ctrlKey || e.metaKey,
      items
    };
    activeItem.dispatchEvent(new CustomEvent('nve-key-change', { bubbles: true, composed: true, detail }));
  }
}

interface KeyListConfig {
  code: KeynavCode;
  loop?: boolean;
  layout?: 'horizontal' | 'vertical' | 'both';
  dir: string | null | undefined;
}

function resolveArrowDirection(config: KeyListConfig): 'backward' | 'forward' | null {
  const { code, layout, dir } = config;
  const start = dir === 'rtl' ? KeynavCode.ArrowRight : KeynavCode.ArrowLeft;
  const end = dir === 'rtl' ? KeynavCode.ArrowLeft : KeynavCode.ArrowRight;

  if (layout !== 'horizontal') {
    if (code === KeynavCode.ArrowUp) return 'backward';
    if (code === KeynavCode.ArrowDown) return 'forward';
  }

  if (layout !== 'vertical') {
    if (code === start) return 'backward';
    if (code === end) return 'forward';
  }

  return null;
}

function resolveSpecialKey(code: KeynavCode): 'home' | 'end' | 'pageup' | 'pagedown' | null {
  if (code === KeynavCode.End) return 'end';
  if (code === KeynavCode.Home) return 'home';
  if (code === KeynavCode.PageUp) return 'pageup';
  if (code === KeynavCode.PageDown) return 'pagedown';
  return null;
}

function navigateWithLoop(current: number, limit: number, step: number, loop: boolean | undefined) {
  const next = current + step;
  if (next >= 0 && next <= limit) return next;
  return loop ? (step < 0 ? limit : 0) : current;
}

export function getNextKeyListItem(item: HTMLElement, items: HTMLElement[], config: KeyListConfig) {
  let next = items.indexOf(item);
  const previous = next;
  const itemCount = items.length - 1;
  const direction = resolveArrowDirection(config);

  switch (direction ?? resolveSpecialKey(config.code)) {
    case 'backward':
      next = navigateWithLoop(next, itemCount, -1, config.loop);
      break;
    case 'forward':
      next = navigateWithLoop(next, itemCount, 1, config.loop);
      break;
    case 'end':
      next = itemCount;
      break;
    case 'home':
      next = 0;
      break;
    case 'pageup':
      next = Math.max(0, next - 4);
      break;
    case 'pagedown':
      next = Math.min(itemCount, next + 4);
      break;
    case null:
      break;
  }

  return { next, previous };
}
