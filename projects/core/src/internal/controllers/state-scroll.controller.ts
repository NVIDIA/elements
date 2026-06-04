// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { attachInternals, endOfScrollBox } from '@nvidia-elements/core/internal';

/**
 * Adds active scroll state detection
 */
export function stateScroll<T extends Scroll>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) =>
    target.addInitializer!((instance: T) => new StateScrollController(instance));
}

export interface StateScrollConfig {
  target?: HTMLElement;
  scrollOffset?: number;
}

export type Scroll = ReactiveElement & {
  _internals?: ElementInternals;
  stateScrollConfig?: StateScrollConfig;
};

export class StateScrollController<T extends Scroll> implements ReactiveController {
  #activeTarget?: HTMLElement;

  get #target(): HTMLElement {
    const target = this.host.stateScrollConfig?.target;
    return target ? target : this.host;
  }

  get #offset() {
    return this.host.stateScrollConfig?.scrollOffset ?? 0;
  }

  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostConnected() {
    await this.host.updateComplete;
    attachInternals(this.host);
    this.#syncTarget();
  }

  hostUpdated() {
    this.#syncTarget();
  }

  hostDisconnected() {
    this.#removeTargetListeners();
  }

  #syncTarget() {
    const target = this.#target;
    if (this.#activeTarget === target) return;

    this.#removeTargetListeners();
    this.#activeTarget = target;
    this.#activeTarget.addEventListener('scrollend', this.#onScrollEnd);
    this.#startScroll();
  }

  #onScrollEnd = () => {
    this.host._internals!.states.delete('scrolling');

    if (this.#activeTarget && endOfScrollBox(this.#activeTarget, this.#offset)) {
      this.host.dispatchEvent(new CustomEvent('scrollboxend', { bubbles: true, composed: true }));
    }

    this.#startScroll();
  };

  #onScroll = () => {
    this.host._internals!.states.add('scrolling');
  };

  #startScroll() {
    this.#activeTarget?.removeEventListener('scroll', this.#onScroll);
    this.#activeTarget?.addEventListener('scroll', this.#onScroll, { once: true });
  }

  #removeTargetListeners() {
    this.#activeTarget?.removeEventListener('scroll', this.#onScroll);
    this.#activeTarget?.removeEventListener('scrollend', this.#onScrollEnd);
    this.#activeTarget = undefined;
  }
}
