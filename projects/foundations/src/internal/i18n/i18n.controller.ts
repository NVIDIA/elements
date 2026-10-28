// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import type { I18nDefaults, I18nStrings } from './i18n.service.js';
import { I18nService } from './i18n.service.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type I18nDecoratorTarget<T> = Function & {
  addInitializer?: (initializer: (instance: T) => void) => void;
};

export function i18n<T extends I18n>(defaults?: I18nDefaults): ClassDecorator {
  return (target: I18nDecoratorTarget<T>) =>
    target.addInitializer!((instance: T) => new I18nController(instance, defaults));
}

export type I18n = ReactiveElement & { i18n: Partial<I18nStrings> & { __set?: boolean } };

export class I18nController<T extends I18n> implements ReactiveController {
  get i18n(): Partial<I18nStrings & { __set: boolean }> {
    return { ...this.defaults, ...I18nService.i18n, ...this.host.i18n, __set: false };
  }

  #overrides: Partial<I18nStrings> = {};

  constructor(
    private host: T,
    private readonly defaults: I18nDefaults = {}
  ) {
    I18nService.registerDefaults(defaults);
    this.host.addController(this);
  }

  hostConnected() {
    globalThis.document.addEventListener('NVE_ELEMENTS_I18N_UPDATE', this.#update);
  }

  hostDisconnected() {
    globalThis.document.removeEventListener('NVE_ELEMENTS_I18N_UPDATE', this.#update);
  }

  hostUpdate() {
    if (this.host.i18n.__set === undefined) {
      // if the host lacks a set, an override exists; merging before render keeps it in the same update cycle
      this.#overrides = this.host.i18n;
      this.#update();
    }
  }

  #update = () => {
    this.host.i18n = { ...this.defaults, ...I18nService.i18n, ...this.#overrides, __set: true };
  };
}
