// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators/property.js';
import { customElement } from 'lit/decorators/custom-element.js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attachInternals, typeSubmit } from '@nvidia-elements/core/internal';
import { elementIsStable, createFixture, removeFixture, emulateClick, untilEvent } from '@internals/testing';

@typeSubmit<TypeSubmitControllerTestElement>()
@customElement('type-submit-controller-test-element')
class TypeSubmitControllerTestElement extends LitElement {
  @property({ type: String }) name: string;
  @property({ type: String }) value: string;
  @property({ type: Boolean }) disabled: boolean;
  @property({ type: String }) type: 'button' | 'submit' | 'reset';
  @property({ type: Boolean }) readonly: boolean;

  #form: HTMLFormElement;

  @property({ type: Object })
  get form(): HTMLFormElement | null {
    return this.#form ? this.#form : this._internals.form;
  }

  set form(form: string | HTMLFormElement) {
    if (typeof form === 'string') {
      this.#form = (this.getRootNode() as Document | ShadowRoot).getElementById(form) as HTMLFormElement;
    } else {
      this.#form = form;
    }
  }

  static formAssociated = true;

  _internals: ElementInternals;

  connectedCallback() {
    super.connectedCallback();
    attachInternals(this);
  }
}

describe('type-submit.controller', () => {
  let button: TypeSubmitControllerTestElement;
  let buttonInForm: TypeSubmitControllerTestElement;
  let submitButtonInForm: TypeSubmitControllerTestElement;
  let resetButtonInForm: TypeSubmitControllerTestElement;
  let fixture: HTMLElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <type-submit-controller-test-element></type-submit-controller-test-element>
      <form>
        <type-submit-controller-test-element type="button"></type-submit-controller-test-element>
        <type-submit-controller-test-element type="reset"></type-submit-controller-test-element>
        <type-submit-controller-test-element></type-submit-controller-test-element>
      </form>
    `);

    form = fixture.querySelector('form');
    button = fixture.querySelectorAll<TypeSubmitControllerTestElement>('type-submit-controller-test-element')[0];
    buttonInForm = fixture.querySelectorAll<TypeSubmitControllerTestElement>('type-submit-controller-test-element')[1];
    resetButtonInForm = fixture.querySelectorAll<TypeSubmitControllerTestElement>(
      'type-submit-controller-test-element'
    )[2];
    submitButtonInForm = fixture.querySelectorAll<TypeSubmitControllerTestElement>(
      'type-submit-controller-test-element'
    )[3];
    form.addEventListener('submit', e => e.preventDefault());
    buttonInForm.type = 'button';
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should set the button type to submit if not defined within a form element', async () => {
    await elementIsStable(button);
    expect(button.type).toBe(undefined);
    expect(buttonInForm.type).toBe('button');
    expect(submitButtonInForm.type).toBe('submit');
  });

  it('should trigger click event when using space key', async () => {
    await elementIsStable(button);
    expect(button.type).toBe(undefined);
    const event = untilEvent(button, 'click');
    button.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));
    expect((await event).target).toBe(button);
  });

  it('should add or remove button event listeners when readonly updates', async () => {
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.readonly).toBe(undefined);

    vi.spyOn(submitButtonInForm, 'removeEventListener');
    submitButtonInForm.readonly = true;
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.removeEventListener).toBeCalledTimes(2);

    vi.spyOn(submitButtonInForm, 'addEventListener');
    submitButtonInForm.readonly = false;
    await elementIsStable(submitButtonInForm);
    expect(submitButtonInForm.addEventListener).toBeCalledTimes(2);
  });

  it('should trigger submit event when host exists within a form element', async () => {
    submitButtonInForm.type = 'submit';
    await elementIsStable(submitButtonInForm);
    const event = untilEvent(form, 'submit');
    emulateClick(submitButtonInForm);
    expect((await event).type).toBe('submit');
  });

  it('should trigger submit event with browser default of bubbles: true', async () => {
    submitButtonInForm.type = 'submit';
    await elementIsStable(submitButtonInForm);
    const event = untilEvent(form, 'submit');
    emulateClick(submitButtonInForm);
    expect((await event).bubbles).toBe(true);
  });

  it('should trigger submit event with browser default of cancelable: true', async () => {
    submitButtonInForm.type = 'submit';
    await elementIsStable(submitButtonInForm);
    const event = untilEvent(form, 'submit');
    emulateClick(submitButtonInForm);
    expect((await event).cancelable).toBe(true);
  });

  it('should trigger submit event the event submitter assigned as the host', async () => {
    submitButtonInForm.type = 'submit';
    submitButtonInForm.name = 'test-name';
    await elementIsStable(submitButtonInForm);
    const event = untilEvent(form, 'submit');
    emulateClick(submitButtonInForm);
    expect((((await event) as SubmitEvent).submitter as HTMLButtonElement).name).toBe('test-name');
    // expect(event.submitter).toBe(submitButtonInForm); // https://github.com/WICG/webcomponents/issues/814
  });

  it('should NOT trigger submit event when host exists within a form element and disabled', async () => {
    submitButtonInForm.type = 'submit';
    let count = 0;
    form.addEventListener('submit', () => count++);

    const event = untilEvent(form, 'submit');
    emulateClick(submitButtonInForm);
    expect((await event).type).toBe('submit');
    expect(count).toBe(1);

    submitButtonInForm.disabled = true;
    emulateClick(submitButtonInForm);
    await elementIsStable(submitButtonInForm);
    expect(count).toBe(1);
  });

  it('should trigger reset event when host exists within a form element', async () => {
    resetButtonInForm.type = 'reset';
    await elementIsStable(resetButtonInForm);
    const event = untilEvent(form, 'reset');
    emulateClick(resetButtonInForm);
    expect((await event).type).toBe('reset');
  });

  it('should not ineract with form elements if type button', async () => {
    submitButtonInForm.type = 'button';
    await elementIsStable(submitButtonInForm);
    const o = { f: () => null };
    vi.spyOn(o, 'f');

    form.addEventListener('submit', o.f);
    emulateClick(submitButtonInForm);

    const event = new KeyboardEvent('keyup', { key: 'enter' });
    submitButtonInForm.focus();
    submitButtonInForm.dispatchEvent(event);
    expect(o.f).not.toHaveBeenCalled();
  });

  it('should handle dynamic changes for type', async () => {
    const o = { f: () => null };
    vi.spyOn(o, 'f');

    // change default (implicit "submit") to type="button"
    submitButtonInForm.type = 'button';
    await elementIsStable(submitButtonInForm);
    form.addEventListener('submit', o.f);
    emulateClick(submitButtonInForm);
    expect(o.f).not.toHaveBeenCalled();

    // change type="button" to type="submit"
    submitButtonInForm.type = 'submit';
    await elementIsStable(submitButtonInForm);
    form.removeEventListener('submit', o.f);
    emulateClick(submitButtonInForm);

    // change from type="submit" to type="button"
    submitButtonInForm.type = 'button';
    await elementIsStable(submitButtonInForm);
    form.addEventListener('submit', o.f);
    emulateClick(submitButtonInForm);
    expect(o.f).not.toHaveBeenCalled();
  });

  it('should not interact with form elements if disabled', async () => {
    submitButtonInForm.disabled = true;
    await elementIsStable(submitButtonInForm);

    const o = { f: () => null };
    vi.spyOn(o, 'f');

    form.addEventListener('submit', o.f);
    expect(o.f).not.toHaveBeenCalled();
  });

  it('should only submit once per click/keypress', async () => {
    await elementIsStable(submitButtonInForm);

    const o = { f: () => null };
    vi.spyOn(o, 'f');

    form.addEventListener('submit', o.f);
    expect(o.f).not.toHaveBeenCalled();

    emulateClick(submitButtonInForm);
    await elementIsStable(submitButtonInForm);
    expect(o.f).toHaveBeenCalledTimes(1);
  });

  it('should use form property if defined', async () => {
    button.form = form;
    button.type = 'submit';
    await elementIsStable(button);

    const o = { f: () => null };
    vi.spyOn(o, 'f');

    form.addEventListener('submit', o.f);
    expect(o.f).not.toHaveBeenCalled();

    emulateClick(button);
    await elementIsStable(button);
    expect(o.f).toHaveBeenCalledTimes(1);
  });

  it('should be able to access form property from submit event even if form is not in the same document', async () => {
    button.form = form;
    button.type = 'submit';
    button.name = 'test-name';
    button.value = 'test-value';
    await elementIsStable(button);
    const submit = untilEvent(form, 'submit');
    emulateClick(button);
    const event = await submit;
    expect(event.target).toBe(form);
  });

  it('should use a dynamic native HTMLButtonElement as the submitter due to https://github.com/WICG/webcomponents/issues/814', async () => {
    submitButtonInForm.name = 'test-name';
    submitButtonInForm.value = 'test-value';
    await elementIsStable(submitButtonInForm);
    const submit = untilEvent(form, 'submit');
    emulateClick(submitButtonInForm);

    const submitter = ((await submit) as SubmitEvent).submitter as HTMLButtonElement;
    expect(submitter.form).toBe(form);
    expect(submitter.name).toBe('test-name');
    expect(submitter.type).toBe('submit');
    expect(submitter.value).toBe('test-value');

    // submitter is a native HTMLButtonElement rather than the host custom element
    // this is due to https://github.com/WICG/webcomponents/issues/814
    // expect(submitter).toBe(submitButtonInForm);
    expect(submitter instanceof HTMLButtonElement).toBe(true);
  });
});
