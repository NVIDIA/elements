import type { ReactiveElement, ReactiveController } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { getFlattenedDOMTree } from '../utils/dom.js';
import { getHostAnchor } from './type-native-popover.utils.js';

export interface NativePopoverTrigger extends ReactiveElement {
  disabled: boolean;
  popoverTargetAction: 'show' | 'hide' | 'toggle';
  popoverTargetElement: HTMLElement;
  popovertarget: string;
  anchor?: HTMLElement;
}

export function typeNativePopoverTrigger<T extends NativePopoverTrigger>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer((instance: T) => new TypeNativePopoverTriggerController(instance));
}

export class TypeNativePopoverTriggerController<T extends NativePopoverTrigger> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    this.#updatePopoverTargetElement();
    this.host.addEventListener('click', this.#click);
  }

  hostDisconnected() {
    this.host.removeEventListener('click', this.#click);
  }

  hostUpdated() {
    this.#updatePopoverTargetElement();
  }

  #updatePopoverTargetElement() {
    if (this.host.popovertarget) {
      const popover = getFlattenedDOMTree(this.host.getRootNode()).find(e => e.id === this.host.popovertarget);
      this.host.popoverTargetElement = popover;
    }
  }

  #click = () => {
    const { popoverTargetElement, popoverTargetAction, disabled } = this.host;
    let source = this.host as HTMLElement;

    // if popover has explicit anchor, use it as the source
    if ((popoverTargetElement as NativePopoverTrigger)?.anchor) {
      source = getHostAnchor(popoverTargetElement as NativePopoverTrigger);
    }

    if (popoverTargetElement && !disabled) {
      if (popoverTargetAction === 'hide') {
        popoverTargetElement.hidePopover();
      } else if (popoverTargetAction === 'show') {
        popoverTargetElement.showPopover({ source });
      } else {
        popoverTargetElement.togglePopover({ source });
      }
    }
  };
}
