// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveElement, ReactiveController } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { getFlattenedDOMTree } from '../utils/dom.js';
import { getHostAnchor } from './type-native-popover.utils.js';

export interface NativePopoverTrigger extends ReactiveElement {
  disabled: boolean;
  popoverTargetAction: 'show' | 'hide' | 'toggle';
  popoverTargetElement: HTMLElement | null;
  popovertarget: string;
  anchor?: HTMLElement;
}

export function typeNativePopoverTrigger<T extends NativePopoverTrigger>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer!((instance: T) => new TypeNativePopoverTriggerController(instance));
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
    let source = this.host as HTMLElement;
    let popoverTargetElement = this.host.popoverTargetElement;

    // we can only do this on interaction as its too costly to do this on every getter or update of the popovertarget attribute, this diverges from the native behavior of the popovertarget attribute
    if (!popoverTargetElement && this.host.popovertarget) {
      popoverTargetElement = getFlattenedDOMTree(this.host.getRootNode()).find(e => e.id === this.host.popovertarget)!;
      this.host.popoverTargetElement = popoverTargetElement ?? null;
    }

    // if popover has explicit anchor, use it as the source
    if ((popoverTargetElement as NativePopoverTrigger)?.anchor) {
      source = getHostAnchor(popoverTargetElement as NativePopoverTrigger);
    }

    if (popoverTargetElement && !this.host.disabled) {
      if (this.host.popoverTargetAction === 'hide') {
        popoverTargetElement.hidePopover();
      } else if (this.host.popoverTargetAction === 'show') {
        popoverTargetElement.showPopover({ source });
      } else {
        popoverTargetElement.togglePopover({ source });
      }
    }
  };
}
