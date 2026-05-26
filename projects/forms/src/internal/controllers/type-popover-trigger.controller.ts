// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PopoverTargetAction } from '../../mixins/button.types.js';
import { getFlattenedDOMTree, getHostAnchor } from '../utils.js';
import type { PopoverAnchorElement } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type PopoverTriggerHost = ReactiveElement & {
  disabled: boolean;
  popoverTargetAction?: PopoverTargetAction;
  popoverTargetElement: HTMLElement | null;
  popovertarget?: string;
};

export class TypePopoverTriggerController<T extends PopoverTriggerHost> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    this.host.addEventListener('click', this.#onClick);
  }

  hostDisconnected() {
    this.host.removeEventListener('click', this.#onClick);
  }

  #onClick = () => {
    let source = this.host as HTMLElement;
    let popoverTargetElement = this.host.popoverTargetElement;

    if (!popoverTargetElement && this.host.popovertarget) {
      popoverTargetElement =
        getFlattenedDOMTree(this.host.getRootNode()).find(element => element.id === this.host.popovertarget) ?? null;
      this.host.popoverTargetElement = popoverTargetElement;
    }

    if ((popoverTargetElement as PopoverAnchorElement)?.anchor) {
      source = getHostAnchor(popoverTargetElement as PopoverAnchorElement);
    }

    if (!popoverTargetElement || this.host.disabled) {
      return;
    }

    if (this.host.popoverTargetAction === 'hide') {
      popoverTargetElement.hidePopover();
    } else if (this.host.popoverTargetAction === 'show') {
      popoverTargetElement.showPopover({ source });
    } else {
      popoverTargetElement.togglePopover({ source });
    }
  };
}
