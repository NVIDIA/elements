// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { getFlattenedDOMTree } from '../utils.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type InterestEvent = Event & { source: HTMLElement };

type InterestInvokerHost = ReactiveElement & {
  interestForElement: HTMLElement | null;
  popoverTargetElement: HTMLElement | null;
};

export class TypeInterestInvokerController<T extends InterestInvokerHost> implements ReactiveController {
  #inferredInterestForElement: HTMLElement | null = null;

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

  #onInterest = (event: Event) => {
    if (event.type === 'focus' && !this.host.matches(':focus-visible')) {
      return;
    }

    if (this.host.popoverTargetElement?.matches(':popover-open')) {
      return;
    }

    this.#dispatchInterestEvent('interest');
  };

  #onLoseInterest = () => this.#dispatchInterestEvent('loseinterest');

  #dispatchInterestEvent(type: 'interest' | 'loseinterest') {
    const target = this.#getInterestForElement();
    if (!target) {
      return;
    }

    const event = new Event(type, { cancelable: true }) as InterestEvent;
    event.source = this.host;
    target.dispatchEvent(event);
  }

  #getInterestForElement() {
    const explicitTarget = this.#getExplicitInterestForElement();
    if (explicitTarget !== undefined) {
      return explicitTarget;
    }

    const inferredTarget = this.#getHintPopoverTarget();
    const previousTarget = this.#inferredInterestForElement;
    this.#inferredInterestForElement = inferredTarget;
    if (inferredTarget && this.host.interestForElement !== inferredTarget) {
      this.host.interestForElement = inferredTarget;
    } else if (!inferredTarget && previousTarget && this.host.interestForElement === previousTarget) {
      this.host.interestForElement = null;
    }
    return inferredTarget;
  }

  #getExplicitInterestForElement(): HTMLElement | null | undefined {
    const interestForIdRef = this.host.getAttribute('interestfor');
    if (interestForIdRef) {
      this.#inferredInterestForElement = null;
      return this.#getElementById(interestForIdRef);
    }

    const interestForElement = this.host.interestForElement;
    if (!interestForElement || interestForElement === this.#inferredInterestForElement) {
      return undefined;
    }

    this.#inferredInterestForElement = null;
    return interestForElement;
  }

  #getHintPopoverTarget() {
    const popoverTarget = this.host.popoverTargetElement;
    if (popoverTarget instanceof HTMLElement && popoverTarget.popover === 'hint') {
      return popoverTarget;
    }

    const target = this.#getElementById(this.host.getAttribute('popovertarget'));
    return target instanceof HTMLElement && target.popover === 'hint' ? target : null;
  }

  #getElementById(id: string | null) {
    return id ? (getFlattenedDOMTree(this.host.getRootNode()).find(element => element.id === id) ?? null) : null;
  }
}
