import { ReactiveController, ReactiveElement } from 'lit';
import type { PopoverAlign, PopoverPosition } from '../types/index.js';
import { attachInternals } from '../utils/a11y.js';
import { supportsNativeCSSAnchorPosition } from '../utils/supports.js';
import { associateAnchor, getHostAnchor } from './type-native-popover.utils.js';
import { TypeNativeAnchorFallbackController } from './type-native-anchor-fallback.controller.js';
import { getCrossShadowRootAnchorWarning } from '../utils/audit.js';
import { LogService } from '../services/log.service.js';
import { sameRenderRoot } from '../utils/dom.js';

export type { Placement, PopoverAlign, PopoverPosition, PopoverType } from '../types/index.js';

export interface NativeAnchor extends ReactiveElement {
  anchor: HTMLElement | string;
  position?: PopoverPosition;
  alignment?: PopoverAlign;
  _internals?: ElementInternals;
}

let crossRootWarning = false;

/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_anchor_positioning
 * https://developer.chrome.com/blog/anchor-positioning-api
 */
export class TypeNativeAnchorController<T extends NativeAnchor> implements ReactiveController {
  private typeNativeAnchorFallbackController: TypeNativeAnchorFallbackController<T>;

  constructor(private host: T) {
    this.host.addController(this);
  }

  #prevousAnchor: string | HTMLElement;

  async hostConnected() {
    attachInternals(this.host);
    await this.host.updateComplete;
    this.host.addEventListener('beforetoggle', () => this.#render());
  }

  async hostUpdated() {
    await this.host.updateComplete;

    if (this.#prevousAnchor !== this.host.anchor && this.host.anchor) {
      await this.#render();
      this.#prevousAnchor = this.host.anchor;
    }
  }

  get #useNativePositioning() {
    return supportsNativeCSSAnchorPosition() && sameRenderRoot(this.host, getHostAnchor(this.host));
  }

  async #render() {
    if (this.#useNativePositioning) {
      this.host._internals.states.delete('anchor-positioning-fallback');
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
    } else {
      this.host._internals.states.add('anchor-positioning-fallback');

      if (!this.typeNativeAnchorFallbackController) {
        this.typeNativeAnchorFallbackController = new TypeNativeAnchorFallbackController(this.host);
        this.host.addController(this.typeNativeAnchorFallbackController);
      }

      if (!sameRenderRoot(this.host, getHostAnchor(this.host)) && !crossRootWarning) {
        LogService.warn(getCrossShadowRootAnchorWarning(this.host.localName));
        crossRootWarning = true;
      }
    }
  }
}
