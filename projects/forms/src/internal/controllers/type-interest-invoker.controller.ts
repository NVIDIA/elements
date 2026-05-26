// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getFlattenedDOMTree } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type InterestEvent = Event & { source: HTMLElement };

type InterestInvokerHost = ReactiveElement & {
  interestForElement: HTMLElement | null;
};

export class TypeInterestInvokerController<T extends InterestInvokerHost> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    this.host.addEventListener('mouseenter', this.#onInterest);
    this.host.addEventListener('mouseleave', this.#onLoseInterest);
    this.host.addEventListener('focus', this.#onInterest);
    this.host.addEventListener('blur', this.#onLoseInterest);
  }

  hostDisconnected() {
    this.host.removeEventListener('mouseenter', this.#onInterest);
    this.host.removeEventListener('mouseleave', this.#onLoseInterest);
    this.host.removeEventListener('focus', this.#onInterest);
    this.host.removeEventListener('blur', this.#onLoseInterest);
  }

  #onInterest = () => {
    this.#updateInterestForElement();
    if (this.host.interestForElement) {
      const event = new Event('interest', { cancelable: true }) as InterestEvent;
      event.source = this.host;
      this.host.interestForElement.dispatchEvent(event);
    }
  };

  #onLoseInterest = () => {
    this.#updateInterestForElement();
    if (this.host.interestForElement) {
      const event = new Event('loseinterest', { cancelable: true }) as InterestEvent;
      event.source = this.host;
      this.host.interestForElement.dispatchEvent(event);
    }
  };

  #updateInterestForElement() {
    const interestForIdRef = this.host.getAttribute('interestfor');
    if (interestForIdRef && !this.host.interestForElement) {
      this.host.interestForElement =
        getFlattenedDOMTree(this.host.getRootNode()).find(element => element.id === interestForIdRef) ?? null;
    }

    const popoverTargetIdRef = this.host.getAttribute('popovertarget');
    if (popoverTargetIdRef && !interestForIdRef) {
      const target = getFlattenedDOMTree(this.host.getRootNode()).find(element => element.id === popoverTargetIdRef);
      if (target && target.popover === 'hint') {
        this.host.interestForElement = target;
      }
    }
  }
}
