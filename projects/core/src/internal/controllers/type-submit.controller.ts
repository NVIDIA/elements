// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import type { ReactiveController, ReactiveElement } from 'lit';
import type { LegacyDecoratorTarget } from '../types/index.js';
import { stopEvent } from '../utils/events.js';
import { onKeys } from '../utils/keynav.js';

/**
 * Adds Form submit support for interactive custom elements.
 * https://developer.mozilla.org/en-US/docs/Web/API/HTMLFormElement/submit_event
 */
export function typeSubmit<T extends Submit>(): ClassDecorator {
  return (target: LegacyDecoratorTarget) => target.addInitializer!((instance: T) => new TypeSubmitController(instance));
}

export type Submit = ReactiveElement &
  HTMLElement & {
    name: string;
    value: string;
    disabled: boolean;
    type: 'button' | 'submit' | 'reset';
    readonly: boolean;
    form?: HTMLFormElement | null;
    _internals: ElementInternals;
  };

export class TypeSubmitController<T extends Submit> implements ReactiveController {
  constructor(private host: T) {
    this.host.addController(this);
  }

  async hostUpdated() {
    await this.host.updateComplete;
    this.#setButtonType();
    this.#setupNativeButtonBehavior();
  }

  hostDisconnected() {
    this.#removeNativeButtonBehavior();
  }

  #setButtonType() {
    if (!this.host.type && !this.host.hasAttribute('type') && this.host.closest('form')) {
      this.host.type = 'submit';
    }
  }

  #setupNativeButtonBehavior() {
    this.#removeNativeButtonBehavior();
    if (!this.host.readonly && !this.host.disabled) {
      this.host.addEventListener('click', this.#triggerNativeButtonBehavior);
      this.host.addEventListener('keyup', this.#emulateKeyBoardEventBehavior);
    }
  }

  #removeNativeButtonBehavior() {
    this.host.removeEventListener('click', this.#triggerNativeButtonBehavior);
    this.host.removeEventListener('keyup', this.#emulateKeyBoardEventBehavior);
  }

  // when submitting forms with Enter key, default submit button receives click event from the form
  #emulateKeyBoardEventBehavior = (event: KeyboardEvent) => {
    onKeys(['Enter', 'Space'], event, () => this.host.click());
  };

  #triggerNativeButtonBehavior = (event: Event) => {
    if (this.host.disabled) {
      stopEvent(event);
      return;
    }

    if (this.host.type === 'submit' && this.host.form) {
      this.#requestSubmit();
    } else if (this.host.type === 'reset') {
      this.host.form?.reset();
    }
  };

  #requestSubmit() {
    this.#createSubmitter();
    this.host.form!.addEventListener(
      'submit',
      () => {
        setTimeout(() => this.#submitter.remove(), 0);
      },
      { once: true }
    );
    this.host.form!.appendChild(this.#submitter);
    this.host.form!.requestSubmit(this.#submitter);
  }

  #submitter: HTMLButtonElement;
  // https://github.com/WICG/webcomponents/issues/814
  #createSubmitter() {
    if (!this.#submitter) {
      this.#submitter = globalThis.document.createElement('button');
      this.#submitter.type = 'submit';
      this.#submitter.name = this.host.name ?? '';
      this.#submitter.value = this.host.value ?? '';
      this.#submitter.style.display = 'none';
    }
  }
}
