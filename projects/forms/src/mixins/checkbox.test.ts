// SPDX-FileCopyrightText: Copyright (c) 2026 NVIDIA CORPORATION & AFFILIATES. All rights reserved.
// SPDX-License-Identifier: Apache-2.0

import { html } from 'lit';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFixture, removeFixture, untilEvent } from '@internals/testing';
import { CheckboxFormControlMixin } from './checkbox.js';

class CheckboxTestElement extends CheckboxFormControlMixin<typeof HTMLElement>(HTMLElement) {
  static readonly metadata = {
    version: '0.0.0',
    tag: 'ui-checkbox-test-element',
    valueSchema: {
      type: 'string' as const
    }
  };

  requestUpdate() {}
}

customElements.define('ui-checkbox-test-element', CheckboxTestElement);

describe('CheckboxFormControlMixin', () => {
  let fixture: HTMLElement;
  let element: CheckboxTestElement;
  let form: HTMLFormElement;

  beforeEach(async () => {
    fixture = await createFixture(html`
      <form>
        <ui-checkbox-test-element name="accepted"></ui-checkbox-test-element>
      </form>
    `);
    element = fixture.querySelector<CheckboxTestElement>('ui-checkbox-test-element')!;
    form = fixture.querySelector<HTMLFormElement>('form')!;
  });

  afterEach(() => {
    removeFixture(fixture);
  });

  it('should use checkbox type and native value default', () => {
    expect(element.type).toBe('checkbox');
    expect(element.value).toBe('on');

    element.type = 'radio';
    expect(element.type).toBe('checkbox');
  });

  it('should submit value only when checked', () => {
    expect(new FormData(form).get('accepted')).toBe(null);

    element.checked = true;
    expect(element.hasAttribute('checked')).toBe(true);
    expect(element._internals.states.has('checked')).toBe(true);
    expect(new FormData(form).get('accepted')).toBe('on');

    element.checked = false;
    expect(element.hasAttribute('checked')).toBe(false);
    expect(element._internals.states.has('checked')).toBe(false);
    expect(new FormData(form).get('accepted')).toBe(null);
  });

  it('should support custom submitted values', () => {
    element.value = 'yes';
    element.checked = true;

    expect(element.getAttribute('value')).toBe('yes');
    expect(new FormData(form).get('accepted')).toBe('yes');

    element.removeAttribute('value');
    expect(element.value).toBe('on');
  });

  it('should coerce checkbox values like native form data', () => {
    element.value = 1 as unknown as string;
    expect(element.value).toBe('1');

    element.value = false as unknown as string;
    expect(element.value).toBe('false');

    element.value = {} as never;
    expect(element.value).toBe('on');
  });

  it('should support indeterminate state', () => {
    element.indeterminate = true;
    expect(element.hasAttribute('indeterminate')).toBe(true);
    expect(element._internals.states.has('indeterminate')).toBe(true);

    element.indeterminate = false;
    expect(element.hasAttribute('indeterminate')).toBe(false);
    expect(element._internals.states.has('indeterminate')).toBe(false);
  });

  it('should validate required checked state', () => {
    element.required = true;
    expect(element.checkValidity()).toBe(false);
    expect(element.validity.valueMissing).toBe(true);
    expect(element._internals.states.has('invalid')).toBe(true);

    element.checked = true;
    expect(element.checkValidity()).toBe(true);
    expect(element._internals.states.has('valid')).toBe(true);
  });

  it('should support custom validity', () => {
    element.checked = true;
    element.setCustomValidity('invalid checkbox');

    expect(element.checkValidity()).toBe(false);
    expect(element.validity.customError).toBe(true);
    expect(element.validationMessage).toBe('invalid checkbox');

    element.setCustomValidity('');
    expect(element.checkValidity()).toBe(true);
  });

  it('should report validity through element internals', () => {
    expect(element.reportValidity()).toBe(true);
  });

  it('should support noValidate', () => {
    element.required = true;
    element.noValidate = true;

    expect(element.checkValidity()).toBe(true);
  });

  it('should restore checked state from form state', () => {
    element.formStateRestoreCallback('on');
    expect(element.checked).toBe(true);

    element.formStateRestoreCallback(null);
    expect(element.checked).toBe(false);
  });

  it('should reset checked state to the initial value', async () => {
    const resetFixture = await createFixture(html`
      <form>
        <ui-checkbox-test-element name="accepted" checked></ui-checkbox-test-element>
      </form>
    `);
    const resetElement = resetFixture.querySelector<CheckboxTestElement>('ui-checkbox-test-element')!;

    resetElement.checked = false;
    resetElement.formResetCallback();
    expect(resetElement.checked).toBe(true);

    removeFixture(resetFixture);
  });

  it('should reset checked state to the updated checked attribute default', () => {
    element.setAttribute('checked', '');
    element.checked = false;

    element.formResetCallback();
    expect(element.checked).toBe(true);

    element.removeAttribute('checked');
    element.checked = true;

    element.formResetCallback();
    expect(element.checked).toBe(false);
  });

  it('should reset unconnected checked state to false', () => {
    const checkbox = new CheckboxTestElement();
    checkbox.checked = true;

    checkbox.formResetCallback();

    expect(checkbox.checked).toBe(false);
  });

  it('should toggle and dispatch form events', async () => {
    const input = untilEvent<InputEvent>(element, 'input');
    const change = untilEvent(element, 'change');

    element.toggle();

    expect(element.checked).toBe(true);
    expect((await input).target).toBe(element);
    expect((await change).target).toBe(element);
  });

  it('should not toggle when disabled or readonly', () => {
    element.disabled = true;
    element.toggle();
    expect(element.checked).toBe(false);

    element.disabled = false;
    element.readOnly = true;
    element.toggle();
    expect(element.checked).toBe(false);
  });

  it('should request updates for checkbox state changes', () => {
    vi.spyOn(element, 'requestUpdate');

    element.checked = true;
    element.indeterminate = true;
    element.value = 'yes';

    expect(element.requestUpdate).toHaveBeenCalledWith('checked', false);
    expect(element.requestUpdate).toHaveBeenCalledWith('indeterminate', false);
    expect(element.requestUpdate).toHaveBeenCalledWith('value', 'on');
  });
});
