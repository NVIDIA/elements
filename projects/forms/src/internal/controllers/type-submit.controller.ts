// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { stopEvent } from '../utils.js';
import type { ButtonType } from '../types/button.js';
import type { ReactiveController, ReactiveElement } from './types.js';

type SubmitHost = ReactiveElement & {
  disabled: boolean;
  form: HTMLFormElement | null | string;
  name?: string;
  readOnly: boolean;
  type?: ButtonType;
  value?: string;
};

function isActivationKey(event: KeyboardEvent) {
  return event.key === ' ' || event.key === 'Enter' || event.code === 'Space' || event.code === 'Enter';
}

export class TypeSubmitController<T extends SubmitHost> implements ReactiveController {
  #defaultType: ButtonType | undefined;
  #submitter: HTMLButtonElement | undefined;
  #submitterForm: HTMLFormElement | undefined;
  #spacePressed = false;

  constructor(private host: T) {
    this.host.addController(this);
  }

  get defaultType() {
    return this.#defaultType;
  }

  hostUpdated() {
    this.#setButtonType();
    this.#removeSubmitBehavior();
    if (!this.host.readOnly && !this.host.disabled) {
      this.host.addEventListener('click', this.#onSubmitClick);
      this.host.addEventListener('keydown', this.#onSubmitKeydown);
      this.host.addEventListener('keypress', this.#onSubmitKeypress);
      this.host.addEventListener('keyup', this.#onSubmitKeyup);
      this.host.addEventListener('blur', this.#clearSpacePress);
    } else {
      this.#clearSpacePress();
    }
  }

  hostDisconnected() {
    this.#removeSubmitBehavior();
    this.#removeSubmitter();
    this.#clearSpacePress();
  }

  #setButtonType() {
    if (!this.host.type && !this.host.hasAttribute('type') && this.host.form instanceof HTMLFormElement) {
      this.#defaultType = 'submit';
    }
  }

  #removeSubmitBehavior() {
    this.host.removeEventListener('click', this.#onSubmitClick);
    this.host.removeEventListener('keydown', this.#onSubmitKeydown);
    this.host.removeEventListener('keypress', this.#onSubmitKeypress);
    this.host.removeEventListener('keyup', this.#onSubmitKeyup);
    this.host.removeEventListener('blur', this.#clearSpacePress);
  }

  #clearSpacePress = () => {
    this.#spacePressed = false;
  };

  #onSubmitKeydown = (event: KeyboardEvent) => {
    if (event.isTrusted && event.target === this.host && event.key === ' ') {
      this.#spacePressed = this.host.matches(':focus');
    }
  };

  #onSubmitKeypress = (event: KeyboardEvent) => {
    // Chromium activates Enter on keypress. Clicking on keydown can redirect keypress to a newly focused control.
    if (event.isTrusted && event.target === this.host && event.key === 'Enter' && !event.defaultPrevented) {
      this.host.click();
    }
  };

  #onSubmitKeyup = (event: KeyboardEvent) => {
    if (!event.isTrusted) {
      // Keep the existing keyboard event behavior for programmatic callers.
      if (isActivationKey(event)) this.host.click();
      return;
    }
    if (event.key !== ' ' || event.target !== this.host) return;

    // Focus can move here while Space is still held on another control.
    const pressedHere = this.#spacePressed;
    this.#clearSpacePress();
    if (pressedHere && !event.defaultPrevented) this.host.click();
  };

  #onSubmitClick = (event: Event) => {
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
