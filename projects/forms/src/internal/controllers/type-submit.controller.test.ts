// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { userEvent } from 'vitest/browser';
import { html } from 'lit';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture } from '@internals/testing';

import { TypeSubmitController } from './type-submit.controller.js';
import type { ButtonType } from '../types/button.js';
import type { ReactiveController } from './types.js';

class TypeSubmitControllerTestElement extends HTMLElement {
  disabled = false;
  name?: string;
  readOnly = false;
  value?: string;
  #type?: ButtonType;
  #controllers = new Set<ReactiveController>();

  _typeSubmitController = new TypeSubmitController(this);

  get form() {
    return this.closest('form');
  }

  get type() {
    return this.#type ?? this._typeSubmitController.defaultType;
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

if (!customElements.get('forms-type-submit-controller-test-element')) {
  customElements.define('forms-type-submit-controller-test-element', TypeSubmitControllerTestElement);
}

describe('type-submit.controller', () => {
  let fixture: HTMLElement;

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should default to submit when associated with a form and no type is set', async () => {
    fixture = await createFixture(
      html`<form><forms-type-submit-controller-test-element></forms-type-submit-controller-test-element></form>`
    );
    const element = fixture.querySelector<TypeSubmitControllerTestElement>(
      'forms-type-submit-controller-test-element'
    )!;

    element.sync();

    expect(element.type).toBe('submit');
  });

  it('should trigger clicks from enter and space keyup events', async () => {
    fixture = await createFixture(
      html`<forms-type-submit-controller-test-element></forms-type-submit-controller-test-element>`
    );
    const element = fixture.querySelector<TypeSubmitControllerTestElement>(
      'forms-type-submit-controller-test-element'
    )!;
    const click = vi.spyOn(element, 'click').mockImplementation(() => undefined);

    element.sync();
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', code: 'Unidentified' }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Space' }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', code: 'Unidentified' }));
    element.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', code: 'Unidentified' }));
    element.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyA' }));

    expect(click).toHaveBeenCalledTimes(4);
  });

  it.each(['Enter', 'Space'])('should match native %s submission timing and repeat behavior', async key => {
    fixture = await createFixture(html`
      <button type="button">Move focus</button>
      <form>
        <forms-type-submit-controller-test-element tabindex="0"></forms-type-submit-controller-test-element>
      </form>
    `);
    const trigger = fixture.querySelector('button')!;
    const form = fixture.querySelector('form')!;
    const element = fixture.querySelector<TypeSubmitControllerTestElement>(
      'forms-type-submit-controller-test-element'
    )!;
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    form.addEventListener('submit', submit);
    element.sync();

    trigger.focus();
    expect(document.activeElement).toBe(trigger);
    await userEvent.keyboard(`{${key}>}`);
    element.focus();
    await userEvent.keyboard(`{/${key}}`);
    expect(submit).not.toHaveBeenCalled();

    await userEvent.keyboard(`{${key}>2}`);
    expect(submit).toHaveBeenCalledTimes(key === 'Enter' ? 2 : 0);
    await userEvent.keyboard(`{/${key}}`);
    expect(submit).toHaveBeenCalledTimes(key === 'Enter' ? 2 : 1);

    submit.mockClear();
    trigger.focus();
    trigger.addEventListener(key === 'Enter' ? 'click' : 'keydown', () => element.focus(), { once: true });
    await userEvent.keyboard(`{${key}>2}`);
    expect(submit).toHaveBeenCalledTimes(key === 'Enter' ? 1 : 0);
    await userEvent.keyboard(`{/${key}}`);
    expect(submit).toHaveBeenCalledTimes(1);
  });

  it('should move focus on Enter without submitting the newly focused form', async () => {
    fixture = await createFixture(html`
      <forms-type-submit-controller-test-element tabindex="0"></forms-type-submit-controller-test-element>
      <form><input><button type="submit">Submit</button></form>
    `);
    const element = fixture.querySelector<TypeSubmitControllerTestElement>(
      'forms-type-submit-controller-test-element'
    )!;
    const form = fixture.querySelector('form')!;
    const input = fixture.querySelector('input')!;
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    form.addEventListener('submit', submit);
    element.addEventListener('click', () => input.focus());
    element.sync();

    element.focus();
    await userEvent.keyboard('{Enter}');

    expect(document.activeElement).toBe(input);
    expect(submit).not.toHaveBeenCalled();
  });

  it.each(['after', 'during'])('should cancel Space activation when focus moves %s keydown', async timing => {
    fixture = await createFixture(html`
      <forms-type-submit-controller-test-element tabindex="0"></forms-type-submit-controller-test-element>
      <button type="button">Move focus</button>
    `);
    const element = fixture.querySelector<TypeSubmitControllerTestElement>(
      'forms-type-submit-controller-test-element'
    )!;
    const other = fixture.querySelector('button')!;
    const shadow = fixture.attachShadow({ mode: 'open' });
    shadow.append(element, other);
    const click = vi.spyOn(element, 'click');
    element.sync();

    if (timing === 'during') {
      element.addEventListener('keydown', () => other.focus(), { capture: true, once: true });
    }

    element.focus();
    expect(shadow.activeElement).toBe(element);
    await userEvent.keyboard('{Space>}');
    if (timing === 'after') other.focus();
    expect(shadow.activeElement).toBe(other);
    element.focus();
    await userEvent.keyboard('{/Space}');
    expect(click).not.toHaveBeenCalled();

    await userEvent.keyboard('{Space}');
    expect(click).toHaveBeenCalledOnce();
  });

  it('should submit with hidden native submitter data', async () => {
    fixture = await createFixture(
      html`<form><forms-type-submit-controller-test-element></forms-type-submit-controller-test-element></form>`
    );
    const form = fixture.querySelector<HTMLFormElement>('form')!;
    const element = fixture.querySelector<TypeSubmitControllerTestElement>(
      'forms-type-submit-controller-test-element'
    )!;
    const requestSubmit = vi.spyOn(form, 'requestSubmit').mockImplementation(() => undefined);

    element.type = 'submit';
    element.name = 'action';
    element.value = 'save';
    element.sync();
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    const submitter = requestSubmit.mock.calls[0]?.[0];
    if (!(submitter instanceof HTMLButtonElement)) throw new Error('Expected a submit button.');
    expect(submitter.name).toBe('action');
    expect(submitter.value).toBe('save');
    expect(form.contains(submitter)).toBe(true);

    element.remove();
    expect(form.contains(submitter)).toBe(false);
  });

  it('should reset the associated form when type is reset', async () => {
    fixture = await createFixture(
      html`<form><forms-type-submit-controller-test-element></forms-type-submit-controller-test-element></form>`
    );
    const form = fixture.querySelector<HTMLFormElement>('form')!;
    const element = fixture.querySelector<TypeSubmitControllerTestElement>(
      'forms-type-submit-controller-test-element'
    )!;
    const reset = vi.spyOn(form, 'reset').mockImplementation(() => undefined);

    element.type = 'reset';
    element.sync();
    element.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('should remove listeners when disabled, readonly, or disconnected', async () => {
    fixture = await createFixture(
      html`<forms-type-submit-controller-test-element></forms-type-submit-controller-test-element>`
    );
    const element = fixture.querySelector<TypeSubmitControllerTestElement>(
      'forms-type-submit-controller-test-element'
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
