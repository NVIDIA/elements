import { ReactiveController, ReactiveElement } from 'lit';
import type { PopoverAlign, PopoverPosition } from '../types/index.js';
import { attachInternals } from '../utils/a11y.js';
import { supportsNativeCSSAnchorPosition } from '../utils/supports.js';
import { associateAnchor, getHostAnchor } from './type-native-popover.utils.js';
import { TypeNativeAnchorFallbackController } from './type-native-anchor-fallback.controller.js';

export type { Placement, PopoverAlign, PopoverPosition, PopoverType } from '../types/index.js';

export interface NativeAnchor extends ReactiveElement {
  anchor: HTMLElement | string;
  position?: PopoverPosition;
  alignment?: PopoverAlign;
  _internals?: ElementInternals;
}

/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning
 * https://developer.chrome.com/blog/anchor-positioning-api
 */
export class TypeNativeAnchorController<T extends NativeAnchor> implements ReactiveController {
  private typeNativeAnchorFallbackController: TypeNativeAnchorFallbackController<T>;

  constructor(private host: T) {
    this.host.addController(this);

    if (!supportsNativeCSSAnchorPosition()) {
      this.typeNativeAnchorFallbackController = new TypeNativeAnchorFallbackController(this.host);
      this.host.addController(this.typeNativeAnchorFallbackController);
    }
  }

  async hostConnected() {
    attachInternals(this.host);
    await this.host.updateComplete;
    await this.#calculatePosition();

    if (this.host.popover) {
      this.host.addEventListener('open', () => this.#calculatePosition());
    }
  }

  async hostUpdated() {
    await this.host.updateComplete;
    await this.#calculatePosition();
  }

  async #calculatePosition() {
    if (supportsNativeCSSAnchorPosition()) {
      const anchor = getHostAnchor(this.host);

      if (anchor === globalThis.document.body) {
        this.host._internals.states.add('anchor-body');
      } else {
        this.host._internals.states.delete('anchor-body');
        associateAnchor(this.host, anchor);
      }

      await new Promise(r => requestAnimationFrame(r));
      await new Promise(r => setTimeout(() => r(null), 0));
      const { width, height } = getComputedStyle(this.host);
      this.host.style.setProperty('--_width', width);
      this.host.style.setProperty('--_height', height);
    }
  }
}
