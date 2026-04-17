// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import type { I18nStrings } from '../services/i18n.service.js';
import { I18nService } from '../services/i18n.service.js';

export function i18n<T extends I18n>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) => target.addInitializer!((instance: T) => new I18nController(instance));
}

export type I18n = ReactiveElement & { i18n: Partial<I18nStrings> & { __set?: boolean } };

export class I18nController<T extends I18n> implements ReactiveController {
  get i18n(): Partial<I18nStrings & { __set: boolean }> {
    return { ...I18nService.i18n, ...this.host.i18n, __set: false };
  }

  #overrides: Partial<I18nStrings> = {};

  constructor(private host: T) {
    this.host.addController(this);
  }

  hostConnected() {
    globalThis.document.addEventListener('NVE_ELEMENTS_I18N_UPDATE', this.#update);
  }

  hostDisconnected() {
    globalThis.document.removeEventListener('NVE_ELEMENTS_I18N_UPDATE', this.#update);
  }

  hostUpdated() {
    if (this.host.i18n.__set === undefined) {
      // if the host lacks a set, an override exists
      this.#overrides = this.host.i18n;
      this.#update();
    }
  }

  #update = () => {
    this.host.i18n = { ...I18nService.i18n, ...this.#overrides, __set: true };
  };
}
