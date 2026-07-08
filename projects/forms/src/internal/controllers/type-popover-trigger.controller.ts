// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { PopoverTargetAction } from '../../mixins/button.types.js';
import { getFlattenedDOMTree, getHostAnchor } from '../utils.js';
import type { PopoverAnchorElement } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type InterestEvent = Event & { source: HTMLElement };

type PopoverTriggerHost = ReactiveElement & {
  disabled: boolean;
  interestForElement: HTMLElement | null;
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

  #resolvedPopoverTarget: HTMLElement | null | undefined;

  #resolvePopoverTarget() {
    const popoverTargetElement = this.host.popoverTargetElement;
    const controllerResolvedTarget = popoverTargetElement === this.#resolvedPopoverTarget;

    if (!this.host.popovertarget) {
      this.#resolvedPopoverTarget = undefined;
      if (controllerResolvedTarget) {
        this.host.popoverTargetElement = null;
        return null;
      }

      return popoverTargetElement;
    }

    if (popoverTargetElement && !controllerResolvedTarget) {
      return popoverTargetElement;
    }

    const resolvedPopoverTarget =
      getFlattenedDOMTree(this.host.getRootNode()).find(element => element.id === this.host.popovertarget) ?? null;
    if (resolvedPopoverTarget !== popoverTargetElement) {
      this.host.popoverTargetElement = resolvedPopoverTarget;
    }
    this.#resolvedPopoverTarget = resolvedPopoverTarget;

    return resolvedPopoverTarget;
  }

  #onClick = (event: MouseEvent) => {
    if (event.defaultPrevented || this.host.disabled) {
      return;
    }

    const popoverTargetElement = this.#resolvePopoverTarget();
    if (!popoverTargetElement) {
      return;
    }

    if (this.#invokePopover(popoverTargetElement)) {
      this.#handoverInterest();
    }
  };

  #getPopoverSource(popoverTargetElement: HTMLElement) {
    if ((popoverTargetElement as PopoverAnchorElement).anchor) {
      return getHostAnchor(popoverTargetElement as PopoverAnchorElement);
    }

    return this.host as HTMLElement;
  }

  #invokePopover(popoverTargetElement: HTMLElement) {
    if (this.host.popoverTargetAction === 'hide') {
      popoverTargetElement.hidePopover();
      return false;
    }

    const source = this.#getPopoverSource(popoverTargetElement);
    if (this.host.popoverTargetAction === 'show') {
      popoverTargetElement.showPopover({ source });
    } else {
      popoverTargetElement.togglePopover({ source });
    }

    return popoverTargetElement.matches(':popover-open');
  }

  #handoverInterest() {
    if (this.host.interestForElement) {
      const loseInterest = new Event('loseinterest', { cancelable: true }) as InterestEvent;
      loseInterest.source = this.host;
      this.host.interestForElement.dispatchEvent(loseInterest);
    }
  }
}
