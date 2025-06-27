import type { ReactiveElement, ReactiveController } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { getFlattenedDOMTree, sameRenderRoot } from '../utils/dom.js';

export interface NativePopoverTrigger extends ReactiveElement {
  disabled: boolean;
  popoverTargetAction: 'show' | 'hide' | 'toggle';
  popoverTargetElement: HTMLElement;
  popovertarget: string;
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
    this.host.addEventListener('click', this.#click);
  }

  hostDisconnected() {
    this.host.removeEventListener('click', this.#click);
  }

  #click = () => {
    const id = this.host.popovertarget?.length ? this.host.popovertarget : this.host.popoverTargetElement?.id;
    if (id && !this.host.disabled) {
      const popover = getFlattenedDOMTree(this.host.getRootNode()).find(
        e => e.id === id && sameRenderRoot(this.host, e)
      );

      if (this.host.popoverTargetAction === 'hide') {
        popover?.hidePopover();
      } else if (this.host.popoverTargetAction === 'show') {
        popover?.showPopover();
      } else {
        popover?.togglePopover();
      }
    }
  };
}
