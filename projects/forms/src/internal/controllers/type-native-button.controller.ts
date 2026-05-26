// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { onKeys, stopEvent } from '../utils.js';
import type { ButtonType } from '../../mixins/button.types.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type NativeButtonBehaviorHost = ReactiveElement & {
  disabled: boolean;
  form: HTMLFormElement | null | string;
  name?: string;
  readOnly: boolean;
  type?: ButtonType;
  value?: string;
};

export class TypeNativeButtonController<T extends NativeButtonBehaviorHost> implements ReactiveController {
  #defaultType: ButtonType | undefined;
  #submitter: HTMLButtonElement | undefined;
  #submitterForm: HTMLFormElement | undefined;

  constructor(private host: T) {
    this.host.addController(this);
  }

  get defaultType() {
    return this.#defaultType;
  }

  hostUpdated() {
    this.#setButtonType();
    this.#removeNativeButtonBehavior();
    if (!this.host.readOnly && !this.host.disabled) {
      this.host.addEventListener('click', this.#onNativeButtonClick);
      this.host.addEventListener('keyup', this.#onNativeButtonKeyup);
    }
  }

  hostDisconnected() {
    this.#removeNativeButtonBehavior();
    this.#removeSubmitter();
  }

  #setButtonType() {
    if (!this.host.type && !this.host.hasAttribute('type') && this.host.form instanceof HTMLFormElement) {
      this.#defaultType = 'submit';
    }
  }

  #removeNativeButtonBehavior() {
    this.host.removeEventListener('click', this.#onNativeButtonClick);
    this.host.removeEventListener('keyup', this.#onNativeButtonKeyup);
  }

  #onNativeButtonKeyup = (event: KeyboardEvent) => {
    onKeys(['Enter', 'Space'], event, () => this.host.click());
  };

  #onNativeButtonClick = (event: Event) => {
    if (this.host.disabled) {
      stopEvent(event);
      return;
    }

    if (this.host.type === 'submit' && this.host.form instanceof HTMLFormElement) {
      this.#requestSubmit(this.host.form);
    } else if (this.host.type === 'reset' && this.host.form instanceof HTMLFormElement) {
      this.host.form.reset();
    }
  };

  #requestSubmit(form: HTMLFormElement) {
    this.#removeSubmitter();
    this.#createSubmitter();
    this.#submitterForm = form;
    form.addEventListener('submit', this.#onSubmit, { once: true });
    this.#submitter?.remove();
    form.appendChild(this.#submitter!);
    form.requestSubmit(this.#submitter);
  }

  #onSubmit = () => {
    const submitter = this.#submitter;
    this.#submitterForm = undefined;
    setTimeout(() => {
      submitter?.remove();
      if (this.#submitter === submitter) {
        this.#submitter = undefined;
      }
    }, 0);
  };

  #createSubmitter() {
    if (!this.#submitter) {
      this.#submitter = globalThis.document.createElement('button');
      this.#submitter.type = 'submit';
      this.#submitter.style.display = 'none';
    }

    this.#submitter.name = this.host.name ?? '';
    this.#submitter.value = this.host.value ?? '';
  }

  #removeSubmitter() {
    this.#submitterForm?.removeEventListener('submit', this.#onSubmit);
    this.#submitterForm = undefined;
    this.#submitter?.remove();
    this.#submitter = undefined;
  }
}
