/* istanbul ignore file -- @preserve */
// ignoring as this is a temporary polyfill until CSS Anchor Positioning is stable in Firefox and Safari
import { ReactiveController, ReactiveElement } from 'lit';
import type { PopoverAlign, PopoverPosition } from '../types/index.js';
import { attachInternals } from '../utils/a11y.js';
import { getHostAnchor } from './type-native-popover.utils.js';

export interface NativeAnchorFallback extends ReactiveElement {
  anchor?: HTMLElement | string;
  position?: PopoverPosition;
  alignment?: PopoverAlign;
  popoverArrow?: HTMLElement;
  _internals?: ElementInternals;
}

export class TypeNativeAnchorFallbackController<T extends NativeAnchorFallback> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  #popoverUpdateDisconnect = () => null;

  async hostConnected() {
    attachInternals(this.host);
    const { popoverRenderUpdate } = await import('./type-native-anchor-fallback.utils.js');

    const config = {
      position: this.host.position,
      alignment: this.host.alignment,
      popover: this.host,
      anchor: getHostAnchor(this.host),
      arrow: this.host.popoverArrow
    };

    this.#popoverUpdateDisconnect = popoverRenderUpdate(config, async () => {
      await this.host.updateComplete;
      const { setAnchorPositionFallback } = await import('./type-native-anchor-fallback.utils.js');
      await setAnchorPositionFallback(this.host, {
        position: this.host.position,
        alignment: this.host.alignment,
        popover: this.host,
        anchor: getHostAnchor(this.host),
        arrow: this.host.popoverArrow
      });
    });
  }

  hostDisconnected() {
    this.#popoverUpdateDisconnect();
  }
}
