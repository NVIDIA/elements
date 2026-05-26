// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import { TypeNativeButtonController } from './type-native-button.controller.js';
import type { ButtonType } from '../../mixins/button.types.js';
import type { ReactiveController } from './types.js';

class NativeButtonBehaviorControllerTestElement extends HTMLElement {
  disabled = false;
  name?: string;
  readOnly = false;
  value?: string;
  #type?: ButtonType;
  #controllers = new Set<ReactiveController>();

  _nativeButtonBehaviorController = new TypeNativeButtonController(this);

  get form() {
    return this.closest('form');
  }

  get type() {
    return this.#type ?? this._nativeButtonBehaviorController.defaultType;
  }

  set type(value: ButtonType | undefined) {
    this.#type = value;
  }

  addController(controller: ReactiveController) {
    this.#controllers.add(controller);
  }

  connectedCallback() {
    this.#controllers.forEach(controller => controller.hostConnected?.());
  }

  disconnectedCallback() {
    this.#controllers.forEach(controller => controller.hostDisconnected?.());
  }

  sync() {
    this.#controllers.forEach(controller => controller.hostUpdated?.());
  }
}

if (!customElements.get('native-button-behavior-controller-test-element')) {
  customElements.define('native-button-behavior-controller-test-element', NativeButtonBehaviorControllerTestElement);
}

describe('NativeButtonBehaviorController', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should default to submit when associated with a form and no type is set', async () => {
    fixture = await createFixture(
      html`<form><native-button-behavior-controller-test-element></native-button-behavior-controller-test-element></form>`
    );
    const element = fixture.querySelector<NativeButtonBehaviorControllerTestElement>(
      'native-button-behavior-controller-test-element'
    )!;

    element.sync();

    expect(element.type).toBe('submit');
  });

  it('should trigger clicks from enter and space keyup events', async () => {
    fixture = await createFixture(
      html`<native-button-behavior-controller-test-element></native-button-behavior-controller-test-element>`
    );
    const element = fixture.querySelector<NativeButtonBehaviorControllerTestElement>(
      'native-button-behavior-controller-test-element'
    )!;
    const click = vi.spyOn(element, 'click').mockImplementation(() => undefined);

    element.sync();
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }));

    expect(click).toHaveBeenCalledTimes(2);
  });

  it('should submit with hidden native submitter data', async () => {
    fixture = await createFixture(
      html`<form><native-button-behavior-controller-test-element></native-button-behavior-controller-test-element></form>`
    );
    const form = fixture.querySelector<HTMLFormElement>('form')!;
    const element = fixture.querySelector<NativeButtonBehaviorControllerTestElement>(
      'native-button-behavior-controller-test-element'
    )!;
    const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => undefined);

    element.type = 'submit';
    element.name = 'action';
    element.value = 'save';
    element.sync();
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    const submitter = requestSubmit.mock.calls[0][0] as HTMLButtonElement;
    expect(submitter.name).toBe('action');
    expect(submitter.value).toBe('save');
    expect(form.contains(submitter)).toBe(true);

    element.remove();
    expect(form.contains(submitter)).toBe(false);
  });

  it('should reset the associated form when type is reset', async () => {
    fixture = await createFixture(
      html`<form><native-button-behavior-controller-test-element></native-button-behavior-controller-test-element></form>`
    );
    const form = fixture.querySelector<HTMLFormElement>('form')!;
    const element = fixture.querySelector<NativeButtonBehaviorControllerTestElement>(
      'native-button-behavior-controller-test-element'
    )!;
    const reset = vi.spyOn(form, 'reset').mockImplementation(() => undefined);

    element.type = 'reset';
    element.sync();
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('should remove listeners when disabled, readonly, or disconnected', async () => {
    fixture = await createFixture(
      html`<native-button-behavior-controller-test-element></native-button-behavior-controller-test-element>`
    );
    const element = fixture.querySelector<NativeButtonBehaviorControllerTestElement>(
      'native-button-behavior-controller-test-element'
    )!;
    const click = vi.spyOn(element, 'click').mockImplementation(() => undefined);

    element.disabled = true;
    element.sync();
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    expect(click).not.toHaveBeenCalled();

    element.disabled = false;
    element.readOnly = true;
    element.sync();
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    expect(click).not.toHaveBeenCalled();

    element.readOnly = false;
    element.sync();
    element.remove();
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    expect(click).not.toHaveBeenCalled();
  });
});
